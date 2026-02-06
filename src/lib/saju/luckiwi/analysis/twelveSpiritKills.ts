/**
 * 12신살(十二神殺) 분석 모듈
 */

import { FourPillars } from '../types';
import {
  TwelveSpiritKillType,
  TwelveSpiritKillInfo,
  TwelveSpiritKillsAnalysis,
} from '../types/twelveSpiritKills';
import {
  TWELVE_SPIRIT_KILL_HANJA,
  TWELVE_SPIRIT_KILL_CATEGORY,
  TWELVE_SPIRIT_KILL_DESCRIPTION,
  JEOPSAL_TABLE,
  JAESAL_TABLE,
  CHUNSAL_TABLE,
  JISAL_TABLE,
  NYEONSAL_TABLE,
  WOLSAL_TABLE,
  MANGSINSAL_TABLE,
  JANGSEONGSAL_TABLE,
  BANANSAL_TABLE,
  YEOKMA_TABLE,
  YUKHAE_TABLE,
  HWAGAE_TABLE,
} from '../constants/twelveSpiritKills';

type Position = 'year' | 'month' | 'day' | 'hour';

/**
 * 12신살 정보 생성
 */
function createSpiritKillInfo(
  type: TwelveSpiritKillType,
  position: Position,
  basedOn: string
): TwelveSpiritKillInfo {
  return {
    type,
    typeHanja: TWELVE_SPIRIT_KILL_HANJA[type],
    position,
    basedOn,
    category: TWELVE_SPIRIT_KILL_CATEGORY[type],
    description: TWELVE_SPIRIT_KILL_DESCRIPTION[type],
  };
}

/**
 * 특정 기준 지지로 12신살 검사
 */
function checkSpiritsFromBranch(
  baseBranch: string,
  basedOn: string,
  fourPillars: FourPillars
): TwelveSpiritKillInfo[] {
  const results: TwelveSpiritKillInfo[] = [];

  const tables: { type: TwelveSpiritKillType; table: Record<string, string> }[] = [
    { type: '겁살', table: JEOPSAL_TABLE },
    { type: '재살', table: JAESAL_TABLE },
    { type: '천살', table: CHUNSAL_TABLE },
    { type: '지살', table: JISAL_TABLE },
    { type: '년살', table: NYEONSAL_TABLE },
    { type: '월살', table: WOLSAL_TABLE },
    { type: '망신살', table: MANGSINSAL_TABLE },
    { type: '장성살', table: JANGSEONGSAL_TABLE },
    { type: '반안살', table: BANANSAL_TABLE },
    { type: '역마', table: YEOKMA_TABLE },
    { type: '육해', table: YUKHAE_TABLE },
    { type: '화개', table: HWAGAE_TABLE },
  ];

  const positions: { pos: Position; branch: string }[] = [
    { pos: 'year', branch: fourPillars.year.branch },
    { pos: 'month', branch: fourPillars.month.branch },
    { pos: 'day', branch: fourPillars.day.branch },
    { pos: 'hour', branch: fourPillars.hour.branch },
  ];

  tables.forEach(({ type, table }) => {
    const targetBranch = table[baseBranch];
    if (!targetBranch) return;

    positions.forEach(({ pos, branch }) => {
      if (branch === targetBranch) {
        results.push(createSpiritKillInfo(type, pos, basedOn));
      }
    });
  });

  return results;
}

/**
 * 12신살 분석
 */
export function analyzeTwelveSpiritKills(fourPillars: FourPillars): TwelveSpiritKillsAnalysis {
  // 년지 기준 분석
  const yearBasedSpirits = checkSpiritsFromBranch(
    fourPillars.year.branch,
    `년지 ${fourPillars.year.branch}`,
    fourPillars
  );

  // 일지 기준 분석
  const dayBasedSpirits = checkSpiritsFromBranch(
    fourPillars.day.branch,
    `일지 ${fourPillars.day.branch}`,
    fourPillars
  );

  // 모든 신살 합치기 (중복 제거는 하지 않음 - 년지/일지 기준이 다를 수 있음)
  const allSpirits = [...yearBasedSpirits, ...dayBasedSpirits];

  // 카운트
  const auspiciousCount = allSpirits.filter(s => s.category === 'auspicious').length;
  const inauspiciousCount = allSpirits.filter(s => s.category === 'inauspicious').length;

  // 주요 신살 (중복 제거)
  const majorSpirits = [...new Set(allSpirits.map(s => s.type))];

  // 해석
  let interpretation = '';
  if (auspiciousCount > inauspiciousCount) {
    interpretation = '길한 신살이 많아 귀인의 도움과 발전이 있습니다.';
  } else if (inauspiciousCount > auspiciousCount) {
    interpretation = '흉한 신살이 있으나 주의하면 화를 면할 수 있습니다.';
  } else if (allSpirits.length === 0) {
    interpretation = '특별한 12신살이 없어 평탄한 운세입니다.';
  } else {
    interpretation = '길흉이 혼재하니 처신에 주의가 필요합니다.';
  }

  return {
    spirits: allSpirits,
    yearBasedSpirits,
    dayBasedSpirits,
    summary: {
      auspiciousCount,
      inauspiciousCount,
      majorSpirits,
      interpretation,
    },
  };
}

/**
 * 12신살 분석 요약 문자열 생성
 */
export function summarizeTwelveSpiritKills(analysis: TwelveSpiritKillsAnalysis): string {
  const parts: string[] = [];

  if (analysis.summary.majorSpirits.length > 0) {
    const auspicious = analysis.spirits
      .filter(s => s.category === 'auspicious')
      .map(s => s.type);
    const inauspicious = analysis.spirits
      .filter(s => s.category === 'inauspicious')
      .map(s => s.type);

    if (auspicious.length > 0) {
      parts.push(`길신살: ${[...new Set(auspicious)].join(', ')}`);
    }
    if (inauspicious.length > 0) {
      parts.push(`흉신살: ${[...new Set(inauspicious)].join(', ')}`);
    }
  }

  parts.push(analysis.summary.interpretation);

  return parts.join('\n');
}
