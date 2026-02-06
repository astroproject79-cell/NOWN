/**
 * 메타포 시스템 타입 정의
 *
 * 일간 × 계절 × 조후 조합으로 중심 메타포를 결정하는 시스템
 */

import type { Season } from '../narrative/types';

// ============================================
// 기본 열거형
// ============================================

/**
 * 천간 (10개)
 */
export type HeavenlyStem =
  | '갑'
  | '을'
  | '병'
  | '정'
  | '무'
  | '기'
  | '경'
  | '신'
  | '임'
  | '계';

/**
 * 오행
 */
export type Element = '목' | '화' | '토' | '금' | '수';

/**
 * 조후 상태 (사주의 한난조습)
 */
export type ClimateState =
  | 'cold' // 한(寒) - 차가움
  | 'hot' // 열(熱) - 뜨거움
  | 'dry' // 조(燥) - 건조함
  | 'wet' // 습(濕) - 습함
  | 'balanced'; // 중화 - 균형

/**
 * 메타포 톤
 */
export type MetaphorTone =
  | 'challenging' // 도전적/어려운
  | 'balanced' // 균형/중립
  | 'favorable'; // 유리한/좋은

// ============================================
// 일간 기본 이미지
// ============================================

/**
 * 일간별 기본 이미지 정의
 */
export interface DayMasterImage {
  /** 일간 */
  stem: HeavenlyStem;

  /** 한자 */
  hanja: string;

  /** 오행 */
  element: Element;

  /** 음양 */
  polarity: 'yang' | 'yin';

  /** 기본 이미지 (핵심 비유) */
  baseImage: string;

  /** 대체 이미지들 */
  alternativeImages: string[];

  /** 긍정 키워드 */
  positiveTraits: string[];

  /** 부정 키워드 */
  negativeTraits: string[];

  /** 기본 설명 */
  baseDescription: string;

  /** 자연 비유 (상세) */
  naturalMetaphor: string;
}

// ============================================
// 계절별 변형
// ============================================

/**
 * 계절별 상태 변형
 */
export interface SeasonalVariation {
  /** 계절 */
  season: Season;

  /** 한국어 계절명 */
  seasonName: string;

  /** 해당 월지 */
  branches: string[];

  /** 계절 특징 */
  characteristics: string[];

  /** 일간-계절 조합 설명 템플릿 */
  descriptionTemplate: string;
}

/**
 * 일간 × 계절 조합 메타포
 */
export interface DayMasterSeasonMetaphor {
  /** 일간 */
  dayMaster: HeavenlyStem;

  /** 계절 */
  season: Season;

  /** 조합 ID (예: "경_winter") */
  id: string;

  /** 상태 이미지 (예: "얼어붙은 칼날") */
  stateImage: string;

  /** 메타포 톤 */
  tone: MetaphorTone;

  /** 조후 상태 */
  climateState: ClimateState;

  /** 필요한 오행 (조후용신) */
  neededElement: Element | null;

  /** 상세 메타포 텍스트 */
  metaphor: {
    /** 상황 설명 */
    situation: string;
    /** 심리적 함의 */
    psychological: string;
    /** 발현 양상 */
    manifestation: string;
    /** 주의점 (선택) */
    caution?: string;
    /** 희망 메시지 */
    hope: string;
  };
}

// ============================================
// 메타포 선택 결과
// ============================================

/**
 * 선택된 메타포 결과
 */
export interface SelectedMetaphor {
  /** 일간 기본 이미지 */
  dayMasterImage: DayMasterImage;

  /** 계절 변형 */
  seasonalVariation: SeasonalVariation;

  /** 일간×계절 조합 메타포 */
  combinedMetaphor: DayMasterSeasonMetaphor;

  /** 최종 중심 이미지 (한 문장) */
  centralImage: string;

  /** 조후 조언 */
  climateAdvice: string;
}

// ============================================
// 메타포 선택 입력
// ============================================

/**
 * 메타포 선택을 위한 입력 데이터
 */
export interface MetaphorSelectionInput {
  /** 일간 */
  dayMaster: string;

  /** 월지 */
  monthBranch: string;

  /** 사주 내 오행 분포 (선택) */
  elementDistribution?: {
    목: number;
    화: number;
    토: number;
    금: number;
    수: number;
  };

  /** 특수 조건 (선택) */
  specialConditions?: {
    /** 화 있음 */
    hasFire?: boolean;
    /** 수 있음 */
    hasWater?: boolean;
    /** 목 있음 */
    hasWood?: boolean;
  };
}

// ============================================
// 데이터 저장소 타입
// ============================================

/**
 * 일간 이미지 저장소
 */
export interface DayMasterImageStore {
  version: string;
  lastUpdated: string;
  images: DayMasterImage[];
}

/**
 * 계절 변형 저장소
 */
export interface SeasonalVariationStore {
  version: string;
  lastUpdated: string;
  variations: SeasonalVariation[];
}

/**
 * 일간×계절 메타포 저장소
 */
export interface DayMasterSeasonMetaphorStore {
  version: string;
  lastUpdated: string;
  metaphors: DayMasterSeasonMetaphor[];
}
