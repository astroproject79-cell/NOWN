/**
 * 하우스 계산 모듈
 */

import type { Houses, HouseCusp, HouseSystem, ZodiacSign } from '../types';
import { calculateHouses as calcFromEphemeris } from './ephemeris';
import { longitudeToSignDegree } from '../constants/signs';
import { HOUSE_SYSTEM_CODES } from '../types/houses';

/**
 * 하우스 계산
 */
export function calculateAllHouses(
  julianDay: number,
  latitude: number,
  longitude: number,
  houseSystem: HouseSystem
): Houses {
  // 극지방에서 Placidus 계산 실패 시 Whole Sign으로 폴백
  let result;
  let actualSystem = houseSystem;

  try {
    result = calcFromEphemeris(julianDay, latitude, longitude, houseSystem);
  } catch (error) {
    if (Math.abs(latitude) > 66 && houseSystem === 'placidus') {
      console.warn('Placidus calculation failed at high latitude, falling back to Whole Sign');
      actualSystem = 'whole_sign';
      result = calcFromEphemeris(julianDay, latitude, longitude, 'whole_sign');
    } else {
      throw error;
    }
  }

  // 커스프 정보 생성
  const cusps: HouseCusp[] = result.cusps.map((cusp, index) => {
    const signData = longitudeToSignDegree(cusp);
    return {
      house: index + 1,
      longitude: cusp,
      sign: signData.sign,
      signDegree: signData.degree,
      signMinute: signData.minute,
      signSecond: signData.second,
    };
  });

  return {
    system: actualSystem,
    cusps,
    ascendant: result.ascendant,
    midheaven: result.midheaven,
    descendant: (result.ascendant + 180) % 360,
    imumCoeli: (result.midheaven + 180) % 360,
    vertex: result.vertex,
    eastPoint: result.equatorialAscendant,
  };
}

/**
 * 하우스 커스프 경도 배열 추출
 */
export function getHouseCuspLongitudes(houses: Houses): number[] {
  return houses.cusps.map((cusp) => cusp.longitude);
}

/**
 * 특정 하우스의 사인 반환
 */
export function getHouseSign(houses: Houses, houseNumber: number): ZodiacSign {
  if (houseNumber < 1 || houseNumber > 12) {
    throw new Error(`Invalid house number: ${houseNumber}`);
  }
  return houses.cusps[houseNumber - 1].sign;
}

/**
 * 하우스 크기 계산 (도수)
 */
export function getHouseSize(houses: Houses, houseNumber: number): number {
  if (houseNumber < 1 || houseNumber > 12) {
    throw new Error(`Invalid house number: ${houseNumber}`);
  }

  const currentCusp = houses.cusps[houseNumber - 1].longitude;
  const nextCusp = houses.cusps[houseNumber % 12].longitude;

  let size = nextCusp - currentCusp;
  if (size < 0) size += 360;

  return size;
}

/**
 * 모든 하우스 크기 계산
 */
export function getAllHouseSizes(houses: Houses): number[] {
  return houses.cusps.map((_, index) => getHouseSize(houses, index + 1));
}

/**
 * 가로채기 사인 (Intercepted Signs) 찾기
 * 하우스 안에 완전히 포함되어 커스프에 나타나지 않는 사인
 */
export function findInterceptedSigns(houses: Houses): ZodiacSign[] {
  const cuspSigns = new Set(houses.cusps.map((cusp) => cusp.sign));
  const allSigns: ZodiacSign[] = [
    'aries',
    'taurus',
    'gemini',
    'cancer',
    'leo',
    'virgo',
    'libra',
    'scorpio',
    'sagittarius',
    'capricorn',
    'aquarius',
    'pisces',
  ];

  return allSigns.filter((sign) => !cuspSigns.has(sign));
}

/**
 * 하우스 시스템 이름 반환
 */
export function getHouseSystemName(system: HouseSystem): string {
  const names: Record<HouseSystem, string> = {
    placidus: 'Placidus',
    whole_sign: 'Whole Sign',
    koch: 'Koch',
    equal: 'Equal House',
    regiomontanus: 'Regiomontanus',
    campanus: 'Campanus',
    porphyry: 'Porphyry',
  };
  return names[system];
}

/**
 * 하우스 시스템 한글 이름 반환
 */
export function getHouseSystemNameKo(system: HouseSystem): string {
  const names: Record<HouseSystem, string> = {
    placidus: '플라시두스',
    whole_sign: '홀 사인',
    koch: '코흐',
    equal: '이퀄',
    regiomontanus: '레기오몬타누스',
    campanus: '캄파누스',
    porphyry: '포르피리',
  };
  return names[system];
}

/**
 * 하우스 커스프 포맷
 */
export function formatHouseCusp(cusp: HouseCusp): string {
  const { SIGNS } = require('../constants/signs');
  const signInfo = SIGNS[cusp.sign];

  return `${cusp.house}하우스: ${signInfo.nameKo} ${cusp.signDegree}°${cusp.signMinute}'`;
}

/**
 * 하우스 요약 정보
 */
export interface HousesSummary {
  ascendantSign: ZodiacSign;
  midheavenSign: ZodiacSign;
  interceptedSigns: ZodiacSign[];
  largestHouse: { house: number; size: number };
  smallestHouse: { house: number; size: number };
}

export function getHousesSummary(houses: Houses): HousesSummary {
  const sizes = getAllHouseSizes(houses);
  const maxSize = Math.max(...sizes);
  const minSize = Math.min(...sizes);

  return {
    ascendantSign: getHouseSign(houses, 1),
    midheavenSign: getHouseSign(houses, 10),
    interceptedSigns: findInterceptedSigns(houses),
    largestHouse: { house: sizes.indexOf(maxSize) + 1, size: maxSize },
    smallestHouse: { house: sizes.indexOf(minSize) + 1, size: minSize },
  };
}
