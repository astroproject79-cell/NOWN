/**
 * 용신(用神) 결정 모듈
 *
 * 용신: 사주에서 가장 필요한 오행
 *
 * 용신 결정 방법:
 * 1. 억부용신(抑扶用神): 신강하면 억제, 신약하면 부조
 * 2. 조후용신(調候用神): 계절(월령) 조절
 * 3. 격국용신(格局用神): 격국 보완
 * 4. 병약용신(病藥用神): 병을 치료하는 약
 */

import { STEM_ELEMENTS } from '../constants/stems';
import { BRANCH_ELEMENTS } from '../constants/branches';
import { Element, ElementAnalysis } from '../types/elements';
import { ELEMENTS, GENERATING_CYCLE, CONTROLLING_CYCLE, GENERATED_BY, CONTROLLED_BY } from '../constants/elements';
import { HiddenStemSchool } from '../types/hiddenStem';
import { analyzeElements } from './elementAnalysis';
import { analyzeDayMasterStrength, DayMasterStrengthAnalysis, DayMasterStrength } from './dayMasterStrength';
import { FourPillars } from '../types';

/** 용신 결정 방법 */
export type UsefulGodMethod =
  | 'balancing'    // 억부용신 (抑扶用神)
  | 'regulating'   // 조후용신 (調候用神)
  | 'structural'   // 격국용신 (格局用神)
  | 'healing';     // 병약용신 (病藥用神)

/** 용신 분석 결과 */
export interface UsefulGodAnalysis {
  /** 용신 (필요한 오행) */
  usefulGod: Element;
  /** 용신 결정 방법 */
  method: UsefulGodMethod;
  /** 기신 (해로운 오행) */
  jealousGod: Element;
  /** 희신 (도움되는 오행) */
  helpfulGod?: Element;
  /** 구신 (용신을 해치는 오행) */
  avoidGod?: Element;
  /** 한신 (무관한 오행) */
  leisureGod?: Element;
  /** 용신 선정 이유 */
  reasoning: string;
  /** 일주 강약 */
  dayMasterStrength: DayMasterStrength;
}

/**
 * 월령 조후 필요 여부 판단
 * 너무 춥거나 더운 계절에는 조후가 필요
 */
function needsSeasonalRegulation(
  fourPillars: FourPillars
): { needed: boolean; element?: Element; reason?: string } {
  const monthBranch = fourPillars.month.branch;
  const monthElement = BRANCH_ELEMENTS[monthBranch] as Element;

  // 겨울 (해자축) - 수(水) 많음, 화(火) 필요
  if (['해', '자', '축'].includes(monthBranch)) {
    return {
      needed: true,
      element: '화',
      reason: `${monthBranch}월(겨울)은 한냉하여 화(火)로 조후`,
    };
  }

  // 여름 (사오미) - 화(火) 많음, 수(水) 필요
  if (['사', '오', '미'].includes(monthBranch)) {
    return {
      needed: true,
      element: '수',
      reason: `${monthBranch}월(여름)은 염열하여 수(水)로 조후`,
    };
  }

  return { needed: false };
}

/**
 * 억부용신 결정
 * 신강하면 설기/극 (관성, 재성, 식상)
 * 신약하면 생조 (인성, 비겁)
 */
function determineBalancingGod(
  dayElement: Element,
  dayStrength: DayMasterStrength,
  elementAnalysis: ElementAnalysis
): { god: Element; reason: string } {
  if (dayStrength === 'strong') {
    // 신강: 설기하거나 극해야 함
    // 우선순위: 관성(극) > 재성(설기) > 식상(설기)
    const controllingElement = CONTROLLED_BY[dayElement];  // 나를 극하는
    const generatingElement = GENERATING_CYCLE[dayElement]; // 내가 생하는
    const controlledElement = CONTROLLING_CYCLE[dayElement]; // 내가 극하는

    // 가장 부족한 것을 용신으로
    if (elementAnalysis.distribution[controllingElement] < 2) {
      return {
        god: controllingElement,
        reason: `신강하여 ${controllingElement}(관성)으로 억제 필요`,
      };
    }
    if (elementAnalysis.distribution[controlledElement] < 2) {
      return {
        god: controlledElement,
        reason: `신강하여 ${controlledElement}(재성)으로 설기 필요`,
      };
    }
    return {
      god: generatingElement,
      reason: `신강하여 ${generatingElement}(식상)으로 설기 필요`,
    };

  } else if (dayStrength === 'weak') {
    // 신약: 도와야 함
    // 우선순위: 인성(생) > 비겁(동)
    const generatedByElement = GENERATED_BY[dayElement]; // 나를 생하는

    if (elementAnalysis.distribution[generatedByElement] < 2) {
      return {
        god: generatedByElement,
        reason: `신약하여 ${generatedByElement}(인성)으로 생조 필요`,
      };
    }
    return {
      god: dayElement,
      reason: `신약하여 ${dayElement}(비겁)으로 부조 필요`,
    };

  } else {
    // 중화: 부족한 오행 보충
    const weakest = elementAnalysis.weakest[0];
    if (weakest) {
      return {
        god: weakest,
        reason: `중화 상태이나 ${weakest} 오행이 부족하여 보충`,
      };
    }
    return {
      god: '토', // 기본값
      reason: '중화 상태로 토(土)로 균형 유지',
    };
  }
}

/**
 * 기신(忌神) 결정
 * 용신의 반대
 */
function determineJealousGod(
  dayElement: Element,
  dayStrength: DayMasterStrength,
  usefulGod: Element
): Element {
  if (dayStrength === 'strong') {
    // 신강: 인성, 비겁이 기신
    return GENERATED_BY[dayElement]; // 나를 생하는 = 인성
  } else if (dayStrength === 'weak') {
    // 신약: 관성, 재성이 기신
    return CONTROLLED_BY[dayElement]; // 나를 극하는 = 관성
  } else {
    // 중화: 가장 많은 오행이 기신
    return CONTROLLING_CYCLE[usefulGod]; // 용신을 극하는 것
  }
}

/**
 * 희신(喜神) 결정
 * 용신을 생하는 오행
 */
function determineHelpfulGod(usefulGod: Element): Element {
  return GENERATED_BY[usefulGod];
}

/**
 * 용신 분석
 * @param fourPillars 사주팔자
 * @param school 장간 유파
 * @returns 용신 분석 결과
 */
export function analyzeUsefulGod(
  fourPillars: FourPillars,
  school: HiddenStemSchool = 'standard'
): UsefulGodAnalysis {
  const dayMaster = fourPillars.day.stem;
  const dayElement = STEM_ELEMENTS[dayMaster] as Element;

  // 일주 강약 분석
  const dayStrengthAnalysis = analyzeDayMasterStrength(fourPillars, school);
  const dayStrength = dayStrengthAnalysis.strength;

  // 오행 분석
  const elementAnalysis = analyzeElements(fourPillars, school);

  // 조후 필요 여부 확인
  const seasonalRegulation = needsSeasonalRegulation(fourPillars);

  let usefulGod: Element;
  let method: UsefulGodMethod;
  let reasoning: string;

  // 조후가 필요한 경우 (극단적인 계절)
  if (seasonalRegulation.needed && seasonalRegulation.element) {
    // 조후용신과 억부용신 중 우선순위 결정
    // 일반적으로 조후가 우선되는 경우가 많음
    const balancing = determineBalancingGod(dayElement, dayStrength, elementAnalysis);

    // 조후용신과 억부용신이 같으면 최상
    if (balancing.god === seasonalRegulation.element) {
      usefulGod = seasonalRegulation.element;
      method = 'balancing';
      reasoning = `${seasonalRegulation.reason} (억부용신과 일치)`;
    } else {
      // 조후 우선 (일반적)
      usefulGod = seasonalRegulation.element;
      method = 'regulating';
      reasoning = seasonalRegulation.reason || '';
    }
  } else {
    // 억부용신 결정
    const balancing = determineBalancingGod(dayElement, dayStrength, elementAnalysis);
    usefulGod = balancing.god;
    method = 'balancing';
    reasoning = balancing.reason;
  }

  // 기신, 희신 결정
  const jealousGod = determineJealousGod(dayElement, dayStrength, usefulGod);
  const helpfulGod = determineHelpfulGod(usefulGod);

  return {
    usefulGod,
    method,
    jealousGod,
    helpfulGod,
    reasoning,
    dayMasterStrength: dayStrength,
  };
}

/**
 * 용신 분석 요약 문자열
 */
export function summarizeUsefulGod(analysis: UsefulGodAnalysis): string {
  const methodText = {
    'balancing': '억부',
    'regulating': '조후',
    'structural': '격국',
    'healing': '병약',
  };

  const strengthText = {
    'strong': '신강',
    'neutral': '중화',
    'weak': '신약',
  };

  return `용신: ${analysis.usefulGod} (${methodText[analysis.method]}) | 기신: ${analysis.jealousGod} | ${strengthText[analysis.dayMasterStrength]}`;
}

/**
 * 특정 대운/세운의 오행이 좋은지 판단
 */
export function evaluateLuckElement(
  element: Element,
  usefulGodAnalysis: UsefulGodAnalysis
): { score: number; description: string } {
  const { usefulGod, helpfulGod, jealousGod } = usefulGodAnalysis;

  if (element === usefulGod) {
    return { score: 100, description: `${element}은 용신으로 대길` };
  }
  if (element === helpfulGod) {
    return { score: 80, description: `${element}은 희신으로 길` };
  }
  if (element === jealousGod) {
    return { score: 20, description: `${element}은 기신으로 흉` };
  }

  // 용신을 극하는 오행 (구신)
  if (CONTROLLING_CYCLE[element] === usefulGod) {
    return { score: 30, description: `${element}은 용신을 극하여 불리` };
  }

  return { score: 50, description: `${element}은 한신으로 평범` };
}
