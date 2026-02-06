/**
 * AI Improver - AI 기반 통변문 개선
 *
 * 평가 결과를 바탕으로 맥락에 맞는 개선 문장 동적 생성
 */

import type { EvaluationInput } from '../../interpretation/evaluation/types';
import type {
  AIEvaluationResult,
  AIImprovementResult,
  AISectionImprovement,
  AIGlobalAddition,
} from './types';
import {
  generateJSON,
  IMPROVER_SYSTEM_PROMPT,
  buildImproverUserPrompt,
  type ImproverResponse,
} from '../llm';
import { retrievePatterns, retrieveDomain } from '../rag';
import { verifySelfRAG, quickVerify } from '../rag/selfRAG';

// ============================================
// AI 개선
// ============================================

export interface AIImproverOptions {
  /** 개선 패턴 검색 수 */
  patternLimit?: number;
  /** 도메인 지식 검색 수 */
  domainLimit?: number;
  /** Self-RAG 검증 활성화 */
  enableVerification?: boolean;
  /** 검증 엄격도 */
  verificationStrictness?: 'strict' | 'moderate' | 'lenient';
}

/**
 * AI 기반 통변문 개선
 */
export async function aiImprove(
  input: EvaluationInput,
  evaluation: AIEvaluationResult,
  options: AIImproverOptions = {}
): Promise<AIImprovementResult> {
  const {
    patternLimit = 5,
    domainLimit = 3,
    enableVerification = true,
    verificationStrictness = 'moderate',
  } = options;

  // 1. 개선이 필요한 차원 식별
  const weakDimensions = Object.entries(evaluation.dimensionScores)
    .filter(([_, data]) => data.score < 75)
    .map(([dim]) => dim);

  // 2. 개선 패턴 검색
  const patternPromises = evaluation.improvementPoints
    .slice(0, 3)
    .map((p) => retrievePatterns(p.issue, p.dimension, { limit: 2 }));

  const patternResults = await Promise.all(patternPromises);
  const allPatterns = patternResults.flat();

  // 3. 도메인 지식 검색
  const domainResults = await retrieveDomain(
    input.lifeType?.primary || '',
    undefined,
    { limit: domainLimit }
  );

  // 4. 프롬프트 생성
  const improvementPatterns = allPatterns.map((r) => ({
    id: r.document.id,
    targetDimension: r.document.metadata.dimensionId as string,
    patternType: r.document.metadata.patternType as string,
    before: r.document.metadata.beforeText as string,
    after: r.document.metadata.afterText as string,
    transformationGuide: r.document.metadata.transformationGuide as string,
  }));

  const domainDocs = domainResults.map((r) => ({
    id: r.document.id,
    entityName: r.document.metadata.entityName as string || '',
    content: r.document.content.slice(0, 300),
  }));

  const userPrompt = buildImproverUserPrompt({
    improvementPatterns,
    domainDocs,
    originalText: input.fullText,
    evaluationResult: {
      totalScore: evaluation.totalScore,
      dimensionScores: Object.fromEntries(
        Object.entries(evaluation.dimensionScores).map(([k, v]) => [
          k,
          { score: v.score, feedback: v.feedback },
        ])
      ),
      improvementPoints: evaluation.improvementPoints,
    },
    sajuInfo: {
      dayPillar: input.lifeType?.primary,
      centralMetaphor: input.metaphor?.centralImage,
    },
  });

  // 5. Gemini 호출
  const response = await generateJSON<ImproverResponse>({
    purpose: 'improver',
    systemPrompt: IMPROVER_SYSTEM_PROMPT,
    userPrompt,
  });

  // 6. 결과 변환
  let result = convertToAIImprovementResult(response);

  // 7. Self-RAG 검증 (선택)
  if (enableVerification) {
    const addedTexts = [
      ...result.sectionImprovements.flatMap((s) =>
        s.additions.map((a) => a.text)
      ),
      ...result.globalAdditions.map((g) => g.text),
    ].join('\n');

    if (addedTexts.length > 0) {
      const verification = await quickVerify(addedTexts, {
        dayPillar: input.lifeType?.primary,
      });

      result.verification = {
        isValid: verification.isValid,
        modifications: verification.issues,
      };
    }
  }

  return result;
}

/**
 * Gemini 응답을 개선 결과로 변환
 */
function convertToAIImprovementResult(
  response: ImproverResponse
): AIImprovementResult {
  const sectionImprovements: AISectionImprovement[] =
    response.sectionImprovements.map((s) => ({
      sectionId: s.sectionId,
      sectionTitle: s.sectionTitle,
      additions: s.additions.map((a) => ({
        position: a.position as 'start' | 'end',
        text: a.text,
        reason: a.reason,
        targetDimension: a.targetDimension as any,
        patternRef: a.patternRef,
      })),
      modifications: s.modifications.map((m) => ({
        original: m.original,
        improved: m.improved,
        reason: m.reason,
        targetDimension: m.targetDimension as any,
      })),
    }));

  const globalAdditions: AIGlobalAddition[] = response.globalAdditions.map(
    (g) => ({
      text: g.text,
      reason: g.reason,
      targetDimension: g.targetDimension as any,
      suggestedPosition: g.suggestedPosition,
    })
  );

  return {
    id: `ai_improve_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    improvedAt: new Date().toISOString(),
    sectionImprovements,
    globalAdditions,
    expectedScoreImprovement: response.expectedScoreImprovement as any,
    summary: response.summary,
  };
}

// ============================================
// 개선 적용
// ============================================

/**
 * 개선 사항을 입력에 적용
 */
export function applyAIImprovements(
  input: EvaluationInput,
  improvement: AIImprovementResult
): EvaluationInput {
  let newSections = [...input.sections];

  // 1. 섹션별 개선 적용
  for (const sectionImprove of improvement.sectionImprovements) {
    const sectionIndex = newSections.findIndex(
      (s) =>
        s.id === sectionImprove.sectionId ||
        s.title.includes(sectionImprove.sectionTitle)
    );

    if (sectionIndex === -1) continue;

    let content = newSections[sectionIndex].content;

    // 수정 적용
    for (const mod of sectionImprove.modifications) {
      content = content.replace(mod.original, mod.improved);
    }

    // 추가 적용
    for (const addition of sectionImprove.additions) {
      if (addition.position === 'start') {
        content = addition.text + '\n\n' + content;
      } else if (addition.position === 'end') {
        content = content + '\n\n' + addition.text;
      }
    }

    newSections[sectionIndex] = {
      ...newSections[sectionIndex],
      content,
    };
  }

  // 2. 전체 추가 적용
  for (const global of improvement.globalAdditions) {
    if (global.suggestedPosition === 'intro' && newSections.length > 0) {
      newSections[0] = {
        ...newSections[0],
        content: global.text + '\n\n' + newSections[0].content,
      };
    } else if (
      global.suggestedPosition === 'conclusion' &&
      newSections.length > 0
    ) {
      const lastIdx = newSections.length - 1;
      newSections[lastIdx] = {
        ...newSections[lastIdx],
        content: newSections[lastIdx].content + '\n\n' + global.text,
      };
    }
  }

  // 3. fullText 재구성
  const newFullText = newSections.map((s) => s.content).join('\n\n────────\n\n');

  return {
    ...input,
    sections: newSections,
    fullText: newFullText,
  };
}

// ============================================
// 빠른 개선
// ============================================

/**
 * 빠른 개선 (RAG 없이)
 */
export async function quickAIImprove(
  input: EvaluationInput,
  issue: string
): Promise<{ improved: string; reason: string }> {
  const prompt = `다음 통변문에서 "${issue}" 문제를 개선하세요.
원본의 의미를 유지하면서 자연스럽게 개선하세요.

원본:
${input.fullText.slice(0, 1500)}

JSON 형식으로 응답: {"improved": "개선된 텍스트", "reason": "개선 이유"}`;

  return generateJSON<{ improved: string; reason: string }>({
    purpose: 'improver',
    userPrompt: prompt,
  });
}
