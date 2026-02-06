/**
 * Self-RAG 검증 프롬프트
 *
 * AI가 생성한 개선 내용의 사실 검증
 */

// ============================================
// 시스템 프롬프트
// ============================================

export const VERIFY_SYSTEM_PROMPT = `# 역할
당신은 사주 통변문 검증 전문가입니다.
AI가 생성한 개선 내용이 사주학적으로 정확한지 검증합니다.

# 검증 원칙
1. 생성된 내용에서 주장(claim)을 추출합니다.
2. 각 주장을 <context>의 도메인 지식과 대조합니다.
3. 근거가 없는 주장은 "unverified"로 표시합니다.
4. 명백히 틀린 주장은 "false"로 표시합니다.
5. 검증된 주장만 "verified"로 표시합니다.

# 검증 기준
- **verified**: 도메인 지식에서 근거를 찾을 수 있음
- **unverified**: 도메인 지식에서 근거를 찾을 수 없으나 틀렸다고 단정 불가
- **false**: 도메인 지식과 명백히 모순됨
- **opinion**: 주관적 의견이나 조언으로 검증 불필요

# 출력 형식
반드시 아래 JSON 형식으로만 응답하세요:
{
  "claims": [
    {
      "text": "추출된 주장",
      "status": "verified" | "unverified" | "false" | "opinion",
      "evidence": "근거 (있을 경우)",
      "sourceId": "근거 출처 ID (있을 경우)",
      "correction": "수정 제안 (false인 경우)"
    }
  ],
  "overallValidity": "valid" | "partial" | "invalid",
  "recommendation": "유지" | "부분수정" | "제거",
  "summary": "검증 요약 (1문장)"
}`;

// ============================================
// 사용자 프롬프트 생성
// ============================================

export interface VerifyPromptContext {
  /** 검증할 텍스트 */
  textToVerify: string;
  /** 도메인 지식 문서들 */
  domainDocs: Array<{
    id: string;
    category: string;
    entityName: string;
    content: string;
  }>;
  /** 원본 사주 정보 */
  sajuInfo: {
    dayPillar?: string;
    elements?: string[];
  };
}

export function buildVerifyUserPrompt(context: VerifyPromptContext): string {
  const domainSection = context.domainDocs
    .map((d) => `[${d.id}] (${d.category}) ${d.entityName}: ${d.content}`)
    .join('\n\n');

  const sajuSection = [
    context.sajuInfo.dayPillar && `일주: ${context.sajuInfo.dayPillar}`,
    context.sajuInfo.elements &&
      `오행: ${context.sajuInfo.elements.join(', ')}`,
  ]
    .filter(Boolean)
    .join('\n');

  return `<context>
## 도메인 지식 (검증용)
${domainSection || '(도메인 지식 없음)'}

## 사주 정보
${sajuSection || '(정보 없음)'}
</context>

## 검증할 텍스트
${context.textToVerify}

위 텍스트에서 사주학적 주장들을 추출하고, 도메인 지식과 대조하여 검증하세요.
각 주장의 상태(verified/unverified/false/opinion)를 판정하세요.`;
}

// ============================================
// 응답 타입
// ============================================

export interface VerifyResponse {
  claims: Array<{
    text: string;
    status: 'verified' | 'unverified' | 'false' | 'opinion';
    evidence?: string;
    sourceId?: string;
    correction?: string;
  }>;
  overallValidity: 'valid' | 'partial' | 'invalid';
  recommendation: '유지' | '부분수정' | '제거';
  summary: string;
}
