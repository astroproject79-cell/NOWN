/**
 * 십신(十神) 계산 모듈
 *
 * 십신: 일간을 기준으로 다른 천간/지지와의 관계를 나타내는 명리학 용어
 * - 비견(比肩): 같은 오행, 같은 음양
 * - 겁재(劫財): 같은 오행, 다른 음양
 * - 식신(食神): 내가 생하는, 같은 음양
 * - 상관(傷官): 내가 생하는, 다른 음양
 * - 편재(偏財): 내가 극하는, 같은 음양
 * - 정재(正財): 내가 극하는, 다른 음양
 * - 편관(偏官): 나를 극하는, 같은 음양
 * - 정관(正官): 나를 극하는, 다른 음양
 * - 편인(偏印): 나를 생하는, 같은 음양
 * - 정인(正印): 나를 생하는, 다른 음양
 */

import { HeavenlyStem, STEM_ELEMENTS, STEM_YIN_YANG } from '../constants/stems';
import { EarthlyBranch, BRANCH_ELEMENTS, BRANCH_YIN_YANG } from '../constants/branches';
import { Element } from '../types/elements';
import { getElementRelation, ElementRelationType } from '../constants/elements';
import { TEN_GOD_TABLE, TEN_GOD_HANJA, YinYangMatch } from '../constants/tenGods';
import { getHiddenStems, getHiddenStemsArray } from '../constants/hiddenStems';
import { HiddenStemSchool } from '../types/hiddenStem';
import {
  TenGodType,
  TenGodTypeHanja,
  TenGod,
  PillarTenGods,
  TenGodAnalysis,
  TenGodCount,
  PillarPosition,
  HiddenStemType,
} from '../types/tenGod';
import { FourPillars } from '../types';

/**
 * 천간 간의 십신 계산
 * @param dayMaster 일간 (기준)
 * @param target 대상 천간
 * @returns 십신 종류
 */
export function calculateTenGodFromStem(
  dayMaster: HeavenlyStem,
  target: HeavenlyStem
): TenGodType {
  // 오행 확인
  const dayElement = STEM_ELEMENTS[dayMaster] as Element;
  const targetElement = STEM_ELEMENTS[target] as Element;

  // 음양 확인
  const dayYinYang = STEM_YIN_YANG[dayMaster];
  const targetYinYang = STEM_YIN_YANG[target];

  // 오행 관계 판단
  const relation = getElementRelation(dayElement, targetElement);

  // 음양 일치 여부
  const yinYangMatch: YinYangMatch = dayYinYang === targetYinYang ? 'same' : 'different';

  return TEN_GOD_TABLE[relation][yinYangMatch];
}

/**
 * 지지의 본기 기준 십신 계산
 * @param dayMaster 일간
 * @param branch 지지
 * @param school 장간 유파
 * @returns 십신 종류
 */
export function calculateTenGodFromBranch(
  dayMaster: HeavenlyStem,
  branch: EarthlyBranch,
  school: HiddenStemSchool = 'standard'
): TenGodType {
  // 지지의 본기(장간 main)를 기준으로 계산
  const hiddenStems = getHiddenStems(branch, school);
  return calculateTenGodFromStem(dayMaster, hiddenStems.main);
}

/**
 * 십신 정보 생성 (천간용)
 */
function createStemTenGod(
  dayMaster: HeavenlyStem,
  stem: HeavenlyStem,
  position: PillarPosition
): TenGod {
  const type = calculateTenGodFromStem(dayMaster, stem);
  return {
    type,
    typeHanja: TEN_GOD_HANJA[type],
    position,
    source: 'stem',
    stem,
  };
}

/**
 * 십신 정보 생성 (지지 본기용)
 */
function createBranchTenGod(
  dayMaster: HeavenlyStem,
  branch: EarthlyBranch,
  position: PillarPosition,
  school: HiddenStemSchool = 'standard'
): TenGod {
  const hiddenStems = getHiddenStems(branch, school);
  const type = calculateTenGodFromStem(dayMaster, hiddenStems.main);
  return {
    type,
    typeHanja: TEN_GOD_HANJA[type],
    position,
    source: 'branch',
    stem: hiddenStems.main,
  };
}

/**
 * 십신 정보 생성 (장간용)
 */
function createHiddenStemTenGods(
  dayMaster: HeavenlyStem,
  branch: EarthlyBranch,
  position: PillarPosition,
  school: HiddenStemSchool = 'standard'
): TenGod[] {
  const hiddenStems = getHiddenStems(branch, school);
  const result: TenGod[] = [];

  // 본기
  const mainType = calculateTenGodFromStem(dayMaster, hiddenStems.main);
  result.push({
    type: mainType,
    typeHanja: TEN_GOD_HANJA[mainType],
    position,
    source: 'hiddenStem',
    stem: hiddenStems.main,
    hiddenStemType: 'main',
  });

  // 중기
  if (hiddenStems.middle) {
    const middleType = calculateTenGodFromStem(dayMaster, hiddenStems.middle);
    result.push({
      type: middleType,
      typeHanja: TEN_GOD_HANJA[middleType],
      position,
      source: 'hiddenStem',
      stem: hiddenStems.middle,
      hiddenStemType: 'middle',
    });
  }

  // 여기
  if (hiddenStems.residual) {
    const residualType = calculateTenGodFromStem(dayMaster, hiddenStems.residual);
    result.push({
      type: residualType,
      typeHanja: TEN_GOD_HANJA[residualType],
      position,
      source: 'hiddenStem',
      stem: hiddenStems.residual,
      hiddenStemType: 'residual',
    });
  }

  return result;
}

/**
 * 기둥별 십신 계산
 */
function analyzePillarTenGods(
  dayMaster: HeavenlyStem,
  stem: HeavenlyStem,
  branch: EarthlyBranch,
  position: PillarPosition,
  isDay: boolean,
  school: HiddenStemSchool = 'standard'
): PillarTenGods {
  return {
    // 일간은 기준점이므로 null
    stem: isDay ? null : createStemTenGod(dayMaster, stem, position),
    branch: createBranchTenGod(dayMaster, branch, position, school),
    hiddenStems: createHiddenStemTenGods(dayMaster, branch, position, school),
  };
}

/**
 * 십신 개수 초기화
 */
function initTenGodCount(): TenGodCount {
  return {
    '비견': 0,
    '겁재': 0,
    '식신': 0,
    '상관': 0,
    '편재': 0,
    '정재': 0,
    '편관': 0,
    '정관': 0,
    '편인': 0,
    '정인': 0,
  };
}

/**
 * PillarTenGods에서 십신 개수 집계
 */
function countTenGodsFromPillar(pillar: PillarTenGods, count: TenGodCount): void {
  // 천간 (있는 경우)
  if (pillar.stem) {
    count[pillar.stem.type]++;
  }

  // 지지 본기
  count[pillar.branch.type]++;

  // 장간은 별도로 세지 않음 (본기와 중복되므로)
  // 필요시 옵션으로 추가 가능
}

/**
 * 가장 많이 나타나는 십신 찾기
 */
function findDominantTenGods(count: TenGodCount): TenGodType[] {
  const maxCount = Math.max(...Object.values(count));
  if (maxCount === 0) return [];

  return (Object.entries(count) as [TenGodType, number][])
    .filter(([, c]) => c === maxCount)
    .map(([type]) => type);
}

/**
 * 사주 전체 십신 분석
 * @param fourPillars 사주팔자
 * @param school 장간 유파 (기본: standard)
 * @returns 십신 분석 결과
 */
export function analyzeTenGods(
  fourPillars: FourPillars,
  school: HiddenStemSchool = 'standard'
): TenGodAnalysis {
  const dayMaster = fourPillars.day.stem;

  // 각 기둥별 십신 분석
  const year = analyzePillarTenGods(
    dayMaster,
    fourPillars.year.stem,
    fourPillars.year.branch,
    'year',
    false,
    school
  );

  const month = analyzePillarTenGods(
    dayMaster,
    fourPillars.month.stem,
    fourPillars.month.branch,
    'month',
    false,
    school
  );

  const day = analyzePillarTenGods(
    dayMaster,
    fourPillars.day.stem,
    fourPillars.day.branch,
    'day',
    true,  // 일간은 기준점
    school
  );

  const hour = analyzePillarTenGods(
    dayMaster,
    fourPillars.hour.stem,
    fourPillars.hour.branch,
    'hour',
    false,
    school
  );

  // 십신 개수 집계
  const count = initTenGodCount();
  countTenGodsFromPillar(year, count);
  countTenGodsFromPillar(month, count);
  countTenGodsFromPillar(day, count);
  countTenGodsFromPillar(hour, count);

  // 가장 많이 나타나는 십신
  const dominant = findDominantTenGods(count);

  return {
    year,
    month,
    day,
    hour,
    count,
    dominant,
    dayMaster,
  };
}

/**
 * 십신 요약 문자열 생성
 * 예: "비견 2, 식신 1, 정재 1, 정관 1, 정인 1"
 */
export function summarizeTenGods(analysis: TenGodAnalysis): string {
  return (Object.entries(analysis.count) as [TenGodType, number][])
    .filter(([, c]) => c > 0)
    .map(([type, c]) => `${type} ${c}`)
    .join(', ');
}
