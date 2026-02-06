/**
 * 삶의 유형 분류 시스템 타입 정의
 *
 * 사주 구조를 기반으로 삶의 유형을 분류하는 시스템
 * - 자수성가형, 부모덕형, 귀인형, 창업형, 전문가형, 리더형 등
 */

// ============================================
// 기본 열거형
// ============================================

/**
 * 삶의 유형 ID
 */
export type LifeTypeId =
  | 'self_made' // 자수성가형
  | 'parent_blessed' // 부모덕형
  | 'noble_aided' // 귀인형
  | 'entrepreneur' // 창업형
  | 'specialist' // 전문가형
  | 'leader' // 리더형
  | 'artist' // 예술가형
  | 'scholar' // 학자형
  | 'supporter' // 내조형/조력자형
  | 'adventurer'; // 모험가형

/**
 * 일간 강약
 */
export type DayMasterStrength = 'strong' | 'neutral' | 'weak';

/**
 * 십신 분류
 */
export type TenGodCategory =
  | 'comparison' // 비겁 (비견, 겁재)
  | 'output' // 식상 (식신, 상관)
  | 'wealth' // 재성 (편재, 정재)
  | 'authority' // 관성 (편관, 정관)
  | 'resource'; // 인성 (편인, 정인)

// ============================================
// 삶의 유형 정의
// ============================================

/**
 * 삶의 유형 정의
 */
export interface LifeTypeDefinition {
  /** 유형 ID */
  id: LifeTypeId;

  /** 유형 이름 (한글) */
  name: string;

  /** 유형 이름 (한자) */
  hanja: string;

  /** 한 줄 설명 */
  summary: string;

  /** 상세 설명 */
  description: string;

  /** 핵심 키워드 */
  keywords: string[];

  /** 강점 */
  strengths: string[];

  /** 도전 과제 */
  challenges: string[];

  /** 적합 직업 */
  suitableCareers: string[];

  /** 조언 */
  advice: {
    /** 장점 활용 */
    leverageStrength: string;
    /** 주의점 */
    caution: string;
    /** 실천 방안 */
    action: string;
  };

  /** 핵심 한 문장 */
  keySentence: string;
}

/**
 * 분류 규칙
 */
export interface ClassificationRule {
  /** 규칙 ID */
  id: string;

  /** 대상 유형 */
  targetType: LifeTypeId;

  /** 우선순위 (높을수록 먼저 평가) */
  priority: number;

  /** 필수 조건 (모두 만족해야 함) */
  requiredConditions: LifeTypeCondition[];

  /** 선택 조건 (하나 이상 만족) */
  optionalConditions?: LifeTypeCondition[];

  /** 제외 조건 (하나라도 만족하면 제외) */
  excludeConditions?: LifeTypeCondition[];

  /** 점수 가중치 */
  weight: number;
}

/**
 * 분류 조건
 */
export interface LifeTypeCondition {
  /** 조건 유형 */
  type: ConditionType;

  /** 조건 값 */
  value: any;

  /** 비교 연산자 */
  operator?: 'eq' | 'gt' | 'lt' | 'gte' | 'lte' | 'contains' | 'not';
}

/**
 * 조건 유형
 */
export type ConditionType =
  | 'dayMasterStrength' // 일간 강약
  | 'structure' // 격국
  | 'tenGodExcess' // 십신 과다
  | 'tenGodLack' // 십신 부족
  | 'tenGodPresent' // 십신 존재
  | 'tenGodAbsent' // 십신 부재
  | 'elementExcess' // 오행 과다
  | 'elementLack' // 오행 부족
  | 'hasNoble' // 귀인 존재
  | 'hasSpecialPattern' // 특수 패턴
  | 'seasonMatch'; // 계절 일치

// ============================================
// 분류 입력/출력
// ============================================

/**
 * 분류 입력 데이터
 */
export interface LifeTypeClassificationInput {
  /** 일간 강약 */
  dayMasterStrength: DayMasterStrength;

  /** 격국 */
  structure?: string;

  /** 십신 분포 */
  tenGodDistribution: {
    비견: number;
    겁재: number;
    식신: number;
    상관: number;
    편재: number;
    정재: number;
    편관: number;
    정관: number;
    편인: number;
    정인: number;
  };

  /** 오행 분포 */
  elementDistribution: {
    목: number;
    화: number;
    토: number;
    금: number;
    수: number;
  };

  /** 귀인 존재 여부 */
  hasNoble?: boolean;

  /** 특수 패턴 목록 */
  specialPatterns?: string[];

  /** 월지 (계절 판단용) */
  monthBranch?: string;
}

/**
 * 분류 결과
 */
export interface LifeTypeClassificationResult {
  /** 주요 유형 */
  primaryType: LifeTypeDefinition;

  /** 보조 유형 (있을 경우) */
  secondaryType?: LifeTypeDefinition;

  /** 유형별 점수 */
  scores: {
    typeId: LifeTypeId;
    score: number;
    matchedRules: string[];
  }[];

  /** 분류 근거 설명 */
  reasoning: string;
}

// ============================================
// 데이터 저장소 타입
// ============================================

/**
 * 삶의 유형 정의 저장소
 */
export interface LifeTypeDefinitionStore {
  version: string;
  lastUpdated: string;
  definitions: LifeTypeDefinition[];
}

/**
 * 분류 규칙 저장소
 */
export interface ClassificationRuleStore {
  version: string;
  lastUpdated: string;
  rules: ClassificationRule[];
}
