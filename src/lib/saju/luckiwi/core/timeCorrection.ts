/**
 * 태양시 보정 모듈
 *
 * 한국 표준시(KST)는 동경 135도 기준이지만,
 * 한반도는 동경 127.5도에 위치하여 약 30분의 시차가 발생.
 * 사주의 시주는 태양시(진태양시) 기준이므로 보정이 필요.
 */

/**
 * 기본 보정 시간 (분)
 * 동경 135도 - 동경 127.5도 = 7.5도
 * 경도 1도 = 4분 → 7.5도 = 30분
 */
export const DEFAULT_CORRECTION_MINUTES = 32;

/**
 * 지역별 경도 (대략적)
 */
export const REGION_LONGITUDES: Record<string, number> = {
  seoul: 126.98,      // 서울
  busan: 129.03,      // 부산
  daegu: 128.60,      // 대구
  incheon: 126.70,    // 인천
  gwangju: 126.85,    // 광주
  daejeon: 127.38,    // 대전
  ulsan: 129.31,      // 울산
  sejong: 127.29,     // 세종
  jeju: 126.53,       // 제주
};


const EQT_TABLE: Array<{ month: number; day: number; minutes: number }> = [
  { month: 1, day: 1, minutes: -3 },
  { month: 1, day: 15, minutes: -9 },
  { month: 1, day: 30, minutes: -13 },
  { month: 2, day: 15, minutes: -14 },
  { month: 2, day: 28, minutes: -13 },
  { month: 3, day: 15, minutes: -9 },
  { month: 3, day: 30, minutes: -5 },
  { month: 4, day: 15, minutes: 0 },
  { month: 4, day: 30, minutes: 3 },
  { month: 5, day: 15, minutes: 4 },
  { month: 5, day: 30, minutes: 3 },
  { month: 6, day: 15, minutes: 0 },
  { month: 6, day: 30, minutes: -3 },
  { month: 7, day: 15, minutes: -6 },
  { month: 7, day: 30, minutes: -6 },
  { month: 8, day: 15, minutes: -4 },
  { month: 8, day: 30, minutes: -1 },
  { month: 9, day: 15, minutes: 4 },
  { month: 9, day: 30, minutes: 10 },
  { month: 10, day: 15, minutes: 14 },
  { month: 10, day: 30, minutes: 16 },
  { month: 11, day: 15, minutes: 15 },
  { month: 11, day: 30, minutes: 11 },
  { month: 12, day: 15, minutes: 5 },
  { month: 12, day: 30, minutes: -2 },
];

function dayOfYear(month: number, day: number): number {
  const daysInMonth = [0, 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  let doy = 0;
  for (let m = 1; m < month; m++) doy += daysInMonth[m];
  return doy + day;
}

export function getEquationOfTime(month: number, day: number): number {
  const targetDoy = dayOfYear(month, day);
  let before = EQT_TABLE[0];
  let after = EQT_TABLE[EQT_TABLE.length - 1];

  for (let i = 0; i < EQT_TABLE.length - 1; i++) {
    const bDoy = dayOfYear(EQT_TABLE[i].month, EQT_TABLE[i].day);
    const aDoy = dayOfYear(EQT_TABLE[i + 1].month, EQT_TABLE[i + 1].day);
    if (targetDoy >= bDoy && targetDoy <= aDoy) {
      before = EQT_TABLE[i];
      after = EQT_TABLE[i + 1];
      break;
    }
  }

  const bDoy = dayOfYear(before.month, before.day);
  const aDoy = dayOfYear(after.month, after.day);
  const range = aDoy - bDoy;
  if (range === 0) return before.minutes;

  const ratio = (targetDoy - bDoy) / range;
  return Math.round(before.minutes + (after.minutes - before.minutes) * ratio);
}

/**
 * 기준 경도
 */
export const STANDARD_LONGITUDE = 135;      // 한국 표준시 기준 (동경 135도)
export const KOREA_CENTER_LONGITUDE = 126.98; // 서울 기준 경도

/**
 * 경도 차이를 분 단위 시간 차이로 변환
 * 경도 1도 = 4분
 */
export function longitudeToMinutes(longitudeDiff: number): number {
  return longitudeDiff * 4;
}

/**
 * 지역 경도 기반 보정 시간 계산 (분)
 *
 * @param longitude 지역 경도 (기본값: 한반도 중심 127.5도)
 * @returns 보정할 분 수 (양수 = 시간을 빼야 함)
 */
export function getRegionCorrectionMinutes(longitude: number = KOREA_CENTER_LONGITUDE): number {
  return longitudeToMinutes(STANDARD_LONGITUDE - longitude);
}

/**
 * 시간 보정 적용
 *
 * @param hour 시 (0-23)
 * @param minute 분 (0-59)
 * @param correctionMinutes 보정할 분 수 (기본값: 30분)
 * @returns 보정된 { hour, minute, dayOffset }
 *          dayOffset: -1 = 전날, 0 = 당일, 1 = 다음날
 */
export function applyTimeCorrection(
  hour: number,
  minute: number,
  correctionMinutes: number = DEFAULT_CORRECTION_MINUTES
): { hour: number; minute: number; dayOffset: number } {
  // 총 분으로 변환
  let totalMinutes = hour * 60 + minute - correctionMinutes;

  // 날짜 경계 처리
  let dayOffset = 0;

  if (totalMinutes < 0) {
    // 전날로 넘어감
    totalMinutes += 24 * 60;
    dayOffset = -1;
  } else if (totalMinutes >= 24 * 60) {
    // 다음날로 넘어감
    totalMinutes -= 24 * 60;
    dayOffset = 1;
  }

  const correctedHour = Math.floor(totalMinutes / 60);
  const correctedMinute = totalMinutes % 60;

  return {
    hour: correctedHour,
    minute: correctedMinute,
    dayOffset,
  };
}

/**
 * 서머타임 적용 기간 확인 (역사적 기록)
 *
 * 한국 서머타임 시행 기간:
 * - 1948-1951, 1955-1960, 1987-1988
 *
 * @param year 연도
 * @param month 월
 * @param day 일
 * @returns 서머타임 적용 여부
 */
export function isDaylightSavingTime(year: number, month: number, day: number): boolean {
  // 서머타임 시행 연도
  const dstYears = [1948, 1949, 1950, 1951, 1955, 1956, 1957, 1958, 1959, 1960, 1987, 1988];

  if (!dstYears.includes(year)) {
    return false;
  }

  // 대략적인 서머타임 기간 (5월~9월)
  // 정확한 날짜는 연도별로 다르지만, 대략 5월 초 ~ 9월 중순
  if (month >= 5 && month <= 9) {
    return true;
  }

  return false;
}

/**
 * 전체 시간 보정 (태양시 + 서머타임)
 *
 * @param year 연도
 * @param month 월
 * @param day 일
 * @param hour 시
 * @param minute 분
 * @param options 옵션
 * @returns 보정된 시간 정보
 */
export function getFullTimeCorrection(
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number,
  options: {
    applySolarCorrection?: boolean;  // 태양시 보정 (기본: true)
    applyDstCorrection?: boolean;    // 서머타임 보정 (기본: true)
    longitude?: number;              // 지역 경도 (기본: 127.5)
  } = {}
): {
  hour: number;
  minute: number;
  dayOffset: number;
  correctionApplied: {
    solar: number;   // 태양시 보정 분
    dst: number;     // 서머타임 보정 분
    total: number;   // 총 보정 분
  };
} {
  const {
    applySolarCorrection = true,
    applyDstCorrection = true,
    longitude = KOREA_CENTER_LONGITUDE,
  } = options;

  let totalCorrectionMinutes = 0;
  let solarCorrection = 0;
  let dstCorrection = 0;

  // 태양시 보정 (경도 + 균시차)
  let eqtCorrection = 0;
  if (applySolarCorrection) {
    solarCorrection = getRegionCorrectionMinutes(longitude);
    eqtCorrection = getEquationOfTime(month, day);
    totalCorrectionMinutes += solarCorrection - eqtCorrection;
  }

  // 서머타임 보정 (서머타임 적용 시 추가 60분 보정)
  if (applyDstCorrection && isDaylightSavingTime(year, month, day)) {
    dstCorrection = 60;
    totalCorrectionMinutes += dstCorrection;
  }

  const result = applyTimeCorrection(hour, minute, totalCorrectionMinutes);

  return {
    ...result,
    correctionApplied: {
      solar: solarCorrection,
      eqt: eqtCorrection,
      dst: dstCorrection,
      total: totalCorrectionMinutes,
    },
  };
}
