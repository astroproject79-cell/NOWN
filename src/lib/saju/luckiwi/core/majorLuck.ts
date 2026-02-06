/**
 * 대운(大運) 계산 모듈
 * 10년 단위로 변화하는 운의 흐름을 계산
 */

import {
  HEAVENLY_STEMS,
  HEAVENLY_STEMS_HANJA,
  EARTHLY_BRANCHES,
  EARTHLY_BRANCHES_HANJA,
  getSexagenaryByIndex,
  getSexagenaryHanjaByIndex,
  getNextSexagenary,
  getPrevSexagenary,
  isYangStem,
} from '../constants';
import { getNextMajorTerm, getPrevMajorTerm, createKSTDate } from './solarTermResolver';
import { Gender, Pillar, MajorLuck, MajorLuckPeriod } from '../types';

/**
 * 대운 순행/역행 판정
 *
 * - 양남(양년생 남자): 순행
 * - 음녀(음년생 여자): 순행
 * - 음남(음년생 남자): 역행
 * - 양녀(양년생 여자): 역행
 *
 * @param yearStemIndex 년간 인덱스 (0-9)
 * @param gender 성별
 * @returns 'forward' | 'backward'
 */
export function getLuckDirection(
  yearStemIndex: number,
  gender: Gender
): 'forward' | 'backward' {
  const isYangYear = isYangStem(HEAVENLY_STEMS[yearStemIndex]);

  if (gender === 'male') {
    return isYangYear ? 'forward' : 'backward';
  } else {
    return isYangYear ? 'backward' : 'forward';
  }
}

/**
 * 대운수(大運數) 계산 - 정운법
 *
 * - 순행: 출생일시 → 다음 절입일시까지 일수 / 3
 * - 역행: 이전 절입일시 → 출생일시까지 일수 / 3
 * - 나머지 0,1은 버림, 2는 올림
 *
 * @param year 출생 연도
 * @param month 출생 월
 * @param day 출생 일
 * @param hour 출생 시
 * @param minute 출생 분
 * @param direction 순행/역행
 * @returns 대운 시작 나이 (세는나이)
 */
export function calculateLuckStartAge(
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number,
  direction: 'forward' | 'backward'
): number {
  const birthDate = createKSTDate(year, month, day, hour, minute);

  let targetTerm;
  let daysDiff: number;

  if (direction === 'forward') {
    // 순행: 다음 절기까지
    targetTerm = getNextMajorTerm(year, month, day, hour, minute);
    if (!targetTerm) return 1; // 데이터 없으면 기본값

    daysDiff = Math.abs(
      (targetTerm.datetime.getTime() - birthDate.getTime()) / (1000 * 60 * 60 * 24)
    );
  } else {
    // 역행: 이전 절기까지
    targetTerm = getPrevMajorTerm(year, month, day, hour, minute);
    if (!targetTerm) return 1;

    daysDiff = Math.abs(
      (birthDate.getTime() - targetTerm.datetime.getTime()) / (1000 * 60 * 60 * 24)
    );
  }

  // 3일 = 1년 환산
  const years = daysDiff / 3;
  const remainder = years % 1;

  // 나머지 처리: 0.67(=2/3) 이상이면 올림
  if (remainder >= 0.67) {
    return Math.ceil(years);
  }
  return Math.floor(years);
}

/**
 * 60갑자 인덱스로 Pillar 생성
 */
function createPillarFromIndex(sexagenaryIndex: number): Pillar {
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

/**
 * 대운 계산
 *
 * @param monthPillarIndex 월주 60갑자 인덱스
 * @param yearStemIndex 년간 인덱스
 * @param birthYear 출생 연도
 * @param birthMonth 출생 월
 * @param birthDay 출생 일
 * @param birthHour 출생 시
 * @param birthMinute 출생 분
 * @param gender 성별
 * @param periodCount 대운 개수 (기본 10개 = 100년)
 * @returns 대운 정보
 */
export function calculateMajorLuck(
  monthPillarIndex: number,
  yearStemIndex: number,
  birthYear: number,
  birthMonth: number,
  birthDay: number,
  birthHour: number,
  birthMinute: number,
  gender: Gender,
  periodCount: number = 10
): MajorLuck {
  // 순행/역행 판정
  const direction = getLuckDirection(yearStemIndex, gender);

  // 대운 시작 나이 계산
  const startAge = calculateLuckStartAge(
    birthYear,
    birthMonth,
    birthDay,
    birthHour,
    birthMinute,
    direction
  );

  // 대운 목록 생성
  const periods: MajorLuckPeriod[] = [];
  let currentIndex = monthPillarIndex;

  for (let i = 0; i < periodCount; i++) {
    // 다음/이전 60갑자
    if (direction === 'forward') {
      currentIndex = getNextSexagenary(currentIndex);
    } else {
      currentIndex = getPrevSexagenary(currentIndex);
    }

    const age = startAge + i * 10;
    const year = birthYear + age - 1; // 세는나이 기준

    periods.push({
      pillar: createPillarFromIndex(currentIndex),
      startAge: age,
      endAge: age + 9,
      startYear: year,
      endYear: year + 9,
    });
  }

  return {
    direction,
    startAge,
    periods,
  };
}
