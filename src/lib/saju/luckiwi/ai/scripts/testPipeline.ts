/**
 * AI 파이프라인 테스트 스크립트
 */
import 'dotenv/config';
import { aiEvaluate } from '../evaluation';

// 테스트용 통변문 (낮은 점수를 받도록 일부러 간략하게 작성)
const testStory = `
당신은 정묘일주입니다. 정화 일간에 묘목이 있어서 불과 나무가 만났습니다.

[기본 구조]
식신생재격으로 재물운이 좋습니다. 관살혼잡이 없어서 안정적입니다.

[오행]
목 오행이 강합니다. 수 오행이 필요합니다.

[연애]
관계에서 신중한 편입니다.

[직업]
창작 분야가 좋습니다.

[결론]
좋은 사주입니다.
`;

async function test() {
  console.log('=== AI 평가 테스트 시작 ===\n');

  // EvaluationInput 형식으로 변환
  const evalInput = {
    fullText: testStory,
    sections: [
      { id: 'intro', title: '기본 구조', content: '당신은 정묘일주입니다.' },
      { id: 'structure', title: '기본 구조', content: '식신생재격으로 재물운이 좋습니다.' },
      { id: 'element', title: '오행', content: '목 오행이 강합니다. 수 오행이 필요합니다.' },
      { id: 'love', title: '연애', content: '관계에서 신중한 편입니다.' },
      { id: 'career', title: '직업', content: '창작 분야가 좋습니다.' },
      { id: 'conclusion', title: '결론', content: '좋은 사주입니다.' },
    ],
    metaphor: {
      centralImage: '불꽃',
      tone: '따뜻함',
    },
    lifeType: {
      primary: '창작자',
      secondary: '탐구자',
    },
    keySentence: '정화의 따뜻한 빛으로 주변을 밝히는 창작자의 삶',
  };

  console.log('입력 텍스트 길이:', testStory.length, '자');
  console.log('섹션 수:', evalInput.sections.length);

  console.log('\nAI 평가 중...');
  const evalResult = await aiEvaluate(evalInput);

  console.log('\n=== 1단계: AI 평가 결과 ===');
  console.log('평균 점수:', evalResult.totalScore);
  console.log('등급:', evalResult.totalGrade);
  console.log('\n차원별 점수:');
  for (const [dim, data] of Object.entries(evalResult.dimensionScores)) {
    const d = data as { score: number };
    console.log(`  ${dim}: ${d.score}`);
  }

  // 2단계: AI 개선
  console.log('\n=== 2단계: AI 개선 ===');
  const { aiImprove, applyAIImprovements } = await import('../evaluation');
  const improveResult = await aiImprove(evalInput, evalResult);
  console.log('개선 요약:', improveResult.summary);
  console.log('섹션 개선 수:', improveResult.sectionImprovements.length);
  console.log('전역 추가 수:', improveResult.globalAdditions.length);

  // 개선 사항 적용
  const improvedInput = applyAIImprovements(evalInput, improveResult);
  console.log('개선된 텍스트 길이:', improvedInput.fullText.length, '자');

  // 3단계: 개선 후 재평가
  console.log('\n=== 3단계: 개선 후 재평가 ===');
  const reevalResult = await aiEvaluate(improvedInput);

  console.log('재평가 평균 점수:', reevalResult.totalScore);
  console.log('재평가 등급:', reevalResult.totalGrade);
  console.log('\n차원별 점수 변화:');
  for (const [dim, afterData] of Object.entries(reevalResult.dimensionScores)) {
    const beforeData = evalResult.dimensionScores[dim as keyof typeof evalResult.dimensionScores];
    const before = beforeData?.score || 0;
    const after = (afterData as { score: number })?.score || 0;
    const change = after - before;
    console.log(`  ${dim}: ${before} → ${after} (${change >= 0 ? '+' : ''}${change})`);
  }

  // 결과 요약
  const improvement = ((reevalResult.totalScore - evalResult.totalScore) / evalResult.totalScore) * 100;
  console.log('\n=== 최종 결과 ===');
  console.log('초기 점수:', evalResult.totalScore);
  console.log('최종 점수:', reevalResult.totalScore);
  console.log('점수 상승:', reevalResult.totalScore - evalResult.totalScore);
  console.log('개선율:', improvement.toFixed(1), '%');
}

test().catch((err) => {
  console.error('에러 발생:', err.message);
  console.error(err.stack);
});
