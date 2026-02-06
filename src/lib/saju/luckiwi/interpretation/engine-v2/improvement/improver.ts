/**
 * Engine V2 개선기
 *
 * 할루시네이션 방지를 위한 계층적 개선 시스템
 */

import type {
  DimensionId,
  Section,
  SajuInfo,
  ImprovementRequest,
  ImprovementResult,
  ImprovementConfig,
  AppliedImprovement,
  ChangeSummary,
  VerificationResult,
  FailedDimensionInfo,
  EvaluationResult,
  EvaluationTarget,
} from '../types';
import { DEFAULT_IMPROVEMENT_CONFIG, DIMENSIONS } from '../types';
import { generateJSON } from '../../../ai/llm';
import {
  IMPROVER_SYSTEM_PROMPT,
  buildImproverPrompt,
  type ImproverResponse,
} from './prompts';
import { evaluate } from '../evaluation';

// ============================================
// 메인 개선 함수
// ============================================

/**
 * 평가 결과 기반 개선
 */
export async function improve(
  request: ImprovementRequest,
  config: ImprovementConfig = {}
): Promise<ImprovementResult> {
  const cfg = { ...DEFAULT_IMPROVEMENT_CONFIG, ...config };

  if (cfg.debug) {
    console.log(
      '[Improver] 개선 시작:',
      request.failedDimensions.length,
      '개 차원'
    );
  }

  // 1. LLM 호출로 개선 수행
  const prompt = buildImproverPrompt({
    originalText: request.originalText,
    sajuInfo: request.sajuInfo,
    failedDimensions: request.failedDimensions,
    maxLevel: cfg.maxLevel || 'enhance',
  });

  const response = await generateJSON<ImproverResponse>({
    purpose: 'improver',
    systemPrompt: IMPROVER_SYSTEM_PROMPT,
    userPrompt: prompt,
  });

  // 2. 결과 변환
  const appliedImprovements = convertToAppliedImprovements(response);

  // 3. 변경 요약 계산
  const changeSummary = calculateChangeSummary(
    request.originalText,
    response.improvedText,
    appliedImprovements
  );

  // 4. 검증 (옵션)
  let verification: VerificationResult | undefined;
  if (cfg.enableVerification) {
    verification = await verifyImprovement(
      request.originalText,
      response.improvedText,
      request.sajuInfo
    );
  }

  // 5. 예상 점수 변화
  const expectedScoreChanges = estimateScoreChanges(
    request.failedDimensions,
    appliedImprovements
  );

  if (cfg.debug) {
    console.log('[Improver] 완료:', appliedImprovements.length, '개 개선 적용');
  }

  return {
    id: `improve_v2_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    improvedAt: new Date().toISOString(),
    success: true,
    improvedText: response.improvedText,
    improvedSections: extractSections(response.improvedText),
    appliedImprovements,
    changeSummary,
    verification,
    expectedScoreChanges,
  };
}

/**
 * 평가 → 개선 한번에 수행
 */
export async function evaluateAndImprove(
  target: EvaluationTarget,
  config: ImprovementConfig = {}
): Promise<{
  evaluation: EvaluationResult;
  improvement?: ImprovementResult;
  needsImprovement: boolean;
}> {
  // 1. 평가
  const evaluation = await evaluate(target, { debug: config.debug });

  // 2. 모두 Pass면 개선 불필요
  if (evaluation.overallPassed) {
    return {
      evaluation,
      needsImprovement: false,
    };
  }

  // 3. 실패 차원 정보 수집
  const failedDimensions: FailedDimensionInfo[] = evaluation.dimensionResults
    .filter((r) => !r.passed)
    .map((r) => ({
      dimensionId: r.dimensionId,
      currentScore: r.score,
      targetScore: r.threshold,
      issues: r.failedItems.map((f) => f.reason),
      suggestions: r.failedItems.map((f) => f.suggestion),
    }));

  // 4. 개선 수행
  const improvement = await improve(
    {
      originalText: target.fullText,
      sections: target.sections || [],
      sajuInfo: target.sajuInfo,
      failedDimensions,
    },
    config
  );

  return {
    evaluation,
    improvement,
    needsImprovement: true,
  };
}

/**
 * 반복 개선 (목표 달성까지)
 */
export async function improveUntilPass(
  target: EvaluationTarget,
  options: {
    maxIterations?: number;
    config?: ImprovementConfig;
  } = {}
): Promise<{
  finalText: string;
  iterations: number;
  passed: boolean;
  history: {
    iteration: number;
    passedCount: number;
    failedDimensions: DimensionId[];
  }[];
}> {
  const { maxIterations = 3, config = {} } = options;
  const cfg = { ...DEFAULT_IMPROVEMENT_CONFIG, ...config };

  let currentTarget = target;
  const history: {
    iteration: number;
    passedCount: number;
    failedDimensions: DimensionId[];
  }[] = [];

  for (let i = 0; i < maxIterations; i++) {
    if (cfg.debug) {
      console.log(`[ImproveLoop] 반복 ${i + 1}/${maxIterations}`);
    }

    const result = await evaluateAndImprove(currentTarget, cfg);

    history.push({
      iteration: i + 1,
      passedCount: result.evaluation.passedCount,
      failedDimensions: result.evaluation.failedDimensions,
    });

    // Pass 달성
    if (!result.needsImprovement) {
      return {
        finalText: currentTarget.fullText,
        iterations: i + 1,
        passed: true,
        history,
      };
    }

    // 다음 반복을 위해 개선된 텍스트로 교체
    if (result.improvement) {
      currentTarget = {
        ...currentTarget,
        fullText: result.improvement.improvedText,
        sections: result.improvement.improvedSections,
      };
    }
  }

  // 최대 반복 도달
  return {
    finalText: currentTarget.fullText,
    iterations: maxIterations,
    passed: false,
    history,
  };
}

// ============================================
// 헬퍼 함수
// ============================================

/**
 * LLM 응답을 적용된 개선으로 변환
 */
function convertToAppliedImprovements(
  response: ImproverResponse
): AppliedImprovement[] {
  return response.improvements.map((imp) => ({
    targetDimension: imp.targetDimension as DimensionId,
    level: 'enhance' as const,
    type: imp.type,
    location: {
      position: 'inline' as const,
    },
    originalText: imp.originalText,
    newText: imp.newText,
    reason: imp.reason,
  }));
}

/**
 * 변경 요약 계산
 */
function calculateChangeSummary(
  original: string,
  improved: string,
  improvements: AppliedImprovement[]
): ChangeSummary {
  const addedCount = improvements.filter((i) => i.type === 'add').length;
  const modifiedCount = improvements.filter((i) => i.type === 'modify').length;
  const rearrangedCount = improvements.filter(
    (i) => i.type === 'rearrange'
  ).length;

  const originalLength = original.length;
  const improvedLength = improved.length;
  const lengthChangeRate =
    ((improvedLength - originalLength) / originalLength) * 100;

  // 간단한 유사도 계산 (Jaccard)
  const originalWordsArr = original.split(/\s+/);
  const improvedWordsArr = improved.split(/\s+/);
  const originalWords = new Set(originalWordsArr);
  const improvedWords = new Set(improvedWordsArr);
  const intersection = originalWordsArr.filter((w) => improvedWords.has(w));
  const unionSize = originalWords.size + improvedWords.size - intersection.length;
  const similarity = intersection.length / unionSize;

  return {
    addedSentences: addedCount,
    modifiedSentences: modifiedCount,
    rearrangedSentences: rearrangedCount,
    deletedSentences: 0,
    lengthChangeRate: Math.round(lengthChangeRate * 10) / 10,
    originalSimilarity: Math.round(similarity * 100) / 100,
  };
}

/**
 * 개선 검증
 */
async function verifyImprovement(
  original: string,
  improved: string,
  sajuInfo: SajuInfo
): Promise<VerificationResult> {
  // 간단한 검증: 핵심 정보 유지 확인
  const issues: VerificationResult['issues'] = [];

  // 1. 일주 정보 유지 확인
  if (sajuInfo.dayPillar && !improved.includes(sajuInfo.dayPillar)) {
    // 일주 정보가 사라졌는지 확인 (한글 이름으로도 체크)
    const hasReference =
      improved.includes(sajuInfo.dayPillar) ||
      (sajuInfo.dayPillarName && improved.includes(sajuInfo.dayPillarName));

    if (!hasReference) {
      issues.push({
        type: 'inaccuracy',
        description: '일주 정보가 누락됨',
        problematicText: '',
        suggestion: `원본의 일주 정보(${sajuInfo.dayPillar})를 유지하세요`,
        severity: 'high',
      });
    }
  }

  // 2. 길이 급변 확인
  if (improved.length < original.length * 0.5) {
    issues.push({
      type: 'inconsistency',
      description: '내용이 과도하게 축소됨',
      problematicText: '',
      suggestion: '원본의 핵심 내용을 유지하세요',
      severity: 'medium',
    });
  }

  return {
    passed: issues.filter((i) => i.severity === 'high').length === 0,
    issues,
    correctionApplied: false,
  };
}

/**
 * 예상 점수 변화 추정
 */
function estimateScoreChanges(
  failedDimensions: FailedDimensionInfo[],
  improvements: AppliedImprovement[]
): Record<DimensionId, number> {
  const changes: Record<string, number> = {};

  for (const fd of failedDimensions) {
    const dimImprovements = improvements.filter(
      (i) => i.targetDimension === fd.dimensionId
    );

    // 개선당 5-10점 상승 추정
    const estimatedIncrease = dimImprovements.length * 7;
    const newScore = Math.min(100, fd.currentScore + estimatedIncrease);

    changes[fd.dimensionId] = newScore;
  }

  return changes as Record<DimensionId, number>;
}

/**
 * 텍스트에서 섹션 추출
 */
function extractSections(text: string): Section[] {
  // 간단한 구분자 기반 분리
  const parts = text.split(/\n{2,}|─+/);

  return parts
    .filter((p) => p.trim().length > 0)
    .map((content, idx) => ({
      id: `section_${idx + 1}`,
      title: `섹션 ${idx + 1}`,
      content: content.trim(),
    }));
}
