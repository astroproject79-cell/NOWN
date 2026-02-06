/**
 * 평가기 프롬프트
 *
 * 사용자 관점 8개 차원 평가를 위한 시스템 프롬프트
 */

import type { DimensionId, Dimension } from '../types';
import { DIMENSIONS } from '../types';

// ============================================
// 시스템 프롬프트
// ============================================

export const EVALUATOR_SYSTEM_PROMPT = `당신은 사주 통변문(해석문) 품질 평가 전문가입니다.

## 역할
사용자가 제출한 사주 해석문을 **사용자 관점**에서 평가합니다.
전문가가 아닌 일반 사용자가 읽었을 때 느끼는 만족도를 평가합니다.

## 평가 원칙
1. **사용자 중심**: 전문성보다 공감과 실용성을 중시
2. **객관적 평가**: 개인 취향이 아닌 보편적 기준 적용
3. **근거 기반**: 평가 점수에는 반드시 텍스트 근거 제시
4. **건설적 피드백**: 문제점뿐 아니라 개선 방향도 제시

## 점수 기준
- 90-100: 탁월함 - 사용자가 감동받을 수준
- 80-89: 우수함 - 만족스러운 수준
- 70-79: 양호함 - 기본은 갖춤 (Pass 기준)
- 60-69: 미흡함 - 개선 필요
- 0-59: 부족함 - 상당한 개선 필요

## 응답 형식
반드시 지정된 JSON 형식으로만 응답하세요.`;

// ============================================
// 사용자 프롬프트 빌더
// ============================================

export interface EvaluatorPromptParams {
  /** 평가 대상 텍스트 */
  text: string;

  /** 사주 정보 */
  sajuInfo: {
    dayPillar: string;
    dayPillarName?: string;
    structure?: string;
    age?: number;
    gender?: string;
  };

  /** 평가할 차원들 */
  dimensions: DimensionId[];
}

/**
 * 평가 프롬프트 생성
 */
export function buildEvaluatorPrompt(params: EvaluatorPromptParams): string {
  const { text, sajuInfo, dimensions } = params;

  const dimensionDescriptions = dimensions
    .map((dimId) => {
      const dim = DIMENSIONS[dimId];
      return formatDimensionDescription(dim);
    })
    .join('\n\n');

  return `## 사주 정보
- 일주: ${sajuInfo.dayPillar}${sajuInfo.dayPillarName ? ` (${sajuInfo.dayPillarName})` : ''}
${sajuInfo.structure ? `- 격국: ${sajuInfo.structure}` : ''}
${sajuInfo.age ? `- 나이: ${sajuInfo.age}세` : ''}
${sajuInfo.gender ? `- 성별: ${sajuInfo.gender === 'male' ? '남성' : '여성'}` : ''}

## 평가 대상 텍스트
---
${text}
---

## 평가 차원
${dimensionDescriptions}

## 평가 요청
위 텍스트를 각 차원별로 평가하고, 다음 JSON 형식으로 응답하세요:

\`\`\`json
{
  "dimensions": {
    "${dimensions[0]}": {
      "score": 0-100 사이 정수,
      "passed": true/false (70점 이상이면 true),
      "feedback": "평가 요약 (1-2문장)",
      "evidence": ["텍스트에서 발췌한 근거 1", "근거 2"],
      "failedItems": [
        {
          "criterionId": "기준 ID",
          "criterionName": "기준 이름",
          "reason": "부족한 이유",
          "suggestion": "구체적 개선 제안"
        }
      ]
    }
    // ... 다른 차원들도 동일 형식
  },
  "overallFeedback": "종합 평가 (2-3문장)"
}
\`\`\`

※ 모든 차원을 빠짐없이 평가하세요.
※ failedItems는 점수가 70 미만이거나 개선이 필요한 기준만 포함하세요.`;
}

/**
 * 차원 설명 포맷
 */
function formatDimensionDescription(dim: Dimension): string {
  const criteriaList = dim.criteria
    .map((c) => {
      const items = c.checkItems.map((item) => `    - ${item}`).join('\n');
      return `  - ${c.name}\n${items}`;
    })
    .join('\n');

  return `### ${dim.id}: ${dim.name}
**질문**: ${dim.userQuestion}
**설명**: ${dim.description}
**Pass 기준**: ${dim.passThreshold}점 이상
**평가 항목**:
${criteriaList}`;
}

// ============================================
// 응답 스키마
// ============================================

/**
 * 평가 응답 타입 (LLM 응답용)
 */
export interface EvaluatorResponse {
  dimensions: Record<
    string,
    {
      score: number;
      passed: boolean;
      feedback: string;
      evidence: string[];
      failedItems: {
        criterionId: string;
        criterionName: string;
        reason: string;
        suggestion: string;
      }[];
    }
  >;
  overallFeedback: string;
}

/**
 * JSON 스키마 (구조화된 출력용)
 */
export const EVALUATOR_JSON_SCHEMA = {
  type: 'object',
  properties: {
    dimensions: {
      type: 'object',
      additionalProperties: {
        type: 'object',
        properties: {
          score: { type: 'number', minimum: 0, maximum: 100 },
          passed: { type: 'boolean' },
          feedback: { type: 'string' },
          evidence: { type: 'array', items: { type: 'string' } },
          failedItems: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                criterionId: { type: 'string' },
                criterionName: { type: 'string' },
                reason: { type: 'string' },
                suggestion: { type: 'string' },
              },
              required: ['criterionId', 'criterionName', 'reason', 'suggestion'],
            },
          },
        },
        required: ['score', 'passed', 'feedback', 'evidence', 'failedItems'],
      },
    },
    overallFeedback: { type: 'string' },
  },
  required: ['dimensions', 'overallFeedback'],
};
