/**
 * Swiss Ephemeris 래퍼
 *
 * sweph 라이브러리를 추상화하여 사용하기 쉬운 API 제공
 */

import * as sweph from 'sweph';
import type { PlanetId, HouseSystem } from '../types';
import { SWEPH_PLANET_IDS } from '../constants/planets';
import { HOUSE_SYSTEM_CODES } from '../types/houses';

const { constants, set_ephe_path, julday, revjul, calc, houses, sidtime } = sweph;

// 초기화 상태
let initialized = false;

/**
 * Swiss Ephemeris 초기화
 * @param ephePath 에페메리스 파일 경로 (기본: ./ephe 또는 환경변수)
 */
export function initializeEphemeris(ephePath?: string): void {
  if (initialized) return;

  const path = ephePath || process.env.EPHE_PATH || './ephe';
  set_ephe_path(path);
  initialized = true;
}

/**
 * 날짜를 율리우스 적일(Julian Day)로 변환
 */
export function dateToJulianDay(
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number,
  second: number = 0
): number {
  const ut = hour + minute / 60 + second / 3600;
  const result = julday(year, month, day, ut, constants.SE_GREG_CAL);
  return result;
}

/**
 * 율리우스 적일을 날짜로 변환
 */
export function julianDayToDate(jd: number): {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
} {
  const result = revjul(jd, constants.SE_GREG_CAL);
  const hours = result.hour;
  const hour = Math.floor(hours);
  const minutes = (hours - hour) * 60;
  const minute = Math.floor(minutes);
  const second = Math.round((minutes - minute) * 60);

  return {
    year: result.year,
    month: result.month,
    day: result.day,
    hour,
    minute,
    second,
  };
}

/**
 * 행성 위치 계산 결과
 */
export interface PlanetCalculationResult {
  longitude: number; // 황도 경도 (0-360)
  latitude: number; // 황도 위도
  distance: number; // 거리 (AU)
  speedLongitude: number; // 경도 속도 (도/일)
  speedLatitude: number; // 위도 속도
  speedDistance: number; // 거리 속도
  error?: string;
}

/**
 * 행성 위치 계산
 */
export function calculatePlanetPosition(
  julianDay: number,
  planetId: PlanetId
): PlanetCalculationResult {
  initializeEphemeris();

  const swephId = SWEPH_PLANET_IDS[planetId];

  // 남노드는 북노드에서 180도
  if (planetId === 'southNode') {
    const northNode = calculatePlanetPosition(julianDay, 'northNode');
    return {
      ...northNode,
      longitude: (northNode.longitude + 180) % 360,
    };
  }

  // ASC/MC는 하우스 계산에서 얻어야 함
  if (swephId < 0) {
    throw new Error(`Planet ${planetId} must be calculated from house cusps`);
  }

  const flags = constants.SEFLG_SPEED | constants.SEFLG_SWIEPH;

  try {
    const result = calc(julianDay, swephId, flags);

    if (result.flag < 0 || result.error) {
      // 에페메리스 파일 없이 Moshier 방식 사용
      const moshierFlags = constants.SEFLG_SPEED | constants.SEFLG_MOSEPH;
      const moshierResult = calc(julianDay, swephId, moshierFlags);

      return {
        longitude: moshierResult.data[0],
        latitude: moshierResult.data[1],
        distance: moshierResult.data[2],
        speedLongitude: moshierResult.data[3],
        speedLatitude: moshierResult.data[4],
        speedDistance: moshierResult.data[5],
      };
    }

    return {
      longitude: result.data[0],
      latitude: result.data[1],
      distance: result.data[2],
      speedLongitude: result.data[3],
      speedLatitude: result.data[4],
      speedDistance: result.data[5],
    };
  } catch (error) {
    // Fallback: Moshier
    const moshierFlags = constants.SEFLG_SPEED | constants.SEFLG_MOSEPH;
    const result = calc(julianDay, swephId, moshierFlags);

    return {
      longitude: result.data[0],
      latitude: result.data[1],
      distance: result.data[2],
      speedLongitude: result.data[3],
      speedLatitude: result.data[4],
      speedDistance: result.data[5],
    };
  }
}

/**
 * 하우스 계산 결과
 */
export interface HouseCalculationResult {
  cusps: number[]; // 12개 하우스 커스프 경도
  ascendant: number; // ASC 경도
  midheaven: number; // MC 경도
  armc: number; // ARMC (Sidereal Time in degrees)
  vertex: number; // Vertex
  equatorialAscendant: number; // Equatorial Ascendant
  coAscendantKoch: number; // Co-Ascendant (Koch)
  coAscendantMunkasey: number; // Co-Ascendant (Munkasey)
  polarAscendant: number; // Polar Ascendant
}

/**
 * 하우스 계산
 */
export function calculateHouses(
  julianDay: number,
  latitude: number,
  longitude: number,
  houseSystem: HouseSystem
): HouseCalculationResult {
  initializeEphemeris();

  const systemCode = HOUSE_SYSTEM_CODES[houseSystem];
  const result = houses(julianDay, latitude, longitude, systemCode);

  // houses 배열에서 12개 하우스 추출 (인덱스 0은 비어있음, 1-12 사용)
  const houseList = result.data.houses as number[];
  const cusps = houseList.slice(0, 12);

  // points 배열에서 주요 포인트 추출
  const points = result.data.points as number[];

  return {
    cusps,
    ascendant: points[0], // ASC
    midheaven: points[1], // MC
    armc: points[2], // ARMC
    vertex: points[3], // Vertex
    equatorialAscendant: points[4], // Equatorial Ascendant
    coAscendantKoch: points[5], // Co-Ascendant Koch
    coAscendantMunkasey: points[6], // Co-Ascendant Munkasey
    polarAscendant: points[7], // Polar Ascendant
  };
}

/**
 * 항성시 계산 (GMST - Greenwich Mean Sidereal Time)
 */
export function calculateSiderealTime(julianDay: number): number {
  initializeEphemeris();
  return sidtime(julianDay);
}

/**
 * 황도 경사각 계산
 */
export function calculateObliquity(julianDay: number): number {
  initializeEphemeris();

  const result = calc(julianDay, constants.SE_ECL_NUT, 0);
  return result.data[0]; // 첫 번째 값이 황도 경사각
}

/**
 * 태양 경도가 특정 값이 되는 시점 찾기 (솔라 리턴용)
 */
export function findSunReturnMoment(
  targetLongitude: number,
  startJd: number,
  tolerance: number = 0.0001
): number {
  initializeEphemeris();

  let jd = startJd;
  let iterations = 0;
  const maxIterations = 100;

  while (iterations < maxIterations) {
    const sunPos = calculatePlanetPosition(jd, 'sun');
    let diff = targetLongitude - sunPos.longitude;

    // 각도 차이 정규화 (-180 ~ 180)
    while (diff > 180) diff -= 360;
    while (diff < -180) diff += 360;

    if (Math.abs(diff) < tolerance) {
      return jd;
    }

    // 태양은 하루에 약 1도 이동
    const dayAdjustment = diff / sunPos.speedLongitude;
    jd += dayAdjustment;

    iterations++;
  }

  throw new Error('Could not find sun return moment within tolerance');
}

/**
 * 역행 여부 확인
 */
export function isRetrograde(speedLongitude: number): boolean {
  return speedLongitude < 0;
}

/**
 * 야간 차트 여부 (태양이 지평선 아래)
 *
 * 황도 기하학:
 * - ASC(상승점)에서 DSC(하강점)까지 반시계 방향 (IC 경유): 지평선 아래 (하우스 1-6)
 * - DSC에서 ASC까지 반시계 방향 (MC 경유): 지평선 위 (하우스 7-12)
 */
export function isNightChart(sunLongitude: number, ascendant: number): boolean {
  // 태양 위치를 ASC 기준으로 변환 (반시계 방향 거리)
  let sunFromAsc = sunLongitude - ascendant;
  if (sunFromAsc < 0) sunFromAsc += 360;

  // 0-180도: ASC → IC → DSC (지평선 아래, 하우스 1-6) = 야간
  // 180-360도: DSC → MC → ASC (지평선 위, 하우스 7-12) = 주간
  return sunFromAsc < 180;
}

/**
 * Swiss Ephemeris 버전 정보
 */
export function getEphemerisVersion(): string {
  return 'sweph-2.10.3';
}
