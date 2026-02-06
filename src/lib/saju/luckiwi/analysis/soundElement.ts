/**
 * 납음오행(納音五行) 분석 모듈
 */

import { FourPillars } from '../types';
import { Element } from '../types/elements';
import { SoundElementInfo, SoundElementAnalysis } from '../types/soundElement';
import { getSoundElement } from '../constants/soundElement';

/**
 * 납음 정보 생성
 */
function createSoundElementInfo(
  sexagenary: string,
  sexagenaryIndex: number
): SoundElementInfo {
  const data = getSoundElement(sexagenaryIndex);

  return {
    sexagenary,
    name: data.name,
    nameHanja: data.hanja,
    element: data.element,
    description: data.description,
  };
}

/**
 * 납음오행 분석
 */
export function analyzeSoundElement(fourPillars: FourPillars): SoundElementAnalysis {
  const year = createSoundElementInfo(
    fourPillars.year.full,
    fourPillars.year.sexagenaryIndex
  );
  const month = createSoundElementInfo(
    fourPillars.month.full,
    fourPillars.month.sexagenaryIndex
  );
  const day = createSoundElementInfo(
    fourPillars.day.full,
    fourPillars.day.sexagenaryIndex
  );
  const hour = createSoundElementInfo(
    fourPillars.hour.full,
    fourPillars.hour.sexagenaryIndex
  );

  // 오행별 개수 계산
  const elementCount: Record<Element, number> = {
    '목': 0,
    '화': 0,
    '토': 0,
    '금': 0,
    '수': 0,
  };

  [year, month, day, hour].forEach(info => {
    elementCount[info.element]++;
  });

  // 가장 많은 오행 찾기
  let dominantElement: Element = '목';
  let maxCount = 0;
  (Object.keys(elementCount) as Element[]).forEach(element => {
    if (elementCount[element] > maxCount) {
      maxCount = elementCount[element];
      dominantElement = element;
    }
  });

  // 해석 생성
  const elementNames: Record<Element, string> = {
    '목': '목(木)',
    '화': '화(火)',
    '토': '토(土)',
    '금': '금(金)',
    '수': '수(水)',
  };

  const elementTraits: Record<Element, string> = {
    '목': '성장, 인자함, 창의성이 강함',
    '화': '열정, 예의, 표현력이 강함',
    '토': '신뢰, 안정, 중재 능력이 강함',
    '금': '결단력, 정의, 강인함이 강함',
    '수': '지혜, 유연함, 소통 능력이 강함',
  };

  const interpretation = maxCount >= 2
    ? `납음에 ${elementNames[dominantElement]}이 많아 ${elementTraits[dominantElement]}.`
    : '납음오행이 고르게 분포되어 균형잡힌 기질을 가집니다.';

  return {
    year,
    month,
    day,
    hour,
    elementCount,
    summary: {
      dominantElement,
      interpretation,
    },
  };
}

/**
 * 납음오행 분석 요약 문자열 생성
 */
export function summarizeSoundElement(analysis: SoundElementAnalysis): string {
  const parts: string[] = [];

  parts.push(`년납음: ${analysis.year.name}(${analysis.year.element})`);
  parts.push(`일납음: ${analysis.day.name}(${analysis.day.element})`);
  parts.push(analysis.summary.interpretation);

  return parts.join('\n');
}
