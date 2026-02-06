/**
 * 스토리 생성기
 *
 * 사주 분석 데이터를 "삶의 구조 설명서" 형태의 스토리로 변환합니다.
 */

import type {
  StoryGenerationInput,
  StoryGenerationOptions,
  GeneratedStory,
  StorySection,
  StorySectionId,
  StoryContext,
} from './types';

import { selectMetaphor, getSeasonFromBranch } from '../metaphor';
import { classifyLifeType } from '../lifeType';

// ============================================
// 상수
// ============================================

const DEFAULT_OPTIONS: StoryGenerationOptions = {
  template: 'standard',
  depth: 'standard',
  tone: 'friendly',
  includeYearFortune: false,
};

const SECTION_TITLES: Record<StorySectionId, string> = {
  intro: '',
  basicStructure: '기본 인생 구조',
  lifeAdvice: '삶을 편하게 만드는 방법',
  relationship: '연애와 관계의 특징',
  career: '직업·형태',
  wealth: '돈과 직업의 관계',
  keySentence: '기억해야 할 한 문장',
  yearFortune: '올해의 핵심 의미',
  twelveStages: '12운성 분석',
  conclusion: '',
};

const DIVIDER = '────────────────────────';

// ============================================
// 메인 생성 함수
// ============================================

/**
 * 스토리 생성 메인 함수
 *
 * @param input - 사주 분석 데이터
 * @param options - 생성 옵션
 * @returns 생성된 스토리
 */
export function generateStory(
  input: StoryGenerationInput,
  options: StoryGenerationOptions = {}
): GeneratedStory {
  const mergedOptions = { ...DEFAULT_OPTIONS, ...options };

  // 1. 컨텍스트 생성
  const context = buildContext(input, mergedOptions);

  // 2. 섹션 생성
  const sections = generateSections(context);

  // 3. 전체 텍스트 조합
  const fullText = composFullText(sections, context);

  // 4. 결과 반환
  return {
    title: `${options.userName || '당신'}의 사용 설명서`,
    generatedAt: new Date().toISOString(),
    options: mergedOptions,
    metaphor: {
      centralImage: context.metaphor.centralImage,
      tone: context.metaphor.combinedMetaphor.tone,
      climateAdvice: context.metaphor.climateAdvice,
    },
    lifeType: {
      primary: context.lifeType.primaryType.name,
      secondary: context.lifeType.secondaryType?.name,
    },
    sections,
    fullText,
    keySentence: context.lifeType.primaryType.keySentence,
  };
}

// ============================================
// 컨텍스트 생성
// ============================================

/**
 * 스토리 생성 컨텍스트 빌드
 */
function buildContext(
  input: StoryGenerationInput,
  options: StoryGenerationOptions
): StoryContext {
  const dayMaster = input.saju.day.stem;
  const monthBranch = input.saju.month.branch;
  const season = getSeasonFromBranch(monthBranch);

  // 메타포 선택
  const metaphor = selectMetaphor({
    dayMaster,
    monthBranch,
    elementDistribution: input.elementDistribution,
  });

  if (!metaphor) {
    throw new Error(`메타포를 선택할 수 없습니다: ${dayMaster}, ${monthBranch}`);
  }

  // 삶의 유형 분류
  const lifeType = classifyLifeType({
    dayMasterStrength: input.dayMasterStrength,
    structure: input.structure,
    tenGodDistribution: input.tenGodDistribution,
    elementDistribution: input.elementDistribution,
    hasNoble: input.hasNoble,
    specialPatterns: input.specialPatterns,
    monthBranch,
  });

  return {
    input,
    options,
    metaphor,
    lifeType,
    season,
    dayMasterKorean: dayMaster,
    dayPillar: `${input.saju.day.stem}${input.saju.day.branch}`,
  };
}

// ============================================
// 섹션 생성
// ============================================

/**
 * 모든 섹션 생성
 */
function generateSections(context: StoryContext): StorySection[] {
  const sections: StorySection[] = [];

  // 1. 도입부
  sections.push(generateIntroSection());

  // 2. 기본 인생 구조
  sections.push(generateBasicStructureSection(context));

  // 3. 개운 방향
  sections.push(generateLifeAdviceSection(context));

  // 4. 연애와 관계
  sections.push(generateRelationshipSection(context));

  // 5. 직업·형태
  sections.push(generateCareerSection(context));

  // 6. 핵심 한 문장
  sections.push(generateKeySentenceSection(context));

  // 7. 올해 운세 (옵션)
  if (context.options.includeYearFortune && context.input.yearlyLuck) {
    sections.push(generateYearFortuneSection(context));
  }

  // 8. 마무리
  sections.push(generateConclusionSection());

  return sections;
}

/**
 * 도입부 생성
 */
function generateIntroSection(): StorySection {
  return {
    id: 'intro',
    title: '',
    content: `※ 본 글은 사주·명리를 모르는 일반인도 이해할 수 있도록 전문 용어를 절제하고, 계절과 삶의 흐름에 비유하여 서술한 통변문입니다. 단정이나 예언이 아닌, '삶의 구조 설명서'로 읽어주시기 바랍니다.`,
  };
}

/**
 * 기본 인생 구조 섹션 생성
 */
function generateBasicStructureSection(context: StoryContext): StorySection {
  const { metaphor, lifeType } = context;
  const meta = metaphor.combinedMetaphor.metaphor;
  const lifeTypeDef = lifeType.primaryType;

  const content = `${meta.situation}

${meta.psychological}

${meta.manifestation}

${meta.caution ? meta.caution : ''}

정리하면, ${lifeType.reasoning}`;

  return {
    id: 'basicStructure',
    title: SECTION_TITLES.basicStructure,
    subtitle: `(${lifeTypeDef.name})`,
    content: content.trim(),
  };
}

/**
 * 개운 방향 섹션 생성
 */
function generateLifeAdviceSection(context: StoryContext): StorySection {
  const { metaphor, lifeType } = context;
  const advice = lifeType.primaryType.advice;

  const content = `당신에게 가장 필요한 것은 더 열심히 사는 것이 아닙니다. ${advice.leverageStrength}

${metaphor.climateAdvice}

${advice.action}

${advice.caution}`;

  return {
    id: 'lifeAdvice',
    title: SECTION_TITLES.lifeAdvice,
    subtitle: '(개운 방향)',
    content: content.trim(),
  };
}

/**
 * 연애와 관계 섹션 생성
 */
function generateRelationshipSection(context: StoryContext): StorySection {
  const { metaphor, lifeType, input } = context;
  const tone = metaphor.combinedMetaphor.tone;

  let content = `세상 사람들은 당신을 볼 때 `;

  // 메타포 톤에 따른 첫인상 설명
  if (tone === 'challenging') {
    content += `차분하고 강해 보이는 사람으로 인식합니다. 쉽게 다가가기 어려운 아우라가 있습니다.`;
  } else if (tone === 'favorable') {
    content += `에너지가 넘치고 열정적인 사람으로 인식합니다. 함께 있으면 기분이 좋아지는 느낌을 줍니다.`;
  } else {
    content += `안정적이고 믿음직한 사람으로 인식합니다. 든든한 느낌을 주는 타입입니다.`;
  }

  // 배우자 자리 (일지) 분석
  const dayBranch = input.saju.day.branch;
  content += `\n\n당신의 사주에서 배우자가 머무는 자리에는 ${dayBranch}(가/이) 자리하고 있습니다. `;

  // 간단한 일지 해석
  if (['자', '축', '해'].includes(dayBranch)) {
    content += `겨울의 차가운 기운이 배우자 자리에 있으니, 관계에서 따뜻함을 찾기 위한 노력이 필요합니다.`;
  } else if (['사', '오', '미'].includes(dayBranch)) {
    content += `여름의 뜨거운 기운이 배우자 자리에 있으니, 열정적인 관계를 추구하지만 감정 기복에 주의해야 합니다.`;
  } else {
    content += `적절한 기운이 배우자 자리에 있어, 균형 잡힌 관계를 맺을 수 있는 구조입니다.`;
  }

  // 조언
  content += `\n\n사람 관계에서는 모든 부탁을 책임으로 받아들이지 않는 연습이 필요합니다. 선택적으로 돕고, 선택적으로 거절하는 것도 성숙한 책임입니다.`;

  return {
    id: 'relationship',
    title: SECTION_TITLES.relationship,
    content: content.trim(),
  };
}

/**
 * 직업 섹션 생성
 */
function generateCareerSection(context: StoryContext): StorySection {
  const { lifeType } = context;
  const lifeTypeDef = lifeType.primaryType;

  const suitableCareers = lifeTypeDef.suitableCareers.slice(0, 4).join(', ');

  const content = `${lifeTypeDef.description.split('.').slice(0, 2).join('.')}

**가장 잘 맞는 직업 유형:**
${lifeTypeDef.suitableCareers.map((c) => `• ${c}`).join('\n')}

**피해야 할 일의 형태:**
아무리 능력이 있어도 다음 환경에서는 효율이 급격히 떨어집니다.
${lifeTypeDef.challenges.map((c) => `• ${c}`).join('\n')}

**돈과 직업의 관계:**
당신은 돈을 쫓을수록 일이 꼬이고, 일이 맞을수록 돈이 따라오는 구조입니다.`;

  return {
    id: 'career',
    title: SECTION_TITLES.career,
    content: content.trim(),
  };
}

/**
 * 핵심 한 문장 섹션 생성
 */
function generateKeySentenceSection(context: StoryContext): StorySection {
  const keySentence = context.lifeType.primaryType.keySentence;

  return {
    id: 'keySentence',
    title: SECTION_TITLES.keySentence,
    content: `"${keySentence}"`,
  };
}

/**
 * 올해 운세 섹션 생성
 */
function generateYearFortuneSection(context: StoryContext): StorySection {
  const { input, metaphor } = context;
  const yearlyLuck = input.yearlyLuck!;

  const content = `[${yearlyLuck.year}년의 핵심 의미]

올해 세운 ${yearlyLuck.pillar}이(가) 들어옵니다.

${metaphor.combinedMetaphor.metaphor.hope}

**주목해야 할 시기:**
• 봄 (2-3월): 새로운 시작의 기운이 들어오는 시기
• 여름 (5-7월): 활동과 성과가 극대화되는 시기

**Action Plan:**
${context.lifeType.primaryType.advice.action}`;

  return {
    id: 'yearFortune',
    title: SECTION_TITLES.yearFortune,
    content: content.trim(),
  };
}

/**
 * 마무리 섹션 생성
 */
function generateConclusionSection(): StorySection {
  return {
    id: 'conclusion',
    title: '',
    content: `※ 이 글은 운명을 단정하지 않습니다. 당신의 타고난 달란트이며, 네비게이션과 같습니다.`,
  };
}

// ============================================
// 텍스트 조합
// ============================================

/**
 * 전체 텍스트 조합
 */
function composFullText(sections: StorySection[], context: StoryContext): string {
  const lines: string[] = [];

  for (let i = 0; i < sections.length; i++) {
    const section = sections[i];

    // 도입부와 마무리는 구분선 없이
    if (section.id === 'intro') {
      lines.push(section.content);
      lines.push(DIVIDER);
      continue;
    }

    if (section.id === 'conclusion') {
      lines.push(DIVIDER);
      lines.push(section.content);
      continue;
    }

    // 섹션 번호와 제목
    const sectionNumber = i;
    if (section.title) {
      const titleLine = section.subtitle
        ? `${sectionNumber}. ${section.title} ${section.subtitle}`
        : `${sectionNumber}. ${section.title}`;
      lines.push(titleLine);
    }

    // 섹션 내용
    lines.push(section.content);
    lines.push(DIVIDER);
  }

  return lines.join('\n\n');
}

// ============================================
// 유틸리티 함수
// ============================================

/**
 * 간단한 스토리 생성 (사주만으로)
 */
export function generateSimpleStory(
  dayMaster: string,
  monthBranch: string,
  dayMasterStrength: 'strong' | 'neutral' | 'weak' = 'neutral',
  tenGodCounts?: Partial<StoryGenerationInput['tenGodDistribution']>
): GeneratedStory {
  const defaultTenGodDistribution = {
    비견: 1,
    겁재: 1,
    식신: 1,
    상관: 1,
    편재: 1,
    정재: 1,
    편관: 1,
    정관: 1,
    편인: 1,
    정인: 1,
  };

  const input: StoryGenerationInput = {
    saju: {
      year: { stem: '갑', branch: '자' },
      month: { stem: '갑', branch: monthBranch },
      day: { stem: dayMaster, branch: '자' },
      hour: { stem: '갑', branch: '자' },
    },
    dayMasterStrength,
    tenGodDistribution: { ...defaultTenGodDistribution, ...tenGodCounts },
    elementDistribution: { 목: 2, 화: 2, 토: 2, 금: 2, 수: 2 },
  };

  return generateStory(input);
}
