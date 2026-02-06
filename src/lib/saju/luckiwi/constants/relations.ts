/**
 * 간지 관계(合沖刑害破) 상수 정의
 */

import { HeavenlyStem } from './stems';
import { EarthlyBranch } from './branches';
import { Element } from '../types/elements';

/**
 * 천간합(天干合) - 5쌍
 * 甲己合土, 乙庚合金, 丙辛合水, 丁壬合木, 戊癸合火
 */
export const STEM_COMBINATIONS: Array<{
  stems: [HeavenlyStem, HeavenlyStem];
  resultElement: Element;
}> = [
  { stems: ['갑', '기'], resultElement: '토' },  // 甲己合土
  { stems: ['을', '경'], resultElement: '금' },  // 乙庚合金
  { stems: ['병', '신'], resultElement: '수' },  // 丙辛合水
  { stems: ['정', '임'], resultElement: '목' },  // 丁壬合木
  { stems: ['무', '계'], resultElement: '화' },  // 戊癸合火
];

/**
 * 지지 육합(六合) - 6쌍
 */
export const SIX_COMBINATIONS: Array<{
  branches: [EarthlyBranch, EarthlyBranch];
  resultElement: Element;
}> = [
  { branches: ['자', '축'], resultElement: '토' },  // 子丑合土
  { branches: ['인', '해'], resultElement: '목' },  // 寅亥合木
  { branches: ['묘', '술'], resultElement: '화' },  // 卯戌合火
  { branches: ['진', '유'], resultElement: '금' },  // 辰酉合金
  { branches: ['사', '신'], resultElement: '수' },  // 巳申合水
  { branches: ['오', '미'], resultElement: '토' },  // 午未合土 (일설에는 火)
];

/**
 * 지지 삼합(三合) - 4조
 * 각 삼합은 생지(生支), 왕지(旺支), 고지(庫支)로 구성
 */
export const TRIPLE_COMBINATIONS: Array<{
  branches: [EarthlyBranch, EarthlyBranch, EarthlyBranch]; // [생지, 왕지, 고지]
  resultElement: Element;
}> = [
  { branches: ['해', '묘', '미'], resultElement: '목' },  // 亥卯未合木 (수생목왕목고)
  { branches: ['인', '오', '술'], resultElement: '화' },  // 寅午戌合火 (목생화왕화고)
  { branches: ['사', '유', '축'], resultElement: '금' },  // 巳酉丑合金 (화생금왕금고)
  { branches: ['신', '자', '진'], resultElement: '수' },  // 申子辰合水 (금생수왕수고)
];

/**
 * 반합 정보를 위한 삼합 상세
 * 생지-왕지 반합, 왕지-고지 반합이 더 강함
 */
export const TRIPLE_COMBINATION_PARTS: Array<{
  birth: EarthlyBranch;      // 생지
  prosperity: EarthlyBranch; // 왕지
  storage: EarthlyBranch;    // 고지
  resultElement: Element;
}> = [
  { birth: '해', prosperity: '묘', storage: '미', resultElement: '목' },
  { birth: '인', prosperity: '오', storage: '술', resultElement: '화' },
  { birth: '사', prosperity: '유', storage: '축', resultElement: '금' },
  { birth: '신', prosperity: '자', storage: '진', resultElement: '수' },
];

/**
 * 방합(方合) - 4방위
 * 같은 방위(계절)의 3개 지지
 */
export const DIRECTIONAL_COMBINATIONS: Array<{
  branches: [EarthlyBranch, EarthlyBranch, EarthlyBranch];
  direction: '동' | '남' | '서' | '북';
  element: Element;
}> = [
  { branches: ['인', '묘', '진'], direction: '동', element: '목' },  // 東方木局 (봄)
  { branches: ['사', '오', '미'], direction: '남', element: '화' },  // 南方火局 (여름)
  { branches: ['신', '유', '술'], direction: '서', element: '금' },  // 西方金局 (가을)
  { branches: ['해', '자', '축'], direction: '북', element: '수' },  // 北方水局 (겨울)
];

/**
 * 지지 육충(六沖) - 6쌍
 * 서로 마주보는 지지끼리 충돌
 */
export const SIX_CLASHES: Array<[EarthlyBranch, EarthlyBranch]> = [
  ['자', '오'],  // 子午沖
  ['축', '미'],  // 丑未沖
  ['인', '신'],  // 寅申沖
  ['묘', '유'],  // 卯酉沖
  ['진', '술'],  // 辰戌沖
  ['사', '해'],  // 巳亥沖
];

/**
 * 지지 형(刑)
 */
export const PUNISHMENTS = {
  /**
   * 무은지형(無恩之刑) - 은혜를 모르는 형
   * 寅刑巳, 巳刑申, 申刑寅 (순환)
   */
  graceless: {
    pairs: [
      ['인', '사'] as [EarthlyBranch, EarthlyBranch],
      ['사', '신'] as [EarthlyBranch, EarthlyBranch],
      ['신', '인'] as [EarthlyBranch, EarthlyBranch],
    ],
    members: ['인', '사', '신'] as EarthlyBranch[],
  },

  /**
   * 세력지형(勢力之刑) / 지세지형 - 권세를 믿는 형
   * 丑刑戌, 戌刑未, 未刑丑 (순환)
   */
  bullying: {
    pairs: [
      ['축', '술'] as [EarthlyBranch, EarthlyBranch],
      ['술', '미'] as [EarthlyBranch, EarthlyBranch],
      ['미', '축'] as [EarthlyBranch, EarthlyBranch],
    ],
    members: ['축', '술', '미'] as EarthlyBranch[],
  },

  /**
   * 자형(自刑) - 스스로 형벌
   * 辰刑辰, 午刑午, 酉刑酉, 亥刑亥
   */
  self: ['진', '오', '유', '해'] as EarthlyBranch[],
};

/**
 * 지지 해(害) - 6쌍
 * 육합을 방해하는 관계
 */
export const SIX_HARMS: Array<[EarthlyBranch, EarthlyBranch]> = [
  ['자', '미'],  // 子未害
  ['축', '오'],  // 丑午害
  ['인', '사'],  // 寅巳害
  ['묘', '진'],  // 卯辰害
  ['신', '해'],  // 申亥害
  ['유', '술'],  // 酉戌害
];

/**
 * 지지 파(破) - 6쌍
 * 삼합을 깨뜨리는 관계
 */
export const SIX_DESTRUCTIONS: Array<[EarthlyBranch, EarthlyBranch]> = [
  ['자', '유'],  // 子酉破
  ['축', '진'],  // 丑辰破
  ['인', '해'],  // 寅亥破
  ['묘', '오'],  // 卯午破
  ['사', '신'],  // 巳申破
  ['미', '술'],  // 未戌破
];

/**
 * 천간합 확인
 * @param stem1 첫 번째 천간
 * @param stem2 두 번째 천간
 * @returns 합 정보 또는 null
 */
export function checkStemCombination(
  stem1: HeavenlyStem,
  stem2: HeavenlyStem
): { resultElement: Element } | null {
  for (const combo of STEM_COMBINATIONS) {
    if (
      (combo.stems[0] === stem1 && combo.stems[1] === stem2) ||
      (combo.stems[0] === stem2 && combo.stems[1] === stem1)
    ) {
      return { resultElement: combo.resultElement };
    }
  }
  return null;
}

/**
 * 육합 확인
 * @param branch1 첫 번째 지지
 * @param branch2 두 번째 지지
 * @returns 합 정보 또는 null
 */
export function checkSixCombination(
  branch1: EarthlyBranch,
  branch2: EarthlyBranch
): { resultElement: Element } | null {
  for (const combo of SIX_COMBINATIONS) {
    if (
      (combo.branches[0] === branch1 && combo.branches[1] === branch2) ||
      (combo.branches[0] === branch2 && combo.branches[1] === branch1)
    ) {
      return { resultElement: combo.resultElement };
    }
  }
  return null;
}

/**
 * 육충 확인
 * @param branch1 첫 번째 지지
 * @param branch2 두 번째 지지
 * @returns 충 여부
 */
export function checkClash(
  branch1: EarthlyBranch,
  branch2: EarthlyBranch
): boolean {
  for (const [a, b] of SIX_CLASHES) {
    if ((a === branch1 && b === branch2) || (a === branch2 && b === branch1)) {
      return true;
    }
  }
  return false;
}

/**
 * 해 확인
 * @param branch1 첫 번째 지지
 * @param branch2 두 번째 지지
 * @returns 해 여부
 */
export function checkHarm(
  branch1: EarthlyBranch,
  branch2: EarthlyBranch
): boolean {
  for (const [a, b] of SIX_HARMS) {
    if ((a === branch1 && b === branch2) || (a === branch2 && b === branch1)) {
      return true;
    }
  }
  return false;
}

/**
 * 파 확인
 * @param branch1 첫 번째 지지
 * @param branch2 두 번째 지지
 * @returns 파 여부
 */
export function checkDestruction(
  branch1: EarthlyBranch,
  branch2: EarthlyBranch
): boolean {
  for (const [a, b] of SIX_DESTRUCTIONS) {
    if ((a === branch1 && b === branch2) || (a === branch2 && b === branch1)) {
      return true;
    }
  }
  return false;
}
