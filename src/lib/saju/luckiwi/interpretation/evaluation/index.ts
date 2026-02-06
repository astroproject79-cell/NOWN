/**
 * 스토리 품질 평가 모듈
 *
 * 생성된 "삶의 구조 설명서"의 품질을 다차원으로 평가하고
 * 피드백을 생성하여 개선하는 시스템
 *
 * ## 사용 예시
 *
 * ```typescript
 * import { evaluateStory, runImprovementPipeline, improveStory } from './evaluation';
 *
 * // 1. 단순 평가
 * const result = evaluateStory(input);
 * console.log(result.totalScore, result.totalGrade);
 *
 * // 2. 자동 개선 파이프라인
 * const pipeline = await runImprovementPipeline(input, { targetScore: 85 });
 * console.log(pipeline.finalScore);
 *
 * // 3. 간편 개선
 * const improvedInput = await improveStory(input);
 * ```
 */

// 타입 내보내기
export * from './types';

// 평가 함수 내보내기
export { evaluateStory, quickEvaluate } from './evaluator';

// 개선 제안 생성기 내보내기
export {
  generateEnhancements,
  applyEnhancements,
  type EnhancementResult,
  type StoryEnhancement,
} from './enhancer';

// 파이프라인 내보내기
export {
  runImprovementPipeline,
  runSingleIteration,
  checkTargetReached,
  runBatchImprovement,
  improveStory,
  getStoryScore,
  type PipelineConfig,
  type BatchResult,
} from './pipeline';

// 데이터 내보내기
export { default as evaluationDimensions } from './data/dimensions.json';
