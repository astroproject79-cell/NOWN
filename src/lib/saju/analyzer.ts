import { HEAVENLY_STEMS, HEAVENLY_STEMS_HANJA, STEM_ELEMENTS, STEM_YIN_YANG } from './luckiwi/constants/stems';
import { EARTHLY_BRANCHES, EARTHLY_BRANCHES_HANJA, BRANCH_ELEMENTS } from './luckiwi/constants/branches';
import type { FourPillars, Pillar, Gender } from './luckiwi/types';
import { performFullAnalysis, summarizeAnalysis } from './luckiwi/analysis';
import type { SajuAnalysis } from './luckiwi/types/analysis';

function parsePillar(pillarStr: string): Pillar {
  var stem = pillarStr[0] as any;
  var branch = pillarStr[1] as any;
  var stemIdx = HEAVENLY_STEMS.indexOf(stem);
  var branchIdx = EARTHLY_BRANCHES.indexOf(branch);
  var stemH = HEAVENLY_STEMS_HANJA[stemIdx] || '';
  var branchH = EARTHLY_BRANCHES_HANJA[branchIdx] || '';
  var sexIdx = (stemIdx * 6 + branchIdx * 5) % 60;

  return {
    stem: stem,
    branch: branch,
    stemHanja: stemH as any,
    branchHanja: branchH as any,
    full: stem + branch,
    fullHanja: stemH + branchH,
    stemIndex: stemIdx,
    branchIndex: branchIdx,
    sexagenaryIndex: sexIdx,
  };
}

export function buildFourPillars(year: string, month: string, day: string, hour: string): FourPillars {
  return {
    year: parsePillar(year),
    month: parsePillar(month),
    day: parsePillar(day),
    hour: parsePillar(hour),
  };
}

export function fullAnalysis(yearP: string, monthP: string, dayP: string, hourP: string): SajuAnalysis {
  var fp = buildFourPillars(yearP, monthP, dayP, hourP);
  return performFullAnalysis(fp);
}

export function analysisToText(analysis: SajuAnalysis): string {
  return summarizeAnalysis(analysis);
}

export interface ReportData {
  fourPillars: {
    year: { stem: string; branch: string; hanja: string };
    month: { stem: string; branch: string; hanja: string };
    day: { stem: string; branch: string; hanja: string };
    hour: { stem: string; branch: string; hanja: string };
  };
  dayMaster: {
    char: string;
    element: string;
    yinYang: string;
    strength: string;
    score: number;
    explanation: string[];
  };
  tenGods: Record<string, number>;
  elements: {
    distribution: Record<string, number>;
    missing: string[];
    excess: string[];
  };
  structure: {
    type: string;
    category: string;
    description: string;
  };
  usefulGod: {
    element: string;
    method: string;
    jealousGod: string;
    helpfulGod: string;
    reasoning: string;
  };
  spirits: string[];
  twelveStages: Record<string, string>;
  emptyBranches: string[];
  summary: string[];
}

export function generateReportData(yearP: string, monthP: string, dayP: string, hourP: string): ReportData {
  var fp = buildFourPillars(yearP, monthP, dayP, hourP);
  var analysis = performFullAnalysis(fp);

  var dayMasterStr = fp.day.stem;
  var dayElement = (STEM_ELEMENTS as any)[dayMasterStr] || '';
  var dayYY = (STEM_YIN_YANG as any)[dayMasterStr] || '';

  var tenGodCounts: Record<string, number> = {};
  if (analysis.tenGods) {
    var tg = analysis.tenGods;
    if (tg.counts) {
      for (var k in tg.counts) {
        tenGodCounts[k] = (tg.counts as any)[k] || 0;
      }
    }
  }

  var elemDist: Record<string, number> = {};
  var missing: string[] = [];
  var excess: string[] = [];
  if (analysis.elements) {
    if (analysis.elements.distribution) {
      for (var e in analysis.elements.distribution) {
        elemDist[e] = (analysis.elements.distribution as any)[e] || 0;
      }
    }
    missing = analysis.elements.missing || [];
    excess = analysis.elements.imbalance ? analysis.elements.imbalance.excess || [] : [];
  }

  var structInfo = { type: '', category: '', description: '' };
  if (analysis.structure) {
    structInfo.type = analysis.structure.primary?.type || '';
    structInfo.category = analysis.structure.primary?.category || '';
    structInfo.description = analysis.structure.primary?.description || '';
  }

  var usefulInfo = { element: '', method: '', jealousGod: '', helpfulGod: '', reasoning: '' };
  if (analysis.usefulGod) {
    usefulInfo.element = analysis.usefulGod.usefulGod || '';
    usefulInfo.method = analysis.usefulGod.method || '';
    usefulInfo.jealousGod = analysis.usefulGod.jealousGod || '';
    usefulInfo.helpfulGod = analysis.usefulGod.helpfulGod || '';
    usefulInfo.reasoning = analysis.usefulGod.reasoning || '';
  }

  var spiritList: string[] = [];
  if (analysis.spirits && analysis.spirits.summary) {
    spiritList = analysis.spirits.summary.majorSpirits || [];
  }

  var stages: Record<string, string> = {};
  if (analysis.twelveStages && analysis.twelveStages.dayMasterStages) {
    var dms = analysis.twelveStages.dayMasterStages;
    stages['월지'] = dms.monthBranch?.stage || '';
    stages['일지'] = dms.dayBranch?.stage || '';
    stages['시지'] = dms.hourBranch?.stage || '';
  }

  var emptyB: string[] = [];
  if (analysis.emptyBranches && analysis.emptyBranches.dayBased) {
    emptyB = analysis.emptyBranches.dayBased.branches || [];
  }

  function makePillarDisplay(p: Pillar) {
    return { stem: p.stem, branch: p.branch, hanja: p.stemHanja + p.branchHanja };
  }

  return {
    fourPillars: {
      year: makePillarDisplay(fp.year),
      month: makePillarDisplay(fp.month),
      day: makePillarDisplay(fp.day),
      hour: makePillarDisplay(fp.hour),
    },
    dayMaster: {
      char: dayMasterStr,
      element: dayElement,
      yinYang: dayYY,
      strength: analysis.dayMasterStrength?.strength || 'neutral',
      score: analysis.dayMasterStrength?.score || 50,
      explanation: analysis.dayMasterStrength?.explanation || [],
    },
    tenGods: tenGodCounts,
    elements: { distribution: elemDist, missing: missing, excess: excess },
    structure: structInfo,
    usefulGod: usefulInfo,
    spirits: spiritList,
    twelveStages: stages,
    emptyBranches: emptyB,
    summary: analysis.summary?.keyInsights || [],
  };
}
