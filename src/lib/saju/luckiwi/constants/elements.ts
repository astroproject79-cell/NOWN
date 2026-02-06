/**
 * 오행(五行) 상수 및 관계 정의
 */

import { Element, ElementHanja, YinYang, YinYangHanja } from '../types/elements';

/** 오행 목록 */
export const ELEMENTS: Element[] = ['목', '화', '토', '금', '수'];

/** 오행 한자 목록 */
export const ELEMENTS_HANJA: ElementHanja[] = ['木', '火', '土', '金', '水'];

/** 오행 한글 → 한자 매핑 */
export const ELEMENT_TO_HANJA: Record<Element, ElementHanja> = {
  '목': '木',
  '화': '火',
  '토': '土',
  '금': '金',
  '수': '水',
};

/** 오행 한자 → 한글 매핑 */
export const HANJA_TO_ELEMENT: Record<ElementHanja, Element> = {
  '木': '목',
  '火': '화',
  '土': '토',
  '金': '금',
  '水': '수',
};

/**
 * 상생(相生) 관계: A가 B를 생함
 * 목생화(木生火), 화생토(火生土), 토생금(土生金), 금생수(金生水), 수생목(水生木)
 */
export const GENERATING_CYCLE: Record<Element, Element> = {
  '목': '화',
  '화': '토',
  '토': '금',
  '금': '수',
  '수': '목',
};

/**
 * 상극(相剋) 관계: A가 B를 극함
 * 목극토(木剋土), 토극수(土剋水), 수극화(水剋火), 화극금(火剋金), 금극목(金剋木)
 */
export const CONTROLLING_CYCLE: Record<Element, Element> = {
  '목': '토',
  '토': '수',
  '수': '화',
  '화': '금',
  '금': '목',
};

/**
 * 역생(被生) 관계: A가 B로부터 생을 받음
 */
export const GENERATED_BY: Record<Element, Element> = {
  '목': '수',  // 수생목
  '화': '목',  // 목생화
  '토': '화',  // 화생토
  '금': '토',  // 토생금
  '수': '금',  // 금생수
};

/**
 * 피극(被剋) 관계: A가 B로부터 극을 받음
 */
export const CONTROLLED_BY: Record<Element, Element> = {
  '목': '금',  // 금극목
  '화': '수',  // 수극화
  '토': '목',  // 목극토
  '금': '화',  // 화극금
  '수': '토',  // 토극수
};

/**
 * 오행 관계 타입
 */
export type ElementRelationType =
  | 'same'        // 같은 오행
  | 'generating'  // 내가 생하는
  | 'generated'   // 나를 생하는
  | 'controlling' // 내가 극하는
  | 'controlled'; // 나를 극하는

/**
 * 두 오행 간의 관계 판단
 * @param from 기준 오행 (나)
 * @param to 대상 오행
 * @returns 관계 유형
 */
export function getElementRelation(from: Element, to: Element): ElementRelationType {
  if (from === to) {
    return 'same';
  }
  if (GENERATING_CYCLE[from] === to) {
    return 'generating';
  }
  if (GENERATED_BY[from] === to) {
    return 'generated';
  }
  if (CONTROLLING_CYCLE[from] === to) {
    return 'controlling';
  }
  return 'controlled';
}

/**
 * 오행별 색상 (UI용)
 */
export const ELEMENT_COLORS: Record<Element, string> = {
  '목': '#22c55e', // green
  '화': '#ef4444', // red
  '토': '#eab308', // yellow
  '금': '#ffffff', // white
  '수': '#3b82f6', // blue
};

/**
 * 음양 한글 → 한자 매핑
 */
export const YIN_YANG_TO_HANJA: Record<YinYang, YinYangHanja> = {
  '양': '陽',
  '음': '陰',
};
