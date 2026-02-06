/**
 * 지지(地支) - 12개의 땅 기운
 * 자(子), 축(丑), 인(寅), 묘(卯), 진(辰), 사(巳), 오(午), 미(未), 신(申), 유(酉), 술(戌), 해(亥)
 */

export const EARTHLY_BRANCHES = ['자', '축', '인', '묘', '진', '사', '오', '미', '신', '유', '술', '해'] as const;
export const EARTHLY_BRANCHES_HANJA = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'] as const;

export type EarthlyBranch = typeof EARTHLY_BRANCHES[number];
export type EarthlyBranchHanja = typeof EARTHLY_BRANCHES_HANJA[number];

/** 지지의 오행(五行) */
export const BRANCH_ELEMENTS: Record<EarthlyBranch, string> = {
  '자': '수', '축': '토',
  '인': '목', '묘': '목',
  '진': '토', '사': '화',
  '오': '화', '미': '토',
  '신': '금', '유': '금',
  '술': '토', '해': '수',
};

/** 지지의 음양 */
export const BRANCH_YIN_YANG: Record<EarthlyBranch, '양' | '음'> = {
  '자': '양', '축': '음',
  '인': '양', '묘': '음',
  '진': '양', '사': '음',
  '오': '양', '미': '음',
  '신': '양', '유': '음',
  '술': '양', '해': '음',
};

/** 지지별 띠 동물 */
export const BRANCH_ANIMALS: Record<EarthlyBranch, string> = {
  '자': '쥐', '축': '소',
  '인': '호랑이', '묘': '토끼',
  '진': '용', '사': '뱀',
  '오': '말', '미': '양',
  '신': '원숭이', '유': '닭',
  '술': '개', '해': '돼지',
};

/** 시간대별 지지 (시작 시간, 24시간 기준) */
export const BRANCH_HOUR_START: Record<EarthlyBranch, number> = {
  '자': 23, '축': 1,
  '인': 3, '묘': 5,
  '진': 7, '사': 9,
  '오': 11, '미': 13,
  '신': 15, '유': 17,
  '술': 19, '해': 21,
};

/** 지지 인덱스 조회 */
export function getBranchIndex(branch: EarthlyBranch): number {
  return EARTHLY_BRANCHES.indexOf(branch);
}

/** 인덱스로 지지 조회 */
export function getBranchByIndex(index: number): EarthlyBranch {
  const normalizedIndex = ((index % 12) + 12) % 12;
  return EARTHLY_BRANCHES[normalizedIndex];
}

/** 시간으로 지지 조회 (0-23) */
export function getBranchByHour(hour: number): EarthlyBranch {
  // 자시: 23:00-00:59, 축시: 01:00-02:59, ...
  if (hour === 23 || hour === 0) return '자';
  const index = Math.floor((hour + 1) / 2);
  return EARTHLY_BRANCHES[index];
}

/** 지지의 한자 조회 */
export function getBranchHanja(branch: EarthlyBranch): EarthlyBranchHanja {
  const index = getBranchIndex(branch);
  return EARTHLY_BRANCHES_HANJA[index];
}
