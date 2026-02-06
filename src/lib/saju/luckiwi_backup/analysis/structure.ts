/**
 * 격국(格局) 판정 모듈
 *
 * 격국 판정 순서:
 * 1. 건록격/양인격 체크 (월지가 일간의 록지/양인)
 * 2. 월지 장간 본기의 십신으로 격국 결정
 * 3. 천간 투출 여부로 격국 확정
 */

import { HeavenlyStem, STEM_ELEMENTS, STEM_YIN_YANG, getStemIndex } from '../constants/stems';
import { EarthlyBranch, BRANCH_ELEMENTS, getBranchIndex } from '../constants/branches';
import { Element } from '../types/elements';
import { TenGodType } from '../types/tenGod';
import { StructureType, StructureCategory, StructureStrength, Structure, StructureAnalysis } from '../types/structure';
import { getHiddenStems } from '../constants/hiddenStems';
import { HiddenStemSchool } from '../types/hiddenStem';
import { calculateTenGodFromStem } from './tenGod';
import { analyzeDayMasterStrength, DayMasterStrengthAnalysis } from './dayMasterStrength';
import { FourPillars } from '../types';

/** 격국 한자 */
export const STRUCTURE_HANJA: Record<StructureType, string> = {
  '정관격': '正官格',
  '편관격': '偏官格',
  '정인격': '正印格',
  '편인격': '偏印格',
  '식신격': '食神格',
  '상관격': '傷官格',
  '정재격': '正財格',
  '편재격': '偏財格',
  '건록격': '建祿格',
  '양인격': '羊刃格',
  '종격': '從格',
  '화격': '化格',
  '전왕격': '專旺格',
  '잡격': '雜格',
};

/** 십신 → 격국 매핑 */
const TEN_GOD_TO_STRUCTURE: Partial<Record<TenGodType, StructureType>> = {
  '정관': '정관격',
  '편관': '편관격',
  '정인': '정인격',
  '편인': '편인격',
  '식신': '식신격',
  '상관': '상관격',
  '정재': '정재격',
  '편재': '편재격',
};

/**
 * 일간별 록지(祿地) - 일간과 같은 오행의 양지
 * 예: 갑목 → 인(寅), 을목 → 묘(卯)
 */
const DAY_MASTER_PROSPERITY: Record<HeavenlyStem, EarthlyBranch> = {
  '갑': '인', '을': '묘',
  '병': '사', '정': '오',
  '무': '사', '기': '오',
  '경': '신', '신': '유',
  '임': '해', '계': '자',
};

/**
 * 일간별 양인(羊刃) - 일간의 록지 다음 지지
 * 양간만 해당 (갑병무경임)
 */
const DAY_MASTER_BLADE: Partial<Record<HeavenlyStem, EarthlyBranch>> = {
  '갑': '묘',
  '병': '오',
  '무': '오',
  '경': '유',
  '임': '자',
};

/**
 * 건록격 체크
 */
function checkProsperityStructure(
  dayMaster: HeavenlyStem,
  monthBranch: EarthlyBranch
): boolean {
  return DAY_MASTER_PROSPERITY[dayMaster] === monthBranch;
}

/**
 * 양인격 체크 (양간만)
 */
function checkBladeStructure(
  dayMaster: HeavenlyStem,
  monthBranch: EarthlyBranch
): boolean {
  const blade = DAY_MASTER_BLADE[dayMaster];
  return blade !== undefined && blade === monthBranch;
}

/**
 * 월지 장간 본기로 격국 결정
 */
function determineStructureFromMonthBranch(
  dayMaster: HeavenlyStem,
  monthBranch: EarthlyBranch,
  school: HiddenStemSchool
): StructureType | null {
  const hiddenStems = getHiddenStems(monthBranch, school);
  const mainStemTenGod = calculateTenGodFromStem(dayMaster, hiddenStems.main);

  // 비견/겁재는 격국으로 사용하지 않음 (건록격/양인격으로 처리)
  if (mainStemTenGod === '비견' || mainStemTenGod === '겁재') {
    return null;
  }

  return TEN_GOD_TO_STRUCTURE[mainStemTenGod] || null;
}

/**
 * 천간 투출 확인
 * 월지 장간이 년/월/시 천간에 나타나는지 확인
 */
function checkTransparency(
  fourPillars: FourPillars,
  monthBranch: EarthlyBranch,
  school: HiddenStemSchool
): HeavenlyStem | null {
  const hiddenStems = getHiddenStems(monthBranch, school);
  const allHiddenStems = [hiddenStems.main, hiddenStems.middle, hiddenStems.residual].filter(Boolean) as HeavenlyStem[];

  // 년/월/시 천간에서 투출된 장간 찾기 (일간 제외)
  const stems = [fourPillars.year.stem, fourPillars.month.stem, fourPillars.hour.stem];

  for (const stem of stems) {
    if (allHiddenStems.includes(stem)) {
      return stem;
    }
  }

  return null;
}

/**
 * 격국 강도 계산
 */
function calculateStructureStrength(
  fourPillars: FourPillars,
  structureType: StructureType,
  dayStrength: DayMasterStrengthAnalysis
): StructureStrength {
  // 간단한 판정: 일주 강약과 격국 특성에 따라
  // 실제로는 더 복잡한 로직 필요

  if (dayStrength.strength === 'strong' && structureType === '건록격') {
    return 'strong';
  }
  if (dayStrength.strength === 'weak' && structureType === '정인격') {
    return 'strong';
  }

  return 'moderate';
}

/**
 * 격국 순수도 계산
 */
function calculateStructurePurity(
  fourPillars: FourPillars,
  structureType: StructureType
): number {
  // 간단한 계산: 기본 60점
  // 실제로는 격국 파괴 요소 등을 고려해야 함
  return 60;
}

/**
 * 격국 분석
 * @param fourPillars 사주팔자
 * @param school 장간 유파
 * @returns 격국 분석 결과
 */
export function analyzeStructure(
  fourPillars: FourPillars,
  school: HiddenStemSchool = 'standard'
): StructureAnalysis {
  const dayMaster = fourPillars.day.stem;
  const monthBranch = fourPillars.month.branch;
  const dayStrength = analyzeDayMasterStrength(fourPillars, school);
  const notes: string[] = [];

  let primaryType: StructureType;
  let determinedBy: string;
  let category: StructureCategory = 'regular';

  // 1. 건록격 체크
  if (checkProsperityStructure(dayMaster, monthBranch)) {
    primaryType = '건록격';
    determinedBy = `월지 ${monthBranch}이 ${dayMaster}의 록지`;
    notes.push('건록격은 자립심이 강하고 독립적');
  }
  // 2. 양인격 체크 (양간만)
  else if (checkBladeStructure(dayMaster, monthBranch)) {
    primaryType = '양인격';
    determinedBy = `월지 ${monthBranch}이 ${dayMaster}의 양인`;
    notes.push('양인격은 결단력이 강하나 극단적일 수 있음');
  }
  // 3. 월지 장간 기준 격국
  else {
    const structureFromMonth = determineStructureFromMonthBranch(dayMaster, monthBranch, school);

    if (structureFromMonth) {
      primaryType = structureFromMonth;
      const hiddenStems = getHiddenStems(monthBranch, school);
      determinedBy = `월지 ${monthBranch}의 본기 ${hiddenStems.main}`;

      // 투출 확인
      const transparentStem = checkTransparency(fourPillars, monthBranch, school);
      if (transparentStem) {
        notes.push(`${transparentStem} 투출로 격국 확정`);
      }
    } else {
      // 기본값: 잡격
      primaryType = '잡격';
      determinedBy = '특정 격국 불성립';
      category = 'special';
    }
  }

  const strength = calculateStructureStrength(fourPillars, primaryType, dayStrength);
  const purity = calculateStructurePurity(fourPillars, primaryType);

  return {
    primary: {
      type: primaryType,
      typeHanja: STRUCTURE_HANJA[primaryType],
      category,
      determinedBy,
      strength,
      purity,
    },
    isValid: primaryType !== '잡격',
    notes,
  };
}

/**
 * 격국 분석 요약 문자열
 */
export function summarizeStructure(analysis: StructureAnalysis): string {
  const { primary } = analysis;
  const strengthText = {
    'strong': '강',
    'moderate': '중',
    'weak': '약',
  };

  return `${primary.type}(${primary.typeHanja}) - ${strengthText[primary.strength]}`;
}
