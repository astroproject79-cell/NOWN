/**
 * 사용자 관점 평가 차원 정의
 *
 * 사주 서비스 사용자가 중요하게 생각하는 8가지 차원
 * 모든 차원이 Pass해야 전체 Pass
 */

// ============================================
// 차원 정의
// ============================================

/**
 * 평가 차원 ID
 */
export type DimensionId =
  | 'fit' // 맞춤: 내 사주에 맞는 해석인가?
  | 'empathy' // 공감: 내 상황을 이해하고 위로하는가?
  | 'credibility' // 신뢰: 사주학적 근거가 있는 해석인가?
  | 'actionable' // 실용: 실제로 할 수 있는 조언인가?
  | 'hope' // 희망: 긍정적이고 힘이 되는가?
  | 'clarity' // 명료: 쉽게 이해되는가?
  | 'engagement' // 몰입: 흥미롭게 읽히는가?
  | 'completeness'; // 완결: 필요한 내용이 다 있는가?

/**
 * 차원 정의
 */
export interface Dimension {
  /** 차원 ID */
  id: DimensionId;

  /** 한글 이름 */
  name: string;

  /** 사용자 관점 질문 */
  userQuestion: string;

  /** 상세 설명 */
  description: string;

  /** Pass 임계값 (0-100) */
  passThreshold: number;

  /** 평가 기준 */
  criteria: DimensionCriterion[];
}

/**
 * 차원별 평가 기준
 */
export interface DimensionCriterion {
  /** 기준 ID */
  id: string;

  /** 기준 이름 */
  name: string;

  /** 체크 항목 */
  checkItems: string[];

  /** 배점 비중 (해당 차원 내에서) */
  weight: number;
}

// ============================================
// 차원 정의 데이터
// ============================================

export const DIMENSIONS: Record<DimensionId, Dimension> = {
  fit: {
    id: 'fit',
    name: '맞춤',
    userQuestion: '내 일주/격국에 맞는 해석인가?',
    description:
      '사용자의 사주 특성(일주, 격국, 용신 등)이 해석에 구체적으로 반영되어 있는지 평가',
    passThreshold: 70,
    criteria: [
      {
        id: 'fit-daymaster',
        name: '일주 특성 반영',
        checkItems: [
          '일주의 오행 특성이 언급됨',
          '일주의 성격/기질이 해석에 반영됨',
          '일주에 맞는 메타포 사용',
        ],
        weight: 40,
      },
      {
        id: 'fit-structure',
        name: '격국/용신 반영',
        checkItems: [
          '격국 특성이 해석에 반영됨',
          '용신/기신 방향이 조언에 반영됨',
        ],
        weight: 30,
      },
      {
        id: 'fit-context',
        name: '개인 맥락 반영',
        checkItems: [
          '나이/성별에 맞는 표현',
          '현재 대운/세운이 해석에 반영됨',
        ],
        weight: 30,
      },
    ],
  },

  empathy: {
    id: 'empathy',
    name: '공감',
    userQuestion: '내 상황을 이해하고 위로하는가?',
    description: '독자의 감정을 인정하고 공감하며 위로를 전달하는지 평가',
    passThreshold: 70,
    criteria: [
      {
        id: 'empathy-acknowledge',
        name: '상황 인정',
        checkItems: [
          '현재 겪고 있을 어려움을 인정',
          '감정을 있는 그대로 수용하는 표현',
        ],
        weight: 40,
      },
      {
        id: 'empathy-connect',
        name: '공감 연결',
        checkItems: [
          '"~하셨을 거예요", "~느끼실 수 있어요" 등 공감 표현',
          '독자를 이해한다는 메시지',
        ],
        weight: 35,
      },
      {
        id: 'empathy-comfort',
        name: '위로 전달',
        checkItems: ['격려와 응원의 메시지', '혼자가 아님을 전달'],
        weight: 25,
      },
    ],
  },

  credibility: {
    id: 'credibility',
    name: '신뢰',
    userQuestion: '사주학적 근거가 있는 해석인가?',
    description: '명리학적으로 정확하고 근거 있는 해석인지 평가',
    passThreshold: 70,
    criteria: [
      {
        id: 'cred-accuracy',
        name: '사주학적 정확성',
        checkItems: [
          '오행 상생상극 관계가 정확함',
          '십성/십신 해석이 올바름',
          '운세 해석이 명리학적으로 타당',
        ],
        weight: 50,
      },
      {
        id: 'cred-reasoning',
        name: '근거 제시',
        checkItems: [
          '해석의 이유가 설명됨',
          '"~이기 때문에"와 같은 논리적 연결',
        ],
        weight: 30,
      },
      {
        id: 'cred-consistency',
        name: '내적 일관성',
        checkItems: ['해석 간 모순이 없음', '전체 스토리가 일관됨'],
        weight: 20,
      },
    ],
  },

  actionable: {
    id: 'actionable',
    name: '실용',
    userQuestion: '실제로 할 수 있는 조언인가?',
    description: '구체적이고 실행 가능한 조언이 포함되어 있는지 평가',
    passThreshold: 70,
    criteria: [
      {
        id: 'action-specific',
        name: '구체성',
        checkItems: [
          '추상적이지 않고 구체적인 행동 제시',
          '언제, 어떻게 할지 명확',
        ],
        weight: 40,
      },
      {
        id: 'action-feasible',
        name: '실현 가능성',
        checkItems: [
          '일상에서 실천 가능한 조언',
          '특별한 조건 없이 할 수 있는 것',
        ],
        weight: 35,
      },
      {
        id: 'action-relevant',
        name: '맥락 적합성',
        checkItems: [
          '직업/관계/건강 등 구체적 영역 조언',
          '사주 특성에 맞는 방향 제시',
        ],
        weight: 25,
      },
    ],
  },

  hope: {
    id: 'hope',
    name: '희망',
    userQuestion: '긍정적이고 힘이 되는가?',
    description: '어려움 속에서도 희망과 가능성을 전달하는지 평가',
    passThreshold: 70,
    criteria: [
      {
        id: 'hope-positive',
        name: '긍정적 전망',
        checkItems: [
          '미래에 대한 희망적 메시지',
          '좋아질 것이라는 기대감 전달',
        ],
        weight: 40,
      },
      {
        id: 'hope-strength',
        name: '강점 부각',
        checkItems: ['사주에서 발견되는 장점 강조', '가능성과 잠재력 언급'],
        weight: 35,
      },
      {
        id: 'hope-balance',
        name: '균형잡힌 희망',
        checkItems: [
          '맹목적 낙관이 아닌 현실적 희망',
          '어려움 인정 후 희망 제시',
        ],
        weight: 25,
      },
    ],
  },

  clarity: {
    id: 'clarity',
    name: '명료',
    userQuestion: '쉽게 이해되는가?',
    description: '전문 용어 없이도 누구나 이해할 수 있는지 평가',
    passThreshold: 70,
    criteria: [
      {
        id: 'clarity-plain',
        name: '쉬운 표현',
        checkItems: [
          '전문 용어 최소화 또는 설명 포함',
          '일상적인 언어 사용',
        ],
        weight: 40,
      },
      {
        id: 'clarity-structure',
        name: '구조적 명확성',
        checkItems: ['단락 구분이 명확', '논리적 흐름이 있음'],
        weight: 30,
      },
      {
        id: 'clarity-length',
        name: '적절한 길이',
        checkItems: ['문장이 너무 길지 않음', '핵심이 명확히 전달됨'],
        weight: 30,
      },
    ],
  },

  engagement: {
    id: 'engagement',
    name: '몰입',
    userQuestion: '흥미롭게 읽히는가?',
    description: '끝까지 읽고 싶게 만드는 매력이 있는지 평가',
    passThreshold: 70,
    criteria: [
      {
        id: 'engage-metaphor',
        name: '매력적 메타포',
        checkItems: [
          '일관된 중심 이미지/비유',
          '사주 특성과 어울리는 메타포',
        ],
        weight: 40,
      },
      {
        id: 'engage-story',
        name: '스토리텔링',
        checkItems: ['과거-현재-미래로 이어지는 서사', '감정적 여정이 있음'],
        weight: 35,
      },
      {
        id: 'engage-voice',
        name: '고유한 톤',
        checkItems: ['기계적이지 않은 자연스러운 문체', '개성 있는 표현'],
        weight: 25,
      },
    ],
  },

  completeness: {
    id: 'completeness',
    name: '완결',
    userQuestion: '필요한 내용이 다 있는가?',
    description: '사주 해석에 필요한 핵심 요소가 모두 포함되어 있는지 평가',
    passThreshold: 70,
    criteria: [
      {
        id: 'complete-core',
        name: '핵심 구성요소',
        checkItems: [
          '타고난 기질/성격 설명',
          '현재 운세 분석',
          '미래 전망 제시',
        ],
        weight: 50,
      },
      {
        id: 'complete-areas',
        name: '주요 영역',
        checkItems: [
          '직업/재물 방향',
          '관계/인간관계 조언',
          '건강/주의사항 언급',
        ],
        weight: 30,
      },
      {
        id: 'complete-closing',
        name: '마무리',
        checkItems: ['핵심 메시지 요약', '인상적인 마무리'],
        weight: 20,
      },
    ],
  },
};

// ============================================
// 유틸리티
// ============================================

/**
 * 모든 차원 ID 배열
 */
export const ALL_DIMENSION_IDS: DimensionId[] = Object.keys(
  DIMENSIONS
) as DimensionId[];

/**
 * 차원 정보 가져오기
 */
export function getDimension(id: DimensionId): Dimension {
  return DIMENSIONS[id];
}

/**
 * 기본 Pass 임계값
 */
export const DEFAULT_PASS_THRESHOLD = 70;
