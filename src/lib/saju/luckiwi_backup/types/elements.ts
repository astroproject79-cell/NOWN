/**
 * 오행(五行) 타입 정의
 */

/** 오행 */
export type Element = '목' | '화' | '토' | '금' | '수';
export type ElementHanja = '木' | '火' | '土' | '金' | '水';

/** 음양 */
export type YinYang = '양' | '음';
export type YinYangHanja = '陽' | '陰';

/** 오행 분포 */
export interface ElementDistribution {
  목: number;
  화: number;
  토: number;
  금: number;
  수: number;
}

/** 오행 강도 */
export interface ElementStrength {
  목: number;
  화: number;
  토: number;
  금: number;
  수: number;
}

/** 오행 분석 결과 */
export interface ElementAnalysis {
  /** 오행별 개수 (천간 + 지지 본기) */
  distribution: ElementDistribution;
  /** 오행별 강도 (0-100, 장간 가중치 포함) */
  strength: ElementStrength;
  /** 가장 강한 오행 */
  strongest: Element[];
  /** 가장 약한 오행 */
  weakest: Element[];
  /** 없는 오행 */
  missing: Element[];
  /** 불균형 */
  imbalance: {
    /** 과다 오행 */
    excess: Element[];
    /** 부족 오행 */
    deficient: Element[];
  };
}
