import { HeavenlyStem, HeavenlyStemHanja } from '../constants/stems';
import { EarthlyBranch, EarthlyBranchHanja } from '../constants/branches';

// 새 타입 모듈 re-export
export * from './twelveStages';
export * from './spirits';
export * from './emptyBranches';
export * from './soundElement';
export * from './twelveSpiritKills';

/** 성별 */
export type Gender = 'male' | 'female';

/** 기둥(柱) 하나의 정보 */
export interface Pillar {
  stem: HeavenlyStem;           // 천간 (한글)
  branch: EarthlyBranch;        // 지지 (한글)
  stemHanja: HeavenlyStemHanja; // 천간 (한자)
  branchHanja: EarthlyBranchHanja; // 지지 (한자)
  full: string;                 // 전체 (한글, 예: "갑자")
  fullHanja: string;            // 전체 (한자, 예: "甲子")
  stemIndex: number;            // 천간 인덱스 (0-9)
  branchIndex: number;          // 지지 인덱스 (0-11)
  sexagenaryIndex: number;      // 60갑자 인덱스 (0-59)
}

/** 사주팔자 (4개의 기둥) */
export interface FourPillars {
  year: Pillar;   // 년주
  month: Pillar;  // 월주
  day: Pillar;    // 일주
  hour: Pillar;   // 시주
}

/** 대운 한 주기 */
export interface MajorLuckPeriod {
  pillar: Pillar;       // 대운 기둥
  startAge: number;     // 시작 나이 (세는나이)
  endAge: number;       // 끝 나이
  startYear: number;    // 시작 연도
  endYear: number;      // 끝 연도
}

/** 대운 정보 */
export interface MajorLuck {
  direction: 'forward' | 'backward';  // 순행/역행
  startAge: number;                    // 대운 시작 나이
  periods: MajorLuckPeriod[];          // 대운 목록 (10개)
}

/** 세운 (연운) */
export interface YearlyLuck {
  year: number;
  age: number;
  pillar: Pillar;
}

/** 절기 정보 */
export interface SolarTerm {
  name: string;         // 절기명 (예: "입춘")
  date: string;         // 날짜 (YYYY-MM-DD)
  time: string;         // 시간 (HH:mm)
  datetime: Date;       // Date 객체
}

/** API 요청 파라미터 */
export interface SajuRequest {
  year: number;        // 양력 연도 (1950-2050)
  month: number;       // 월 (1-12)
  day: number;         // 일 (1-31)
  hour: number;        // 시 (0-23)
  minute?: number;     // 분 (0-59, 기본값 0)
  gender: Gender;      // 성별 (대운 계산용)
  // 시간 보정 옵션
  solarTimeCorrection?: boolean;  // 태양시 보정 (기본: true)
  dstCorrection?: boolean;        // 서머타임 보정 (기본: true)
  longitude?: number;             // 지역 경도 (기본: 127.5)
}

/** API 응답 */
export interface SajuResponse {
  success: boolean;
  data: {
    fourPillars: FourPillars;
    majorLuck: MajorLuck;
    yearlyLuck: YearlyLuck[];
    summary: {
      pillars: string;      // "갑자 을축 병인 정묘"
      pillarsHanja: string; // "甲子 乙丑 丙寅 丁卯"
    };
    metadata: {
      solarTermMonth: number;     // 절기 기준 월 (1-12)
      isBeforeLichun: boolean;    // 입춘 전 여부
      effectiveYear: number;      // 실제 적용 연도
    };
  };
  input: SajuRequest;
}

/** 에러 응답 */
export interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Record<string, string>;
  };
}
