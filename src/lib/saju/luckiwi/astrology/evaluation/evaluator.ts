/**
 * 점성학 해석 품질 평가 엔진
 *
 * 룰 기반 평가: 패턴 매칭으로 각 기준 pass/fail 체크
 */

import type {
  AstrologyEvaluationInput,
  AstrologyEvaluationResult,
  AstrologyDimensionResult,
  AstrologyEvaluationDimensionId,
  AstrologyImprovementPoint,
} from './types';
import { scoreToGrade, getGradeFeedback } from './types';
import dimensionsData from './data/dimensions.json';

// ============================================
// 패턴 정의
// ============================================

/** 공감 표현 패턴 */
const EMPATHY_PATTERNS = [
  /쉽지 않았/g,
  /어려웠을/g,
  /버텨온|버텨왔/g,
  /힘들었/g,
  /고생/g,
  /이미 충분히/g,
];

/** 탓하지 않음 패턴 */
const NOT_FAULT_PATTERNS = [
  /당신 탓이 아/g,
  /타고난 구조/g,
  /그것은 당신의 잘못이 아/g,
];

/** 희망 표현 패턴 */
const HOPE_PATTERNS = [
  /할 수 있/g,
  /될 것입니다/g,
  /가능합니다/g,
  /성장할|발전할/g,
  /좋아질/g,
  /결실/g,
  /앞으로/g,
  /잠재력/g,
];

/** 가능성 표현 패턴 */
const POSSIBILITY_PATTERNS = [
  /일 수 있/g,
  /수도 있/g,
  /경향이 있/g,
  /가능성이/g,
  /~할 수 있습니다/g,
];

/** 단정적 표현 패턴 */
const DEFINITIVE_PATTERNS = [
  /반드시/g,
  /틀림없이/g,
  /무조건/g,
  /절대/g,
];

/** 원소 패턴 */
const ELEMENT_PATTERNS = [
  /불|화\s*원소|불의\s*에너지/g,
  /흙|토\s*원소|흙의\s*에너지/g,
  /공기|풍\s*원소|공기의\s*에너지/g,
  /물|수\s*원소|물의\s*에너지/g,
];

/** 자연 비유 패턴 */
const NATURE_PATTERNS = [
  /봄|여름|가을|겨울/g,
  /태양|달|별/g,
  /대지|바다|하늘|바람/g,
  /꽃|나무|씨앗|열매/g,
];

/** 하우스 패턴 */
const HOUSE_PATTERNS = /(\d+)\s*하우스/g;

/** 애스펙트 패턴 */
const ASPECT_PATTERNS = /합|충|삼합|스퀘어|육합|conjunction|opposition|trine|square|sextile/gi;

/** 조언 패턴 */
const ADVICE_PATTERNS = /하세요|해보세요|추천합니다|좋습니다|적합합니다/g;

/** 직업 패턴 */
const CAREER_PATTERNS = /직업|커리어|직장|업종|분야|적성/g;

/** 용어 설명 패턴 (괄호) */
const EXPLAINED_TERM_PATTERN = /[가-힣A-Za-z]+\([^)]+\)/g;

// ============================================
// 메인 평가 함수
// ============================================

interface EvaluationDimension {
  id: string;
  name: string;
  description: string;
  weight: number;
  criteria: EvaluationCriterion[];
}

interface EvaluationCriterion {
  id: string;
  name: string;
  description: string;
  checkType: 'presence' | 'count' | 'ratio' | 'pattern' | 'sentiment';
  target?: number | string | boolean;
  min?: number;
  max?: number;
  maxScore: number;
}

interface CriterionResult {
  criterionId: string;
  score: number;
  maxScore: number;
  achievement: number;
  measuredValue: number | string | boolean;
  feedback: string;
  suggestion?: string;
}

/**
 * 점성학 해석 품질 평가 (룰 기반)
 */
export function evaluateAstrologyInterpretation(
  input: AstrologyEvaluationInput
): AstrologyEvaluationResult {
  const dimensions = dimensionsData.dimensions as EvaluationDimension[];

  // 1. 차원별 평가 수행
  const dimensionResults: AstrologyDimensionResult[] = dimensions.map((dim) =>
    evaluateDimension(dim, input)
  );

  // 2. 전체 점수 계산 (가중 평균)
  const totalScore = dimensionResults.reduce(
    (sum, dr) => sum + dr.weightedScore,
    0
  );

  // 3. 강점/약점 분석
  const sortedDimensions = [...dimensionResults].sort(
    (a, b) => b.score - a.score
  );

  const strengths = sortedDimensions.slice(0, 3).map((dr) => ({
    dimensionId: dr.dimensionId,
    name: dr.dimensionName,
    score: dr.score,
  }));

  const weaknesses = sortedDimensions
    .slice(-3)
    .reverse()
    .map((dr) => ({
      dimensionId: dr.dimensionId,
      name: dr.dimensionName,
      score: dr.score,
      suggestion: generateDimensionSuggestion(dr),
    }));

  // 4. 종합 피드백 생성
  const overallFeedback = generateOverallFeedback(totalScore, dimensionResults);

  // 5. 우선 개선 사항 도출
  const improvementPoints = generateImprovementPoints(dimensionResults);

  return {
    id: `astro_eval_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    evaluatedAt: new Date().toISOString(),
    totalScore: Math.round(totalScore * 10) / 10,
    totalGrade: scoreToGrade(totalScore),
    dimensionResults,
    strengths,
    weaknesses,
    overallFeedback,
    improvementPoints,
    confidence: 'high',
  };
}

// ============================================
// 차원별 평가
// ============================================

function evaluateDimension(
  dimension: EvaluationDimension,
  input: AstrologyEvaluationInput
): AstrologyDimensionResult {
  const criteriaResults = dimension.criteria.map((criterion) =>
    evaluateCriterion(criterion, input)
  );

  const rawScore = criteriaResults.reduce((sum, cr) => sum + cr.score, 0);
  const maxScore = criteriaResults.reduce((sum, cr) => sum + cr.maxScore, 0);
  const achievement = maxScore > 0 ? rawScore / maxScore : 0;
  const score = achievement * 100;
  const weightedScore = achievement * dimension.weight;

  return {
    dimensionId: dimension.id as AstrologyEvaluationDimensionId,
    dimensionName: dimension.name,
    score,
    weightedScore,
    feedback: generateDimensionFeedback(dimension, achievement, criteriaResults),
    evidence: extractEvidence(criteriaResults),
    grade: scoreToGrade(score),
  };
}

function evaluateCriterion(
  criterion: EvaluationCriterion,
  input: AstrologyEvaluationInput
): CriterionResult {
  let measuredValue: number | string | boolean;
  let score: number;
  let feedback: string;
  let suggestion: string | undefined;

  const text = input.fullText;

  switch (criterion.checkType) {
    case 'presence':
      measuredValue = checkPresence(criterion.id, text, input);
      score = measuredValue ? criterion.maxScore : 0;
      feedback = measuredValue
        ? `${criterion.name} 확인됨`
        : `${criterion.name} 누락`;
      if (!measuredValue) {
        suggestion = `${criterion.name}을(를) 추가하세요.`;
      }
      break;

    case 'count':
      measuredValue = countOccurrences(criterion.id, text, input);
      const targetCount = criterion.target as number;
      const minCount = criterion.min || 0;

      score =
        measuredValue >= targetCount
          ? criterion.maxScore
          : criterion.maxScore * Math.min(1, measuredValue / targetCount);

      feedback = `${criterion.name}: ${measuredValue}회 (목표: ${targetCount})`;
      if (measuredValue < minCount) {
        suggestion = `${criterion.name} 표현을 ${targetCount - measuredValue}회 이상 추가하세요.`;
      }
      break;

    case 'ratio':
      measuredValue = calculateRatio(criterion.id, text, input);
      const targetRatio = criterion.target as number;
      score = criterion.maxScore * Math.min(1, measuredValue / targetRatio);
      feedback = `${criterion.name}: ${Math.round(measuredValue * 100)}% (목표: ${Math.round(targetRatio * 100)}%)`;
      if (measuredValue < (criterion.min || 0)) {
        suggestion = `${criterion.name} 비율을 높이세요.`;
      }
      break;

    case 'sentiment':
      measuredValue = analyzeSentiment(text);
      score =
        measuredValue === criterion.target
          ? criterion.maxScore
          : criterion.maxScore * 0.5;
      feedback = `전체 톤: ${measuredValue}`;
      break;

    default:
      measuredValue = false;
      score = 0;
      feedback = '평가 불가';
  }

  return {
    criterionId: criterion.id,
    score: Math.round(score * 10) / 10,
    maxScore: criterion.maxScore,
    achievement: score / criterion.maxScore,
    measuredValue,
    feedback,
    suggestion,
  };
}

// ============================================
// 체크 함수
// ============================================

function checkPresence(
  criterionId: string,
  text: string,
  input: AstrologyEvaluationInput
): boolean {
  const { chart, interpretation } = input;

  switch (criterionId) {
    // 천문학적 정확성
    case 'accuracy_sun_sign': {
      const sunPlanet = chart.planets.find((p) => p.id === 'sun');
      return sunPlanet ? text.includes(getSignKorean(sunPlanet.sign)) : false;
    }
    case 'accuracy_moon_sign': {
      const moonPlanet = chart.planets.find((p) => p.id === 'moon');
      return moonPlanet ? text.includes(getSignKorean(moonPlanet.sign)) : false;
    }
    case 'accuracy_ascendant': {
      const asc = chart.planets.find((p) => p.id === 'ascendant');
      return asc ? text.includes(getSignKorean(asc.sign)) || text.includes('상승점') : false;
    }
    case 'accuracy_chart_type':
      return chart.metadata.isNightChart
        ? text.includes('야간')
        : text.includes('주간');

    // 해석 일관성
    case 'consistency_planet_sign':
      return interpretation.planetsInSigns.length > 0;
    case 'consistency_house_context':
      return interpretation.planetsInHouses.length > 0;
    case 'consistency_overall_theme':
      return interpretation.overallThemes.length > 0;

    // 공감
    case 'empathy_growth':
      return text.includes('성장') || text.includes('기회') || text.includes('배움');
    case 'empathy_not_fault':
      return NOT_FAULT_PATTERNS.some((p) => p.test(text));

    // 희망
    case 'hope_future':
      return HOPE_PATTERNS.some((p) => p.test(text));
    case 'hope_talent':
      return text.includes('재능') || text.includes('강점') || text.includes('조화');

    // 실용성
    case 'practical_element':
      return (
        text.includes('보완') ||
        text.includes('보충') ||
        (text.includes('원소') && ADVICE_PATTERNS.test(text))
      );
    case 'practical_color_direction':
      return (
        text.includes('색상') ||
        text.includes('방향') ||
        text.includes('동쪽') ||
        text.includes('서쪽')
      );

    // 톤
    case 'tone_disclaimer':
      return (
        text.includes('운명이 아') ||
        text.includes('가능성') ||
        text.includes('경향성')
      );

    // 가독성
    case 'readability_korean':
      return !/(Sun|Moon|Mercury|Venus|Mars|Jupiter|Saturn)/i.test(text);
    case 'readability_paragraph':
      return text.split('\n\n').length >= 3;
    case 'readability_section':
      return (
        text.includes('===') ||
        text.includes('───') ||
        text.includes('📌') ||
        text.includes('🌟')
      );

    default:
      return false;
  }
}

function countOccurrences(
  criterionId: string,
  text: string,
  input: AstrologyEvaluationInput
): number {
  switch (criterionId) {
    case 'accuracy_houses':
      return (text.match(HOUSE_PATTERNS) || []).length;
    case 'accuracy_aspects':
      return (text.match(ASPECT_PATTERNS) || []).length;

    case 'symbol_element':
      return ELEMENT_PATTERNS.reduce(
        (sum, p) => sum + (text.match(p)?.length || 0),
        0
      );
    case 'symbol_nature':
      return NATURE_PATTERNS.reduce(
        (sum, p) => sum + (text.match(p)?.length || 0),
        0
      );

    case 'empathy_acknowledge':
      return EMPATHY_PATTERNS.reduce(
        (sum, p) => sum + (text.match(p)?.length || 0),
        0
      );
    case 'empathy_second_person':
      return (text.match(/당신/g) || []).length;

    case 'hope_possibility':
      return HOPE_PATTERNS.reduce(
        (sum, p) => sum + (text.match(p)?.length || 0),
        0
      );

    case 'practical_advice':
      return (text.match(ADVICE_PATTERNS) || []).length;
    case 'practical_career':
      return (text.match(CAREER_PATTERNS) || []).length;

    case 'tone_possibility':
      return POSSIBILITY_PATTERNS.reduce(
        (sum, p) => sum + (text.match(p)?.length || 0),
        0
      );

    default:
      return 0;
  }
}

function calculateRatio(
  criterionId: string,
  text: string,
  input: AstrologyEvaluationInput
): number {
  switch (criterionId) {
    case 'symbol_consistent': {
      const sections = input.sections;
      if (sections.length === 0) return 0;
      const sectionsWithSymbol = sections.filter(
        (s) =>
          ELEMENT_PATTERNS.some((p) => p.test(s.content)) ||
          NATURE_PATTERNS.some((p) => p.test(s.content))
      ).length;
      return sectionsWithSymbol / sections.length;
    }

    case 'hope_closing': {
      const sections = input.sections;
      if (sections.length === 0) return 0;
      const sectionsWithHope = sections.filter((s) => {
        const lastPart = s.content.slice(-150);
        return HOPE_PATTERNS.some((p) => p.test(lastPart));
      }).length;
      return sectionsWithHope / sections.length;
    }

    case 'tone_non_definitive': {
      const definitiveCount = DEFINITIVE_PATTERNS.reduce(
        (sum, p) => sum + (text.match(p)?.length || 0),
        0
      );
      const possibilityCount = POSSIBILITY_PATTERNS.reduce(
        (sum, p) => sum + (text.match(p)?.length || 0),
        0
      );
      const total = definitiveCount + possibilityCount;
      return total > 0 ? possibilityCount / total : 1;
    }

    case 'readability_terms': {
      const explainedCount = (text.match(EXPLAINED_TERM_PATTERN) || []).length;
      const aspectCount = (text.match(ASPECT_PATTERNS) || []).length;
      return aspectCount > 0 ? Math.min(1, explainedCount / aspectCount) : 1;
    }

    default:
      return 0;
  }
}

function analyzeSentiment(text: string): string {
  const positiveCount = HOPE_PATTERNS.reduce(
    (sum, p) => sum + (text.match(p)?.length || 0),
    0
  );
  const empathyCount = EMPATHY_PATTERNS.reduce(
    (sum, p) => sum + (text.match(p)?.length || 0),
    0
  );
  const negativeCount = (text.match(/어렵습니다|불행|실패/g) || []).length;

  const total = positiveCount + empathyCount + negativeCount;
  if (total === 0) return 'neutral';

  const positiveRatio = (positiveCount + empathyCount) / total;
  return positiveRatio > 0.6 ? 'positive' : positiveRatio < 0.4 ? 'negative' : 'neutral';
}

// ============================================
// 유틸리티
// ============================================

function getSignKorean(sign: string): string {
  const signMap: Record<string, string> = {
    aries: '양자리',
    taurus: '황소자리',
    gemini: '쌍둥이자리',
    cancer: '게자리',
    leo: '사자자리',
    virgo: '처녀자리',
    libra: '천칭자리',
    scorpio: '전갈자리',
    sagittarius: '사수자리',
    capricorn: '염소자리',
    aquarius: '물병자리',
    pisces: '물고기자리',
  };
  return signMap[sign] || sign;
}

function generateDimensionFeedback(
  dimension: EvaluationDimension,
  achievement: number,
  criteriaResults: CriterionResult[]
): string {
  const grade = scoreToGrade(achievement * 100);
  const failedCriteria = criteriaResults.filter((cr) => cr.achievement < 0.5);

  if (grade === 'A') return `${dimension.name} 우수`;
  if (grade === 'B') return `${dimension.name} 양호`;
  if (failedCriteria.length > 0) {
    return `${dimension.name} 개선 필요: ${failedCriteria[0].feedback}`;
  }
  return `${dimension.name} 보완 권장`;
}

function extractEvidence(criteriaResults: CriterionResult[]): string[] {
  return criteriaResults
    .filter((cr) => cr.achievement >= 0.5)
    .map((cr) => cr.feedback);
}

function generateDimensionSuggestion(dimensionResult: AstrologyDimensionResult): string {
  return `${dimensionResult.dimensionName} 영역을 보강하세요.`;
}

function generateOverallFeedback(
  totalScore: number,
  dimensionResults: AstrologyDimensionResult[]
): string {
  const grade = scoreToGrade(totalScore);
  const feedback = getGradeFeedback(grade);

  const weakDimensions = dimensionResults
    .filter((dr) => dr.score < 60)
    .map((dr) => dr.dimensionName);

  if (weakDimensions.length > 0) {
    return `${feedback} ${weakDimensions.slice(0, 2).join(', ')} 영역 개선을 권장합니다.`;
  }
  return feedback;
}

function generateImprovementPoints(
  dimensionResults: AstrologyDimensionResult[]
): AstrologyImprovementPoint[] {
  const sortedDimensions = [...dimensionResults].sort(
    (a, b) => a.score - b.score
  );

  return sortedDimensions
    .filter((dr) => dr.score < 80)
    .slice(0, 3)
    .map((dr, i) => ({
      dimension: dr.dimensionId,
      issue: `${dr.dimensionName} 점수가 낮습니다 (${Math.round(dr.score)}점)`,
      suggestion: generateDimensionSuggestion(dr),
      priority: i + 1,
      expectedImpact: Math.round((100 - dr.score) * 0.1),
    }));
}

// ============================================
// 간편 함수
// ============================================

/**
 * 텍스트만으로 간단 평가
 */
export function quickEvaluateAstrology(fullText: string): {
  score: number;
  issues: string[];
} {
  const issues: string[] = [];
  let score = 100;

  // 공감 표현 체크
  const hasEmpathy = EMPATHY_PATTERNS.some((p) => p.test(fullText));
  if (!hasEmpathy) {
    issues.push('공감 표현 부족');
    score -= 10;
  }

  // 희망 표현 체크
  const hasHope = HOPE_PATTERNS.some((p) => p.test(fullText));
  if (!hasHope) {
    issues.push('희망적 메시지 부족');
    score -= 10;
  }

  // 단정 표현 체크
  const hasDefinitive = DEFINITIVE_PATTERNS.some((p) => p.test(fullText));
  if (hasDefinitive) {
    issues.push('단정적 표현 사용');
    score -= 15;
  }

  // 조언 체크
  const hasAdvice = ADVICE_PATTERNS.test(fullText);
  if (!hasAdvice) {
    issues.push('구체적 조언 부족');
    score -= 10;
  }

  // 면책 체크
  const hasDisclaimer =
    fullText.includes('가능성') || fullText.includes('경향');
  if (!hasDisclaimer) {
    issues.push('면책 표현 부족');
    score -= 5;
  }

  return { score: Math.max(0, score), issues };
}
