/**
 * 장간(藏干) 분석 모듈
 *
 * 장간: 지지(地支) 안에 숨어있는 천간(天干)
 * 사주 해석에서 지지의 진정한 힘을 파악하는 데 사용
 */

import { HeavenlyStem, STEM_ELEMENTS } from '../constants/stems';
import { EarthlyBranch } from '../constants/branches';
import { Element } from '../types/elements';
import {
  getHiddenStems,
  getHiddenStemsArray,
  checkRooting,
  HIDDEN_STEM_STRENGTH,
} from '../constants/hiddenStems';
import { HiddenStemSchool, HiddenStemInfo, HiddenStemAnalysis } from '../types/hiddenStem';
import { FourPillars } from '../types';

/** 사주 전체 장간 분석 결과 */
export interface FullHiddenStemAnalysis {
  /** 년지 장간 */
  year: HiddenStemAnalysis;
  /** 월지 장간 */
  month: HiddenStemAnalysis;
  /** 일지 장간 */
  day: HiddenStemAnalysis;
  /** 시지 장간 */
  hour: HiddenStemAnalysis;
  /** 모든 장간 천간 목록 (중복 포함) */
  allHiddenStems: HeavenlyStem[];
  /** 장간 오행 분포 */
  elementCount: Record<Element, number>;
}

/**
 * 단일 지지의 장간 분석
 * @param branch 지지
 * @param school 장간 유파
 * @returns 장간 분석 결과
 */
export function analyzeHiddenStem(
  branch: EarthlyBranch,
  school: HiddenStemSchool = 'standard'
): HiddenStemAnalysis {
  const hiddenStems = getHiddenStems(branch, school);
  const allStems = getHiddenStemsArray(branch, school);

  return {
    branch,
    hiddenStems,
    allStems,
  };
}

/**
 * 사주 전체 장간 분석
 * @param fourPillars 사주팔자
 * @param school 장간 유파
 * @returns 전체 장간 분석 결과
 */
export function analyzeAllHiddenStems(
  fourPillars: FourPillars,
  school: HiddenStemSchool = 'standard'
): FullHiddenStemAnalysis {
  const year = analyzeHiddenStem(fourPillars.year.branch, school);
  const month = analyzeHiddenStem(fourPillars.month.branch, school);
  const day = analyzeHiddenStem(fourPillars.day.branch, school);
  const hour = analyzeHiddenStem(fourPillars.hour.branch, school);

  // 모든 장간 모으기
  const allHiddenStems = [
    ...year.allStems,
    ...month.allStems,
    ...day.allStems,
    ...hour.allStems,
  ];

  // 오행 분포 계산
  const elementCount: Record<Element, number> = {
    '목': 0,
    '화': 0,
    '토': 0,
    '금': 0,
    '수': 0,
  };

  for (const stem of allHiddenStems) {
    const element = STEM_ELEMENTS[stem] as Element;
    elementCount[element]++;
  }

  return {
    year,
    month,
    day,
    hour,
    allHiddenStems,
    elementCount,
  };
}

/**
 * 천간이 지지들에서 통근하는지 분석
 * 통근(通根): 천간이 지지의 장간에 뿌리를 내리는 것
 * @param stem 천간
 * @param branches 지지 배열
 * @param school 장간 유파
 * @returns 통근 정보
 */
export function analyzeRooting(
  stem: HeavenlyStem,
  branches: EarthlyBranch[],
  school: HiddenStemSchool = 'standard'
): {
  hasRoot: boolean;
  totalStrength: number;
  rootingBranches: Array<{
    branch: EarthlyBranch;
    strength: number;
    type: 'main' | 'middle' | 'residual';
  }>;
} {
  const rootingBranches: Array<{
    branch: EarthlyBranch;
    strength: number;
    type: 'main' | 'middle' | 'residual';
  }> = [];

  let totalStrength = 0;

  for (const branch of branches) {
    const hiddenStems = getHiddenStems(branch, school);

    if (hiddenStems.main === stem) {
      rootingBranches.push({
        branch,
        strength: HIDDEN_STEM_STRENGTH.main,
        type: 'main',
      });
      totalStrength += HIDDEN_STEM_STRENGTH.main;
    } else if (hiddenStems.middle === stem) {
      rootingBranches.push({
        branch,
        strength: HIDDEN_STEM_STRENGTH.middle,
        type: 'middle',
      });
      totalStrength += HIDDEN_STEM_STRENGTH.middle;
    } else if (hiddenStems.residual === stem) {
      rootingBranches.push({
        branch,
        strength: HIDDEN_STEM_STRENGTH.residual,
        type: 'residual',
      });
      totalStrength += HIDDEN_STEM_STRENGTH.residual;
    }
  }

  return {
    hasRoot: rootingBranches.length > 0,
    totalStrength,
    rootingBranches,
  };
}

/**
 * 천간의 투출(透出) 여부 확인
 * 투출: 지지의 장간이 천간에 나타나는 것
 * @param stem 천간
 * @param branches 지지 배열
 * @param school 장간 유파
 * @returns 투출 여부
 */
export function checkTransparency(
  stem: HeavenlyStem,
  branches: EarthlyBranch[],
  school: HiddenStemSchool = 'standard'
): boolean {
  for (const branch of branches) {
    const hiddenStems = getHiddenStemsArray(branch, school);
    if (hiddenStems.includes(stem)) {
      return true;
    }
  }
  return false;
}

/**
 * 사주에서 일간의 통근 분석
 * @param fourPillars 사주팔자
 * @param school 장간 유파
 * @returns 일간 통근 분석 결과
 */
export function analyzeDayMasterRooting(
  fourPillars: FourPillars,
  school: HiddenStemSchool = 'standard'
): ReturnType<typeof analyzeRooting> {
  const dayMaster = fourPillars.day.stem;
  const branches = [
    fourPillars.year.branch,
    fourPillars.month.branch,
    fourPillars.day.branch,
    fourPillars.hour.branch,
  ];

  return analyzeRooting(dayMaster, branches, school);
}
