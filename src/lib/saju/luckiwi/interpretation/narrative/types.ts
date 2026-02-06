/**
 * 서사 시스템 타입 정의
 *
 * 조건 기반 서사 조합을 위한 타입들
 * - NarrativeBlock: 조건부 서사 단위
 * - DocumentTemplate: 문서 구조 템플릿
 * - TransitionPhrase: 섹션 간 전환구
 */

// ============================================
// 기본 열거형
// ============================================

/**
 * 계절
 */
export type Season = 'spring' | 'summer' | 'autumn' | 'winter';

/**
 * 일간 강약
 */
export type Strength = 'strong' | 'neutral' | 'weak';

/**
 * 문서 톤
 */
export type DocumentTone = 'formal' | 'friendly' | 'poetic';

/**
 * 해석 깊이
 */
export type InterpretationDepth = 'summary' | 'standard' | 'detailed' | 'expert';

/**
 * 서사 블록 타입
 */
export type NarrativeBlockType =
  | 'dayMasterSeason' // 일간 × 계절
  | 'dayPillarRelation' // 일주 관계 (간지 상호작용)
  | 'structureBase' // 격국 기본
  | 'strengthModifier' // 강약 변형
  | 'specialPattern' // 특수 패턴
  | 'lifeAdvice' // 삶의 조언
  | 'careerGuidance' // 직업 가이드
  | 'relationshipInsight' // 관계 통찰
  | 'timingForecast' // 시기 예측
  | 'validation' // 고생 인정
  | 'hope' // 희망 메시지
  | 'keySentence'; // 핵심 한 문장

/**
 * 문서 섹션 ID
 */
export type SectionId =
  | 'intro' // 도입부
  | 'basicStructure' // 기본 인생 구조
  | 'lifeAdvice' // 삶을 편하게 만드는 방법
  | 'relationship' // 연애와 관계
  | 'career' // 직업·형태
  | 'wealth' // 돈과 직업의 관계
  | 'keySentence' // 기억해야 할 한 문장
  | 'yearlyFortune' // 올해 운세
  | 'twelveStages' // 12운성 분석
  | 'conclusion'; // 마무리

// ============================================
// 조건 시스템
// ============================================

/**
 * 서사 블록 적용 조건
 */
export interface NarrativeConditions {
  /** 일간 (천간) */
  dayMaster?: string[];

  /** 일지 (지지) */
  dayBranch?: string[];

  /** 일주 (간지 조합) */
  dayPillar?: string[];

  /** 월지 */
  monthBranch?: string[];

  /** 계절 */
  season?: Season[];

  /** 일간 오행 */
  dayMasterElement?: string[];

  /** 격국 */
  structure?: string[];

  /** 강약 */
  strength?: Strength[];

  /** 특수 패턴 보유 */
  hasPattern?: string[];

  /** 특정 십신 존재 여부 */
  hasTenGod?: {
    tenGod: string;
    position?: 'year' | 'month' | 'day' | 'hour' | 'any';
  }[];

  /** 특정 오행 과다/부족 */
  elementBalance?: {
    element: string;
    condition: 'excess' | 'lack' | 'none';
  }[];

  /** 복합 조건 (AND) */
  allOf?: NarrativeConditions[];

  /** 복합 조건 (OR) */
  anyOf?: NarrativeConditions[];

  /** 부정 조건 (NOT) */
  not?: NarrativeConditions;

  /** 커스텀 조건 함수 ID */
  customCondition?: string;
}

// ============================================
// 서사 블록
// ============================================

/**
 * 서사 블록 - 조건부로 선택되는 해석 단위
 */
export interface NarrativeBlock {
  /** 고유 ID */
  id: string;

  /** 블록 타입 */
  type: NarrativeBlockType;

  /** 적용 조건 */
  conditions: NarrativeConditions;

  /**
   * 우선순위 (높을수록 구체적)
   * - 10: 일반적 (일간만)
   * - 20: 보통 (일간 + 계절)
   * - 30: 구체적 (일주 + 격국)
   * - 40: 매우 구체적 (일주 + 격국 + 강약)
   * - 50: 특수 패턴
   */
  priority: number;

  /** 서사 내용 */
  content: NarrativeContent;

  /** 메타데이터 */
  meta?: {
    /** 출처 */
    source?: string;
    /** 작성자 */
    author?: string;
    /** 버전 */
    version?: string;
    /** 태그 */
    tags?: string[];
  };
}

/**
 * 서사 내용
 */
export interface NarrativeContent {
  /**
   * 자연 비유 (상황 설명)
   * 예: "엄동설한인 겨울에 태어난 경금입니다..."
   */
  metaphor?: string;

  /**
   * 심리적 함의 (어떤 삶이었는가)
   * 예: "부모나 환경의 덕보다는 본인의 '정신력'과 '오기'로 버텨온 세월입니다..."
   */
  psychologicalImplication?: string;

  /**
   * 발현 양상 (어떻게 나타나는가)
   * 예: "머리가 빠르고, 상황을 읽는 능력이 뛰어나며..."
   */
  manifestation?: string;

  /**
   * 조언/가이드
   * 예: "규칙적인 생활, 일정 관리, 운동, 휴식은..."
   */
  advice?: string;

  /**
   * 주의점
   * 예: "문제는 '멈추게 해 주는 장치'가 약하다는 점입니다..."
   */
  caution?: string;

  /**
   * 희망 메시지
   * 예: "앞으로 강렬한 화기가 들어와 당신을 따뜻하게 데우면..."
   */
  hope?: string;

  /**
   * 핵심 문장
   * 예: "나는 책임을 다했기 때문에 가치 있는 사람이 아니라..."
   */
  keySentence?: string;

  /**
   * 전체 텍스트 (위 필드들을 사용하지 않고 직접 작성)
   */
  fullText?: string;

  /**
   * 슬롯 기반 텍스트 (변수 치환용)
   * 예: "{{dayMaster}}은(는) {{season}}에 태어나..."
   */
  template?: string;
}

// ============================================
// 전환구
// ============================================

/**
 * 섹션 간 전환구
 */
export interface TransitionPhrase {
  /** 고유 ID */
  id: string;

  /** 출발 섹션 */
  from: SectionId;

  /** 도착 섹션 */
  to: SectionId;

  /** 조건별 전환구 변형 */
  variants: TransitionVariant[];
}

/**
 * 전환구 변형
 */
export interface TransitionVariant {
  /** 적용 조건 (없으면 기본값) */
  conditions?: NarrativeConditions;

  /** 전환 문구 */
  phrase: string;

  /** 우선순위 */
  priority?: number;
}

// ============================================
// 문서 템플릿
// ============================================

/**
 * 문서 템플릿 정의
 */
export interface DocumentTemplate {
  /** 템플릿 ID */
  id: string;

  /** 템플릿 이름 */
  name: string;

  /** 설명 */
  description: string;

  /** 문서 톤 */
  tone: DocumentTone;

  /** 기본 해석 깊이 */
  defaultDepth: InterpretationDepth;

  /** 섹션 정의 */
  sections: SectionDefinition[];

  /** 필수 포함 요소 */
  requiredElements: {
    /** 고생/노력 인정 */
    validation: boolean;
    /** 희망 메시지 */
    hope: boolean;
    /** 실천 가능한 조언 */
    actionAdvice: boolean;
    /** 핵심 한 문장 */
    keySentence: boolean;
  };

  /** 메타데이터 */
  meta?: {
    version?: string;
    author?: string;
  };
}

/**
 * 섹션 정의
 */
export interface SectionDefinition {
  /** 섹션 ID */
  id: SectionId;

  /** 섹션 제목 */
  title: string;

  /** 부제목 (선택) */
  subtitle?: string;

  /** 필수 여부 */
  required: boolean;

  /** 해당 깊이 이상에서만 표시 */
  minDepth?: InterpretationDepth;

  /** 사용할 서사 블록 타입들 */
  blockTypes: NarrativeBlockType[];

  /** 블록 조합 방식 */
  compositionMode: 'sequential' | 'selective' | 'merged';

  /** 최대 블록 수 */
  maxBlocks?: number;

  /** 이 섹션 다음에 올 수 있는 섹션들 */
  nextSections?: SectionId[];
}

// ============================================
// 조합 결과
// ============================================

/**
 * 조합된 문서
 */
export interface ComposedDocument {
  /** 문서 제목 */
  title: string;

  /** 사용된 템플릿 ID */
  templateId: string;

  /** 생성 시간 */
  generatedAt: string;

  /** 섹션들 */
  sections: ComposedSection[];

  /** 사용된 서사 블록 ID들 */
  usedBlockIds: string[];

  /** 메타데이터 */
  meta?: {
    /** 분석 대상 정보 */
    subject?: {
      name?: string;
      birthDate?: string;
      dayPillar?: string;
    };
    /** 해석 깊이 */
    depth?: InterpretationDepth;
  };
}

/**
 * 조합된 섹션
 */
export interface ComposedSection {
  /** 섹션 ID */
  id: SectionId;

  /** 섹션 제목 */
  title: string;

  /** 부제목 */
  subtitle?: string;

  /** 조합된 내용 */
  content: string;

  /** 사용된 블록 ID들 */
  blockIds: string[];
}

// ============================================
// 데이터 저장소 타입
// ============================================

/**
 * 서사 블록 저장소
 */
export interface NarrativeBlockStore {
  version: string;
  lastUpdated: string;
  blocks: NarrativeBlock[];
}

/**
 * 전환구 저장소
 */
export interface TransitionPhraseStore {
  version: string;
  lastUpdated: string;
  phrases: TransitionPhrase[];
}

/**
 * 문서 템플릿 저장소
 */
export interface DocumentTemplateStore {
  version: string;
  lastUpdated: string;
  templates: DocumentTemplate[];
}
