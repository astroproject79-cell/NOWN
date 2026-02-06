/**
 * 태양 황경(Solar Longitude) 계산 모듈
 * Jean Meeus "Astronomical Algorithms" 기반
 */

// eslint-disable-next-line @typescript-eslint/no-var-requires
const Meeus = require('meeusjs');

/**
 * 특정 날짜시각의 태양 황경 계산
 *
 * @param date JavaScript Date 객체 (UTC 기준)
 * @returns 태양 황경 (0-360도)
 */
export function calculateSolarLongitude(date: Date): number {
  // Julian Day 계산
  const jd = new Meeus.JulianDay(date);

  // Julian century from J2000
  const T = jd.jdJ2000Century();

  // Apparent longitude (in radians)
  const longitudeRad = Meeus.Solar.apparentLongitude(T);

  // Convert to degrees
  let longitudeDeg = longitudeRad * 180 / Math.PI;

  // Normalize to 0-360
  longitudeDeg = ((longitudeDeg % 360) + 360) % 360;

  return longitudeDeg;
}

/**
 * 특정 Julian Day의 태양 황경 계산 (최적화 버전)
 *
 * @param jd Julian Day 객체
 * @returns 태양 황경 (0-360도)
 */
export function calculateSolarLongitudeFromJD(jd: unknown): number {
  // Julian century from J2000
  const T = (jd as { jdJ2000Century: () => number }).jdJ2000Century();

  // Apparent longitude (in radians)
  const longitudeRad = Meeus.Solar.apparentLongitude(T);

  // Convert to degrees
  let longitudeDeg = longitudeRad * 180 / Math.PI;

  // Normalize to 0-360
  longitudeDeg = ((longitudeDeg % 360) + 360) % 360;

  return longitudeDeg;
}

/**
 * 태양 황경이 특정 값이 되는 시점 찾기 (이진 탐색)
 *
 * @param targetLongitude 목표 황경 (0-360도)
 * @param startDate 탐색 시작 날짜
 * @param endDate 탐색 종료 날짜
 * @param precisionMinutes 정밀도 (분 단위, 기본 1분)
 * @returns 목표 황경 도달 시점 (UTC)
 */
export function findDateForSolarLongitude(
  targetLongitude: number,
  startDate: Date,
  endDate: Date,
  precisionMinutes: number = 1
): Date {
  const precisionMs = precisionMinutes * 60 * 1000;

  let low = startDate.getTime();
  let high = endDate.getTime();

  // Normalize target to 0-360
  targetLongitude = ((targetLongitude % 360) + 360) % 360;

  while (high - low > precisionMs) {
    const mid = Math.floor((low + high) / 2);
    const midDate = new Date(mid);
    const midLongitude = calculateSolarLongitude(midDate);

    // 황경 비교 (360도 경계 처리)
    const diff = angleDifference(midLongitude, targetLongitude);

    if (Math.abs(diff) < 0.01) {
      // 충분히 가까움
      return midDate;
    }

    // 황경은 증가 방향으로 진행 (동쪽으로 이동)
    // 단, 360->0 경계 주의
    if (diff < 0) {
      // midLongitude가 target보다 작음 -> 더 나중 시점 필요
      low = mid;
    } else {
      // midLongitude가 target보다 큼 -> 더 이전 시점 필요
      high = mid;
    }
  }

  // 최종 결과: 중간점 반환
  return new Date(Math.floor((low + high) / 2));
}

/**
 * 두 각도 사이의 차이 계산 (-180 ~ 180 범위)
 */
function angleDifference(angle1: number, angle2: number): number {
  let diff = angle1 - angle2;

  // Normalize to -180 ~ 180
  while (diff > 180) diff -= 360;
  while (diff < -180) diff += 360;

  return diff;
}

/**
 * meeusjs JulianDay 객체 생성
 */
export function createJulianDay(date: Date): unknown {
  return new Meeus.JulianDay(date);
}
