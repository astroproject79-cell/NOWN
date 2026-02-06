/**
 * 납음오행(納音五行) 상수
 * 60갑자 각각의 납음
 */

import { Element } from '../types/elements';
import { SoundElementType } from '../types/soundElement';

/** 납음 데이터 (60갑자 순서) */
export const SOUND_ELEMENTS: {
  name: SoundElementType;
  hanja: string;
  element: Element;
  description: string;
}[] = [
  // 0-1: 갑자, 을축 - 해중금
  { name: '해중금', hanja: '海中金', element: '금', description: '바다 속의 금, 숨겨진 재능' },
  { name: '해중금', hanja: '海中金', element: '금', description: '바다 속의 금, 숨겨진 재능' },
  // 2-3: 병인, 정묘 - 노중화
  { name: '노중화', hanja: '爐中火', element: '화', description: '화로 속의 불, 내적 열정' },
  { name: '노중화', hanja: '爐中火', element: '화', description: '화로 속의 불, 내적 열정' },
  // 4-5: 무진, 기사 - 대림목
  { name: '대림목', hanja: '大林木', element: '목', description: '큰 숲의 나무, 성장과 번영' },
  { name: '대림목', hanja: '大林木', element: '목', description: '큰 숲의 나무, 성장과 번영' },
  // 6-7: 경오, 신미 - 노방토
  { name: '노방토', hanja: '路傍土', element: '토', description: '길가의 흙, 실용적 능력' },
  { name: '노방토', hanja: '路傍土', element: '토', description: '길가의 흙, 실용적 능력' },
  // 8-9: 임신, 계유 - 검봉금
  { name: '검봉금', hanja: '劍鋒金', element: '금', description: '칼날의 금, 날카로운 판단력' },
  { name: '검봉금', hanja: '劍鋒金', element: '금', description: '칼날의 금, 날카로운 판단력' },
  // 10-11: 갑술, 을해 - 산두화
  { name: '산두화', hanja: '山頭火', element: '화', description: '산꼭대기 불, 높은 이상' },
  { name: '산두화', hanja: '山頭火', element: '화', description: '산꼭대기 불, 높은 이상' },
  // 12-13: 병자, 정축 - 간하수
  { name: '간하수', hanja: '澗下水', element: '수', description: '계곡의 물, 지혜와 유연성' },
  { name: '간하수', hanja: '澗下水', element: '수', description: '계곡의 물, 지혜와 유연성' },
  // 14-15: 무인, 기묘 - 성두토
  { name: '성두토', hanja: '城頭土', element: '토', description: '성벽의 흙, 방어와 안정' },
  { name: '성두토', hanja: '城頭土', element: '토', description: '성벽의 흙, 방어와 안정' },
  // 16-17: 경진, 신사 - 백납금
  { name: '백납금', hanja: '白蠟金', element: '금', description: '백랍의 금, 순수함과 정제' },
  { name: '백납금', hanja: '白蠟金', element: '금', description: '백랍의 금, 순수함과 정제' },
  // 18-19: 임오, 계미 - 양류목
  { name: '양류목', hanja: '楊柳木', element: '목', description: '버드나무, 유연함과 적응력' },
  { name: '양류목', hanja: '楊柳木', element: '목', description: '버드나무, 유연함과 적응력' },
  // 20-21: 갑신, 을유 - 정천수
  { name: '정천수', hanja: '井泉水', element: '수', description: '우물물, 생명력과 지속성' },
  { name: '정천수', hanja: '井泉水', element: '수', description: '우물물, 생명력과 지속성' },
  // 22-23: 병술, 정해 - 옥상토
  { name: '옥상토', hanja: '屋上土', element: '토', description: '지붕 위의 흙, 보호와 안전' },
  { name: '옥상토', hanja: '屋上土', element: '토', description: '지붕 위의 흙, 보호와 안전' },
  // 24-25: 무자, 기축 - 벽력화
  { name: '벽력화', hanja: '霹靂火', element: '화', description: '번개불, 강렬한 에너지' },
  { name: '벽력화', hanja: '霹靂火', element: '화', description: '번개불, 강렬한 에너지' },
  // 26-27: 경인, 신묘 - 송백목
  { name: '송백목', hanja: '松柏木', element: '목', description: '소나무, 굳건함과 절개' },
  { name: '송백목', hanja: '松柏木', element: '목', description: '소나무, 굳건함과 절개' },
  // 28-29: 임진, 계사 - 장류수
  { name: '장류수', hanja: '長流水', element: '수', description: '긴 흐르는 물, 끈기와 지속' },
  { name: '장류수', hanja: '長流水', element: '수', description: '긴 흐르는 물, 끈기와 지속' },
  // 30-31: 갑오, 을미 - 사중금
  { name: '사중금', hanja: '砂中金', element: '금', description: '모래 속 금, 숨은 가치' },
  { name: '사중금', hanja: '砂中金', element: '금', description: '모래 속 금, 숨은 가치' },
  // 32-33: 병신, 정유 - 산하화
  { name: '산하화', hanja: '山下火', element: '화', description: '산 아래 불, 온화한 열정' },
  { name: '산하화', hanja: '山下火', element: '화', description: '산 아래 불, 온화한 열정' },
  // 34-35: 무술, 기해 - 평지목
  { name: '평지목', hanja: '平地木', element: '목', description: '평지의 나무, 평범 속 비범' },
  { name: '평지목', hanja: '平地木', element: '목', description: '평지의 나무, 평범 속 비범' },
  // 36-37: 경자, 신축 - 벽상토
  { name: '벽상토', hanja: '壁上土', element: '토', description: '벽 위의 흙, 예술성' },
  { name: '벽상토', hanja: '壁上土', element: '토', description: '벽 위의 흙, 예술성' },
  // 38-39: 임인, 계묘 - 금박금
  { name: '금박금', hanja: '金箔金', element: '금', description: '금박, 화려함과 외면' },
  { name: '금박금', hanja: '金箔金', element: '금', description: '금박, 화려함과 외면' },
  // 40-41: 갑진, 을사 - 복등화
  { name: '복등화', hanja: '覆燈火', element: '화', description: '덮인 등불, 숨겨진 지혜' },
  { name: '복등화', hanja: '覆燈火', element: '화', description: '덮인 등불, 숨겨진 지혜' },
  // 42-43: 병오, 정미 - 천하수
  { name: '천하수', hanja: '天河水', element: '수', description: '은하수, 높은 이상' },
  { name: '천하수', hanja: '天河水', element: '수', description: '은하수, 높은 이상' },
  // 44-45: 무신, 기유 - 대역토
  { name: '대역토', hanja: '大驛土', element: '토', description: '역참의 흙, 교류와 소통' },
  { name: '대역토', hanja: '大驛土', element: '토', description: '역참의 흙, 교류와 소통' },
  // 46-47: 경술, 신해 - 차천금
  { name: '차천금', hanja: '釵釧金', element: '금', description: '비녀 금, 섬세함과 아름다움' },
  { name: '차천금', hanja: '釵釧金', element: '금', description: '비녀 금, 섬세함과 아름다움' },
  // 48-49: 임자, 계축 - 상자목
  { name: '상자목', hanja: '桑柘木', element: '목', description: '뽕나무, 실용과 번영' },
  { name: '상자목', hanja: '桑柘木', element: '목', description: '뽕나무, 실용과 번영' },
  // 50-51: 갑인, 을묘 - 대계수
  { name: '대계수', hanja: '大溪水', element: '수', description: '큰 시냇물, 풍요와 흐름' },
  { name: '대계수', hanja: '大溪水', element: '수', description: '큰 시냇물, 풍요와 흐름' },
  // 52-53: 병진, 정사 - 사중토
  { name: '사중토', hanja: '沙中土', element: '토', description: '모래 속 흙, 인내와 지속' },
  { name: '사중토', hanja: '沙中土', element: '토', description: '모래 속 흙, 인내와 지속' },
  // 54-55: 무오, 기미 - 천상화
  { name: '천상화', hanja: '天上火', element: '화', description: '하늘의 불, 빛나는 존재' },
  { name: '천상화', hanja: '天上火', element: '화', description: '하늘의 불, 빛나는 존재' },
  // 56-57: 경신, 신유 - 석류목
  { name: '석류목', hanja: '石榴木', element: '목', description: '석류나무, 다산과 풍요' },
  { name: '석류목', hanja: '石榴木', element: '목', description: '석류나무, 다산과 풍요' },
  // 58-59: 임술, 계해 - 대해수
  { name: '대해수', hanja: '大海水', element: '수', description: '큰 바다, 무한한 포용' },
  { name: '대해수', hanja: '大海水', element: '수', description: '큰 바다, 무한한 포용' },
];

/**
 * 60갑자 인덱스로 납음 정보 가져오기
 */
export function getSoundElement(sexagenaryIndex: number): {
  name: SoundElementType;
  hanja: string;
  element: Element;
  description: string;
} {
  return SOUND_ELEMENTS[sexagenaryIndex];
}
