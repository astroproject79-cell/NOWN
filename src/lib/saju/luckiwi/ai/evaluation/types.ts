/**
 * AI 평가 시스템 타입 정의
 */

import type { EvaluationDimensionId } from '../../interpretation/evaluation/types';

// ============================================
// AI 평가 결과
// ============================================

/**
 * AI 평가 결과
 */
export interface AIEvaluationResult {
  /** 평가 ID */
  id: string;

  /** 평가 일시 */
  evaluatedAt: string;

  /** 차원별 점수 */
  dimensionScores: {
    [K in EvaluationDimensionId]: {
      score: number;
      feedback: string;
      evidence: string[];
    };
  };

  /** 전체 점수 (0-100) */
  totalScore: number;

  /** 전체 등급 */
  totalGrade: 'A' | 'B' | 'C' | 'D' | 'F';

  /** 강점 */
  strengths: string[];

  /** 개선 포인트 */
  improvementPoints: AIImprovementPoint[];

  /** 종합 피드백 */
  overallFeedback: string;

  /** 신뢰도 */
  confidence: 'high' | 'medium' | 'low';

  /** 사용된 RAG 컨텍스트 */
  ragContext?: {
    benchmarkIds: string[];
    criteriaIds: string[];
  };
}

/**
 * 개선 포인트
 */
export interface AIImprovementPoint {
  /** 대상 차원 */
  dimension: EvaluationDimensionId;

  /** 문제가 되는 원문 */
  originalText: string;

  /** 문제 설명 */
  issue: string;

  /** 제안 유형 */
  suggestionType:
    | 'add_empathy'
    | 'add_hope'
    | 'modify_tone'
    | 'add_metaphor'
    | 'add_advice'
    | 'simplify'
    | 'restructure';
}

// ============================================
// AI 개선 결과
// ============================================

/**
 * AI 개선 결과
 */
export interface AIImprovementResult {
  /** 개선 ID */
  id: string;

  /** 개선 일시 */
  improvedAt: string;

  /** 섹션별 개선 */
  sectionImprovements: AISectionImprovement[];

  /** 전체 추가 사항 */
  globalAdditions: AIGlobalAddition[];

  /** 예상 점수 향상 */
  expectedScoreImprovement: {
    [K in EvaluationDimensionId]?: number;
  };

  /** 개선 요약 */
  summary: string;

  /** 검증 결과 */
  verification?: {
    isValid: boolean;
    modifications: string[];
  };
}

/**
 * 섹션 개선
 */
export interface AISectionImprovement {
  sectionId: string;
  sectionTitle: string;
  additions: Array<{
    position: 'start' | 'end' | string;
    text: string;
    reason: string;
    targetDimension: EvaluationDimensionId;
    patternRef?: string;
  }>;
  modifications: Array<{
    original: string;
    improved: string;
    reason: string;
    targetDimension: EvaluationDimensionId;
  }>;
}

/**
 * 전체 추가
 */
export interface AIGlobalAddition {
  text: string;
  reason: string;
  targetDimension: EvaluationDimensionId;
  suggestedPosition: string;
}

// ============================================
// 융합 결과
// ============================================

/**
 * 점수 융합 결과
 */
export interface FusedEvaluationResult {
  /** 룰 기반 점수 */
  ruleBasedScore: number;

  /** AI 점수 */
  aiScore: number;

  /** 융합 점수 */
  fusedScore: number;

  /** 융합 등급 */
  fusedGrade: 'A' | 'B' | 'C' | 'D' | 'F';

  /** 차원별 융합 점수 */
  dimensionScores: {
    [K in EvaluationDimensionId]: {
      ruleScore: number;
      aiScore: number;
      fusedScore: number;
    };
  };

  /** AI 평가 결과 (상세) */
  aiResult: AIEvaluationResult;

  /** 종합 피드백 */
  overallFeedback: string;

  /** 개선 포인트 (AI 기반) */
  improvementPoints: AIImprovementPoint[];
}

// ============================================
// 파이프라인 결과
// ============================================

/**
 * 하이브리드 파이프라인 결과
 */
export interface HybridPipelineResult {
  /** 실행 ID */
  runId: string;

  /** 시작 시간 */
  startedAt: string;

  /** 종료 시간 */
  completedAt: string;

  /** 반복 횟수 */
  iterations: number;

  /** 초기 점수 */
  initialScore: number;

  /** 최종 점수 */
  finalScore: number;

  /** 개선율 (%) */
  improvementRate: number;

  /** 최종 스토리 */
  finalStory: {
    fullText: string;
    sections: Array<{
      id: string;
      title: string;
      content: string;
    }>;
  };

  /** 최종 평가 */
  finalEvaluation: FusedEvaluationResult;

  /** 반복별 상세 */
  iterationDetails: Array<{
    iteration: number;
    beforeScore: number;
    afterScore: number;
    improvements: string[];
  }>;
}

// ============================================
// 설정
// ============================================

/**
 * 하이브리드 파이프라인 설정
 */
export interface HybridPipelineConfig {
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

export const DEFAULT_HYBRID_CONFIG: HybridPipelineConfig = {
  targetScore: 80,
  maxIterations: 3,
  minImprovement: 3,
  ruleWeight: 0.3,
  aiWeight: 0.7,
  enableSelfRAG: true,
  debug: false,
};
