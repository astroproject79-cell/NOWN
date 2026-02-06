/**
 * 신살(神殺) 분석 모듈
 */

import { FourPillars } from '../types';
import { SpiritType, SpiritInfo, SpiritsAnalysis } from '../types/spirits';
import {
  SPIRIT_HANJA,
  SPIRIT_CATEGORY,
  SPIRIT_DESCRIPTION,
  SPIRIT_EFFECT,
  TIANYI_TABLE,
  TAOHUA_TABLE,
  YIMA_TABLE,
  HUAGAI_TABLE,
  YANGREN_TABLE,
  WENCHANG_TABLE,
  TIANDE_BRANCH_TABLE,
  YUEDE_TABLE,
  HONGLAN_TABLE,
  TIANXI_TABLE,
} from '../constants/spirits';

type Position = 'year' | 'month' | 'day' | 'hour';

/**
 * 신살 정보 생성 헬퍼
 */
function createSpiritInfo(
  type: SpiritType,
  position: Position,
  basedOn: string
): SpiritInfo {
  return {
    type,
    typeHanja: SPIRIT_HANJA[type],
    category: SPIRIT_CATEGORY[type],
    position,
    basedOn,
    description: SPIRIT_DESCRIPTION[type],
    effect: SPIRIT_EFFECT[type],
  };
}

/**
 * 천을귀인 검사 (일간 기준)
 */
function checkTianyi(fourPillars: FourPillars): SpiritInfo[] {
  const results: SpiritInfo[] = [];
  const dayMaster = fourPillars.day.stem;
  const tianyiBranches = TIANYI_TABLE[dayMaster] || [];

  const positions: { pos: Position; branch: string }[] = [
    { pos: 'year', branch: fourPillars.year.branch },
    { pos: 'month', branch: fourPillars.month.branch },
    { pos: 'day', branch: fourPillars.day.branch },
    { pos: 'hour', branch: fourPillars.hour.branch },
  ];

  positions.forEach(({ pos, branch }) => {
    if (tianyiBranches.includes(branch)) {
      results.push(createSpiritInfo('천을귀인', pos, `일간 ${dayMaster}`));
    }
  });

  return results;
}

/**
 * 도화살 검사 (년지/일지 기준)
 */
function checkTaohua(fourPillars: FourPillars): SpiritInfo[] {
  const results: SpiritInfo[] = [];
  const yearBranch = fourPillars.year.branch;
  const dayBranch = fourPillars.day.branch;

  const taohuaFromYear = TAOHUA_TABLE[yearBranch];
  const taohuaFromDay = TAOHUA_TABLE[dayBranch];

  const branches = [
    { pos: 'year' as Position, branch: yearBranch },
    { pos: 'month' as Position, branch: fourPillars.month.branch },
    { pos: 'day' as Position, branch: dayBranch },
    { pos: 'hour' as Position, branch: fourPillars.hour.branch },
  ];

  branches.forEach(({ pos, branch }) => {
    if (branch === taohuaFromYear) {
      results.push(createSpiritInfo('도화살', pos, `년지 ${yearBranch}`));
    }
    if (branch === taohuaFromDay && branch !== taohuaFromYear) {
      results.push(createSpiritInfo('도화살', pos, `일지 ${dayBranch}`));
    }
  });

  return results;
}

/**
 * 역마살 검사 (년지/일지 기준)
 */
function checkYima(fourPillars: FourPillars): SpiritInfo[] {
  const results: SpiritInfo[] = [];
  const yearBranch = fourPillars.year.branch;
  const dayBranch = fourPillars.day.branch;

  const yimaFromYear = YIMA_TABLE[yearBranch];
  const yimaFromDay = YIMA_TABLE[dayBranch];

  const branches = [
    { pos: 'year' as Position, branch: yearBranch },
    { pos: 'month' as Position, branch: fourPillars.month.branch },
    { pos: 'day' as Position, branch: dayBranch },
    { pos: 'hour' as Position, branch: fourPillars.hour.branch },
  ];

  branches.forEach(({ pos, branch }) => {
    if (branch === yimaFromYear) {
      results.push(createSpiritInfo('역마살', pos, `년지 ${yearBranch}`));
    }
    if (branch === yimaFromDay && branch !== yimaFromYear) {
      results.push(createSpiritInfo('역마살', pos, `일지 ${dayBranch}`));
    }
  });

  return results;
}

/**
 * 화개살 검사 (년지/일지 기준)
 */
function checkHuagai(fourPillars: FourPillars): SpiritInfo[] {
  const results: SpiritInfo[] = [];
  const yearBranch = fourPillars.year.branch;
  const dayBranch = fourPillars.day.branch;

  const huagaiFromYear = HUAGAI_TABLE[yearBranch];
  const huagaiFromDay = HUAGAI_TABLE[dayBranch];

  const branches = [
    { pos: 'year' as Position, branch: yearBranch },
    { pos: 'month' as Position, branch: fourPillars.month.branch },
    { pos: 'day' as Position, branch: dayBranch },
    { pos: 'hour' as Position, branch: fourPillars.hour.branch },
  ];

  branches.forEach(({ pos, branch }) => {
    if (branch === huagaiFromYear) {
      results.push(createSpiritInfo('화개살', pos, `년지 ${yearBranch}`));
    }
    if (branch === huagaiFromDay && branch !== huagaiFromYear) {
      results.push(createSpiritInfo('화개살', pos, `일지 ${dayBranch}`));
    }
  });

  return results;
}

/**
 * 양인살 검사 (일간 기준)
 */
function checkYangren(fourPillars: FourPillars): SpiritInfo[] {
  const results: SpiritInfo[] = [];
  const dayMaster = fourPillars.day.stem;
  const yangrenBranch = YANGREN_TABLE[dayMaster];

  if (!yangrenBranch) return results;

  const branches = [
    { pos: 'year' as Position, branch: fourPillars.year.branch },
    { pos: 'month' as Position, branch: fourPillars.month.branch },
    { pos: 'day' as Position, branch: fourPillars.day.branch },
    { pos: 'hour' as Position, branch: fourPillars.hour.branch },
  ];

  branches.forEach(({ pos, branch }) => {
    if (branch === yangrenBranch) {
      results.push(createSpiritInfo('양인살', pos, `일간 ${dayMaster}`));
    }
  });

  return results;
}

/**
 * 문창귀인 검사 (일간 기준)
 */
function checkWenchang(fourPillars: FourPillars): SpiritInfo[] {
  const results: SpiritInfo[] = [];
  const dayMaster = fourPillars.day.stem;
  const wenchangBranch = WENCHANG_TABLE[dayMaster];

  if (!wenchangBranch) return results;

  const branches = [
    { pos: 'year' as Position, branch: fourPillars.year.branch },
    { pos: 'month' as Position, branch: fourPillars.month.branch },
    { pos: 'day' as Position, branch: fourPillars.day.branch },
    { pos: 'hour' as Position, branch: fourPillars.hour.branch },
  ];

  branches.forEach(({ pos, branch }) => {
    if (branch === wenchangBranch) {
      results.push(createSpiritInfo('문창귀인', pos, `일간 ${dayMaster}`));
    }
  });

  return results;
}

/**
 * 천덕귀인 검사 (월지 기준)
 */
function checkTiande(fourPillars: FourPillars): SpiritInfo[] {
  const results: SpiritInfo[] = [];
  const monthBranch = fourPillars.month.branch;
  const tiandeStem = TIANDE_BRANCH_TABLE[monthBranch];

  if (!tiandeStem) return results;

  const stems = [
    { pos: 'year' as Position, stem: fourPillars.year.stem },
    { pos: 'month' as Position, stem: fourPillars.month.stem },
    { pos: 'day' as Position, stem: fourPillars.day.stem },
    { pos: 'hour' as Position, stem: fourPillars.hour.stem },
  ];

  stems.forEach(({ pos, stem }) => {
    if (stem === tiandeStem) {
      results.push(createSpiritInfo('천덕귀인', pos, `월지 ${monthBranch}`));
    }
  });

  return results;
}

/**
 * 월덕귀인 검사 (월지 기준)
 */
function checkYuede(fourPillars: FourPillars): SpiritInfo[] {
  const results: SpiritInfo[] = [];
  const monthBranch = fourPillars.month.branch;
  const yuedeStem = YUEDE_TABLE[monthBranch];

  if (!yuedeStem) return results;

  const stems = [
    { pos: 'year' as Position, stem: fourPillars.year.stem },
    { pos: 'month' as Position, stem: fourPillars.month.stem },
    { pos: 'day' as Position, stem: fourPillars.day.stem },
    { pos: 'hour' as Position, stem: fourPillars.hour.stem },
  ];

  stems.forEach(({ pos, stem }) => {
    if (stem === yuedeStem) {
      results.push(createSpiritInfo('월덕귀인', pos, `월지 ${monthBranch}`));
    }
  });

  return results;
}

/**
 * 홍란성 검사 (년지 기준)
 */
function checkHonglan(fourPillars: FourPillars): SpiritInfo[] {
  const results: SpiritInfo[] = [];
  const yearBranch = fourPillars.year.branch;
  const honglanBranch = HONGLAN_TABLE[yearBranch];

  if (!honglanBranch) return results;

  const branches = [
    { pos: 'year' as Position, branch: yearBranch },
    { pos: 'month' as Position, branch: fourPillars.month.branch },
    { pos: 'day' as Position, branch: fourPillars.day.branch },
    { pos: 'hour' as Position, branch: fourPillars.hour.branch },
  ];

  branches.forEach(({ pos, branch }) => {
    if (branch === honglanBranch) {
      results.push(createSpiritInfo('홍란성', pos, `년지 ${yearBranch}`));
    }
  });

  return results;
}

/**
 * 천희성 검사 (년지 기준)
 */
function checkTianxi(fourPillars: FourPillars): SpiritInfo[] {
  const results: SpiritInfo[] = [];
  const yearBranch = fourPillars.year.branch;
  const tianxiBranch = TIANXI_TABLE[yearBranch];

  if (!tianxiBranch) return results;

  const branches = [
    { pos: 'year' as Position, branch: yearBranch },
    { pos: 'month' as Position, branch: fourPillars.month.branch },
    { pos: 'day' as Position, branch: fourPillars.day.branch },
    { pos: 'hour' as Position, branch: fourPillars.hour.branch },
  ];

  branches.forEach(({ pos, branch }) => {
    if (branch === tianxiBranch) {
      results.push(createSpiritInfo('천희성', pos, `년지 ${yearBranch}`));
    }
  });

  return results;
}

/**
 * 전체 신살 분석
 */
export function analyzeSpirits(fourPillars: FourPillars): SpiritsAnalysis {
  const allSpirits: SpiritInfo[] = [
    ...checkTianyi(fourPillars),
    ...checkTaohua(fourPillars),
    ...checkYima(fourPillars),
    ...checkHuagai(fourPillars),
    ...checkYangren(fourPillars),
    ...checkWenchang(fourPillars),
    ...checkTiande(fourPillars),
    ...checkYuede(fourPillars),
    ...checkHonglan(fourPillars),
    ...checkTianxi(fourPillars),
  ];

  const auspicious = allSpirits.filter(s => s.category === 'auspicious');
  const inauspicious = allSpirits.filter(s => s.category === 'inauspicious');

  // 주요 신살 추출 (중복 제거)
  const majorSpirits = [...new Set(allSpirits.map(s => s.type))];

  // 해석 생성
  let interpretation = '';
  if (auspicious.length > inauspicious.length) {
    interpretation = '길신이 많아 귀인의 도움이 많고 복록이 있습니다.';
  } else if (inauspicious.length > auspicious.length) {
    interpretation = '흉살이 많으나, 용신 활용과 수양으로 화를 복으로 바꿀 수 있습니다.';
  } else {
    interpretation = '길흉이 상반하니 처세에 신중함이 필요합니다.';
  }

  return {
    auspicious,
    inauspicious,
    summary: {
      totalAuspicious: auspicious.length,
      totalInauspicious: inauspicious.length,
      majorSpirits,
      interpretation,
    },
  };
}

/**
 * 신살 분석 요약 문자열 생성
 */
export function summarizeSpirits(analysis: SpiritsAnalysis): string {
  const parts: string[] = [];

  if (analysis.auspicious.length > 0) {
    const types = [...new Set(analysis.auspicious.map(s => s.type))];
    parts.push(`길신: ${types.join(', ')}`);
  }

  if (analysis.inauspicious.length > 0) {
    const types = [...new Set(analysis.inauspicious.map(s => s.type))];
    parts.push(`흉살: ${types.join(', ')}`);
  }

  parts.push(analysis.summary.interpretation);

  return parts.join('\n');
}
