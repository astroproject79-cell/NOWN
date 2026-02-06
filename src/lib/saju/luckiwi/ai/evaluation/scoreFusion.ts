/**
 * 점수 융합
 *
 * 룰 기반 평가와 AI 평가 결과를 융합
 */

import type { EvaluationResult, EvaluationDimensionId } from '../../interpretation/evaluation/types';
import type { AIEvaluationResult, FusedEvaluationResult } from './types';

// ============================================
// 점수 융합
// ============================================

export interface FusionConfig {
  /** 룰 기반 가중치 (0-1) */
  ruleWeight: number;
  /** AI 가중치 (0-1) */
  aiWeight: number;
}

const DEFAULT_FUSION_CONFIG: FusionConfig = {
  ruleWeight: 0.3,
  aiWeight: 0.7,
};

/**
 * 룰 기반 + AI 점수 융합
 */
export function fuseScores(
  ruleResult: EvaluationResult,
  aiResult: AIEvaluationResult,
  config: Partial<FusionConfig> = {}
): FusedEvaluationResult {
  const { ruleWeight, aiWeight } = { ...DEFAULT_FUSION_CONFIG, ...config };

  // 가중치 정규화
  const totalWeight = ruleWeight + aiWeight;
  const normalizedRuleWeight = ruleWeight / totalWeight;
  const normalizedAIWeight = aiWeight / totalWeight;

  // 차원별 융합 점수 계산
  const dimensionScores: FusedEvaluationResult['dimensionScores'] = {} as any;

  const allDimensions: EvaluationDimensionId[] = [
    'structure',
    'metaphor',
    'empathy',
    'hope',
    'practicality',
    'tone',
    'readability',
    'emotionalJourney',
  ];

  for (const dim of allDimensions) {
    const ruleDimResult = ruleResult.dimensionResults.find(
      (dr) => dr.dimensionId === dim
    );
    const aiDimResult = aiResult.dimensionScores[dim];

    const ruleScore = ruleDimResult ? ruleDimResult.achievement * 100 : 0;
    const aiScore = aiDimResult?.score || 0;

    dimensionScores[dim] = {
      ruleScore,
      aiScore,
      fusedScore: ruleScore * normalizedRuleWeight + aiScore * normalizedAIWeight,
    };
  }

  // 전체 융합 점수
  const fusedScore =
    ruleResult.totalScore * normalizedRuleWeight +
    aiResult.totalScore * normalizedAIWeight;

  // 등급 계산
  const fusedGrade = scoreToGrade(fusedScore);

  // 종합 피드백 생성
  const overallFeedback = generateFusedFeedback(
    ruleResult,
    aiResult,
    fusedScore,
    fusedGrade
  );

  return {
    ruleBasedScore: ruleResult.totalScore,
    aiScore: aiResult.totalScore,
    fusedScore: Math.round(fusedScore * 10) / 10,
    fusedGrade,
    dimensionScores,
    aiResult,
    overallFeedback,
    improvementPoints: aiResult.improvementPoints,
  };
}

/**
 * 점수를 등급으로 변환
 */
function scoreToGrade(score: number): 'A' | 'B' | 'C' | 'D' | 'F' {
  if (score >= 90) return 'A';
  if (score >= 80) return 'B';
  if (score >= 70) return 'C';
  if (score >= 60) return 'D';
  return 'F';
}

/**
 * 융합 피드백 생성
 */
function generateFusedFeedback(
  ruleResult: EvaluationResult,
  aiResult: AIEvaluationResult,
  fusedScore: number,
  fusedGrade: string
): string {
  const gradeMessages: Record<string, string> = {
    A: '전체적으로 매우 우수한 품질의 통변문입니다.',
    B: '양호한 품질이지만 일부 영역에서 개선이 가능합니다.',
    C: '기본적인 구조는 갖추었으나 여러 영역에서 보완이 필요합니다.',
    D: '주요 영역에서 개선이 필요합니다.',
    F: '전반적인 재검토가 필요합니다.',
  };

  let feedback = gradeMessages[fusedGrade];

  // 점수 차이가 큰 경우 언급
  const scoreDiff = Math.abs(ruleResult.totalScore - aiResult.totalScore);
  if (scoreDiff > 15) {
    if (aiResult.totalScore > ruleResult.totalScore) {
      feedback += ' AI 분석 결과 의미론적 품질이 구조적 점수보다 높습니다.';
    } else {
      feedback += ' 구조는 갖추었으나 내용의 깊이를 보완하면 좋겠습니다.';
    }
  }

  // AI 피드백 추가
  if (aiResult.overallFeedback) {
    feedback += ' ' + aiResult.overallFeedback;
  }

  return feedback;
}

// ============================================
// 점수 분석
// ============================================

/**
 * 점수 불일치 분석
 */
export function analyzeScoreDiscrepancy(
  ruleResult: EvaluationResult,
  aiResult: AIEvaluationResult
): {
  overallDiff: number;
  dimensionDiffs: { dimension: string; diff: number; reason: string }[];
  recommendation: string;
} {
  const overallDiff = aiResult.totalScore - ruleResult.totalScore;

  const dimensionDiffs: {
    dimension: string;
    diff: number;
    reason: string;
  }[] = [];

  for (const ruleDim of ruleResult.dimensionResults) {
    const aiDim = aiResult.dimensionScores[ruleDim.dimensionId];
    if (!aiDim) continue;

    const ruleScore = ruleDim.achievement * 100;
    const diff = aiDim.score - ruleScore;

    if (Math.abs(diff) > 10) {
      dimensionDiffs.push({
        dimension: ruleDim.dimensionId,
        diff,
        reason:
          diff > 0
            ? `AI가 "${ruleDim.dimensionName}"에서 의미론적 품질을 높게 평가`
            : `"${ruleDim.dimensionName}"에서 패턴 매칭은 통과했으나 의미 품질이 부족`,
      });
    }
  }

  // 추천 생성
  let recommendation: string;
  if (Math.abs(overallDiff) <= 5) {
    recommendation = '룰 기반과 AI 평가가 일치합니다. 신뢰할 수 있는 결과입니다.';
  } else if (overallDiff > 0) {
    recommendation =
      'AI가 더 높은 점수를 부여했습니다. 의미론적 품질이 구조적 점수보다 우수합니다.';
  } else {
    recommendation =
      '구조적 점수보다 AI 점수가 낮습니다. 형식은 갖추었으나 내용 품질 개선이 필요합니다.';
  }

  return {
    overallDiff,
    dimensionDiffs,
    recommendation,
  };
}
