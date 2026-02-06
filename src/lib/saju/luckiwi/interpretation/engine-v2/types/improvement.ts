/**
 * 개선 결과 타입 정의
 *
 * 할루시네이션 방지를 위한 계층적 개선 방식
 */

import type { DimensionId } from './dimensions';
import type { Section, SajuInfo } from './evaluation';

// ============================================
// 개선 레벨
// ============================================

/**
 * 개선 레벨
 *
 * 할루시네이션 위험도에 따른 계층 구분
 */
export type ImprovementLevel =
  | 'preserve' // 절대 변경 불가 (사주학적 사실)
  | 'rearrange' // 재배치만 허용 (핵심 해석)
  | 'enhance' // 표현 강화 허용 (템플릿 + 원본 조합)
  | 'generate'; // 자유 생성 허용 (검증 필수)

/**
 * 콘텐츠 유형별 개선 레벨
 */
export const CONTENT_IMPROVEMENT_LEVELS: Record<string, ImprovementLevel> = {
  // 절대 보존
  dayPillar: 'preserve', // 일주 정보
  structure: 'preserve', // 격국 정보
  fiveElements: 'preserve', // 오행 관계
  yearlyFortune: 'preserve', // 운세 시기

  // 재배치만
  coreInterpretation: 'rearrange', // 핵심 해석
  metaphorCore: 'rearrange', // 중심 메타포

  // 표현 강화
  empathyExpression: 'enhance', // 공감 표현
  hopeMessage: 'enhance', // 희망 메시지
  transition: 'enhance', // 연결 문장

  // 자유 생성
  greeting: 'generate', // 인사말
  encouragement: 'generate', // 격려
  closing: 'generate', // 마무리
};

// ============================================
// 개선 요청
// ============================================

/**
 * 개선 요청
 */
export interface ImprovementRequest {
  /** 원본 텍스트 */
  originalText: string;

  /** 섹션 구조 */
  sections: Section[];

  /** 사주 정보 */
  sajuInfo: SajuInfo;

  /** 실패한 차원들 */
  failedDimensions: FailedDimensionInfo[];

  /** 개선 설정 */
  config?: ImprovementConfig;
}

/**
 * 실패 차원 정보
 */
export interface FailedDimensionInfo {
  /** 차원 ID */
  dimensionId: DimensionId;

  /** 현재 점수 */
  currentScore: number;

  /** 목표 점수 */
  targetScore: number;

  /** 구체적 문제점 */
  issues: string[];

  /** 개선 제안 */
  suggestions: string[];
}

/**
 * 개선 설정
 */
export interface ImprovementConfig {
  /** 최대 생성 레벨 (기본: enhance) */
  maxLevel?: ImprovementLevel;

  /** 검증 활성화 */
  enableVerification?: boolean;

  /** 원본 유사도 최소값 (0-1) */
  minOriginalSimilarity?: number;

  /** 디버그 모드 */
  debug?: boolean;
}

/**
 * 기본 개선 설정
 */
export const DEFAULT_IMPROVEMENT_CONFIG: ImprovementConfig = {
  maxLevel: 'enhance',
  enableVerification: true,
  minOriginalSimilarity: 0.7,
  debug: false,
};

// ============================================
// 개선 결과
// ============================================

/**
 * 개선 결과
 */
export interface ImprovementResult {
  /** 결과 ID */
  id: string;

  /** 개선 일시 */
  improvedAt: string;

  /** 성공 여부 */
  success: boolean;

  /** 개선된 전체 텍스트 */
  improvedText: string;

  /** 개선된 섹션들 */
  improvedSections: Section[];

  /** 적용된 개선 사항 */
  appliedImprovements: AppliedImprovement[];

  /** 변경 요약 */
  changeSummary: ChangeSummary;

  /** 검증 결과 */
  verification?: VerificationResult;

  /** 예상 점수 변화 */
  expectedScoreChanges: Record<DimensionId, number>;
}

/**
 * 적용된 개선 사항
 */
export interface AppliedImprovement {
  /** 대상 차원 */
  targetDimension: DimensionId;

  /** 개선 레벨 */
  level: ImprovementLevel;

  /** 개선 유형 */
  type: 'add' | 'modify' | 'rearrange' | 'delete';

  /** 대상 위치 */
  location: {
    sectionId?: string;
    position?: 'start' | 'end' | 'inline';
  };

  /** 원본 텍스트 (수정/삭제 시) */
  originalText?: string;

  /** 새 텍스트 */
  newText: string;

  /** 개선 이유 */
  reason: string;
}

/**
 * 변경 요약
 */
export interface ChangeSummary {
  /** 추가된 문장 수 */
  addedSentences: number;

  /** 수정된 문장 수 */
  modifiedSentences: number;

  /** 재배치된 문장 수 */
  rearrangedSentences: number;

  /** 삭제된 문장 수 */
  deletedSentences: number;

  /** 원본 대비 길이 변화율 */
  lengthChangeRate: number;

  /** 원본 유사도 (0-1) */
  originalSimilarity: number;
}

/**
 * 검증 결과
 */
export interface VerificationResult {
  /** 검증 통과 여부 */
  passed: boolean;

  /** 발견된 문제 */
  issues: VerificationIssue[];

  /** 수정 적용 여부 */
  correctionApplied: boolean;
}

/**
 * 검증 이슈
 */
export interface VerificationIssue {
  /** 이슈 유형 */
  type: 'hallucination' | 'inconsistency' | 'inaccuracy' | 'tone_mismatch';

  /** 이슈 설명 */
  description: string;

  /** 문제 텍스트 */
  problematicText: string;

  /** 수정 제안 */
  suggestion: string;

  /** 심각도 */
  severity: 'low' | 'medium' | 'high';
}

// ============================================
// 템플릿
// ============================================

/**
 * 개선 템플릿
 *
 * 안전한 표현 강화를 위한 사전 정의된 패턴
 */
export interface ImprovementTemplate {
  /** 템플릿 ID */
  id: string;

  /** 대상 차원 */
  targetDimension: DimensionId;

  /** 사용 조건 */
  condition: string;

  /** 템플릿 패턴 ({{variable}} 형식) */
  pattern: string;

  /** 필요한 변수들 */
  requiredVariables: string[];

  /** 예시 */
  example: string;
}

/**
 * 공감 표현 템플릿 예시
 */
export const EMPATHY_TEMPLATES: ImprovementTemplate[] = [
  {
    id: 'empathy-acknowledge-difficulty',
    targetDimension: 'empathy',
    condition: '현재 어려움이 있을 때',
    pattern:
      '{{difficulty}}를 겪고 계시는군요. 정말 힘드셨을 거예요. {{dayPillarTrait}}의 특성상 더욱 {{emotionalImpact}} 느끼셨을 수 있습니다.',
    requiredVariables: ['difficulty', 'dayPillarTrait', 'emotionalImpact'],
    example:
      '직장에서의 어려움을 겪고 계시는군요. 정말 힘드셨을 거예요. 갑목의 곧은 성품으로 인해 더욱 답답함을 느끼셨을 수 있습니다.',
  },
  {
    id: 'empathy-validate-feeling',
    targetDimension: 'empathy',
    condition: '감정 인정이 필요할 때',
    pattern:
      '지금 {{feeling}} 마음이 드시는 것은 당연합니다. {{reason}} 누구라도 그렇게 느낄 거예요.',
    requiredVariables: ['feeling', 'reason'],
    example:
      '지금 불안한 마음이 드시는 것은 당연합니다. 변화의 시기에는 누구라도 그렇게 느낄 거예요.',
  },
];

/**
 * 희망 메시지 템플릿 예시
 */
export const HOPE_TEMPLATES: ImprovementTemplate[] = [
  {
    id: 'hope-future-bright',
    targetDimension: 'hope',
    condition: '운세가 호전될 때',
    pattern:
      '{{timing}}부터 {{favorableElement}} 기운이 들어오면서 {{positiveChange}} 기대할 수 있습니다. {{dayPillarStrength}}을 발휘할 좋은 시기가 다가오고 있어요.',
    requiredVariables: [
      'timing',
      'favorableElement',
      'positiveChange',
      'dayPillarStrength',
    ],
    example:
      '2025년부터 수(水) 기운이 들어오면서 새로운 성장을 기대할 수 있습니다. 갑목의 뻗어나가는 힘을 발휘할 좋은 시기가 다가오고 있어요.',
  },
  {
    id: 'hope-strength-focus',
    targetDimension: 'hope',
    condition: '강점 부각이 필요할 때',
    pattern:
      '{{dayPillar}}에게는 {{strength}}라는 강점이 있습니다. 이 힘을 믿고 {{action}}, 반드시 좋은 결과가 있을 거예요.',
    requiredVariables: ['dayPillar', 'strength', 'action'],
    example:
      '갑목에게는 어떤 역경에도 꺾이지 않는 끈기라는 강점이 있습니다. 이 힘을 믿고 한 걸음씩 나아가시면, 반드시 좋은 결과가 있을 거예요.',
  },
];

/**
 * 실용 조언 템플릿 예시
 */
export const ACTIONABLE_TEMPLATES: ImprovementTemplate[] = [
  {
    id: 'action-career',
    targetDimension: 'actionable',
    condition: '직업 조언이 필요할 때',
    pattern:
      '{{dayPillarTrait}}의 특성을 살려 {{careerDirection}} 방향을 고려해보세요. 특히 {{specificField}} 분야에서 {{expectedOutcome}} 수 있습니다.',
    requiredVariables: [
      'dayPillarTrait',
      'careerDirection',
      'specificField',
      'expectedOutcome',
    ],
    example:
      '갑목의 리더십과 추진력을 살려 조직을 이끄는 방향을 고려해보세요. 특히 교육이나 컨설팅 분야에서 능력을 발휘할 수 있습니다.',
  },
  {
    id: 'action-relationship',
    targetDimension: 'actionable',
    condition: '관계 조언이 필요할 때',
    pattern:
      '{{dayPillarTrait}}는 {{relationshipTendency}} 경향이 있어요. {{specificAdvice}} 관계가 더욱 원만해질 거예요.',
    requiredVariables: [
      'dayPillarTrait',
      'relationshipTendency',
      'specificAdvice',
    ],
    example:
      '갑목은 자기 주장이 강한 경향이 있어요. 상대방의 의견을 먼저 들어보는 연습을 하시면 관계가 더욱 원만해질 거예요.',
  },
];
