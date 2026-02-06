/**
 * 오행(五行) 분석 모듈
 *
 * 사주 내 오행의 분포, 강약, 균형을 분석
 */

import { HeavenlyStem, STEM_ELEMENTS } from '../constants/stems';
import { EarthlyBranch, BRANCH_ELEMENTS } from '../constants/branches';
import { getHiddenStemsArray, HIDDEN_STEM_STRENGTH } from '../constants/hiddenStems';
import { ELEMENTS, GENERATING_CYCLE, CONTROLLING_CYCLE } from '../constants/elements';
import { Element, ElementDistribution, ElementStrength, ElementAnalysis } from '../types/elements';
import { HiddenStemSchool } from '../types/hiddenStem';
import { FourPillars } from '../types';

/**
 * 오행 분포 초기화
 */
function initElementDistribution(): ElementDistribution {
  return {
    '목': 0,
    '화': 0,
    '토': 0,
    '금': 0,
    '수': 0,
  };
}

/**
 * 오행 강도 초기화
 */
function initElementStrength(): ElementStrength {
  return {
    '목': 0,
    '화': 0,
    '토': 0,
    '금': 0,
    '수': 0,
  };
}

/**
 * 사주 오행 분석
 * @param fourPillars 사주팔자
 * @param school 장간 유파
 * @param includeHiddenStems 장간 포함 여부 (기본: true)
 * @returns 오행 분석 결과
 */
export function analyzeElements(
  fourPillars: FourPillars,
  school: HiddenStemSchool = 'standard',
  includeHiddenStems: boolean = true
): ElementAnalysis {
  const distribution = initElementDistribution();
  const strength = initElementStrength();

  // 천간 오행 집계 (각 1점)
  const stems = [
    fourPillars.year.stem,
    fourPillars.month.stem,
    fourPillars.day.stem,
    fourPillars.hour.stem,
  ];

  for (const stem of stems) {
    const element = STEM_ELEMENTS[stem] as Element;
    distribution[element]++;
    strength[element] += 10; // 천간은 10점
  }

  // 지지 오행 집계
  const branches = [
    fourPillars.year.branch,
    fourPillars.month.branch,
    fourPillars.day.branch,
    fourPillars.hour.branch,
  ];

  for (const branch of branches) {
    const mainElement = BRANCH_ELEMENTS[branch] as Element;
    distribution[mainElement]++;
    strength[mainElement] += 10; // 지지 본기는 10점

    // 장간 포함 시
    if (includeHiddenStems) {
      const hiddenStems = getHiddenStemsArray(branch, school);

      // 본기는 이미 계산됨, 중기/여기만 추가
      if (hiddenStems.length > 1) {
        const middleStem = hiddenStems[1];
        const middleElement = STEM_ELEMENTS[middleStem] as Element;
        strength[middleElement] += 10 * HIDDEN_STEM_STRENGTH.middle;
      }

      if (hiddenStems.length > 2) {
        const residualStem = hiddenStems[2];
        const residualElement = STEM_ELEMENTS[residualStem] as Element;
        strength[residualElement] += 10 * HIDDEN_STEM_STRENGTH.residual;
      }
    }
  }

  // 강도 정규화 (0-100)
  const maxStrength = Math.max(...Object.values(strength));
  const normalizedStrength = { ...strength };
  if (maxStrength > 0) {
    for (const element of ELEMENTS) {
      normalizedStrength[element] = Math.round((strength[element] / maxStrength) * 100);
    }
  }

  // 가장 강한/약한 오행 찾기
  const strongest = findExtreme(normalizedStrength, 'max');
  const weakest = findExtreme(normalizedStrength, 'min');

  // 없는 오행 찾기
  const missing = ELEMENTS.filter(e => distribution[e] === 0);

  // 불균형 분석 (평균 대비)
  const avgDistribution = Object.values(distribution).reduce((a, b) => a + b, 0) / 5;
  const excess = ELEMENTS.filter(e => distribution[e] > avgDistribution * 1.5);
  const deficient = ELEMENTS.filter(e => distribution[e] < avgDistribution * 0.5 && distribution[e] > 0);

  return {
    distribution,
    strength: normalizedStrength,
    strongest,
    weakest,
    missing,
    imbalance: {
      excess,
      deficient,
    },
  };
}

/**
 * 극단값 오행 찾기
 */
function findExtreme(
  strength: ElementStrength,
  type: 'max' | 'min'
): Element[] {
  const values = Object.values(strength);
  const extremeValue = type === 'max' ? Math.max(...values) : Math.min(...values);

  // 값이 0인 경우 (min) 건너뛰기
  if (type === 'min' && extremeValue === 0) {
    const nonZeroValues = values.filter(v => v > 0);
    if (nonZeroValues.length === 0) return [];
    const minNonZero = Math.min(...nonZeroValues);
    return ELEMENTS.filter(e => strength[e] === minNonZero);
  }

  return ELEMENTS.filter(e => strength[e] === extremeValue);
}

/**
 * 오행 균형 점수 계산 (0-100)
 * 100에 가까울수록 균형 잡힘
 */
export function calculateBalanceScore(analysis: ElementAnalysis): number {
  const values = Object.values(analysis.distribution);
  const avg = values.reduce((a, b) => a + b, 0) / 5;

  if (avg === 0) return 0;

  // 표준편차 계산
  const variance = values.reduce((sum, v) => sum + Math.pow(v - avg, 2), 0) / 5;
  const stdDev = Math.sqrt(variance);

  // 표준편차가 작을수록 균형 잡힘
  // 최대 표준편차는 약 avg * 2 정도
  const maxStdDev = avg * 2;
  const balanceScore = Math.max(0, 100 - (stdDev / maxStdDev) * 100);

  return Math.round(balanceScore);
}

/**
 * 특정 오행이 필요한지 분석
 * @param analysis 오행 분석 결과
 * @param element 확인할 오행
 * @returns 필요 여부 및 이유
 */
export function checkElementNeed(
  analysis: ElementAnalysis,
  element: Element
): { needed: boolean; reason: string } {
  // 없는 오행이면 필요
  if (analysis.missing.includes(element)) {
    return { needed: true, reason: `${element} 오행이 사주에 없음` };
  }

  // 부족한 오행이면 필요
  if (analysis.imbalance.deficient.includes(element)) {
    return { needed: true, reason: `${element} 오행이 부족함` };
  }

  // 가장 약한 오행이면 필요
  if (analysis.weakest.includes(element)) {
    return { needed: true, reason: `${element} 오행이 가장 약함` };
  }

  return { needed: false, reason: '' };
}

/**
 * 오행 상생상극 관계 분석
 */
export function analyzeElementRelations(analysis: ElementAnalysis): {
  generating: Array<{ from: Element; to: Element; strength: string }>;
  controlling: Array<{ from: Element; to: Element; strength: string }>;
} {
  const generating: Array<{ from: Element; to: Element; strength: string }> = [];
  const controlling: Array<{ from: Element; to: Element; strength: string }> = [];

  for (const from of ELEMENTS) {
    if (analysis.distribution[from] === 0) continue;

    // 상생 관계
    const generatedElement = GENERATING_CYCLE[from];
    if (analysis.distribution[generatedElement] > 0) {
      const fromStrength = analysis.strength[from];
      const toStrength = analysis.strength[generatedElement];
      const strength = fromStrength > toStrength ? '강함' : fromStrength < toStrength ? '약함' : '보통';
      generating.push({ from, to: generatedElement, strength });
    }

    // 상극 관계
    const controlledElement = CONTROLLING_CYCLE[from];
    if (analysis.distribution[controlledElement] > 0) {
      const fromStrength = analysis.strength[from];
      const toStrength = analysis.strength[controlledElement];
      const strength = fromStrength > toStrength ? '강함' : fromStrength < toStrength ? '약함' : '보통';
      controlling.push({ from, to: controlledElement, strength });
    }
  }

  return { generating, controlling };
}

/**
 * 오행 분석 요약 문자열 생성
 */
export function summarizeElements(analysis: ElementAnalysis): string {
  const parts: string[] = [];

  // 분포
  const distStr = ELEMENTS
    .map(e => `${e}${analysis.distribution[e]}`)
    .join(' ');
  parts.push(`분포: ${distStr}`);

  // 강약
  if (analysis.strongest.length > 0) {
    parts.push(`최강: ${analysis.strongest.join(', ')}`);
  }
  if (analysis.weakest.length > 0) {
    parts.push(`최약: ${analysis.weakest.join(', ')}`);
  }

  // 결핍
  if (analysis.missing.length > 0) {
    parts.push(`결핍: ${analysis.missing.join(', ')}`);
  }

  return parts.join(' | ');
}
