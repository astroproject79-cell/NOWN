/**
 * 피르다리아 (페르시아 행성 주기) 계산 모듈
 *
 * 75년 사이클로 반복되는 행성 지배 주기 시스템
 * 주간/야간 출생에 따라 시작 행성이 다름
 */

import type {
  FirdariaResult,
  FirdariaPeriod,
  FirdariaRuler,
  FirdariaInterpretation,
  FirdariaTimeline,
  BirthData,
  NatalChart,
} from '../types';
import {
  FIRDARIA_PERIODS,
  DAY_BIRTH_ORDER,
  NIGHT_BIRTH_ORDER,
} from '../types/firdaria';
import { isNightBirth } from './natalChart';
import { PLANETS } from '../constants/planets';

/**
 * 피르다리아 계산
 */
export function calculateFirdaria(
  birthData: BirthData,
  natalChart: NatalChart
): FirdariaResult {
  // 1. 야간 출생 여부 판단
  const isNight = isNightBirth(natalChart);

  // 2. 순서 결정
  const order = isNight ? NIGHT_BIRTH_ORDER : DAY_BIRTH_ORDER;

  // 3. 출생일 계산
  const birthDate = new Date(
    birthData.year,
    birthData.month - 1,
    birthData.day,
    birthData.hour,
    birthData.minute
  );

  // 4. 현재 나이 계산
  const now = new Date();
  const ageInMs = now.getTime() - birthDate.getTime();
  const currentAge = ageInMs / (365.25 * 24 * 60 * 60 * 1000);

  // 5. 현재 사이클 번호 계산 (75년 기준)
  const currentCycle = Math.floor(currentAge / 75) + 1;

  // 6. 전체 주기 계산 (2사이클 = 150년)
  const majorPeriods = calculateMajorPeriods(birthDate, order, 2);

  // 7. 현재 주요 주기 찾기
  const currentMajorPeriod = findCurrentPeriod(majorPeriods, now);

  // 8. 현재 주요 주기의 서브피리어드 계산
  const subPeriods = calculateSubPeriods(currentMajorPeriod, order);

  // 9. 현재 서브피리어드 찾기
  const currentSubPeriod = findCurrentPeriod(subPeriods, now);

  // 10. 다음 주기 시작일 계산
  const nextMajorPeriodStart = findNextPeriodStart(majorPeriods, now);
  const nextSubPeriodStart = findNextPeriodStart(subPeriods, now);

  return {
    birthData,
    isNightBirth: isNight,
    totalCycle: 75,
    currentCycle,
    majorPeriods,
    currentMajorPeriod,
    currentSubPeriod,
    subPeriods,
    metadata: {
      calculatedAt: new Date().toISOString(),
      currentAge: Math.floor(currentAge),
      nextMajorPeriodStart,
      nextSubPeriodStart,
    },
  };
}

/**
 * 주요 주기 계산
 */
function calculateMajorPeriods(
  birthDate: Date,
  order: FirdariaRuler[],
  cycles: number
): FirdariaPeriod[] {
  const periods: FirdariaPeriod[] = [];
  let currentDate = new Date(birthDate);
  let currentAge = 0;

  for (let cycle = 0; cycle < cycles; cycle++) {
    for (const ruler of order) {
      const duration = FIRDARIA_PERIODS[ruler];
      const startDate = new Date(currentDate);
      const startAge = currentAge;

      // 종료일 계산
      currentDate = addYears(currentDate, duration);
      currentAge += duration;

      periods.push({
        ruler,
        startAge,
        endAge: currentAge,
        startDate,
        endDate: new Date(currentDate),
        duration,
      });
    }
  }

  return periods;
}

/**
 * 서브피리어드 계산 (주요 주기를 7등분)
 */
function calculateSubPeriods(
  majorPeriod: FirdariaPeriod,
  order: FirdariaRuler[]
): FirdariaPeriod[] {
  const subPeriods: FirdariaPeriod[] = [];
  const mainRulerIndex = order.indexOf(majorPeriod.ruler);
  const subDuration = majorPeriod.duration / 7;

  let currentDate = new Date(majorPeriod.startDate);
  let currentAge = majorPeriod.startAge;

  // 7개의 서브피리어드 (주 행성부터 시작하여 순환)
  // 노드는 서브피리어드에서 제외하고 행성만 순환
  const planetsOnly = order.filter(
    (r): r is Exclude<FirdariaRuler, 'northNode' | 'southNode'> =>
      r !== 'northNode' && r !== 'southNode'
  );

  for (let i = 0; i < 7; i++) {
    // 노드 주기의 경우, 서브피리어드는 태양부터 시작
    const isNodePeriod = majorPeriod.ruler === 'northNode' || majorPeriod.ruler === 'southNode';
    const majorIndex = isNodePeriod ? 0 : planetsOnly.indexOf(majorPeriod.ruler as Exclude<FirdariaRuler, 'northNode' | 'southNode'>);
    const subRulerIndex = (majorIndex + i) % planetsOnly.length;
    const subRuler = planetsOnly[subRulerIndex];

    const startDate = new Date(currentDate);
    const startAge = currentAge;

    currentDate = addYears(currentDate, subDuration);
    currentAge += subDuration;

    subPeriods.push({
      ruler: majorPeriod.ruler,
      subRuler,
      startAge,
      endAge: currentAge,
      startDate,
      endDate: new Date(currentDate),
      duration: subDuration,
    });
  }

  return subPeriods;
}

/**
 * 현재 주기 찾기
 */
function findCurrentPeriod(periods: FirdariaPeriod[], now: Date): FirdariaPeriod {
  for (const period of periods) {
    if (now >= period.startDate && now < period.endDate) {
      return {
        ...period,
        isCurrent: true,
        progress: calculateProgress(period, now),
      };
    }
  }

  // 마지막 주기 반환 (fallback)
  return periods[periods.length - 1];
}

/**
 * 다음 주기 시작일 찾기
 */
function findNextPeriodStart(periods: FirdariaPeriod[], now: Date): Date {
  for (const period of periods) {
    if (period.startDate > now) {
      return period.startDate;
    }
  }

  // 다음 사이클 첫 번째
  return periods[periods.length - 1].endDate;
}

/**
 * 진행률 계산 (0-100)
 */
function calculateProgress(period: FirdariaPeriod, now: Date): number {
  const totalDuration = period.endDate.getTime() - period.startDate.getTime();
  const elapsed = now.getTime() - period.startDate.getTime();
  return Math.min(100, Math.max(0, (elapsed / totalDuration) * 100));
}

/**
 * 년수 더하기 (윤년 고려)
 */
function addYears(date: Date, years: number): Date {
  const result = new Date(date);
  const wholYears = Math.floor(years);
  const fractionalDays = (years - wholYears) * 365.25;

  result.setFullYear(result.getFullYear() + wholYears);
  result.setDate(result.getDate() + Math.round(fractionalDays));

  return result;
}

/**
 * 피르다리아 해석 가져오기
 */
export function getFirdariaInterpretation(
  ruler: FirdariaRuler,
  subRuler?: FirdariaRuler
): FirdariaInterpretation {
  const interpretations: Record<FirdariaRuler, Partial<FirdariaInterpretation>> = {
    sun: {
      mainTheme: '자아 실현과 리더십',
      keywords: ['성공', '인정', '권위', '창조성', '활력'],
      lifeAreas: ['커리어', '자기표현', '건강', '아버지 관계'],
      advice: '자신의 빛을 발하고 리더십을 발휘할 시기입니다.',
    },
    moon: {
      mainTheme: '감정과 가정',
      keywords: ['변화', '직관', '돌봄', '가족', '감정'],
      lifeAreas: ['가정', '어머니 관계', '감정생활', '건강'],
      advice: '내면의 목소리에 귀 기울이고 가족과의 유대를 강화하세요.',
    },
    mercury: {
      mainTheme: '소통과 학습',
      keywords: ['소통', '학습', '여행', '거래', '기술'],
      lifeAreas: ['교육', '비즈니스', '형제 관계', '단거리 여행'],
      advice: '새로운 것을 배우고 네트워크를 확장할 최적의 시기입니다.',
    },
    venus: {
      mainTheme: '사랑과 예술',
      keywords: ['사랑', '아름다움', '재정', '조화', '즐거움'],
      lifeAreas: ['연애', '예술', '재정', '사교생활'],
      advice: '관계와 미적 감각을 발전시키고 삶의 즐거움을 누리세요.',
    },
    mars: {
      mainTheme: '행동과 에너지',
      keywords: ['행동', '용기', '경쟁', '에너지', '도전'],
      lifeAreas: ['커리어', '스포츠', '갈등 해결', '자기주장'],
      advice: '적극적으로 목표를 추구하되 분노를 조절하세요.',
    },
    jupiter: {
      mainTheme: '확장과 행운',
      keywords: ['행운', '성장', '지혜', '여행', '교육'],
      lifeAreas: ['고등교육', '해외', '법률', '철학', '종교'],
      advice: '새로운 기회를 잡고 시야를 넓힐 시기입니다.',
    },
    saturn: {
      mainTheme: '책임과 구조',
      keywords: ['책임', '제한', '성숙', '구조', '인내'],
      lifeAreas: ['커리어', '권위', '노후 준비', '장기 목표'],
      advice: '인내심을 갖고 장기적 토대를 다지세요. 어려움이 성장의 기회입니다.',
    },
    northNode: {
      mainTheme: '운명적 방향',
      keywords: ['운명', '성장', '새로운 경험', '영혼의 목적'],
      lifeAreas: ['영적 성장', '인생 방향', '새로운 시작'],
      advice: '익숙한 것에서 벗어나 새로운 방향으로 나아가세요.',
    },
    southNode: {
      mainTheme: '과거와 해방',
      keywords: ['과거', '카르마', '해방', '습관', '무의식'],
      lifeAreas: ['과거 정리', '습관 변화', '내면 작업'],
      advice: '과거의 패턴을 인식하고 필요 없는 것을 버릴 시기입니다.',
    },
  };

  const mainInterp = interpretations[ruler];
  const subInterp = subRuler ? interpretations[subRuler] : undefined;

  return {
    ruler,
    subRuler,
    mainTheme: mainInterp.mainTheme || '',
    subTheme: subInterp?.mainTheme,
    keywords: [...(mainInterp.keywords || []), ...(subInterp?.keywords || [])].slice(0, 8),
    lifeAreas: [...(mainInterp.lifeAreas || []), ...(subInterp?.lifeAreas || [])].slice(0, 6),
    advice: mainInterp.advice || '',
  };
}

/**
 * 타임라인 데이터 생성 (시각화용)
 */
export function createFirdariaTimeline(result: FirdariaResult): FirdariaTimeline {
  const colors: Record<FirdariaRuler, string> = {
    sun: '#FFD700',
    moon: '#C0C0C0',
    mercury: '#9370DB',
    venus: '#FF69B4',
    mars: '#DC143C',
    jupiter: '#4169E1',
    saturn: '#2F4F4F',
    northNode: '#32CD32',
    southNode: '#8B4513',
  };

  const periods = result.majorPeriods.slice(0, 9).map((period) => ({
    ruler: period.ruler,
    startYear: period.startDate.getFullYear(),
    endYear: period.endDate.getFullYear(),
    color: colors[period.ruler],
  }));

  const currentPosition = result.metadata.currentAge % 75;

  return {
    periods,
    currentPosition,
  };
}

/**
 * 피르다리아 요약
 */
export function getFirdariaSummary(result: FirdariaResult): string[] {
  const summary: string[] = [];

  const mainRulerInfo = PLANETS[result.currentMajorPeriod.ruler];
  const subRulerInfo = result.currentSubPeriod.subRuler
    ? PLANETS[result.currentSubPeriod.subRuler]
    : null;

  summary.push(`현재 나이: ${result.metadata.currentAge}세`);
  summary.push(
    `주요 지배 행성: ${mainRulerInfo.nameKo} (${Math.round(result.currentMajorPeriod.progress || 0)}% 진행)`
  );

  if (subRulerInfo) {
    summary.push(`서브 지배 행성: ${subRulerInfo.nameKo}`);
  }

  const interpretation = getFirdariaInterpretation(
    result.currentMajorPeriod.ruler,
    result.currentSubPeriod.subRuler
  );
  summary.push(`테마: ${interpretation.mainTheme}`);

  // 다음 주요 주기까지 남은 기간
  const daysToNext = Math.ceil(
    (result.metadata.nextMajorPeriodStart.getTime() - new Date().getTime()) /
      (1000 * 60 * 60 * 24)
  );
  const yearsToNext = (daysToNext / 365).toFixed(1);
  summary.push(`다음 주요 주기까지: ${yearsToNext}년`);

  return summary;
}
