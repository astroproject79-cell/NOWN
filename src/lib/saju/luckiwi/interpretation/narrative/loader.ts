/**
 * 서사 데이터 로더
 *
 * JSON 파일에서 서사 블록, 전환구, 템플릿 로드
 */

import {
  NarrativeBlock,
  NarrativeBlockStore,
  TransitionPhrase,
  TransitionPhraseStore,
  DocumentTemplate,
  DocumentTemplateStore,
  NarrativeBlockType,
  SectionId,
} from './types';

// JSON 데이터 임포트
import dayMasterSeasonData from './data/blocks/dayMasterSeason.json';
import keySentencesData from './data/blocks/keySentences.json';
import lifeAdviceData from './data/blocks/lifeAdvice.json';
import validationData from './data/blocks/validation.json';
import transitionsData from './data/transitions.json';
import templatesData from './data/templates.json';

// ============================================
// 타입 변환 (JSON -> TypeScript)
// ============================================

interface RawBlockStore {
  version: string;
  lastUpdated: string;
  description: string;
  blocks: NarrativeBlock[];
}

// ============================================
// 데이터 통합
// ============================================

/**
 * 모든 서사 블록 통합
 */
const allBlocks: NarrativeBlock[] = [
  ...(dayMasterSeasonData as RawBlockStore).blocks,
  ...(keySentencesData as RawBlockStore).blocks,
  ...(lifeAdviceData as RawBlockStore).blocks,
  ...(validationData as RawBlockStore).blocks,
];

/**
 * 전환구 데이터
 */
const transitions = (transitionsData as TransitionPhraseStore).phrases;

/**
 * 템플릿 데이터
 */
const templates = (templatesData as DocumentTemplateStore).templates;

// ============================================
// 블록 조회 함수
// ============================================

/**
 * 모든 서사 블록 조회
 */
export function getAllNarrativeBlocks(): NarrativeBlock[] {
  return allBlocks;
}

/**
 * 특정 타입의 서사 블록 조회
 */
export function getBlocksByType(type: NarrativeBlockType): NarrativeBlock[] {
  return allBlocks.filter((block) => block.type === type);
}

/**
 * 특정 ID의 서사 블록 조회
 */
export function getBlockById(id: string): NarrativeBlock | null {
  return allBlocks.find((block) => block.id === id) || null;
}

/**
 * 태그로 서사 블록 검색
 */
export function getBlocksByTag(tag: string): NarrativeBlock[] {
  return allBlocks.filter((block) => block.meta?.tags?.includes(tag));
}

// ============================================
// 전환구 조회 함수
// ============================================

/**
 * 모든 전환구 조회
 */
export function getAllTransitions(): TransitionPhrase[] {
  return transitions;
}

/**
 * 특정 섹션 간 전환구 조회
 */
export function getTransition(
  from: SectionId,
  to: SectionId
): TransitionPhrase | null {
  return (
    transitions.find((t) => t.from === from && t.to === to) || null
  );
}

// ============================================
// 템플릿 조회 함수
// ============================================

/**
 * 모든 문서 템플릿 조회
 */
export function getAllTemplates(): DocumentTemplate[] {
  return templates;
}

/**
 * 특정 ID의 템플릿 조회
 */
export function getTemplateById(id: string): DocumentTemplate | null {
  return templates.find((t) => t.id === id) || null;
}

/**
 * 기본 템플릿 (사용 설명서) 조회
 */
export function getDefaultTemplate(): DocumentTemplate {
  return getTemplateById('userManual') || templates[0];
}

// ============================================
// 통계 및 메타 정보
// ============================================

/**
 * 서사 데이터 통계
 */
export function getNarrativeStats(): {
  totalBlocks: number;
  blocksByType: Record<string, number>;
  totalTransitions: number;
  totalTemplates: number;
} {
  const blocksByType: Record<string, number> = {};
  for (const block of allBlocks) {
    blocksByType[block.type] = (blocksByType[block.type] || 0) + 1;
  }

  return {
    totalBlocks: allBlocks.length,
    blocksByType,
    totalTransitions: transitions.length,
    totalTemplates: templates.length,
  };
}

/**
 * 데이터 버전 정보
 */
export function getDataVersions(): {
  blocks: string;
  transitions: string;
  templates: string;
} {
  return {
    blocks: (dayMasterSeasonData as RawBlockStore).version,
    transitions: (transitionsData as TransitionPhraseStore).version,
    templates: (templatesData as DocumentTemplateStore).version,
  };
}
