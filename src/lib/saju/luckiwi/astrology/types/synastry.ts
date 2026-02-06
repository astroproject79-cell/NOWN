/**
 * 시나스트리 (궁합) 타입 정의
 */

import type { NatalChart, BirthData, NatalChartOptions } from './chart';
import type { Aspect } from './aspects';
import type { PlanetId } from './planets';

// 시나스트리 옵션
export interface SynastryOptions extends NatalChartOptions {
  includeComposite?: boolean; // 합성 차트 포함 여부
  includeDavison?: boolean; // 데이비슨 차트 포함 여부
}

// 시나스트리 애스펙트 (어느 쪽 차트인지 표시)
export interface SynastryAspect extends Aspect {
  person1Planet: PlanetId; // 1번 사람 행성
  person2Planet: PlanetId; // 2번 사람 행성
}

// 하우스 오버레이 (A의 행성이 B의 몇 하우스에 위치)
export interface HouseOverlay {
  planetId: PlanetId;
  house: number; // 1-12
  sign: import('./signs').ZodiacSign;
}

// 시나스트리 결과
export interface SynastryResult {
  person1: NatalChart;
  person2: NatalChart;

  // 크로스 애스펙트 (두 차트 간)
  aspects: SynastryAspect[];

  // 하우스 오버레이
  person1InPerson2Houses: HouseOverlay[]; // 1번 행성들이 2번의 어느 하우스에
  person2InPerson1Houses: HouseOverlay[]; // 2번 행성들이 1번의 어느 하우스에

  // 합성 차트 (선택)
  compositeChart?: NatalChart;

  // 데이비슨 차트 (선택)
  davisonChart?: NatalChart;

  // 궁합 점수 (선택)
  compatibility?: CompatibilityScore;
}

// 궁합 점수
export interface CompatibilityScore {
  overall: number; // 0-100 종합 점수
  attraction: number; // 끌림/매력
  communication: number; // 소통
  emotional: number; // 감정적 연결
  longevity: number; // 지속성
  harmony: number; // 조화
  challenge: number; // 도전/갈등

  // 주요 애스펙트별 점수
  aspectBreakdown: {
    type: string;
    planets: string;
    score: number;
    description: string;
  }[];
}

// 합성 차트 계산용 (중점 계산)
export interface CompositeData {
  person1: BirthData;
  person2: BirthData;
  method: 'midpoint' | 'davison';
}

// 데이비슨 차트 (두 생년월일의 중간점)
export interface DavisonData {
  midpointDate: Date;
  midpointLocation: {
    latitude: number;
    longitude: number;
  };
}
