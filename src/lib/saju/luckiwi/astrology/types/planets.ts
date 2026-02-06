/**
 * 점성학 행성 타입 정의
 */

// 고전 행성 (7개) - 토성까지
export type ClassicalPlanetId =
  | 'sun'
  | 'moon'
  | 'mercury'
  | 'venus'
  | 'mars'
  | 'jupiter'
  | 'saturn';

// 현대 행성 (외행성 3개)
export type ModernPlanetId = 'uranus' | 'neptune' | 'pluto';

// 추가 포인트
export type PointId =
  | 'northNode' // 북노드 (라후)
  | 'southNode' // 남노드 (케투)
  | 'chiron' // 카이론
  | 'ascendant' // 상승점 (ASC)
  | 'midheaven'; // 천정 (MC)

// 모든 행성/포인트 ID
export type PlanetId = ClassicalPlanetId | ModernPlanetId | PointId;

// 점성학 모드
export type AstrologyMode = 'classical' | 'modern';

// 행성 위치 정보
export interface PlanetPosition {
  id: PlanetId;
  longitude: number; // 황도 경도 (0-360)
  latitude: number; // 황도 위도
  distance: number; // 거리 (AU)
  speed: number; // 일일 이동량 (역행 시 음수)
  isRetrograde: boolean; // 역행 여부
  sign: import('./signs').ZodiacSign; // 현재 사인
  signDegree: number; // 사인 내 도수 (0-30)
  signMinute: number; // 사인 내 분
  signSecond: number; // 사인 내 초
  house?: number; // 하우스 번호 (1-12)
}

// 행성 정보
export interface PlanetInfo {
  id: PlanetId;
  name: string; // 영문명
  nameKo: string; // 한글명
  symbol: string; // 점성학 기호
  isClassical: boolean; // 고전 행성 여부
  isLuminary: boolean; // 발광체 (태양/달) 여부
  isBenefic: boolean | null; // 길성/흉성 (null = 중성)
  domicile: import('./signs').ZodiacSign[]; // 본좌
  exaltation?: import('./signs').ZodiacSign; // 고양
  detriment: import('./signs').ZodiacSign[]; // 망
  fall?: import('./signs').ZodiacSign; // 추락
}
