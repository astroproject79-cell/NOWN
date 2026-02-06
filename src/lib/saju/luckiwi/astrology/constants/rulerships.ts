/**
 * 룰러십 (지배성) 상수
 */

import type { ZodiacSign, PlanetId, ClassicalPlanetId, AstrologyMode } from '../types';

// 고전 룰러십 (7행성)
export const CLASSICAL_RULERSHIPS: Record<ZodiacSign, ClassicalPlanetId> = {
  aries: 'mars',
  taurus: 'venus',
  gemini: 'mercury',
  cancer: 'moon',
  leo: 'sun',
  virgo: 'mercury',
  libra: 'venus',
  scorpio: 'mars', // 고전: 화성
  sagittarius: 'jupiter',
  capricorn: 'saturn',
  aquarius: 'saturn', // 고전: 토성
  pisces: 'jupiter', // 고전: 목성
};

// 현대 룰러십 (외행성 포함)
export const MODERN_RULERSHIPS: Record<ZodiacSign, PlanetId> = {
  aries: 'mars',
  taurus: 'venus',
  gemini: 'mercury',
  cancer: 'moon',
  leo: 'sun',
  virgo: 'mercury',
  libra: 'venus',
  scorpio: 'pluto', // 현대: 명왕성
  sagittarius: 'jupiter',
  capricorn: 'saturn',
  aquarius: 'uranus', // 현대: 천왕성
  pisces: 'neptune', // 현대: 해왕성
};

// 고양 (Exaltation) - 행성이 가장 강한 사인
export const EXALTATION: Partial<Record<PlanetId, ZodiacSign>> = {
  sun: 'aries',
  moon: 'taurus',
  mercury: 'virgo',
  venus: 'pisces',
  mars: 'capricorn',
  jupiter: 'cancer',
  saturn: 'libra',
  // 외행성 (논쟁 중)
  uranus: 'scorpio',
  neptune: 'leo',
  pluto: 'aries',
  northNode: 'gemini',
  southNode: 'sagittarius',
};

// 추락 (Fall) - 고양의 반대 사인
export const FALL: Partial<Record<PlanetId, ZodiacSign>> = {
  sun: 'libra',
  moon: 'scorpio',
  mercury: 'pisces',
  venus: 'virgo',
  mars: 'cancer',
  jupiter: 'capricorn',
  saturn: 'aries',
  uranus: 'taurus',
  neptune: 'aquarius',
  pluto: 'libra',
  northNode: 'sagittarius',
  southNode: 'gemini',
};

// 망 (Detriment) - 본좌의 반대 사인들
export const DETRIMENT: Partial<Record<PlanetId, ZodiacSign[]>> = {
  sun: ['aquarius'],
  moon: ['capricorn'],
  mercury: ['sagittarius', 'pisces'],
  venus: ['aries', 'scorpio'],
  mars: ['taurus', 'libra'],
  jupiter: ['gemini', 'virgo'],
  saturn: ['cancer', 'leo'],
  uranus: ['leo'],
  neptune: ['virgo'],
  pluto: ['taurus'],
};

// 모드에 따른 룰러 반환
export function getRulerForSign(sign: ZodiacSign, mode: AstrologyMode): PlanetId {
  return mode === 'classical' ? CLASSICAL_RULERSHIPS[sign] : MODERN_RULERSHIPS[sign];
}

// 행성의 본좌 사인들 반환
export function getDomicileForPlanet(planet: PlanetId, mode: AstrologyMode): ZodiacSign[] {
  const rulerships = mode === 'classical' ? CLASSICAL_RULERSHIPS : MODERN_RULERSHIPS;
  const domiciles: ZodiacSign[] = [];

  for (const [sign, ruler] of Object.entries(rulerships)) {
    if (ruler === planet) {
      domiciles.push(sign as ZodiacSign);
    }
  }

  return domiciles;
}

// 행성 품위 판단
export type DignityType = 'domicile' | 'exaltation' | 'detriment' | 'fall' | 'peregrine';

export function getPlanetDignity(
  planet: PlanetId,
  sign: ZodiacSign,
  mode: AstrologyMode
): DignityType {
  // 본좌 확인
  const domiciles = getDomicileForPlanet(planet, mode);
  if (domiciles.includes(sign)) {
    return 'domicile';
  }

  // 고양 확인
  if (EXALTATION[planet] === sign) {
    return 'exaltation';
  }

  // 망 확인
  if (DETRIMENT[planet]?.includes(sign)) {
    return 'detriment';
  }

  // 추락 확인
  if (FALL[planet] === sign) {
    return 'fall';
  }

  // 페리그린 (품위 없음)
  return 'peregrine';
}

// 품위 점수 (전통 점성학 기준)
export const DIGNITY_SCORES: Record<DignityType, number> = {
  domicile: 5, // 본좌
  exaltation: 4, // 고양
  peregrine: 0, // 페리그린
  detriment: -4, // 망
  fall: -5, // 추락
};
