/**
 * 행성 상수
 */

import type { PlanetId, PlanetInfo, AstrologyMode, ClassicalPlanetId } from '../types';

// 행성 정보 테이블
export const PLANETS: Record<PlanetId, PlanetInfo> = {
  sun: {
    id: 'sun',
    name: 'Sun',
    nameKo: '태양',
    symbol: '☉',
    isClassical: true,
    isLuminary: true,
    isBenefic: true,
    domicile: ['leo'],
    exaltation: 'aries',
    detriment: ['aquarius'],
    fall: 'libra',
  },
  moon: {
    id: 'moon',
    name: 'Moon',
    nameKo: '달',
    symbol: '☽',
    isClassical: true,
    isLuminary: true,
    isBenefic: true,
    domicile: ['cancer'],
    exaltation: 'taurus',
    detriment: ['capricorn'],
    fall: 'scorpio',
  },
  mercury: {
    id: 'mercury',
    name: 'Mercury',
    nameKo: '수성',
    symbol: '☿',
    isClassical: true,
    isLuminary: false,
    isBenefic: null, // 중성
    domicile: ['gemini', 'virgo'],
    exaltation: 'virgo',
    detriment: ['sagittarius', 'pisces'],
    fall: 'pisces',
  },
  venus: {
    id: 'venus',
    name: 'Venus',
    nameKo: '금성',
    symbol: '♀',
    isClassical: true,
    isLuminary: false,
    isBenefic: true,
    domicile: ['taurus', 'libra'],
    exaltation: 'pisces',
    detriment: ['aries', 'scorpio'],
    fall: 'virgo',
  },
  mars: {
    id: 'mars',
    name: 'Mars',
    nameKo: '화성',
    symbol: '♂',
    isClassical: true,
    isLuminary: false,
    isBenefic: false, // 흉성
    domicile: ['aries', 'scorpio'],
    exaltation: 'capricorn',
    detriment: ['taurus', 'libra'],
    fall: 'cancer',
  },
  jupiter: {
    id: 'jupiter',
    name: 'Jupiter',
    nameKo: '목성',
    symbol: '♃',
    isClassical: true,
    isLuminary: false,
    isBenefic: true, // 대길성
    domicile: ['sagittarius', 'pisces'],
    exaltation: 'cancer',
    detriment: ['gemini', 'virgo'],
    fall: 'capricorn',
  },
  saturn: {
    id: 'saturn',
    name: 'Saturn',
    nameKo: '토성',
    symbol: '♄',
    isClassical: true,
    isLuminary: false,
    isBenefic: false, // 대흉성
    domicile: ['capricorn', 'aquarius'],
    exaltation: 'libra',
    detriment: ['cancer', 'leo'],
    fall: 'aries',
  },
  uranus: {
    id: 'uranus',
    name: 'Uranus',
    nameKo: '천왕성',
    symbol: '♅',
    isClassical: false,
    isLuminary: false,
    isBenefic: null,
    domicile: ['aquarius'],
    exaltation: 'scorpio',
    detriment: ['leo'],
    fall: 'taurus',
  },
  neptune: {
    id: 'neptune',
    name: 'Neptune',
    nameKo: '해왕성',
    symbol: '♆',
    isClassical: false,
    isLuminary: false,
    isBenefic: null,
    domicile: ['pisces'],
    exaltation: 'leo', // 일부 점성가 의견
    detriment: ['virgo'],
    fall: 'aquarius',
  },
  pluto: {
    id: 'pluto',
    name: 'Pluto',
    nameKo: '명왕성',
    symbol: '♇',
    isClassical: false,
    isLuminary: false,
    isBenefic: null,
    domicile: ['scorpio'],
    exaltation: 'aries', // 일부 점성가 의견
    detriment: ['taurus'],
    fall: 'libra',
  },
  northNode: {
    id: 'northNode',
    name: 'North Node',
    nameKo: '북노드',
    symbol: '☊',
    isClassical: true,
    isLuminary: false,
    isBenefic: true,
    domicile: [],
    detriment: [],
  },
  southNode: {
    id: 'southNode',
    name: 'South Node',
    nameKo: '남노드',
    symbol: '☋',
    isClassical: true,
    isLuminary: false,
    isBenefic: false,
    domicile: [],
    detriment: [],
  },
  chiron: {
    id: 'chiron',
    name: 'Chiron',
    nameKo: '카이론',
    symbol: '⚷',
    isClassical: false,
    isLuminary: false,
    isBenefic: null,
    domicile: ['virgo', 'sagittarius'], // 논쟁 중
    detriment: [],
  },
  ascendant: {
    id: 'ascendant',
    name: 'Ascendant',
    nameKo: '상승점',
    symbol: 'ASC',
    isClassical: true,
    isLuminary: false,
    isBenefic: null,
    domicile: [],
    detriment: [],
  },
  midheaven: {
    id: 'midheaven',
    name: 'Midheaven',
    nameKo: '천정',
    symbol: 'MC',
    isClassical: true,
    isLuminary: false,
    isBenefic: null,
    domicile: [],
    detriment: [],
  },
};

// 고전 행성 (7개)
export const CLASSICAL_PLANETS: ClassicalPlanetId[] = [
  'sun',
  'moon',
  'mercury',
  'venus',
  'mars',
  'jupiter',
  'saturn',
];

// 현대 행성 (10개 - 고전 + 외행성)
export const MODERN_PLANETS: PlanetId[] = [
  ...CLASSICAL_PLANETS,
  'uranus',
  'neptune',
  'pluto',
];

// 모드에 따른 행성 목록
export function getPlanetsForMode(mode: AstrologyMode): PlanetId[] {
  return mode === 'classical' ? [...CLASSICAL_PLANETS] : [...MODERN_PLANETS];
}

// 모드에 따른 전체 포인트 목록 (행성 + 노드 + 카이론)
export function getAllPointsForMode(
  mode: AstrologyMode,
  options: { includeLunarNodes?: boolean; includeChiron?: boolean } = {}
): PlanetId[] {
  const { includeLunarNodes = true, includeChiron = mode === 'modern' } = options;

  const points: PlanetId[] = getPlanetsForMode(mode);

  if (includeLunarNodes) {
    points.push('northNode', 'southNode');
  }

  if (includeChiron) {
    points.push('chiron');
  }

  return points;
}

// Swiss Ephemeris 행성 ID 매핑
export const SWEPH_PLANET_IDS: Record<PlanetId, number> = {
  sun: 0, // SE_SUN
  moon: 1, // SE_MOON
  mercury: 2, // SE_MERCURY
  venus: 3, // SE_VENUS
  mars: 4, // SE_MARS
  jupiter: 5, // SE_JUPITER
  saturn: 6, // SE_SATURN
  uranus: 7, // SE_URANUS
  neptune: 8, // SE_NEPTUNE
  pluto: 9, // SE_PLUTO
  northNode: 11, // SE_TRUE_NODE (True Node)
  southNode: -1, // 계산으로 도출 (북노드 + 180)
  chiron: 15, // SE_CHIRON
  ascendant: -2, // 하우스 계산에서 도출
  midheaven: -3, // 하우스 계산에서 도출
};
