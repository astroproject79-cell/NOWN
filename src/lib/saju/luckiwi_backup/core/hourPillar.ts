/**
 * 시주(時柱) 계산 모듈
 * 일간과 시지를 기반으로 시주 계산
 */

import {
  HEAVENLY_STEMS,
  HEAVENLY_STEMS_HANJA,
  EARTHLY_BRANCHES,
  EARTHLY_BRANCHES_HANJA,
  getBranchByHour,
  getBranchIndex,
  getSexagenaryByIndex,
  getSexagenaryHanjaByIndex,
  calculateSexagenaryIndex,
} from '../constants';
import { Pillar } from '../types';

/**
 * 시간(天干) 계산 공식
 *
 * 일간에 따른 자시(子時) 시작 천간:
 * - 갑/기일: 갑자시 (갑=0)
 * - 을/경일: 병자시 (병=2)
 * - 병/신일: 무자시 (무=4)
 * - 정/임일: 경자시 (경=6)
 * - 무/계일: 임자시 (임=8)
 */
const HOUR_STEM_START: Record<number, number> = {
  0: 0,  // 갑일 → 갑자시
  1: 2,  // 을일 → 병자시
  2: 4,  // 병일 → 무자시
  3: 6,  // 정일 → 경자시
  4: 8,  // 무일 → 임자시
  5: 0,  // 기일 → 갑자시
  6: 2,  // 경일 → 병자시
  7: 4,  // 신일 → 무자시
  8: 6,  // 임일 → 경자시
  9: 8,  // 계일 → 임자시
};

/**
 * 시주 계산
 *
 * @param dayStemIndex 일간 인덱스 (0-9)
 * @param hour 시 (0-23)
 * @returns 시주 정보
 */
export function calculateHourPillar(dayStemIndex: number, hour: number): Pillar {
  // 시지 결정 (2시간 단위)
  const branch = getBranchByHour(hour);
  const branchIndex = getBranchIndex(branch);

  // 시간 천간 계산
  // 자시 시작 천간에서 시지 인덱스만큼 더함
  const startStem = HOUR_STEM_START[dayStemIndex];
  let stemIndex = (startStem + branchIndex) % 10;
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
 * 시간으로 지지 조회
 */
export { getBranchByHour };
