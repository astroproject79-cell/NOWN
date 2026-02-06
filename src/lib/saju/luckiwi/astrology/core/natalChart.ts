/**
 * 네이탈 차트 통합 계산 모듈
 */

import type {
  NatalChart,
  NatalChartOptions,
  BirthData,
  ChartMetadata,
  ChartSummary,
  PlanetDistribution,
  PlanetPosition,
} from '../types';
import { DEFAULT_CHART_OPTIONS } from '../types/chart';
import {
  initializeEphemeris,
  dateToJulianDay,
  calculateObliquity,
  calculateSiderealTime,
  isNightChart,
  getEphemerisVersion,
} from './ephemeris';
import { localToUTC } from './timezone';
import { calculateAllPlanets, assignHousesToPlanets, calculatePlanetDistribution } from './planets';
import { calculateAllHouses, getHouseCuspLongitudes } from './houses';
import { calculateAllAspects, detectAspectPatterns } from './aspects';
import { SIGNS } from '../constants/signs';

/**
 * 네이탈 차트 계산
 */
export function calculateNatalChart(
  birthData: BirthData,
  options: Partial<NatalChartOptions> = {}
): NatalChart {
  initializeEphemeris();

  // 옵션 병합
  const chartOptions: NatalChartOptions = {
    ...DEFAULT_CHART_OPTIONS,
    ...options,
  };

  // 1. 로컬 시간을 UTC로 변환
  const utcTime = localToUTC(
    birthData.year,
    birthData.month,
    birthData.day,
    birthData.hour,
    birthData.minute,
    birthData.second || 0,
    birthData.timezone
  );

  // 2. UTC 기준 율리우스 적일 계산
  const julianDay = dateToJulianDay(
    utcTime.year,
    utcTime.month,
    utcTime.day,
    utcTime.hour,
    utcTime.minute,
    utcTime.second
  );

  // 3. 하우스 계산
  const houses = calculateAllHouses(
    julianDay,
    birthData.latitude,
    birthData.longitude,
    chartOptions.houseSystem
  );

  // 4. 행성 위치 계산
  let planets = calculateAllPlanets(julianDay, chartOptions.mode, {
    includeLunarNodes: chartOptions.includeLunarNodes,
    includeChiron: chartOptions.includeChiron,
    houseData: {
      cusps: getHouseCuspLongitudes(houses),
      ascendant: houses.ascendant,
      midheaven: houses.midheaven,
      armc: 0,
      vertex: houses.vertex || 0,
      equatorialAscendant: houses.eastPoint || 0,
      coAscendantKoch: 0,
      coAscendantMunkasey: 0,
      polarAscendant: 0,
    },
  });

  // 5. 행성에 하우스 할당
  planets = assignHousesToPlanets(planets, getHouseCuspLongitudes(houses));

  // 6. 애스펙트 계산
  const aspects = calculateAllAspects(planets, chartOptions.mode, {
    includeMinor: chartOptions.includeMinorAspects,
  });

  // 7. 애스펙트 패턴 감지
  const patterns = detectAspectPatterns(planets, aspects);

  // 8. 추가 천문 데이터
  const siderealTime = calculateSiderealTime(julianDay);
  const obliquity = calculateObliquity(julianDay);

  // 9. 메타데이터
  const sunPosition = planets.find((p) => p.id === 'sun');
  const metadata: ChartMetadata = {
    calculatedAt: new Date().toISOString(),
    ephemerisVersion: getEphemerisVersion(),
    timezone: birthData.timezone,
    utcOffset: utcTime.offsetMinutes,
    isNightChart: sunPosition ? isNightChart(sunPosition.longitude, houses.ascendant) : false,
  };

  return {
    birthData,
    options: chartOptions,
    julianDay,
    siderealTime,
    obliquity,
    planets,
    houses,
    aspects,
    patterns,
    metadata,
  };
}

/**
 * 차트 요약 생성
 */
export function getChartSummary(chart: NatalChart): ChartSummary {
  const sun = chart.planets.find((p) => p.id === 'sun');
  const moon = chart.planets.find((p) => p.id === 'moon');
  const asc = chart.planets.find((p) => p.id === 'ascendant');

  const distribution = calculatePlanetDistribution(chart.planets);

  // 지배적 원소 찾기
  const elementCounts = Object.entries(distribution.byElement);
  const dominantElement = elementCounts.reduce((a, b) =>
    a[1].length > b[1].length ? a : b
  )[0] as 'fire' | 'earth' | 'air' | 'water';

  // 지배적 성질 찾기
  const modalityCounts = Object.entries(distribution.byModality);
  const dominantModality = modalityCounts.reduce((a, b) =>
    a[1].length > b[1].length ? a : b
  )[0] as 'cardinal' | 'fixed' | 'mutable';

  return {
    sunSign: sun?.sign || 'aries',
    moonSign: moon?.sign || 'aries',
    ascendant: asc?.sign || 'aries',
    dominantElement,
    dominantModality,
    chartPattern: chart.patterns?.[0],
  };
}

/**
 * 행성 분포 계산
 */
export function getChartDistribution(chart: NatalChart): PlanetDistribution {
  return calculatePlanetDistribution(chart.planets);
}

/**
 * 차트를 텍스트로 포맷
 */
export function formatChart(chart: NatalChart): string {
  const lines: string[] = [];

  lines.push('=== 네이탈 차트 ===');
  lines.push('');

  // 출생 정보
  lines.push('출생 정보:');
  lines.push(
    `  ${chart.birthData.year}년 ${chart.birthData.month}월 ${chart.birthData.day}일 ${chart.birthData.hour}:${String(chart.birthData.minute).padStart(2, '0')}`
  );
  lines.push(
    `  위치: ${chart.birthData.latitude.toFixed(4)}, ${chart.birthData.longitude.toFixed(4)}`
  );
  lines.push('');

  // 행성 위치
  lines.push('행성 위치:');
  for (const planet of chart.planets) {
    const signInfo = SIGNS[planet.sign];
    const retrograde = planet.isRetrograde ? ' R' : '';
    const house = planet.house ? ` (${planet.house}하우스)` : '';
    lines.push(
      `  ${planet.id}: ${signInfo.nameKo} ${planet.signDegree}°${planet.signMinute}'${retrograde}${house}`
    );
  }
  lines.push('');

  // 하우스
  lines.push('하우스 커스프:');
  for (const cusp of chart.houses.cusps) {
    const signInfo = SIGNS[cusp.sign];
    lines.push(`  ${cusp.house}하우스: ${signInfo.nameKo} ${cusp.signDegree}°${cusp.signMinute}'`);
  }
  lines.push('');

  // 주요 애스펙트
  lines.push('주요 애스펙트:');
  const majorAspects = chart.aspects.filter((a) => a.strength !== 'wide').slice(0, 10);
  for (const aspect of majorAspects) {
    const orb = aspect.orb.toFixed(1);
    const applying = aspect.isApplying ? 'A' : 'S';
    lines.push(`  ${aspect.planet1} ${aspect.type} ${aspect.planet2} (${orb}° ${applying})`);
  }

  return lines.join('\n');
}

/**
 * 야간 차트 여부 확인
 */
export function isNightBirth(chart: NatalChart): boolean {
  return chart.metadata.isNightChart;
}

/**
 * 특정 행성 위치 조회
 */
export function getPlanetFromChart(chart: NatalChart, planetId: string): PlanetPosition | undefined {
  return chart.planets.find((p) => p.id === planetId);
}
