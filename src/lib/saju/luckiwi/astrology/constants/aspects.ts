/**
 * 애스펙트 상수
 */

import type { AspectType, AspectOrb, AspectInfo, AspectNature } from '../types';

// 애스펙트 정보 테이블
export const ASPECTS: Record<AspectType, AspectInfo> = {
  // 메이저 애스펙트
  conjunction: {
    type: 'conjunction',
    name: 'Conjunction',
    nameKo: '합',
    symbol: '☌',
    angle: 0,
    nature: 'neutral', // 관련 행성에 따라 다름
    isMajor: true,
    keywords: ['융합', '통합', '강화', '시작'],
  },
  opposition: {
    type: 'opposition',
    name: 'Opposition',
    nameKo: '충',
    symbol: '☍',
    angle: 180,
    nature: 'challenging',
    isMajor: true,
    keywords: ['긴장', '대립', '균형', '인식'],
  },
  trine: {
    type: 'trine',
    name: 'Trine',
    nameKo: '삼합',
    symbol: '△',
    angle: 120,
    nature: 'harmonious',
    isMajor: true,
    keywords: ['조화', '흐름', '재능', '행운'],
  },
  square: {
    type: 'square',
    name: 'Square',
    nameKo: '사각',
    symbol: '□',
    angle: 90,
    nature: 'challenging',
    isMajor: true,
    keywords: ['긴장', '도전', '행동', '성장'],
  },
  sextile: {
    type: 'sextile',
    name: 'Sextile',
    nameKo: '육합',
    symbol: '⚹',
    angle: 60,
    nature: 'harmonious',
    isMajor: true,
    keywords: ['기회', '협력', '소통', '가능성'],
  },

  // 마이너 애스펙트
  quincunx: {
    type: 'quincunx',
    name: 'Quincunx',
    nameKo: '인컨정션',
    symbol: '⚻',
    angle: 150,
    nature: 'challenging',
    isMajor: false,
    keywords: ['조정', '불편함', '적응', '건강'],
  },
  semisextile: {
    type: 'semisextile',
    name: 'Semisextile',
    nameKo: '반육합',
    symbol: '⚺',
    angle: 30,
    nature: 'neutral',
    isMajor: false,
    keywords: ['미세조정', '연결', '성장'],
  },
  semisquare: {
    type: 'semisquare',
    name: 'Semisquare',
    nameKo: '반사각',
    symbol: '∠',
    angle: 45,
    nature: 'challenging',
    isMajor: false,
    keywords: ['자극', '마찰', '긴장'],
  },
  sesquiquadrate: {
    type: 'sesquiquadrate',
    name: 'Sesquiquadrate',
    nameKo: '1.5사각',
    symbol: '⚼',
    angle: 135,
    nature: 'challenging',
    isMajor: false,
    keywords: ['긴장', '조정 필요', '해결'],
  },
  quintile: {
    type: 'quintile',
    name: 'Quintile',
    nameKo: '오분',
    symbol: 'Q',
    angle: 72,
    nature: 'harmonious',
    isMajor: false,
    keywords: ['창조성', '재능', '영감'],
  },
  biquintile: {
    type: 'biquintile',
    name: 'Biquintile',
    nameKo: '이오분',
    symbol: 'bQ',
    angle: 144,
    nature: 'harmonious',
    isMajor: false,
    keywords: ['창조적 표현', '특별한 재능'],
  },
};

// 기본 오브 설정 (메이저)
export const DEFAULT_MAJOR_ORBS: Record<AspectType, number> = {
  conjunction: 10,
  opposition: 10,
  trine: 8,
  square: 8,
  sextile: 6,
  quincunx: 3,
  semisextile: 2,
  semisquare: 2,
  sesquiquadrate: 2,
  quintile: 2,
  biquintile: 2,
};

// 발광체 (태양/달) 오브 보너스
export const LUMINARY_ORB_BONUS = 2;

// 메이저 애스펙트 목록
export const MAJOR_ASPECTS: AspectType[] = ['conjunction', 'opposition', 'trine', 'square', 'sextile'];

// 마이너 애스펙트 목록
export const MINOR_ASPECTS: AspectType[] = [
  'quincunx',
  'semisextile',
  'semisquare',
  'sesquiquadrate',
  'quintile',
  'biquintile',
];

// 모든 애스펙트 (각도순)
export const ALL_ASPECTS_BY_ANGLE: AspectType[] = [
  'conjunction', // 0
  'semisextile', // 30
  'semisquare', // 45
  'sextile', // 60
  'quintile', // 72
  'square', // 90
  'trine', // 120
  'sesquiquadrate', // 135
  'biquintile', // 144
  'quincunx', // 150
  'opposition', // 180
];

// 오브 계산 함수
export function getAspectOrb(
  aspectType: AspectType,
  isLuminaryInvolved: boolean = false
): number {
  const baseOrb = DEFAULT_MAJOR_ORBS[aspectType];
  return isLuminaryInvolved ? baseOrb + LUMINARY_ORB_BONUS : baseOrb;
}

// 두 경도 사이의 애스펙트 찾기
export function findAspect(
  longitude1: number,
  longitude2: number,
  options: {
    includeMajor?: boolean;
    includeMinor?: boolean;
    isLuminaryInvolved?: boolean;
  } = {}
): { type: AspectType; orb: number; exact: number } | null {
  const { includeMajor = true, includeMinor = false, isLuminaryInvolved = false } = options;

  // 두 경도 사이의 각도 계산 (0-180)
  let diff = Math.abs(longitude1 - longitude2);
  if (diff > 180) {
    diff = 360 - diff;
  }

  // 검사할 애스펙트 목록
  const aspectsToCheck: AspectType[] = [];
  if (includeMajor) aspectsToCheck.push(...MAJOR_ASPECTS);
  if (includeMinor) aspectsToCheck.push(...MINOR_ASPECTS);

  // 각 애스펙트에 대해 오브 내에 있는지 확인
  for (const aspectType of aspectsToCheck) {
    const aspectInfo = ASPECTS[aspectType];
    const maxOrb = getAspectOrb(aspectType, isLuminaryInvolved);
    const orb = Math.abs(diff - aspectInfo.angle);

    if (orb <= maxOrb) {
      return {
        type: aspectType,
        orb,
        exact: aspectInfo.angle,
      };
    }
  }

  return null;
}
