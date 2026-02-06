/**
 * AI 모듈
 *
 * Gemini + RAG 기반 AI 시스템
 * - LLM: Gemini API 클라이언트
 * - RAG: Firestore Vector Search 기반 검색
 * - Evaluation: AI 기반 평가 및 개선
 */

// LLM 모듈
export * as llm from './llm';

// RAG 모듈
export * as rag from './rag';

// AI 평가 모듈
export * as evaluation from './evaluation';

// 편의 함수: 자주 사용하는 함수 직접 내보내기
export {
  generate,
  generateJSON,
  embed,
  embedBatch,
  getGeminiClient,
  initGeminiClient,
} from './llm';

export {
  retrieve,
  retrieveWithHyDE,
  searchByVector,
  upsertDocument,
  upsertDocuments,
} from './rag';

export {
  runHybridPipeline,
  hybridEvaluate,
  aiEvaluate,
  aiImprove,
  fuseScores,
} from './evaluation';
