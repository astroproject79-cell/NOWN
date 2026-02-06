/**
 * 공망(空亡) 분석 모듈
 * 60갑자에서 빠진 지지를 찾아 분석
 */

import { FourPillars } from '../types';
import { EmptyBranchInfo, EmptyBranchesAnalysis } from '../types/emptyBranches';
import { getEmptyBranches, EMPTY_BRANCH_INTERPRETATIONS } from '../constants/emptyBranches';

/**
 * 공망 정보 생성
 */
function createEmptyBranchInfo(
  sexagenaryIndex: number,
  basedOn: 'year' | 'day'
): EmptyBranchInfo {
  const { branches, cycle, cycleHanja } = getEmptyBranches(sexagenaryIndex);

  return {
    branches,
    basedOn,
    cycle,
    cycleHanja,
  };
}

/**
 * 공망에 해당하는 주 찾기
 */
function findAffectedPositions(
  fourPillars: FourPillars,
  emptyBranches: [string, string],
  basedOn: 'year' | 'day'
): { position: 'year' | 'month' | 'day' | 'hour'; branch: string; basedOn: 'year' | 'day' }[] {
  const affected: { position: 'year' | 'month' | 'day' | 'hour'; branch: string; basedOn: 'year' | 'day' }[] = [];

  const positions: { pos: 'year' | 'month' | 'day' | 'hour'; branch: string }[] = [
    { pos: 'year', branch: fourPillars.year.branch },
    { pos: 'month', branch: fourPillars.month.branch },
    { pos: 'day', branch: fourPillars.day.branch },
    { pos: 'hour', branch: fourPillars.hour.branch },
  ];

  positions.forEach(({ pos, branch }) => {
    if (emptyBranches.includes(branch)) {
      affected.push({ position: pos, branch, basedOn });
    }
  });

  return affected;
}

/**
 * 공망 분석
 */
export function analyzeEmptyBranches(fourPillars: FourPillars): EmptyBranchesAnalysis {
  // 년주 기준 공망
  const yearBased = createEmptyBranchInfo(fourPillars.year.sexagenaryIndex, 'year');

  // 일주 기준 공망 (더 중요하게 봄)
  const dayBased = createEmptyBranchInfo(fourPillars.day.sexagenaryIndex, 'day');

  // 공망에 해당하는 주 찾기
  const yearAffected = findAffectedPositions(fourPillars, yearBased.branches, 'year');
  const dayAffected = findAffectedPositions(fourPillars, dayBased.branches, 'day');

  // 중복 제거
  const allAffected = [...yearAffected];
  dayAffected.forEach(d => {
    if (!allAffected.find(a => a.position === d.position && a.basedOn === d.basedOn)) {
      allAffected.push(d);
    }
  });

  // 해석 생성
  const hasEmpty = allAffected.length > 0;
  let interpretation = '';

  if (!hasEmpty) {
    interpretation = '공망에 해당하는 주가 없어 안정적입니다.';
  } else {
    const parts: string[] = [];
    const positionMap: Record<string, string> = {
      'year': '년',
      'month': '월',
      'day': '일',
      'hour': '시',
    };

    // 일주 기준 공망만 해석 (더 중요)
    dayAffected.forEach(a => {
      const posName = positionMap[a.position];
      if (EMPTY_BRANCH_INTERPRETATIONS[posName]) {
        parts.push(`${posName}주 공망: ${EMPTY_BRANCH_INTERPRETATIONS[posName]}`);
      }
    });

    interpretation = parts.length > 0 ? parts.join('. ') : '공망이 있으나 큰 영향은 없습니다.';
  }

  return {
    yearBased,
    dayBased,
    affectedPositions: allAffected,
    summary: {
      hasEmpty,
      emptyCount: allAffected.length,
      interpretation,
    },
  };
}

/**
 * 공망 분석 요약 문자열 생성
 */
export function summarizeEmptyBranches(analysis: EmptyBranchesAnalysis): string {
  const parts: string[] = [];

  parts.push(`일주 공망: ${analysis.dayBased.branches.join(', ')} (${analysis.dayBased.cycle})`);

  if (analysis.affectedPositions.length > 0) {
    const affected = analysis.affectedPositions
      .filter(a => a.basedOn === 'day')
      .map(a => `${a.position}지(${a.branch})`);
    if (affected.length > 0) {
      parts.push(`공망 해당: ${affected.join(', ')}`);
    }
  }

  parts.push(analysis.summary.interpretation);

  return parts.join('\n');
}
