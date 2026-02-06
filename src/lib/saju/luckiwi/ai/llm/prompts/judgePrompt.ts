/**
 * AI Judge 프롬프트
 *
 * 통변문 품질을 8개 차원으로 평가하는 시스템 프롬프트
 */

// ============================================
// 시스템 프롬프트
// ============================================

export const JUDGE_SYSTEM_PROMPT = `# 역할
당신은 사주 통변문 품질 평가 전문가입니다.
30년 경력의 명리학자이자, 고객 심리를 이해하는 상담가입니다.

# 평가 원칙
1. 반드시 <context> 태그 내 벤치마크 문서와 평가 기준만을 참조합니다.
2. 각 차원에 대해 0-100점을 부여하고, 구체적 근거를 제시합니다.
3. 개선이 필요한 부분은 정확한 문장을 인용하여 지적합니다.
4. 긍정적 평가와 개선점을 균형있게 제시합니다.
5. 절대 허위 정보나 없는 내용을 만들어내지 않습니다.

# 평가 차원 (8개, 총 100%)
1. **structure (15%)**: 구조적 완성도
   - 도입부, 기본 구조, 조언, 관계, 직업, 핵심 문장, 결론 포함 여부

2. **metaphor (15%)**: 메타포 일관성
   - 중심 메타포 명확성, 전체 문서에서 일관되게 유지, 자연 비유 사용

3. **empathy (20%)**: 공감 지수
   - 독자의 고생 인정, 상황 이해 표현, "당신 탓이 아닙니다" 류 위로

4. **hope (15%)**: 희망 지수
   - 긍정적 미래 전망, 가능성 언급, 변화 가능성, 희망적 마무리

5. **practicality (10%)**: 실용성
   - 구체적 실천 조언, 직업 가이드, 주의사항, 액션 플랜

6. **tone (10%)**: 톤 적절성
   - 단정 회피 ("~입니다" → "~일 수 있습니다"), 예언이 아닌 가능성, 존중

7. **readability (10%)**: 가독성
   - 전문용어 절제 및 설명, 적절한 문장 길이, 문단 구분

8. **emotionalJourney (5%)**: 감정 여정
   - 공감으로 시작 → 이해 제공 → 희망으로 마무리 흐름

# 점수 기준
- 90-100: 우수 (A) - 해당 차원에서 모범적
- 80-89: 양호 (B) - 대부분 잘 되어 있음
- 70-79: 보통 (C) - 기본은 갖추었으나 보완 필요
- 60-69: 미흡 (D) - 주요 개선 필요
- 0-59: 부족 (F) - 재작성 권장

# 출력 형식
반드시 아래 JSON 형식으로만 응답하세요:
{
  "dimensionScores": {
    "structure": { "score": number, "feedback": "피드백", "evidence": ["인용1", "인용2"] },
    "metaphor": { "score": number, "feedback": "피드백", "evidence": [] },
    "empathy": { "score": number, "feedback": "피드백", "evidence": [] },
    "hope": { "score": number, "feedback": "피드백", "evidence": [] },
    "practicality": { "score": number, "feedback": "피드백", "evidence": [] },
    "tone": { "score": number, "feedback": "피드백", "evidence": [] },
    "readability": { "score": number, "feedback": "피드백", "evidence": [] },
    "emotionalJourney": { "score": number, "feedback": "피드백", "evidence": [] }
  },
  "totalScore": number,
  "totalGrade": "A" | "B" | "C" | "D" | "F",
  "strengths": ["강점1", "강점2", "강점3"],
  "improvementPoints": [
    {
      "dimension": "차원ID",
      "originalText": "문제가 되는 원문 인용",
      "issue": "문제 설명",
      "suggestionType": "add_empathy | add_hope | modify_tone | add_metaphor | add_advice | simplify"
    }
  ],
  "overallFeedback": "종합 피드백 (2-3문장)",
  "confidence": "high" | "medium" | "low"
}`;

// ============================================
// 사용자 프롬프트 생성
// ============================================

export interface JudgePromptContext {
  /** 벤치마크 문서들 */
  benchmarkDocs: Array<{
    id: string;
    quality: 'excellent' | 'good';
    excerpt: string;
  }>;
  /** 평가 기준 문서들 */
  criteriaDocuments: Array<{
    dimensionId: string;
    name: string;
    scoringGuideline: string;
  }>;
  /** 평가 대상 통변문 */
  evaluationText: string;
  /** 사주 분석 정보 */
  sajuInfo: {
    dayPillar?: string;
    structure?: string;
    strength?: string;
  };
}

export function buildJudgeUserPrompt(context: JudgePromptContext): string {
  const benchmarkSection = context.benchmarkDocs
    .map(
      (d) =>
        `[${d.id}] (${d.quality === 'excellent' ? '우수' : '양호'} 예시)\n${d.excerpt}`
    )
    .join('\n\n---\n\n');

  const criteriaSection = context.criteriaDocuments
    .map((d) => `- **${d.name}** (${d.dimensionId}): ${d.scoringGuideline}`)
    .join('\n');

  const sajuSection = [
    context.sajuInfo.dayPillar && `일주: ${context.sajuInfo.dayPillar}`,
    context.sajuInfo.structure && `격국: ${context.sajuInfo.structure}`,
    context.sajuInfo.strength && `강약: ${context.sajuInfo.strength}`,
  ]
    .filter(Boolean)
    .join('\n');

  return `<context>
## 벤치마크 문서 (우수 사례)
${benchmarkSection || '(벤치마크 문서 없음)'}

## 평가 기준
${criteriaSection || '(평가 기준 문서 없음)'}
</context>

## 평가 대상 통변문
${context.evaluationText}

## 사주 분석 정보
${sajuSection || '(정보 없음)'}

위 통변문을 8개 차원으로 평가하고 JSON 형식으로 결과를 반환하세요.
벤치마크 문서와 비교하여 구체적인 피드백을 제공하세요.`;
}

// ============================================
// 응답 타입
// ============================================

export interface JudgeResponse {
  dimensionScores: {
    [key: string]: {
      score: number;
      feedback: string;
      evidence: string[];
    };
  };
  totalScore: number;
  totalGrade: 'A' | 'B' | 'C' | 'D' | 'F';
  strengths: string[];
  improvementPoints: Array<{
    dimension: string;
    originalText: string;
    issue: string;
    suggestionType: string;
  }>;
  overallFeedback: string;
  confidence: 'high' | 'medium' | 'low';
}
