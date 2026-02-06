/**
 * 십신(十神) 상수 및 매핑 테이블
 */

import { TenGodType, TenGodTypeHanja } from '../types/tenGod';
import { ElementRelationType } from './elements';

/** 음양 일치 여부 */
export type YinYangMatch = 'same' | 'different';

/**
 * 십신 결정 테이블
 * [오행 관계][음양 일치 여부] = 십신
 */
export const TEN_GOD_TABLE: Record<ElementRelationType, Record<YinYangMatch, TenGodType>> = {
  'same': {           // 같은 오행
    'same': '비견',      // 比肩
    'different': '겁재', // 劫財
  },
  'generating': {     // 내가 생하는 오행
    'same': '식신',      // 食神
    'different': '상관', // 傷官
  },
  'generated': {      // 나를 생하는 오행
    'same': '편인',      // 偏印
    'different': '정인', // 正印
  },
  'controlling': {    // 내가 극하는 오행
    'same': '편재',      // 偏財
    'different': '정재', // 正財
  },
  'controlled': {     // 나를 극하는 오행
    'same': '편관',      // 偏官
    'different': '정관', // 正官
  },
};

/**
 * 십신 한자 매핑
 */
export const TEN_GOD_HANJA: Record<TenGodType, TenGodTypeHanja> = {
  '비견': '比肩',
  '겁재': '劫財',
  '식신': '食神',
  '상관': '傷官',
  '편재': '偏財',
  '정재': '正財',
  '편관': '偏官',
  '정관': '正官',
  '편인': '偏印',
  '정인': '正印',
};

/**
 * 십신 영문명
 */
export const TEN_GOD_ENGLISH: Record<TenGodType, string> = {
  '비견': 'Peer',
  '겁재': 'Rob Wealth',
  '식신': 'Eating God',
  '상관': 'Hurting Officer',
  '편재': 'Indirect Wealth',
  '정재': 'Direct Wealth',
  '편관': 'Seven Killings',
  '정관': 'Direct Officer',
  '편인': 'Indirect Seal',
  '정인': 'Direct Seal',
};

/**
 * 십신 분류
 */
export const TEN_GOD_CATEGORIES = {
  /** 비겁 (비견 + 겁재) - 형제자매, 경쟁자 */
  peers: ['비견', '겁재'] as TenGodType[],
  /** 식상 (식신 + 상관) - 표현, 재능, 자녀 */
  output: ['식신', '상관'] as TenGodType[],
  /** 재성 (편재 + 정재) - 재물, 아버지, 아내(남성) */
  wealth: ['편재', '정재'] as TenGodType[],
  /** 관성 (편관 + 정관) - 직업, 권력, 남편(여성) */
  power: ['편관', '정관'] as TenGodType[],
  /** 인성 (편인 + 정인) - 학문, 어머니, 보호 */
  resource: ['편인', '정인'] as TenGodType[],
};

/**
 * 십신 색상 (UI용)
 */
export const TEN_GOD_COLORS: Record<TenGodType, string> = {
  '비견': '#22c55e',   // green
  '겁재': '#16a34a',   // dark green
  '식신': '#ef4444',   // red
  '상관': '#dc2626',   // dark red
  '편재': '#eab308',   // yellow
  '정재': '#ca8a04',   // dark yellow
  '편관': '#ffffff',   // white
  '정관': '#e5e5e5',   // light gray
  '편인': '#3b82f6',   // blue
  '정인': '#2563eb',   // dark blue
};

/**
 * 십신 목록 (순서대로)
 */
export const TEN_GOD_LIST: TenGodType[] = [
  '비견', '겁재', '식신', '상관', '편재',
  '정재', '편관', '정관', '편인', '정인',
];
