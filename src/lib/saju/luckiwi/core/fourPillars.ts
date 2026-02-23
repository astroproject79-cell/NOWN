/**
 * 사주팔자(四柱八字) 통합 계산 모듈
 * 년주, 월주, 일주, 시주를 통합하여 사주팔자 생성
 */

import { calculateYearPillar, getEffectiveYear } from './yearPillar';
import { calculateMonthPillar, getSolarTermMonth } from './monthPillar';
import { calculateDayPillar } from './dayPillar';
import { calculateHourPillar } from './hourPillar';
import { isBeforeLichun } from './solarTermResolver';
import { getFullTimeCorrection, KOREA_CENTER_LONGITUDE } from './timeCorrection';
import { FourPillars, Pillar } from '../types';

/** 사주 계산 옵션 */
export interface FourPillarsOptions {
  /** 태양시 보정 적용 여부 (기본: true) */
  applySolarTimeCorrection?: boolean;
  /** 서머타임 보정 적용 여부 (기본: true) */
  applyDstCorrection?: boolean;
  /** 지역 경도 (기본: 127.5, 한반도 중심) */
  longitude?: number;
}

export interface FourPillarsResult {
  fourPillars: FourPillars;
  summary: {
    pillars: string;       // "갑자 을축 병인 정묘"
    pillarsHanja: string;  // "甲子 乙丑 丙寅 丁卯"
  };
  metadata: {
    solarTermMonth: number;      // 절기 기준 월 (1-12)
    isBeforeLichun: boolean;     // 입춘 전 여부
    effectiveYear: number;       // 실제 적용 연도
  };
  /** 시간 보정 정보 (보정 적용 시) */
  timeCorrection?: {
    original: { hour: number; minute: number };
    corrected: { hour: number; minute: number };
    dayOffset: number;
    correctionMinutes: number;
  };
}

/**
 * 사주팔자 계산
 *
 * @param year 연도 (양력)
 * @param month 월 (1-12)
 * @param day 일 (1-31)
 * @param hour 시 (0-23)
 * @param minute 분 (0-59, 기본값 0)
 * @param options 계산 옵션 (태양시 보정 등)
 * @returns 사주팔자 정보
 */
export function calculateFourPillars(
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number = 0,
  options: FourPillarsOptions = {}
): FourPillarsResult {
  const {
    applySolarTimeCorrection = true,
    applyDstCorrection = true,
    longitude = KOREA_CENTER_LONGITUDE,
  } = options;

  // 시간 보정 적용
  let calcYear = year;
  let calcMonth = month;
  let calcDay = day;
  let calcHour = hour;
  let calcMinute = minute;
  let timeCorrectionInfo: FourPillarsResult['timeCorrection'] = undefined;

  if (applySolarTimeCorrection || applyDstCorrection) {
    const correction = getFullTimeCorrection(
      year, month, day, hour, minute,
      {
        applySolarCorrection: applySolarTimeCorrection,
        applyDstCorrection: applyDstCorrection,
        longitude,
      }
    );

    calcHour = correction.hour;
    calcMinute = correction.minute;

    // 날짜 변경 처리 (태양시 보정에 의한 날짜 이동)
    if (correction.dayOffset !== 0) {
      const date = new Date(year, month - 1, day + correction.dayOffset);
      calcYear = date.getFullYear();
      calcMonth = date.getMonth() + 1;
      calcDay = date.getDate();
    }

    // 야자시 미적용: 보정 후 23시 이상이면 다음날 자시로 처리
    if (calcHour >= 23) {
      const nextDate = new Date(calcYear, calcMonth - 1, calcDay + 1);
      calcYear = nextDate.getFullYear();
      calcMonth = nextDate.getMonth() + 1;
      calcDay = nextDate.getDate();
      calcHour = 0;
    }

    timeCorrectionInfo = {
      original: { hour, minute },
      corrected: { hour: calcHour, minute: calcMinute },
      dayOffset: correction.dayOffset,
      correctionMinutes: correction.correctionApplied.total,
    };
  }

  // 1. 년주 계산 (입춘 기준)
  const yearPillar = calculateYearPillar(calcYear, calcMonth, calcDay, calcHour, calcMinute);

  // 2. 월주 계산 (절기 기준 + 년간 월건법)
  const monthPillar = calculateMonthPillar(
    yearPillar.stemIndex,
    calcYear,
    calcMonth,
    calcDay,
    calcHour,
    calcMinute
  );

  // 3. 일주 계산 (율리우스 적일 기반)
  const dayPillar = calculateDayPillar(calcYear, calcMonth, calcDay);

  // 4. 시주 계산 (일간 기준) - 보정된 시간 사용
  const hourPillar = calculateHourPillar(dayPillar.stemIndex, calcHour);

  // 메타데이터
  const solarTermMonth = getSolarTermMonth(calcYear, calcMonth, calcDay, calcHour, calcMinute);
  const beforeLichun = isBeforeLichun(calcYear, calcMonth, calcDay, calcHour, calcMinute);
  const effectiveYear = getEffectiveYear(calcYear, calcMonth, calcDay, calcHour, calcMinute);

  // 요약 생성
  const pillars = [yearPillar, monthPillar, dayPillar, hourPillar]
    .map(p => p.full)
    .join(' ');
  const pillarsHanja = [yearPillar, monthPillar, dayPillar, hourPillar]
    .map(p => p.fullHanja)
    .join(' ');

  const result: FourPillarsResult = {
    fourPillars: {
      year: yearPillar,
      month: monthPillar,
      day: dayPillar,
      hour: hourPillar,
    },
    summary: {
      pillars,
      pillarsHanja,
    },
    metadata: {
      solarTermMonth,
      isBeforeLichun: beforeLichun,
      effectiveYear,
    },
  };

  if (timeCorrectionInfo) {
    result.timeCorrection = timeCorrectionInfo;
  }

  return result;
}

// 개별 모듈 내보내기
export { calculateYearPillar } from './yearPillar';
export { calculateMonthPillar } from './monthPillar';
export { calculateDayPillar } from './dayPillar';
export { calculateHourPillar } from './hourPillar';
