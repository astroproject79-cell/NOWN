/**
 * 12운성(十二運星) 분석 모듈
 * 천간이 지지를 만났을 때의 생명 주기를 분석
 */

import { FourPillars } from '../types';
import {
  TwelveStage,
  TwelveStageInfo,
  TwelveStagesAnalysis,
} from '../types/twelveStages';
import {
  TWELVE_STAGES,
  TWELVE_STAGES_HANJA,
  TWELVE_STAGES_STRENGTH,
  TWELVE_STAGES_DESCRIPTION,
  STEM_TWELVE_STAGE_START,
  IS_YANG_STEM,
} from '../constants/twelveStages';

/**
 * 천간이 지지에서 받는 12운성 계산
 * @param stem 천간
 * @param branchIndex 지지 인덱스 (0-11)
 * @returns 12운성
 */
export function getTwelveStage(stem: string, branchIndex: number): TwelveStage {
  const startBranch = STEM_TWELVE_STAGE_START[stem];
  const isYang = IS_YANG_STEM[stem];

  let stageIndex: number;
  if (isYang) {
    // 양간: 순행
    stageIndex = (branchIndex - startBranch + 12) % 12;
  } else {
    // 음간: 역행
    stageIndex = (startBranch - branchIndex + 12) % 12;
  }

  return TWELVE_STAGES[stageIndex];
}

/**
 * 12운성 상세 정보 생성
 */
function createTwelveStageInfo(
  stem: string,
  branch: string,
  branchIndex: number,
  position: 'year' | 'month' | 'day' | 'hour'
): TwelveStageInfo {
  const stage = getTwelveStage(stem, branchIndex);

  return {
    stage,
    stageHanja: TWELVE_STAGES_HANJA[stage],
    position,
    stem,
    branch,
    strength: TWELVE_STAGES_STRENGTH[stage],
    description: TWELVE_STAGES_DESCRIPTION[stage],
  };
}

/**
 * 사주팔자 전체 12운성 분석
 * @param fourPillars 사주팔자
 * @returns 12운성 분석 결과
 */
export function analyzeTwelveStages(fourPillars: FourPillars): TwelveStagesAnalysis {
  const { year, month, day, hour } = fourPillars;
  const dayMaster = day.stem;

  // 각 주의 천간이 해당 주의 지지에서 받는 12운성
  const yearStage = createTwelveStageInfo(
    year.stem, year.branch, year.branchIndex, 'year'
  );
  const monthStage = createTwelveStageInfo(
    month.stem, month.branch, month.branchIndex, 'month'
  );
  const dayStage = createTwelveStageInfo(
    day.stem, day.branch, day.branchIndex, 'day'
  );
  const hourStage = createTwelveStageInfo(
    hour.stem, hour.branch, hour.branchIndex, 'hour'
  );

  // 일간이 각 지지에서 받는 12운성 (더 중요)
  const dayMasterYearBranch = createTwelveStageInfo(
    dayMaster, year.branch, year.branchIndex, 'year'
  );
  const dayMasterMonthBranch = createTwelveStageInfo(
    dayMaster, month.branch, month.branchIndex, 'month'
  );
  const dayMasterDayBranch = createTwelveStageInfo(
    dayMaster, day.branch, day.branchIndex, 'day'
  );
  const dayMasterHourBranch = createTwelveStageInfo(
    dayMaster, hour.branch, hour.branchIndex, 'hour'
  );

  // 요약 생성
  const allDayMasterStages = [
    dayMasterYearBranch,
    dayMasterMonthBranch,
    dayMasterDayBranch,
    dayMasterHourBranch,
  ];

  const strongStages = allDayMasterStages
    .filter(s => s.strength === 'strong')
    .map(s => s.stage);
  const weakStages = allDayMasterStages
    .filter(s => s.strength === 'weak')
    .map(s => s.stage);

  // 가장 많이 나타나는 운성 찾기
  const stageCounts = new Map<TwelveStage, number>();
  allDayMasterStages.forEach(s => {
    stageCounts.set(s.stage, (stageCounts.get(s.stage) || 0) + 1);
  });

  let dominantStage = allDayMasterStages[0].stage;
  let maxCount = 0;
  stageCounts.forEach((count, stage) => {
    if (count > maxCount) {
      maxCount = count;
      dominantStage = stage;
    }
  });

  return {
    year: yearStage,
    month: monthStage,
    day: dayStage,
    hour: hourStage,
    dayMasterStages: {
      yearBranch: dayMasterYearBranch,
      monthBranch: dayMasterMonthBranch,
      dayBranch: dayMasterDayBranch,
      hourBranch: dayMasterHourBranch,
    },
    summary: {
      strongStages: [...new Set(strongStages)],
      weakStages: [...new Set(weakStages)],
      dominantStage,
    },
  };
}

/**
 * 12운성 분석 요약 문자열 생성
 */
export function summarizeTwelveStages(analysis: TwelveStagesAnalysis): string {
  const { dayMasterStages, summary } = analysis;

  const parts: string[] = [
    `일간 12운성: 년${dayMasterStages.yearBranch.stage}, 월${dayMasterStages.monthBranch.stage}, 일${dayMasterStages.dayBranch.stage}, 시${dayMasterStages.hourBranch.stage}`,
  ];

  if (summary.strongStages.length > 0) {
    parts.push(`왕성한 운: ${summary.strongStages.join(', ')}`);
  }
  if (summary.weakStages.length > 0) {
    parts.push(`쇠약한 운: ${summary.weakStages.join(', ')}`);
  }

  return parts.join('\n');
}
