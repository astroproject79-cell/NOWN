/**
 * 통합 분석 결과 타입 정의
 */

import { TenGodAnalysis } from './tenGod';
import { ElementAnalysis, Element } from './elements';
import { RelationAnalysis } from './relations';
import { StructureAnalysis } from './structure';
import { UsefulGodAnalysis } from '../analysis/usefulGod';
import { DayMasterStrengthAnalysis } from '../analysis/dayMasterStrength';
import { FullHiddenStemAnalysis } from '../analysis/hiddenStem';
import { TwelveStagesAnalysis } from './twelveStages';
import { SpiritsAnalysis } from './spirits';
import { EmptyBranchesAnalysis } from './emptyBranches';
import { SoundElementAnalysis } from './soundElement';
import { TwelveSpiritKillsAnalysis } from './twelveSpiritKills';

/** 분석 옵션 */
export interface AnalysisOptions {
  /** 십신 분석 포함 */
  tenGods?: boolean;
  /** 오행 분석 포함 */
  elements?: boolean;
  /** 관계 분석 포함 */
  relations?: boolean;
  /** 격국 분석 포함 */
  structure?: boolean;
  /** 용신 분석 포함 */
  usefulGod?: boolean;
  /** 일주 강약 분석 포함 */
  dayMasterStrength?: boolean;
  /** 장간 분석 포함 */
  hiddenStems?: boolean;
  /** 12운성 분석 포함 */
  twelveStages?: boolean;
  /** 신살 분석 포함 */
  spirits?: boolean;
  /** 공망 분석 포함 */
  emptyBranches?: boolean;
  /** 납음오행 분석 포함 */
  soundElement?: boolean;
  /** 12신살 분석 포함 */
  twelveSpiritKills?: boolean;
}

/** 전체 명리학 분석 결과 */
export interface SajuAnalysis {
  /** 십신 분석 */
  tenGods?: TenGodAnalysis;
  /** 오행 분석 */
  elements?: ElementAnalysis;
  /** 관계 분석 (합충형해파) */
  relations?: RelationAnalysis;
  /** 격국 분석 */
  structure?: StructureAnalysis;
  /** 용신 분석 */
  usefulGod?: UsefulGodAnalysis;
  /** 일주 강약 분석 */
  dayMasterStrength?: DayMasterStrengthAnalysis;
  /** 장간 분석 */
  hiddenStems?: FullHiddenStemAnalysis;
  /** 12운성 분석 */
  twelveStages?: TwelveStagesAnalysis;
  /** 신살 분석 */
  spirits?: SpiritsAnalysis;
  /** 공망 분석 */
  emptyBranches?: EmptyBranchesAnalysis;
  /** 납음오행 분석 */
  soundElement?: SoundElementAnalysis;
  /** 12신살 분석 */
  twelveSpiritKills?: TwelveSpiritKillsAnalysis;
  /** 종합 요약 */
  summary: {
    /** 전체 균형 상태 */
    overallBalance: 'balanced' | 'imbalanced';
    /** 유리한 오행 */
    favorableElements: Element[];
    /** 불리한 오행 */
    unfavorableElements: Element[];
    /** 핵심 인사이트 */
    keyInsights: string[];
  };
}
