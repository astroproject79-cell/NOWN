/**
 * Vector Store 시딩 스크립트
 *
 * 초기 벤치마크, 평가 기준, 개선 패턴 데이터를 Firestore에 업로드
 *
 * 실행: npx ts-node src/ai/scripts/seedVectorStore.ts
 */

// 환경변수 로드 (가장 먼저!)
import * as dotenv from 'dotenv';
dotenv.config();

import * as fs from 'fs';
import * as path from 'path';
import { upsertDocuments, countDocuments, clearCollection } from '../rag/vectorStore';
import type { VectorDocument, DocumentType } from '../rag/types';

// ============================================
// 데이터 로드
// ============================================

const DATA_DIR = path.join(__dirname, '../data');

interface RawBenchmark {
  id: string;
  type: 'benchmark';
  quality: 'excellent' | 'good';
  dayPillar?: string;
  structure?: string;
  title: string;
  content: string;
  dimensionScores?: Record<string, number>;
  highlights?: Array<{ text: string; dimension: string; quality: string }>;
  notes?: string;
}

interface RawCriteria {
  id: string;
  type: 'criteria';
  dimensionId: string;
  title: string;
  content: string;
  goodExamples?: string[];
  badExamples?: string[];
  scoringGuideline?: string;
}

interface RawPattern {
  id: string;
  type: 'pattern';
  dimensionId: string;
  patternType: string;
  title: string;
  beforeText: string;
  beforeIssue: string;
  afterText: string;
  transformationGuide: string;
}

function loadBenchmarks(): RawBenchmark[] {
  const benchmarksDir = path.join(DATA_DIR, 'benchmarks');
  const files = fs.readdirSync(benchmarksDir).filter((f) => f.endsWith('.json'));

  return files.flatMap((file) => {
    const content = fs.readFileSync(path.join(benchmarksDir, file), 'utf-8');
    const data = JSON.parse(content);
    return Array.isArray(data) ? data : [data];
  });
}

function loadCriteria(): RawCriteria[] {
  const criteriaPath = path.join(DATA_DIR, 'criteria/dimensions.json');
  if (!fs.existsSync(criteriaPath)) return [];

  const content = fs.readFileSync(criteriaPath, 'utf-8');
  return JSON.parse(content);
}

function loadPatterns(): RawPattern[] {
  const patternsPath = path.join(DATA_DIR, 'patterns/improvements.json');
  if (!fs.existsSync(patternsPath)) return [];

  const content = fs.readFileSync(patternsPath, 'utf-8');
  return JSON.parse(content);
}

// ============================================
// 변환 함수
// ============================================

function benchmarkToDocument(raw: RawBenchmark): Omit<VectorDocument, 'embedding' | 'createdAt' | 'updatedAt'> {
  return {
    id: raw.id,
    content: raw.content,
    metadata: {
      type: 'benchmark',
      title: raw.title,
      quality: raw.quality,
      dayPillar: raw.dayPillar,
      structure: raw.structure,
      dimensionScores: raw.dimensionScores,
      highlights: raw.highlights,
      source: 'seed',
    },
  };
}

function criteriaToDocument(raw: RawCriteria): Omit<VectorDocument, 'embedding' | 'createdAt' | 'updatedAt'> {
  return {
    id: raw.id,
    content: raw.content,
    metadata: {
      type: 'criteria',
      title: raw.title,
      dimensionId: raw.dimensionId,
      goodExamples: raw.goodExamples,
      badExamples: raw.badExamples,
      scoringGuideline: raw.scoringGuideline,
      source: 'seed',
    },
  };
}

function patternToDocument(raw: RawPattern): Omit<VectorDocument, 'embedding' | 'createdAt' | 'updatedAt'> {
  // Before/After를 합쳐서 검색 가능하게
  const content = `[${raw.dimensionId}] ${raw.patternType}
문제: ${raw.beforeText}
이슈: ${raw.beforeIssue}
개선: ${raw.afterText}
방법: ${raw.transformationGuide}`;

  return {
    id: raw.id,
    content,
    metadata: {
      type: 'pattern',
      title: raw.title,
      dimensionId: raw.dimensionId,
      patternType: raw.patternType,
      beforeText: raw.beforeText,
      beforeIssue: raw.beforeIssue,
      afterText: raw.afterText,
      transformationGuide: raw.transformationGuide,
      source: 'seed',
    },
  };
}

// ============================================
// 시딩 함수
// ============================================

async function seedCollection(
  type: DocumentType,
  documents: Omit<VectorDocument, 'embedding' | 'createdAt' | 'updatedAt'>[]
): Promise<void> {
  if (documents.length === 0) {
    console.log(`  [${type}] 문서 없음, 스킵`);
    return;
  }

  console.log(`  [${type}] ${documents.length}개 문서 업로드 중...`);

  try {
    await upsertDocuments(documents);
    const count = await countDocuments(type);
    console.log(`  [${type}] 완료! (총 ${count}개)`);
  } catch (error) {
    console.error(`  [${type}] 실패:`, error);
  }
}

async function seed(options: { clear?: boolean } = {}): Promise<void> {
  console.log('=== Vector Store 시딩 시작 ===\n');

  // 클리어 옵션
  if (options.clear) {
    console.log('기존 데이터 삭제 중...');
    await clearCollection('benchmark');
    await clearCollection('criteria');
    await clearCollection('pattern');
    console.log('삭제 완료\n');
  }

  // 데이터 로드
  console.log('데이터 로드 중...');
  const benchmarks = loadBenchmarks();
  const criteria = loadCriteria();
  const patterns = loadPatterns();
  console.log(`  벤치마크: ${benchmarks.length}개`);
  console.log(`  평가기준: ${criteria.length}개`);
  console.log(`  개선패턴: ${patterns.length}개\n`);

  // 변환
  const benchmarkDocs = benchmarks.map(benchmarkToDocument);
  const criteriaDocs = criteria.map(criteriaToDocument);
  const patternDocs = patterns.map(patternToDocument);

  // 업로드
  console.log('Firestore에 업로드 중...');
  await seedCollection('benchmark', benchmarkDocs);
  await seedCollection('criteria', criteriaDocs);
  await seedCollection('pattern', patternDocs);

  console.log('\n=== 시딩 완료 ===');
}

// ============================================
// CLI
// ============================================

const args = process.argv.slice(2);
const clearFlag = args.includes('--clear') || args.includes('-c');

seed({ clear: clearFlag }).catch(console.error);
