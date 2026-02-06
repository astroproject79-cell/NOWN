/**
 * 공망(空亡) 상수
 * 60갑자의 각 순(旬)에서 빠진 지지 2개
 */

/** 60갑자 6순(六旬) */
export const SIXTY_CYCLE_GROUPS = [
  { name: '갑자순', hanja: '甲子旬', start: 0, empty: ['술', '해'] },   // 갑자~계유, 술해공망
  { name: '갑술순', hanja: '甲戌旬', start: 10, empty: ['신', '유'] }, // 갑술~계미, 신유공망
  { name: '갑신순', hanja: '甲申旬', start: 20, empty: ['오', '미'] }, // 갑신~계사, 오미공망
  { name: '갑오순', hanja: '甲午旬', start: 30, empty: ['진', '사'] }, // 갑오~계묘, 진사공망
  { name: '갑진순', hanja: '甲辰旬', start: 40, empty: ['인', '묘'] }, // 갑진~계축, 인묘공망
  { name: '갑인순', hanja: '甲寅旬', start: 50, empty: ['자', '축'] }, // 갑인~계해, 자축공망
];

/**
 * 60갑자 인덱스로 공망 지지 찾기
 */
export function getEmptyBranches(sexagenaryIndex: number): {
  branches: [string, string];
  cycle: string;
  cycleHanja: string;
} {
  // 어느 순에 속하는지 계산
  const groupIndex = Math.floor(sexagenaryIndex / 10);
  const group = SIXTY_CYCLE_GROUPS[groupIndex];

  return {
    branches: group.empty as [string, string],
    cycle: group.name,
    cycleHanja: group.hanja,
  };
}

/** 공망 해석 */
export const EMPTY_BRANCH_INTERPRETATIONS: Record<string, string> = {
  '년': '조상/부모의 덕이 부족하거나 고향을 떠남',
  '월': '형제/직장운이 약하거나 변동이 많음',
  '일': '배우자/가정운에 변화가 있음',
  '시': '자녀운이 약하거나 노년에 외로움',
};
