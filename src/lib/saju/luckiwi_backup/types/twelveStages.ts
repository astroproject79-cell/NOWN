/**
 * 12운성(十二運星) 타입 정의
 */

/** 12운성 종류 */
export type TwelveStage =
  | '장생' | '목욕' | '관대' | '건록' | '제왕'
  | '쇠' | '병' | '사' | '묘' | '절' | '태' | '양';

/** 12운성 한자 */
export type TwelveStageHanja =
  | '長生' | '沐浴' | '冠帶' | '建祿' | '帝旺'
  | '衰' | '病' | '死' | '墓' | '絶' | '胎' | '養';

/** 12운성 정보 */
export interface TwelveStageInfo {
  stage: TwelveStage;
  stageHanja: TwelveStageHanja;
  position: 'year' | 'month' | 'day' | 'hour';
  stem: string;
  branch: string;
  strength: 'strong' | 'neutral' | 'weak';
  description: string;
}

/** 12운성 분석 결과 */
export interface TwelveStagesAnalysis {
  year: TwelveStageInfo;
  month: TwelveStageInfo;
  day: TwelveStageInfo;
  hour: TwelveStageInfo;
  /** 일간 기준 분석 */
  dayMasterStages: {
    yearBranch: TwelveStageInfo;
    monthBranch: TwelveStageInfo;
    dayBranch: TwelveStageInfo;
    hourBranch: TwelveStageInfo;
  };
  summary: {
    strongStages: TwelveStage[];
    weakStages: TwelveStage[];
    dominantStage: TwelveStage;
  };
}
