/**
 * 하이브리드 파이프라인
 *
 * 룰 기반 + AI 평가/개선을 통합한 완전한 파이프라인
 */

import type { EvaluationInput } from '../../interpretation/evaluation/types';
import { evaluateStory } from '../../interpretation/evaluation/evaluator';
import type {
  HybridPipelineResult,
  HybridPipelineConfig,
  FusedEvaluationResult,
} from './types';
import { DEFAULT_HYBRID_CONFIG } from './types';
import { aiEvaluate } from './aiJudge';
import { aiImprove, applyAIImprovements } from './aiImprover';
import { fuseScores } from './scoreFusion';

// ============================================
// 하이브리드 파이프라인
// ============================================

/**
 * 하이브리드 평가/개선 파이프라인 실행
 */
export async function runHybridPipeline(
  input: EvaluationInput,
  config: Partial<HybridPipelineConfig> = {}
): Promise<HybridPipelineResult> {
  const cfg: HybridPipelineConfig = { ...DEFAULT_HYBRID_CONFIG, ...config };
  const startedAt = new Date().toISOString();

  if (cfg.debug) {
    console.log('[HybridPipeline] 시작');
  }

  let currentInput = input;
  const iterationDetails: HybridPipelineResult['iterationDetails'] = [];

  // 초기 평가
  let ruleResult = evaluateStory(currentInput);
  let aiResult = await aiEvaluate(currentInput);
  let fusedResult = fuseScores(ruleResult, aiResult, {
    ruleWeight: cfg.ruleWeight,
    aiWeight: cfg.aiWeight,
  });

  const initialScore = fusedResult.fusedScore;

  if (cfg.debug) {
    console.log(`[HybridPipeline] 초기 점수: ${initialScore}`);
  }

  // 반복 개선
  let iteration = 0;
  while (
    iteration < cfg.maxIterations &&
    fusedResult.fusedScore < cfg.targetScore
  ) {
    iteration++;
    const beforeScore = fusedResult.fusedScore;

    if (cfg.debug) {
      console.log(`[HybridPipeline] 반복 ${iteration} 시작 (현재: ${beforeScore})`);
    }

    // 1. AI 개선 수행
    const improvement = await aiImprove(currentInput, aiResult, {
      enableVerification: cfg.enableSelfRAG,
    });

    // 2. 개선 적용
    currentInput = applyAIImprovements(currentInput, improvement);

    // 3. 재평가
    ruleResult = evaluateStory(currentInput);
    aiResult = await aiEvaluate(currentInput);
    fusedResult = fuseScores(ruleResult, aiResult, {
      ruleWeight: cfg.ruleWeight,
      aiWeight: cfg.aiWeight,
    });

    const afterScore = fusedResult.fusedScore;

    // 4. 결과 기록
    iterationDetails.push({
      iteration,
      beforeScore,
      afterScore,
      improvements: [
        ...improvement.sectionImprovements.flatMap((s) =>
          s.additions.map((a) => a.reason)
        ),
        ...improvement.globalAdditions.map((g) => g.reason),
      ],
    });

    if (cfg.debug) {
      console.log(
        `[HybridPipeline] 반복 ${iteration} 완료: ${beforeScore} → ${afterScore}`
      );
    }

    // 5. 개선 정체 확인
    const improvementAmount = afterScore - beforeScore;
    if (improvementAmount < cfg.minImprovement) {
      if (cfg.debug) {
        console.log(`[HybridPipeline] 개선 정체로 중단`);
      }
      break;
    }
  }

  const completedAt = new Date().toISOString();
  const finalScore = fusedResult.fusedScore;
  const improvementRate = ((finalScore - initialScore) / initialScore) * 100;

  if (cfg.debug) {
    console.log(
      `[HybridPipeline] 완료: ${initialScore} → ${finalScore} (+${improvementRate.toFixed(1)}%)`
    );
  }

  return {
    runId: `hybrid_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    startedAt,
    completedAt,
    iterations: iteration,
    initialScore,
    finalScore,
    improvementRate: Math.round(improvementRate * 10) / 10,
    finalStory: {
      fullText: currentInput.fullText,
      sections: currentInput.sections,
    },
    finalEvaluation: fusedResult,
    iterationDetails,
  };
}

// ============================================
// 편의 함수
// ============================================

/**
 * 단일 평가만 수행 (개선 없이)
 */
export async function hybridEvaluate(
  input: EvaluationInput,
  config: Partial<Pick<HybridPipelineConfig, 'ruleWeight' | 'aiWeight'>> = {}
): Promise<FusedEvaluationResult> {
  const ruleResult = evaluateStory(input);
  const aiResult = await aiEvaluate(input);

  return fuseScores(ruleResult, aiResult, {
    ruleWeight: config.ruleWeight || DEFAULT_HYBRID_CONFIG.ruleWeight,
    aiWeight: config.aiWeight || DEFAULT_HYBRID_CONFIG.aiWeight,
  });
}

/**
 * 간단한 스토리 개선 (1회 반복)
 */
export async function improveStoryOnce(
  input: EvaluationInput
): Promise<{ improved: EvaluationInput; scoreBefore: number; scoreAfter: number }> {
  // 평가
  const ruleResult = evaluateStory(input);
  const aiResult = await aiEvaluate(input);
  const fusedBefore = fuseScores(ruleResult, aiResult);

  // 개선
  const improvement = await aiImprove(input, aiResult);
  const improved = applyAIImprovements(input, improvement);

  // 재평가
  const ruleResultAfter = evaluateStory(improved);
  const aiResultAfter = await aiEvaluate(improved);
  const fusedAfter = fuseScores(ruleResultAfter, aiResultAfter);

  return {
    improved,
    scoreBefore: fusedBefore.fusedScore,
    scoreAfter: fusedAfter.fusedScore,
  };
}

/**
 * 목표 점수 도달 여부 확인
 */
export async function checkTargetReached(
  input: EvaluationInput,
  targetScore: number = 80
): Promise<{
  reached: boolean;
  currentScore: number;
  gap: number;
  recommendation: string;
}> {
  const result = await hybridEvaluate(input);
  const gap = targetScore - result.fusedScore;
  const reached = result.fusedScore >= targetScore;

  let recommendation: string;
  if (reached) {
    recommendation = '목표 점수에 도달했습니다.';
  } else if (gap <= 5) {
    recommendation = '목표에 거의 도달했습니다. 약간의 개선만 필요합니다.';
  } else if (gap <= 15) {
    recommendation = '몇 가지 중요한 개선이 필요합니다. 파이프라인 1-2회 실행을 권장합니다.';
  } else {
    recommendation = '전반적인 개선이 필요합니다. 파이프라인 실행을 권장합니다.';
  }

  return {
    reached,
    currentScore: result.fusedScore,
    gap,
    recommendation,
  };
}
