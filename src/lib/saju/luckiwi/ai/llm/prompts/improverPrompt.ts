/**
 * AI Improver 프롬프트
 *
 * 평가 결과를 바탕으로 통변문을 개선하는 시스템 프롬프트
 */

// ============================================
// 시스템 프롬프트
// ============================================

export const IMPROVER_SYSTEM_PROMPT = `# 역할
당신은 사주 통변문 개선 전문가입니다.
원본의 의미를 유지하면서 품질을 높이는 것이 목표입니다.

# 개선 원칙
1. 원본 텍스트의 핵심 메시지와 중심 메타포를 보존합니다.
2. <context>의 개선 패턴 예시를 참고하여 자연스럽게 개선합니다.
3. 새로 추가하는 문장은 해당 통변의 맥락에 맞게 동적으로 생성합니다.
4. 모든 개선에는 근거(차원 ID, 패턴 ID)를 명시합니다.
5. 과도한 개선보다 자연스러움을 우선합니다.
6. 사주 해석의 일관성을 해치지 않습니다.

# 개선 유형
- **add_sentence**: 문장 추가 (공감, 희망, 조언 등)
- **modify_tone**: 톤 수정 (단정 → 가능성 표현)
- **add_metaphor**: 메타포 확장 (중심 이미지 연결)
- **simplify**: 단순화 (전문용어 설명, 문장 분리)
- **restructure**: 구조 개선 (섹션 추가, 순서 조정)

# 금지 사항
- 사주 도메인 외 내용 추가
- 부정적 예언이나 불안 조성
- 건강/법률/투자 등 전문 영역 조언
- 원본에 없는 사주 정보 추가
- 원본의 핵심 해석 변경

# 출력 형식
반드시 아래 JSON 형식으로만 응답하세요:
{
  "sectionImprovements": [
    {
      "sectionId": "섹션 ID 또는 위치 설명",
      "sectionTitle": "섹션 제목",
      "additions": [
        {
          "position": "start" | "end" | "after:특정문장",
          "text": "추가할 문장",
          "reason": "추가 이유",
          "targetDimension": "개선 대상 차원 ID",
          "patternRef": "참고한 패턴 ID (있을 경우)"
        }
      ],
      "modifications": [
        {
          "original": "원본 문장",
          "improved": "개선된 문장",
          "reason": "수정 이유",
          "targetDimension": "개선 대상 차원 ID"
        }
      ]
    }
  ],
  "globalAdditions": [
    {
      "text": "추가할 전체 문장",
      "reason": "추가 이유",
      "targetDimension": "차원 ID",
      "suggestedPosition": "intro | conclusion | after:섹션명"
    }
  ],
  "expectedScoreImprovement": {
    "structure": 0,
    "metaphor": 0,
    "empathy": 5,
    "hope": 3,
    "practicality": 0,
    "tone": 2,
    "readability": 0,
    "emotionalJourney": 1
  },
  "summary": "개선 요약 (1-2문장)"
}`;

// ============================================
// 사용자 프롬프트 생성
// ============================================

export interface ImproverPromptContext {
  /** 개선 패턴 예시들 */
  improvementPatterns: Array<{
    id: string;
    targetDimension: string;
    patternType: string;
    before: string;
    after: string;
    transformationGuide: string;
  }>;
  /** 도메인 지식 (사주 관련) */
  domainDocs: Array<{
    id: string;
    entityName: string;
    content: string;
  }>;
  /** 원본 통변문 */
  originalText: string;
  /** 평가 결과 */
  evaluationResult: {
    totalScore: number;
    dimensionScores: { [key: string]: { score: number; feedback: string } };
    improvementPoints: Array<{
      dimension: string;
      originalText: string;
      issue: string;
      suggestionType: string;
    }>;
  };
  /** 사주 정보 */
  sajuInfo: {
    dayPillar?: string;
    centralMetaphor?: string;
  };
}

export function buildImproverUserPrompt(
  context: ImproverPromptContext
): string {
  const patternsSection = context.improvementPatterns
    .map(
      (p) => `[${p.id}] ${p.targetDimension} - ${p.patternType}
Before: ${p.before}
After: ${p.after}
가이드: ${p.transformationGuide}`
    )
    .join('\n\n---\n\n');

  const domainSection = context.domainDocs
    .map((d) => `[${d.id}] ${d.entityName}: ${d.content}`)
    .join('\n');

  const evaluationSection = `현재 점수: ${context.evaluationResult.totalScore}점

차원별 점수:
${Object.entries(context.evaluationResult.dimensionScores)
  .map(([dim, data]) => `- ${dim}: ${data.score}점 - ${data.feedback}`)
  .join('\n')}

개선 필요 포인트:
${context.evaluationResult.improvementPoints
  .map(
    (p, i) => `${i + 1}. [${p.dimension}] "${p.originalText}"
   문제: ${p.issue}
   제안: ${p.suggestionType}`
  )
  .join('\n')}`;

  const sajuSection = [
    context.sajuInfo.dayPillar && `일주: ${context.sajuInfo.dayPillar}`,
    context.sajuInfo.centralMetaphor &&
      `중심 메타포: ${context.sajuInfo.centralMetaphor}`,
  ]
    .filter(Boolean)
    .join('\n');

  return `<context>
## 개선 패턴 예시
${patternsSection || '(패턴 없음)'}

## 사주 도메인 지식
${domainSection || '(도메인 지식 없음)'}
</context>

## 원본 통변문
${context.originalText}

## 평가 결과
${evaluationSection}

## 사주 정보
${sajuSection || '(정보 없음)'}

위 평가 결과의 개선 필요 포인트를 참고하여 통변문을 개선하세요.
개선 패턴 예시를 참고하되, 이 통변문의 맥락과 중심 메타포에 맞게 동적으로 생성하세요.
원본의 핵심 의미를 유지하면서 자연스럽게 개선하세요.`;
}

// ============================================
// 응답 타입
// ============================================

export interface ImproverResponse {
  sectionImprovements: Array<{
    sectionId: string;
    sectionTitle: string;
    additions: Array<{
      position: string;
      text: string;
      reason: string;
      targetDimension: string;
      patternRef?: string;
    }>;
    modifications: Array<{
      original: string;
      improved: string;
      reason: string;
      targetDimension: string;
    }>;
  }>;
  globalAdditions: Array<{
    text: string;
    reason: string;
    targetDimension: string;
    suggestedPosition: string;
  }>;
  expectedScoreImprovement: { [dimension: string]: number };
  summary: string;
}
