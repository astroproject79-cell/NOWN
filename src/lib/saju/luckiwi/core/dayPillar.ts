/**
 * 일주(日柱) 계산 모듈
 * 율리우스 적일을 기반으로 일주 계산
 */

import {
  HEAVENLY_STEMS,
  HEAVENLY_STEMS_HANJA,
  EARTHLY_BRANCHES,
  EARTHLY_BRANCHES_HANJA,
  getSexagenaryByIndex,
  getSexagenaryHanjaByIndex,
} from '../constants';
import { getDaysSince1900 } from './julian';
import { Pillar } from '../types';

/**
 * 일주 계산
 *
 * 기준일: 1900년 1월 1일 = 을해일(乙亥日), 60갑자 인덱스 11
 * (한국천문연구원 API 검증 완료)
 *
 * @param year 연도
 * @param month 월 (1-12)
 * @param day 일 (1-31)
 * @returns 일주 정보
 */
export function calculateDayPillar(year: number, month: number, day: number): Pillar {
  const daysSince1900 = getDaysSince1900(year, month, day);

  // 1900-01-01 = 을해일 (乙亥日), 60갑자 인덱스 11
  // 검증: 1993-01-19 = 경자 (KASI API 확인)
  const BASE_INDEX = 11;

  // 60갑자 인덱스 계산
  let sexagenaryIndex = (BASE_INDEX + daysSince1900) % 60;
  if (sexagenaryIndex < 0) sexagenaryIndex += 60;

  // 천간, 지지 인덱스
  const stemIndex = sexagenaryIndex % 10;
  const branchIndex = sexagenaryIndex % 12;

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
