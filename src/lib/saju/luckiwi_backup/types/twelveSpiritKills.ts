/**
 * 12신살(十二神殺) 타입 정의
 */

/** 12신살 종류 */
export type TwelveSpiritKillType =
  | '겁살' | '재살' | '천살' | '지살' | '년살' | '월살'
  | '망신살' | '장성살' | '반안살' | '역마' | '육해' | '화개';

/** 12신살 정보 */
export interface TwelveSpiritKillInfo {
  type: TwelveSpiritKillType;
  typeHanja: string;
  position: 'year' | 'month' | 'day' | 'hour';
  basedOn: string;
  category: 'auspicious' | 'inauspicious' | 'neutral';
  description: string;
}

/** 12신살 분석 결과 */
export interface TwelveSpiritKillsAnalysis {
  /** 발견된 12신살 목록 */
  spirits: TwelveSpiritKillInfo[];
  /** 년지 기준 분석 */
  yearBasedSpirits: TwelveSpiritKillInfo[];
  /** 일지 기준 분석 */
  dayBasedSpirits: TwelveSpiritKillInfo[];
  /** 요약 */
  summary: {
    auspiciousCount: number;
    inauspiciousCount: number;
    majorSpirits: TwelveSpiritKillType[];
    interpretation: string;
  };
}
