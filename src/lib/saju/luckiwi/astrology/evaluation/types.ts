/**
 * 점성학 해석 평가 시스템 타입 정의
 */

import type { ChartInterpretation } from '../interpretation/generator';
import type { NatalChart } from '../types';

// ============================================
// 평가 차원 (Evaluation Dimensions)
// ============================================

/**
 * 점성학 평가 차원 ID
 */
export type AstrologyEvaluationDimensionId =
  | 'astronomicalAccuracy' // 천문학적 정확성
  | 'interpretationConsistency' // 해석 일관성
  | 'symbolism' // 상징 활용
  | 'empathy' // 공감 지수
  | 'hope' // 희망 지수
  | 'practicality' // 실용성
  | 'tone' // 톤 적절성
  | 'readability'; // 가독성

/**
 * 평가 차원 정의
 */
export interface AstrologyEvaluationDimension {
  id: AstrologyEvaluationDimensionId;
  name: string;
  description: string;
  weight: number; // 가중치 (합계 100)
}

/**
 * 평가 차원 기본 설정
 */
export const ASTROLOGY_EVALUATION_DIMENSIONS: AstrologyEvaluationDimension[] = [
  {
    id: 'astronomicalAccuracy',
    name: '천문학적 정확성',
    description: '해석이 실제 차트 데이터와 일치하는지',
    weight: 20,
  },
  {
    id: 'interpretationConsistency',
    name: '해석 일관성',
    description: '행성-사인-하우스 해석이 맥락적으로 일관되는지',
    weight: 15,
  },
  {
    id: 'symbolism',
    name: '상징 활용',
    description: '원소, 성질, 신화 등 상징을 효과적으로 사용하는지',
    weight: 10,
  },
  {
    id: 'empathy',
    name: '공감 지수',
    description: '도전적 배치를 공감적으로 설명하는지',
    weight: 15,
  },
  {
    id: 'hope',
    name: '희망 지수',
    description: '긍정적 미래 전망을 제시하는지',
    weight: 10,
  },
  {
    id: 'practicality',
    name: '실용성',
    description: '구체적이고 실천 가능한 조언을 제시하는지',
    weight: 10,
  },
  {
    id: 'tone',
    name: '톤 적절성',
    description: '단정을 피하고 가능성으로 서술하는지',
    weight: 10,
  },
  {
    id: 'readability',
    name: '가독성',
    description: '전문용어를 쉽게 설명하는지',
    weight: 10,
  },
];

// ============================================
// 평가 입력
// ============================================

/**
 * 점성학 평가 입력
 */
export interface AstrologyEvaluationInput {
  /** 원본 차트 데이터 */
  chart: NatalChart;

  /** 생성된 해석 */
  interpretation: ChartInterpretation;

  /** 해석 전체 텍스트 */
  fullText: string;

  /** 섹션별 텍스트 */
  sections: {
    id: string;
    title: string;
    content: string;
  }[];
}

// ============================================
// 평가 결과
// ============================================

/**
 * 차원별 평가 결과
 */
export interface AstrologyDimensionResult {
  dimensionId: AstrologyEvaluationDimensionId;
  dimensionName: string;
  score: number; // 0-100
  weightedScore: number;
  feedback: string;
  evidence: string[];
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
}

/**
 * 전체 평가 결과
 */
export interface AstrologyEvaluationResult {
  /** 평가 ID */
  id: string;

  /** 평가 일시 */
  evaluatedAt: string;

  /** 전체 점수 (0-100) */
  totalScore: number;

  /** 전체 등급 */
  totalGrade: 'A' | 'B' | 'C' | 'D' | 'F';

  /** 차원별 결과 */
  dimensionResults: AstrologyDimensionResult[];

  /** 강점 */
  strengths: {
    dimensionId: AstrologyEvaluationDimensionId;
    name: string;
    score: number;
  }[];

  /** 개선 필요 */
  weaknesses: {
    dimensionId: AstrologyEvaluationDimensionId;
    name: string;
    score: number;
    suggestion: string;
  }[];

  /** 종합 피드백 */
  overallFeedback: string;

  /** 우선 개선 사항 */
  improvementPoints: AstrologyImprovementPoint[];

  /** 신뢰도 */
  confidence: 'high' | 'medium' | 'low';
}

/**
 * 개선 포인트
 */
export interface AstrologyImprovementPoint {
  dimension: AstrologyEvaluationDimensionId;
  issue: string;
  suggestion: string;
  priority: number; // 1-5
  expectedImpact: number; // 예상 점수 상승
}

// ============================================
// AI 평가 결과
// ============================================

/**
 * AI 평가 결과
 */
export interface AstrologyAIEvaluationResult extends AstrologyEvaluationResult {
  /** RAG 컨텍스트 */
  ragContext?: {
    benchmarkIds: string[];
    criteriaIds: string[];
  };
}

// ============================================
// 융합 결과
// ============================================

/**
 * 룰+AI 융합 평가 결과
 */
export interface AstrologyFusedResult {
  ruleBasedScore: number;
  aiScore: number;
  fusedScore: number;
  fusedGrade: 'A' | 'B' | 'C' | 'D' | 'F';

  dimensionScores: {
    [K in AstrologyEvaluationDimensionId]: {
      ruleScore: number;
      aiScore: number;
      fusedScore: number;
    };
  };

  aiResult: AstrologyAIEvaluationResult;
  overallFeedback: string;
  improvementPoints: AstrologyImprovementPoint[];
}

// ============================================
// 파이프라인 설정
// ============================================

/**
 * 평가 파이프라인 설정
 */
export interface AstrologyPipelineConfig {
  /** 목표 점수 */
  targetScore: number;

  /** 최대 반복 횟수 */
  maxIterations: number;

  /** 최소 개선 점수 */
  minImprovement: number;

  /** 룰 기반 가중치 (0-1) */
  ruleWeight: number;

  /** AI 가중치 (0-1) */
  aiWeight: number;

  /** Self-RAG 검증 활성화 */
  enableSelfRAG: boolean;

  /** 디버그 모드 */
  debug: boolean;
}

export const DEFAULT_ASTROLOGY_PIPELINE_CONFIG: AstrologyPipelineConfig = {
  targetScore: 80,
  maxIterations: 3,
  minImprovement: 3,
  ruleWeight: 0.3,
  aiWeight: 0.7,
  enableSelfRAG: true,
  debug: false,
};

// ============================================
// 벤치마크
// ============================================

/**
 * 점성학 벤치마크 문서
 */
export interface AstrologyBenchmark {
  id: string;
  name: string;
  description: string;
  chartType: 'natal' | 'synastry' | 'solar_return' | 'firdaria';
  content: string;
  benchmarkScores: {
    dimensionId: AstrologyEvaluationDimensionId;
    score: number;
  }[];
  notes?: string;
}

// ============================================
// 유틸리티 함수
// ============================================

/**
 * 점수를 등급으로 변환
 */
export function scoreToGrade(score: number): 'A' | 'B' | 'C' | 'D' | 'F' {
  if (score >= 90) return 'A';
  if (score >= 80) return 'B';
  if (score >= 70) return 'C';
  if (score >= 60) return 'D';
  return 'F';
}

/**
 * 등급별 피드백 메시지
 */
export function getGradeFeedback(grade: 'A' | 'B' | 'C' | 'D' | 'F'): string {
  const feedbacks = {
    A: '우수한 해석입니다. 높은 품질을 유지하고 있습니다.',
    B: '좋은 해석입니다. 약간의 개선으로 더 나아질 수 있습니다.',
    C: '보통 수준입니다. 일부 영역에서 개선이 필요합니다.',
    D: '개선이 필요합니다. 주요 영역에서 보완이 필요합니다.',
    F: '대폭적인 개선이 필요합니다. 기본 요소부터 검토해주세요.',
  };
  return feedbacks[grade];
}
