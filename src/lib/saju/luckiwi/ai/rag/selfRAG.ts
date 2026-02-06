/**
 * Self-RAG 검증
 *
 * AI가 생성한 내용을 RAG로 재검증하여 할루시네이션 방지
 */

import type { SearchResult } from './types';
import { retrieveDomain } from './retriever';
import {
  generateJSON,
  VERIFY_SYSTEM_PROMPT,
  buildVerifyUserPrompt,
  type VerifyResponse,
} from '../llm';

// ============================================
// 타입 정의
// ============================================

export interface SelfRAGOptions {
  /** 검증 엄격도 (strict: 모든 주장 검증, moderate: 주요 주장만) */
  strictness?: 'strict' | 'moderate' | 'lenient';
  /** false 판정된 주장 자동 제거 */
  autoRemoveFalse?: boolean;
  /** unverified 판정된 주장 자동 제거 */
  autoRemoveUnverified?: boolean;
}

export interface VerificationResult {
  /** 원본 텍스트 */
  originalText: string;
  /** 검증된 텍스트 (수정 적용 후) */
  verifiedText: string;
  /** 검증 상세 */
  verification: VerifyResponse;
  /** 수정 사항 */
  modifications: Array<{
    original: string;
    action: 'kept' | 'removed' | 'corrected';
    corrected?: string;
    reason: string;
  }>;
  /** 전체 유효성 */
  isValid: boolean;
}

// ============================================
// Self-RAG 검증
// ============================================

/**
 * Self-RAG 검증 수행
 *
 * 1. 텍스트에서 주장(claim) 추출
 * 2. 각 주장에 대해 도메인 지식 검색
 * 3. LLM으로 주장 검증
 * 4. 검증 결과에 따라 텍스트 수정
 */
export async function verifySelfRAG(
  text: string,
  sajuInfo: { dayPillar?: string; elements?: string[] } = {},
  options: SelfRAGOptions = {}
): Promise<VerificationResult> {
  const {
    strictness = 'moderate',
    autoRemoveFalse = true,
    autoRemoveUnverified = false,
  } = options;

  // 1. 관련 도메인 지식 검색
  const domainDocs = await searchRelevantDomain(text, sajuInfo);

  // 2. LLM 검증 수행
  const verifyContext = {
    textToVerify: text,
    domainDocs: domainDocs.map((r) => ({
      id: r.document.id,
      category: r.document.metadata.category as string || 'general',
      entityName: r.document.metadata.entityName as string || '',
      content: r.document.content,
    })),
    sajuInfo,
  };

  const verification = await generateJSON<VerifyResponse>({
    purpose: 'verify',
    systemPrompt: VERIFY_SYSTEM_PROMPT,
    userPrompt: buildVerifyUserPrompt(verifyContext),
  });

  // 3. 검증 결과에 따라 텍스트 수정
  const { verifiedText, modifications } = applyVerification(
    text,
    verification,
    { autoRemoveFalse, autoRemoveUnverified }
  );

  // 4. 유효성 판정
  const isValid =
    verification.overallValidity === 'valid' ||
    (verification.overallValidity === 'partial' && strictness !== 'strict');

  return {
    originalText: text,
    verifiedText,
    verification,
    modifications,
    isValid,
  };
}

/**
 * 관련 도메인 지식 검색
 */
async function searchRelevantDomain(
  text: string,
  sajuInfo: { dayPillar?: string; elements?: string[] }
): Promise<SearchResult[]> {
  const queries: string[] = [];

  // 사주 정보 기반 쿼리
  if (sajuInfo.dayPillar) {
    queries.push(sajuInfo.dayPillar);
  }
  if (sajuInfo.elements) {
    queries.push(...sajuInfo.elements);
  }

  // 텍스트에서 사주 용어 추출
  const sajuTerms = extractSajuTerms(text);
  queries.push(...sajuTerms);

  // 중복 제거
  const uniqueQueries = [...new Set(queries)];

  // 병렬 검색
  const results = await Promise.all(
    uniqueQueries.slice(0, 5).map((q) => retrieveDomain(q, undefined, { limit: 2 }))
  );

  // 결과 병합 및 중복 제거
  const merged = new Map<string, SearchResult>();
  for (const resultSet of results) {
    for (const result of resultSet) {
      if (!merged.has(result.document.id)) {
        merged.set(result.document.id, result);
      }
    }
  }

  return Array.from(merged.values()).slice(0, 10);
}

/**
 * 텍스트에서 사주 용어 추출
 */
function extractSajuTerms(text: string): string[] {
  const patterns = [
    // 천간
    /[갑을병정무기경신임계]/g,
    // 지지
    /[자축인묘진사오미신유술해]/g,
    // 십신
    /비견|겁재|식신|상관|편재|정재|편관|정관|편인|정인/g,
    // 오행
    /목|화|토|금|수/g,
    // 격국
    /격국|용신|희신|기신/g,
  ];

  const terms: string[] = [];
  for (const pattern of patterns) {
    const matches = text.match(pattern);
    if (matches) {
      terms.push(...matches);
    }
  }

  return [...new Set(terms)];
}

/**
 * 검증 결과 적용
 */
function applyVerification(
  text: string,
  verification: VerifyResponse,
  options: { autoRemoveFalse: boolean; autoRemoveUnverified: boolean }
): { verifiedText: string; modifications: VerificationResult['modifications'] } {
  let verifiedText = text;
  const modifications: VerificationResult['modifications'] = [];

  for (const claim of verification.claims) {
    if (claim.status === 'false' && options.autoRemoveFalse) {
      // 틀린 주장 수정 또는 제거
      if (claim.correction) {
        verifiedText = verifiedText.replace(claim.text, claim.correction);
        modifications.push({
          original: claim.text,
          action: 'corrected',
          corrected: claim.correction,
          reason: `사실 오류: ${claim.evidence || '검증 실패'}`,
        });
      } else {
        // 문장 단위로 제거 시도
        const sentencePattern = new RegExp(
          `[^.!?]*${escapeRegex(claim.text)}[^.!?]*[.!?]?`,
          'g'
        );
        verifiedText = verifiedText.replace(sentencePattern, '');
        modifications.push({
          original: claim.text,
          action: 'removed',
          reason: `사실 오류: ${claim.evidence || '검증 실패'}`,
        });
      }
    } else if (claim.status === 'unverified' && options.autoRemoveUnverified) {
      // 미검증 주장 제거
      const sentencePattern = new RegExp(
        `[^.!?]*${escapeRegex(claim.text)}[^.!?]*[.!?]?`,
        'g'
      );
      verifiedText = verifiedText.replace(sentencePattern, '');
      modifications.push({
        original: claim.text,
        action: 'removed',
        reason: '검증 불가',
      });
    } else {
      // 유지
      modifications.push({
        original: claim.text,
        action: 'kept',
        reason:
          claim.status === 'verified'
            ? `검증됨: ${claim.evidence || ''}`
            : claim.status === 'opinion'
              ? '주관적 의견 (검증 불필요)'
              : '미검증이나 유지',
      });
    }
  }

  // 연속 공백 정리
  verifiedText = verifiedText.replace(/\n{3,}/g, '\n\n').trim();

  return { verifiedText, modifications };
}

/**
 * 정규식 이스케이프
 */
function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// ============================================
// 빠른 검증 (간소화)
// ============================================

/**
 * 빠른 유효성 체크 (상세 검증 없이)
 */
export async function quickVerify(
  text: string,
  sajuInfo: { dayPillar?: string } = {}
): Promise<{ isValid: boolean; issues: string[] }> {
  // 기본적인 패턴 체크만 수행
  const issues: string[] = [];

  // 부정적 예언 체크
  if (text.match(/반드시.+실패|불행|죽|병/)) {
    issues.push('부정적 예언 표현 감지');
  }

  // 과도한 단정 표현 체크
  const definitiveCount = (text.match(/틀림없이|반드시|확실히|무조건/g) || []).length;
  if (definitiveCount > 3) {
    issues.push('과도한 단정 표현');
  }

  // 전문 영역 침범 체크
  if (text.match(/투자|주식|부동산.+추천|진단|처방|법적/)) {
    issues.push('전문 영역 조언 감지');
  }

  return {
    isValid: issues.length === 0,
    issues,
  };
}
