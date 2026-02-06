/**
 * 공망(空亡) 타입 정의
 */

/** 공망 정보 */
export interface EmptyBranchInfo {
  /** 공망 지지 2개 */
  branches: [string, string];
  /** 기준이 된 주 */
  basedOn: 'year' | 'day';
  /** 60갑자 순(旬) 이름 */
  cycle: string;
  /** 한자 */
  cycleHanja: string;
}

/** 공망 분석 결과 */
export interface EmptyBranchesAnalysis {
  /** 년주 기준 공망 */
  yearBased: EmptyBranchInfo;
  /** 일주 기준 공망 */
  dayBased: EmptyBranchInfo;
  /** 공망에 해당하는 주 */
  affectedPositions: {
    position: 'year' | 'month' | 'day' | 'hour';
    branch: string;
    basedOn: 'year' | 'day';
  }[];
  /** 요약 */
  summary: {
    hasEmpty: boolean;
    emptyCount: number;
    interpretation: string;
  };
}
