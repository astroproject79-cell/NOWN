/**
 * 스토리 품질 평가 엔진
 *
 * 생성된 "삶의 구조 설명서"를 다차원으로 평가합니다.
 */

import type {
  EvaluationInput,
  EvaluationResult,
  DimensionResult,
  CriterionResult,
  EvaluationDimension,
  EvaluationCriterion,
  EvaluationDimensionId,
} from './types';

import dimensionsData from './data/dimensions.json';

// ============================================
// 상수 & 패턴
// ============================================

/** 공감 표현 패턴 */
const EMPATHY_PATTERNS = [
  /이미 충분히/g,
  /버텨온|버텨왔/g,
  /고생|어려움|힘들/g,
  /당신의 노력/g,
  /쉽지 않았/g,
  /혼자서|스스로/g,
  /인정합니다/g,
  /충분한 사람/g,
];

/** 이해 표현 패턴 */
const UNDERSTANDING_PATTERNS = [
  /했을 것입니다/g,
  /했을 것이다/g,
  /어려웠을/g,
  /느꼈을/g,
  /보였을/g,
  /살아왔을/g,
  /겪었을/g,
];

/** 희망 표현 패턴 */
const HOPE_PATTERNS = [
  /할 수 있/g,
  /될 것입니다/g,
  /될 것이다/g,
  /가능합니다/g,
  /빛날|빛나는/g,
  /성장할|발전할/g,
  /좋아질/g,
  /기회가/g,
  /희망/g,
];

/** 단정적 표현 패턴 */
const DEFINITIVE_PATTERNS = [
  /반드시.+입니다/g,
  /틀림없이/g,
  /무조건/g,
  /확실히.+입니다/g,
];

/** 가능성 표현 패턴 */
const POSSIBILITY_PATTERNS = [
  /일 수 있/g,
  /수도 있/g,
  /경향이 있/g,
  /가능성이/g,
  /보입니다/g,
  /추측됩니다/g,
];

/** 전문 용어 패턴 */
const JARGON_PATTERNS = [
  /십신|十神/g,
  /비견|겁재|식신|상관|편재|정재|편관|정관|편인|정인/g,
  /갑목|을목|병화|정화|무토|기토|경금|신금|임수|계수/g,
  /천간|지지|간지/g,
  /격국|용신|희신|기신/g,
  /대운|세운|월운/g,
  /합충형해파/g,
];

/** 용어 설명 패턴 (괄호 설명) */
const EXPLAINED_JARGON_PATTERN = /[가-힣]+\([^)]+\)/g;

// ============================================
// 메인 평가 함수
// ============================================

/**
 * 스토리 품질 평가
 *
 * @param input - 평가 대상 스토리
 * @returns 평가 결과
 */
export function evaluateStory(input: EvaluationInput): EvaluationResult {
  const dimensions = dimensionsData.dimensions as EvaluationDimension[];

  // 1. 차원별 평가 수행
  const dimensionResults: DimensionResult[] = dimensions.map((dimension) =>
    evaluateDimension(dimension, input)
  );

  // 2. 전체 점수 계산 (가중 평균)
  const totalScore = dimensionResults.reduce(
    (sum, dr) => sum + dr.weightedScore,
    0
  );

  // 3. 강점/약점 분석
  const sortedDimensions = [...dimensionResults].sort(
    (a, b) => b.achievement - a.achievement
  );

  const strengths = sortedDimensions.slice(0, 3).map((dr) => ({
    dimensionId: dr.dimensionId,
    name: dr.dimensionName,
    score: dr.achievement * 100,
  }));

  const weaknesses = sortedDimensions
    .slice(-3)
    .reverse()
    .map((dr) => ({
      dimensionId: dr.dimensionId,
      name: dr.dimensionName,
      score: dr.achievement * 100,
      suggestion: generateDimensionSuggestion(dr),
    }));

  // 4. 종합 피드백 생성
  const overallFeedback = generateOverallFeedback(totalScore, dimensionResults);

  // 5. 우선 개선 사항 도출
  const priorityImprovements = generatePriorityImprovements(dimensionResults);

  return {
    id: generateId(),
    evaluatedAt: new Date().toISOString(),
    totalScore: Math.round(totalScore * 10) / 10,
    totalGrade: scoreToGrade(totalScore),
    dimensionResults,
    strengths,
    weaknesses,
    overallFeedback,
    priorityImprovements,
  };
}

// ============================================
// 차원별 평가
// ============================================

/**
 * 단일 차원 평가
 */
function evaluateDimension(
  dimension: EvaluationDimension,
  input: EvaluationInput
): DimensionResult {
  // 기준별 평가
  const criteriaResults: CriterionResult[] = dimension.criteria.map(
    (criterion) => evaluateCriterion(criterion, input)
  );

  // 점수 계산
  const rawScore = criteriaResults.reduce((sum, cr) => sum + cr.score, 0);
  const maxScore = criteriaResults.reduce((sum, cr) => sum + cr.maxScore, 0);
  const achievement = maxScore > 0 ? rawScore / maxScore : 0;
  const weightedScore = achievement * dimension.weight;

  // 요약 생성
  const summary = generateDimensionSummary(dimension, achievement, criteriaResults);

  return {
    dimensionId: dimension.id as EvaluationDimensionId,
    dimensionName: dimension.name,
    rawScore,
    maxScore,
    achievement,
    weightedScore,
    criteriaResults,
    summary,
    grade: scoreToGrade(achievement * 100),
  };
}

/**
 * 단일 기준 평가
 */
function evaluateCriterion(
  criterion: EvaluationCriterion,
  input: EvaluationInput
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
        ? `${criterion.name}이(가) 확인되었습니다.`
        : `${criterion.name}이(가) 누락되었습니다.`;
      if (!measuredValue) {
        suggestion = `${criterion.name}을(를) 추가하세요.`;
      }
      break;

    case 'count':
      measuredValue = countOccurrences(criterion.id, text, input);
      const targetCount = criterion.target as number;
      const minCount = criterion.min || 0;
      const maxCount = criterion.max;

      if (maxCount !== undefined) {
        // 최대값 기준 (적을수록 좋음)
        score =
          measuredValue <= targetCount
            ? criterion.maxScore
            : Math.max(
                0,
                criterion.maxScore * (1 - (measuredValue - targetCount) / maxCount)
              );
      } else {
        // 최소값 기준 (많을수록 좋음)
        score =
          measuredValue >= targetCount
            ? criterion.maxScore
            : criterion.maxScore * Math.min(1, measuredValue / targetCount);
      }

      feedback = `${criterion.name}: ${measuredValue}회 발견 (목표: ${targetCount})`;
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

    case 'pattern':
      measuredValue = checkPattern(criterion.id, text);
      score = measuredValue ? criterion.maxScore : criterion.maxScore * 0.5;
      feedback = measuredValue
        ? `${criterion.name} 패턴이 확인되었습니다.`
        : `${criterion.name} 패턴이 부족합니다.`;
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
      feedback = '평가할 수 없습니다.';
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
// 체크 함수들
// ============================================

/**
 * 존재 여부 체크
 */
function checkPresence(
  criterionId: string,
  text: string,
  input: EvaluationInput
): boolean {
  switch (criterionId) {
    case 'structure_intro':
      return text.includes('통변문') || text.includes('설명서');

    case 'structure_basic':
      return (
        text.includes('인생 구조') ||
        text.includes('기본 구조') ||
        input.sections.some((s) => s.title.includes('구조'))
      );

    case 'structure_advice':
      return (
        text.includes('편하게') ||
        text.includes('개운') ||
        input.sections.some((s) => s.title.includes('방법'))
      );

    case 'structure_relationship':
      return (
        text.includes('연애') ||
        text.includes('관계') ||
        input.sections.some((s) => s.title.includes('관계'))
      );

    case 'structure_career':
      return (
        text.includes('직업') ||
        text.includes('직장') ||
        input.sections.some((s) => s.title.includes('직업'))
      );

    case 'structure_key_sentence':
      return text.includes('기억해야 할') || input.keySentence.length > 0;

    case 'structure_conclusion':
      return (
        text.includes('단정하지 않습니다') || text.includes('네비게이션')
      );

    case 'metaphor_central':
      return input.metaphor.centralImage.length > 0;

    case 'empathy_not_fault':
      return (
        text.includes('당신 탓이 아') ||
        text.includes('충분한 사람') ||
        text.includes('이미 충분히')
      );

    case 'hope_future':
      return HOPE_PATTERNS.some((p) => p.test(text));

    case 'hope_change':
      return text.includes('운') && (text.includes('들어오') || text.includes('변화'));

    case 'practical_avoid':
      return text.includes('피해야') || text.includes('주의');

    case 'practical_action':
      return text.includes('실천') || text.includes('행동') || text.includes('Action');

    case 'tone_disclaimer':
      return (
        text.includes('단정이 아') ||
        text.includes('예언이 아') ||
        text.includes('가능성')
      );

    case 'readability_paragraph':
      return text.split('\n\n').length >= 5;

    case 'readability_divider':
      return text.includes('────') || text.includes('---');

    case 'journey_empathy_first':
      const first500 = text.slice(0, 500);
      return EMPATHY_PATTERNS.some((p) => p.test(first500));

    case 'journey_understanding':
      return text.includes('구조') && text.includes('의미');

    case 'journey_hope_end':
      const last500 = text.slice(-500);
      return HOPE_PATTERNS.some((p) => p.test(last500));

    default:
      return false;
  }
}

/**
 * 발생 횟수 카운트
 */
function countOccurrences(
  criterionId: string,
  text: string,
  input: EvaluationInput
): number {
  switch (criterionId) {
    case 'empathy_validation':
      return EMPATHY_PATTERNS.reduce(
        (sum, p) => sum + (text.match(p)?.length || 0),
        0
      );

    case 'empathy_understanding':
      return UNDERSTANDING_PATTERNS.reduce(
        (sum, p) => sum + (text.match(p)?.length || 0),
        0
      );

    case 'empathy_second_person':
      return (text.match(/당신/g)?.length || 0);

    case 'hope_possibility':
      return HOPE_PATTERNS.reduce(
        (sum, p) => sum + (text.match(p)?.length || 0),
        0
      );

    case 'practical_advice':
      return (
        (text.match(/하세요|하십시오|추천합니다|좋습니다/g)?.length || 0)
      );

    case 'practical_career':
      return (text.match(/직업|직장|업종|분야/g)?.length || 0);

    case 'metaphor_extension':
      const centralImage = input.metaphor.centralImage;
      const keywords = centralImage.split(/\s+/).filter((w) => w.length > 1);
      return keywords.reduce(
        (sum, kw) => sum + (text.split(kw).length - 1),
        0
      );

    case 'metaphor_natural':
      return (
        text.match(/봄|여름|가을|겨울|태양|달|불|물|나무|땅|바람|비|눈/g)
          ?.length || 0
      );

    case 'readability_jargon':
      return JARGON_PATTERNS.reduce(
        (sum, p) => sum + (text.match(p)?.length || 0),
        0
      );

    default:
      return 0;
  }
}

/**
 * 비율 계산
 */
function calculateRatio(
  criterionId: string,
  text: string,
  input: EvaluationInput
): number {
  switch (criterionId) {
    case 'metaphor_consistency':
      const centralImage = input.metaphor.centralImage;
      const keywords = centralImage.split(/\s+/).filter((w) => w.length > 1);
      const sectionCount = input.sections.length;
      const sectionsWithMetaphor = input.sections.filter((s) =>
        keywords.some((kw) => s.content.includes(kw))
      ).length;
      return sectionCount > 0 ? sectionsWithMetaphor / sectionCount : 0;

    case 'tone_non_definitive':
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

    case 'readability_explain':
      const jargonCount = JARGON_PATTERNS.reduce(
        (sum, p) => sum + (text.match(p)?.length || 0),
        0
      );
      const explainedCount = text.match(EXPLAINED_JARGON_PATTERN)?.length || 0;
      return jargonCount > 0 ? Math.min(1, explainedCount / jargonCount) : 1;

    case 'readability_sentence':
      const sentences = text.split(/[.!?]\s+/);
      const goodLengthSentences = sentences.filter(
        (s) => s.length >= 20 && s.length <= 80
      ).length;
      return sentences.length > 0 ? goodLengthSentences / sentences.length : 0;

    case 'hope_closing':
      const sectionsWithHope = input.sections.filter((s) => {
        const lastPart = s.content.slice(-200);
        return HOPE_PATTERNS.some((p) => p.test(lastPart));
      }).length;
      return input.sections.length > 0
        ? sectionsWithHope / input.sections.length
        : 0;

    default:
      return 0;
  }
}

/**
 * 패턴 체크
 */
function checkPattern(criterionId: string, text: string): boolean {
  switch (criterionId) {
    case 'possibility_pattern':
      return POSSIBILITY_PATTERNS.some((p) => p.test(text));

    case 'emotional_flow':
      // 공감 → 이해 → 희망 순서 체크
      const empathyPos = findFirstMatch(text, EMPATHY_PATTERNS);
      const understandingPos = findFirstMatch(text, UNDERSTANDING_PATTERNS);
      const hopePos = findLastMatch(text, HOPE_PATTERNS);
      return empathyPos < understandingPos && understandingPos < hopePos;

    default:
      return false;
  }
}

/**
 * 감성 분석 (간단 버전)
 */
function analyzeSentiment(text: string): string {
  const positiveCount = HOPE_PATTERNS.reduce(
    (sum, p) => sum + (text.match(p)?.length || 0),
    0
  );
  const empathyCount = EMPATHY_PATTERNS.reduce(
    (sum, p) => sum + (text.match(p)?.length || 0),
    0
  );
  const negativeCount = (text.match(/불행|실패|안됩니다|어렵습니다/g)?.length || 0);

  const total = positiveCount + empathyCount + negativeCount;
  if (total === 0) return 'neutral';

  const positiveRatio = (positiveCount + empathyCount) / total;
  return positiveRatio > 0.6 ? 'positive' : positiveRatio < 0.4 ? 'negative' : 'neutral';
}

// ============================================
// 피드백 생성
// ============================================

/**
 * 차원별 요약 생성
 */
function generateDimensionSummary(
  dimension: EvaluationDimension,
  achievement: number,
  criteriaResults: CriterionResult[]
): string {
  const grade = scoreToGrade(achievement * 100);
  const failedCriteria = criteriaResults.filter((cr) => cr.achievement < 0.5);

  if (grade === 'A') {
    return `${dimension.name}이(가) 우수합니다.`;
  } else if (grade === 'B') {
    return `${dimension.name}이(가) 양호합니다.`;
  } else if (failedCriteria.length > 0) {
    const issues = failedCriteria.map((cr) => cr.criterionId).join(', ');
    return `${dimension.name}에서 개선이 필요합니다: ${failedCriteria[0].feedback}`;
  } else {
    return `${dimension.name}을(를) 보완하면 좋겠습니다.`;
  }
}

/**
 * 차원별 제안 생성
 */
function generateDimensionSuggestion(dimensionResult: DimensionResult): string {
  const worstCriterion = dimensionResult.criteriaResults
    .filter((cr) => cr.suggestion)
    .sort((a, b) => a.achievement - b.achievement)[0];

  return worstCriterion?.suggestion || `${dimensionResult.dimensionName}을(를) 보강하세요.`;
}

/**
 * 종합 피드백 생성
 */
function generateOverallFeedback(
  totalScore: number,
  dimensionResults: DimensionResult[]
): string {
  const grade = scoreToGrade(totalScore);

  const gradeMessages: Record<string, string> = {
    A: '전체적으로 매우 우수한 품질의 통변문입니다.',
    B: '양호한 품질이지만 일부 영역에서 개선이 가능합니다.',
    C: '기본적인 구조는 갖추었으나 여러 영역에서 보완이 필요합니다.',
    D: '주요 영역에서 개선이 필요합니다.',
    F: '전반적인 재검토가 필요합니다.',
  };

  const weakDimensions = dimensionResults
    .filter((dr) => dr.achievement < 0.6)
    .map((dr) => dr.dimensionName);

  let feedback = gradeMessages[grade];

  if (weakDimensions.length > 0) {
    feedback += ` 특히 ${weakDimensions.slice(0, 2).join(', ')} 부분을 중점적으로 개선하면 좋겠습니다.`;
  }

  return feedback;
}

/**
 * 우선 개선 사항 생성
 */
function generatePriorityImprovements(
  dimensionResults: DimensionResult[]
): any[] {
  const improvements: any[] = [];

  // 가장 낮은 점수의 차원부터 개선 제안
  const sortedDimensions = [...dimensionResults].sort(
    (a, b) => a.achievement - b.achievement
  );

  for (let i = 0; i < Math.min(3, sortedDimensions.length); i++) {
    const dim = sortedDimensions[i];
    if (dim.achievement >= 0.8) continue; // 이미 좋은 차원은 스킵

    const worstCriteria = dim.criteriaResults
      .filter((cr) => cr.achievement < 0.7)
      .sort((a, b) => a.achievement - b.achievement)
      .slice(0, 2);

    for (const criterion of worstCriteria) {
      improvements.push({
        id: `improve_${dim.dimensionId}_${criterion.criterionId}`,
        targetDimension: dim.dimensionId,
        targetCriterion: criterion.criterionId,
        priority: i + 1,
        type: getImprovementType(dim.dimensionId, criterion.criterionId),
        description: criterion.suggestion || `${criterion.criterionId} 개선 필요`,
        action: generateAction(dim.dimensionId, criterion.criterionId),
        expectedImpact: (1 - criterion.achievement) * criterion.maxScore,
      });
    }
  }

  return improvements.slice(0, 5);
}

// ============================================
// 유틸리티 함수
// ============================================

function generateId(): string {
  return `eval_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function scoreToGrade(score: number): 'A' | 'B' | 'C' | 'D' | 'F' {
  if (score >= 90) return 'A';
  if (score >= 80) return 'B';
  if (score >= 70) return 'C';
  if (score >= 60) return 'D';
  return 'F';
}

function findFirstMatch(text: string, patterns: RegExp[]): number {
  let minPos = text.length;
  for (const p of patterns) {
    const match = text.match(p);
    if (match && match.index !== undefined) {
      minPos = Math.min(minPos, match.index);
    }
  }
  return minPos;
}

function findLastMatch(text: string, patterns: RegExp[]): number {
  let maxPos = 0;
  for (const p of patterns) {
    const matches = text.matchAll(new RegExp(p.source, 'g'));
    for (const match of matches) {
      if (match.index !== undefined) {
        maxPos = Math.max(maxPos, match.index);
      }
    }
  }
  return maxPos;
}

function getImprovementType(dimensionId: string, criterionId: string): string {
  if (dimensionId === 'empathy') return 'add_empathy';
  if (dimensionId === 'hope') return 'add_hope';
  if (dimensionId === 'metaphor') return 'add_metaphor';
  if (dimensionId === 'practicality') return 'add_advice';
  if (dimensionId === 'readability') return 'simplify';
  if (dimensionId === 'structure') return 'restructure';
  return 'modify_tone';
}

function generateAction(dimensionId: string, criterionId: string): string {
  const actions: Record<string, Record<string, string>> = {
    empathy: {
      empathy_validation: '"이미 충분히 열심히 살고 있습니다"와 같은 인정 표현을 추가하세요.',
      empathy_understanding: '"~했을 것입니다"와 같은 이해 표현을 추가하세요.',
      empathy_not_fault: '"당신 탓이 아닙니다"와 같은 위로 표현을 추가하세요.',
    },
    hope: {
      hope_future: '긍정적인 미래 전망을 구체적으로 제시하세요.',
      hope_possibility: '"~할 수 있습니다"와 같은 가능성 표현을 추가하세요.',
      hope_change: '운의 변화에 따른 긍정적 변화를 언급하세요.',
    },
    metaphor: {
      metaphor_consistency: '각 섹션에서 중심 메타포를 연결하여 사용하세요.',
      metaphor_natural: '계절, 자연 요소 비유를 더 활용하세요.',
    },
    readability: {
      readability_jargon: '전문 용어를 줄이거나 괄호로 설명을 추가하세요.',
      readability_sentence: '긴 문장을 나누어 가독성을 높이세요.',
    },
  };

  return (
    actions[dimensionId]?.[criterionId] || '해당 영역을 보완하세요.'
  );
}

// ============================================
// 편의 함수
// ============================================

/**
 * 간단 평가 (텍스트만으로)
 */
export function quickEvaluate(fullText: string): EvaluationResult {
  // 간단한 섹션 파싱
  const sectionTexts = fullText.split(/─{3,}|\n\n\d+\.\s/);
  const sections = sectionTexts.map((content, i) => ({
    id: `section_${i}`,
    title: `섹션 ${i}`,
    content,
  }));

  const input: EvaluationInput = {
    fullText,
    sections,
    metaphor: { centralImage: '', tone: '' },
    lifeType: { primary: '' },
    keySentence: '',
  };

  return evaluateStory(input);
}
