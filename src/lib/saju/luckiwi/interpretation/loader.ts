/**
 * 해석 데이터 로더
 *
 * JSON 파일에서 해석 데이터를 로드하고 캐싱
 */

import { DayPillarInterpretation, DayPillarInterpretationData } from './types';

// 일주 해석 데이터 (빌드 시 임포트)
import dayPillarsRaw from './data/dayPillars.json';

// ============================================
// 타입 정의
// ============================================

interface DayPillarsDataFile {
  version: string;
  lastUpdated: string;
  description: string;
  sources: string[];
  data: DayPillarInterpretationData;
}

// ============================================
// 데이터 캐시
// ============================================

const dayPillarsData = dayPillarsRaw as DayPillarsDataFile;

// ============================================
// 일주 해석 조회
// ============================================

/**
 * 일주 해석 데이터 조회
 * @param dayPillarName 일주 이름 (예: "경자", "갑진")
 * @returns 일주 해석 데이터 또는 null
 */
export function getDayPillarInterpretation(
  dayPillarName: string
): DayPillarInterpretation | null {
  return dayPillarsData.data[dayPillarName] || null;
}

/**
 * 모든 일주 해석 데이터 조회
 * @returns 전체 일주 해석 데이터
 */
export function getAllDayPillarInterpretations(): DayPillarInterpretationData {
  return dayPillarsData.data;
}

/**
 * 사용 가능한 일주 목록 조회
 * @returns 일주 이름 배열
 */
export function getAvailableDayPillars(): string[] {
  return Object.keys(dayPillarsData.data);
}

/**
 * 데이터 버전 정보 조회
 */
export function getDataVersion(): {
  version: string;
  lastUpdated: string;
  sources: string[];
} {
  return {
    version: dayPillarsData.version,
    lastUpdated: dayPillarsData.lastUpdated,
    sources: dayPillarsData.sources,
  };
}

// ============================================
// 해석 텍스트 생성 (헬퍼)
// ============================================

/**
 * 일주 기본 해석 텍스트 생성
 * @param dayPillarName 일주 이름
 * @returns 포맷팅된 해석 텍스트
 */
export function generateDayPillarText(dayPillarName: string): string | null {
  const interpretation = getDayPillarInterpretation(dayPillarName);
  if (!interpretation) return null;

  const { keywords, basic, personality, career, relationship, advice } =
    interpretation;

  // 키워드 포맷팅
  const keywordTexts = keywords
    .map((k) => `${k.term}(${k.hanja})`)
    .join(', ');

  return `【${interpretation.name}일주(${interpretation.hanja})】

◆ 핵심 키워드: ${keywordTexts}

◆ 기본 특성
${basic.summary}

${basic.description}

◆ 성격
• 장점: ${personality.strengths.join(', ')}
• 단점: ${personality.weaknesses.join(', ')}

${personality.description}

◆ 직업적성
• 적합: ${career.suitable.join(', ')}
${career.unsuitable ? `• 비적합: ${career.unsuitable.join(', ')}` : ''}

${career.description}

◆ 대인관계
${relationship.description}

◆ 조언
• 장점 활용: ${advice.leverageStrength}
• 주의점: ${advice.caution}
• 실천 방안: ${advice.action}`;
}
