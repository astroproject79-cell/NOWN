/**
 * 육십갑자(六十甲子) - 60개의 간지 조합
 * 천간 10개와 지지 12개의 조합으로 60년/60일 주기
 */

import { HEAVENLY_STEMS, HEAVENLY_STEMS_HANJA, getStemByIndex } from './stems';
import { EARTHLY_BRANCHES, EARTHLY_BRANCHES_HANJA, getBranchByIndex } from './branches';

/** 60갑자 순서 (한글) */
export const SEXAGENARY_CYCLE = [
  '갑자', '을축', '병인', '정묘', '무진', '기사', '경오', '신미', '임신', '계유',
  '갑술', '을해', '병자', '정축', '무인', '기묘', '경진', '신사', '임오', '계미',
  '갑신', '을유', '병술', '정해', '무자', '기축', '경인', '신묘', '임진', '계사',
  '갑오', '을미', '병신', '정유', '무술', '기해', '경자', '신축', '임인', '계묘',
  '갑진', '을사', '병오', '정미', '무신', '기유', '경술', '신해', '임자', '계축',
  '갑인', '을묘', '병진', '정사', '무오', '기미', '경신', '신유', '임술', '계해',
] as const;

/** 60갑자 순서 (한자) */
export const SEXAGENARY_CYCLE_HANJA = [
  '甲子', '乙丑', '丙寅', '丁卯', '戊辰', '己巳', '庚午', '辛未', '壬申', '癸酉',
  '甲戌', '乙亥', '丙子', '丁丑', '戊寅', '己卯', '庚辰', '辛巳', '壬午', '癸未',
  '甲申', '乙酉', '丙戌', '丁亥', '戊子', '己丑', '庚寅', '辛卯', '壬辰', '癸巳',
  '甲午', '乙未', '丙申', '丁酉', '戊戌', '己亥', '庚子', '辛丑', '壬寅', '癸卯',
  '甲辰', '乙巳', '丙午', '丁未', '戊申', '己酉', '庚戌', '辛亥', '壬子', '癸丑',
  '甲寅', '乙卯', '丙辰', '丁巳', '戊午', '己未', '庚申', '辛酉', '壬戌', '癸亥',
] as const;

export type Sexagenary = typeof SEXAGENARY_CYCLE[number];
export type SexagenaryHanja = typeof SEXAGENARY_CYCLE_HANJA[number];

/** 60갑자 인덱스로 천간/지지 조회 */
export function getSexagenaryParts(index: number): { stem: string; branch: string; stemIndex: number; branchIndex: number } {
  const normalizedIndex = ((index % 60) + 60) % 60;
  const stemIndex = normalizedIndex % 10;
  const branchIndex = normalizedIndex % 12;

  return {
    stem: HEAVENLY_STEMS[stemIndex],
    branch: EARTHLY_BRANCHES[branchIndex],
    stemIndex,
    branchIndex,
  };
}

/** 60갑자 인덱스로 간지 문자열 조회 (한글) */
export function getSexagenaryByIndex(index: number): Sexagenary {
  const normalizedIndex = ((index % 60) + 60) % 60;
  return SEXAGENARY_CYCLE[normalizedIndex];
}

/** 60갑자 인덱스로 간지 문자열 조회 (한자) */
export function getSexagenaryHanjaByIndex(index: number): SexagenaryHanja {
  const normalizedIndex = ((index % 60) + 60) % 60;
  return SEXAGENARY_CYCLE_HANJA[normalizedIndex];
}

/** 간지 문자열로 인덱스 조회 */
export function getSexagenaryIndex(sexagenary: Sexagenary): number {
  return SEXAGENARY_CYCLE.indexOf(sexagenary);
}

/** 천간 인덱스와 지지 인덱스로 60갑자 인덱스 계산 */
export function calculateSexagenaryIndex(stemIndex: number, branchIndex: number): number {
  // 천간과 지지의 음양이 맞아야 유효한 조합
  // 갑자=0, 을축=1, ... 규칙 적용
  // 수학적으로: (6 * stemIndex - 5 * branchIndex) mod 60
  let index = (6 * stemIndex - 5 * branchIndex) % 60;
  if (index < 0) index += 60;
  return index;
}

/** 다음 60갑자 (순행) */
export function getNextSexagenary(index: number, step: number = 1): number {
  return ((index + step) % 60 + 60) % 60;
}

/** 이전 60갑자 (역행) */
export function getPrevSexagenary(index: number, step: number = 1): number {
  return ((index - step) % 60 + 60) % 60;
}
