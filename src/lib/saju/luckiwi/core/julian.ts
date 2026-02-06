/**
 * 율리우스 적일(Julian Day) 계산
 * 날짜를 연속적인 숫자로 변환하여 날짜 간 계산을 용이하게 함
 */

/**
 * 그레고리력 날짜를 율리우스 적일(JD)로 변환
 *
 * @param year 연도
 * @param month 월 (1-12)
 * @param day 일 (1-31)
 * @returns 율리우스 적일 (정수)
 */
export function toJulianDay(year: number, month: number, day: number): number {
  // 1월, 2월은 전년도 13월, 14월로 취급
  let y = year;
  let m = month;

  if (m <= 2) {
    y -= 1;
    m += 12;
  }

  // 그레고리력 보정 (1582년 10월 15일 이후)
  const A = Math.floor(y / 100);
  const B = 2 - A + Math.floor(A / 4);

  // 율리우스 적일 계산
  const JD = Math.floor(365.25 * (y + 4716)) +
             Math.floor(30.6001 * (m + 1)) +
             day + B - 1524.5;

  return Math.floor(JD);
}

/**
 * 1900년 1월 1일 기준 일수 차이 계산
 * 1900-01-01 = 을해일(乙亥日), 60갑자 인덱스 11
 *
 * @param year 연도
 * @param month 월 (1-12)
 * @param day 일 (1-31)
 * @returns 1900-01-01 기준 일수 차이
 */
export function getDaysSince1900(year: number, month: number, day: number): number {
  const JD_1900_01_01 = 2415021; // 1900년 1월 1일의 JD
  const currentJD = toJulianDay(year, month, day);
  return currentJD - JD_1900_01_01;
}

/**
 * 율리우스 적일을 그레고리력 날짜로 변환
 *
 * @param jd 율리우스 적일
 * @returns { year, month, day }
 */
export function fromJulianDay(jd: number): { year: number; month: number; day: number } {
  const Z = Math.floor(jd + 0.5);
  const F = (jd + 0.5) - Z;

  let A: number;
  if (Z < 2299161) {
    A = Z;
  } else {
    const alpha = Math.floor((Z - 1867216.25) / 36524.25);
    A = Z + 1 + alpha - Math.floor(alpha / 4);
  }

  const B = A + 1524;
  const C = Math.floor((B - 122.1) / 365.25);
  const D = Math.floor(365.25 * C);
  const E = Math.floor((B - D) / 30.6001);

  const day = B - D - Math.floor(30.6001 * E) + F;
  const month = E < 14 ? E - 1 : E - 13;
  const year = month > 2 ? C - 4716 : C - 4715;

  return {
    year: Math.floor(year),
    month: Math.floor(month),
    day: Math.floor(day),
  };
}

/**
 * 두 날짜 사이의 일수 차이 계산
 */
export function daysBetween(
  year1: number, month1: number, day1: number,
  year2: number, month2: number, day2: number
): number {
  return toJulianDay(year2, month2, day2) - toJulianDay(year1, month1, day1);
}
