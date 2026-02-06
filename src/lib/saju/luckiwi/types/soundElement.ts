/**
 * 납음오행(納音五行) 타입 정의
 */

import { Element } from './elements';

/** 납음 종류 (30가지) */
export type SoundElementType =
  | '해중금' | '노중화' | '대림목' | '노방토' | '검봉금' | '산두화'
  | '간하수' | '성두토' | '백납금' | '양류목' | '정천수' | '옥상토'
  | '벽력화' | '송백목' | '장류수' | '사중금' | '산하화' | '평지목'
  | '벽상토' | '금박금' | '복등화' | '천하수' | '대역토' | '차천금'
  | '상자목' | '대계수' | '사중토' | '천상화' | '석류목' | '대해수';

/** 납음 정보 */
export interface SoundElementInfo {
  /** 60갑자 */
  sexagenary: string;
  /** 납음 이름 */
  name: SoundElementType;
  /** 납음 한자 */
  nameHanja: string;
  /** 오행 */
  element: Element;
  /** 설명 */
  description: string;
}

/** 납음오행 분석 결과 */
export interface SoundElementAnalysis {
  year: SoundElementInfo;
  month: SoundElementInfo;
  day: SoundElementInfo;
  hour: SoundElementInfo;
  /** 오행별 납음 개수 */
  elementCount: Record<Element, number>;
  /** 요약 */
  summary: {
    dominantElement: Element;
    interpretation: string;
  };
}
