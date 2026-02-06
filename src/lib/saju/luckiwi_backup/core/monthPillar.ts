/**
 * 월주(月柱) 계산 모듈
 * 절기 기준 월과 년간에 따른 월건법 적용
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
import { getSolarTermMonth, MONTH_TO_BRANCH_INDEX } from './solarTermResolver';
import { Pillar } from '../types';

/**
 * 년간별 정월(인월) 시작 천간 인덱스
 *
 * 월건법(月建法):
 * - 갑/기년: 병인월 시작 (병=2)
 * - 을/경년: 무인월 시작 (무=4)
 * - 병/신년: 경인월 시작 (경=6)
 * - 정/임년: 임인월 시작 (임=8)
 * - 무/계년: 갑인월 시작 (갑=0)
 */
const MONTH_STEM_START: Record<number, number> = {
  0: 2,  // 갑년 → 병인월
  1: 4,  // 을년 → 무인월
  2: 6,  // 병년 → 경인월
  3: 8,  // 정년 → 임인월
  4: 0,  // 무년 → 갑인월
  5: 2,  // 기년 → 병인월
  6: 4,  // 경년 → 무인월
  7: 6,  // 신년 → 경인월
  8: 8,  // 임년 → 임인월
  9: 0,  // 계년 → 갑인월
};

/**
 * 월주 계산
 *
 * @param yearStemIndex 년주 천간 인덱스 (0-9)
 * @param year 연도
 * @param month 월 (1-12)
 * @param day 일 (1-31)
 * @param hour 시 (0-23)
 * @param minute 분 (0-59)
 * @returns 월주 정보
 */
export function calculateMonthPillar(
  yearStemIndex: number,
  year: number,
  month: number,
  day: number,
  hour: number = 0,
  minute: number = 0
): Pillar {
  // 절기 기준 월 판정 (1=인월, 2=묘월, ..., 12=축월)
  const solarTermMonth = getSolarTermMonth(year, month, day, hour, minute);

  // 월지 인덱스 (인=2, 묘=3, ..., 자=0, 축=1)
  const branchIndex = MONTH_TO_BRANCH_INDEX[solarTermMonth];

  // 월간 계산: 년간 기준 월건법
  // 정월(인월) 시작 천간에서 월 수만큼 더함
  const startStem = MONTH_STEM_START[yearStemIndex];
  let stemIndex = (startStem + solarTermMonth - 1) % 10;
  if (stemIndex < 0) stemIndex += 10;

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
 * 해당 날짜의 절기력 월 조회 (1-12)
 */
export { getSolarTermMonth };
