/**
 * 년주(年柱) 계산 모듈
 * 입춘 기준으로 년주 계산
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
import { isBeforeLichun } from './solarTermResolver';
import { Pillar } from '../types';

/**
 * 년주 계산
 *
 * 공식:
 * - 천간: (연도 - 4) % 10
 * - 지지: (연도 - 4) % 12
 * - 입춘 이전이면 전년도 기준
 *
 * @param year 연도
 * @param month 월 (1-12)
 * @param day 일 (1-31)
 * @param hour 시 (0-23)
 * @param minute 분 (0-59)
 * @returns 년주 정보
 */
export function calculateYearPillar(
  year: number,
  month: number,
  day: number,
  hour: number = 0,
  minute: number = 0
): Pillar {
  // 입춘 이전이면 전년도 기준
  let effectiveYear = year;
  if (isBeforeLichun(year, month, day, hour, minute)) {
    effectiveYear = year - 1;
  }

  // 천간, 지지 인덱스 계산
  // 서기 4년 = 갑자년 (stemIndex=0, branchIndex=0)
  let stemIndex = (effectiveYear - 4) % 10;
  let branchIndex = (effectiveYear - 4) % 12;

  // 음수 처리
  if (stemIndex < 0) stemIndex += 10;
  if (branchIndex < 0) branchIndex += 12;

  // 60갑자 인덱스
  const sexagenaryIndex = calculateSexagenaryIndex(stemIndex, branchIndex);

  return {
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
}

/**
 * 년주의 실제 적용 연도 조회 (입춘 기준)
 */
export function getEffectiveYear(
  year: number,
  month: number,
  day: number,
  hour: number = 0,
  minute: number = 0
): number {
  if (isBeforeLichun(year, month, day, hour, minute)) {
    return year - 1;
  }
  return year;
}
