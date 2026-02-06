/**
 * RAG 시스템 타입 정의
 */

// ============================================
// 문서 타입
// ============================================

/**
 * 벡터 저장소 문서 기본 타입
 */
export interface VectorDocument {
  /** 문서 ID */
  id: string;
  /** 문서 내용 */
  content: string;
  /** 임베딩 벡터 */
  embedding?: number[];
  /** 메타데이터 */
  metadata: DocumentMetadata;
  /** 생성 시간 */
  createdAt: string;
  /** 수정 시간 */
  updatedAt: string;
}

/**
 * 문서 메타데이터
 */
export interface DocumentMetadata {
  /** 문서 유형 */
  type: DocumentType;
  /** 문서 제목 */
  title?: string;
  /** 관련 차원 ID */
  dimensionId?: string;
  /** 품질 등급 (벤치마크용) */
  quality?: 'excellent' | 'good' | 'poor';
  /** 출처 */
  source?: string;
  /** 추가 태그 */
  tags?: string[];
  /** 기타 메타데이터 */
  [key: string]: unknown;
}

/**
 * 문서 유형
 */
export type DocumentType =
  | 'benchmark' // 벤치마크 통변 예시
  | 'criteria' // 평가 기준
  | 'pattern' // 개선 패턴
  | 'domain'; // 도메인 지식

// ============================================
// 벤치마크 문서
// ============================================

/**
 * 벤치마크 문서 (우수 통변 예시)
 */
export interface BenchmarkDocument extends VectorDocument {
  metadata: DocumentMetadata & {
    type: 'benchmark';
    quality: 'excellent' | 'good';
    /** 대상 일주 */
    dayPillar?: string;
    /** 격국 */
    structure?: string;
    /** 차원별 점수 */
    dimensionScores?: { [dimensionId: string]: number };
    /** 하이라이트 섹션 */
    highlights?: Array<{
      text: string;
      dimension: string;
      quality: 'excellent' | 'poor';
    }>;
  };
}

// ============================================
// 평가 기준 문서
// ============================================

/**
 * 평가 기준 문서
 */
export interface CriteriaDocument extends VectorDocument {
  metadata: DocumentMetadata & {
    type: 'criteria';
    dimensionId: string;
    criterionId?: string;
    /** 좋은 예시 */
    goodExamples?: string[];
    /** 나쁜 예시 */
    badExamples?: string[];
    /** 점수 가이드라인 */
    scoringGuideline?: string;
  };
}

// ============================================
// 개선 패턴 문서
// ============================================

/**
 * 개선 패턴 문서
 */
export interface PatternDocument extends VectorDocument {
  metadata: DocumentMetadata & {
    type: 'pattern';
    dimensionId: string;
    patternType: string;
    /** 개선 전 텍스트 */
    beforeText: string;
    /** 개선 전 점수 */
    beforeScore?: number;
    /** 개선 전 이슈 */
    beforeIssue: string;
    /** 개선 후 텍스트 */
    afterText: string;
    /** 개선 후 점수 */
    afterScore?: number;
    /** 변환 가이드 */
    transformationGuide: string;
  };
}

// ============================================
// 도메인 지식 문서
// ============================================

/**
 * 도메인 지식 문서
 */
export interface DomainDocument extends VectorDocument {
  metadata: DocumentMetadata & {
    type: 'domain';
    category: 'dayPillar' | 'structure' | 'tenGod' | 'element' | 'pattern';
    /** 엔티티 이름 */
    entityName: string;
    /** 한자 */
    entityHanja?: string;
    /** 해석 레벨 */
    interpretationLevel?: 0 | 1 | 2 | 3;
  };
}

// ============================================
// 검색 관련
// ============================================

/**
 * 검색 옵션
 */
export interface SearchOptions {
  /** 반환할 문서 수 */
  limit?: number;
  /** 최소 유사도 점수 (0-1) */
  minScore?: number;
  /** 문서 유형 필터 */
  type?: DocumentType | DocumentType[];
  /** 메타데이터 필터 */
  filter?: {
    [key: string]: unknown;
  };
  /** 하이브리드 검색 가중치 (0: 벡터만, 1: 텍스트만) */
  hybridWeight?: number;
}

/**
 * 검색 결과
 */
export interface SearchResult<T extends VectorDocument = VectorDocument> {
  /** 문서 */
  document: T;
  /** 유사도 점수 (0-1) */
  score: number;
  /** 검색 방식 */
  searchType: 'vector' | 'text' | 'hybrid';
}

// ============================================
// 컬렉션 설정
// ============================================

/**
 * Firestore 컬렉션 이름
 */
export const COLLECTIONS = {
  benchmarks: 'ai_benchmarks',
  criteria: 'ai_criteria',
  patterns: 'ai_patterns',
  domain: 'ai_domain',
} as const;

/**
 * 임베딩 차원 수 (Gemini text-embedding-004)
 */
export const EMBEDDING_DIMENSION = 768;
