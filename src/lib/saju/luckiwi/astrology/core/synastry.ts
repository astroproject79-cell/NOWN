/**
 * 시나스트리 (궁합) 계산 모듈
 */

import type {
  SynastryResult,
  SynastryAspect,
  SynastryOptions,
  HouseOverlay,
  CompatibilityScore,
  NatalChart,
  BirthData,
  PlanetId,
} from '../types';
import { calculateNatalChart } from './natalChart';
import { calculateAspectBetween } from './aspects';
import { getHouseForLongitude } from './planets';
import { getHouseCuspLongitudes } from './houses';
import { PLANETS } from '../constants/planets';

/**
 * 시나스트리 계산
 */
export function calculateSynastry(
  person1Data: BirthData,
  person2Data: BirthData,
  options: Partial<SynastryOptions> = {}
): SynastryResult {
  const chartOptions = {
    mode: options.mode || 'modern',
    houseSystem: options.houseSystem || 'placidus',
    includeLunarNodes: options.includeLunarNodes,
    includeChiron: options.includeChiron,
  };

  // 1. 각각의 네이탈 차트 계산
  const chart1 = calculateNatalChart(person1Data, chartOptions);
  const chart2 = calculateNatalChart(person2Data, chartOptions);

  // 2. 크로스 애스펙트 계산
  const aspects = calculateCrossAspects(chart1, chart2, options.includeMinorAspects || false);

  // 3. 하우스 오버레이 계산
  const person1InPerson2Houses = calculateHouseOverlays(chart1, chart2);
  const person2InPerson1Houses = calculateHouseOverlays(chart2, chart1);

  // 4. 합성 차트 (선택)
  const compositeChart = options.includeComposite
    ? calculateCompositeChart(chart1, chart2)
    : undefined;

  // 5. 데이비슨 차트 (선택)
  const davisonChart = options.includeDavison
    ? calculateDavisonChart(person1Data, person2Data, chartOptions)
    : undefined;

  // 6. 궁합 점수 계산
  const compatibility = calculateCompatibilityScore(aspects, person1InPerson2Houses, person2InPerson1Houses);

  return {
    person1: chart1,
    person2: chart2,
    aspects,
    person1InPerson2Houses,
    person2InPerson1Houses,
    compositeChart,
    davisonChart,
    compatibility,
  };
}

/**
 * 크로스 애스펙트 계산 (두 차트 간)
 */
function calculateCrossAspects(
  chart1: NatalChart,
  chart2: NatalChart,
  includeMinor: boolean
): SynastryAspect[] {
  const aspects: SynastryAspect[] = [];

  // 주요 행성만 사용 (ASC/MC 제외)
  const planets1 = chart1.planets.filter(
    (p) => p.id !== 'ascendant' && p.id !== 'midheaven' && p.id !== 'southNode'
  );
  const planets2 = chart2.planets.filter(
    (p) => p.id !== 'ascendant' && p.id !== 'midheaven' && p.id !== 'southNode'
  );

  for (const p1 of planets1) {
    for (const p2 of planets2) {
      const aspect = calculateAspectBetween(p1, p2, {
        includeMajor: true,
        includeMinor,
      });

      if (aspect) {
        aspects.push({
          ...aspect,
          person1Planet: p1.id,
          person2Planet: p2.id,
        });
      }
    }
  }

  // 오브 순 정렬
  return aspects.sort((a, b) => a.orb - b.orb);
}

/**
 * 하우스 오버레이 계산
 * A의 행성이 B의 어느 하우스에 위치하는지
 */
function calculateHouseOverlays(
  chartA: NatalChart,
  chartB: NatalChart
): HouseOverlay[] {
  const overlays: HouseOverlay[] = [];
  const houseCusps = getHouseCuspLongitudes(chartB.houses);

  for (const planet of chartA.planets) {
    if (planet.id === 'ascendant' || planet.id === 'midheaven') continue;

    const house = getHouseForLongitude(planet.longitude, houseCusps);

    overlays.push({
      planetId: planet.id,
      house,
      sign: planet.sign,
    });
  }

  return overlays;
}

/**
 * 합성 차트 계산 (중점 방식)
 */
function calculateCompositeChart(
  chart1: NatalChart,
  chart2: NatalChart
): NatalChart {
  // 모든 행성의 중점 계산
  const midpointPlanets = chart1.planets.map((p1) => {
    const p2 = chart2.planets.find((p) => p.id === p1.id);
    if (!p2) return p1;

    // 중점 경도 계산 (짧은 호 사용)
    let long1 = p1.longitude;
    let long2 = p2.longitude;

    if (Math.abs(long2 - long1) > 180) {
      if (long1 < long2) long1 += 360;
      else long2 += 360;
    }

    const midpoint = ((long1 + long2) / 2) % 360;

    return {
      ...p1,
      longitude: midpoint,
    };
  });

  // 중점 기준으로 차트 재계산
  const midBirthData: BirthData = {
    ...chart1.birthData,
    // 위치도 중점 사용
    latitude: (chart1.birthData.latitude + chart2.birthData.latitude) / 2,
    longitude: (chart1.birthData.longitude + chart2.birthData.longitude) / 2,
  };

  // 실제 구현에서는 중점 행성으로 차트 재구성
  // 여기서는 간단히 chart1 기반으로 반환
  return {
    ...chart1,
    birthData: midBirthData,
    planets: midpointPlanets as any,
  };
}

/**
 * 데이비슨 차트 계산 (시간/공간 중점)
 */
function calculateDavisonChart(
  person1Data: BirthData,
  person2Data: BirthData,
  options: any
): NatalChart {
  // 날짜 중점 계산
  const date1 = new Date(
    person1Data.year,
    person1Data.month - 1,
    person1Data.day,
    person1Data.hour,
    person1Data.minute
  );
  const date2 = new Date(
    person2Data.year,
    person2Data.month - 1,
    person2Data.day,
    person2Data.hour,
    person2Data.minute
  );

  const midTime = new Date((date1.getTime() + date2.getTime()) / 2);

  // 위치 중점 계산
  const midLat = (person1Data.latitude + person2Data.latitude) / 2;
  const midLong = (person1Data.longitude + person2Data.longitude) / 2;

  const midBirthData: BirthData = {
    year: midTime.getFullYear(),
    month: midTime.getMonth() + 1,
    day: midTime.getDate(),
    hour: midTime.getHours(),
    minute: midTime.getMinutes(),
    latitude: midLat,
    longitude: midLong,
    timezone: person1Data.timezone, // 첫 번째 사람의 타임존 사용
  };

  return calculateNatalChart(midBirthData, options);
}

/**
 * 궁합 점수 계산
 */
function calculateCompatibilityScore(
  aspects: SynastryAspect[],
  overlays1: HouseOverlay[],
  overlays2: HouseOverlay[]
): CompatibilityScore {
  let attraction = 50;
  let communication = 50;
  let emotional = 50;
  let longevity = 50;
  let harmony = 50;
  let challenge = 50;

  const aspectBreakdown: CompatibilityScore['aspectBreakdown'] = [];

  // 애스펙트 기반 점수 계산
  for (const aspect of aspects) {
    const weight = aspect.strength === 'exact' ? 3 : aspect.strength === 'close' ? 2 : 1;
    const isHarmonious = aspect.nature === 'harmonious';
    const score = isHarmonious ? weight * 5 : -weight * 3;

    // 관련 영역에 점수 추가
    const planets = [aspect.person1Planet, aspect.person2Planet];

    // 금성-화성 = 끌림
    if (planets.includes('venus') || planets.includes('mars')) {
      attraction += score;
      aspectBreakdown.push({
        type: aspect.type,
        planets: `${aspect.person1Planet}-${aspect.person2Planet}`,
        score,
        description: isHarmonious ? '강한 끌림' : '마찰적 끌림',
      });
    }

    // 수성 = 소통
    if (planets.includes('mercury')) {
      communication += score;
    }

    // 달 = 감정
    if (planets.includes('moon')) {
      emotional += score;
    }

    // 토성 = 지속성
    if (planets.includes('saturn')) {
      longevity += isHarmonious ? score : -score; // 토성은 하모니일 때 좋음
    }

    // 전체 조화
    harmony += isHarmonious ? weight * 2 : -weight;
    challenge += isHarmonious ? -weight : weight * 2;
  }

  // 0-100 범위로 정규화
  const normalize = (val: number) => Math.max(0, Math.min(100, val));

  const scores = {
    attraction: normalize(attraction),
    communication: normalize(communication),
    emotional: normalize(emotional),
    longevity: normalize(longevity),
    harmony: normalize(harmony),
    challenge: normalize(challenge),
  };

  // 종합 점수
  const overall =
    (scores.attraction * 0.2 +
      scores.communication * 0.15 +
      scores.emotional * 0.25 +
      scores.longevity * 0.15 +
      scores.harmony * 0.25) /
    1;

  return {
    overall: Math.round(overall),
    ...scores,
    aspectBreakdown: aspectBreakdown.slice(0, 10), // 상위 10개
  };
}

/**
 * 시나스트리 요약
 */
export function getSynastryHighlights(result: SynastryResult): string[] {
  const highlights: string[] = [];

  // 가장 강한 애스펙트들
  const topAspects = result.aspects.slice(0, 5);
  for (const aspect of topAspects) {
    const nature = aspect.nature === 'harmonious' ? '조화' : '긴장';
    highlights.push(
      `${aspect.person1Planet}-${aspect.person2Planet} ${aspect.type} (${nature})`
    );
  }

  // 중요 하우스 오버레이
  const importantHouses = [5, 7, 8]; // 연애, 파트너십, 친밀감
  for (const overlay of result.person1InPerson2Houses) {
    if (importantHouses.includes(overlay.house)) {
      highlights.push(
        `Person1의 ${PLANETS[overlay.planetId].nameKo}가 Person2의 ${overlay.house}하우스에`
      );
    }
  }

  return highlights;
}
