/**
 * 12궁 (조디악 사인) 상수
 */

import type { ZodiacSign, SignInfo, Element, Modality, Polarity } from '../types';

// 12궁 정보 테이블
export const SIGNS: Record<ZodiacSign, SignInfo> = {
  aries: {
    id: 'aries',
    index: 0,
    name: 'Aries',
    nameKo: '양자리',
    symbol: '♈',
    unicode: '\u2648',
    element: 'fire',
    modality: 'cardinal',
    polarity: 'positive',
    startDegree: 0,
    endDegree: 30,
    classicalRuler: 'mars',
  },
  taurus: {
    id: 'taurus',
    index: 1,
    name: 'Taurus',
    nameKo: '황소자리',
    symbol: '♉',
    unicode: '\u2649',
    element: 'earth',
    modality: 'fixed',
    polarity: 'negative',
    startDegree: 30,
    endDegree: 60,
    classicalRuler: 'venus',
  },
  gemini: {
    id: 'gemini',
    index: 2,
    name: 'Gemini',
    nameKo: '쌍둥이자리',
    symbol: '♊',
    unicode: '\u264A',
    element: 'air',
    modality: 'mutable',
    polarity: 'positive',
    startDegree: 60,
    endDegree: 90,
    classicalRuler: 'mercury',
  },
  cancer: {
    id: 'cancer',
    index: 3,
    name: 'Cancer',
    nameKo: '게자리',
    symbol: '♋',
    unicode: '\u264B',
    element: 'water',
    modality: 'cardinal',
    polarity: 'negative',
    startDegree: 90,
    endDegree: 120,
    classicalRuler: 'moon',
  },
  leo: {
    id: 'leo',
    index: 4,
    name: 'Leo',
    nameKo: '사자자리',
    symbol: '♌',
    unicode: '\u264C',
    element: 'fire',
    modality: 'fixed',
    polarity: 'positive',
    startDegree: 120,
    endDegree: 150,
    classicalRuler: 'sun',
  },
  virgo: {
    id: 'virgo',
    index: 5,
    name: 'Virgo',
    nameKo: '처녀자리',
    symbol: '♍',
    unicode: '\u264D',
    element: 'earth',
    modality: 'mutable',
    polarity: 'negative',
    startDegree: 150,
    endDegree: 180,
    classicalRuler: 'mercury',
  },
  libra: {
    id: 'libra',
    index: 6,
    name: 'Libra',
    nameKo: '천칭자리',
    symbol: '♎',
    unicode: '\u264E',
    element: 'air',
    modality: 'cardinal',
    polarity: 'positive',
    startDegree: 180,
    endDegree: 210,
    classicalRuler: 'venus',
  },
  scorpio: {
    id: 'scorpio',
    index: 7,
    name: 'Scorpio',
    nameKo: '전갈자리',
    symbol: '♏',
    unicode: '\u264F',
    element: 'water',
    modality: 'fixed',
    polarity: 'negative',
    startDegree: 210,
    endDegree: 240,
    classicalRuler: 'mars',
    modernRuler: 'pluto',
  },
  sagittarius: {
    id: 'sagittarius',
    index: 8,
    name: 'Sagittarius',
    nameKo: '사수자리',
    symbol: '♐',
    unicode: '\u2650',
    element: 'fire',
    modality: 'mutable',
    polarity: 'positive',
    startDegree: 240,
    endDegree: 270,
    classicalRuler: 'jupiter',
  },
  capricorn: {
    id: 'capricorn',
    index: 9,
    name: 'Capricorn',
    nameKo: '염소자리',
    symbol: '♑',
    unicode: '\u2651',
    element: 'earth',
    modality: 'cardinal',
    polarity: 'negative',
    startDegree: 270,
    endDegree: 300,
    classicalRuler: 'saturn',
  },
  aquarius: {
    id: 'aquarius',
    index: 10,
    name: 'Aquarius',
    nameKo: '물병자리',
    symbol: '♒',
    unicode: '\u2652',
    element: 'air',
    modality: 'fixed',
    polarity: 'positive',
    startDegree: 300,
    endDegree: 330,
    classicalRuler: 'saturn',
    modernRuler: 'uranus',
  },
  pisces: {
    id: 'pisces',
    index: 11,
    name: 'Pisces',
    nameKo: '물고기자리',
    symbol: '♓',
    unicode: '\u2653',
    element: 'water',
    modality: 'mutable',
    polarity: 'negative',
    startDegree: 330,
    endDegree: 360,
    classicalRuler: 'jupiter',
    modernRuler: 'neptune',
  },
};

// 사인 배열 (인덱스 순)
export const SIGN_ORDER: ZodiacSign[] = [
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

// 원소별 사인 그룹
export const SIGNS_BY_ELEMENT: Record<Element, ZodiacSign[]> = {
  fire: ['aries', 'leo', 'sagittarius'],
  earth: ['taurus', 'virgo', 'capricorn'],
  air: ['gemini', 'libra', 'aquarius'],
  water: ['cancer', 'scorpio', 'pisces'],
};

// 성질별 사인 그룹
export const SIGNS_BY_MODALITY: Record<Modality, ZodiacSign[]> = {
  cardinal: ['aries', 'cancer', 'libra', 'capricorn'],
  fixed: ['taurus', 'leo', 'scorpio', 'aquarius'],
  mutable: ['gemini', 'virgo', 'sagittarius', 'pisces'],
};

// 음양별 사인 그룹
export const SIGNS_BY_POLARITY: Record<Polarity, ZodiacSign[]> = {
  positive: ['aries', 'gemini', 'leo', 'libra', 'sagittarius', 'aquarius'],
  negative: ['taurus', 'cancer', 'virgo', 'scorpio', 'capricorn', 'pisces'],
};

// 경도를 사인으로 변환
export function longitudeToSign(longitude: number): ZodiacSign {
  const normalized = ((longitude % 360) + 360) % 360;
  const index = Math.floor(normalized / 30);
  return SIGN_ORDER[index];
}

// 경도를 사인 내 도수로 변환
export function longitudeToSignDegree(longitude: number): {
  sign: ZodiacSign;
  degree: number;
  minute: number;
  second: number;
} {
  const normalized = ((longitude % 360) + 360) % 360;
  const signIndex = Math.floor(normalized / 30);
  const signDegree = normalized % 30;
  const degree = Math.floor(signDegree);
  const minuteFloat = (signDegree - degree) * 60;
  const minute = Math.floor(minuteFloat);
  const second = Math.round((minuteFloat - minute) * 60);

  return {
    sign: SIGN_ORDER[signIndex],
    degree,
    minute,
    second,
  };
}
