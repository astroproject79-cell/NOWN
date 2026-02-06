/**
 * 점성학 AI Judge - AI 기반 점성학 해석 평가
 *
 * HyDE + RAG + Gemini를 활용한 의미론적 평가
 */

import type {
  AstrologyEvaluationInput,
  AstrologyAIEvaluationResult,
  AstrologyImprovementPoint,
  AstrologyEvaluationDimensionId,
} from './types';
import {
  ASTROLOGY_EVALUATION_DIMENSIONS,
  scoreToGrade,
  getGradeFeedback,
} from './types';
import { generateJSON } from '../../ai/llm';

// ============================================
// 시스템 프롬프트
// ============================================

const ASTROLOGY_JUDGE_SYSTEM_PROMPT = `당신은 전문 점성학 해석 품질 평가자입니다.

점성학 차트 해석문의 품질을 8가지 차원에서 평가합니다:

1. astronomicalAccuracy (천문학적 정확성, 20%): 행성-사인-하우스 배치가 실제 차트와 일치하는가
2. interpretationConsistency (해석 일관성, 15%): 행성-사인-하우스-애스펙트 해석이 맥락적으로 일관되는가
3. symbolism (상징 활용, 10%): 원소, 성질, 신화 등 상징을 효과적으로 사용하는가
4. empathy (공감 지수, 15%): 도전적 배치를 공감적으로 설명하는가
5. hope (희망 지수, 10%): 긍정적 미래 전망을 제시하는가
6. practicality (실용성, 10%): 구체적이고 실천 가능한 조언을 제시하는가
7. tone (톤 적절성, 10%): 단정을 피하고 가능성으로 서술하는가
8. readability (가독성, 10%): 전문용어를 쉽게 설명하는가

평가 원칙:
- 차트 데이터와 해석의 일치 여부를 가장 중요하게 봅니다
- 도전적 배치(스퀘어, 충, 망, 추락)도 성장 관점에서 설명되어야 합니다
- 운명적 단정이 아닌 경향성/가능성으로 표현되어야 합니다
- 구체적인 실천 조언이 포함되어야 합니다

응답은 반드시 JSON 형식으로 제공하세요.`;

// ============================================
// AI 평가 응답 타입
// ============================================

interface AstrologyJudgeResponse {
  dimensionScores: {
    [K in AstrologyEvaluationDimensionId]: {
      score: number;
      feedback: string;
      evidence: string[];
    };
  };
  totalScore: number;
  totalGrade: 'A' | 'B' | 'C' | 'D' | 'F';
  strengths: string[];
  improvementPoints: {
    dimension: AstrologyEvaluationDimensionId;
    issue: string;
    suggestion: string;
    priority: number;
  }[];
  overallFeedback: string;
  confidence: 'high' | 'medium' | 'low';
}

// ============================================
// AI 평가
// ============================================

export interface AstrologyAIJudgeOptions {
  /** 디버그 모드 */
  debug?: boolean;
}

/**
 * AI 기반 점성학 해석 평가
 */
export async function aiEvaluateAstrology(
  input: AstrologyEvaluationInput,
  options: AstrologyAIJudgeOptions = {}
): Promise<AstrologyAIEvaluationResult> {
  const { debug = false } = options;

  if (debug) {
    console.log('[AstrologyAIJudge] 평가 시작');
  }

  // 1. 차트 요약 생성
  const chartSummary = buildChartSummary(input);

  // 2. 프롬프트 생성
  const userPrompt = buildAstrologyJudgePrompt(input, chartSummary);

  if (debug) {
    console.log('[AstrologyAIJudge] 프롬프트 생성 완료');
  }

  // 3. Gemini 호출
  const response = await generateJSON<AstrologyJudgeResponse>({
    purpose: 'judge',
    systemPrompt: ASTROLOGY_JUDGE_SYSTEM_PROMPT,
    userPrompt,
  });

  if (debug) {
    console.log(`[AstrologyAIJudge] 평가 완료: ${response.totalScore}점`);
  }

  // 4. 결과 변환
  return convertToAstrologyResult(response);
}

/**
 * 차트 요약 생성
 */
function buildChartSummary(input: AstrologyEvaluationInput): string {
  const { chart, interpretation } = input;

  const lines: string[] = [
    '=== 차트 데이터 요약 ===',
    `출생 정보: ${interpretation.birthInfo}`,
    '',
    '행성 배치:',
  ];

  // 행성 배치
  for (const planet of chart.planets.slice(0, 10)) {
    const retrograde = planet.isRetrograde ? ' (R)' : '';
    const house = planet.house ? `, ${planet.house}하우스` : '';
    lines.push(`- ${planet.id}: ${planet.sign}${house}${retrograde}`);
  }

  lines.push('');
  lines.push('주요 애스펙트:');

  // 주요 애스펙트
  const majorAspects = chart.aspects
    .filter((a) => a.strength !== 'wide')
    .slice(0, 8);

  for (const aspect of majorAspects) {
    lines.push(`- ${aspect.planet1} ${aspect.type} ${aspect.planet2}`);
  }

  lines.push('');
  lines.push(`야간/주간: ${chart.metadata.isNightChart ? '야간' : '주간'} 차트`);

  return lines.join('\n');
}

/**
 * 평가 프롬프트 생성
 */
function buildAstrologyJudgePrompt(
  input: AstrologyEvaluationInput,
  chartSummary: string
): string {
  const dimensionDescriptions = ASTROLOGY_EVALUATION_DIMENSIONS.map(
    (d) => `- ${d.id} (${d.name}, ${d.weight}%): ${d.description}`
  ).join('\n');

  return `다음 점성학 차트 해석을 평가해주세요.

${chartSummary}

=== 해석문 ===
${input.fullText.slice(0, 4000)}

=== 평가 차원 ===
${dimensionDescriptions}

각 차원별로 0-100점을 부여하고, 전체 점수와 등급(A/B/C/D/F)을 산출하세요.
강점, 개선 포인트, 종합 피드백을 포함해주세요.

특히 다음을 확인하세요:
1. 해석이 실제 차트 데이터와 일치하는가
2. 도전적 배치(스퀘어, 충 등)가 공감적으로 설명되는가
3. 희망적 메시지가 포함되어 있는가
4. 구체적인 실천 조언이 있는가
5. 운명적 단정이 아닌 가능성으로 표현되는가

JSON 형식으로 응답:
{
  "dimensionScores": {
    "astronomicalAccuracy": {"score": number, "feedback": "string", "evidence": ["string"]},
    "interpretationConsistency": {"score": number, "feedback": "string", "evidence": ["string"]},
    "symbolism": {"score": number, "feedback": "string", "evidence": ["string"]},
    "empathy": {"score": number, "feedback": "string", "evidence": ["string"]},
    "hope": {"score": number, "feedback": "string", "evidence": ["string"]},
    "practicality": {"score": number, "feedback": "string", "evidence": ["string"]},
    "tone": {"score": number, "feedback": "string", "evidence": ["string"]},
    "readability": {"score": number, "feedback": "string", "evidence": ["string"]}
  },
  "totalScore": number,
  "totalGrade": "A"|"B"|"C"|"D"|"F",
  "strengths": ["string"],
  "improvementPoints": [{"dimension": "string", "issue": "string", "suggestion": "string", "priority": number}],
  "overallFeedback": "string",
  "confidence": "high"|"medium"|"low"
}`;
}

/**
 * AI 응답을 평가 결과로 변환
 */
function convertToAstrologyResult(
  response: AstrologyJudgeResponse
): AstrologyAIEvaluationResult {
  // 차원별 결과 변환
  const dimensionResults = ASTROLOGY_EVALUATION_DIMENSIONS.map((dim) => {
    const scoreData = response.dimensionScores[dim.id];
    const score = scoreData?.score || 0;
    const weightedScore = (score * dim.weight) / 100;

    return {
      dimensionId: dim.id,
      dimensionName: dim.name,
      score,
      weightedScore,
      feedback: scoreData?.feedback || '',
      evidence: scoreData?.evidence || [],
      grade: scoreToGrade(score),
    };
  });

  // 강점 (상위 3개)
  const sortedByScore = [...dimensionResults].sort((a, b) => b.score - a.score);
  const strengths = sortedByScore.slice(0, 3).map((d) => ({
    dimensionId: d.dimensionId,
    name: d.dimensionName,
    score: d.score,
  }));

  // 약점 (하위 3개)
  const weaknesses = sortedByScore
    .slice(-3)
    .reverse()
    .map((d) => ({
      dimensionId: d.dimensionId,
      name: d.dimensionName,
      score: d.score,
      suggestion:
        response.improvementPoints.find((p) => p.dimension === d.dimensionId)
          ?.suggestion || '해당 영역 개선이 필요합니다.',
    }));

  // 개선 포인트 변환
  const improvementPoints: AstrologyImprovementPoint[] =
    response.improvementPoints.map((p) => ({
      dimension: p.dimension,
      issue: p.issue,
      suggestion: p.suggestion,
      priority: p.priority,
      expectedImpact: Math.round((100 - response.totalScore) * 0.1),
    }));

  return {
    id: `astro_eval_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    evaluatedAt: new Date().toISOString(),
    totalScore: response.totalScore,
    totalGrade: response.totalGrade,
    dimensionResults,
    strengths,
    weaknesses,
    overallFeedback: response.overallFeedback,
    improvementPoints,
    confidence: response.confidence,
  };
}

// ============================================
// 빠른 평가
// ============================================

/**
 * 빠른 AI 평가 (간소화)
 */
export async function quickAstrologyEvaluate(
  text: string
): Promise<{ score: number; grade: string; feedback: string }> {
  const prompt = `다음 점성학 차트 해석문의 품질을 평가하세요.
8개 차원(천문학적 정확성, 해석 일관성, 상징 활용, 공감, 희망, 실용성, 톤, 가독성)을 고려하여
0-100점과 A/B/C/D/F 등급을 부여하고 한 줄 피드백을 제공하세요.

해석문:
${text.slice(0, 2000)}

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
// 룰 기반 평가 (보조)
// ============================================

/**
 * 간단한 룰 기반 체크
 */
export function ruleBasedCheck(input: AstrologyEvaluationInput): {
  score: number;
  issues: string[];
} {
  const issues: string[] = [];
  let score = 100;

  const text = input.fullText;

  // 1. 공감 표현 체크
  const empathyPatterns = [
    '어려웠을',
    '쉽지 않았',
    '버텨온',
    '힘들었',
    '당신 탓이 아닙',
  ];
  const hasEmpathy = empathyPatterns.some((p) => text.includes(p));
  if (!hasEmpathy) {
    issues.push('공감 표현이 부족합니다');
    score -= 10;
  }

  // 2. 희망 표현 체크
  const hopePatterns = [
    '앞으로',
    '가능성',
    '잠재력',
    '성장',
    '좋아질',
    '결실',
  ];
  const hasHope = hopePatterns.some((p) => text.includes(p));
  if (!hasHope) {
    issues.push('희망적 메시지가 부족합니다');
    score -= 10;
  }

  // 3. 단정 표현 체크
  const assertivePatterns = ['반드시', '틀림없이', '무조건', '절대'];
  const hasAssertive = assertivePatterns.some((p) => text.includes(p));
  if (hasAssertive) {
    issues.push('단정적 표현이 있습니다');
    score -= 15;
  }

  // 4. 구체적 조언 체크
  const advicePatterns = ['하세요', '해보세요', '추천', '적합', '방향'];
  const hasAdvice = advicePatterns.some((p) => text.includes(p));
  if (!hasAdvice) {
    issues.push('구체적 조언이 부족합니다');
    score -= 10;
  }

  // 5. 면책 표현 체크
  const disclaimerPatterns = [
    '가능성',
    '경향',
    '운명이 아닌',
    '단정이 아닌',
  ];
  const hasDisclaimer = disclaimerPatterns.some((p) => text.includes(p));
  if (!hasDisclaimer) {
    issues.push('면책 표현이 부족합니다');
    score -= 5;
  }

  return { score: Math.max(0, score), issues };
}
