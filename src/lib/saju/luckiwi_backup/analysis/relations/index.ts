/**
 * 간지 관계 분석 통합 모듈
 * 천간합, 지지합(삼합/육합/방합), 충, 형, 해, 파 분석
 */

import { HeavenlyStem } from '../../constants/stems';
import { EarthlyBranch } from '../../constants/branches';
import {
  STEM_COMBINATIONS,
  SIX_COMBINATIONS,
  TRIPLE_COMBINATIONS,
  TRIPLE_COMBINATION_PARTS,
  DIRECTIONAL_COMBINATIONS,
  SIX_CLASHES,
  PUNISHMENTS,
  SIX_HARMS,
  SIX_DESTRUCTIONS,
  checkStemCombination,
  checkSixCombination,
  checkClash,
  checkHarm,
  checkDestruction,
} from '../../constants/relations';
import {
  PositionType,
  StemCombination,
  SixCombination,
  TripleCombination,
  HalfCombination,
  DirectionalCombination,
  Clash,
  Punishment,
  PunishmentType,
  Harm,
  Destruction,
  RelationAnalysis,
} from '../../types/relations';
import { FourPillars } from '../../types';

/** 위치 정보와 함께 천간/지지 */
interface StemWithPosition {
  stem: HeavenlyStem;
  position: PositionType;
}

interface BranchWithPosition {
  branch: EarthlyBranch;
  position: PositionType;
}

/**
 * 사주에서 천간 목록 추출
 */
function extractStems(fourPillars: FourPillars): StemWithPosition[] {
  return [
    { stem: fourPillars.year.stem, position: 'year-stem' },
    { stem: fourPillars.month.stem, position: 'month-stem' },
    { stem: fourPillars.day.stem, position: 'day-stem' },
    { stem: fourPillars.hour.stem, position: 'hour-stem' },
  ];
}

/**
 * 사주에서 지지 목록 추출
 */
function extractBranches(fourPillars: FourPillars): BranchWithPosition[] {
  return [
    { branch: fourPillars.year.branch, position: 'year-branch' },
    { branch: fourPillars.month.branch, position: 'month-branch' },
    { branch: fourPillars.day.branch, position: 'day-branch' },
    { branch: fourPillars.hour.branch, position: 'hour-branch' },
  ];
}

/**
 * 천간합 찾기
 */
function findStemCombinations(stems: StemWithPosition[]): StemCombination[] {
  const results: StemCombination[] = [];

  for (let i = 0; i < stems.length; i++) {
    for (let j = i + 1; j < stems.length; j++) {
      const combo = checkStemCombination(stems[i].stem, stems[j].stem);
      if (combo) {
        results.push({
          stems: [stems[i].stem, stems[j].stem],
          positions: [stems[i].position, stems[j].position],
          resultElement: combo.resultElement,
          isTransformed: false, // 화(化) 성립 조건은 별도 판단 필요
        });
      }
    }
  }

  return results;
}

/**
 * 육합 찾기
 */
function findSixCombinations(branches: BranchWithPosition[]): SixCombination[] {
  const results: SixCombination[] = [];

  for (let i = 0; i < branches.length; i++) {
    for (let j = i + 1; j < branches.length; j++) {
      const combo = checkSixCombination(branches[i].branch, branches[j].branch);
      if (combo) {
        results.push({
          branches: [branches[i].branch, branches[j].branch],
          positions: [branches[i].position, branches[j].position],
          resultElement: combo.resultElement,
        });
      }
    }
  }

  return results;
}

/**
 * 삼합 찾기
 */
function findTripleCombinations(branches: BranchWithPosition[]): TripleCombination[] {
  const results: TripleCombination[] = [];
  const branchSet = new Set(branches.map(b => b.branch));

  for (const triple of TRIPLE_COMBINATIONS) {
    const [b1, b2, b3] = triple.branches;
    const has1 = branchSet.has(b1);
    const has2 = branchSet.has(b2);
    const has3 = branchSet.has(b3);

    // 완전 삼합 (3개 모두)
    if (has1 && has2 && has3) {
      const positions = triple.branches.map(b =>
        branches.find(bp => bp.branch === b)!.position
      ) as [PositionType, PositionType, PositionType];

      results.push({
        branches: triple.branches,
        positions,
        resultElement: triple.resultElement,
        isComplete: true,
      });
    }
  }

  return results;
}

/**
 * 반합 찾기 (삼합 중 2개만)
 */
function findHalfCombinations(branches: BranchWithPosition[]): HalfCombination[] {
  const results: HalfCombination[] = [];
  const branchSet = new Set(branches.map(b => b.branch));

  for (const triple of TRIPLE_COMBINATION_PARTS) {
    const { birth, prosperity, storage, resultElement } = triple;
    const hasBirth = branchSet.has(birth);
    const hasProsperity = branchSet.has(prosperity);
    const hasStorage = branchSet.has(storage);

    // 2개만 있는 경우
    const count = [hasBirth, hasProsperity, hasStorage].filter(Boolean).length;
    if (count !== 2) continue;

    let type: 'birth' | 'prosperity' | 'storage';
    let pair: [EarthlyBranch, EarthlyBranch];
    let missing: EarthlyBranch;

    if (!hasBirth) {
      type = 'storage'; // 왕지-고지 반합
      pair = [prosperity, storage];
      missing = birth;
    } else if (!hasProsperity) {
      type = 'birth'; // 생지-고지 반합 (약함)
      pair = [birth, storage];
      missing = prosperity;
    } else {
      type = 'prosperity'; // 생지-왕지 반합
      pair = [birth, prosperity];
      missing = storage;
    }

    const positions = pair.map(b =>
      branches.find(bp => bp.branch === b)!.position
    ) as [PositionType, PositionType];

    results.push({
      branches: pair,
      positions,
      missingBranch: missing,
      resultElement,
      type,
    });
  }

  return results;
}

/**
 * 방합 찾기
 */
function findDirectionalCombinations(branches: BranchWithPosition[]): DirectionalCombination[] {
  const results: DirectionalCombination[] = [];
  const branchSet = new Set(branches.map(b => b.branch));

  for (const dir of DIRECTIONAL_COMBINATIONS) {
    const matches = dir.branches.filter(b => branchSet.has(b));

    if (matches.length >= 2) {
      const positions = matches.map(b =>
        branches.find(bp => bp.branch === b)!.position
      );

      results.push({
        branches: matches,
        positions,
        direction: dir.direction,
        element: dir.element,
        isComplete: matches.length === 3,
      });
    }
  }

  return results;
}

/**
 * 육충 찾기
 */
function findClashes(branches: BranchWithPosition[]): Clash[] {
  const results: Clash[] = [];

  for (let i = 0; i < branches.length; i++) {
    for (let j = i + 1; j < branches.length; j++) {
      if (checkClash(branches[i].branch, branches[j].branch)) {
        results.push({
          branches: [branches[i].branch, branches[j].branch],
          positions: [branches[i].position, branches[j].position],
        });
      }
    }
  }

  return results;
}

/**
 * 형(刑) 찾기
 */
function findPunishments(branches: BranchWithPosition[]): Punishment[] {
  const results: Punishment[] = [];
  const branchSet = new Set(branches.map(b => b.branch));
  const branchList = branches.map(b => b.branch);

  // 무은지형 (인사신)
  const gracelessMembers = PUNISHMENTS.graceless.members.filter(b => branchSet.has(b));
  if (gracelessMembers.length >= 2) {
    const positions = gracelessMembers.map(b =>
      branches.find(bp => bp.branch === b)!.position
    );
    results.push({
      branches: gracelessMembers,
      positions,
      type: 'graceless',
    });
  }

  // 세력지형 (축술미)
  const bullyingMembers = PUNISHMENTS.bullying.members.filter(b => branchSet.has(b));
  if (bullyingMembers.length >= 2) {
    const positions = bullyingMembers.map(b =>
      branches.find(bp => bp.branch === b)!.position
    );
    results.push({
      branches: bullyingMembers,
      positions,
      type: 'bullying',
    });
  }

  // 자형 (진오유해)
  for (const selfPunish of PUNISHMENTS.self) {
    const count = branchList.filter(b => b === selfPunish).length;
    if (count >= 2) {
      const positions = branches
        .filter(bp => bp.branch === selfPunish)
        .map(bp => bp.position);
      results.push({
        branches: Array(count).fill(selfPunish),
        positions,
        type: 'self',
      });
    }
  }

  return results;
}

/**
 * 해(害) 찾기
 */
function findHarms(branches: BranchWithPosition[]): Harm[] {
  const results: Harm[] = [];

  for (let i = 0; i < branches.length; i++) {
    for (let j = i + 1; j < branches.length; j++) {
      if (checkHarm(branches[i].branch, branches[j].branch)) {
        results.push({
          branches: [branches[i].branch, branches[j].branch],
          positions: [branches[i].position, branches[j].position],
        });
      }
    }
  }

  return results;
}

/**
 * 파(破) 찾기
 */
function findDestructions(branches: BranchWithPosition[]): Destruction[] {
  const results: Destruction[] = [];

  for (let i = 0; i < branches.length; i++) {
    for (let j = i + 1; j < branches.length; j++) {
      if (checkDestruction(branches[i].branch, branches[j].branch)) {
        results.push({
          branches: [branches[i].branch, branches[j].branch],
          positions: [branches[i].position, branches[j].position],
        });
      }
    }
  }

  return results;
}

/**
 * 관계 요약 계산
 */
function calculateSummary(
  stemCombinations: StemCombination[],
  sixCombinations: SixCombination[],
  tripleCombinations: TripleCombination[],
  halfCombinations: HalfCombination[],
  directionalCombinations: DirectionalCombination[],
  clashes: Clash[],
  punishments: Punishment[],
  harms: Harm[],
  destructions: Destruction[]
): RelationAnalysis['summary'] {
  const combinationCount =
    stemCombinations.length +
    sixCombinations.length +
    tripleCombinations.length +
    halfCombinations.length +
    directionalCombinations.filter(d => d.isComplete).length;

  const conflictCount =
    clashes.length +
    punishments.length +
    harms.length +
    destructions.length;

  const hasCombination = combinationCount > 0;
  const hasConflict = conflictCount > 0;

  // 점수 계산 (0-100)
  // 합이 많으면 조화 점수 높음, 충돌이 많으면 충돌 점수 높음
  const harmonyScore = Math.min(100, combinationCount * 20);
  const conflictScore = Math.min(100, conflictCount * 25);

  return {
    hasCombination,
    hasConflict,
    harmonyScore,
    conflictScore,
  };
}

/**
 * 전체 관계 분석
 * @param fourPillars 사주팔자
 * @returns 관계 분석 결과
 */
export function analyzeRelations(fourPillars: FourPillars): RelationAnalysis {
  const stems = extractStems(fourPillars);
  const branches = extractBranches(fourPillars);

  const stemCombinations = findStemCombinations(stems);
  const sixCombinations = findSixCombinations(branches);
  const tripleCombinations = findTripleCombinations(branches);
  const halfCombinations = findHalfCombinations(branches);
  const directionalCombinations = findDirectionalCombinations(branches);
  const clashes = findClashes(branches);
  const punishments = findPunishments(branches);
  const harms = findHarms(branches);
  const destructions = findDestructions(branches);

  const summary = calculateSummary(
    stemCombinations,
    sixCombinations,
    tripleCombinations,
    halfCombinations,
    directionalCombinations,
    clashes,
    punishments,
    harms,
    destructions
  );

  return {
    stemCombinations,
    tripleCombinations,
    halfCombinations,
    sixCombinations,
    directionalCombinations,
    clashes,
    punishments,
    harms,
    destructions,
    summary,
  };
}

/**
 * 관계 분석 요약 문자열 생성
 */
export function summarizeRelations(analysis: RelationAnalysis): string {
  const parts: string[] = [];

  if (analysis.stemCombinations.length > 0) {
    parts.push(`천간합 ${analysis.stemCombinations.length}개`);
  }
  if (analysis.tripleCombinations.length > 0) {
    parts.push(`삼합 ${analysis.tripleCombinations.length}개`);
  }
  if (analysis.sixCombinations.length > 0) {
    parts.push(`육합 ${analysis.sixCombinations.length}개`);
  }
  if (analysis.clashes.length > 0) {
    parts.push(`충 ${analysis.clashes.length}개`);
  }
  if (analysis.punishments.length > 0) {
    parts.push(`형 ${analysis.punishments.length}개`);
  }
  if (analysis.harms.length > 0) {
    parts.push(`해 ${analysis.harms.length}개`);
  }

  return parts.length > 0 ? parts.join(', ') : '특별한 관계 없음';
}
