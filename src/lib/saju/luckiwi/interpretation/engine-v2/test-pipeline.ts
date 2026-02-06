/**
 * Engine V2 전체 파이프라인 검증 테스트
 *
 * 목표: 피드백 파이프라인이 부족한 부분을 정확히 짚어내고
 *       개선된 버전이 그 부분을 채워서 나오는지 확인
 */

import * as dotenv from 'dotenv';
dotenv.config();

import { evaluate, evaluateAndImprove, improveUntilPass } from './index';
import type { EvaluationTarget, DimensionId } from './types';

// 의도적으로 약한 텍스트 (여러 차원에서 부족)
const weakTarget: EvaluationTarget = {
  fullText: `갑목 일주입니다. 나무의 기운을 가지고 있습니다.
올해 운세는 보통입니다.
건강에 주의하세요.
돈 관리를 잘 하세요.
좋은 일이 있을 것입니다.`,
  sajuInfo: {
    dayPillar: '甲子',
    dayPillarName: '갑목',
    structure: '식신격',
  },
};

async function runPipelineTest() {
  console.log('='.repeat(60));
  console.log('Engine V2 전체 파이프라인 검증 테스트');
  console.log('='.repeat(60));

  // Step 1: 진단 - 어떤 문제가 있는지 파악
  console.log('\n📋 Step 1: 초기 진단');
  console.log('-'.repeat(40));

  const initialEval = await evaluate(weakTarget, { debug: true });

  console.log('\n[초기 평가 결과]');
  console.log(`전체 통과: ${initialEval.overallPassed ? '✅ Pass' : '❌ Fail'}`);
  console.log(`평균 점수: ${initialEval.averageScore}`);
  console.log(`통과 차원: ${initialEval.passedCount}/${initialEval.dimensionResults.length}`);

  console.log('\n[차원별 결과]');
  initialEval.dimensionResults.forEach((r) => {
    const status = r.passed ? '✅' : '❌';
    console.log(`  ${status} ${r.dimensionId}: ${r.score}점 (기준: ${r.threshold})`);
    if (!r.passed && r.failedItems.length > 0) {
      console.log(`     문제: ${r.failedItems[0].reason}`);
      console.log(`     제안: ${r.failedItems[0].suggestion}`);
    }
  });

  // 실패한 차원 기록
  const failedBefore = new Set<DimensionId>(initialEval.failedDimensions);
  console.log('\n[실패 차원]', Array.from(failedBefore).join(', '));

  // Step 2: 개선 - 문제 해결 시도
  console.log('\n📝 Step 2: 개선 수행');
  console.log('-'.repeat(40));

  const improvementResult = await evaluateAndImprove(weakTarget, { debug: true });

  if (improvementResult.improvement) {
    console.log('\n[개선 내용]');
    console.log(`적용된 개선: ${improvementResult.improvement.appliedImprovements.length}개`);

    improvementResult.improvement.appliedImprovements.forEach((imp, idx) => {
      console.log(`\n  ${idx + 1}. [${imp.targetDimension}] ${imp.type}`);
      console.log(`     이유: ${imp.reason}`);
      if (imp.originalText) {
        console.log(`     원본: "${imp.originalText.slice(0, 50)}..."`);
      }
      console.log(`     변경: "${imp.newText.slice(0, 50)}..."`);
    });

    console.log('\n[변경 요약]');
    const cs = improvementResult.improvement.changeSummary;
    console.log(`  추가: ${cs.addedSentences}문장`);
    console.log(`  수정: ${cs.modifiedSentences}문장`);
    console.log(`  재배치: ${cs.rearrangedSentences}문장`);
    console.log(`  길이 변화: ${cs.lengthChangeRate}%`);
    console.log(`  원본 유사도: ${cs.originalSimilarity}`);

    // Step 3: 재평가 - 문제가 해결되었는지 확인
    console.log('\n🔍 Step 3: 재평가');
    console.log('-'.repeat(40));

    const improvedTarget: EvaluationTarget = {
      fullText: improvementResult.improvement.improvedText,
      sajuInfo: weakTarget.sajuInfo,
    };

    const reEval = await evaluate(improvedTarget, { debug: true });

    console.log('\n[재평가 결과]');
    console.log(`전체 통과: ${reEval.overallPassed ? '✅ Pass' : '❌ Fail'}`);
    console.log(`평균 점수: ${reEval.averageScore} (변화: ${reEval.averageScore - initialEval.averageScore > 0 ? '+' : ''}${reEval.averageScore - initialEval.averageScore})`);
    console.log(`통과 차원: ${reEval.passedCount}/${reEval.dimensionResults.length}`);

    console.log('\n[차원별 변화]');
    reEval.dimensionResults.forEach((r) => {
      const before = initialEval.dimensionResults.find((b) => b.dimensionId === r.dimensionId);
      const beforeScore = before?.score || 0;
      const change = r.score - beforeScore;
      const changeStr = change > 0 ? `+${change}` : `${change}`;
      const status = r.passed ? '✅' : '❌';
      const wasFixed = failedBefore.has(r.dimensionId) && r.passed;
      const fixIndicator = wasFixed ? ' 🔧 수정됨!' : '';

      console.log(`  ${status} ${r.dimensionId}: ${beforeScore} → ${r.score} (${changeStr})${fixIndicator}`);
    });

    // 개선 효과 분석
    const failedAfter = new Set<DimensionId>(reEval.failedDimensions);
    const fixed = Array.from(failedBefore).filter((d) => !failedAfter.has(d));
    const stillFailing = Array.from(failedBefore).filter((d) => failedAfter.has(d));
    const newlyFailed = Array.from(failedAfter).filter((d) => !failedBefore.has(d));

    console.log('\n[개선 효과 분석]');
    console.log(`  해결된 차원: ${fixed.length > 0 ? fixed.join(', ') : '없음'}`);
    console.log(`  여전히 실패: ${stillFailing.length > 0 ? stillFailing.join(', ') : '없음'}`);
    console.log(`  새로 실패: ${newlyFailed.length > 0 ? newlyFailed.join(', ') : '없음'}`);

    // 개선된 텍스트 출력
    console.log('\n[개선된 텍스트]');
    console.log('-'.repeat(40));
    console.log(improvementResult.improvement.improvedText);
  } else {
    console.log('개선이 필요하지 않거나 실패했습니다.');
  }

  // Step 4: 반복 개선 테스트
  console.log('\n\n🔄 Step 4: 반복 개선 (improveUntilPass)');
  console.log('-'.repeat(40));

  const loopResult = await improveUntilPass(weakTarget, {
    maxIterations: 3,
    config: { debug: true },
  });

  console.log(`\n[반복 개선 결과]`);
  console.log(`최종 통과: ${loopResult.passed ? '✅ Pass' : '❌ Fail'}`);
  console.log(`반복 횟수: ${loopResult.iterations}회`);

  console.log('\n[반복별 진행]');
  loopResult.history.forEach((h) => {
    console.log(`  ${h.iteration}차: ${h.passedCount}/8 통과, 실패: ${h.failedDimensions.join(', ') || '없음'}`);
  });

  // 최종 요약
  console.log('\n' + '='.repeat(60));
  console.log('📊 최종 요약');
  console.log('='.repeat(60));
  console.log(`초기 점수: ${initialEval.averageScore}`);
  console.log(`최종 통과: ${loopResult.passed ? '✅ 모든 차원 통과' : '❌ 일부 차원 실패'}`);
  console.log(`반복 횟수: ${loopResult.iterations}`);
}

// 실행
runPipelineTest().catch(console.error);
