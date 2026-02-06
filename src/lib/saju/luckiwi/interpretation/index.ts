/**
 * 해석 엔진 모듈
 *
 * Rule-based 사주 해석 시스템
 * - AI 없이 일관된 해석 제공
 * - 명리학 서적 기반 데이터
 * - 고전 키워드(한자) + 현대적 설명
 * - 조건 기반 서사 조합 시스템
 * - 스토리텔링 기반 "삶의 구조 설명서" 생성
 * - 품질 평가 및 자동 개선 시스템
 */

// 기본 해석 데이터 (일주별)
export * from './types';
export * from './loader';

// 서사 시스템
export * as narrative from './narrative';

// 메타포 시스템 (일간 × 계절 × 조후)
export * as metaphor from './metaphor';

// 삶의 유형 분류 시스템
export * as lifeType from './lifeType';

// 스토리 생성 엔진
export * as story from './story';

// 품질 평가 및 개선 시스템
export * as evaluation from './evaluation';

// 편의 함수: 스토리 생성기 직접 내보내기
export { generateStory, generateSimpleStory } from './story/generator';

// 편의 함수: 평가 및 개선 함수 직접 내보내기
export {
  evaluateStory,
  quickEvaluate,
  runImprovementPipeline,
  improveStory,
  getStoryScore,
} from './evaluation';
