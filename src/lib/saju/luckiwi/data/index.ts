/**
 * 절기 데이터 로더
 * JSON 파일에서 절기 데이터를 로드하고 캐싱
 * JSON 파일이 없는 경우 천문학 알고리즘으로 계산
 */

import * as fs from 'fs';
import * as path from 'path';
import { SolarTerm } from '../types';
import { calculateSolarTermsCached } from '../core/astronomy';

// 캐시
const cache: Map<number, SolarTerm[]> = new Map();

// 절기 데이터 디렉토리 경로
const SOLAR_TERMS_DIR = path.join(__dirname, 'solarTerms');

// JSON 데이터가 있는 연도 범위 (holidays.dist.be API 제공)
// 범위 밖 연도는 천문학 알고리즘(meeusjs)으로 자동 계산
const JSON_DATA_START_YEAR = 2004;
const JSON_DATA_END_YEAR = 2026;

/**
 * 특정 연도의 절기 데이터 로드
 *
 * 우선순위:
 * 1. 캐시 확인
 * 2. JSON 파일 로드 시도 (2004-2026)
 * 3. 알고리즘 계산 (그 외 연도)
 */
export function loadSolarTerms(year: number): SolarTerm[] {
  // 캐시 확인
  if (cache.has(year)) {
    return cache.get(year)!;
  }

  // JSON 데이터 범위 내인 경우 파일에서 로드 시도
  if (year >= JSON_DATA_START_YEAR && year <= JSON_DATA_END_YEAR) {
    const filePath = path.join(SOLAR_TERMS_DIR, `${year}.json`);

    if (fs.existsSync(filePath)) {
      try {
        const raw = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
        const terms: SolarTerm[] = raw.map((item: { name: string; date: string; time: string }) => ({
          name: item.name,
          date: item.date,
          time: item.time,
          datetime: new Date(`${item.date}T${item.time}:00+09:00`), // KST
        }));

        cache.set(year, terms);
        return terms;
      } catch (error) {
        console.error(`Failed to load solar terms for year ${year}:`, error);
        // 로드 실패 시 알고리즘으로 폴백
      }
    }
  }

  // JSON 파일이 없거나 범위 밖인 경우: 알고리즘으로 계산
  try {
    const terms = calculateSolarTermsCached(year);
    cache.set(year, terms);
    return terms;
  } catch (error) {
    console.error(`Failed to calculate solar terms for year ${year}:`, error);
    return [];
  }
}

/**
 * 여러 연도의 절기 데이터 로드
 */
export function loadSolarTermsRange(startYear: number, endYear: number): Map<number, SolarTerm[]> {
  const result = new Map<number, SolarTerm[]>();

  for (let year = startYear; year <= endYear; year++) {
    const terms = loadSolarTerms(year);
    if (terms.length > 0) {
      result.set(year, terms);
    }
  }

  return result;
}

/**
 * 사용 가능한 연도 목록 조회
 */
export function getAvailableYears(): number[] {
  if (!fs.existsSync(SOLAR_TERMS_DIR)) {
    return [];
  }

  return fs.readdirSync(SOLAR_TERMS_DIR)
    .filter(file => file.endsWith('.json') && file !== 'all.json')
    .map(file => parseInt(file.replace('.json', ''), 10))
    .filter(year => !isNaN(year))
    .sort((a, b) => a - b);
}

/**
 * 캐시 초기화
 */
export function clearCache(): void {
  cache.clear();
}
