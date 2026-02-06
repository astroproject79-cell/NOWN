/**
 * 십신(十神) 타입 정의
 */

import { HeavenlyStem } from '../constants/stems';

/** 십신 종류 */
export type TenGodType =
  | '비견'   // 比肩 - 같은 오행, 같은 음양
  | '겁재'   // 劫財 - 같은 오행, 다른 음양
  | '식신'   // 食神 - 내가 생하는, 같은 음양
  | '상관'   // 傷官 - 내가 생하는, 다른 음양
  | '편재'   // 偏財 - 내가 극하는, 같은 음양
  | '정재'   // 正財 - 내가 극하는, 다른 음양
  | '편관'   // 偏官 - 나를 극하는, 같은 음양 (칠살)
  | '정관'   // 正官 - 나를 극하는, 다른 음양
  | '편인'   // 偏印 - 나를 생하는, 같은 음양 (효신)
  | '정인'; // 正印 - 나를 생하는, 다른 음양

/** 십신 한자 */
export type TenGodTypeHanja =
  | '比肩' | '劫財' | '食神' | '傷官' | '偏財'
  | '正財' | '偏官' | '正官' | '偏印' | '正印';

/** 사주 내 위치 */
export type PillarPosition = 'year' | 'month' | 'day' | 'hour';

/** 십신 출처 */
export type TenGodSource = 'stem' | 'branch' | 'hiddenStem';

/** 장간 종류 */
export type HiddenStemType = 'main' | 'middle' | 'residual';

/** 단일 십신 정보 */
export interface TenGod {
  /** 십신 종류 */
  type: TenGodType;
  /** 십신 한자 */
  typeHanja: TenGodTypeHanja;
  /** 사주 내 위치 */
  position: PillarPosition;
  /** 출처 (천간/지지/장간) */
  source: TenGodSource;
  /** 원래 천간 */
  stem: HeavenlyStem;
  /** 장간 종류 (장간인 경우) */
  hiddenStemType?: HiddenStemType;
}

/** 기둥별 십신 정보 */
export interface PillarTenGods {
  /** 천간 십신 (일간은 null) */
  stem: TenGod | null;
  /** 지지 본기 십신 */
  branch: TenGod;
  /** 장간 십신들 */
  hiddenStems: TenGod[];
}

/** 십신 개수 통계 */
export type TenGodCount = Record<TenGodType, number>;

/** 사주 전체 십신 분석 */
export interface TenGodAnalysis {
  /** 년주 십신 */
  year: PillarTenGods;
  /** 월주 십신 */
  month: PillarTenGods;
  /** 일주 십신 (천간은 null, 기준점) */
  day: PillarTenGods;
  /** 시주 십신 */
  hour: PillarTenGods;
  /** 십신별 개수 */
  count: TenGodCount;
  /** 가장 많이 나타나는 십신 */
  dominant: TenGodType[];
  /** 일간 (기준점) */
  dayMaster: HeavenlyStem;
}
