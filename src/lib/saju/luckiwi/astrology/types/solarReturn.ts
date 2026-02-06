/**
 * 솔라 리턴 (연간 생일 차트) 타입 정의
 */

import type { NatalChart, BirthData, NatalChartOptions } from './chart';
import type { Aspect } from './aspects';
import type { ZodiacSign } from './signs';
import type { PlanetId } from './planets';

// 솔라 리턴 옵션
export interface SolarReturnOptions {
  year: number; // 리턴 연도
  location?: {
    // 리턴 장소 (기본: 출생지)
    latitude: number;
    longitude: number;
    timezone: string;
    name?: string;
  };
  houseSystem: import('./houses').HouseSystem;
  mode: import('./planets').AstrologyMode;
}

// 솔라 리턴 차트
export interface SolarReturnChart {
  // 원본 네이탈 차트
  natalChart: NatalChart;

  // 리턴 정보
  returnYear: number;
  returnMoment: Date; // 정확한 리턴 시점 (UTC)
  returnLocation: {
    latitude: number;
    longitude: number;
    timezone: string;
    name?: string;
  };

  // 솔라 리턴 차트
  chart: NatalChart;

  // 네이탈 대비 분석
  aspectsToNatal: Aspect[]; // 리턴 행성 - 네이탈 행성 애스펙트
  houseShifts: HouseShift[]; // 하우스 변화

  // 연간 테마
  yearlyThemes?: YearlyTheme;
}

// 하우스 변화 (네이탈 vs 솔라 리턴)
export interface HouseShift {
  planet: PlanetId;
  natalHouse: number;
  returnHouse: number;
  natalSign: ZodiacSign;
  returnSign: ZodiacSign;
  isSignChange: boolean;
  isHouseChange: boolean;
}

// 연간 테마
export interface YearlyTheme {
  // 주요 포커스 하우스
  focusHouses: number[];

  // 주요 테마
  themes: string[];

  // 도전 영역
  challenges: string[];

  // 기회 영역
  opportunities: string[];

  // ASC 사인 변화
  returnAscendant: ZodiacSign;
  ascendantTheme: string;

  // MC 사인 변화
  returnMidheaven: ZodiacSign;
  midheavenTheme: string;
}

// 복수 연도 솔라 리턴 (트렌드 분석용)
export interface SolarReturnSeries {
  natalChart: NatalChart;
  returns: SolarReturnChart[];
  startYear: number;
  endYear: number;
}
