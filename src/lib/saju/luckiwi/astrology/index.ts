/**
 * Luckiwi 점성학 엔진
 *
 * 서양 점성학 계산 및 분석 모듈
 *
 * 주요 기능:
 * - 네이탈 차트 계산 (행성 위치, 하우스, 애스펙트)
 * - 시나스트리 (궁합 분석)
 * - 솔라 리턴 (연간 운세)
 * - 피르다리아 (75년 행성 주기)
 *
 * @example
 * ```typescript
 * import { calculateNatalChart } from '@/astrology';
 *
 * const chart = calculateNatalChart({
 *   year: 1990, month: 5, day: 15,
 *   hour: 14, minute: 30,
 *   latitude: 37.5665, longitude: 126.9780,
 *   timezone: 'Asia/Seoul'
 * }, {
 *   mode: 'modern',
 *   houseSystem: 'placidus'
 * });
 * ```
 */

// 타입 내보내기
export * from './types';

// 상수 내보내기
export * from './constants';

// 핵심 계산 함수 내보내기
export {
  // Ephemeris
  initializeEphemeris,
  dateToJulianDay,
  julianDayToDate,
  getEphemerisVersion,
  // 네이탈 차트
  calculateNatalChart,
  getChartSummary,
  getChartDistribution,
  formatChart,
  isNightBirth,
  getPlanetFromChart,
  // 시나스트리
  calculateSynastry,
  getSynastryHighlights,
  // 솔라 리턴
  calculateSolarReturn,
  calculateSolarReturnSeries,
  getSolarReturnSummary,
  // 피르다리아
  calculateFirdaria,
  getFirdariaInterpretation,
  createFirdariaTimeline,
  getFirdariaSummary,
  // 유틸리티
  calculateAllPlanets,
  calculateAllHouses,
  calculateAllAspects,
  detectAspectPatterns,
} from './core';

// 해석 모듈
export {
  interpretPlanetInSign,
  interpretPlanetInHouse,
  interpretAspect,
  generateChartInterpretation,
  formatInterpretation,
} from './interpretation';

// 평가 모듈
export {
  // 타입
  type AstrologyEvaluationInput,
  type AstrologyEvaluationResult,
  type AstrologyAIEvaluationResult,
  type AstrologyFusedResult,
  type AstrologyPipelineConfig,
  ASTROLOGY_EVALUATION_DIMENSIONS,
  DEFAULT_ASTROLOGY_PIPELINE_CONFIG,
  scoreToGrade,
  getGradeFeedback,
  // 룰 기반 평가
  evaluateAstrologyInterpretation,
  quickEvaluateAstrology,
  // AI 평가 (보조)
  aiEvaluateAstrology,
  quickAstrologyEvaluate,
  ruleBasedCheck,
} from './evaluation';
