/**
 * 신살(神殺) 타입 정의
 */

/** 신살 종류 */
export type SpiritType =
  // 길신 (吉神)
  | '천을귀인' | '천덕귀인' | '월덕귀인' | '문창귀인' | '학당귀인'
  | '금여록' | '천희성' | '홍란성' | '천관귀인' | '복성귀인'
  // 흉살 (凶殺)
  | '도화살' | '역마살' | '화개살' | '양인살' | '겁살'
  | '원진살' | '귀문관살' | '백호대살' | '천라지망' | '고신살'
  | '과숙살' | '망신살' | '탕화살' | '효신살' | '현침살';

/** 신살 카테고리 */
export type SpiritCategory = 'auspicious' | 'inauspicious';

/** 신살 정보 */
export interface SpiritInfo {
  type: SpiritType;
  typeHanja: string;
  category: SpiritCategory;
  position: 'year' | 'month' | 'day' | 'hour';
  basedOn: string;  // 어떤 주를 기준으로 판단했는지
  description: string;
  effect: string;
}

/** 신살 분석 결과 */
export interface SpiritsAnalysis {
  auspicious: SpiritInfo[];  // 길신
  inauspicious: SpiritInfo[];  // 흉살
  summary: {
    totalAuspicious: number;
    totalInauspicious: number;
    majorSpirits: SpiritType[];
    interpretation: string;
  };
}
