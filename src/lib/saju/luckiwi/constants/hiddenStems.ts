/**
 * 장간(藏干/지장간) 상수 정의
 *
 * 장간: 지지(地支) 안에 숨어있는 천간(天干)
 * - 본기(本氣): 주된 기운, 항상 존재
 * - 중기(中氣): 부수적 기운
 * - 여기(餘氣): 잔여 기운
 */

import { HeavenlyStem } from './stems';
import { EarthlyBranch } from './branches';
import { HiddenStemInfo, HiddenStemMap, HiddenStemSchool } from '../types/hiddenStem';

/**
 * 표준 장간 (자평명리학 일반)
 * 가장 널리 사용되는 장간 배치
 */
export const HIDDEN_STEMS_STANDARD: HiddenStemMap = {
  '자': { main: '계' },                               // 子: 癸
  '축': { main: '기', middle: '계', residual: '신' }, // 丑: 己癸辛
  '인': { main: '갑', middle: '병', residual: '무' }, // 寅: 甲丙戊
  '묘': { main: '을' },                               // 卯: 乙
  '진': { main: '무', middle: '을', residual: '계' }, // 辰: 戊乙癸
  '사': { main: '병', middle: '무', residual: '경' }, // 巳: 丙戊庚
  '오': { main: '정', middle: '기' },                 // 午: 丁己
  '미': { main: '기', middle: '정', residual: '을' }, // 未: 己丁乙
  '신': { main: '경', middle: '임', residual: '무' }, // 申: 庚壬戊
  '유': { main: '신' },                               // 酉: 辛
  '술': { main: '무', middle: '신', residual: '정' }, // 戌: 戊辛丁
  '해': { main: '임', middle: '갑' },                 // 亥: 壬甲
};

/**
 * 연해자평(淵海子平) 기준 장간
 * 일부 지지에서 차이가 있음
 */
export const HIDDEN_STEMS_YEONHAE: HiddenStemMap = {
  '자': { main: '계' },                               // 子: 癸
  '축': { main: '기', middle: '신', residual: '계' }, // 丑: 己辛癸 (순서 다름)
  '인': { main: '갑', middle: '병', residual: '무' }, // 寅: 甲丙戊
  '묘': { main: '을' },                               // 卯: 乙
  '진': { main: '무', middle: '계', residual: '을' }, // 辰: 戊癸乙 (순서 다름)
  '사': { main: '병', middle: '경', residual: '무' }, // 巳: 丙庚戊 (순서 다름)
  '오': { main: '정', middle: '기' },                 // 午: 丁己
  '미': { main: '기', middle: '을', residual: '정' }, // 未: 己乙丁 (순서 다름)
  '신': { main: '경', middle: '무', residual: '임' }, // 申: 庚戊壬 (순서 다름)
  '유': { main: '신' },                               // 酉: 辛
  '술': { main: '무', middle: '정', residual: '신' }, // 戌: 戊丁辛 (순서 다름)
  '해': { main: '임', middle: '갑' },                 // 亥: 壬甲
};

/**
 * 유파별 장간 데이터 맵
 */
export const HIDDEN_STEMS_BY_SCHOOL: Record<HiddenStemSchool, HiddenStemMap> = {
  'standard': HIDDEN_STEMS_STANDARD,
  'yeonhae': HIDDEN_STEMS_YEONHAE,
};

/**
 * 장간의 세기 비율 (가중치 계산용)
 * 본기가 가장 강하고, 여기가 가장 약함
 */
export const HIDDEN_STEM_STRENGTH = {
  main: 1.0,      // 본기: 100%
  middle: 0.7,    // 중기: 70%
  residual: 0.3,  // 여기: 30%
};

/**
 * 장간 조회 함수
 * @param branch 지지
 * @param school 유파 (기본: standard)
 * @returns 장간 정보
 */
export function getHiddenStems(
  branch: EarthlyBranch,
  school: HiddenStemSchool = 'standard'
): HiddenStemInfo {
  return HIDDEN_STEMS_BY_SCHOOL[school][branch];
}

/**
 * 장간을 배열로 반환 (본기, 중기, 여기 순서)
 * @param branch 지지
 * @param school 유파 (기본: standard)
 * @returns 천간 배열
 */
export function getHiddenStemsArray(
  branch: EarthlyBranch,
  school: HiddenStemSchool = 'standard'
): HeavenlyStem[] {
  const info = getHiddenStems(branch, school);
  const result: HeavenlyStem[] = [info.main];

  if (info.middle) {
    result.push(info.middle);
  }
  if (info.residual) {
    result.push(info.residual);
  }

  return result;
}

/**
 * 특정 천간이 지지의 장간에 포함되어 있는지 확인
 * @param stem 천간
 * @param branch 지지
 * @param school 유파 (기본: standard)
 * @returns 포함 여부
 */
export function hasHiddenStem(
  stem: HeavenlyStem,
  branch: EarthlyBranch,
  school: HiddenStemSchool = 'standard'
): boolean {
  const hiddenStems = getHiddenStemsArray(branch, school);
  return hiddenStems.includes(stem);
}

/**
 * 천간이 지지에서 통근(通根)하는지 확인
 * 통근: 천간이 지지의 장간에 같은 오행으로 뿌리를 내림
 * @param stem 천간
 * @param branch 지지
 * @param school 유파 (기본: standard)
 * @returns 통근 여부 및 강도
 */
export function checkRooting(
  stem: HeavenlyStem,
  branch: EarthlyBranch,
  school: HiddenStemSchool = 'standard'
): { hasRoot: boolean; strength: number } {
  const info = getHiddenStems(branch, school);

  if (info.main === stem) {
    return { hasRoot: true, strength: HIDDEN_STEM_STRENGTH.main };
  }
  if (info.middle === stem) {
    return { hasRoot: true, strength: HIDDEN_STEM_STRENGTH.middle };
  }
  if (info.residual === stem) {
    return { hasRoot: true, strength: HIDDEN_STEM_STRENGTH.residual };
  }

  return { hasRoot: false, strength: 0 };
}
