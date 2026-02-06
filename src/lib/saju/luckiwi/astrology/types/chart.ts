/**
 * 차트 (네이탈 차트) 타입 정의
 */

import type { PlanetPosition, AstrologyMode } from './planets';
import type { Houses, HouseSystem } from './houses';
import type { Aspect, AspectPattern } from './aspects';

// 출생 데이터
export interface BirthData {
  year: number;
  month: number; // 1-12
  day: number; // 1-31
  hour: number; // 0-23
  minute: number; // 0-59
  second?: number; // 0-59
  latitude: number; // 출생지 위도 (-90 ~ 90)
  longitude: number; // 출생지 경도 (-180 ~ 180)
  timezone: string; // IANA 타임존 (예: 'Asia/Seoul')
  location?: string; // 출생지명 (선택)
}

// 네이탈 차트 옵션
export interface NatalChartOptions {
  mode: AstrologyMode; // 고전/현대
  houseSystem: HouseSystem; // 하우스 시스템
  includeLunarNodes?: boolean; // 노드 포함 여부 (기본: true)
  includeChiron?: boolean; // 카이론 포함 여부 (기본: modern일 때 true)
  includeMinorAspects?: boolean; // 마이너 애스펙트 포함 (기본: false)
  aspectOrbs?: Partial<Record<string, number>>; // 커스텀 오브 (선택)
}

// 기본 옵션
export const DEFAULT_CHART_OPTIONS: NatalChartOptions = {
  mode: 'modern',
  houseSystem: 'placidus',
  includeLunarNodes: true,
  includeChiron: true,
  includeMinorAspects: false,
};

// 네이탈 차트
export interface NatalChart {
  birthData: BirthData;
  options: NatalChartOptions;

  // 천문 데이터
  julianDay: number; // 율리우스 적일
  siderealTime: number; // 항성시
  obliquity: number; // 황도 경사각

  // 계산 결과
  planets: PlanetPosition[]; // 행성 위치
  houses: Houses; // 하우스
  aspects: Aspect[]; // 애스펙트
  patterns?: AspectPattern[]; // 애스펙트 패턴 (선택)

  // 메타데이터
  metadata: ChartMetadata;
}

// 차트 메타데이터
export interface ChartMetadata {
  calculatedAt: string; // ISO 8601
  ephemerisVersion: string; // sweph 버전
  timezone: string; // 사용된 타임존
  utcOffset: number; // UTC 오프셋 (분)
  isNightChart: boolean; // 야간 차트 여부 (태양이 지평선 아래)
}

// 차트 요약
export interface ChartSummary {
  sunSign: import('./signs').ZodiacSign;
  moonSign: import('./signs').ZodiacSign;
  ascendant: import('./signs').ZodiacSign;
  dominantElement?: import('./signs').Element;
  dominantModality?: import('./signs').Modality;
  chartPattern?: AspectPattern;
}

// 행성 배치 통계
export interface PlanetDistribution {
  byElement: Record<import('./signs').Element, import('./planets').PlanetId[]>;
  byModality: Record<import('./signs').Modality, import('./planets').PlanetId[]>;
  byHouse: Record<number, import('./planets').PlanetId[]>;
  bySign: Record<import('./signs').ZodiacSign, import('./planets').PlanetId[]>;
}
