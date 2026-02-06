/**
 * Interpretation Engine V2
 *
 * 사용자 관점 8개 차원 평가 + 할루시네이션 방지 개선 시스템
 *
 * ## 특징
 * - Pass/Fail 방식: 8개 차원 모두 통과해야 Pass
 * - 사용자 중심 차원: 맞춤, 공감, 신뢰, 실용, 희망, 명료, 몰입, 완결
 * - 계층적 개선: 할루시네이션 방지를 위한 레벨별 제약
 *
 * ## 사용법
 * ```typescript
 * import { evaluate, improveUntilPass } from './engine-v2';
 *
 * // 평가
 * const result = await evaluate(target);
 * if (!result.overallPassed) {
 *   console.log('실패 차원:', result.failedDimensions);
 * }
 *
 * // 반복 개선
 * const improved = await improveUntilPass(target, { maxIterations: 3 });
 * console.log('최종 결과:', improved.passed ? 'Pass' : 'Fail');
 * ```
 */

// ============================================
// 타입 내보내기
// ============================================

export * from './types';

// ============================================
// 평가 모듈
// ============================================

export {
  evaluate,
  quickEvaluate,
  evaluateDimension,
  checkAllPass,
} from './evaluation';

// ============================================
// 개선 모듈
// ============================================

export {
  improve,
  evaluateAndImprove,
  improveUntilPass,
} from './improvement';

// ============================================
// 편의 함수
// ============================================

import type { EvaluationTarget, EvaluationResult, ImprovementResult } from './types';
import { evaluate } from './evaluation';
import { improveUntilPass } from './improvement';

/**
 * 원스톱 평가 및 개선
 *
 * 평가 후 필요시 자동으로 개선하여 Pass 달성
 */
export async function processInterpretation(
  target: EvaluationTarget,
  options: {
    autoImprove?: boolean;
    maxIterations?: number;
    debug?: boolean;
  } = {}
): Promise<{
  initialEvaluation: EvaluationResult;
  finalText: string;
  improved: boolean;
  iterations: number;
  finalPassed: boolean;
}> {
  const { autoImprove = true, maxIterations = 3, debug = false } = options;

  // 1. 초기 평가
  const initialEvaluation = await evaluate(target, { debug });

  // 이미 Pass면 그대로 반환
  if (initialEvaluation.overallPassed || !autoImprove) {
    return {
      initialEvaluation,
      finalText: target.fullText,
      improved: false,
      iterations: 0,
      finalPassed: initialEvaluation.overallPassed,
    };
  }

  // 2. 반복 개선
  const result = await improveUntilPass(target, {
    maxIterations,
    config: { debug },
  });

  return {
    initialEvaluation,
    finalText: result.finalText,
    improved: true,
    iterations: result.iterations,
    finalPassed: result.passed,
  };
}

/**
 * 간단한 품질 체크
 */
export async function checkQuality(
  text: string,
  sajuInfo: { dayPillar: string; dayPillarName?: string }
): Promise<{
  passed: boolean;
  score: number;
  failedAreas: string[];
  suggestion: string;
}> {
  const result = await evaluate({
    fullText: text,
    sajuInfo: {
      dayPillar: sajuInfo.dayPillar,
      dayPillarName: sajuInfo.dayPillarName,
    },
  });

  const failedAreas = result.failedDimensions.map((id) => {
    const dim = result.dimensionResults.find((r) => r.dimensionId === id);
    return dim?.feedback || id;
  });

  let suggestion: string;
  if (result.overallPassed) {
    suggestion = '품질 기준을 충족합니다.';
  } else if (result.failedDimensions.length <= 2) {
    suggestion = `${result.failedDimensions.length}개 영역만 보완하면 됩니다.`;
  } else {
    suggestion = '전반적인 개선이 필요합니다.';
  }

  return {
    passed: result.overallPassed,
    score: result.averageScore,
    failedAreas,
    suggestion,
  };
}
