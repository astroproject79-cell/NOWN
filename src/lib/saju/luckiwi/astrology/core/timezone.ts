/**
 * 타임존 변환 유틸리티
 *
 * IANA 타임존 문자열을 사용하여 로컬 시간을 UTC로 변환
 */

/**
 * 특정 타임존의 UTC 오프셋(분) 계산
 *
 * @param timezone IANA 타임존 문자열 (예: 'Asia/Seoul')
 * @param date 기준 날짜 (DST 적용을 위해 필요)
 * @returns UTC 오프셋 (분 단위, 예: Asia/Seoul = 540)
 */
export function getTimezoneOffsetMinutes(timezone: string, date: Date): number {
  try {
    // 타임존에서의 시간과 UTC 시간을 비교하여 오프셋 계산
    const utcDate = new Date(
      date.toLocaleString('en-US', { timeZone: 'UTC' })
    );
    const tzDate = new Date(
      date.toLocaleString('en-US', { timeZone: timezone })
    );

    // 오프셋 = 타임존 시간 - UTC 시간 (분 단위)
    return (tzDate.getTime() - utcDate.getTime()) / (1000 * 60);
  } catch {
    // 잘못된 타임존의 경우 UTC로 간주
    console.warn(`Invalid timezone: ${timezone}, using UTC`);
    return 0;
  }
}

/**
 * 로컬 시간을 UTC로 변환
 *
 * @param year 연도
 * @param month 월 (1-12)
 * @param day 일 (1-31)
 * @param hour 시 (0-23)
 * @param minute 분 (0-59)
 * @param second 초 (0-59)
 * @param timezone IANA 타임존 문자열
 * @returns UTC 기준 시간
 */
export function localToUTC(
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number,
  second: number,
  timezone: string
): {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
  offsetMinutes: number;
} {
  // 로컬 시간으로 Date 객체 생성 (UTC 기준으로 생성)
  const localDate = new Date(Date.UTC(year, month - 1, day, hour, minute, second));

  // 타임존 오프셋 계산
  const offsetMinutes = getTimezoneOffsetMinutes(timezone, localDate);

  // UTC 시간 계산 (로컬 - 오프셋 = UTC)
  const utcMs = localDate.getTime() - offsetMinutes * 60 * 1000;
  const utcDate = new Date(utcMs);

  return {
    year: utcDate.getUTCFullYear(),
    month: utcDate.getUTCMonth() + 1,
    day: utcDate.getUTCDate(),
    hour: utcDate.getUTCHours(),
    minute: utcDate.getUTCMinutes(),
    second: utcDate.getUTCSeconds(),
    offsetMinutes,
  };
}

/**
 * UTC를 로컬 시간으로 변환
 */
export function utcToLocal(
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number,
  second: number,
  timezone: string
): {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
} {
  const utcDate = new Date(Date.UTC(year, month - 1, day, hour, minute, second));
  const offsetMinutes = getTimezoneOffsetMinutes(timezone, utcDate);

  const localMs = utcDate.getTime() + offsetMinutes * 60 * 1000;
  const localDate = new Date(localMs);

  return {
    year: localDate.getUTCFullYear(),
    month: localDate.getUTCMonth() + 1,
    day: localDate.getUTCDate(),
    hour: localDate.getUTCHours(),
    minute: localDate.getUTCMinutes(),
    second: localDate.getUTCSeconds(),
  };
}

/**
 * 일반적인 타임존 오프셋 (DST가 없는 타임존용 캐시)
 * 주의: DST가 있는 타임존은 동적으로 계산해야 함
 */
export const COMMON_TIMEZONE_OFFSETS: Readonly<Record<string, number>> = {
  'UTC': 0,
  'GMT': 0,
  'Asia/Seoul': 540,        // +9:00 (DST 없음)
  'Asia/Tokyo': 540,        // +9:00 (DST 없음)
  'Asia/Shanghai': 480,     // +8:00 (DST 없음)
  'Asia/Hong_Kong': 480,    // +8:00 (DST 없음)
  'Asia/Singapore': 480,    // +8:00 (DST 없음)
} as const;

/**
 * 주어진 날짜에 대해 타임존 오프셋을 가져옴 (DST 고려)
 */
export function getTimezoneOffset(timezone: string, date: Date): number {
  // DST가 없는 타임존은 캐시에서 바로 반환
  if (timezone in COMMON_TIMEZONE_OFFSETS) {
    return COMMON_TIMEZONE_OFFSETS[timezone as keyof typeof COMMON_TIMEZONE_OFFSETS];
  }
  // DST가 있을 수 있는 타임존은 동적 계산
  return getTimezoneOffsetMinutes(timezone, date);
}
