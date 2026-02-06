/**
 * 행성 위치 계산 모듈
 */

import type {
  PlanetId,
  PlanetPosition,
  AstrologyMode,
  ZodiacSign,
} from '../types';
import {
  calculatePlanetPosition as calcFromEphemeris,
  HouseCalculationResult,
  isRetrograde,
} from './ephemeris';
import { getPlanetsForMode, getAllPointsForMode, PLANETS } from '../constants/planets';
import { longitudeToSignDegree } from '../constants/signs';

/**
 * 단일 행성 위치 계산
 */
export function calculateSinglePlanetPosition(
  julianDay: number,
  planetId: PlanetId,
  houseData?: HouseCalculationResult
): PlanetPosition {
  // ASC/MC는 하우스 데이터에서 가져옴
  if (planetId === 'ascendant' && houseData) {
    return createPlanetPosition('ascendant', houseData.ascendant, 0, 0, 1);
  }
  if (planetId === 'midheaven' && houseData) {
    return createPlanetPosition('midheaven', houseData.midheaven, 0, 0, 10);
  }

  // 일반 행성 계산
  const result = calcFromEphemeris(julianDay, planetId);

  if (result.error) {
    throw new Error(`Failed to calculate ${planetId}: ${result.error}`);
  }

  const signData = longitudeToSignDegree(result.longitude);
  const planetInfo = PLANETS[planetId];

  return {
    id: planetId,
    longitude: result.longitude,
    latitude: result.latitude,
    distance: result.distance,
    speed: result.speedLongitude,
    isRetrograde: isRetrograde(result.speedLongitude),
    sign: signData.sign,
    signDegree: signData.degree,
    signMinute: signData.minute,
    signSecond: signData.second,
  };
}

/**
 * 헬퍼: PlanetPosition 객체 생성
 */
function createPlanetPosition(
  id: PlanetId,
  longitude: number,
  latitude: number,
  speed: number,
  house?: number
): PlanetPosition {
  const signData = longitudeToSignDegree(longitude);

  return {
    id,
    longitude,
    latitude,
    distance: 0,
    speed,
    isRetrograde: speed < 0,
    sign: signData.sign,
    signDegree: signData.degree,
    signMinute: signData.minute,
    signSecond: signData.second,
    house,
  };
}

/**
 * 모드에 따른 모든 행성 위치 계산
 */
export function calculateAllPlanets(
  julianDay: number,
  mode: AstrologyMode,
  options: {
    includeLunarNodes?: boolean;
    includeChiron?: boolean;
    houseData?: HouseCalculationResult;
  } = {}
): PlanetPosition[] {
  const {
    includeLunarNodes = true,
    includeChiron = mode === 'modern',
    houseData,
  } = options;

  const planetIds = getAllPointsForMode(mode, { includeLunarNodes, includeChiron });
  const positions: PlanetPosition[] = [];

  for (const planetId of planetIds) {
    try {
      const position = calculateSinglePlanetPosition(julianDay, planetId, houseData);
      positions.push(position);
    } catch (error) {
      console.warn(`Warning: Could not calculate ${planetId}:`, error);
    }
  }

  // ASC와 MC 추가 (하우스 데이터가 있는 경우)
  if (houseData) {
    positions.push(calculateSinglePlanetPosition(julianDay, 'ascendant', houseData));
    positions.push(calculateSinglePlanetPosition(julianDay, 'midheaven', houseData));
  }

  return positions;
}

/**
 * 행성에 하우스 번호 할당
 */
export function assignHousesToPlanets(
  planets: PlanetPosition[],
  houseCusps: number[]
): PlanetPosition[] {
  return planets.map((planet) => ({
    ...planet,
    house: getHouseForLongitude(planet.longitude, houseCusps),
  }));
}

/**
 * 경도가 어느 하우스에 속하는지 계산
 */
export function getHouseForLongitude(longitude: number, cusps: number[]): number {
  const normalized = ((longitude % 360) + 360) % 360;

  for (let i = 0; i < 12; i++) {
    const currentCusp = cusps[i];
    const nextCusp = cusps[(i + 1) % 12];

    // 12하우스에서 1하우스로 넘어가는 경우 (0도를 넘는 경우)
    if (nextCusp < currentCusp) {
      if (normalized >= currentCusp || normalized < nextCusp) {
        return i + 1;
      }
    } else {
      if (normalized >= currentCusp && normalized < nextCusp) {
        return i + 1;
      }
    }
  }

  return 1; // 기본값
}

/**
 * 행성 분포 통계 계산
 */
export function calculatePlanetDistribution(planets: PlanetPosition[]): {
  byElement: Record<string, PlanetId[]>;
  byModality: Record<string, PlanetId[]>;
  byHouse: Record<number, PlanetId[]>;
  bySign: Record<ZodiacSign, PlanetId[]>;
} {
  const byElement: Record<string, PlanetId[]> = {
    fire: [],
    earth: [],
    air: [],
    water: [],
  };

  const byModality: Record<string, PlanetId[]> = {
    cardinal: [],
    fixed: [],
    mutable: [],
  };

  const byHouse: Record<number, PlanetId[]> = {};
  for (let i = 1; i <= 12; i++) {
    byHouse[i] = [];
  }

  const bySign: Record<ZodiacSign, PlanetId[]> = {} as Record<ZodiacSign, PlanetId[]>;

  const { SIGNS } = require('../constants/signs');

  for (const planet of planets) {
    // ASC/MC 제외
    if (planet.id === 'ascendant' || planet.id === 'midheaven') continue;

    const signInfo = SIGNS[planet.sign];
    if (!signInfo) continue;

    // 원소별
    byElement[signInfo.element].push(planet.id);

    // 성질별
    byModality[signInfo.modality].push(planet.id);

    // 하우스별
    if (planet.house) {
      byHouse[planet.house].push(planet.id);
    }

    // 사인별
    if (!bySign[planet.sign]) {
      bySign[planet.sign] = [];
    }
    bySign[planet.sign].push(planet.id);
  }

  return { byElement, byModality, byHouse, bySign };
}

/**
 * 행성 위치를 문자열로 포맷
 */
export function formatPlanetPosition(planet: PlanetPosition): string {
  const { SIGNS } = require('../constants/signs');
  const signInfo = SIGNS[planet.sign];
  const retrograde = planet.isRetrograde ? ' R' : '';

  return `${PLANETS[planet.id].nameKo}: ${signInfo.nameKo} ${planet.signDegree}°${planet.signMinute}'${planet.signSecond}"${retrograde}`;
}
