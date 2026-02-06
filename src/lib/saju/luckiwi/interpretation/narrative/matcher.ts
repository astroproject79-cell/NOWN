/**
 * 조건 매칭 시스템
 *
 * 서사 블록의 조건을 분석 결과와 대조하여
 * 해당 블록이 적용되어야 하는지 판단
 */

import { FourPillars, Pillar } from '../../types';
import { SajuAnalysis } from '../../types/analysis';
import { Element } from '../../types/elements';
import { NarrativeConditions, NarrativeBlock, Season, Strength } from './types';

// ============================================
// 분석 컨텍스트 (매칭에 필요한 정보 통합)
// ============================================

/**
 * 매칭에 사용되는 분석 컨텍스트
 */
export interface MatchContext {
  /** 사주 원국 */
  fourPillars: FourPillars;

  /** 분석 결과 */
  analysis: SajuAnalysis;

  /** 파생 정보 (계산된 값들) */
  derived: {
    /** 일간 */
    dayMaster: string;
    /** 일지 */
    dayBranch: string;
    /** 일주 */
    dayPillar: string;
    /** 월지 */
    monthBranch: string;
    /** 계절 */
    season: Season;
    /** 일간 오행 */
    dayMasterElement: Element;
    /** 격국명 */
    structureName?: string;
    /** 강약 */
    strength?: Strength;
    /** 감지된 특수 패턴 */
    detectedPatterns: string[];
  };
}

// ============================================
// 컨텍스트 생성
// ============================================

/**
 * 월지에서 계절 도출
 */
function getSeasonFromBranch(branch: string): Season {
  const seasonMap: Record<string, Season> = {
    // 봄 (인묘진)
    '인': 'spring',
    '묘': 'spring',
    '진': 'spring',
    // 여름 (사오미)
    '사': 'summer',
    '오': 'summer',
    '미': 'summer',
    // 가을 (신유술)
    '신': 'autumn',
    '유': 'autumn',
    '술': 'autumn',
    // 겨울 (해자축)
    '해': 'winter',
    '자': 'winter',
    '축': 'winter',
  };
  return seasonMap[branch] || 'spring';
}

/**
 * 일간에서 오행 도출
 */
function getElementFromStem(stem: string): Element {
  const elementMap: Record<string, Element> = {
    '갑': '목',
    '을': '목',
    '병': '화',
    '정': '화',
    '무': '토',
    '기': '토',
    '경': '금',
    '신': '금',
    '임': '수',
    '계': '수',
  };
  return elementMap[stem] || '목';
}

/**
 * 강약 분석 결과를 Strength 타입으로 변환
 */
function normalizeStrength(
  strength?: 'strong' | 'neutral' | 'weak'
): Strength | undefined {
  return strength;
}

/**
 * 특수 패턴 감지
 * TODO: 실제 패턴 감지 로직 구현
 */
function detectPatterns(
  fourPillars: FourPillars,
  analysis: SajuAnalysis
): string[] {
  const patterns: string[] = [];

  const dayMaster = fourPillars.day.stem;
  const dayBranch = fourPillars.day.branch;
  const monthBranch = fourPillars.month.branch;

  // 금수쌍청 (金水雙淸): 경금/신금 + 겨울 + 수(水) 강함
  if (
    (dayMaster === '경' || dayMaster === '신') &&
    ['해', '자', '축'].includes(monthBranch)
  ) {
    const distribution = analysis.elements?.distribution;
    if (distribution && distribution['수'] >= 2) {
      patterns.push('금수쌍청');
    }
  }

  // 금한수냉 (金寒水冷): 겨울 금 + 화(火) 없음
  if (
    (dayMaster === '경' || dayMaster === '신') &&
    ['해', '자', '축'].includes(monthBranch)
  ) {
    const distribution = analysis.elements?.distribution;
    if (distribution && distribution['화'] === 0) {
      patterns.push('금한수냉');
    }
  }

  // 목화통명 (木火通明): 갑목/을목 + 여름 + 화(火) 강함
  if (
    (dayMaster === '갑' || dayMaster === '을') &&
    ['사', '오', '미'].includes(monthBranch)
  ) {
    const distribution = analysis.elements?.distribution;
    if (distribution && distribution['화'] >= 2) {
      patterns.push('목화통명');
    }
  }

  // 수화기제 (水火旣濟): 수(水)와 화(火)가 균형
  const distribution = analysis.elements?.distribution;
  if (
    distribution &&
    distribution['수'] >= 2 &&
    distribution['화'] >= 2
  ) {
    patterns.push('수화기제');
  }

  return patterns;
}

/**
 * FourPillars와 SajuAnalysis로부터 MatchContext 생성
 */
export function createMatchContext(
  fourPillars: FourPillars,
  analysis: SajuAnalysis
): MatchContext {
  const dayMaster = fourPillars.day.stem;
  const dayBranch = fourPillars.day.branch;
  const monthBranch = fourPillars.month.branch;

  return {
    fourPillars,
    analysis,
    derived: {
      dayMaster,
      dayBranch,
      dayPillar: fourPillars.day.full,
      monthBranch,
      season: getSeasonFromBranch(monthBranch),
      dayMasterElement: getElementFromStem(dayMaster),
      structureName: analysis.structure?.primary.type,
      strength: normalizeStrength(analysis.dayMasterStrength?.strength),
      detectedPatterns: detectPatterns(fourPillars, analysis),
    },
  };
}

// ============================================
// 조건 매칭 로직
// ============================================

/**
 * 단일 조건 매칭
 */
export function matchConditions(
  conditions: NarrativeConditions,
  context: MatchContext
): boolean {
  const { derived, analysis, fourPillars } = context;

  // 빈 조건은 항상 매칭
  if (Object.keys(conditions).length === 0) {
    return true;
  }

  // 일간 조건
  if (conditions.dayMaster && conditions.dayMaster.length > 0) {
    if (!conditions.dayMaster.includes(derived.dayMaster)) {
      return false;
    }
  }

  // 일지 조건
  if (conditions.dayBranch && conditions.dayBranch.length > 0) {
    if (!conditions.dayBranch.includes(derived.dayBranch)) {
      return false;
    }
  }

  // 일주 조건
  if (conditions.dayPillar && conditions.dayPillar.length > 0) {
    if (!conditions.dayPillar.includes(derived.dayPillar)) {
      return false;
    }
  }

  // 월지 조건
  if (conditions.monthBranch && conditions.monthBranch.length > 0) {
    if (!conditions.monthBranch.includes(derived.monthBranch)) {
      return false;
    }
  }

  // 계절 조건
  if (conditions.season && conditions.season.length > 0) {
    if (!conditions.season.includes(derived.season)) {
      return false;
    }
  }

  // 일간 오행 조건
  if (conditions.dayMasterElement && conditions.dayMasterElement.length > 0) {
    if (!conditions.dayMasterElement.includes(derived.dayMasterElement)) {
      return false;
    }
  }

  // 격국 조건
  if (conditions.structure && conditions.structure.length > 0) {
    if (
      !derived.structureName ||
      !conditions.structure.includes(derived.structureName)
    ) {
      return false;
    }
  }

  // 강약 조건
  if (conditions.strength && conditions.strength.length > 0) {
    if (!derived.strength || !conditions.strength.includes(derived.strength)) {
      return false;
    }
  }

  // 특수 패턴 조건
  if (conditions.hasPattern && conditions.hasPattern.length > 0) {
    const hasAllPatterns = conditions.hasPattern.every((pattern) =>
      derived.detectedPatterns.includes(pattern)
    );
    if (!hasAllPatterns) {
      return false;
    }
  }

  // 십신 존재 조건
  if (conditions.hasTenGod && conditions.hasTenGod.length > 0) {
    for (const tenGodCond of conditions.hasTenGod) {
      if (!checkTenGodExists(tenGodCond, context)) {
        return false;
      }
    }
  }

  // 오행 균형 조건
  if (conditions.elementBalance && conditions.elementBalance.length > 0) {
    for (const balanceCond of conditions.elementBalance) {
      if (!checkElementBalance(balanceCond, context)) {
        return false;
      }
    }
  }

  // 복합 조건: allOf (AND)
  if (conditions.allOf && conditions.allOf.length > 0) {
    const allMatch = conditions.allOf.every((subCond) =>
      matchConditions(subCond, context)
    );
    if (!allMatch) {
      return false;
    }
  }

  // 복합 조건: anyOf (OR)
  if (conditions.anyOf && conditions.anyOf.length > 0) {
    const anyMatch = conditions.anyOf.some((subCond) =>
      matchConditions(subCond, context)
    );
    if (!anyMatch) {
      return false;
    }
  }

  // 부정 조건: not
  if (conditions.not) {
    if (matchConditions(conditions.not, context)) {
      return false;
    }
  }

  // 모든 조건 통과
  return true;
}

/**
 * 십신 존재 여부 확인
 */
function checkTenGodExists(
  condition: { tenGod: string; position?: string },
  context: MatchContext
): boolean {
  const tenGods = context.analysis.tenGods;
  if (!tenGods) return false;

  const { tenGod, position } = condition;

  if (position === 'any' || !position) {
    // 어느 위치든 해당 십신이 있으면 OK
    const allTenGodTypes = [
      tenGods.year?.stem?.type,
      tenGods.year?.branch?.type,
      tenGods.month?.stem?.type,
      tenGods.month?.branch?.type,
      tenGods.day?.branch?.type, // 일간은 자기 자신
      tenGods.hour?.stem?.type,
      tenGods.hour?.branch?.type,
    ];
    return allTenGodTypes.some((tgType) => tgType === tenGod);
  }

  // 특정 위치에서 확인
  const pillarTenGod = tenGods[position as keyof typeof tenGods];
  if (!pillarTenGod || typeof pillarTenGod !== 'object') return false;
  if (!('stem' in pillarTenGod)) return false;

  return pillarTenGod.stem?.type === tenGod || pillarTenGod.branch?.type === tenGod;
}

/**
 * 오행 균형 조건 확인
 */
function checkElementBalance(
  condition: { element: string; condition: 'excess' | 'lack' | 'none' },
  context: MatchContext
): boolean {
  const distribution = context.analysis.elements?.distribution;
  if (!distribution) return false;

  const count = distribution[condition.element as Element] || 0;

  switch (condition.condition) {
    case 'none':
      return count === 0;
    case 'lack':
      return count <= 1;
    case 'excess':
      return count >= 4;
    default:
      return false;
  }
}

// ============================================
// 블록 선택
// ============================================

/**
 * 조건에 맞는 서사 블록 필터링
 */
export function filterMatchingBlocks(
  blocks: NarrativeBlock[],
  context: MatchContext,
  blockTypes?: string[]
): NarrativeBlock[] {
  return blocks.filter((block) => {
    // 블록 타입 필터
    if (blockTypes && blockTypes.length > 0) {
      if (!blockTypes.includes(block.type)) {
        return false;
      }
    }

    // 조건 매칭
    return matchConditions(block.conditions, context);
  });
}

/**
 * 우선순위 기반 블록 선택
 * 가장 구체적인 (높은 priority) 블록들을 선택
 */
export function selectByPriority(
  blocks: NarrativeBlock[],
  maxCount?: number
): NarrativeBlock[] {
  if (blocks.length === 0) return [];

  // 우선순위 내림차순 정렬
  const sorted = [...blocks].sort((a, b) => b.priority - a.priority);

  // 최고 우선순위 블록들만 선택 (동일 우선순위면 모두 포함)
  const highestPriority = sorted[0].priority;
  const topBlocks = sorted.filter((b) => b.priority === highestPriority);

  // maxCount 제한
  if (maxCount && topBlocks.length > maxCount) {
    return topBlocks.slice(0, maxCount);
  }

  return topBlocks;
}

/**
 * 특정 타입의 최적 블록 선택
 */
export function selectBestBlock(
  blocks: NarrativeBlock[],
  context: MatchContext,
  blockType: string
): NarrativeBlock | null {
  const matching = filterMatchingBlocks(blocks, context, [blockType]);
  const selected = selectByPriority(matching, 1);
  return selected[0] || null;
}

// ============================================
// 매칭 점수 계산
// ============================================

/**
 * 조건 매칭의 구체성 점수 계산
 * 조건이 구체적일수록 높은 점수
 */
export function calculateMatchScore(
  conditions: NarrativeConditions,
  context: MatchContext
): number {
  let score = 0;

  // 각 조건 타입별 가중치
  if (conditions.dayPillar?.length) score += 30; // 일주 지정 = 매우 구체적
  if (conditions.dayMaster?.length) score += 10;
  if (conditions.dayBranch?.length) score += 10;
  if (conditions.season?.length) score += 10;
  if (conditions.structure?.length) score += 15;
  if (conditions.strength?.length) score += 10;
  if (conditions.hasPattern?.length) score += 20;
  if (conditions.hasTenGod?.length) score += conditions.hasTenGod.length * 5;
  if (conditions.elementBalance?.length)
    score += conditions.elementBalance.length * 5;
  if (conditions.allOf?.length) score += 10;
  if (conditions.anyOf?.length) score += 5;

  return score;
}
