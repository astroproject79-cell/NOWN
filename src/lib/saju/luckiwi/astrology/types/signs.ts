/**
 * 12궁 (조디악 사인) 타입 정의
 */

// 12궁 ID
export type ZodiacSign =
  | 'aries' // 양자리
  | 'taurus' // 황소자리
  | 'gemini' // 쌍둥이자리
  | 'cancer' // 게자리
  | 'leo' // 사자자리
  | 'virgo' // 처녀자리
  | 'libra' // 천칭자리
  | 'scorpio' // 전갈자리
  | 'sagittarius' // 사수자리
  | 'capricorn' // 염소자리
  | 'aquarius' // 물병자리
  | 'pisces'; // 물고기자리

// 원소 (4원소)
export type Element = 'fire' | 'earth' | 'air' | 'water';

// 성질 (3성질)
export type Modality = 'cardinal' | 'fixed' | 'mutable';

// 음양
export type Polarity = 'positive' | 'negative';

// 사인 정보
export interface SignInfo {
  id: ZodiacSign;
  index: number; // 0-11
  name: string; // 영문명
  nameKo: string; // 한글명
  symbol: string; // 점성학 기호
  unicode: string; // 유니코드 기호
  element: Element; // 원소
  modality: Modality; // 성질
  polarity: Polarity; // 음양
  startDegree: number; // 시작 도수 (0, 30, 60...)
  endDegree: number; // 종료 도수
  classicalRuler: import('./planets').ClassicalPlanetId; // 고전 룰러
  modernRuler?: import('./planets').PlanetId; // 현대 룰러 (있는 경우)
}

// 데칸 (10도 분할)
export interface Decan {
  sign: ZodiacSign;
  decanNumber: 1 | 2 | 3; // 1, 2, 3 데칸
  startDegree: number; // 0, 10, 20
  endDegree: number; // 10, 20, 30
  ruler: import('./planets').PlanetId; // 데칸 룰러
}
