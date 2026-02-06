/**
 * 스토리 개선 도우미
 *
 * 평가 결과를 기반으로 구체적인 텍스트 개선 제안을 생성합니다.
 */

import type {
  EvaluationResult,
  ImprovementSuggestion,
  EvaluationDimensionId,
  EvaluationInput,
} from './types';

// ============================================
// 개선 텍스트 템플릿
// ============================================

/** 공감 표현 템플릿 */
const EMPATHY_TEMPLATES = [
  '당신은 이미 충분히 열심히 살고 있습니다.',
  '지금까지 버텨온 것만으로도 대단한 일입니다.',
  '그 어려운 시간을 혼자 감당해왔을 당신을 존경합니다.',
  '누구도 당신의 노력을 폄하할 수 없습니다.',
  '힘들었을 것입니다. 그리고 그건 당신 탓이 아닙니다.',
];

/** 이해 표현 템플릿 */
const UNDERSTANDING_TEMPLATES = [
  '이런 구조를 가진 분들은 종종 ~했을 것입니다.',
  '어린 시절부터 남다른 책임감을 느꼈을 것입니다.',
  '때로는 왜 나만 이렇게 힘든지 의문이 들었을 것입니다.',
  '주변의 기대에 부응하느라 지쳤을 것입니다.',
  '자신의 감정보다 타인을 먼저 생각했을 것입니다.',
];

/** 희망 표현 템플릿 */
const HOPE_TEMPLATES = [
  '이제 당신의 시간이 오고 있습니다.',
  '앞으로 펼쳐질 가능성은 무궁무진합니다.',
  '점점 더 빛나는 시기가 다가오고 있습니다.',
  '당신이 쌓아온 모든 것들이 결실을 맺을 것입니다.',
  '변화의 바람이 불어오고 있습니다.',
];

/** 실용적 조언 템플릿 */
const PRACTICAL_TEMPLATES = [
  '구체적으로 ~을(를) 시도해 보세요.',
  '매일 작은 것부터 시작하세요.',
  '~한 환경에서 더 빛날 수 있습니다.',
  '~한 사람들과 함께할 때 시너지가 납니다.',
  '주의할 점은 ~입니다.',
];

/** 메타포 확장 템플릿 */
const METAPHOR_TEMPLATES = {
  겨울: ['얼어붙은 땅 아래 씨앗이 기다리듯', '봄을 준비하는 겨울나무처럼'],
  봄: ['새싹이 돋아나듯', '봄비가 대지를 적시듯'],
  여름: ['뜨거운 태양 아래 무르익듯', '한여름 소나기처럼'],
  가을: ['열매가 익어가듯', '가을 단풍처럼 화려하게'],
};

/** 섹션별 추가 문장 */
const SECTION_ENHANCERS: Record<string, string[]> = {
  intro: [
    '이 문서는 예언이 아닌, 삶의 구조에 대한 이해를 돕기 위한 안내서입니다.',
    '사주는 가능성의 지도입니다. 어떤 길을 선택하느냐는 당신에게 달려 있습니다.',
  ],
  basicStructure: [
    '이것은 단정이 아닌, 경향성에 대한 설명입니다.',
    '사람마다 발현 방식은 다를 수 있습니다.',
  ],
  lifeAdvice: [
    '작은 것부터 시작해도 괜찮습니다.',
    '완벽하지 않아도 됩니다. 방향만 맞으면 됩니다.',
  ],
  relationship: [
    '관계의 패턴을 이해하면, 더 나은 선택을 할 수 있습니다.',
    '당신에게 맞는 관계의 형태가 있습니다.',
  ],
  career: [
    '직업은 수단이지, 목적이 아닙니다.',
    '당신의 본질에 맞는 일을 찾아가는 과정입니다.',
  ],
  conclusion: [
    '이 문서가 당신의 삶에 작은 도움이 되기를 바랍니다.',
    '모든 것은 변할 수 있습니다. 당신의 선택이 중요합니다.',
  ],
};

// ============================================
// 개선 제안 생성
// ============================================

export interface EnhancementResult {
  /** 원본 섹션 ID */
  sectionId: string;
  /** 추가할 문장들 */
  additions: {
    position: 'start' | 'end' | 'after_paragraph';
    text: string;
    reason: string;
  }[];
  /** 수정 제안 */
  modifications: {
    original: string;
    suggested: string;
    reason: string;
  }[];
}

export interface StoryEnhancement {
  /** 평가 ID */
  evaluationId: string;
  /** 현재 점수 */
  currentScore: number;
  /** 예상 개선 점수 */
  expectedScore: number;
  /** 섹션별 개선 사항 */
  sectionEnhancements: EnhancementResult[];
  /** 전체 추가 사항 */
  globalAdditions: string[];
  /** 개선 요약 */
  summary: string;
}

/**
 * 평가 결과를 기반으로 개선 제안 생성
 */
export function generateEnhancements(
  input: EvaluationInput,
  evaluation: EvaluationResult
): StoryEnhancement {
  const sectionEnhancements: EnhancementResult[] = [];
  const globalAdditions: string[] = [];

  // 1. 차원별 개선 처리
  for (const improvement of evaluation.priorityImprovements) {
    const enhancement = processImprovement(improvement, input);
    if (enhancement.global) {
      globalAdditions.push(...enhancement.additions);
    } else if (enhancement.sectionId) {
      const existing = sectionEnhancements.find(
        (se) => se.sectionId === enhancement.sectionId
      );
      if (existing) {
        existing.additions.push(...enhancement.sectionAdditions);
      } else {
        sectionEnhancements.push({
          sectionId: enhancement.sectionId,
          additions: enhancement.sectionAdditions,
          modifications: [],
        });
      }
    }
  }

  // 2. 특정 차원 보강
  const weakDimensions = evaluation.dimensionResults
    .filter((dr) => dr.achievement < 0.6)
    .map((dr) => dr.dimensionId);

  for (const dimId of weakDimensions) {
    const additions = generateDimensionAdditions(dimId, input);
    globalAdditions.push(...additions);
  }

  // 3. 예상 점수 계산
  const expectedScore = calculateExpectedScore(evaluation, sectionEnhancements);

  return {
    evaluationId: evaluation.id,
    currentScore: evaluation.totalScore,
    expectedScore,
    sectionEnhancements,
    globalAdditions: [...new Set(globalAdditions)], // 중복 제거
    summary: generateEnhancementSummary(evaluation, expectedScore),
  };
}

/**
 * 단일 개선 사항 처리
 */
function processImprovement(
  improvement: ImprovementSuggestion,
  input: EvaluationInput
): {
  global: boolean;
  additions: string[];
  sectionId?: string;
  sectionAdditions: { position: 'start' | 'end'; text: string; reason: string }[];
} {
  const result: {
    global: boolean;
    additions: string[];
    sectionId?: string;
    sectionAdditions: { position: 'start' | 'end'; text: string; reason: string }[];
  } = {
    global: false,
    additions: [],
    sectionAdditions: [],
  };

  switch (improvement.type) {
    case 'add_empathy':
      result.global = true;
      result.additions = EMPATHY_TEMPLATES.slice(0, 2);
      break;

    case 'add_hope':
      result.global = true;
      result.additions = HOPE_TEMPLATES.slice(0, 2);
      break;

    case 'add_advice':
      result.global = true;
      result.additions = PRACTICAL_TEMPLATES.slice(0, 2);
      break;

    case 'add_metaphor':
      // 메타포 톤에 맞는 확장 추가
      const tone = input.metaphor.tone;
      const season = extractSeasonFromTone(tone);
      if (season && METAPHOR_TEMPLATES[season as keyof typeof METAPHOR_TEMPLATES]) {
        result.global = true;
        result.additions = METAPHOR_TEMPLATES[season as keyof typeof METAPHOR_TEMPLATES];
      }
      break;

    case 'restructure':
      if (improvement.targetSectionId) {
        result.sectionId = improvement.targetSectionId;
        const sectionType = improvement.targetSectionId.replace('section_', '');
        if (SECTION_ENHANCERS[sectionType]) {
          result.sectionAdditions = SECTION_ENHANCERS[sectionType].map((text) => ({
            position: 'end' as const,
            text,
            reason: '섹션 완성도 향상',
          }));
        }
      }
      break;

    default:
      // 기본 처리
      break;
  }

  return result;
}

/**
 * 차원별 추가 문장 생성
 */
function generateDimensionAdditions(
  dimensionId: EvaluationDimensionId,
  input: EvaluationInput
): string[] {
  switch (dimensionId) {
    case 'empathy':
      return EMPATHY_TEMPLATES.slice(0, 2);
    case 'hope':
      return HOPE_TEMPLATES.slice(0, 2);
    case 'practicality':
      return PRACTICAL_TEMPLATES.slice(0, 2);
    case 'tone':
      return [
        '이것은 단정이 아닌 가능성입니다.',
        '사주는 운명이 아닌 경향성을 보여줍니다.',
      ];
    case 'emotionalJourney':
      return [
        ...EMPATHY_TEMPLATES.slice(0, 1),
        ...UNDERSTANDING_TEMPLATES.slice(0, 1),
        ...HOPE_TEMPLATES.slice(0, 1),
      ];
    default:
      return [];
  }
}

/**
 * 예상 점수 계산
 */
function calculateExpectedScore(
  evaluation: EvaluationResult,
  enhancements: EnhancementResult[]
): number {
  // 각 개선 사항당 약 2-5점 상승 예상
  const additionCount = enhancements.reduce(
    (sum, e) => sum + e.additions.length,
    0
  );
  const expectedIncrease = Math.min(15, additionCount * 2.5);

  return Math.min(100, evaluation.totalScore + expectedIncrease);
}

/**
 * 개선 요약 생성
 */
function generateEnhancementSummary(
  evaluation: EvaluationResult,
  expectedScore: number
): string {
  const improvement = expectedScore - evaluation.totalScore;

  if (improvement < 3) {
    return '현재 상태가 양호합니다. 세부 사항만 보완하면 됩니다.';
  } else if (improvement < 8) {
    return `제안된 개선 사항을 적용하면 약 ${Math.round(improvement)}점 상승이 예상됩니다.`;
  } else {
    return `중요한 개선 사항이 있습니다. 적용 시 약 ${Math.round(improvement)}점 상승이 예상됩니다.`;
  }
}

/**
 * 톤에서 계절 추출
 */
function extractSeasonFromTone(tone: string): string | null {
  if (tone.includes('겨울') || tone.includes('winter')) return '겨울';
  if (tone.includes('봄') || tone.includes('spring')) return '봄';
  if (tone.includes('여름') || tone.includes('summer')) return '여름';
  if (tone.includes('가을') || tone.includes('autumn')) return '가을';
  return null;
}

// ============================================
// 텍스트 적용
// ============================================

/**
 * 개선 사항을 실제 텍스트에 적용
 */
export function applyEnhancements(
  input: EvaluationInput,
  enhancement: StoryEnhancement
): EvaluationInput {
  const newSections = input.sections.map((section) => {
    const sectionEnhancement = enhancement.sectionEnhancements.find(
      (se) => se.sectionId === section.id
    );

    if (!sectionEnhancement) return section;

    let newContent = section.content;

    // 추가 적용
    for (const addition of sectionEnhancement.additions) {
      if (addition.position === 'start') {
        newContent = addition.text + '\n\n' + newContent;
      } else if (addition.position === 'end') {
        newContent = newContent + '\n\n' + addition.text;
      }
    }

    // 수정 적용
    for (const mod of sectionEnhancement.modifications) {
      newContent = newContent.replace(mod.original, mod.suggested);
    }

    return {
      ...section,
      content: newContent,
    };
  });

  // 전체 추가 사항은 마지막 섹션에 추가
  if (enhancement.globalAdditions.length > 0 && newSections.length > 0) {
    const lastSection = newSections[newSections.length - 1];
    lastSection.content +=
      '\n\n' + enhancement.globalAdditions.join('\n\n');
  }

  // fullText 재구성
  const newFullText = newSections.map((s) => s.content).join('\n\n────────\n\n');

  return {
    ...input,
    sections: newSections,
    fullText: newFullText,
  };
}
