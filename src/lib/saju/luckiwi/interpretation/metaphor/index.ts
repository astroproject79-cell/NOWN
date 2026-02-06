/**
 * 메타포 선택 모듈
 *
 * 일간 + 계절 + 조후 조합으로 중심 메타포를 결정합니다.
 */

import type {
  DayMasterImage,
  DayMasterSeasonMetaphor,
  MetaphorSelectionInput,
  SelectedMetaphor,
  HeavenlyStem,
} from './types';
import type { Season } from '../narrative/types';

import dayMastersData from './data/dayMasters.json';
import seasonalData from './data/seasonal.json';

// ============================================
// 상수
// ============================================

/**
 * 천간 → 한글 매핑
 */
const STEM_TO_KOREAN: Record<string, HeavenlyStem> = {
  갑: '갑',
  을: '을',
  병: '병',
  정: '정',
  무: '무',
  기: '기',
  경: '경',
  신: '신',
  임: '임',
  계: '계',
};

/**
 * 월지 → 계절 매핑
 */
const BRANCH_TO_SEASON: Record<string, Season> = {
  인: 'spring',
  묘: 'spring',
  진: 'spring', // 환절기지만 봄으로 분류
  사: 'summer',
  오: 'summer',
  미: 'summer', // 환절기지만 여름으로 분류
  신: 'autumn',
  유: 'autumn',
  술: 'autumn', // 환절기지만 가을로 분류
  해: 'winter',
  자: 'winter',
  축: 'winter', // 환절기지만 겨울로 분류
};

/**
 * 계절 한글명
 */
const SEASON_NAMES: Record<Season, string> = {
  spring: '봄',
  summer: '여름',
  autumn: '가을',
  winter: '겨울',
};

// ============================================
// 데이터 로더
// ============================================

/**
 * 일간 이미지 데이터 가져오기
 */
export function getDayMasterImage(stem: string): DayMasterImage | null {
  const koreanStem = STEM_TO_KOREAN[stem];
  if (!koreanStem) return null;

  const image = dayMastersData.images.find((img) => img.stem === koreanStem);
  return image as DayMasterImage | null;
}

/**
 * 일간×계절 메타포 데이터 가져오기
 */
export function getDayMasterSeasonMetaphor(
  stem: string,
  season: Season
): DayMasterSeasonMetaphor | null {
  const koreanStem = STEM_TO_KOREAN[stem];
  if (!koreanStem) return null;

  const metaphorId = `${koreanStem}_${season}`;
  const metaphor = seasonalData.metaphors.find((m) => m.id === metaphorId);
  return metaphor as DayMasterSeasonMetaphor | null;
}

/**
 * 월지로 계절 판단
 */
export function getSeasonFromBranch(branch: string): Season {
  return BRANCH_TO_SEASON[branch] || 'spring';
}

// ============================================
// 메타포 선택기
// ============================================

/**
 * 메타포 선택 메인 함수
 *
 * @param input - 메타포 선택 입력 데이터
 * @returns 선택된 메타포 결과
 */
export function selectMetaphor(
  input: MetaphorSelectionInput
): SelectedMetaphor | null {
  const { dayMaster, monthBranch } = input;

  // 1. 계절 판단
  const season = getSeasonFromBranch(monthBranch);

  // 2. 일간 기본 이미지 가져오기
  const dayMasterImage = getDayMasterImage(dayMaster);
  if (!dayMasterImage) {
    console.warn(`일간 이미지를 찾을 수 없습니다: ${dayMaster}`);
    return null;
  }

  // 3. 일간×계절 조합 메타포 가져오기
  let combinedMetaphor = getDayMasterSeasonMetaphor(dayMaster, season);

  // 4. 조합 메타포가 없으면 기본 메타포 생성
  if (!combinedMetaphor) {
    combinedMetaphor = generateDefaultMetaphor(dayMasterImage, season);
  }

  // 5. 계절 변형 정보 가져오기
  const seasonalVariation = seasonalData.seasons.find(
    (s) => s.season === season
  );

  // 6. 중심 이미지 생성
  const centralImage = `${SEASON_NAMES[season]}에 태어난 ${dayMasterImage.baseImage}`;

  // 7. 조후 조언 생성
  const climateAdvice = generateClimateAdvice(combinedMetaphor);

  return {
    dayMasterImage,
    seasonalVariation: seasonalVariation as any,
    combinedMetaphor,
    centralImage,
    climateAdvice,
  };
}

/**
 * 기본 메타포 생성 (데이터에 없는 조합용)
 */
function generateDefaultMetaphor(
  dayMasterImage: DayMasterImage,
  season: Season
): DayMasterSeasonMetaphor {
  const seasonName = SEASON_NAMES[season];

  return {
    dayMaster: dayMasterImage.stem as HeavenlyStem,
    season,
    id: `${dayMasterImage.stem}_${season}_default`,
    stateImage: `${seasonName}의 ${dayMasterImage.baseImage}`,
    tone: 'balanced',
    climateState: 'balanced',
    neededElement: null,
    metaphor: {
      situation: `당신은 ${seasonName}에 태어난 ${dayMasterImage.hanja}(${dayMasterImage.stem})입니다. ${dayMasterImage.naturalMetaphor}`,
      psychological: dayMasterImage.baseDescription,
      manifestation: `${dayMasterImage.positiveTraits.join(', ')}의 특성을 가지고 있습니다.`,
      hope: `당신의 장점을 살리고, ${dayMasterImage.negativeTraits[0]} 등의 단점을 보완하면 더욱 빛날 것입니다.`,
    },
  };
}

/**
 * 조후 조언 생성
 */
function generateClimateAdvice(metaphor: DayMasterSeasonMetaphor): string {
  if (!metaphor.neededElement) {
    return '현재 균형 잡힌 상태입니다. 기존의 강점을 유지하면서 발전해 나가세요.';
  }

  const elementAdvice: Record<string, string> = {
    목: '나무(木)의 기운이 필요합니다. 성장, 시작, 새로운 도전이 도움이 됩니다. 녹색 계열, 동쪽 방향, 봄철 활동이 좋습니다.',
    화: '불(火)의 기운이 필요합니다. 따뜻함, 열정, 밝은 에너지가 도움이 됩니다. 빨간색 계열, 남쪽 방향, 여름철 활동이 좋습니다.',
    토: '흙(土)의 기운이 필요합니다. 안정, 신뢰, 중심 잡기가 도움이 됩니다. 노란색/갈색 계열, 중앙, 환절기 활동이 좋습니다.',
    금: '금속(金)의 기운이 필요합니다. 결단, 정리, 마무리가 도움이 됩니다. 흰색/금색 계열, 서쪽 방향, 가을철 활동이 좋습니다.',
    수: '물(水)의 기운이 필요합니다. 휴식, 지혜, 내면 성찰이 도움이 됩니다. 검은색/파란색 계열, 북쪽 방향, 겨울철 활동이 좋습니다.',
  };

  return (
    elementAdvice[metaphor.neededElement] ||
    '자신에게 맞는 환경과 활동을 찾아보세요.'
  );
}

// ============================================
// 유틸리티 함수
// ============================================

/**
 * 모든 일간 이미지 가져오기
 */
export function getAllDayMasterImages(): DayMasterImage[] {
  return dayMastersData.images as DayMasterImage[];
}

/**
 * 모든 일간×계절 메타포 가져오기
 */
export function getAllSeasonalMetaphors(): DayMasterSeasonMetaphor[] {
  return seasonalData.metaphors as DayMasterSeasonMetaphor[];
}

/**
 * 계절 정보 가져오기
 */
export function getSeasonInfo(season: Season) {
  return seasonalData.seasons.find((s) => s.season === season);
}

// 타입 내보내기
export * from './types';
