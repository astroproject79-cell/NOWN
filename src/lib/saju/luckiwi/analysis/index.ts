/**
 * 명리학 분석 통합 모듈
 */

import { FourPillars } from '../types';
import { HiddenStemSchool } from '../types/hiddenStem';
import { AnalysisOptions, SajuAnalysis } from '../types/analysis';
import { Element } from '../types/elements';

// 개별 분석 모듈 import
import { analyzeTenGods, summarizeTenGods } from './tenGod';
import { analyzeAllHiddenStems } from './hiddenStem';
import { analyzeElements, summarizeElements } from './elementAnalysis';
import { analyzeRelations, summarizeRelations } from './relations';
import { analyzeDayMasterStrength, summarizeDayMasterStrength } from './dayMasterStrength';
import { analyzeStructure, summarizeStructure } from './structure';
import { analyzeUsefulGod, summarizeUsefulGod } from './usefulGod';
// 새 분석 모듈
import { analyzeTwelveStages, summarizeTwelveStages } from './twelveStages';
import { analyzeSpirits, summarizeSpirits } from './spirits';
import { analyzeEmptyBranches, summarizeEmptyBranches } from './emptyBranches';
import { analyzeSoundElement, summarizeSoundElement } from './soundElement';
import { analyzeTwelveSpiritKills, summarizeTwelveSpiritKills } from './twelveSpiritKills';

// 모듈 re-export
export * from './tenGod';
export * from './hiddenStem';
export * from './elementAnalysis';
export * from './relations';
export * from './dayMasterStrength';
export * from './structure';
export * from './usefulGod';
export * from './twelveStages';
export * from './spirits';
export * from './emptyBranches';
export * from './soundElement';
export * from './twelveSpiritKills';

/** 기본 분석 옵션 (모두 포함) */
const DEFAULT_ANALYSIS_OPTIONS: AnalysisOptions = {
  tenGods: true,
  elements: true,
  relations: true,
  structure: true,
  usefulGod: true,
  dayMasterStrength: true,
  hiddenStems: true,
  twelveStages: true,
  spirits: true,
  emptyBranches: true,
  soundElement: true,
  twelveSpiritKills: true,
};

/**
 * 전체 사주 분석 수행
 * @param fourPillars 사주팔자
 * @param options 분석 옵션
 * @param school 장간 유파
 * @returns 전체 분석 결과
 */
export function performFullAnalysis(
  fourPillars: FourPillars,
  options: AnalysisOptions = DEFAULT_ANALYSIS_OPTIONS,
  school: HiddenStemSchool = 'standard'
): SajuAnalysis {
  const result: SajuAnalysis = {
    summary: {
      overallBalance: 'balanced',
      favorableElements: [],
      unfavorableElements: [],
      keyInsights: [],
    },
  };

  // 십신 분석
  if (options.tenGods) {
    result.tenGods = analyzeTenGods(fourPillars, school);
  }

  // 장간 분석
  if (options.hiddenStems) {
    result.hiddenStems = analyzeAllHiddenStems(fourPillars, school);
  }

  // 오행 분석
  if (options.elements) {
    result.elements = analyzeElements(fourPillars, school);
  }

  // 관계 분석
  if (options.relations) {
    result.relations = analyzeRelations(fourPillars);
  }

  // 일주 강약 분석
  if (options.dayMasterStrength) {
    result.dayMasterStrength = analyzeDayMasterStrength(fourPillars, school);
  }

  // 격국 분석
  if (options.structure) {
    result.structure = analyzeStructure(fourPillars, school);
  }

  // 용신 분석
  if (options.usefulGod) {
    result.usefulGod = analyzeUsefulGod(fourPillars, school);
  }

  // 12운성 분석
  if (options.twelveStages) {
    result.twelveStages = analyzeTwelveStages(fourPillars);
  }

  // 신살 분석
  if (options.spirits) {
    result.spirits = analyzeSpirits(fourPillars);
  }

  // 공망 분석
  if (options.emptyBranches) {
    result.emptyBranches = analyzeEmptyBranches(fourPillars);
  }

  // 납음오행 분석
  if (options.soundElement) {
    result.soundElement = analyzeSoundElement(fourPillars);
  }

  // 12신살 분석
  if (options.twelveSpiritKills) {
    result.twelveSpiritKills = analyzeTwelveSpiritKills(fourPillars);
  }

  // 종합 요약 생성
  result.summary = generateSummary(result);

  return result;
}

/**
 * 종합 요약 생성
 */
function generateSummary(analysis: SajuAnalysis): SajuAnalysis['summary'] {
  const keyInsights: string[] = [];
  let favorableElements: Element[] = [];
  let unfavorableElements: Element[] = [];

  // 용신/기신에서 유리/불리 오행 추출
  if (analysis.usefulGod) {
    favorableElements.push(analysis.usefulGod.usefulGod);
    if (analysis.usefulGod.helpfulGod) {
      favorableElements.push(analysis.usefulGod.helpfulGod);
    }
    unfavorableElements.push(analysis.usefulGod.jealousGod);

    keyInsights.push(
      `용신: ${analysis.usefulGod.usefulGod}, 기신: ${analysis.usefulGod.jealousGod}`
    );
  }

  // 일주 강약 인사이트
  if (analysis.dayMasterStrength) {
    const strengthText = {
      'strong': '신강(身强)',
      'neutral': '중화(中和)',
      'weak': '신약(身弱)',
    };
    keyInsights.push(
      `일주: ${analysis.dayMasterStrength.dayMaster}(${analysis.dayMasterStrength.dayElement}) ${strengthText[analysis.dayMasterStrength.strength]}`
    );
  }

  // 격국 인사이트
  if (analysis.structure) {
    keyInsights.push(`격국: ${analysis.structure.primary.type}`);
  }

  // 관계 인사이트
  if (analysis.relations) {
    const { summary } = analysis.relations;
    if (summary.hasCombination) {
      keyInsights.push('합(合) 관계 존재');
    }
    if (summary.hasConflict) {
      keyInsights.push('충(沖)/형(刑) 관계 존재');
    }
  }

  // 오행 균형 판단
  let overallBalance: 'balanced' | 'imbalanced' = 'balanced';
  if (analysis.elements) {
    if (analysis.elements.missing.length > 0 || analysis.elements.imbalance.excess.length > 0) {
      overallBalance = 'imbalanced';
      keyInsights.push(`결핍 오행: ${analysis.elements.missing.join(', ') || '없음'}`);
    }
  }

  // 12운성 인사이트
  if (analysis.twelveStages) {
    const { dayMasterStages } = analysis.twelveStages;
    keyInsights.push(`12운성: 월${dayMasterStages.monthBranch.stage}, 일${dayMasterStages.dayBranch.stage}`);
  }

  // 신살 인사이트
  if (analysis.spirits) {
    const { summary } = analysis.spirits;
    if (summary.majorSpirits.length > 0) {
      keyInsights.push(`주요 신살: ${summary.majorSpirits.slice(0, 3).join(', ')}`);
    }
  }

  // 공망 인사이트
  if (analysis.emptyBranches && analysis.emptyBranches.summary.hasEmpty) {
    keyInsights.push(`공망: ${analysis.emptyBranches.dayBased.branches.join(', ')}`);
  }

  return {
    overallBalance,
    favorableElements: [...new Set(favorableElements)],
    unfavorableElements: [...new Set(unfavorableElements)],
    keyInsights,
  };
}

/**
 * 분석 결과 요약 문자열 생성
 */
export function summarizeAnalysis(analysis: SajuAnalysis): string {
  const parts: string[] = [];

  if (analysis.dayMasterStrength) {
    parts.push(summarizeDayMasterStrength(analysis.dayMasterStrength));
  }

  if (analysis.structure) {
    parts.push(summarizeStructure(analysis.structure));
  }

  if (analysis.usefulGod) {
    parts.push(summarizeUsefulGod(analysis.usefulGod));
  }

  if (analysis.elements) {
    parts.push(summarizeElements(analysis.elements));
  }

  if (analysis.relations) {
    parts.push(summarizeRelations(analysis.relations));
  }

  return parts.join('\n');
}
