/**
 * 해석 엔진 타입 정의
 *
 * Rule-based 해석 시스템을 위한 타입들
 * - AI 없이 일관된 해석 제공
 * - 고전 키워드(한자) + 현대적 설명
 */

// ============================================
// 기본 타입
// ============================================

/**
 * 해석 레벨
 * - 0: 단일 요소 해석 (일주 단독)
 * - 1: 2요소 조합 (일주 + 격국)
 * - 2: 3요소 조합 (일주 + 격국 + 강약)
 * - 3: 특수 패턴 (금수쌍청, 목화통명 등)
 */
export type InterpretationLevel = 0 | 1 | 2 | 3;

/**
 * 일간 강약
 */
export type DayMasterStrength = 'strong' | 'neutral' | 'weak';

/**
 * 해석 카테고리
 */
export type InterpretationCategory =
  | 'basic' // 기본 특성
  | 'personality' // 성격
  | 'career' // 직업적성
  | 'relationship' // 대인관계
  | 'wealth' // 재물운
  | 'health' // 건강
  | 'love' // 연애/결혼
  | 'advice'; // 조언

// ============================================
// 고전 키워드
// ============================================

/**
 * 고전 키워드 (한자 포함)
 */
export interface ClassicalKeyword {
  /** 한글 용어 */
  term: string;
  /** 한자 */
  hanja: string;
  /** 출처 (적천수, 궁통보감 등) */
  source?: string;
  /** 간략한 의미 */
  meaning?: string;
}

// ============================================
// 해석 템플릿
// ============================================

/**
 * 해석 템플릿 (개별 해석 단위)
 */
export interface InterpretationTemplate {
  /** 고유 ID */
  id: string;

  /** 해석 레벨 */
  level: InterpretationLevel;

  /** 카테고리 */
  category: InterpretationCategory;

  /** 핵심 키워드 (고전) */
  keywords: ClassicalKeyword[];

  /** 본문 내용 */
  content: string;

  /** 출처 */
  source?: string;

  /** 적용 조건 (격국, 강약 등) */
  conditions?: string[];
}

// ============================================
// 일주 해석 데이터
// ============================================

/**
 * 일주별 해석 데이터
 */
export interface DayPillarInterpretation {
  /** 일주 이름 (예: "경자") */
  name: string;

  /** 일주 한자 */
  hanja: string;

  /** 일간 */
  stem: string;

  /** 일지 */
  branch: string;

  /** 핵심 키워드 */
  keywords: ClassicalKeyword[];

  /** 기본 해석 */
  basic: {
    /** 핵심 특성 요약 */
    summary: string;
    /** 상세 설명 */
    description: string;
  };

  /** 성격 */
  personality: {
    /** 장점 */
    strengths: string[];
    /** 단점 */
    weaknesses: string[];
    /** 상세 설명 */
    description: string;
  };

  /** 직업적성 */
  career: {
    /** 적합 분야 */
    suitable: string[];
    /** 비적합 분야 */
    unsuitable?: string[];
    /** 상세 설명 */
    description: string;
  };

  /** 대인관계 */
  relationship: {
    /** 특징 */
    traits: string[];
    /** 상세 설명 */
    description: string;
  };

  /** 조언 */
  advice: {
    /** 장점 활용법 */
    leverageStrength: string;
    /** 주의할 점 */
    caution: string;
    /** 실천 방안 */
    action: string;
  };

  /** 추가 메타데이터 */
  meta?: {
    /** 음양 */
    polarity: 'yang' | 'yin';
    /** 일간 오행 */
    stemElement: string;
    /** 일지 오행 */
    branchElement: string;
    /** 일지 십신 */
    branchTenGod: string;
  };
}

// ============================================
// 격국 해석 데이터
// ============================================

/**
 * 격국별 해석 데이터
 */
export interface StructureInterpretation {
  /** 격국 이름 (예: "정관격") */
  name: string;

  /** 한자 */
  hanja: string;

  /** 핵심 키워드 */
  keywords: ClassicalKeyword[];

  /** 기본 해석 */
  basic: {
    summary: string;
    description: string;
  };

  /** 강약별 해석 */
  byStrength: {
    strong: {
      description: string;
      advice: string;
    };
    neutral: {
      description: string;
      advice: string;
    };
    weak: {
      description: string;
      advice: string;
    };
  };

  /** 직업적성 */
  career: {
    suitable: string[];
    description: string;
  };
}

// ============================================
// 조합 해석 데이터
// ============================================

/**
 * 일주 + 격국 조합 해석
 */
export interface CombinedInterpretation {
  /** 조합 키 (예: "경자_정관격") */
  key: string;

  /** 일주 */
  dayPillar: string;

  /** 격국 */
  structure: string;

  /** 강약 (선택) */
  strength?: DayMasterStrength;

  /** 해석 내용 */
  interpretation: string;

  /** 특별 참고사항 */
  specialNotes?: string[];

  /** 조언 */
  advice?: string;

  /** 주의점 */
  caution?: string;
}

// ============================================
// 특수 패턴
// ============================================

/**
 * 특수 패턴 정의
 */
export interface SpecialPattern {
  /** 패턴 ID */
  id: string;

  /** 패턴 이름 */
  name: string;

  /** 한자 */
  hanja: string;

  /** 설명 */
  description: string;

  /** 감지 조건 (문자열로 표현) */
  detectionRule: string;

  /** 해석 내용 */
  interpretation: string;

  /** 출처 */
  source?: string;
}

// ============================================
// 해석 결과
// ============================================

/**
 * 최종 해석 결과
 */
export interface InterpretationResult {
  /** 일주 기본 해석 */
  dayPillar: {
    name: string;
    hanja: string;
    keywords: ClassicalKeyword[];
    interpretation: string;
  };

  /** 격국 해석 */
  structure?: {
    name: string;
    hanja: string;
    interpretation: string;
  };

  /** 조합 해석 (일주 + 격국 + 강약) */
  combined?: {
    interpretation: string;
    specialNotes?: string[];
  };

  /** 특수 패턴 해석 */
  patterns?: {
    name: string;
    hanja: string;
    interpretation: string;
  }[];

  /** 종합 해석 */
  summary: {
    /** 성격 요약 */
    personality: string;
    /** 직업 적성 */
    career: string;
    /** 대인관계 */
    relationship: string;
  };

  /** 조언 */
  advice: {
    /** 장점 활용 */
    leverageStrength: string;
    /** 주의점 */
    caution: string;
    /** 실천 방안 */
    action: string;
  };

  /** 해석에 사용된 데이터 출처 */
  sources: string[];
}

// ============================================
// 데이터 저장소 타입
// ============================================

/**
 * 일주 해석 데이터 저장소
 */
export type DayPillarInterpretationData = {
  [dayPillarName: string]: DayPillarInterpretation;
};

/**
 * 격국 해석 데이터 저장소
 */
export type StructureInterpretationData = {
  [structureName: string]: StructureInterpretation;
};

/**
 * 조합 해석 데이터 저장소
 */
export type CombinedInterpretationData = {
  [combinedKey: string]: CombinedInterpretation;
};

/**
 * 특수 패턴 데이터 저장소
 */
export type SpecialPatternData = {
  [patternId: string]: SpecialPattern;
};
