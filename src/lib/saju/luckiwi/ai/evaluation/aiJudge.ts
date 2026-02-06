/**
 * AI Judge - AI 기반 통변문 평가
 *
 * HyDE + RAG + Gemini를 활용한 의미론적 평가
 */

import type { EvaluationInput } from '../../interpretation/evaluation/types';
import type { AIEvaluationResult, AIImprovementPoint } from './types';
import {
  generateJSON,
  JUDGE_SYSTEM_PROMPT,
  buildJudgeUserPrompt,
  type JudgeResponse,
} from '../llm';
import {
  retrieveWithHyDE,
  retrieveCriteria,
  compressContext,
} from '../rag';

// ============================================
// AI 평가
// ============================================

export interface AIJudgeOptions {
  /** 벤치마크 검색 수 */
  benchmarkLimit?: number;
  /** 평가 기준 검색 수 */
  criteriaLimit?: number;
  /** 컨텍스트 최대 길이 */
  maxContextLength?: number;
}

/**
 * AI 기반 통변문 평가
 */
export async function aiEvaluate(
  input: EvaluationInput,
  options: AIJudgeOptions = {}
): Promise<AIEvaluationResult> {
  const {
    benchmarkLimit = 3,
    criteriaLimit = 2,
    maxContextLength = 3000,
  } = options;

  // 1. HyDE로 유사 벤치마크 검색
  const benchmarkResults = await retrieveWithHyDE(
    input.fullText.slice(0, 500), // 첫 500자로 검색
    'benchmark',
    { limit: benchmarkLimit }
  );

  // 2. 평가 기준 검색 (각 차원별)
  const dimensions = [
    'structure',
    'metaphor',
    'empathy',
    'hope',
    'practicality',
    'tone',
    'readability',
    'emotionalJourney',
  ];

  const criteriaPromises = dimensions.map((dim) =>
    retrieveCriteria(dim, { limit: criteriaLimit })
  );
  const criteriaResults = await Promise.all(criteriaPromises);
  const allCriteria = criteriaResults.flat();

  // 3. 컨텍스트 압축
  const benchmarkDocs = benchmarkResults.map((r) => ({
    id: r.document.id,
    quality: r.document.metadata.quality as 'excellent' | 'good',
    excerpt: r.document.content.slice(0, 800),
  }));

  const criteriaDocuments = allCriteria.map((r) => ({
    dimensionId: r.document.metadata.dimensionId as string,
    name: r.document.metadata.title as string || r.document.metadata.dimensionId as string,
    scoringGuideline: r.document.metadata.scoringGuideline as string || r.document.content.slice(0, 300),
  }));

  // 4. 프롬프트 생성
  const userPrompt = buildJudgeUserPrompt({
    benchmarkDocs,
    criteriaDocuments,
    evaluationText: input.fullText,
    sajuInfo: {
      dayPillar: input.lifeType?.primary,
    },
  });

  // 5. Gemini 호출
  const response = await generateJSON<JudgeResponse>({
    purpose: 'judge',
    systemPrompt: JUDGE_SYSTEM_PROMPT,
    userPrompt,
  });

  // 6. 결과 변환
  return convertToAIResult(response, benchmarkResults, allCriteria);
}

/**
 * Gemini 응답을 AI 평가 결과로 변환
 */
function convertToAIResult(
  response: JudgeResponse,
  benchmarkResults: any[],
  criteriaResults: any[]
): AIEvaluationResult {
  // 차원별 점수 변환
  const dimensionScores: AIEvaluationResult['dimensionScores'] = {} as any;

  for (const [dimId, data] of Object.entries(response.dimensionScores)) {
    dimensionScores[dimId as keyof typeof dimensionScores] = {
      score: data.score,
      feedback: data.feedback,
      evidence: data.evidence || [],
    };
  }

  // 개선 포인트 변환
  const improvementPoints: AIImprovementPoint[] = response.improvementPoints.map(
    (p) => ({
      dimension: p.dimension as any,
      originalText: p.originalText,
      issue: p.issue,
      suggestionType: p.suggestionType as any,
    })
  );

  return {
    id: `ai_eval_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    evaluatedAt: new Date().toISOString(),
    dimensionScores,
    totalScore: response.totalScore,
    totalGrade: response.totalGrade,
    strengths: response.strengths,
    improvementPoints,
    overallFeedback: response.overallFeedback,
    confidence: response.confidence,
    ragContext: {
      benchmarkIds: benchmarkResults.map((r) => r.document.id),
      criteriaIds: criteriaResults.map((r) => r.document.id),
    },
  };
}

// ============================================
// 빠른 평가 (간소화)
// ============================================

/**
 * 빠른 AI 평가 (벤치마크 검색 없이)
 */
export async function quickAIEvaluate(
  input: EvaluationInput
): Promise<{ score: number; grade: string; feedback: string }> {
  const prompt = `다음 사주 통변문의 품질을 평가하세요.
8개 차원(구조, 메타포, 공감, 희망, 실용성, 톤, 가독성, 감정여정)을 고려하여
0-100점과 A/B/C/D/F 등급을 부여하고 한 줄 피드백을 제공하세요.

통변문:
${input.fullText.slice(0, 2000)}

JSON 형식으로 응답: {"score": number, "grade": "A"|"B"|"C"|"D"|"F", "feedback": "string"}`;

  const result = await generateJSON<{
    score: number;
    grade: string;
    feedback: string;
  }>({
    purpose: 'judge',
    userPrompt: prompt,
  });

  return result;
}

// ============================================
// 차원별 평가
// ============================================

/**
 * 특정 차원만 평가
 */
export async function evaluateDimension(
  text: string,
  dimensionId: string
): Promise<{ score: number; feedback: string }> {
  // 해당 차원의 기준 검색
  const criteria = await retrieveCriteria(dimensionId, { limit: 2 });

  const criteriaText = criteria
    .map((c) => c.document.content.slice(0, 500))
    .join('\n');

  const prompt = `다음 평가 기준에 따라 텍스트의 "${dimensionId}" 차원을 평가하세요.

평가 기준:
${criteriaText}

평가 대상:
${text.slice(0, 1500)}

JSON 형식으로 응답: {"score": number, "feedback": "string"}`;

  return generateJSON<{ score: number; feedback: string }>({
    purpose: 'judge',
    userPrompt: prompt,
  });
}
