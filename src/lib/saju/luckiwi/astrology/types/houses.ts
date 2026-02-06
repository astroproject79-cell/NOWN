/**
 * 하우스 시스템 타입 정의
 */

import type { ZodiacSign } from './signs';

// 하우스 시스템
export type HouseSystem =
  | 'placidus' // 플라시두스 (가장 대중적)
  | 'whole_sign' // 홀 사인 (고전)
  | 'koch' // 코흐
  | 'equal' // 이퀄 하우스
  | 'regiomontanus' // 레기오몬타누스
  | 'campanus' // 캄파누스
  | 'porphyry'; // 포르피리

// Swiss Ephemeris 하우스 시스템 코드 매핑
export const HOUSE_SYSTEM_CODES: Record<HouseSystem, string> = {
  placidus: 'P',
  whole_sign: 'W',
  koch: 'K',
  equal: 'E',
  regiomontanus: 'R',
  campanus: 'C',
  porphyry: 'O',
};

// 하우스 커스프 정보
export interface HouseCusp {
  house: number; // 1-12
  longitude: number; // 하우스 시작점 경도 (0-360)
  sign: ZodiacSign; // 하우스 시작 사인
  signDegree: number; // 사인 내 도수 (0-30)
  signMinute: number; // 분
  signSecond: number; // 초
}

// 하우스 계산 결과
export interface Houses {
  system: HouseSystem;
  cusps: HouseCusp[]; // 12개 하우스 커스프
  ascendant: number; // ASC 경도
  midheaven: number; // MC 경도
  descendant: number; // DSC 경도 (ASC + 180)
  imumCoeli: number; // IC 경도 (MC + 180)
  vertex?: number; // 버텍스 (선택)
  eastPoint?: number; // 동쪽점 (선택)
}

// 하우스 정보
export interface HouseInfo {
  number: number; // 1-12
  name: string; // 영문명
  nameKo: string; // 한글명
  keywords: string[]; // 키워드
  lifeArea: string; // 인생 영역
  naturalSign: ZodiacSign; // 자연 사인
  naturalRuler: import('./planets').PlanetId; // 자연 룰러
}

// 하우스 유형
export type HouseType = 'angular' | 'succedent' | 'cadent';

// 앵글 하우스 (1, 4, 7, 10)
export const ANGULAR_HOUSES = [1, 4, 7, 10] as const;
// 석시던트 하우스 (2, 5, 8, 11)
export const SUCCEDENT_HOUSES = [2, 5, 8, 11] as const;
// 케이던트 하우스 (3, 6, 9, 12)
export const CADENT_HOUSES = [3, 6, 9, 12] as const;
