/**
 * 스토리 품질 평가 시스템 타입 정의
 *
 * 생성된 "삶의 구조 설명서"의 품질을 다차원으로 평가하고
 * 피드백을 생성하여 개선하는 시스템
 */

// ============================================
// 평가 차원 (Evaluation Dimensions)
// ============================================

/**
 * 평가 차원 ID
 */
export type EvaluationDimensionId =
  | 'structure' // 구조적 완성도
  | 'metaphor' // 메타포 일관성
  | 'empathy' // 공감 지수
  | 'hope' // 희망 지수
  | 'practicality' // 실용성
  | 'tone' // 톤 적절성
  | 'readability' // 가독성
  | 'emotionalJourney'; // 감정 여정

/**
 * 평가 차원 정의
 */
export interface EvaluationDimension {
  /** 차원 ID */
  id: EvaluationDimensionId;

  /** 차원 이름 */
  name: string;

  /** 설명 */
  description: string;

  /** 가중치 (전체 점수에서의 비중, 합계 100) */
  weight: number;

  /** 평가 기준들 */
  criteria: EvaluationCriterion[];
}

/**
 * 평가 기준
 */
export interface EvaluationCriterion {
  /** 기준 ID */
  id: string;

  /** 기준 이름 */
  name: string;

  /** 설명 */
  description: string;

  /** 체크 타입 */
  checkType: 'presence' | 'count' | 'ratio' | 'pattern' | 'sentiment';

  /** 목표값 (있을 경우) */
  target?: number | string | boolean;

  /** 최소값 */
  min?: number;

  /** 최대값 */
  max?: number;

  /** 배점 */
  maxScore: number;
}

// ============================================
// 평가 결과
// ============================================

/**
 * 기준별 평가 결과
 */
export interface CriterionResult {
  /** 기준 ID */
  criterionId: string;

  /** 획득 점수 */
  score: number;

  /** 최대 점수 */
  maxScore: number;

  /** 달성률 (0-1) */
  achievement: number;

  /** 측정값 */
  measuredValue: number | string | boolean;

  /** 피드백 메시지 */
  feedback: string;

  /** 개선 제안 */
  suggestion?: string;
}

/**
 * 차원별 평가 결과
 */
export interface DimensionResult {
  /** 차원 ID */
  dimensionId: EvaluationDimensionId;

  /** 차원 이름 */
  dimensionName: string;

  /** 획득 점수 (가중치 적용 전) */
  rawScore: number;

  /** 최대 점수 */
  maxScore: number;

  /** 달성률 (0-1) */
  achievement: number;

  /** 가중치 적용 점수 */
  weightedScore: number;

  /** 기준별 결과 */
  criteriaResults: CriterionResult[];

  /** 차원 요약 피드백 */
  summary: string;

  /** 등급 */
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
}

/**
 * 전체 평가 결과
 */
export interface EvaluationResult {
  /** 평가 ID */
  id: string;

  /** 평가 일시 */
  evaluatedAt: string;

  /** 전체 점수 (0-100) */
  totalScore: number;

  /** 전체 등급 */
  totalGrade: 'A' | 'B' | 'C' | 'D' | 'F';

  /** 차원별 결과 */
  dimensionResults: DimensionResult[];

  /** 강점 (상위 3개 차원) */
  strengths: {
    dimensionId: EvaluationDimensionId;
    name: string;
    score: number;
  }[];

  /** 개선 필요 (하위 3개 차원) */
  weaknesses: {
    dimensionId: EvaluationDimensionId;
    name: string;
    score: number;
    suggestion: string;
  }[];

  /** 종합 피드백 */
  overallFeedback: string;

  /** 우선 개선 사항 */
  priorityImprovements: ImprovementSuggestion[];
}

// ============================================
// 피드백 & 개선
// ============================================

/**
 * 개선 제안
 */
export interface ImprovementSuggestion {
  /** 제안 ID */
  id: string;

  /** 대상 차원 */
  targetDimension: EvaluationDimensionId;

  /** 대상 기준 */
  targetCriterion?: string;

  /** 우선순위 (1-5, 1이 가장 높음) */
  priority: number;

  /** 개선 유형 */
  type: ImprovementType;

  /** 제안 내용 */
  description: string;

  /** 구체적 액션 */
  action: string;

  /** 예상 효과 (점수 상승 예상치) */
  expectedImpact: number;

  /** 적용할 섹션 ID (있을 경우) */
  targetSectionId?: string;

  /** 예시 (있을 경우) */
  example?: string;
}

/**
 * 개선 유형
 */
export type ImprovementType =
  | 'add_content' // 내용 추가
  | 'modify_tone' // 톤 수정
  | 'add_metaphor' // 메타포 추가
  | 'add_empathy' // 공감 표현 추가
  | 'add_hope' // 희망 메시지 추가
  | 'add_advice' // 조언 추가
  | 'simplify' // 단순화
  | 'restructure'; // 구조 재편

// ============================================
// 평가 입력
// ============================================

/**
 * 평가 입력 (생성된 스토리)
 */
export interface EvaluationInput {
  /** 전체 텍스트 */
  fullText: string;

  /** 섹션별 텍스트 */
  sections: {
    id: string;
    title: string;
    content: string;
  }[];

  /** 사용된 메타포 정보 */
  metaphor: {
    centralImage: string;
    tone: string;
  };

  /** 삶의 유형 */
  lifeType: {
    primary: string;
    secondary?: string;
  };

  /** 핵심 한 문장 */
  keySentence: string;
}

// ============================================
// 개선 파이프라인
// ============================================

/**
 * 파이프라인 단계
 */
export type PipelineStage =
  | 'evaluate' // 평가
  | 'feedback' // 피드백 생성
  | 'improve' // 개선 적용
  | 'validate'; // 검증

/**
 * 파이프라인 실행 결과
 */
export interface PipelineResult {
  /** 실행 ID */
  runId: string;

  /** 시작 시간 */
  startedAt: string;

  /** 종료 시간 */
  completedAt: string;

  /** 반복 횟수 */
  iterations: number;

  /** 반복별 결과 */
  iterationResults: {
    iteration: number;
    beforeScore: number;
    afterScore: number;
    improvements: ImprovementSuggestion[];
    applied: boolean;
  }[];

  /** 최초 점수 */
  initialScore: number;

  /** 최종 점수 */
  finalScore: number;

  /** 개선율 */
  improvementRate: number;

  /** 최종 스토리 */
  finalStory: EvaluationInput;
}

// ============================================
// 벤치마크 (기준 문서)
// ============================================

/**
 * 벤치마크 문서
 */
export interface BenchmarkDocument {
  /** 문서 ID */
  id: string;

  /** 문서 이름 */
  name: string;

  /** 설명 */
  description: string;

  /** 문서 내용 */
  content: string;

  /** 기준 점수 (이 문서의 평가 결과) */
  benchmarkScores: {
    dimensionId: EvaluationDimensionId;
    score: number;
  }[];

  /** 참고 사항 */
  notes?: string;
}
