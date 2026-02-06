/**
 * 개선기 프롬프트
 *
 * 할루시네이션 방지를 위한 계층적 개선 프롬프트
 */

import type { DimensionId, FailedDimensionInfo, SajuInfo } from '../types';
import { DIMENSIONS } from '../types';

// ============================================
// 시스템 프롬프트
// ============================================

export const IMPROVER_SYSTEM_PROMPT = `당신은 사주 통변문 품질 개선 전문가입니다.

## 역할
평가에서 부족한 점이 발견된 통변문을 개선합니다.

## 핵심 원칙: 할루시네이션 방지

### 절대 변경 불가 (preserve)
- 일주, 격국, 오행 관계 등 사주학적 사실
- 운세 시기, 대운/세운 정보
- 원본에 명시된 구체적 해석

### 재배치만 허용 (rearrange)
- 핵심 해석 문장의 순서 변경
- 단락 구조 재편성
- 중복 제거

### 표현 강화 허용 (enhance)
- 공감/위로 표현 추가 (템플릿 기반)
- 희망 메시지 보강
- 연결 문장 삽입
- 단, 원본 의미 유지 필수

### 자유 생성 허용 (generate) - 검증 필수
- 인사말, 마무리
- 격려 문구
- 단, 사주학적 사실 언급 금지

## 개선 방식
1. 원본 텍스트 분석
2. 부족한 차원 파악
3. 해당 차원에 맞는 표현 추가/수정
4. 원본의 핵심 내용은 반드시 유지

## 응답 형식
반드시 지정된 JSON 형식으로만 응답하세요.`;

// ============================================
// 사용자 프롬프트 빌더
// ============================================

export interface ImproverPromptParams {
  /** 원본 텍스트 */
  originalText: string;

  /** 사주 정보 */
  sajuInfo: SajuInfo;

  /** 실패한 차원들 */
  failedDimensions: FailedDimensionInfo[];

  /** 최대 생성 레벨 */
  maxLevel: 'preserve' | 'rearrange' | 'enhance' | 'generate';
}

/**
 * 개선 프롬프트 생성
 */
export function buildImproverPrompt(params: ImproverPromptParams): string {
  const { originalText, sajuInfo, failedDimensions, maxLevel } = params;

  const failedDetails = failedDimensions
    .map((fd) => formatFailedDimension(fd))
    .join('\n\n');

  const levelConstraint = getLevelConstraint(maxLevel);

  return `## 사주 정보
- 일주: ${sajuInfo.dayPillar}${sajuInfo.dayPillarName ? ` (${sajuInfo.dayPillarName})` : ''}
${sajuInfo.structure ? `- 격국: ${sajuInfo.structure}` : ''}
${sajuInfo.favorableElement ? `- 용신: ${sajuInfo.favorableElement}` : ''}

## 원본 텍스트 (개선 대상)
---
${originalText}
---

## 개선이 필요한 차원
${failedDetails}

## 개선 제약 조건
${levelConstraint}

## 개선 요청
위 원본을 개선하여 다음 JSON 형식으로 응답하세요:

\`\`\`json
{
  "improvedText": "개선된 전체 텍스트",
  "improvements": [
    {
      "targetDimension": "차원 ID",
      "type": "add | modify | rearrange",
      "location": "어디에 적용했는지",
      "originalText": "원본 (수정인 경우)",
      "newText": "새 텍스트",
      "reason": "개선 이유"
    }
  ],
  "preservedElements": ["유지한 핵심 요소 1", "요소 2"],
  "summary": "개선 요약 (1-2문장)"
}
\`\`\`

※ 반드시 원본의 사주학적 정보는 그대로 유지하세요.
※ 새로 추가하는 내용에서 사주학적 사실을 지어내지 마세요.
※ 각 차원별로 최소 1개 이상의 개선을 적용하세요.`;
}

/**
 * 실패 차원 포맷
 */
function formatFailedDimension(fd: FailedDimensionInfo): string {
  const dim = DIMENSIONS[fd.dimensionId];
  const issues = fd.issues.map((i) => `  - ${i}`).join('\n');
  const suggestions = fd.suggestions.map((s) => `  - ${s}`).join('\n');

  return `### ${fd.dimensionId}: ${dim?.name || fd.dimensionId} (현재 ${fd.currentScore}점 → 목표 ${fd.targetScore}점)
**문제점**:
${issues}
**개선 제안**:
${suggestions}`;
}

/**
 * 레벨별 제약 조건
 */
function getLevelConstraint(maxLevel: string): string {
  switch (maxLevel) {
    case 'preserve':
      return `⚠️ 매우 제한적 모드: 오직 순서 변경과 형식 정리만 허용됩니다.
- 새로운 문장 추가 금지
- 기존 문장 수정 금지`;

    case 'rearrange':
      return `⚠️ 재배치 모드: 기존 내용의 재배치와 경미한 수정만 허용됩니다.
- 새로운 해석 추가 금지
- 기존 문장의 톤/어조 조정 가능`;

    case 'enhance':
      return `✅ 표현 강화 모드: 공감, 희망, 연결 표현을 추가할 수 있습니다.
- 공감/위로 문장 추가 가능
- 희망 메시지 보강 가능
- 단, 사주학적 새로운 해석 추가 금지
- 원본에 없는 사주 정보 언급 금지`;

    case 'generate':
    default:
      return `✅ 자유 생성 모드: 인사말, 마무리 등 자유롭게 추가 가능합니다.
- 단, 사주학적 사실은 원본에 있는 것만 사용
- 새로운 사주 해석 절대 금지
- 생성된 내용은 검증됩니다`;
  }
}

// ============================================
// 응답 스키마
// ============================================

/**
 * 개선 응답 타입
 */
export interface ImproverResponse {
  improvedText: string;
  improvements: {
    targetDimension: string;
    type: 'add' | 'modify' | 'rearrange';
    location: string;
    originalText?: string;
    newText: string;
    reason: string;
  }[];
  preservedElements: string[];
  summary: string;
}

/**
 * JSON 스키마
 */
export const IMPROVER_JSON_SCHEMA = {
  type: 'object',
  properties: {
    improvedText: { type: 'string' },
    improvements: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          targetDimension: { type: 'string' },
          type: { type: 'string', enum: ['add', 'modify', 'rearrange'] },
          location: { type: 'string' },
          originalText: { type: 'string' },
          newText: { type: 'string' },
          reason: { type: 'string' },
        },
        required: ['targetDimension', 'type', 'location', 'newText', 'reason'],
      },
    },
    preservedElements: { type: 'array', items: { type: 'string' } },
    summary: { type: 'string' },
  },
  required: ['improvedText', 'improvements', 'preservedElements', 'summary'],
};
