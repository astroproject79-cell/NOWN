/**
 * 절기 판정 모듈
 * 24절기 데이터를 활용하여 년주/월주 계산에 필요한 절기 정보 제공
 */

import { loadSolarTerms } from '../data';
import { SolarTerm } from '../types';

/**
 * KST 기준 Date 객체 생성 헬퍼
 * 절기 데이터가 KST로 저장되어 있으므로 비교 시 동일한 시간대 사용
 */
export function createKSTDate(
  year: number,
  month: number,
  day: number,
  hour: number = 0,
  minute: number = 0
): Date {
  const monthStr = String(month).padStart(2, '0');
  const dayStr = String(day).padStart(2, '0');
  const hourStr = String(hour).padStart(2, '0');
  const minuteStr = String(minute).padStart(2, '0');
  return new Date(`${year}-${monthStr}-${dayStr}T${hourStr}:${minuteStr}:00+09:00`);
}

/**
 * 절입 절기 (월 구분 기준, 12개)
 * 각 월의 시작을 알리는 절기
 */
export const MAJOR_TERMS = [
  '입춘', '경칩', '청명', '입하', '망종', '소서',
  '입추', '백로', '한로', '입동', '대설', '소한',
] as const;

/**
 * 절기별 월 매핑 (절기력 기준 월)
 * 인월=1, 묘월=2, ..., 축월=12
 */
export const TERM_TO_MONTH: Record<string, number> = {
  '입춘': 1,  // 인월(寅月) 시작
  '경칩': 2,  // 묘월(卯月) 시작
  '청명': 3,  // 진월(辰月) 시작
  '입하': 4,  // 사월(巳月) 시작
  '망종': 5,  // 오월(午月) 시작
  '소서': 6,  // 미월(未月) 시작
  '입추': 7,  // 신월(申月) 시작
  '백로': 8,  // 유월(酉月) 시작
  '한로': 9,  // 술월(戌月) 시작
  '입동': 10, // 해월(亥月) 시작
  '대설': 11, // 자월(子月) 시작
  '소한': 12, // 축월(丑月) 시작
};

/**
 * 월별 지지 인덱스 (절기력 월 → 지지 인덱스)
 * 인월(1)=인(2), 묘월(2)=묘(3), ..., 축월(12)=축(1)
 */
export const MONTH_TO_BRANCH_INDEX: Record<number, number> = {
  1: 2,   // 인월 → 인(寅)
  2: 3,   // 묘월 → 묘(卯)
  3: 4,   // 진월 → 진(辰)
  4: 5,   // 사월 → 사(巳)
  5: 6,   // 오월 → 오(午)
  6: 7,   // 미월 → 미(未)
  7: 8,   // 신월 → 신(申)
  8: 9,   // 유월 → 유(酉)
  9: 10,  // 술월 → 술(戌)
  10: 11, // 해월 → 해(亥)
  11: 0,  // 자월 → 자(子)
  12: 1,  // 축월 → 축(丑)
};

/**
 * 특정 연도의 입춘 정보 조회
 */
export function getLichun(year: number): SolarTerm | null {
  const terms = loadSolarTerms(year);
  return terms.find(t => t.name === '입춘') || null;
}

/**
 * 입춘 이전인지 확인
 *
 * @param year 연도
 * @param month 월
 * @param day 일
 * @param hour 시
 * @param minute 분
 * @returns 입춘 이전이면 true
 */
export function isBeforeLichun(
  year: number,
  month: number,
  day: number,
  hour: number = 0,
  minute: number = 0
): boolean {
  const lichun = getLichun(year);

  if (!lichun) {
    // 데이터 없으면 2월 4일 기본값 사용
    return month < 2 || (month === 2 && day < 4);
  }

  const inputDate = createKSTDate(year, month, day, hour, minute);
  return inputDate < lichun.datetime;
}

/**
 * 해당 날짜의 절기력 월 반환 (1-12)
 * 인월=1, 묘월=2, ..., 축월=12
 *
 * @param year 연도
 * @param month 월
 * @param day 일
 * @param hour 시
 * @param minute 분
 * @returns 절기력 월 (1-12)
 */
export function getSolarTermMonth(
  year: number,
  month: number,
  day: number,
  hour: number = 0,
  minute: number = 0
): number {
  const inputDate = createKSTDate(year, month, day, hour, minute);

  // 현재 연도와 전년도 절기 데이터 로드
  const currentYearTerms = loadSolarTerms(year);
  const prevYearTerms = loadSolarTerms(year - 1);

  // 절입 절기만 필터링하고 시간순 정렬
  const allTerms = [...prevYearTerms, ...currentYearTerms]
    .filter(t => MAJOR_TERMS.includes(t.name as typeof MAJOR_TERMS[number]))
    .sort((a, b) => a.datetime.getTime() - b.datetime.getTime());

  // 현재 날짜가 속한 절기 구간 찾기 (역순 탐색)
  for (let i = allTerms.length - 1; i >= 0; i--) {
    if (inputDate >= allTerms[i].datetime) {
      return TERM_TO_MONTH[allTerms[i].name];
    }
  }

  // 기본값: 축월 (12)
  return 12;
}

/**
 * 다음 절입 절기 정보 조회
 *
 * @param year 연도
 * @param month 월
 * @param day 일
 * @param hour 시
 * @param minute 분
 * @returns 다음 절입 절기
 */
export function getNextMajorTerm(
  year: number,
  month: number,
  day: number,
  hour: number = 0,
  minute: number = 0
): SolarTerm | null {
  const inputDate = createKSTDate(year, month, day, hour, minute);

  // 현재 연도와 다음 연도 절기 데이터 로드
  const currentYearTerms = loadSolarTerms(year);
  const nextYearTerms = loadSolarTerms(year + 1);

  // 절입 절기만 필터링하고 시간순 정렬
  const allTerms = [...currentYearTerms, ...nextYearTerms]
    .filter(t => MAJOR_TERMS.includes(t.name as typeof MAJOR_TERMS[number]))
    .sort((a, b) => a.datetime.getTime() - b.datetime.getTime());

  // 현재 날짜 이후 첫 번째 절기 찾기
  for (const term of allTerms) {
    if (term.datetime > inputDate) {
      return term;
    }
  }

  return null;
}

/**
 * 이전 절입 절기 정보 조회
 *
 * @param year 연도
 * @param month 월
 * @param day 일
 * @param hour 시
 * @param minute 분
 * @returns 이전 절입 절기
 */
export function getPrevMajorTerm(
  year: number,
  month: number,
  day: number,
  hour: number = 0,
  minute: number = 0
): SolarTerm | null {
  const inputDate = createKSTDate(year, month, day, hour, minute);

  // 현재 연도와 전년도 절기 데이터 로드
  const currentYearTerms = loadSolarTerms(year);
  const prevYearTerms = loadSolarTerms(year - 1);

  // 절입 절기만 필터링하고 시간 역순 정렬
  const allTerms = [...prevYearTerms, ...currentYearTerms]
    .filter(t => MAJOR_TERMS.includes(t.name as typeof MAJOR_TERMS[number]))
    .sort((a, b) => b.datetime.getTime() - a.datetime.getTime());

  // 현재 날짜 이전 첫 번째 절기 찾기
  for (const term of allTerms) {
    if (term.datetime <= inputDate) {
      return term;
    }
  }

  return null;
}
