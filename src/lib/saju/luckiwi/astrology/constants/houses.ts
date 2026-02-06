/**
 * 하우스 상수
 */

import type { HouseInfo, ZodiacSign, PlanetId } from '../types';

// 12 하우스 정보
export const HOUSES: HouseInfo[] = [
  {
    number: 1,
    name: 'First House',
    nameKo: '1하우스',
    keywords: ['자아', '외모', '성격', '첫인상', '시작'],
    lifeArea: '자아와 정체성',
    naturalSign: 'aries',
    naturalRuler: 'mars',
  },
  {
    number: 2,
    name: 'Second House',
    nameKo: '2하우스',
    keywords: ['재정', '소유물', '가치관', '자존감', '재능'],
    lifeArea: '물질과 가치',
    naturalSign: 'taurus',
    naturalRuler: 'venus',
  },
  {
    number: 3,
    name: 'Third House',
    nameKo: '3하우스',
    keywords: ['소통', '형제', '단거리 여행', '학습', '이웃'],
    lifeArea: '소통과 사고',
    naturalSign: 'gemini',
    naturalRuler: 'mercury',
  },
  {
    number: 4,
    name: 'Fourth House',
    nameKo: '4하우스',
    keywords: ['가정', '뿌리', '부모', '부동산', '감정적 기반'],
    lifeArea: '가정과 뿌리',
    naturalSign: 'cancer',
    naturalRuler: 'moon',
  },
  {
    number: 5,
    name: 'Fifth House',
    nameKo: '5하우스',
    keywords: ['창조성', '연애', '자녀', '즐거움', '자기표현'],
    lifeArea: '창조와 즐거움',
    naturalSign: 'leo',
    naturalRuler: 'sun',
  },
  {
    number: 6,
    name: 'Sixth House',
    nameKo: '6하우스',
    keywords: ['건강', '일상', '직업', '서비스', '반려동물'],
    lifeArea: '건강과 일상',
    naturalSign: 'virgo',
    naturalRuler: 'mercury',
  },
  {
    number: 7,
    name: 'Seventh House',
    nameKo: '7하우스',
    keywords: ['파트너십', '결혼', '계약', '공개적 적', '협력'],
    lifeArea: '관계와 파트너십',
    naturalSign: 'libra',
    naturalRuler: 'venus',
  },
  {
    number: 8,
    name: 'Eighth House',
    nameKo: '8하우스',
    keywords: ['변형', '죽음/재생', '타인의 돈', '친밀함', '신비'],
    lifeArea: '변형과 공유 자원',
    naturalSign: 'scorpio',
    naturalRuler: 'pluto', // 현대, 고전은 mars
  },
  {
    number: 9,
    name: 'Ninth House',
    nameKo: '9하우스',
    keywords: ['철학', '고등교육', '장거리 여행', '종교', '법률'],
    lifeArea: '확장과 탐험',
    naturalSign: 'sagittarius',
    naturalRuler: 'jupiter',
  },
  {
    number: 10,
    name: 'Tenth House',
    nameKo: '10하우스',
    keywords: ['커리어', '명성', '사회적 지위', '성취', '권위'],
    lifeArea: '커리어와 공적 이미지',
    naturalSign: 'capricorn',
    naturalRuler: 'saturn',
  },
  {
    number: 11,
    name: 'Eleventh House',
    nameKo: '11하우스',
    keywords: ['친구', '그룹', '희망', '이상', '인도주의'],
    lifeArea: '커뮤니티와 희망',
    naturalSign: 'aquarius',
    naturalRuler: 'uranus', // 현대, 고전은 saturn
  },
  {
    number: 12,
    name: 'Twelfth House',
    nameKo: '12하우스',
    keywords: ['무의식', '고립', '영성', '숨겨진 적', '카르마'],
    lifeArea: '무의식과 영성',
    naturalSign: 'pisces',
    naturalRuler: 'neptune', // 현대, 고전은 jupiter
  },
];

// 하우스 번호로 정보 가져오기
export function getHouseInfo(houseNumber: number): HouseInfo {
  if (houseNumber < 1 || houseNumber > 12) {
    throw new Error(`Invalid house number: ${houseNumber}`);
  }
  return HOUSES[houseNumber - 1];
}

// 타입과 상수는 types/houses.ts에서 import
import { HouseType, ANGULAR_HOUSES, SUCCEDENT_HOUSES, CADENT_HOUSES } from '../types/houses';

// 하우스 유형 판단
export function getHouseType(houseNumber: number): HouseType {
  if ((ANGULAR_HOUSES as readonly number[]).includes(houseNumber)) return 'angular';
  if ((SUCCEDENT_HOUSES as readonly number[]).includes(houseNumber)) return 'succedent';
  return 'cadent';
}

// 하우스 유형별 강도
export const HOUSE_TYPE_STRENGTH: Record<HouseType, number> = {
  angular: 3,
  succedent: 2,
  cadent: 1,
};

// 경도가 어느 하우스에 속하는지 계산
export function getHouseForLongitude(longitude: number, cusps: number[]): number {
  const normalized = ((longitude % 360) + 360) % 360;

  for (let i = 0; i < 12; i++) {
    const currentCusp = cusps[i];
    const nextCusp = cusps[(i + 1) % 12];

    // 12하우스에서 1하우스로 넘어가는 경우 (0도를 넘는 경우)
    if (nextCusp < currentCusp) {
      if (normalized >= currentCusp || normalized < nextCusp) {
        return i + 1;
      }
    } else {
      if (normalized >= currentCusp && normalized < nextCusp) {
        return i + 1;
      }
    }
  }

  return 1; // 기본값
}
