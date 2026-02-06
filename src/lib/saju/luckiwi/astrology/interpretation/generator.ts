/**
 * 점성학 해석 생성기
 *
 * 차트 데이터를 기반으로 해석 텍스트 생성
 */

import type { NatalChart, PlanetPosition, Aspect, PlanetId, ZodiacSign } from '../types';
import { getPlanetDignity, DIGNITY_SCORES, type DignityType } from '../constants/rulerships';
import { PLANETS } from '../constants/planets';
import { SIGNS } from '../constants/signs';
import planetInSignData from './templates/planetInSign.json';
import planetInHouseData from './templates/planetInHouse.json';
import aspectsData from './templates/aspects.json';

/**
 * 행성-사인 해석
 */
export interface PlanetSignInterpretation {
  planet: PlanetId;
  sign: ZodiacSign;
  planetName: string;
  signName: string;
  dignity: DignityType;
  dignityScore: number;
  keywords: string[];
  core: string;
  strengths?: string;
  challenges?: string;
  growth?: string;
}

/**
 * 행성-하우스 해석
 */
export interface PlanetHouseInterpretation {
  planet: PlanetId;
  house: number;
  planetName: string;
  houseName: string;
  interpretation: string;
}

/**
 * 애스펙트 해석
 */
export interface AspectInterpretation {
  planet1: PlanetId;
  planet2: PlanetId;
  aspectType: string;
  aspectName: string;
  nature: string;
  interpretation: string;
}

/**
 * 차트 전체 해석
 */
export interface ChartInterpretation {
  birthInfo: string;
  summary: string[];
  planetsInSigns: PlanetSignInterpretation[];
  planetsInHouses: PlanetHouseInterpretation[];
  aspects: AspectInterpretation[];
  overallThemes: string[];
}

/**
 * 행성-사인 해석 생성
 */
export function interpretPlanetInSign(
  planet: PlanetPosition,
  mode: 'modern' | 'classical' = 'modern'
): PlanetSignInterpretation {
  const planetData = (planetInSignData.planets as Record<string, unknown>)[planet.id] as {
    name: string;
    signs: Record<string, { keywords: string[]; core: string; strengths?: string; challenges?: string; growth?: string }>;
  } | undefined;
  const signData = planetData?.signs[planet.sign];

  const dignity = getPlanetDignity(planet.id, planet.sign, mode);
  const dignityScore = DIGNITY_SCORES[dignity];

  return {
    planet: planet.id,
    sign: planet.sign,
    planetName: PLANETS[planet.id]?.nameKo || planet.id,
    signName: SIGNS[planet.sign]?.nameKo || planet.sign,
    dignity,
    dignityScore,
    keywords: signData?.keywords || [],
    core: signData?.core || `${PLANETS[planet.id]?.nameKo || planet.id}이(가) ${SIGNS[planet.sign]?.nameKo || planet.sign}에 있습니다.`,
    strengths: signData?.strengths,
    challenges: signData?.challenges,
    growth: signData?.growth,
  };
}

/**
 * 행성-하우스 해석 생성
 */
export function interpretPlanetInHouse(planet: PlanetPosition): PlanetHouseInterpretation {
  const houseNum = planet.house?.toString() || '1';
  const houseData = (planetInHouseData.houses as Record<string, unknown>)[houseNum] as {
    name: string;
    planets: Record<string, string>;
  } | undefined;
  const interpretation = houseData?.planets[planet.id];

  return {
    planet: planet.id,
    house: planet.house || 1,
    planetName: PLANETS[planet.id]?.nameKo || planet.id,
    houseName: `${planet.house || 1}하우스`,
    interpretation: interpretation || `${PLANETS[planet.id]?.nameKo || planet.id}이(가) ${planet.house || 1}하우스에 있습니다.`,
  };
}

/**
 * 애스펙트 해석 생성
 */
export function interpretAspect(aspect: Aspect): AspectInterpretation {
  const aspectTypeData = (aspectsData.aspectTypes as Record<string, { name: string; nature: string }>)[aspect.type];

  // 행성 쌍 키 생성 (순서 정렬)
  const planets = [aspect.planet1, aspect.planet2].sort();
  const pairKey = `${planets[0]}_${planets[1]}`;
  const pairData = (aspectsData.planetPairs as Record<string, Record<string, string>>)[pairKey];
  const interpretation = pairData?.[aspect.type];

  const planet1Name = PLANETS[aspect.planet1]?.nameKo || aspect.planet1;
  const planet2Name = PLANETS[aspect.planet2]?.nameKo || aspect.planet2;
  const aspectName = aspectTypeData?.name || aspect.type;

  return {
    planet1: aspect.planet1,
    planet2: aspect.planet2,
    aspectType: aspect.type,
    aspectName,
    nature: aspectTypeData?.nature || 'neutral',
    interpretation: interpretation || `${planet1Name}와(과) ${planet2Name}의 ${aspectName}`,
  };
}

/**
 * 차트 전체 해석 생성
 */
export function generateChartInterpretation(chart: NatalChart): ChartInterpretation {
  // 출생 정보
  const birthInfo = `${chart.birthData.year}년 ${chart.birthData.month}월 ${chart.birthData.day}일 ` +
    `${chart.birthData.hour}:${String(chart.birthData.minute).padStart(2, '0')} ` +
    `(${chart.birthData.timezone})`;

  // 핵심 행성 (Sun, Moon, ASC, Mercury, Venus, Mars, Jupiter, Saturn)
  const corePlanets = ['sun', 'moon', 'ascendant', 'mercury', 'venus', 'mars', 'jupiter', 'saturn'];
  const filteredPlanets = chart.planets.filter(p => corePlanets.includes(p.id));

  // 행성-사인 해석
  const planetsInSigns = filteredPlanets
    .filter(p => p.id !== 'ascendant') // ASC는 사인 해석에서 제외
    .map(p => interpretPlanetInSign(p, chart.options.mode));

  // 행성-하우스 해석
  const planetsInHouses = filteredPlanets
    .filter(p => p.house !== undefined)
    .map(p => interpretPlanetInHouse(p));

  // 주요 애스펙트 해석 (좁은 오브만)
  const majorAspects = chart.aspects
    .filter(a => a.strength !== 'wide' && ['conjunction', 'opposition', 'trine', 'square', 'sextile'].includes(a.type))
    .slice(0, 15)
    .map(a => interpretAspect(a));

  // 요약 생성
  const summary = generateSummary(chart, planetsInSigns);

  // 전체 테마 추출
  const overallThemes = extractOverallThemes(planetsInSigns, majorAspects);

  return {
    birthInfo,
    summary,
    planetsInSigns,
    planetsInHouses,
    aspects: majorAspects,
    overallThemes,
  };
}

/**
 * 요약 생성
 */
function generateSummary(chart: NatalChart, interpretations: PlanetSignInterpretation[]): string[] {
  const summary: string[] = [];

  const sun = interpretations.find(i => i.planet === 'sun');
  const moon = interpretations.find(i => i.planet === 'moon');
  const asc = chart.planets.find(p => p.id === 'ascendant');

  if (sun) {
    summary.push(`태양이 ${sun.signName}에 있어 ${sun.keywords.slice(0, 2).join(', ')}의 특성이 자아의 핵심입니다.`);
  }

  if (moon) {
    summary.push(`달이 ${moon.signName}에 있어 감정적으로 ${moon.keywords.slice(0, 2).join(', ')}를 추구합니다.`);
  }

  if (asc) {
    const ascSign = SIGNS[asc.sign];
    const ascKeywords = getSignKeywords(asc.sign);
    summary.push(`상승점이 ${ascSign?.nameKo}에 있어 첫인상이 ${ascKeywords}의 특성을 가집니다.`);
  }

  // 야간/주간 차트
  summary.push(chart.metadata.isNightChart
    ? '야간 차트로, 달의 영향이 더 강조됩니다.'
    : '주간 차트로, 태양의 영향이 더 강조됩니다.');

  return summary;
}

/**
 * 전체 테마 추출
 */
function extractOverallThemes(
  interpretations: PlanetSignInterpretation[],
  aspects: AspectInterpretation[]
): string[] {
  const themes: string[] = [];
  const keywordCount: Record<string, number> = {};

  // 키워드 빈도 계산
  interpretations.forEach(i => {
    i.keywords.forEach(k => {
      keywordCount[k] = (keywordCount[k] || 0) + 1;
    });
  });

  // 상위 테마 추출
  const sortedKeywords = Object.entries(keywordCount)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([k]) => k);

  if (sortedKeywords.length > 0) {
    themes.push(`주요 테마: ${sortedKeywords.join(', ')}`);
  }

  // 강조되는 애스펙트 유형
  const aspectTypes: Record<string, number> = {};
  aspects.forEach(a => {
    aspectTypes[a.nature] = (aspectTypes[a.nature] || 0) + 1;
  });

  if (aspectTypes['도전'] > aspectTypes['조화']) {
    themes.push('도전적인 애스펙트가 많아 성장의 기회가 풍부합니다.');
  } else if (aspectTypes['조화'] > aspectTypes['도전']) {
    themes.push('조화로운 애스펙트가 많아 자연스러운 재능이 있습니다.');
  }

  // 품위가 높은 행성
  const dignifiedPlanets = interpretations
    .filter(i => i.dignityScore >= 4)
    .map(i => i.planetName);

  if (dignifiedPlanets.length > 0) {
    themes.push(`${dignifiedPlanets.join(', ')}의 에너지가 강하게 발현됩니다.`);
  }

  return themes;
}

/**
 * 해석을 텍스트로 포맷
 */
export function formatInterpretation(interpretation: ChartInterpretation): string {
  const lines: string[] = [];

  lines.push('=== 점성학 해석 ===');
  lines.push('');
  lines.push(`출생 정보: ${interpretation.birthInfo}`);
  lines.push('');

  lines.push('📌 요약');
  interpretation.summary.forEach(s => lines.push(`  • ${s}`));
  lines.push('');

  lines.push('🌟 행성별 해석');
  interpretation.planetsInSigns.forEach(p => {
    const dignityLabel = getDignityLabel(p.dignity);
    lines.push(`  ${p.planetName} in ${p.signName} ${dignityLabel}`);
    lines.push(`    ${p.core}`);
    if (p.strengths) lines.push(`    강점: ${p.strengths}`);
    if (p.challenges) lines.push(`    도전: ${p.challenges}`);
    lines.push('');
  });

  lines.push('🏠 하우스 배치');
  interpretation.planetsInHouses.forEach(p => {
    lines.push(`  ${p.planetName} in ${p.houseName}`);
    lines.push(`    ${p.interpretation}`);
  });
  lines.push('');

  lines.push('🔗 주요 애스펙트');
  interpretation.aspects.forEach(a => {
    const p1 = PLANETS[a.planet1]?.nameKo || a.planet1;
    const p2 = PLANETS[a.planet2]?.nameKo || a.planet2;
    lines.push(`  ${p1} ${a.aspectName} ${p2}`);
    lines.push(`    ${a.interpretation}`);
  });
  lines.push('');

  lines.push('🎯 전체 테마');
  interpretation.overallThemes.forEach(t => lines.push(`  • ${t}`));

  return lines.join('\n');
}

/**
 * 품위 레이블
 */
function getDignityLabel(dignity: DignityType): string {
  const labels: Record<DignityType, string> = {
    domicile: '(본좌 ★★★)',
    exaltation: '(고양 ★★)',
    peregrine: '',
    detriment: '(망)',
    fall: '(추락)',
  };
  return labels[dignity];
}

/**
 * 사인별 기본 키워드
 */
function getSignKeywords(sign: ZodiacSign): string {
  const signKeywords: Record<ZodiacSign, string> = {
    aries: '적극적, 열정적',
    taurus: '안정적, 감각적',
    gemini: '지적, 사교적',
    cancer: '돌봄, 감성적',
    leo: '당당함, 창조적',
    virgo: '분석적, 실용적',
    libra: '조화로움, 우아함',
    scorpio: '깊이 있음, 강렬함',
    sagittarius: '자유로움, 낙관적',
    capricorn: '책임감, 야망',
    aquarius: '독창적, 혁신적',
    pisces: '직관적, 공감적',
  };
  return signKeywords[sign] || sign;
}
