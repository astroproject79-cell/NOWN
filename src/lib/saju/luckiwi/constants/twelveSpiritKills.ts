/**
 * 12신살(十二神殺) 상수
 * 년지/일지를 기준으로 다른 지지와의 관계
 */

import { TwelveSpiritKillType } from '../types/twelveSpiritKills';

/** 12신살 한자 */
export const TWELVE_SPIRIT_KILL_HANJA: Record<TwelveSpiritKillType, string> = {
  '겁살': '劫殺',
  '재살': '災殺',
  '천살': '天殺',
  '지살': '地殺',
  '년살': '年殺',
  '월살': '月殺',
  '망신살': '亡身殺',
  '장성살': '將星殺',
  '반안살': '攀鞍殺',
  '역마': '驛馬',
  '육해': '六害',
  '화개': '華蓋',
};

/** 12신살 카테고리 */
export const TWELVE_SPIRIT_KILL_CATEGORY: Record<TwelveSpiritKillType, 'auspicious' | 'inauspicious' | 'neutral'> = {
  '겁살': 'inauspicious',
  '재살': 'inauspicious',
  '천살': 'inauspicious',
  '지살': 'inauspicious',
  '년살': 'inauspicious',
  '월살': 'inauspicious',
  '망신살': 'inauspicious',
  '장성살': 'auspicious',
  '반안살': 'auspicious',
  '역마': 'neutral',
  '육해': 'inauspicious',
  '화개': 'neutral',
};

/** 12신살 설명 */
export const TWELVE_SPIRIT_KILL_DESCRIPTION: Record<TwelveSpiritKillType, string> = {
  '겁살': '겁탈, 도난, 손재수 주의',
  '재살': '재앙, 사고, 질병 주의',
  '천살': '하늘의 재앙, 돌발 사고',
  '지살': '땅의 재앙, 넘어짐 주의',
  '년살': '한 해의 액운',
  '월살': '한 달의 액운',
  '망신살': '명예 실추, 망신 주의',
  '장성살': '권력, 리더십, 승진운',
  '반안살': '귀인의 도움, 승마격',
  '역마': '이동, 변화, 해외운',
  '육해': '육친과의 불화',
  '화개': '예술성, 종교, 고독',
};

/**
 * 12신살 조견표
 * 년지/일지를 기준으로 해당 지지에 어떤 신살이 있는지
 *
 * 삼합 기준:
 * 인오술(寅午戌) - 화국
 * 사유축(巳酉丑) - 금국
 * 신자진(申子辰) - 수국
 * 해묘미(亥卯未) - 목국
 */

// 겁살: 삼합 다음 지지
export const JEOPSAL_TABLE: Record<string, string> = {
  '인': '해', '오': '해', '술': '해',
  '사': '인', '유': '인', '축': '인',
  '신': '사', '자': '사', '진': '사',
  '해': '신', '묘': '신', '미': '신',
};

// 재살: 삼합 두 번째 다음 지지
export const JAESAL_TABLE: Record<string, string> = {
  '인': '자', '오': '자', '술': '자',
  '사': '묘', '유': '묘', '축': '묘',
  '신': '오', '자': '오', '진': '오',
  '해': '유', '묘': '유', '미': '유',
};

// 천살
export const CHUNSAL_TABLE: Record<string, string> = {
  '인': '축', '오': '축', '술': '축',
  '사': '진', '유': '진', '축': '진',
  '신': '미', '자': '미', '진': '미',
  '해': '술', '묘': '술', '미': '술',
};

// 지살
export const JISAL_TABLE: Record<string, string> = {
  '인': '인', '오': '인', '술': '인',
  '사': '사', '유': '사', '축': '사',
  '신': '신', '자': '신', '진': '신',
  '해': '해', '묘': '해', '미': '해',
};

// 년살
export const NYEONSAL_TABLE: Record<string, string> = {
  '인': '묘', '오': '묘', '술': '묘',
  '사': '오', '유': '오', '축': '오',
  '신': '유', '자': '유', '진': '유',
  '해': '자', '묘': '자', '미': '자',
};

// 월살
export const WOLSAL_TABLE: Record<string, string> = {
  '인': '진', '오': '진', '술': '진',
  '사': '미', '유': '미', '축': '미',
  '신': '술', '자': '술', '진': '술',
  '해': '축', '묘': '축', '미': '축',
};

// 망신살
export const MANGSINSAL_TABLE: Record<string, string> = {
  '인': '사', '오': '사', '술': '사',
  '사': '신', '유': '신', '축': '신',
  '신': '해', '자': '해', '진': '해',
  '해': '인', '묘': '인', '미': '인',
};

// 장성살: 삼합의 중심
export const JANGSEONGSAL_TABLE: Record<string, string> = {
  '인': '오', '오': '오', '술': '오',
  '사': '유', '유': '유', '축': '유',
  '신': '자', '자': '자', '진': '자',
  '해': '묘', '묘': '묘', '미': '묘',
};

// 반안살
export const BANANSAL_TABLE: Record<string, string> = {
  '인': '미', '오': '미', '술': '미',
  '사': '술', '유': '술', '축': '술',
  '신': '축', '자': '축', '진': '축',
  '해': '진', '묘': '진', '미': '진',
};

// 역마: 삼합 충 (앞서 신살에서 정의한 것과 동일)
export const YEOKMA_TABLE: Record<string, string> = {
  '인': '신', '오': '신', '술': '신',
  '사': '해', '유': '해', '축': '해',
  '신': '인', '자': '인', '진': '인',
  '해': '사', '묘': '사', '미': '사',
};

// 육해
export const YUKHAE_TABLE: Record<string, string> = {
  '자': '미', '축': '오', '인': '사', '묘': '진',
  '진': '묘', '사': '인', '오': '축', '미': '자',
  '신': '해', '유': '술', '술': '유', '해': '신',
};

// 화개
export const HWAGAE_TABLE: Record<string, string> = {
  '인': '술', '오': '술', '술': '술',
  '사': '축', '유': '축', '축': '축',
  '신': '진', '자': '진', '진': '진',
  '해': '미', '묘': '미', '미': '미',
};
