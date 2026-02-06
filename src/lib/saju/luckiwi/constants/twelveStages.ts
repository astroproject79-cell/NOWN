/**
 * 12운성(十二運星) 상수
 * 천간이 지지를 만났을 때의 생명 주기
 */

import { TwelveStage, TwelveStageHanja } from '../types/twelveStages';

/** 12운성 순서 (장생에서 시작) */
export const TWELVE_STAGES: TwelveStage[] = [
  '장생', '목욕', '관대', '건록', '제왕',
  '쇠', '병', '사', '묘', '절', '태', '양'
];

/** 12운성 한자 */
export const TWELVE_STAGES_HANJA: Record<TwelveStage, TwelveStageHanja> = {
  '장생': '長生',
  '목욕': '沐浴',
  '관대': '冠帶',
  '건록': '建祿',
  '제왕': '帝旺',
  '쇠': '衰',
  '병': '病',
  '사': '死',
  '묘': '墓',
  '절': '絶',
  '태': '胎',
  '양': '養',
};

/** 12운성 강약 분류 */
export const TWELVE_STAGES_STRENGTH: Record<TwelveStage, 'strong' | 'neutral' | 'weak'> = {
  '장생': 'strong',
  '목욕': 'neutral',
  '관대': 'strong',
  '건록': 'strong',
  '제왕': 'strong',
  '쇠': 'weak',
  '병': 'weak',
  '사': 'weak',
  '묘': 'weak',
  '절': 'weak',
  '태': 'neutral',
  '양': 'neutral',
};

/** 12운성 설명 */
export const TWELVE_STAGES_DESCRIPTION: Record<TwelveStage, string> = {
  '장생': '탄생, 새로운 시작, 성장의 기운',
  '목욕': '정화, 변화, 불안정한 시기',
  '관대': '성장, 활력, 사회 진출',
  '건록': '전성기, 독립, 자립의 시기',
  '제왕': '최고조, 권력, 절정의 시기',
  '쇠': '하강, 쇠퇴의 시작',
  '병': '약화, 병약함',
  '사': '정지, 끝, 전환점',
  '묘': '저장, 잠복, 숨은 힘',
  '절': '단절, 소멸, 무에서 유로',
  '태': '잉태, 새로운 가능성',
  '양': '양육, 준비, 성장 전 단계',
};

/**
 * 천간별 12운성 시작 지지 (장생 위치)
 * 양간: 순행, 음간: 역행
 */
export const STEM_TWELVE_STAGE_START: Record<string, number> = {
  // 양간 (순행)
  '갑': 11,  // 해(亥)에서 장생
  '병': 2,   // 인(寅)에서 장생
  '무': 2,   // 인(寅)에서 장생 (병과 동일)
  '경': 5,   // 사(巳)에서 장생
  '임': 8,   // 신(申)에서 장생
  // 음간 (역행)
  '을': 6,   // 오(午)에서 장생
  '정': 9,   // 유(酉)에서 장생
  '기': 9,   // 유(酉)에서 장생 (정과 동일)
  '신': 0,   // 자(子)에서 장생
  '계': 3,   // 묘(卯)에서 장생
};

/** 양간 여부 */
export const IS_YANG_STEM: Record<string, boolean> = {
  '갑': true,
  '을': false,
  '병': true,
  '정': false,
  '무': true,
  '기': false,
  '경': true,
  '신': false,
  '임': true,
  '계': false,
};
