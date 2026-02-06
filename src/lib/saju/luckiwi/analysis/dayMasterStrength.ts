/**
 * 일주(日主) 강약 판정 모듈
 *
 * 신강(身强)/신약(身弱) 판정 기준:
 * 1. 월령 득령 (가장 중요, 약 40%)
 * 2. 통근 여부 (약 25%)
 * 3. 천간 도움 (약 20%)
 * 4. 지지 세력 (약 15%)
 */

import { HeavenlyStem, STEM_ELEMENTS, STEM_YIN_YANG } from '../constants/stems';
import { EarthlyBranch, BRANCH_ELEMENTS } from '../constants/branches';
import { Element } from '../types/elements';
import { GENERATED_BY, GENERATING_CYCLE } from '../constants/elements';
import { getHiddenStemsArray, HIDDEN_STEM_STRENGTH } from '../constants/hiddenStems';
import { HiddenStemSchool } from '../types/hiddenStem';
import { FourPillars } from '../types';

/** 일주 강약 */
export type DayMasterStrength = 'strong' | 'neutral' | 'weak';

/** 일주 강약 분석 결과 */
export interface DayMasterStrengthAnalysis {
  /** 일간 */
  dayMaster: HeavenlyStem;
  /** 일간 오행 */
  dayElement: Element;
  /** 총 점수 (0-100) */
  score: number;
  /** 강약 판정 */
  strength: DayMasterStrength;
  /** 세부 요소별 점수 */
  factors: {
    /** 월령 득령 점수 */
    monthSupport: number;
    /** 통근 점수 */
    rootSupport: number;
    /** 천간 도움 점수 */
    stemSupport: number;
    /** 지지 세력 점수 */
    branchSupport: number;
  };
  /** 분석 설명 */
  explanation: string[];
}

/** 월령(월지)의 계절별 왕상/사절 */
const SEASON_STRENGTH: Record<Element, Record<Element, number>> = {
  // 봄 (인묘진) - 목 왕, 화 상, 토 죽, 금 수, 수 휴
  '목': { '목': 15, '화': 10, '토': -10, '금': -5, '수': 0 },
  // 여름 (사오미) - 화 왕, 토 상, 금 죽, 수 수, 목 휴
  '화': { '화': 15, '토': 10, '금': -10, '수': -5, '목': 0 },
  // 가을 (신유술) - 금 왕, 수 상, 목 죽, 화 수, 토 휴
  '금': { '금': 15, '수': 10, '목': -10, '화': -5, '토': 0 },
  // 겨울 (해자축) - 수 왕, 목 상, 화 죽, 토 수, 금 휴
  '수': { '수': 15, '목': 10, '화': -10, '토': -5, '금': 0 },
  // 토용 (진술축미 중 토) - 토 왕
  '토': { '토': 15, '금': 10, '수': -10, '목': -5, '화': 0 },
};

/**
 * 월령(월지)에서 일간이 득령하는지 판정
 */
function calculateMonthSupport(
  dayElement: Element,
  monthBranch: EarthlyBranch
): { score: number; explanation: string } {
  const monthElement = BRANCH_ELEMENTS[monthBranch] as Element;
  const seasonStrength = SEASON_STRENGTH[monthElement];
  const score = seasonStrength[dayElement] || 0;

  let explanation: string;
  if (score >= 15) {
    explanation = `월령 ${monthBranch}(${monthElement})에서 왕(旺)`;
  } else if (score >= 10) {
    explanation = `월령 ${monthBranch}(${monthElement})에서 상(相)`;
  } else if (score > 0) {
    explanation = `월령 ${monthBranch}(${monthElement})에서 휴(休)`;
  } else if (score >= -5) {
    explanation = `월령 ${monthBranch}(${monthElement})에서 수(囚)`;
  } else {
    explanation = `월령 ${monthBranch}(${monthElement})에서 사(死)`;
  }

  return { score, explanation };
}

/**
 * 통근(지지 장간에 일간과 같은 오행) 점수 계산
 */
function calculateRootSupport(
  dayMaster: HeavenlyStem,
  branches: EarthlyBranch[],
  school: HiddenStemSchool
): { score: number; explanation: string } {
  let totalScore = 0;
  const rootingBranches: string[] = [];

  for (const branch of branches) {
    const hiddenStems = getHiddenStemsArray(branch, school);

    for (let i = 0; i < hiddenStems.length; i++) {
      if (hiddenStems[i] === dayMaster) {
        let strength: number;
        if (i === 0) {
          strength = HIDDEN_STEM_STRENGTH.main;
        } else if (i === 1) {
          strength = HIDDEN_STEM_STRENGTH.middle;
        } else {
          strength = HIDDEN_STEM_STRENGTH.residual;
        }
        totalScore += strength * 8;
        rootingBranches.push(branch);
        break;
      }
    }
  }

  const explanation = rootingBranches.length > 0
    ? `${rootingBranches.join(', ')}에서 통근`
    : '통근 없음';

  return { score: totalScore, explanation };
}

/**
 * 천간 도움(비겁, 인성) 점수 계산
 */
function calculateStemSupport(
  dayMaster: HeavenlyStem,
  dayElement: Element,
  stems: HeavenlyStem[]
): { score: number; explanation: string } {
  let totalScore = 0;
  const helpers: string[] = [];

  const generatingElement = GENERATED_BY[dayElement]; // 나를 생하는 오행 (인성)

  for (const stem of stems) {
    if (stem === dayMaster) continue; // 일간 제외

    const stemElement = STEM_ELEMENTS[stem] as Element;

    if (stemElement === dayElement) {
      // 비겁 (같은 오행)
      totalScore += 8;
      helpers.push(`${stem}(비겁)`);
    } else if (stemElement === generatingElement) {
      // 인성 (나를 생하는 오행)
      totalScore += 5;
      helpers.push(`${stem}(인성)`);
    }
  }

  const explanation = helpers.length > 0
    ? `천간 도움: ${helpers.join(', ')}`
    : '천간 도움 없음';

  return { score: totalScore, explanation };
}

/**
 * 지지 세력(비겁, 인성 오행) 점수 계산
 */
function calculateBranchSupport(
  dayElement: Element,
  branches: EarthlyBranch[],
  school: HiddenStemSchool
): { score: number; explanation: string } {
  let totalScore = 0;
  const supporters: string[] = [];

  const generatingElement = GENERATED_BY[dayElement];

  for (const branch of branches) {
    const branchElement = BRANCH_ELEMENTS[branch] as Element;

    if (branchElement === dayElement) {
      totalScore += 5;
      supporters.push(`${branch}(비겁)`);
    } else if (branchElement === generatingElement) {
      totalScore += 3;
      supporters.push(`${branch}(인성)`);
    }
  }

  const explanation = supporters.length > 0
    ? `지지 세력: ${supporters.join(', ')}`
    : '지지 세력 없음';

  return { score: totalScore, explanation };
}

/**
 * 일주 강약 분석
 * @param fourPillars 사주팔자
 * @param school 장간 유파
 * @returns 일주 강약 분석 결과
 */
export function analyzeDayMasterStrength(
  fourPillars: FourPillars,
  school: HiddenStemSchool = 'standard'
): DayMasterStrengthAnalysis {
  const dayMaster = fourPillars.day.stem;
  const dayElement = STEM_ELEMENTS[dayMaster] as Element;

  const stems = [
    fourPillars.year.stem,
    fourPillars.month.stem,
    fourPillars.day.stem,
    fourPillars.hour.stem,
  ];

  const branches = [
    fourPillars.year.branch,
    fourPillars.month.branch,
    fourPillars.day.branch,
    fourPillars.hour.branch,
  ];

  // 각 요소별 점수 계산
  const monthResult = calculateMonthSupport(dayElement, fourPillars.month.branch);
  const rootResult = calculateRootSupport(dayMaster, branches, school);
  const stemResult = calculateStemSupport(dayMaster, dayElement, stems);
  const branchResult = calculateBranchSupport(dayElement, branches, school);

  // 총점 계산 (50점 기준)
  let totalScore = 50;
  totalScore += monthResult.score;
  totalScore += rootResult.score;
  totalScore += stemResult.score;
  totalScore += branchResult.score;

  // 점수 범위 제한 (0-100)
  totalScore = Math.max(0, Math.min(100, totalScore));

  // 강약 판정
  let strength: DayMasterStrength;
  if (totalScore >= 60) {
    strength = 'strong';
  } else if (totalScore <= 40) {
    strength = 'weak';
  } else {
    strength = 'neutral';
  }

  // 설명 모으기
  const explanation: string[] = [
    monthResult.explanation,
    rootResult.explanation,
    stemResult.explanation,
    branchResult.explanation,
  ];

  return {
    dayMaster,
    dayElement,
    score: totalScore,
    strength,
    factors: {
      monthSupport: monthResult.score,
      rootSupport: rootResult.score,
      stemSupport: stemResult.score,
      branchSupport: branchResult.score,
    },
    explanation,
  };
}

/**
 * 강약 판정 요약 문자열
 */
export function summarizeDayMasterStrength(analysis: DayMasterStrengthAnalysis): string {
  const strengthText = {
    'strong': '신강(身强)',
    'neutral': '중화(中和)',
    'weak': '신약(身弱)',
  };

  return `${analysis.dayMaster}(${analysis.dayElement}) ${strengthText[analysis.strength]} (${analysis.score}점)`;
}
