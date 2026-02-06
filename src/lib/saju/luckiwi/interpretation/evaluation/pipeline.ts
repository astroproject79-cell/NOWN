/**
 * 개선 파이프라인
 *
 * 평가 → 피드백 → 개선 → 재평가를 반복하여
 * 목표 점수에 도달할 때까지 스토리를 개선합니다.
 */

import type { EvaluationInput, EvaluationResult, PipelineResult } from './types';
import { evaluateStory } from './evaluator';
import {
  generateEnhancements,
  applyEnhancements,
  type StoryEnhancement,
} from './enhancer';

// ============================================
// 파이프라인 설정
// ============================================

export interface PipelineConfig {
  /** 목표 점수 (기본: 80) */
  targetScore: number;

  /** 최대 반복 횟수 (기본: 5) */
  maxIterations: number;

  /** 최소 개선 점수 (이 이상 개선되지 않으면 중단, 기본: 2) */
  minImprovement: number;

  /** 디버그 모드 */
  debug: boolean;

  /** 콜백: 각 반복 후 호출 */
  onIteration?: (
    iteration: number,
    beforeScore: number,
    afterScore: number
  ) => void;
}

const DEFAULT_CONFIG: PipelineConfig = {
  targetScore: 80,
  maxIterations: 5,
  minImprovement: 2,
  debug: false,
};

// ============================================
// 파이프라인 실행
// ============================================

/**
 * 개선 파이프라인 실행
 *
 * @param input - 초기 스토리 입력
 * @param config - 파이프라인 설정 (선택)
 * @returns 파이프라인 실행 결과
 */
export async function runImprovementPipeline(
  input: EvaluationInput,
  config: Partial<PipelineConfig> = {}
): Promise<PipelineResult> {
  const cfg: PipelineConfig = { ...DEFAULT_CONFIG, ...config };
  const startedAt = new Date().toISOString();

  // 초기 평가
  let currentInput = input;
  let currentEvaluation = evaluateStory(currentInput);
  const initialScore = currentEvaluation.totalScore;

  const iterationResults: PipelineResult['iterationResults'] = [];

  if (cfg.debug) {
    console.log(`[Pipeline] 시작 점수: ${initialScore}`);
  }

  // 반복 개선
  let iteration = 0;
  while (
    iteration < cfg.maxIterations &&
    currentEvaluation.totalScore < cfg.targetScore
  ) {
    iteration++;
    const beforeScore = currentEvaluation.totalScore;

    if (cfg.debug) {
      console.log(`[Pipeline] 반복 ${iteration} 시작 (현재 점수: ${beforeScore})`);
    }

    // 1. 개선 제안 생성
    const enhancement = generateEnhancements(currentInput, currentEvaluation);

    // 2. 개선 적용
    currentInput = applyEnhancements(currentInput, enhancement);

    // 3. 재평가
    currentEvaluation = evaluateStory(currentInput);
    const afterScore = currentEvaluation.totalScore;

    // 4. 결과 기록
    iterationResults.push({
      iteration,
      beforeScore,
      afterScore,
      improvements: currentEvaluation.priorityImprovements,
      applied: true,
    });

    // 5. 콜백 호출
    if (cfg.onIteration) {
      cfg.onIteration(iteration, beforeScore, afterScore);
    }

    if (cfg.debug) {
      console.log(
        `[Pipeline] 반복 ${iteration} 완료: ${beforeScore} → ${afterScore} (+${afterScore - beforeScore})`
      );
    }

    // 6. 개선 정체 확인
    const improvement = afterScore - beforeScore;
    if (improvement < cfg.minImprovement) {
      if (cfg.debug) {
        console.log(`[Pipeline] 개선 정체로 중단 (개선: ${improvement})`);
      }
      break;
    }
  }

  const completedAt = new Date().toISOString();
  const finalScore = currentEvaluation.totalScore;

  if (cfg.debug) {
    console.log(
      `[Pipeline] 완료: ${initialScore} → ${finalScore} (${iteration}회 반복)`
    );
  }

  return {
    runId: generateRunId(),
    startedAt,
    completedAt,
    iterations: iteration,
    iterationResults,
    initialScore,
    finalScore,
    improvementRate: ((finalScore - initialScore) / initialScore) * 100,
    finalStory: currentInput,
  };
}

/**
 * 단일 개선 단계 실행 (디버그/테스트용)
 */
export function runSingleIteration(
  input: EvaluationInput
): {
  before: EvaluationResult;
  enhancement: StoryEnhancement;
  after: EvaluationResult;
  improvedInput: EvaluationInput;
} {
  // 1. 평가
  const before = evaluateStory(input);

  // 2. 개선 제안
  const enhancement = generateEnhancements(input, before);

  // 3. 개선 적용
  const improvedInput = applyEnhancements(input, enhancement);

  // 4. 재평가
  const after = evaluateStory(improvedInput);

  return {
    before,
    enhancement,
    after,
    improvedInput,
  };
}

/**
 * 목표 점수 도달 여부 확인
 */
export function checkTargetReached(
  evaluation: EvaluationResult,
  targetScore: number = 80
): {
  reached: boolean;
  currentScore: number;
  gap: number;
  recommendation: string;
} {
  const gap = targetScore - evaluation.totalScore;
  const reached = evaluation.totalScore >= targetScore;

  let recommendation: string;
  if (reached) {
    recommendation = '목표 점수에 도달했습니다. 추가 개선은 선택 사항입니다.';
  } else if (gap <= 5) {
    recommendation = '목표 점수에 거의 도달했습니다. 약간의 개선만 필요합니다.';
  } else if (gap <= 15) {
    recommendation = '몇 가지 중요한 개선이 필요합니다.';
  } else {
    recommendation = '전반적인 개선이 필요합니다. 파이프라인 실행을 권장합니다.';
  }

  return {
    reached,
    currentScore: evaluation.totalScore,
    gap,
    recommendation,
  };
}

// ============================================
// 배치 처리
// ============================================

export interface BatchResult {
  /** 처리된 스토리 수 */
  total: number;
  /** 성공 수 */
  successful: number;
  /** 평균 초기 점수 */
  avgInitialScore: number;
  /** 평균 최종 점수 */
  avgFinalScore: number;
  /** 평균 개선율 */
  avgImprovementRate: number;
  /** 개별 결과 */
  results: PipelineResult[];
}

/**
 * 여러 스토리를 배치로 개선
 */
export async function runBatchImprovement(
  inputs: EvaluationInput[],
  config: Partial<PipelineConfig> = {}
): Promise<BatchResult> {
  const results: PipelineResult[] = [];

  for (const input of inputs) {
    const result = await runImprovementPipeline(input, config);
    results.push(result);
  }

  const successful = results.filter((r) => r.finalScore >= (config.targetScore || 80)).length;
  const avgInitialScore = results.reduce((sum, r) => sum + r.initialScore, 0) / results.length;
  const avgFinalScore = results.reduce((sum, r) => sum + r.finalScore, 0) / results.length;
  const avgImprovementRate = results.reduce((sum, r) => sum + r.improvementRate, 0) / results.length;

  return {
    total: inputs.length,
    successful,
    avgInitialScore,
    avgFinalScore,
    avgImprovementRate,
    results,
  };
}

// ============================================
// 유틸리티
// ============================================

function generateRunId(): string {
  return `run_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

// ============================================
// 간편 함수
// ============================================

/**
 * 스토리를 빠르게 개선 (기본 설정 사용)
 */
export async function improveStory(input: EvaluationInput): Promise<EvaluationInput> {
  const result = await runImprovementPipeline(input);
  return result.finalStory;
}

/**
 * 스토리 점수 빠르게 확인
 */
export function getStoryScore(input: EvaluationInput): {
  score: number;
  grade: string;
  summary: string;
} {
  const evaluation = evaluateStory(input);
  return {
    score: evaluation.totalScore,
    grade: evaluation.totalGrade,
    summary: evaluation.overallFeedback,
  };
}
