/**
 * 스토리 생성 엔진 타입 정의
 *
 * 사주 분석 데이터를 하나의 일관된 서사로 조합하는 시스템
 */

import type { SelectedMetaphor } from '../metaphor/types';
import type {
  LifeTypeDefinition,
  LifeTypeClassificationResult,
} from '../lifeType/types';
import type { Season, InterpretationDepth, DocumentTone } from '../narrative/types';

// ============================================
// 스토리 생성 옵션
// ============================================

/**
 * 스토리 생성 옵션
 */
export interface StoryGenerationOptions {
  /** 문서 템플릿 */
  template?: 'standard' | 'brief' | 'detailed';

  /** 해석 깊이 */
  depth?: InterpretationDepth;

  /** 문서 톤 */
  tone?: DocumentTone;

  /** 올해 운세 포함 여부 */
  includeYearFortune?: boolean;

  /** 운세 대상 연도 */
  fortuneYear?: number;

  /** 사용자 이름 (선택) */
  userName?: string;
}

// ============================================
// 스토리 생성 입력
// ============================================

/**
 * 스토리 생성 입력 데이터
 */
export interface StoryGenerationInput {
  /** 사주 정보 */
  saju: {
    /** 년주 */
    year: { stem: string; branch: string };
    /** 월주 */
    month: { stem: string; branch: string };
    /** 일주 */
    day: { stem: string; branch: string };
    /** 시주 */
    hour: { stem: string; branch: string };
  };

  /** 일간 강약 */
  dayMasterStrength: 'strong' | 'neutral' | 'weak';

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

  /** 용신 */
  usefulGod?: string;

  /** 기신 */
  jealousGod?: string;

  /** 귀인 존재 여부 */
  hasNoble?: boolean;

  /** 특수 패턴 */
  specialPatterns?: string[];

  /** 12운성 정보 (선택) */
  twelveStages?: {
    year: string;
    month: string;
    day: string;
    hour: string;
  };

  /** 대운 정보 (선택) */
  majorLuck?: {
    current: { pillar: string; startAge: number };
    next?: { pillar: string; startAge: number };
  };

  /** 세운 정보 (선택) */
  yearlyLuck?: {
    year: number;
    pillar: string;
  };
}

// ============================================
// 스토리 섹션
// ============================================

/**
 * 스토리 섹션 ID
 */
export type StorySectionId =
  | 'intro' // 도입 (경고 문구)
  | 'basicStructure' // 기본 인생 구조
  | 'lifeAdvice' // 개운 방향
  | 'relationship' // 연애와 관계
  | 'career' // 직업·형태
  | 'wealth' // 돈과 직업의 관계
  | 'keySentence' // 핵심 한 문장
  | 'yearFortune' // 올해 운세
  | 'twelveStages' // 12운성 분석
  | 'conclusion'; // 마무리

/**
 * 스토리 섹션
 */
export interface StorySection {
  /** 섹션 ID */
  id: StorySectionId;

  /** 섹션 제목 */
  title: string;

  /** 부제목 (선택) */
  subtitle?: string;

  /** 섹션 내용 */
  content: string;
}

// ============================================
// 스토리 출력
// ============================================

/**
 * 생성된 스토리
 */
export interface GeneratedStory {
  /** 문서 제목 */
  title: string;

  /** 생성 일시 */
  generatedAt: string;

  /** 사용된 옵션 */
  options: StoryGenerationOptions;

  /** 메타포 정보 */
  metaphor: {
    /** 중심 이미지 */
    centralImage: string;
    /** 톤 */
    tone: string;
    /** 조후 조언 */
    climateAdvice: string;
  };

  /** 삶의 유형 */
  lifeType: {
    /** 주요 유형 */
    primary: string;
    /** 보조 유형 (있을 경우) */
    secondary?: string;
  };

  /** 섹션들 */
  sections: StorySection[];

  /** 전체 텍스트 (섹션 통합) */
  fullText: string;

  /** 핵심 한 문장 */
  keySentence: string;
}

// ============================================
// 내부 컨텍스트
// ============================================

/**
 * 스토리 생성 컨텍스트 (내부용)
 */
export interface StoryContext {
  /** 입력 데이터 */
  input: StoryGenerationInput;

  /** 옵션 */
  options: StoryGenerationOptions;

  /** 선택된 메타포 */
  metaphor: SelectedMetaphor;

  /** 분류된 삶의 유형 */
  lifeType: LifeTypeClassificationResult;

  /** 계절 */
  season: Season;

  /** 일간 한글 */
  dayMasterKorean: string;

  /** 일주 */
  dayPillar: string;
}
