/**
 * Engine V2 평가기
 *
 * 사용자 관점 8개 차원 Pass/Fail 평가
 */

import type {
  DimensionId,
  EvaluationTarget,
  EvaluationResult,
  DimensionResult,
  EvaluationConfig,
  PriorityImprovement,
} from '../types';
import {
  DIMENSIONS,
  ALL_DIMENSION_IDS,
  DEFAULT_PASS_THRESHOLD,
  DEFAULT_EVALUATION_CONFIG,
} from '../types';
import { generateJSON } from '../../../ai/llm';
import {
  EVALUATOR_SYSTEM_PROMPT,
  buildEvaluatorPrompt,
  type EvaluatorResponse,
} from './prompts';

// ============================================
// 메인 평가 함수
// ============================================

/**
 * 사주 해석문 평가
 *
 * @param target 평가 대상
 * @param config 평가 설정
 * @returns 평가 결과 (모든 차원 Pass 시 overallPassed = true)
 */
export async function evaluate(
  target: EvaluationTarget,
  config: EvaluationConfig = {}
): Promise<EvaluationResult> {
  const cfg = { ...DEFAULT_EVALUATION_CONFIG, ...config };
  const dimensions = cfg.dimensions || ALL_DIMENSION_IDS;

  if (cfg.debug) {
    console.log('[Evaluator] 평가 시작:', dimensions.length, '개 차원');
  }

  // 1. LLM 호출로 평가 수행
  const prompt = buildEvaluatorPrompt({
    text: target.fullText,
    sajuInfo: {
      dayPillar: target.sajuInfo.dayPillar,
      dayPillarName: target.sajuInfo.dayPillarName,
      structure: target.sajuInfo.structure,
      age: target.sajuInfo.age,
      gender: target.sajuInfo.gender,
    },
    dimensions,
  });

  const response = await generateJSON<EvaluatorResponse>({
    purpose: 'judge',
    systemPrompt: EVALUATOR_SYSTEM_PROMPT,
    userPrompt: prompt,
  });

  // 2. 결과 변환
  const dimensionResults = convertToDimensionResults(
    response,
    dimensions,
    cfg.thresholds
  );

  // 3. 통계 계산
  const passedDimensions = dimensionResults
    .filter((r) => r.passed)
    .map((r) => r.dimensionId);

  const failedDimensions = dimensionResults
    .filter((r) => !r.passed)
    .map((r) => r.dimensionId);

  const averageScore =
    dimensionResults.reduce((sum, r) => sum + r.score, 0) /
    dimensionResults.length;

  const weakestDimension = dimensionResults.reduce((min, r) =>
    r.score < min.score ? r : min
  );

  // 4. 우선 개선 사항 생성
  const priorityImprovements = generatePriorityImprovements(
    dimensionResults.filter((r) => !r.passed)
  );

  // 5. 종합 피드백 생성
  const overallFeedback = generateOverallFeedback(
    passedDimensions.length,
    failedDimensions.length,
    weakestDimension,
    response.overallFeedback
  );

  if (cfg.debug) {
    console.log(
      '[Evaluator] 완료:',
      passedDimensions.length,
      '/',
      dimensions.length,
      'Pass'
    );
  }

  return {
    id: `eval_v2_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    evaluatedAt: new Date().toISOString(),
    overallPassed: failedDimensions.length === 0,
    passedCount: passedDimensions.length,
    totalCount: dimensions.length,
    averageScore: Math.round(averageScore * 10) / 10,
    dimensionResults,
    passedDimensions,
    failedDimensions,
    weakestDimension: {
      id: weakestDimension.dimensionId,
      score: weakestDimension.score,
      feedback: weakestDimension.feedback,
    },
    overallFeedback,
    priorityImprovements,
  };
}

// ============================================
// 헬퍼 함수
// ============================================

/**
 * LLM 응답을 차원별 결과로 변환
 */
function convertToDimensionResults(
  response: EvaluatorResponse,
  dimensions: DimensionId[],
  customThresholds?: Partial<Record<DimensionId, number>>
): DimensionResult[] {
  return dimensions.map((dimId) => {
    const dimResponse = response.dimensions[dimId];
    const dimension = DIMENSIONS[dimId];
    const threshold =
      customThresholds?.[dimId] ?? dimension?.passThreshold ?? DEFAULT_PASS_THRESHOLD;

    if (!dimResponse) {
      // LLM이 해당 차원을 누락한 경우
      return {
        dimensionId: dimId,
        score: 0,
        passed: false,
        threshold,
        feedback: '평가되지 않음',
        evidence: [],
        failedItems: [
          {
            criterionId: 'missing',
            criterionName: '평가 누락',
            reason: 'AI가 이 차원을 평가하지 못함',
            suggestion: '다시 평가 필요',
          },
        ],
      };
    }

    return {
      dimensionId: dimId,
      score: dimResponse.score,
      passed: dimResponse.score >= threshold,
      threshold,
      feedback: dimResponse.feedback,
      evidence: dimResponse.evidence || [],
      failedItems: dimResponse.failedItems || [],
    };
  });
}

/**
 * 우선 개선 사항 생성
 */
function generatePriorityImprovements(
  failedResults: DimensionResult[]
): PriorityImprovement[] {
  // 점수 낮은 순으로 정렬
  const sorted = [...failedResults].sort((a, b) => a.score - b.score);

  return sorted.map((result) => {
    const dimension = DIMENSIONS[result.dimensionId];

    return {
      dimensionId: result.dimensionId,
      dimensionName: dimension?.name || result.dimensionId,
      currentScore: result.score,
      targetScore: result.threshold,
      actions: result.failedItems.map((item) => ({
        type: 'modify' as const,
        description: item.suggestion,
        example: undefined,
      })),
    };
  });
}

/**
 * 종합 피드백 생성
 */
function generateOverallFeedback(
  passedCount: number,
  failedCount: number,
  weakest: DimensionResult,
  llmFeedback: string
): string {
  const total = passedCount + failedCount;

  let status: string;
  if (failedCount === 0) {
    status = `✅ 모든 차원 Pass! (${passedCount}/${total})`;
  } else if (failedCount <= 2) {
    status = `⚠️ ${failedCount}개 차원 개선 필요 (${passedCount}/${total} Pass)`;
  } else {
    status = `❌ 상당한 개선 필요 (${passedCount}/${total} Pass)`;
  }

  const weakestInfo =
    weakest.score < 70
      ? `\n가장 낮은 차원: ${DIMENSIONS[weakest.dimensionId]?.name || weakest.dimensionId} (${weakest.score}점)`
      : '';

  return `${status}${weakestInfo}\n\n${llmFeedback}`;
}

// ============================================
// 편의 함수
// ============================================

/**
 * 빠른 평가 (점수만 반환)
 */
export async function quickEvaluate(
  target: EvaluationTarget
): Promise<{
  passed: boolean;
  passedCount: number;
  averageScore: number;
  failedDimensions: DimensionId[];
}> {
  const result = await evaluate(target);

  return {
    passed: result.overallPassed,
    passedCount: result.passedCount,
    averageScore: result.averageScore,
    failedDimensions: result.failedDimensions,
  };
}

/**
 * 특정 차원만 평가
 */
export async function evaluateDimension(
  target: EvaluationTarget,
  dimensionId: DimensionId
): Promise<DimensionResult> {
  const result = await evaluate(target, { dimensions: [dimensionId] });
  return result.dimensionResults[0];
}

/**
 * Pass 여부만 빠르게 체크
 */
export async function checkAllPass(target: EvaluationTarget): Promise<{
  passed: boolean;
  message: string;
}> {
  const result = await quickEvaluate(target);

  if (result.passed) {
    return {
      passed: true,
      message: '모든 차원을 통과했습니다.',
    };
  }

  const failedNames = result.failedDimensions
    .map((id) => DIMENSIONS[id]?.name || id)
    .join(', ');

  return {
    passed: false,
    message: `다음 차원이 기준에 미달합니다: ${failedNames}`,
  };
}
