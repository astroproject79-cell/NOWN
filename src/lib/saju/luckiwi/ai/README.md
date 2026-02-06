# AI 사주 해석 엔진

> Graph + Hierarchical RAG 기반 자연어 사주 해석 시스템

## 아키텍처

```
구조화된 분석 결과 → AI 해석 엔진 → 자연어 해석 + 개인화 조언
```

### 전체 흐름

```
┌─────────────────────────────────────────────────────────────┐
│                    Knowledge Layer                          │
├─────────────────────────────────────────────────────────────┤
│  [Neo4j Graph DB]                                           │
│                                                              │
│   일주(60) ←→ 십신(10) ←→ 오행(5) ←→ 격국(14)              │
│      ↓           ↓           ↓          ↓                   │
│   해석노드들 (계층적으로 연결)                               │
│                                                              │
│   L0: 일주 기본 해석                                         │
│   L1: 일주 + 격국 해석                                       │
│   L2: 일주 + 격국 + 강약 해석                                │
│   L3: 일주 + 격국 + 강약 + 용신 해석                         │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Retrieval Layer                          │
├─────────────────────────────────────────────────────────────┤
│  1. Graph Traversal: 분석 결과 → 시작 노드 → 관계 탐색      │
│  2. Hierarchical Filtering: L0 → L1 → L2 → L3               │
│  3. Compression: 각 레벨 해석 → 요약 → 컨텍스트             │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Synthesis Layer                          │
├─────────────────────────────────────────────────────────────┤
│  [Gemini Flash/Pro]                                          │
│  Input: 분석 결과 + 컨텍스트 + 그래프 경로                   │
│  Output: 종합 해석 + 개인화 조언 + 근거                      │
└─────────────────────────────────────────────────────────────┘
```

## 기술 스택

| 컴포넌트 | 선택 | 이유 |
|---------|------|------|
| **Graph DB** | Neo4j Community | 무료, Cypher 쿼리, 성숙도 |
| **Vector DB** | Qdrant | 하이브리드 검색, 한국어 지원 |
| **LLM** | Gemini Flash/Pro | 비용 효율, 한국어 성능 |
| **Embedding** | BGE-M3 | 다국어, 무료 |
| **Orchestration** | LlamaIndex | PropertyGraph 지원 |

## 폴더 구조

```
src/ai/
├── README.md           # 이 문서
├── graph/
│   ├── schema.ts       # 그래프 스키마 정의
│   ├── client.ts       # Neo4j 연결
│   └── queries.ts      # Cypher 쿼리
├── rag/
│   ├── retriever.ts    # 그래프 탐색 + 검색
│   ├── compressor.ts   # 계층적 압축
│   └── pipeline.ts     # RAG 파이프라인
├── llm/
│   ├── gemini.ts       # Gemini API
│   ├── router.ts       # LLM 라우팅
│   └── prompts.ts      # 프롬프트 템플릿
└── interpret.ts        # 통합 해석 서비스
```

## 그래프 스키마

### 노드 타입

| 노드 | 설명 | 속성 |
|------|------|------|
| `HeavenlyStem` | 천간 (10개) | name, element, polarity |
| `EarthlyBranch` | 지지 (12개) | name, element, season |
| `DayPillar` | 일주 (60개) | name, stem, branch |
| `TenGod` | 십신 (10개) | name, category |
| `Structure` | 격국 (14개) | name, category |
| `Element` | 오행 (5개) | name |
| `Interpretation` | 해석 | level, content, source |

### 엣지 타입

| 엣지 | 설명 |
|------|------|
| `GENERATES` | 생 (목→화) |
| `CONTROLS` | 극 (목→토) |
| `COMBINES` | 합 (갑기합토) |
| `CLASHES` | 충 (자↔오) |
| `HAS_INTERPRETATION` | 해석 연결 |
| `WITH_CONDITION` | 조건부 해석 |

## LLM 라우팅

```
요청 복잡도에 따른 라우팅:

간단 (캐시됨)     → Gemini Flash  → 일주 기본, 오늘의 운세
중간             → Gemini Flash  → 격국+용신 해석
복잡             → Gemini Pro    → 종합 분석, 대운/세운
```

### 비용 최적화

1. **캐싱**: 60일주 기본 해석 사전 생성
2. **티어 분리**: 무료=캐시, 유료=실시간 LLM
3. **배치 처리**: 비동기 요청 묶어서 처리

## 구현 로드맵

### Phase 1: 기반 구축 (현재)
- [x] 폴더 구조 생성
- [ ] Neo4j Docker 설정
- [ ] 그래프 스키마 구현
- [ ] 샘플 데이터 5개 일주 입력
- [ ] 기본 Cypher 쿼리

### Phase 2: 지식 구축
- [ ] 60일주 기본 해석 수집
- [ ] 해석 데이터 구조화
- [ ] Neo4j에 입력

### Phase 3: RAG 파이프라인
- [ ] LlamaIndex PropertyGraph 설정
- [ ] 그래프 탐색 로직
- [ ] Gemini API 연동

### Phase 4: 서비스 통합
- [ ] `/api/v1/saju/interpret` 엔드포인트
- [ ] 캐싱 레이어
- [ ] 프롬프트 최적화

## 사용 예시

```typescript
import { interpret } from './ai/interpret';

const analysis = await performFullAnalysis(fourPillars);
const interpretation = await interpret(analysis, {
  level: 'detailed',  // 'simple' | 'detailed' | 'comprehensive'
  focus: ['career', 'relationship'],  // 관심 분야
  language: 'ko'
});

console.log(interpretation.summary);
// "경자일주는 금수쌍청의 기운을 가진..."
console.log(interpretation.advice);
// "현재 대운에서는..."
```

## 환경 변수

```env
# Neo4j
NEO4J_URI=bolt://localhost:7687
NEO4J_USER=neo4j
NEO4J_PASSWORD=your-password

# Gemini
GEMINI_API_KEY=your-api-key

# Qdrant (선택)
QDRANT_URL=http://localhost:6333
```

---

## 도메인 특화 AI 구축 전략

> 사주 분야 전문 AI를 구축하기 위한 핵심 기법들

### 핵심 원칙

| 원칙 | 설명 |
|------|------|
| **Grounding** | 검색된 지식만으로 답변, 외부 지식 사용 금지 |
| **Attribution** | 모든 해석에 출처 명시 |
| **Uncertainty** | 불확실한 경우 "~로 해석될 수 있습니다" 표현 |
| **Guardrails** | 금지 영역(건강/법률/투자) 자동 차단 |

### 시스템 프롬프트 구조

```
┌─────────────────────────────────────────────────────────────┐
│ Layer 1: 페르소나 정의                                       │
│ "당신은 30년 경력의 명리학 전문가입니다..."                  │
├─────────────────────────────────────────────────────────────┤
│ Layer 2: 역할 범위                                          │
│ - 사주팔자 분석 및 해석 ✓                                   │
│ - 대운, 세운, 월운 운세 풀이 ✓                              │
│ - 건강/법률/투자 조언 ✗                                     │
├─────────────────────────────────────────────────────────────┤
│ Layer 3: 응답 원칙                                          │
│ 1. 검색된 문서만 기반으로 답변                               │
│ 2. 문서에 없으면 "해당 정보를 찾을 수 없습니다"              │
│ 3. 모든 해석에 출처 ID 태깅 [REF:xxx]                        │
├─────────────────────────────────────────────────────────────┤
│ Layer 4: 금지 사항                                          │
│ - 부정적 예언, 공포 조장 금지                                │
│ - 특정 결정 강요 금지                                        │
│ - 외부 지식(학습 데이터) 사용 금지                           │
└─────────────────────────────────────────────────────────────┘
```

### 시스템 프롬프트 예시

```typescript
const SYSTEM_PROMPT = `
# 역할
당신은 30년 경력의 명리학 전문가입니다. 적천수, 자평진전, 궁통보감 등
고전 명리학 서적을 연구해왔으며, 현대적 해석도 병행합니다.

# 응답 원칙
1. 반드시 <context> 태그 내 검색된 문서만을 기반으로 답변하세요.
2. 문서에 없는 내용은 절대 추론하거나 생성하지 마세요.
3. 확실하지 않은 경우 "~로 해석될 수 있습니다" 등 조심스럽게 표현하세요.
4. 모든 해석의 끝에 출처를 [출처: xxx] 형태로 명시하세요.
5. 문서에서 답을 찾을 수 없으면 "해당 정보를 찾을 수 없습니다"라고 답하세요.

# 금지 사항
- 건강, 법률, 투자 등 전문 영역 조언
- 부정적 예언이나 공포 조장
- 특정 결정 강요
- 외부 지식 사용 (검색된 문서 외)

# 출력 형식
{
  "summary": "1-2문장 핵심 요약",
  "interpretation": "상세 해석 (출처 태그 포함)",
  "advice": "조언 (선택)",
  "sources": ["출처 ID 배열"],
  "confidence": "high | medium | low"
}
`;
```

---

## 할루시네이션 방지 파이프라인

> 6단계 검증으로 신뢰성 확보

```
[입력] 사용자 질문 + 사주 분석 결과
                    │
                    ▼
┌─────────────────────────────────────────────────────────────┐
│ Stage 1: Query Understanding                                 │
│ - 질문 유형 분류 (일주/격국/운세/궁합)                       │
│ - 필요한 지식 영역 식별                                      │
│ - 잘못된 질문 거부 (건강/법률/투자)                          │
└─────────────────────────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────────────┐
│ Stage 2: Knowledge Retrieval (RAG)                           │
│ - Neo4j 그래프 탐색 (관계 기반 검색)                         │
│ - Vector DB 유사도 검색 (의미 기반)                          │
│ - Hybrid: 두 결과 병합 및 Re-ranking                         │
└─────────────────────────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────────────┐
│ Stage 3: Context Compression                                 │
│ - 검색된 문서들 중복 제거                                    │
│ - 우선순위 정렬 (level, relevance)                           │
│ - 토큰 제한 내 압축 (8K 이내)                                │
└─────────────────────────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────────────┐
│ Stage 4: LLM Generation                                      │
│ - Structured Prompt + JSON Schema                            │
│ - Temperature: 0.3 (보수적)                                  │
│ - 출처 인용 강제                                             │
└─────────────────────────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────────────┐
│ Stage 5: Chain-of-Verification (CoVe)                        │
│ - 초안에서 사실 주장(claim) 추출                             │
│ - 각 주장에 대한 검증 질문 생성                              │
│ - 독립적으로 검증 (RAG 재검색)                               │
│ - 불일치 시 수정 또는 제거                                   │
└─────────────────────────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────────────┐
│ Stage 6: Output Guardrails                                   │
│ - 금지어/부정적 표현 필터링                                  │
│ - 톤 검증 (공포 조장 차단)                                   │
│ - JSON 스키마 유효성 검증                                    │
│ - 출처 없는 주장 제거                                        │
└─────────────────────────────────────────────────────────────┘
                    │
                    ▼
[출력] 검증된 해석 결과 (JSON)
```

### Chain-of-Verification (CoVe) 상세

> Meta AI 연구진이 개발한 자기 검증 기법

```typescript
// CoVe 구현 예시
async function chainOfVerification(draft: string, context: Document[]) {
  // 1. 사실 주장 추출
  const claims = await extractClaims(draft);
  // ["경자일주는 금수쌍청이다", "식신이 일지에 있다", ...]

  // 2. 검증 질문 생성
  const questions = claims.map(c => generateVerificationQuestion(c));
  // ["경자일주가 금수쌍청인 근거는?", "경자일주의 일지 십신은?", ...]

  // 3. 독립적 검증 (RAG 재검색)
  const verifications = await Promise.all(
    questions.map(q => searchAndAnswer(q, context))
  );

  // 4. 불일치 확인 및 수정
  const verified = claims.filter((claim, i) =>
    verifications[i].supports(claim)
  );

  // 5. 검증된 내용만으로 최종 응답 생성
  return generateFinalResponse(verified);
}
```

**효과**: 할루시네이션 23% 감소 (Meta AI 논문 기준)

### Grounding 기법

```typescript
// 검색된 문서만 사용하도록 강제
const GROUNDING_PROMPT = `
<context>
${retrievedDocuments.map(d => `[${d.id}] ${d.content}`).join('\n')}
</context>

위 <context> 태그 내 정보만을 사용하여 질문에 답하세요.
context에 없는 내용은 "해당 정보를 찾을 수 없습니다"라고 답하세요.

질문: ${userQuestion}
`;
```

### 출력 구조화 (Structured Output)

```typescript
// Zod 스키마로 출력 검증
import { z } from 'zod';

const InterpretationSchema = z.object({
  summary: z.string().max(200),
  details: z.array(z.object({
    category: z.enum(['dayPillar', 'structure', 'fortune', 'compatibility']),
    interpretation: z.string(),
    sources: z.array(z.string()).min(1), // 출처 필수
    confidence: z.enum(['high', 'medium', 'low'])
  })),
  caveats: z.array(z.string()).optional(),
  disclaimer: z.string().default('이 해석은 참고용이며, 중요한 결정은 전문가와 상담하세요.')
});

type Interpretation = z.infer<typeof InterpretationSchema>;
```

---

## 품질 보장 전략

### 1. 사전 생성 캐싱

```typescript
// 60일주 기본 해석 사전 생성
const PRE_GENERATED = {
  '갑자': { summary: '...', interpretation: '...' },
  '을축': { summary: '...', interpretation: '...' },
  // ... 60개 일주
};

// 기본 해석은 캐시에서 즉시 반환
function getBasicInterpretation(dayPillar: string) {
  return PRE_GENERATED[dayPillar] || generateWithLLM(dayPillar);
}
```

### 2. 신뢰도 점수

```typescript
function calculateConfidence(response: LLMResponse): 'high' | 'medium' | 'low' {
  const factors = {
    hasSource: response.sources.length > 0,          // 출처 있음
    multipleMatches: response.sources.length > 2,    // 복수 출처
    exactMatch: response.retrievalScore > 0.9,       // 정확한 매칭
    noHedging: !response.text.includes('아마도'),    // 불확실 표현 없음
  };

  const score = Object.values(factors).filter(Boolean).length;
  return score >= 4 ? 'high' : score >= 2 ? 'medium' : 'low';
}
```

### 3. 모니터링 지표

| 지표 | 설명 | 목표 |
|------|------|------|
| **Grounding Rate** | 출처 있는 응답 비율 | > 95% |
| **Rejection Rate** | "모른다" 응답 비율 | 5-15% |
| **User Satisfaction** | 사용자 만족도 | > 4.0/5.0 |
| **Latency P95** | 응답 시간 95분위 | < 3초 |

---

## 참고 자료

### 할루시네이션 방지
- [Chain-of-Verification (Meta AI, 2024)](https://arxiv.org/abs/2309.11495)
- [RAG Hallucination Detection (AWS)](https://aws.amazon.com/blogs/machine-learning/detect-hallucinations-for-rag-based-systems/)
- [LLM Hallucinations Guide (Lakera)](https://www.lakera.ai/blog/guide-to-hallucinations-in-large-language-models)

### 시스템 프롬프트 설계
- [Prompt Engineering Guide](https://www.promptingguide.ai/)
- [OpenAI Prompt Engineering](https://platform.openai.com/docs/guides/prompt-engineering)
- [RAG Best Practices (Orkes)](https://orkes.io/blog/rag-best-practices/)

### Grounding 기법
- [Google Vertex AI Grounding](https://cloud.google.com/blog/products/ai-machine-learning/rag-and-grounding-on-vertex-ai)
- [AI Grounding (Salesforce)](https://www.salesforce.com/blog/what-is-grounding/)
- [Agentic RAG (Moveworks)](https://www.moveworks.com/us/en/resources/blog/improved-ai-grounding-with-agentic-rag)
