/**
 * 평가 결과 타입 정의
 *
 * Pass/Fail 방식의 평가 결과
 */

import type { DimensionId } from './dimensions';

// ============================================
// 평가 입력
// ============================================

/**
 * 평가 대상 텍스트
 */
export interface EvaluationTarget {
  /** 전체 텍스트 */
  fullText: string;

  /** 섹션별 구분 (선택) */
  sections?: Section[];

  /** 사주 정보 */
  sajuInfo: SajuInfo;
}

/**
 * 섹션
 */
export interface Section {
  /** 섹션 ID */
  id: string;

  /** 섹션 제목 */
  title: string;

  /** 섹션 내용 */
  content: string;
}

/**
 * 사주 정보 (평가 맥락용)
 */
export interface SajuInfo {
  /** 일주 (예: 甲子) */
  dayPillar: string;

  /** 일주 한글명 (예: 갑목) */
  dayPillarName?: string;

  /** 격국 (예: 식신격) */
  structure?: string;

  /** 용신 */
  favorableElement?: string;

  /** 기신 */
  unfavorableElement?: string;

  /** 현재 대운 */
  currentLuck?: string;

  /** 사용자 나이 */
  age?: number;

  /** 사용자 성별 */
  gender?: 'male' | 'female';
}

// ============================================
// 평가 결과
// ============================================

/**
 * 차원별 평가 결과
 */
export interface DimensionResult {
  /** 차원 ID */
  dimensionId: DimensionId;

  /** 점수 (0-100) */
  score: number;

  /** Pass 여부 */
  passed: boolean;

  /** Pass 임계값 */
  threshold: number;

  /** 상세 피드백 */
  feedback: string;

  /** 근거 (해당 내용 발췌) */
  evidence: string[];

  /** 개선이 필요한 항목 */
  failedItems: FailedItem[];
}

/**
 * 실패한 평가 항목
 */
export interface FailedItem {
  /** 기준 ID */
  criterionId: string;

  /** 기준 이름 */
  criterionName: string;

  /** 실패 이유 */
  reason: string;

  /** 개선 제안 */
  suggestion: string;
}

/**
 * 전체 평가 결과
 */
export interface EvaluationResult {
  /** 평가 ID */
  id: string;

  /** 평가 일시 */
  evaluatedAt: string;

  /** 전체 Pass 여부 (모든 차원 Pass시에만 true) */
  overallPassed: boolean;

  /** Pass한 차원 수 */
  passedCount: number;

  /** 전체 차원 수 */
  totalCount: number;

  /** 평균 점수 (참고용) */
  averageScore: number;

  /** 차원별 결과 */
  dimensionResults: DimensionResult[];

  /** Pass한 차원들 */
  passedDimensions: DimensionId[];

  /** Fail한 차원들 */
  failedDimensions: DimensionId[];

  /** 가장 낮은 점수 차원 */
  weakestDimension: {
    id: DimensionId;
    score: number;
    feedback: string;
  };

  /** 종합 피드백 */
  overallFeedback: string;

  /** 우선 개선 사항 (Fail 차원 기준) */
  priorityImprovements: PriorityImprovement[];
}

/**
 * 우선 개선 사항
 */
export interface PriorityImprovement {
  /** 대상 차원 */
  dimensionId: DimensionId;

  /** 차원 이름 */
  dimensionName: string;

  /** 현재 점수 */
  currentScore: number;

  /** 필요 점수 */
  targetScore: number;

  /** 개선 액션 */
  actions: ImprovementAction[];
}

/**
 * 개선 액션
 */
export interface ImprovementAction {
  /** 액션 타입 */
  type: 'add' | 'modify' | 'remove' | 'restructure';

  /** 설명 */
  description: string;

  /** 대상 섹션 (있을 경우) */
  targetSection?: string;

  /** 예시 */
  example?: string;
}

// ============================================
// 평가 설정
// ============================================

/**
 * 평가 설정
 */
export interface EvaluationConfig {
  /** 평가할 차원 목록 (기본: 전체) */
  dimensions?: DimensionId[];

  /** 커스텀 임계값 */
  thresholds?: Partial<Record<DimensionId, number>>;

  /** 디버그 모드 */
  debug?: boolean;
}

/**
 * 기본 평가 설정
 */
export const DEFAULT_EVALUATION_CONFIG: EvaluationConfig = {
  debug: false,
};
