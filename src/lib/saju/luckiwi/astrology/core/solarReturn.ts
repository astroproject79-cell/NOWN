/**
 * 솔라 리턴 (연간 생일 차트) 계산 모듈
 */

import type {
  SolarReturnChart,
  SolarReturnOptions,
  NatalChart,
  BirthData,
  HouseShift,
  YearlyTheme,
  Aspect,
} from '../types';
import { calculateNatalChart, getPlanetFromChart } from './natalChart';
import {
  initializeEphemeris,
  dateToJulianDay,
  julianDayToDate,
  findSunReturnMoment,
} from './ephemeris';
import { calculateAspectBetween } from './aspects';
import { SIGNS } from '../constants/signs';
import { HOUSES } from '../constants/houses';

/**
 * 솔라 리턴 차트 계산
 */
export function calculateSolarReturn(
  natalChart: NatalChart,
  options: SolarReturnOptions
): SolarReturnChart {
  initializeEphemeris();

  const { year, location, houseSystem, mode } = options;

  // 1. 네이탈 태양 경도 확인
  const natalSun = getPlanetFromChart(natalChart, 'sun');
  if (!natalSun) {
    throw new Error('Natal sun position not found');
  }
  const natalSunLongitude = natalSun.longitude;

  // 2. 리턴 시점 탐색 시작점 (생일 전후)
  const birthMonth = natalChart.birthData.month;
  const birthDay = natalChart.birthData.day;

  // 시작점: 해당 연도 생일 3일 전
  const searchStartDate = new Date(year, birthMonth - 1, birthDay - 3);
  const startJd = dateToJulianDay(
    searchStartDate.getFullYear(),
    searchStartDate.getMonth() + 1,
    searchStartDate.getDate(),
    12,
    0,
    0
  );

  // 3. 정확한 솔라 리턴 시점 찾기
  const returnJd = findSunReturnMoment(natalSunLongitude, startJd);
  const returnDateTime = julianDayToDate(returnJd);

  // 4. 리턴 장소 결정
  const returnLocation = location || {
    latitude: natalChart.birthData.latitude,
    longitude: natalChart.birthData.longitude,
    timezone: natalChart.birthData.timezone,
  };

  // 5. 솔라 리턴 차트용 BirthData 생성
  const returnBirthData: BirthData = {
    year: returnDateTime.year,
    month: returnDateTime.month,
    day: returnDateTime.day,
    hour: returnDateTime.hour,
    minute: returnDateTime.minute,
    second: returnDateTime.second,
    latitude: returnLocation.latitude,
    longitude: returnLocation.longitude,
    timezone: returnLocation.timezone,
  };

  // 6. 솔라 리턴 차트 계산
  const returnChart = calculateNatalChart(returnBirthData, {
    mode,
    houseSystem,
  });

  // 7. 네이탈 대비 애스펙트 계산
  const aspectsToNatal = calculateAspectsToNatal(returnChart, natalChart);

  // 8. 하우스 변화 분석
  const houseShifts = analyzeHouseShifts(natalChart, returnChart);

  // 9. 연간 테마 분석
  const yearlyThemes = analyzeYearlyThemes(returnChart, houseShifts);

  // 리턴 시점을 Date 객체로 변환
  const returnMoment = new Date(
    returnDateTime.year,
    returnDateTime.month - 1,
    returnDateTime.day,
    returnDateTime.hour,
    returnDateTime.minute,
    returnDateTime.second
  );

  return {
    natalChart,
    returnYear: year,
    returnMoment,
    returnLocation,
    chart: returnChart,
    aspectsToNatal,
    houseShifts,
    yearlyThemes,
  };
}

/**
 * 복수 연도 솔라 리턴 계산
 */
export function calculateSolarReturnSeries(
  natalChart: NatalChart,
  startYear: number,
  endYear: number,
  options: Omit<SolarReturnOptions, 'year'>
): SolarReturnChart[] {
  const returns: SolarReturnChart[] = [];

  for (let year = startYear; year <= endYear; year++) {
    const solarReturn = calculateSolarReturn(natalChart, { ...options, year });
    returns.push(solarReturn);
  }

  return returns;
}

/**
 * 네이탈 대비 애스펙트 계산
 */
function calculateAspectsToNatal(
  returnChart: NatalChart,
  natalChart: NatalChart
): Aspect[] {
  const aspects: Aspect[] = [];

  // 리턴 차트의 주요 행성
  const returnPlanets = returnChart.planets.filter(
    (p) => p.id !== 'ascendant' && p.id !== 'midheaven' && p.id !== 'southNode'
  );

  // 네이탈 차트의 주요 행성
  const natalPlanets = natalChart.planets.filter(
    (p) => p.id !== 'ascendant' && p.id !== 'midheaven' && p.id !== 'southNode'
  );

  for (const returnPlanet of returnPlanets) {
    for (const natalPlanet of natalPlanets) {
      const aspect = calculateAspectBetween(returnPlanet, natalPlanet, {
        includeMajor: true,
        includeMinor: false,
      });

      if (aspect) {
        aspects.push(aspect);
      }
    }
  }

  return aspects.sort((a, b) => a.orb - b.orb);
}

/**
 * 하우스 변화 분석
 */
function analyzeHouseShifts(
  natalChart: NatalChart,
  returnChart: NatalChart
): HouseShift[] {
  const shifts: HouseShift[] = [];

  for (const natalPlanet of natalChart.planets) {
    if (natalPlanet.id === 'ascendant' || natalPlanet.id === 'midheaven') continue;

    const returnPlanet = getPlanetFromChart(returnChart, natalPlanet.id);
    if (!returnPlanet) continue;

    const isSignChange = natalPlanet.sign !== returnPlanet.sign;
    const isHouseChange = natalPlanet.house !== returnPlanet.house;

    if (isSignChange || isHouseChange) {
      shifts.push({
        planet: natalPlanet.id,
        natalHouse: natalPlanet.house || 0,
        returnHouse: returnPlanet.house || 0,
        natalSign: natalPlanet.sign,
        returnSign: returnPlanet.sign,
        isSignChange,
        isHouseChange,
      });
    }
  }

  return shifts;
}

/**
 * 연간 테마 분석
 */
function analyzeYearlyThemes(
  returnChart: NatalChart,
  houseShifts: HouseShift[]
): YearlyTheme {
  // 행성이 많이 모인 하우스 찾기
  const houseCounts: Record<number, number> = {};
  for (const planet of returnChart.planets) {
    if (planet.house) {
      houseCounts[planet.house] = (houseCounts[planet.house] || 0) + 1;
    }
  }

  const focusHouses = Object.entries(houseCounts)
    .filter(([_, count]) => count >= 2)
    .map(([house, _]) => parseInt(house))
    .sort((a, b) => (houseCounts[b] || 0) - (houseCounts[a] || 0));

  // ASC 사인
  const ascPlanet = getPlanetFromChart(returnChart, 'ascendant');
  const returnAscendant = ascPlanet?.sign || 'aries';

  // MC 사인
  const mcPlanet = getPlanetFromChart(returnChart, 'midheaven');
  const returnMidheaven = mcPlanet?.sign || 'capricorn';

  // 테마 생성
  const themes: string[] = [];
  const challenges: string[] = [];
  const opportunities: string[] = [];

  // 포커스 하우스 기반 테마
  for (const house of focusHouses.slice(0, 3)) {
    const houseInfo = HOUSES[house - 1];
    themes.push(`${houseInfo.nameKo} 영역 강조: ${houseInfo.lifeArea}`);
  }

  // 하우스 변화 기반 테마
  for (const shift of houseShifts) {
    if (shift.isHouseChange) {
      const newHouseInfo = HOUSES[shift.returnHouse - 1];
      if (['sun', 'moon', 'mercury', 'venus', 'mars'].includes(shift.planet)) {
        themes.push(`${shift.planet} ${newHouseInfo.nameKo}로 이동 → ${newHouseInfo.lifeArea} 변화`);
      }
    }
  }

  // ASC 테마
  const ascSignInfo = SIGNS[returnAscendant];
  const ascendantTheme = `올해의 표현 방식: ${ascSignInfo.nameKo} (${ascSignInfo.element} 원소)`;

  // MC 테마
  const mcSignInfo = SIGNS[returnMidheaven];
  const midheavenTheme = `커리어/공적 이미지: ${mcSignInfo.nameKo}`;

  return {
    focusHouses,
    themes,
    challenges,
    opportunities,
    returnAscendant,
    ascendantTheme,
    returnMidheaven,
    midheavenTheme,
  };
}

/**
 * 솔라 리턴 요약
 */
export function getSolarReturnSummary(solarReturn: SolarReturnChart): string[] {
  const summary: string[] = [];

  // 리턴 시점
  const moment = solarReturn.returnMoment;
  summary.push(
    `${solarReturn.returnYear}년 솔라 리턴: ${moment.getFullYear()}.${moment.getMonth() + 1}.${moment.getDate()}`
  );

  // ASC 사인
  const ascPlanet = getPlanetFromChart(solarReturn.chart, 'ascendant');
  if (ascPlanet) {
    const signInfo = SIGNS[ascPlanet.sign];
    summary.push(`올해의 상승점: ${signInfo.nameKo}`);
  }

  // 주요 포커스
  if (solarReturn.yearlyThemes?.focusHouses.length) {
    const houseNumbers = solarReturn.yearlyThemes.focusHouses.slice(0, 2).join(', ');
    summary.push(`주요 포커스 하우스: ${houseNumbers}하우스`);
  }

  // 주요 테마
  if (solarReturn.yearlyThemes?.themes.length) {
    summary.push(...solarReturn.yearlyThemes.themes.slice(0, 3));
  }

  return summary;
}
