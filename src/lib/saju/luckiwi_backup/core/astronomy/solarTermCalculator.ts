/**
 * 24절기 날짜 계산 모듈
 * 태양 황경 기반으로 24절기 시각을 계산
 */

import { SolarTerm } from '../../types';
import { findDateForSolarLongitude } from './solarLongitude';

/**
 * 24절기 정보 (절기명, 태양 황경)
 * 황경은 춘분(0°)을 기준으로 증가
 */
export const SOLAR_TERMS_INFO: Array<{ name: string; longitude: number }> = [
  // 춘분(0°)부터 시작하여 15° 간격
  { name: '춘분', longitude: 0 },     // 3월
  { name: '청명', longitude: 15 },    // 4월
  { name: '곡우', longitude: 30 },    // 4월
  { name: '입하', longitude: 45 },    // 5월
  { name: '소만', longitude: 60 },    // 5월
  { name: '망종', longitude: 75 },    // 6월
  { name: '하지', longitude: 90 },    // 6월
  { name: '소서', longitude: 105 },   // 7월
  { name: '대서', longitude: 120 },   // 7월
  { name: '입추', longitude: 135 },   // 8월
  { name: '처서', longitude: 150 },   // 8월
  { name: '백로', longitude: 165 },   // 9월
  { name: '추분', longitude: 180 },   // 9월
  { name: '한로', longitude: 195 },   // 10월
  { name: '상강', longitude: 210 },   // 10월
  { name: '입동', longitude: 225 },   // 11월
  { name: '소설', longitude: 240 },   // 11월
  { name: '대설', longitude: 255 },   // 12월
  { name: '동지', longitude: 270 },   // 12월
  { name: '소한', longitude: 285 },   // 1월
  { name: '대한', longitude: 300 },   // 1월
  { name: '입춘', longitude: 315 },   // 2월
  { name: '우수', longitude: 330 },   // 2월
  { name: '경칩', longitude: 345 },   // 3월
];

/**
 * 절기별 대략적인 발생 월 (탐색 범위 최적화용)
 */
const TERM_APPROXIMATE_MONTH: Record<string, number> = {
  '소한': 1,
  '대한': 1,
  '입춘': 2,
  '우수': 2,
  '경칩': 3,
  '춘분': 3,
  '청명': 4,
  '곡우': 4,
  '입하': 5,
  '소만': 5,
  '망종': 6,
  '하지': 6,
  '소서': 7,
  '대서': 7,
  '입추': 8,
  '처서': 8,
  '백로': 9,
  '추분': 9,
  '한로': 10,
  '상강': 10,
  '입동': 11,
  '소설': 11,
  '대설': 12,
  '동지': 12,
};

/**
 * 특정 연도의 24절기 계산
 *
 * @param year 연도
 * @returns 24절기 배열 (시간순 정렬)
 */
export function calculateSolarTerms(year: number): SolarTerm[] {
  const terms: SolarTerm[] = [];

  for (const termInfo of SOLAR_TERMS_INFO) {
    const month = TERM_APPROXIMATE_MONTH[termInfo.name];

    // 탐색 범위: 해당 월 ±15일
    let searchYear = year;

    // 소한, 대한은 연초에 발생하지만 전년도 동지(12월) 이후
    // 특별 처리 필요 없음 - year 그대로 사용

    const startDate = new Date(Date.UTC(searchYear, month - 1 - 1, 15));  // 전월 15일
    const endDate = new Date(Date.UTC(searchYear, month - 1 + 1, 15));    // 다음월 15일

    // 이진탐색으로 정확한 시각 찾기
    const termDateUTC = findDateForSolarLongitude(
      termInfo.longitude,
      startDate,
      endDate,
      1  // 1분 정밀도
    );

    // UTC -> KST 변환 (한국 시간 기준)
    const termDateKST = new Date(termDateUTC.getTime() + 9 * 60 * 60 * 1000);

    // 날짜/시간 포맷팅 (KST 기준)
    const kstYear = termDateKST.getUTCFullYear();
    const kstMonth = termDateKST.getUTCMonth() + 1;
    const kstDay = termDateKST.getUTCDate();
    const kstHour = termDateKST.getUTCHours();
    const kstMinute = termDateKST.getUTCMinutes();

    const dateStr = `${kstYear}-${String(kstMonth).padStart(2, '0')}-${String(kstDay).padStart(2, '0')}`;
    const timeStr = `${String(kstHour).padStart(2, '0')}:${String(kstMinute).padStart(2, '0')}`;

    terms.push({
      name: termInfo.name,
      date: dateStr,
      time: timeStr,
      datetime: new Date(kstYear, kstMonth - 1, kstDay, kstHour, kstMinute),
    });
  }

  // 시간순 정렬
  terms.sort((a, b) => a.datetime.getTime() - b.datetime.getTime());

  return terms;
}

/**
 * 특정 절기의 날짜만 계산
 *
 * @param termName 절기명 (예: "입춘")
 * @param year 연도
 * @returns 절기 정보 또는 null
 */
export function calculateSingleSolarTerm(
  termName: string,
  year: number
): SolarTerm | null {
  const termInfo = SOLAR_TERMS_INFO.find(t => t.name === termName);
  if (!termInfo) return null;

  const month = TERM_APPROXIMATE_MONTH[termName];
  const startDate = new Date(Date.UTC(year, month - 1 - 1, 15));
  const endDate = new Date(Date.UTC(year, month - 1 + 1, 15));

  const termDateUTC = findDateForSolarLongitude(
    termInfo.longitude,
    startDate,
    endDate,
    1
  );

  // UTC -> KST 변환
  const termDateKST = new Date(termDateUTC.getTime() + 9 * 60 * 60 * 1000);

  const kstYear = termDateKST.getUTCFullYear();
  const kstMonth = termDateKST.getUTCMonth() + 1;
  const kstDay = termDateKST.getUTCDate();
  const kstHour = termDateKST.getUTCHours();
  const kstMinute = termDateKST.getUTCMinutes();

  const dateStr = `${kstYear}-${String(kstMonth).padStart(2, '0')}-${String(kstDay).padStart(2, '0')}`;
  const timeStr = `${String(kstHour).padStart(2, '0')}:${String(kstMinute).padStart(2, '0')}`;

  return {
    name: termInfo.name,
    date: dateStr,
    time: timeStr,
    datetime: new Date(kstYear, kstMonth - 1, kstDay, kstHour, kstMinute),
  };
}

/**
 * 캐시된 절기 계산 (성능 최적화)
 */
const calculatedTermsCache: Map<number, SolarTerm[]> = new Map();

/**
 * 절기 계산 (캐시 사용)
 */
export function calculateSolarTermsCached(year: number): SolarTerm[] {
  if (calculatedTermsCache.has(year)) {
    return calculatedTermsCache.get(year)!;
  }

  const terms = calculateSolarTerms(year);
  calculatedTermsCache.set(year, terms);

  return terms;
}
