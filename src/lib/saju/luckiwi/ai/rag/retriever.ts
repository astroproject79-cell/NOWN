/**
 * RAG 검색기
 *
 * 다양한 검색 전략 제공
 * - 기본 벡터 검색
 * - HyDE (Hypothetical Document Embedding)
 * - 컨텍스트 압축
 */

import type {
  VectorDocument,
  SearchOptions,
  SearchResult,
  DocumentType,
} from './types';
import { searchByVector, searchHybrid } from './vectorStore';
import { generate, generateJSON } from '../llm';

// ============================================
// 기본 검색
// ============================================

/**
 * 기본 벡터 검색
 */
export async function retrieve(
  query: string,
  options: SearchOptions = {}
): Promise<SearchResult[]> {
  return searchByVector(query, options);
}

/**
 * 하이브리드 검색
 */
export async function retrieveHybrid(
  query: string,
  options: SearchOptions = {}
): Promise<SearchResult[]> {
  return searchHybrid(query, options);
}

// ============================================
// HyDE (Hypothetical Document Embedding)
// ============================================

export interface HyDEOptions extends SearchOptions {
  /** 가상 문서 생성 프롬프트 커스텀 */
  hypotheticalPrompt?: string;
}

/**
 * HyDE 검색
 *
 * 1. 쿼리에 대한 "이상적인 답변" 문서를 먼저 생성
 * 2. 생성된 문서의 임베딩으로 유사 문서 검색
 * 3. 기존 쿼리보다 더 정확한 검색 결과 제공
 */
export async function retrieveWithHyDE(
  query: string,
  documentType: DocumentType,
  options: HyDEOptions = {}
): Promise<SearchResult[]> {
  // 1. 가상 이상적 문서 생성
  const hypotheticalDoc = await generateHypotheticalDocument(
    query,
    documentType,
    options.hypotheticalPrompt
  );

  // 2. 가상 문서로 검색
  const results = await searchByVector(hypotheticalDoc, {
    ...options,
    type: documentType,
  });

  return results;
}

/**
 * 가상 이상적 문서 생성
 */
async function generateHypotheticalDocument(
  query: string,
  documentType: DocumentType,
  customPrompt?: string
): Promise<string> {
  const prompts: Record<DocumentType, string> = {
    benchmark: `다음 요청에 대해 최고 품질의 사주 통변 예시를 작성하세요.
- 8개 평가 차원 모두 90점 이상
- 공감, 희망, 실용성이 균형 잡힌
- 중심 메타포가 일관된
- 500자 이내로 핵심만

요청: ${query}`,

    criteria: `다음 평가 기준에 대한 상세 가이드라인을 작성하세요.
- 좋은 예시와 나쁜 예시 포함
- 점수 부여 기준 명확히
- 300자 이내

기준: ${query}`,

    pattern: `다음 개선 요청에 대한 Before/After 예시를 작성하세요.
- 구체적인 변환 방법 설명
- 개선 전후 비교 명확히
- 300자 이내

요청: ${query}`,

    domain: `다음 사주 개념에 대한 전문적 설명을 작성하세요.
- 명리학적 의미
- 실제 해석 예시
- 300자 이내

개념: ${query}`,
  };

  const prompt = customPrompt || prompts[documentType];

  const response = await generate({
    purpose: 'judge', // Flash 모델 사용 (빠름)
    userPrompt: prompt,
  });

  return response;
}

// ============================================
// 컨텍스트 압축
// ============================================

export interface CompressionOptions {
  /** 최대 길이 (문자 수) */
  maxLength?: number;
  /** 쿼리 관련성 기준 압축 */
  queryRelevant?: boolean;
}

/**
 * 검색 결과 컨텍스트 압축
 *
 * 여러 문서를 하나의 압축된 컨텍스트로 변환
 */
export async function compressContext(
  results: SearchResult[],
  query: string,
  options: CompressionOptions = {}
): Promise<string> {
  const { maxLength = 2000, queryRelevant = true } = options;

  if (results.length === 0) return '';

  // 점수순 정렬된 컨텐츠 결합
  let combinedContent = results
    .map((r) => `[${r.document.id}] ${r.document.content}`)
    .join('\n\n---\n\n');

  // 길이 제한 내라면 그대로 반환
  if (combinedContent.length <= maxLength) {
    return combinedContent;
  }

  // 쿼리 관련성 기준 압축
  if (queryRelevant) {
    const compressed = await generate({
      purpose: 'judge',
      userPrompt: `다음 문서들에서 "${query}"와 관련된 핵심 정보만 추출하여 ${maxLength}자 이내로 요약하세요.
요약 시 각 문서의 출처 ID ([doc_xxx])를 유지하세요.

문서들:
${combinedContent}`,
    });

    return compressed;
  }

  // 단순 truncate
  return combinedContent.slice(0, maxLength) + '...';
}

// ============================================
// 특화 검색 함수
// ============================================

/**
 * 벤치마크 문서 검색 (통변 예시)
 */
export async function retrieveBenchmarks(
  query: string,
  options: Omit<SearchOptions, 'type'> = {}
): Promise<SearchResult[]> {
  return retrieve(query, { ...options, type: 'benchmark' });
}

/**
 * 평가 기준 문서 검색
 * Note: 필터 없이 벡터 검색만 사용 (복합 인덱스 불필요)
 */
export async function retrieveCriteria(
  dimensionId: string,
  options: Omit<SearchOptions, 'type'> = {}
): Promise<SearchResult[]> {
  // 차원 이름을 쿼리로 사용하여 관련 기준 검색
  const dimensionNames: Record<string, string> = {
    structure: '구조적 완성도 평가 기준',
    metaphor: '메타포 일관성 평가 기준',
    empathy: '공감 지수 평가 기준',
    hope: '희망 지수 평가 기준',
    practicality: '실용성 평가 기준',
    tone: '톤 적절성 평가 기준',
    readability: '가독성 평가 기준',
    emotionalJourney: '감정 여정 평가 기준',
  };

  const query = dimensionNames[dimensionId] || dimensionId;
  return retrieve(query, {
    ...options,
    type: 'criteria',
  });
}

/**
 * 개선 패턴 검색
 * Note: 필터 없이 벡터 검색만 사용 (복합 인덱스 불필요)
 */
export async function retrievePatterns(
  issue: string,
  dimensionId?: string,
  options: Omit<SearchOptions, 'type'> = {}
): Promise<SearchResult[]> {
  // 차원 정보가 있으면 쿼리에 포함
  const query = dimensionId ? `${dimensionId} ${issue}` : issue;
  return retrieve(query, { ...options, type: 'pattern' });
}

/**
 * 도메인 지식 검색
 * Note: 필터 없이 벡터 검색만 사용 (복합 인덱스 불필요)
 */
export async function retrieveDomain(
  concept: string,
  category?: string,
  options: Omit<SearchOptions, 'type'> = {}
): Promise<SearchResult[]> {
  // 카테고리 정보가 있으면 쿼리에 포함
  const query = category ? `${category} ${concept}` : concept;
  return retrieve(query, { ...options, type: 'domain' });
}
