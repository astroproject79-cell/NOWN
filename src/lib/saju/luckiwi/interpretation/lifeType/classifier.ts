/**
 * 삶의 유형 분류기
 *
 * 사주 분석 결과를 기반으로 삶의 유형을 분류합니다.
 */

import type {
  LifeTypeId,
  LifeTypeDefinition,
  LifeTypeClassificationInput,
  LifeTypeClassificationResult,
  DayMasterStrength,
} from './types';

import lifeTypesData from './data/lifeTypes.json';

// ============================================
// 상수
// ============================================

/**
 * 십신 그룹핑
 */
const TEN_GOD_GROUPS = {
  comparison: ['비견', '겁재'], // 비겁
  output: ['식신', '상관'], // 식상
  wealth: ['편재', '정재'], // 재성
  authority: ['편관', '정관'], // 관성
  resource: ['편인', '정인'], // 인성
};

/**
 * 분류 규칙 (우선순위 순)
 */
const CLASSIFICATION_RULES: {
  typeId: LifeTypeId;
  priority: number;
  check: (input: LifeTypeClassificationInput) => number;
}[] = [
  // 1. 자수성가형 - 인성 부족 + 비겁 강 또는 신약 + 식상 과다
  {
    typeId: 'self_made',
    priority: 100,
    check: (input) => {
      let score = 0;
      const resourceCount = getGroupCount(input, 'resource');
      const comparisonCount = getGroupCount(input, 'comparison');
      const outputCount = getGroupCount(input, 'output');

      // 인성 부족 (2개 이하)
      if (resourceCount <= 2) score += 30;

      // 비겁 강 (3개 이상)
      if (comparisonCount >= 3) score += 25;

      // 신약 + 식상 과다
      if (input.dayMasterStrength === 'weak' && outputCount >= 3) score += 35;

      // 신약 단독
      if (input.dayMasterStrength === 'weak') score += 10;

      return score;
    },
  },

  // 2. 부모덕형 - 인성 강 + 관성 있음
  {
    typeId: 'parent_blessed',
    priority: 90,
    check: (input) => {
      let score = 0;
      const resourceCount = getGroupCount(input, 'resource');
      const authorityCount = getGroupCount(input, 'authority');

      // 인성 강 (3개 이상)
      if (resourceCount >= 3) score += 40;

      // 관성 있음
      if (authorityCount >= 1) score += 20;

      // 신강
      if (input.dayMasterStrength === 'strong') score += 15;

      return score;
    },
  },

  // 3. 귀인형 - 귀인 존재 + 인성/관성 균형
  {
    typeId: 'noble_aided',
    priority: 85,
    check: (input) => {
      let score = 0;

      // 귀인 존재
      if (input.hasNoble) score += 50;

      // 정관정인 조합
      const { 정관, 정인 } = input.tenGodDistribution;
      if (정관 >= 1 && 정인 >= 1) score += 30;

      return score;
    },
  },

  // 4. 창업형 - 재성 강 + 식상생재
  {
    typeId: 'entrepreneur',
    priority: 80,
    check: (input) => {
      let score = 0;
      const wealthCount = getGroupCount(input, 'wealth');
      const outputCount = getGroupCount(input, 'output');

      // 재성 강 (3개 이상)
      if (wealthCount >= 3) score += 35;

      // 식상생재 (식상 + 재성 모두 존재)
      if (outputCount >= 1 && wealthCount >= 1) score += 25;

      // 신강하면 더 유리
      if (input.dayMasterStrength === 'strong') score += 15;

      return score;
    },
  },

  // 5. 전문가형 - 상관 + 편인 또는 식신 + 정인
  {
    typeId: 'specialist',
    priority: 75,
    check: (input) => {
      let score = 0;
      const { 상관, 편인, 식신, 정인 } = input.tenGodDistribution;

      // 상관 + 편인 조합
      if (상관 >= 1 && 편인 >= 1) score += 40;

      // 식신 + 정인 조합
      if (식신 >= 1 && 정인 >= 1) score += 40;

      // 식상 단독 강함
      const outputCount = getGroupCount(input, 'output');
      if (outputCount >= 2) score += 20;

      return score;
    },
  },

  // 6. 리더형 - 정관 + 인성
  {
    typeId: 'leader',
    priority: 70,
    check: (input) => {
      let score = 0;
      const { 정관, 정인, 편인 } = input.tenGodDistribution;
      const authorityCount = getGroupCount(input, 'authority');

      // 정관 + 인성 조합
      if (정관 >= 1 && (정인 >= 1 || 편인 >= 1)) score += 45;

      // 관성 강
      if (authorityCount >= 2) score += 25;

      // 신강하면 더 유리
      if (input.dayMasterStrength === 'strong') score += 10;

      return score;
    },
  },

  // 7. 예술가형 - 식상 강 + 재성 약
  {
    typeId: 'artist',
    priority: 65,
    check: (input) => {
      let score = 0;
      const outputCount = getGroupCount(input, 'output');
      const wealthCount = getGroupCount(input, 'wealth');

      // 식상 강 (3개 이상)
      if (outputCount >= 3) score += 40;

      // 재성 약 (1개 이하)
      if (wealthCount <= 1) score += 20;

      // 상관이 특히 강하면
      if (input.tenGodDistribution.상관 >= 2) score += 15;

      return score;
    },
  },

  // 8. 학자형 - 인성 과다 + 식상 있음
  {
    typeId: 'scholar',
    priority: 60,
    check: (input) => {
      let score = 0;
      const resourceCount = getGroupCount(input, 'resource');
      const outputCount = getGroupCount(input, 'output');

      // 인성 과다 (4개 이상)
      if (resourceCount >= 4) score += 45;

      // 식상 있음 (지식 전달)
      if (outputCount >= 1) score += 20;

      return score;
    },
  },

  // 9. 조력자형 - 인성 강 + 비겁 약 + 관성 강
  {
    typeId: 'supporter',
    priority: 55,
    check: (input) => {
      let score = 0;
      const resourceCount = getGroupCount(input, 'resource');
      const comparisonCount = getGroupCount(input, 'comparison');
      const authorityCount = getGroupCount(input, 'authority');

      // 인성 강
      if (resourceCount >= 2) score += 20;

      // 비겁 약 (주체성 약함)
      if (comparisonCount <= 1) score += 25;

      // 관성 강 (남을 돕는 구조)
      if (authorityCount >= 2) score += 25;

      // 신약
      if (input.dayMasterStrength === 'weak') score += 10;

      return score;
    },
  },

  // 10. 모험가형 - 역마/해외 관련 패턴 또는 비겁+식상 조합
  {
    typeId: 'adventurer',
    priority: 50,
    check: (input) => {
      let score = 0;
      const comparisonCount = getGroupCount(input, 'comparison');
      const outputCount = getGroupCount(input, 'output');

      // 특수 패턴 (역마 등)
      if (input.specialPatterns?.includes('역마')) score += 40;
      if (input.specialPatterns?.includes('화개')) score += 20;

      // 비겁 + 식상 조합 (자유로운 활동)
      if (comparisonCount >= 2 && outputCount >= 2) score += 25;

      // 수(水) 오행 강 (변화/이동)
      if (input.elementDistribution.수 >= 3) score += 15;

      return score;
    },
  },
];

// ============================================
// 유틸리티 함수
// ============================================

/**
 * 십신 그룹 카운트
 */
function getGroupCount(
  input: LifeTypeClassificationInput,
  group: keyof typeof TEN_GOD_GROUPS
): number {
  const tenGods = TEN_GOD_GROUPS[group];
  return tenGods.reduce((sum, tenGod) => {
    return (
      sum + (input.tenGodDistribution[tenGod as keyof typeof input.tenGodDistribution] || 0)
    );
  }, 0);
}

/**
 * 유형 정의 가져오기
 */
export function getLifeTypeDefinition(
  typeId: LifeTypeId
): LifeTypeDefinition | null {
  const definition = lifeTypesData.definitions.find((d) => d.id === typeId);
  return definition as LifeTypeDefinition | null;
}

/**
 * 모든 유형 정의 가져오기
 */
export function getAllLifeTypeDefinitions(): LifeTypeDefinition[] {
  return lifeTypesData.definitions as LifeTypeDefinition[];
}

// ============================================
// 메인 분류 함수
// ============================================

/**
 * 삶의 유형 분류
 *
 * @param input - 분류 입력 데이터
 * @returns 분류 결과
 */
export function classifyLifeType(
  input: LifeTypeClassificationInput
): LifeTypeClassificationResult {
  // 1. 모든 규칙에 대해 점수 계산
  const scores = CLASSIFICATION_RULES.map((rule) => {
    const score = rule.check(input);
    return {
      typeId: rule.typeId,
      score,
      matchedRules: score > 0 ? [rule.typeId] : [],
    };
  })
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score);

  // 2. 주요 유형 결정
  const primaryTypeId = scores[0]?.typeId || 'self_made';
  const primaryType = getLifeTypeDefinition(primaryTypeId)!;

  // 3. 보조 유형 결정 (2위가 1위의 70% 이상 점수면)
  let secondaryType: LifeTypeDefinition | undefined;
  if (scores.length >= 2 && scores[1].score >= scores[0].score * 0.7) {
    secondaryType = getLifeTypeDefinition(scores[1].typeId) || undefined;
  }

  // 4. 분류 근거 생성
  const reasoning = generateReasoning(input, scores[0]);

  return {
    primaryType,
    secondaryType,
    scores,
    reasoning,
  };
}

/**
 * 분류 근거 생성
 */
function generateReasoning(
  input: LifeTypeClassificationInput,
  topScore: { typeId: LifeTypeId; score: number }
): string {
  const typeDefinition = getLifeTypeDefinition(topScore.typeId);
  if (!typeDefinition) return '';

  const reasons: string[] = [];

  // 일간 강약 관련
  if (input.dayMasterStrength === 'weak') {
    reasons.push('일간이 약하여');
  } else if (input.dayMasterStrength === 'strong') {
    reasons.push('일간이 강하여');
  }

  // 십신 분포 관련
  const resourceCount = getGroupCount(input, 'resource');
  const outputCount = getGroupCount(input, 'output');
  const wealthCount = getGroupCount(input, 'wealth');
  const authorityCount = getGroupCount(input, 'authority');
  const comparisonCount = getGroupCount(input, 'comparison');

  if (resourceCount >= 3) reasons.push('인성이 강하고');
  if (resourceCount <= 1) reasons.push('인성이 약하고');
  if (outputCount >= 3) reasons.push('식상이 과다하고');
  if (wealthCount >= 3) reasons.push('재성이 강하고');
  if (authorityCount >= 2) reasons.push('관성이 있어');
  if (comparisonCount >= 3) reasons.push('비겁이 강하여');

  // 귀인 관련
  if (input.hasNoble) reasons.push('귀인이 있어');

  const reasonText =
    reasons.length > 0 ? reasons.join(' ') + ' ' : '사주 구조를 분석한 결과 ';

  return `${reasonText}${typeDefinition.name}의 특성이 강하게 나타납니다. ${typeDefinition.summary}`;
}

// ============================================
// 간편 분류 함수
// ============================================

/**
 * 간편 분류 (십신 카운트만으로)
 */
export function quickClassify(
  tenGodCounts: {
    비견?: number;
    겁재?: number;
    식신?: number;
    상관?: number;
    편재?: number;
    정재?: number;
    편관?: number;
    정관?: number;
    편인?: number;
    정인?: number;
  },
  dayMasterStrength: DayMasterStrength = 'neutral'
): LifeTypeClassificationResult {
  const input: LifeTypeClassificationInput = {
    dayMasterStrength,
    tenGodDistribution: {
      비견: tenGodCounts.비견 || 0,
      겁재: tenGodCounts.겁재 || 0,
      식신: tenGodCounts.식신 || 0,
      상관: tenGodCounts.상관 || 0,
      편재: tenGodCounts.편재 || 0,
      정재: tenGodCounts.정재 || 0,
      편관: tenGodCounts.편관 || 0,
      정관: tenGodCounts.정관 || 0,
      편인: tenGodCounts.편인 || 0,
      정인: tenGodCounts.정인 || 0,
    },
    elementDistribution: {
      목: 0,
      화: 0,
      토: 0,
      금: 0,
      수: 0,
    },
  };

  return classifyLifeType(input);
}
