/**
 * 애스펙트 계산 모듈
 */

import type {
  Aspect,
  AspectType,
  AspectNature,
  AspectPattern,
  AspectPatternType,
  PlanetPosition,
  PlanetId,
  AstrologyMode,
} from '../types';
import {
  ASPECTS,
  MAJOR_ASPECTS,
  MINOR_ASPECTS,
  getAspectOrb,
} from '../constants/aspects';
import { PLANETS } from '../constants/planets';

/**
 * 두 행성 사이의 애스펙트 계산
 */
export function calculateAspectBetween(
  planet1: PlanetPosition,
  planet2: PlanetPosition,
  options: {
    includeMajor?: boolean;
    includeMinor?: boolean;
  } = {}
): Aspect | null {
  const { includeMajor = true, includeMinor = false } = options;

  // 두 경도 사이의 각도 (0-180)
  let diff = Math.abs(planet1.longitude - planet2.longitude);
  if (diff > 180) {
    diff = 360 - diff;
  }

  // 발광체 관련 여부 확인
  const isLuminaryInvolved =
    PLANETS[planet1.id]?.isLuminary || PLANETS[planet2.id]?.isLuminary;

  // 검사할 애스펙트 목록
  const aspectsToCheck: AspectType[] = [];
  if (includeMajor) aspectsToCheck.push(...MAJOR_ASPECTS);
  if (includeMinor) aspectsToCheck.push(...MINOR_ASPECTS);

  // 각 애스펙트 확인
  for (const aspectType of aspectsToCheck) {
    const aspectInfo = ASPECTS[aspectType];
    const maxOrb = getAspectOrb(aspectType, isLuminaryInvolved);
    const orb = Math.abs(diff - aspectInfo.angle);

    if (orb <= maxOrb) {
      // 접근/분리 판단
      const isApplying = determineApplying(planet1, planet2, aspectInfo.angle);

      // 강도 판단
      const strength = orb <= 1 ? 'exact' : orb <= maxOrb / 2 ? 'close' : 'wide';

      return {
        planet1: planet1.id,
        planet2: planet2.id,
        type: aspectType,
        angle: aspectInfo.angle,
        orb,
        orbPercentage: (orb / maxOrb) * 100,
        isApplying,
        isExact: orb <= 1,
        strength,
        nature: aspectInfo.nature,
      };
    }
  }

  return null;
}

/**
 * 접근 중인지 분리 중인지 판단
 */
function determineApplying(
  planet1: PlanetPosition,
  planet2: PlanetPosition,
  exactAngle: number
): boolean {
  // 현재 각도
  let currentDiff = Math.abs(planet1.longitude - planet2.longitude);
  if (currentDiff > 180) currentDiff = 360 - currentDiff;

  // 1시간 후 예상 각도 (속도 기반)
  const speed1 = planet1.speed / 24; // 시간당 이동량
  const speed2 = planet2.speed / 24;

  const futureLong1 = planet1.longitude + speed1;
  const futureLong2 = planet2.longitude + speed2;

  let futureDiff = Math.abs(futureLong1 - futureLong2);
  if (futureDiff > 180) futureDiff = 360 - futureDiff;

  // 미래에 정확 각도에 가까워지면 접근 중
  const currentDistFromExact = Math.abs(currentDiff - exactAngle);
  const futureDistFromExact = Math.abs(futureDiff - exactAngle);

  return futureDistFromExact < currentDistFromExact;
}

/**
 * 모든 행성 쌍의 애스펙트 계산
 */
export function calculateAllAspects(
  planets: PlanetPosition[],
  mode: AstrologyMode,
  options: {
    includeMinor?: boolean;
    excludePoints?: PlanetId[];
  } = {}
): Aspect[] {
  const { includeMinor = false, excludePoints = [] } = options;

  const aspects: Aspect[] = [];
  const planetsToCheck = planets.filter(
    (p) => !excludePoints.includes(p.id) && p.id !== 'southNode' // 남노드는 북노드와 항상 오포지션이므로 제외
  );

  for (let i = 0; i < planetsToCheck.length; i++) {
    for (let j = i + 1; j < planetsToCheck.length; j++) {
      const aspect = calculateAspectBetween(planetsToCheck[i], planetsToCheck[j], {
        includeMajor: true,
        includeMinor,
      });

      if (aspect) {
        aspects.push(aspect);
      }
    }
  }

  // 오브 순으로 정렬 (더 정확한 것이 먼저)
  return aspects.sort((a, b) => a.orb - b.orb);
}

/**
 * 특정 행성과 관련된 애스펙트만 필터
 */
export function getAspectsForPlanet(aspects: Aspect[], planetId: PlanetId): Aspect[] {
  return aspects.filter(
    (aspect) => aspect.planet1 === planetId || aspect.planet2 === planetId
  );
}

/**
 * 애스펙트 패턴 감지
 */
export function detectAspectPatterns(
  planets: PlanetPosition[],
  aspects: Aspect[]
): AspectPattern[] {
  const patterns: AspectPattern[] = [];

  // 그랜드 트라인 감지
  const grandTrines = detectGrandTrines(planets, aspects);
  patterns.push(...grandTrines);

  // T-스퀘어 감지
  const tSquares = detectTSquares(planets, aspects);
  patterns.push(...tSquares);

  // 그랜드 크로스 감지
  const grandCrosses = detectGrandCrosses(planets, aspects);
  patterns.push(...grandCrosses);

  // 스텔리움 감지
  const stelliums = detectStelliums(planets);
  patterns.push(...stelliums);

  return patterns;
}

/**
 * 그랜드 트라인 감지 (3개 행성이 서로 트라인)
 */
function detectGrandTrines(
  planets: PlanetPosition[],
  aspects: Aspect[]
): AspectPattern[] {
  const patterns: AspectPattern[] = [];
  const trines = aspects.filter((a) => a.type === 'trine');

  // 3개 행성 조합 확인
  for (const trine1 of trines) {
    for (const trine2 of trines) {
      if (trine1 === trine2) continue;

      // 공통 행성 찾기
      const planets1 = [trine1.planet1, trine1.planet2];
      const planets2 = [trine2.planet1, trine2.planet2];
      const common = planets1.filter((p) => planets2.includes(p));

      if (common.length === 1) {
        const allPlanets = [...new Set([...planets1, ...planets2])];

        // 세 번째 트라인 확인
        const thirdPlanet1 = planets1.find((p) => p !== common[0])!;
        const thirdPlanet2 = planets2.find((p) => p !== common[0])!;

        const hasThirdTrine = trines.some(
          (t) =>
            (t.planet1 === thirdPlanet1 && t.planet2 === thirdPlanet2) ||
            (t.planet1 === thirdPlanet2 && t.planet2 === thirdPlanet1)
        );

        if (hasThirdTrine) {
          // 중복 체크
          const key = allPlanets.sort().join('-');
          const exists = patterns.some(
            (p) => p.planets.sort().join('-') === key
          );

          if (!exists) {
            patterns.push({
              type: 'grand_trine',
              planets: allPlanets,
              aspects: aspects.filter(
                (a) =>
                  a.type === 'trine' &&
                  allPlanets.includes(a.planet1) &&
                  allPlanets.includes(a.planet2)
              ),
              description: `그랜드 트라인: ${allPlanets.join(', ')}`,
            });
          }
        }
      }
    }
  }

  return patterns;
}

/**
 * T-스퀘어 감지 (2개 스퀘어 + 1개 오포지션)
 */
function detectTSquares(
  planets: PlanetPosition[],
  aspects: Aspect[]
): AspectPattern[] {
  const patterns: AspectPattern[] = [];
  const squares = aspects.filter((a) => a.type === 'square');
  const oppositions = aspects.filter((a) => a.type === 'opposition');

  for (const opposition of oppositions) {
    const oppPlanets = [opposition.planet1, opposition.planet2];

    // 두 행성 모두와 스퀘어인 세 번째 행성 찾기
    for (const square1 of squares) {
      const square1Planets = [square1.planet1, square1.planet2];
      const commonWithOpp1 = oppPlanets.filter((p) => square1Planets.includes(p));

      if (commonWithOpp1.length === 1) {
        const apex = square1Planets.find((p) => !oppPlanets.includes(p))!;
        const otherOppPlanet = oppPlanets.find((p) => p !== commonWithOpp1[0])!;

        // apex가 다른 오포지션 행성과도 스퀘어인지 확인
        const hasSecondSquare = squares.some(
          (s) =>
            (s.planet1 === apex && s.planet2 === otherOppPlanet) ||
            (s.planet1 === otherOppPlanet && s.planet2 === apex)
        );

        if (hasSecondSquare) {
          const allPlanets = [opposition.planet1, opposition.planet2, apex];
          const key = allPlanets.sort().join('-');
          const exists = patterns.some(
            (p) => p.planets.sort().join('-') === key
          );

          if (!exists) {
            patterns.push({
              type: 't_square',
              planets: allPlanets,
              aspects: [
                opposition,
                ...squares.filter(
                  (s) =>
                    (s.planet1 === apex || s.planet2 === apex) &&
                    oppPlanets.some(
                      (op) => s.planet1 === op || s.planet2 === op
                    )
                ),
              ],
              description: `T-스퀘어: ${apex} (정점), ${opposition.planet1}-${opposition.planet2} (오포지션)`,
            });
          }
        }
      }
    }
  }

  return patterns;
}

/**
 * 그랜드 크로스 감지
 */
function detectGrandCrosses(
  planets: PlanetPosition[],
  aspects: Aspect[]
): AspectPattern[] {
  // T-스퀘어 2개가 합쳐진 형태
  const patterns: AspectPattern[] = [];
  const oppositions = aspects.filter((a) => a.type === 'opposition');

  if (oppositions.length < 2) return patterns;

  for (let i = 0; i < oppositions.length; i++) {
    for (let j = i + 1; j < oppositions.length; j++) {
      const opp1Planets = [oppositions[i].planet1, oppositions[i].planet2];
      const opp2Planets = [oppositions[j].planet1, oppositions[j].planet2];

      // 4개 다른 행성인지 확인
      const allPlanets = [...opp1Planets, ...opp2Planets];
      if (new Set(allPlanets).size !== 4) continue;

      // 4개의 스퀘어가 있는지 확인
      const squares = aspects.filter((a) => a.type === 'square');
      let squareCount = 0;

      for (const p1 of opp1Planets) {
        for (const p2 of opp2Planets) {
          if (
            squares.some(
              (s) =>
                (s.planet1 === p1 && s.planet2 === p2) ||
                (s.planet1 === p2 && s.planet2 === p1)
            )
          ) {
            squareCount++;
          }
        }
      }

      if (squareCount === 4) {
        patterns.push({
          type: 'grand_cross',
          planets: allPlanets,
          aspects: [
            oppositions[i],
            oppositions[j],
            ...squares.filter(
              (s) => allPlanets.includes(s.planet1) && allPlanets.includes(s.planet2)
            ),
          ],
          description: `그랜드 크로스: ${allPlanets.join(', ')}`,
        });
      }
    }
  }

  return patterns;
}

/**
 * 스텔리움 감지 (3개 이상 행성이 같은 사인에서 근접)
 */
function detectStelliums(planets: PlanetPosition[]): AspectPattern[] {
  const patterns: AspectPattern[] = [];

  // 사인별로 그룹화
  const bySign: Map<string, PlanetPosition[]> = new Map();

  for (const planet of planets) {
    if (planet.id === 'ascendant' || planet.id === 'midheaven') continue;

    const sign = planet.sign;
    if (!bySign.has(sign)) {
      bySign.set(sign, []);
    }
    bySign.get(sign)!.push(planet);
  }

  // 3개 이상인 사인 확인
  for (const [sign, planetsInSign] of bySign) {
    if (planetsInSign.length >= 3) {
      // 10도 이내로 모여있는지 확인
      const longitudes = planetsInSign.map((p) => p.signDegree);
      const minLong = Math.min(...longitudes);
      const maxLong = Math.max(...longitudes);

      if (maxLong - minLong <= 15) {
        patterns.push({
          type: 'stellium',
          planets: planetsInSign.map((p) => p.id),
          aspects: [],
          description: `스텔리움 (${sign}): ${planetsInSign.map((p) => p.id).join(', ')}`,
        });
      }
    }
  }

  return patterns;
}

/**
 * 애스펙트 요약
 */
export function summarizeAspects(aspects: Aspect[]): {
  total: number;
  harmonious: number;
  challenging: number;
  neutral: number;
  strongest: Aspect | null;
} {
  const harmonious = aspects.filter((a) => a.nature === 'harmonious').length;
  const challenging = aspects.filter((a) => a.nature === 'challenging').length;
  const neutral = aspects.filter((a) => a.nature === 'neutral').length;
  const strongest = aspects.length > 0 ? aspects[0] : null; // 이미 오브순 정렬됨

  return {
    total: aspects.length,
    harmonious,
    challenging,
    neutral,
    strongest,
  };
}
