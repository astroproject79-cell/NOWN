/**
 * 세운(歲運) 계산 모듈
 * 매년 변화하는 운의 흐름을 계산
 */

import {
  HEAVENLY_STEMS,
  HEAVENLY_STEMS_HANJA,
  EARTHLY_BRANCHES,
  EARTHLY_BRANCHES_HANJA,
  getSexagenaryByIndex,
  getSexagenaryHanjaByIndex,
  calculateSexagenaryIndex,
} from '../constants';
import { Pillar, YearlyLuck } from '../types';

/**
 * 특정 연도의 세운(연운) 계산
 *
 * 세운은 해당 연도의 년주와 동일
 * 공식:
 * - 천간: (연도 - 4) % 10
 * - 지지: (연도 - 4) % 12
 *
 * @param year 연도
 * @param birthYear 출생 연도
 * @returns 세운 정보
 */
export function calculateYearlyLuck(year: number, birthYear: number): YearlyLuck {
  // 천간, 지지 계산 (서기 4년 = 갑자년)
  let stemIndex = (year - 4) % 10;
  let branchIndex = (year - 4) % 12;

  if (stemIndex < 0) stemIndex += 10;
  if (branchIndex < 0) branchIndex += 12;

  const sexagenaryIndex = calculateSexagenaryIndex(stemIndex, branchIndex);

  const pillar: Pillar = {
    stem: HEAVENLY_STEMS[stemIndex],
    branch: EARTHLY_BRANCHES[branchIndex],
    stemHanja: HEAVENLY_STEMS_HANJA[stemIndex],
    branchHanja: EARTHLY_BRANCHES_HANJA[branchIndex],
    full: getSexagenaryByIndex(sexagenaryIndex),
    fullHanja: getSexagenaryHanjaByIndex(sexagenaryIndex),
    stemIndex,
    branchIndex,
    sexagenaryIndex,
  };

  // 세는나이 계산 (한국식)
  const age = year - birthYear + 1;

  return {
    year,
    age,
    pillar,
  };
}

/**
 * 여러 연도의 세운 계산
 *
 * @param startYear 시작 연도
 * @param endYear 끝 연도
 * @param birthYear 출생 연도
 * @returns 세운 목록
 */
export function calculateYearlyLuckRange(
  startYear: number,
  endYear: number,
  birthYear: number
): YearlyLuck[] {
  const result: YearlyLuck[] = [];

  for (let year = startYear; year <= endYear; year++) {
    result.push(calculateYearlyLuck(year, birthYear));
  }

  return result;
}

/**
 * 출생 연도부터 특정 연수까지의 세운 계산
 *
 * @param birthYear 출생 연도
 * @param years 연수 (기본 100년)
 * @returns 세운 목록
 */
export function calculateLifetimeYearlyLuck(
  birthYear: number,
  years: number = 100
): YearlyLuck[] {
  return calculateYearlyLuckRange(birthYear, birthYear + years - 1, birthYear);
}
