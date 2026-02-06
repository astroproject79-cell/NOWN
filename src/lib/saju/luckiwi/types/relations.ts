/**
 * 간지 관계(合沖刑害破) 타입 정의
 */

import { HeavenlyStem } from '../constants/stems';
import { EarthlyBranch } from '../constants/branches';
import { Element } from './elements';

/** 사주 내 위치 */
export type PositionType =
  | 'year-stem' | 'year-branch'
  | 'month-stem' | 'month-branch'
  | 'day-stem' | 'day-branch'
  | 'hour-stem' | 'hour-branch';

/** 천간합 */
export interface StemCombination {
  /** 합을 이루는 두 천간 */
  stems: [HeavenlyStem, HeavenlyStem];
  /** 위치 */
  positions: [PositionType, PositionType];
  /** 합화 오행 */
  resultElement: Element;
  /** 화(化) 성립 여부 */
  isTransformed: boolean;
}

/** 육합 (지지 2개) */
export interface SixCombination {
  /** 합을 이루는 두 지지 */
  branches: [EarthlyBranch, EarthlyBranch];
  /** 위치 */
  positions: [PositionType, PositionType];
  /** 합화 오행 */
  resultElement: Element;
}

/** 삼합 (지지 3개) */
export interface TripleCombination {
  /** 합을 이루는 세 지지 */
  branches: [EarthlyBranch, EarthlyBranch, EarthlyBranch];
  /** 위치 */
  positions: [PositionType, PositionType, PositionType];
  /** 합화 오행 */
  resultElement: Element;
  /** 완전 삼합 여부 */
  isComplete: boolean;
}

/** 반합 (삼합 중 2개만) */
export interface HalfCombination {
  /** 합을 이루는 두 지지 */
  branches: [EarthlyBranch, EarthlyBranch];
  /** 위치 */
  positions: [PositionType, PositionType];
  /** 누락된 지지 */
  missingBranch: EarthlyBranch;
  /** 합화 오행 */
  resultElement: Element;
  /** 반합 종류 (생지반합, 왕지반합, 고지반합) */
  type: 'birth' | 'prosperity' | 'storage';
}

/** 방합 (같은 방위 3개) */
export interface DirectionalCombination {
  /** 합을 이루는 지지들 */
  branches: EarthlyBranch[];
  /** 위치들 */
  positions: PositionType[];
  /** 방위 */
  direction: '동' | '남' | '서' | '북';
  /** 오행 */
  element: Element;
  /** 완전 방합 여부 (3개 모두) */
  isComplete: boolean;
}

/** 육충 */
export interface Clash {
  /** 충하는 두 지지 */
  branches: [EarthlyBranch, EarthlyBranch];
  /** 위치 */
  positions: [PositionType, PositionType];
}

/** 형(刑) 종류 */
export type PunishmentType =
  | 'graceless'  // 무은지형 (寅巳申)
  | 'bullying'   // 세력지형 (丑戌未)
  | 'self';      // 자형 (辰午酉亥)

/** 형 */
export interface Punishment {
  /** 형을 이루는 지지들 */
  branches: EarthlyBranch[];
  /** 위치들 */
  positions: PositionType[];
  /** 형 종류 */
  type: PunishmentType;
}

/** 해 */
export interface Harm {
  /** 해를 이루는 두 지지 */
  branches: [EarthlyBranch, EarthlyBranch];
  /** 위치 */
  positions: [PositionType, PositionType];
}

/** 파 */
export interface Destruction {
  /** 파를 이루는 두 지지 */
  branches: [EarthlyBranch, EarthlyBranch];
  /** 위치 */
  positions: [PositionType, PositionType];
}

/** 전체 관계 분석 결과 */
export interface RelationAnalysis {
  /** 천간합 */
  stemCombinations: StemCombination[];
  /** 삼합 */
  tripleCombinations: TripleCombination[];
  /** 반합 */
  halfCombinations: HalfCombination[];
  /** 육합 */
  sixCombinations: SixCombination[];
  /** 방합 */
  directionalCombinations: DirectionalCombination[];
  /** 육충 */
  clashes: Clash[];
  /** 형 */
  punishments: Punishment[];
  /** 해 */
  harms: Harm[];
  /** 파 */
  destructions: Destruction[];
  /** 요약 */
  summary: {
    /** 충돌 관계 존재 여부 */
    hasConflict: boolean;
    /** 합 관계 존재 여부 */
    hasCombination: boolean;
    /** 충돌 점수 (0-100) */
    conflictScore: number;
    /** 조화 점수 (0-100) */
    harmonyScore: number;
  };
}
