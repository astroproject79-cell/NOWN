/**
 * 피르다리아 (페르시아 행성 주기) 타입 정의
 *
 * 75년 사이클의 행성 지배 주기 시스템
 * 주간/야간 출생에 따라 순서가 다름
 */

import type { BirthData } from './chart';

// 피르다리아 지배 행성 (7 전통 행성 + 2 노드)
export type FirdariaRuler =
  | 'sun'
  | 'moon'
  | 'mercury'
  | 'venus'
  | 'mars'
  | 'jupiter'
  | 'saturn'
  | 'northNode'
  | 'southNode';

// 각 행성의 주기 기간 (년)
export const FIRDARIA_PERIODS: Record<FirdariaRuler, number> = {
  sun: 10,
  venus: 8,
  mercury: 13,
  moon: 9,
  saturn: 11,
  jupiter: 12,
  mars: 7,
  northNode: 3,
  southNode: 2,
};

// 주간 출생 순서 (태양부터 시작)
export const DAY_BIRTH_ORDER: FirdariaRuler[] = [
  'sun',
  'venus',
  'mercury',
  'moon',
  'saturn',
  'jupiter',
  'mars',
  'northNode',
  'southNode',
];

// 야간 출생 순서 (달부터 시작)
export const NIGHT_BIRTH_ORDER: FirdariaRuler[] = [
  'moon',
  'saturn',
  'jupiter',
  'mars',
  'northNode',
  'southNode',
  'sun',
  'venus',
  'mercury',
];

// 피르다리아 주기
export interface FirdariaPeriod {
  ruler: FirdariaRuler; // 주 지배 행성
  subRuler?: FirdariaRuler; // 하위 지배 행성 (서브피리어드)

  // 시간 정보
  startAge: number; // 시작 나이
  endAge: number; // 종료 나이
  startDate: Date; // 시작 날짜
  endDate: Date; // 종료 날짜
  duration: number; // 기간 (년)

  // 현재 상태
  isCurrent?: boolean; // 현재 주기 여부
  progress?: number; // 진행률 (0-100)
}

// 피르다리아 결과
export interface FirdariaResult {
  birthData: BirthData;
  isNightBirth: boolean; // 야간 출생 여부

  // 주기 정보
  totalCycle: number; // 75년
  currentCycle: number; // 현재 몇 번째 사이클 (1, 2, ...)

  // 주요 주기 (Major Periods)
  majorPeriods: FirdariaPeriod[];

  // 현재 주기
  currentMajorPeriod: FirdariaPeriod;

  // 현재 서브피리어드
  currentSubPeriod: FirdariaPeriod;

  // 현재 주기 내 모든 서브피리어드
  subPeriods: FirdariaPeriod[];

  // 메타데이터
  metadata: {
    calculatedAt: string;
    currentAge: number;
    nextMajorPeriodStart: Date;
    nextSubPeriodStart: Date;
  };
}

// 피르다리아 해석
export interface FirdariaInterpretation {
  ruler: FirdariaRuler;
  subRuler?: FirdariaRuler;

  // 주제
  mainTheme: string;
  subTheme?: string;

  // 키워드
  keywords: string[];

  // 영역
  lifeAreas: string[];

  // 조언
  advice: string;
}

// 피르다리아 타임라인 (시각화용)
export interface FirdariaTimeline {
  periods: {
    ruler: FirdariaRuler;
    startYear: number;
    endYear: number;
    color: string; // 시각화용 색상
  }[];
  currentPosition: number; // 현재 위치 (0-75)
}
