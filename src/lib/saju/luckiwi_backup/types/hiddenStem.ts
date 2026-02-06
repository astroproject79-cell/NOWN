/**
 * 장간(藏干) 타입 정의
 */

import { HeavenlyStem } from '../constants/stems';
import { EarthlyBranch } from '../constants/branches';

/** 장간 유파 */
export type HiddenStemSchool = 'standard' | 'yeonhae';

/** 장간 정보 */
export interface HiddenStemInfo {
  /** 본기 (지장간 주기) - 항상 존재 */
  main: HeavenlyStem;
  /** 중기 (선택적) */
  middle?: HeavenlyStem;
  /** 여기 (선택적) */
  residual?: HeavenlyStem;
}

/** 지지별 장간 매핑 */
export type HiddenStemMap = Record<EarthlyBranch, HiddenStemInfo>;

/** 장간 분석 결과 (지지 하나에 대한) */
export interface HiddenStemAnalysis {
  /** 지지 */
  branch: EarthlyBranch;
  /** 장간 정보 */
  hiddenStems: HiddenStemInfo;
  /** 모든 장간 목록 (배열) */
  allStems: HeavenlyStem[];
}
