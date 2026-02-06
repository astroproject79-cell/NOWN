/**
 * 격국(格局) 타입 정의
 */

import { TenGodType } from './tenGod';

/** 정격(正格) - 일반적인 격국 */
export type RegularStructure =
  | '정관격'   // 正官格
  | '편관격'   // 偏官格 (칠살격)
  | '정인격'   // 正印格
  | '편인격'   // 偏印格
  | '식신격'   // 食神格
  | '상관격'   // 傷官格
  | '정재격'   // 正財格
  | '편재격'   // 偏財格
  | '건록격'   // 建祿格
  | '양인격';  // 羊刃格

/** 외격(外格) - 특수 격국 */
export type SpecialStructure =
  | '종격'     // 從格 (종재격, 종살격, 종아격 등)
  | '화격'     // 化格
  | '전왕격'   // 專旺格 (곡직격, 염상격 등)
  | '잡격';    // 雜格

/** 격국 종류 */
export type StructureType = RegularStructure | SpecialStructure;

/** 격국 카테고리 */
export type StructureCategory = 'regular' | 'special';

/** 격국 강도 */
export type StructureStrength = 'strong' | 'moderate' | 'weak';

/** 격국 정보 */
export interface Structure {
  /** 격국 종류 */
  type: StructureType;
  /** 격국 한자 */
  typeHanja: string;
  /** 카테고리 (정격/외격) */
  category: StructureCategory;
  /** 격국 결정 근거 */
  determinedBy: string;
  /** 격국 강도 */
  strength: StructureStrength;
  /** 격국 순수도 (0-100) */
  purity: number;
}

/** 격국 분석 결과 */
export interface StructureAnalysis {
  /** 주격 */
  primary: Structure;
  /** 보조격 (있는 경우) */
  secondary?: Structure;
  /** 격국 성립 조건 충족 여부 */
  isValid: boolean;
  /** 특이사항 */
  notes: string[];
}
