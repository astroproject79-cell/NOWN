/**
 * RAG 모듈
 *
 * Firestore Vector Search 기반 RAG 시스템
 */

// 타입 내보내기
export * from './types';

// Vector Store
export {
  upsertDocument,
  upsertDocuments,
  getDocument,
  deleteDocument,
  searchByVector,
  searchByText,
  searchHybrid,
  clearCollection,
  countDocuments,
} from './vectorStore';

// 검색기
export {
  retrieve,
  retrieveHybrid,
  retrieveWithHyDE,
  compressContext,
  retrieveBenchmarks,
  retrieveCriteria,
  retrievePatterns,
  retrieveDomain,
  type HyDEOptions,
  type CompressionOptions,
} from './retriever';

// Self-RAG 검증
export {
  verifySelfRAG,
  quickVerify,
  type SelfRAGOptions,
  type VerificationResult,
} from './selfRAG';
