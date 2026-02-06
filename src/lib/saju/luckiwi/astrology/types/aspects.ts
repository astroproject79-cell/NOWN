/**
 * 애스펙트 (행성 각도) 타입 정의
 */

import type { PlanetId } from './planets';

// 메이저 애스펙트
export type MajorAspectType =
  | 'conjunction' // 0도 (합)
  | 'opposition' // 180도 (충)
  | 'trine' // 120도 (삼합)
  | 'square' // 90도 (사각)
  | 'sextile'; // 60도 (육합)

// 마이너 애스펙트
export type MinorAspectType =
  | 'quincunx' // 150도 (인컨정션)
  | 'semisextile' // 30도 (반육합)
  | 'semisquare' // 45도 (반사각)
  | 'sesquiquadrate' // 135도 (1.5사각)
  | 'quintile' // 72도 (오분)
  | 'biquintile'; // 144도 (이오분)

// 모든 애스펙트 타입
export type AspectType = MajorAspectType | MinorAspectType;

// 애스펙트 성격
export type AspectNature = 'harmonious' | 'challenging' | 'neutral';

// 애스펙트 오브 정의
export interface AspectOrb {
  type: AspectType;
  angle: number; // 정확 각도
  maxOrb: number; // 최대 허용 오브
  nature: AspectNature; // 성격
  isMajor: boolean; // 메이저 여부
}

// 애스펙트 정보
export interface AspectInfo {
  type: AspectType;
  name: string; // 영문명
  nameKo: string; // 한글명
  symbol: string; // 기호
  angle: number; // 정확 각도
  nature: AspectNature;
  isMajor: boolean;
  keywords: string[]; // 키워드
}

// 계산된 애스펙트
export interface Aspect {
  planet1: PlanetId; // 첫 번째 행성
  planet2: PlanetId; // 두 번째 행성
  type: AspectType; // 애스펙트 타입
  angle: number; // 정확 각도
  orb: number; // 실제 오브 (차이)
  orbPercentage: number; // 오브 비율 (0-100, 낮을수록 정확)
  isApplying: boolean; // 접근 중 (true) / 분리 중 (false)
  isExact: boolean; // 정확 (오브 1도 이내)
  strength: 'exact' | 'close' | 'wide'; // 강도
  nature: AspectNature; // 성격
}

// 애스펙트 패턴 (그랜드 트라인, T-스퀘어 등)
export type AspectPatternType =
  | 'grand_trine' // 그랜드 트라인 (3개 트라인)
  | 't_square' // T-스퀘어 (2개 스퀘어 + 1개 오포지션)
  | 'grand_cross' // 그랜드 크로스 (4개 스퀘어 + 2개 오포지션)
  | 'yod' // 요드 (2개 퀸컨스 + 1개 섹스타일)
  | 'stellium' // 스텔리움 (3개 이상 컨정션)
  | 'kite'; // 카이트 (그랜드 트라인 + 오포지션)

export interface AspectPattern {
  type: AspectPatternType;
  planets: PlanetId[];
  aspects: Aspect[];
  description: string;
}
