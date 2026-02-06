/**
 * 천간(天干) - 10개의 하늘 기운
 * 갑(甲), 을(乙), 병(丙), 정(丁), 무(戊), 기(己), 경(庚), 신(辛), 임(壬), 계(癸)
 */

export const HEAVENLY_STEMS = ['갑', '을', '병', '정', '무', '기', '경', '신', '임', '계'] as const;
export const HEAVENLY_STEMS_HANJA = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'] as const;

export type HeavenlyStem = typeof HEAVENLY_STEMS[number];
export type HeavenlyStemHanja = typeof HEAVENLY_STEMS_HANJA[number];

/** 천간의 오행(五行) */
export const STEM_ELEMENTS: Record<HeavenlyStem, string> = {
  '갑': '목', '을': '목',
  '병': '화', '정': '화',
  '무': '토', '기': '토',
  '경': '금', '신': '금',
  '임': '수', '계': '수',
};

/** 천간의 음양 */
export const STEM_YIN_YANG: Record<HeavenlyStem, '양' | '음'> = {
  '갑': '양', '을': '음',
  '병': '양', '정': '음',
  '무': '양', '기': '음',
  '경': '양', '신': '음',
  '임': '양', '계': '음',
};

/** 천간 인덱스 조회 */
export function getStemIndex(stem: HeavenlyStem): number {
  return HEAVENLY_STEMS.indexOf(stem);
}

/** 인덱스로 천간 조회 */
export function getStemByIndex(index: number): HeavenlyStem {
  const normalizedIndex = ((index % 10) + 10) % 10;
  return HEAVENLY_STEMS[normalizedIndex];
}

/** 천간이 양간인지 확인 */
export function isYangStem(stem: HeavenlyStem): boolean {
  return STEM_YIN_YANG[stem] === '양';
}

/** 천간의 한자 조회 */
export function getStemHanja(stem: HeavenlyStem): HeavenlyStemHanja {
  const index = getStemIndex(stem);
  return HEAVENLY_STEMS_HANJA[index];
}
