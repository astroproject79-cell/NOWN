/**
 * Firestore Vector Store
 *
 * Firestore의 Vector Search 기능을 활용한 벡터 저장소
 * - 문서 저장/조회/삭제
 * - 벡터 유사도 검색
 * - 하이브리드 검색 (벡터 + 메타데이터 필터)
 */

import { getFirestore, Firestore, FieldValue } from 'firebase-admin/firestore';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import type {
  VectorDocument,
  DocumentType,
  SearchOptions,
  SearchResult,
  DocumentMetadata,
} from './types';
import { COLLECTIONS, EMBEDDING_DIMENSION } from './types';
import { embed } from '../llm';

// ============================================
// Firestore 초기화
// ============================================

let db: Firestore | null = null;

/**
 * Firestore 인스턴스 가져오기
 */
function getDb(): Firestore {
  if (!db) {
    // Firebase Admin 초기화 (아직 안 되어 있으면)
    if (getApps().length === 0) {
      // 환경 변수에서 서비스 계정 정보 로드
      const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT
        ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
        : undefined;

      if (serviceAccount) {
        initializeApp({
          credential: cert(serviceAccount),
        });
      } else {
        // Application Default Credentials 사용
        initializeApp();
      }
    }
    db = getFirestore();
  }
  return db;
}

// ============================================
// 문서 CRUD
// ============================================

/**
 * 문서 저장 (임베딩 자동 생성)
 */
export async function upsertDocument(
  doc: Omit<VectorDocument, 'embedding' | 'createdAt' | 'updatedAt'>
): Promise<VectorDocument> {
  const firestore = getDb();
  const collection = getCollectionName(doc.metadata.type);

  // 임베딩 생성
  const embedding = await embed(doc.content);

  const now = new Date().toISOString();
  const fullDoc: VectorDocument = {
    ...doc,
    embedding,
    createdAt: now,
    updatedAt: now,
  };

  // Firestore에 저장
  await firestore.collection(collection).doc(doc.id).set({
    ...fullDoc,
    // Firestore Vector Search를 위한 필드
    embedding: FieldValue.vector(embedding),
  });

  return fullDoc;
}

/**
 * 문서 배치 저장
 */
export async function upsertDocuments(
  docs: Array<Omit<VectorDocument, 'embedding' | 'createdAt' | 'updatedAt'>>
): Promise<VectorDocument[]> {
  // 배치로 임베딩 생성
  const contents = docs.map((d) => d.content);
  const { embedBatch } = await import('../llm');
  const embeddings = await embedBatch(contents);

  const now = new Date().toISOString();
  const firestore = getDb();

  const results: VectorDocument[] = [];

  // 타입별로 그룹화하여 배치 저장
  const byType = new Map<DocumentType, typeof docs>();
  docs.forEach((doc, i) => {
    const type = doc.metadata.type;
    if (!byType.has(type)) byType.set(type, []);
    byType.get(type)!.push(doc);
  });

  for (const [type, typeDocs] of byType) {
    const collection = getCollectionName(type);
    const batch = firestore.batch();

    typeDocs.forEach((doc, i) => {
      const embedding = embeddings[docs.indexOf(doc)];
      const fullDoc: VectorDocument = {
        ...doc,
        embedding,
        createdAt: now,
        updatedAt: now,
      };

      batch.set(firestore.collection(collection).doc(doc.id), {
        ...fullDoc,
        embedding: FieldValue.vector(embedding),
      });

      results.push(fullDoc);
    });

    await batch.commit();
  }

  return results;
}

/**
 * 문서 조회
 */
export async function getDocument(
  id: string,
  type: DocumentType
): Promise<VectorDocument | null> {
  const firestore = getDb();
  const collection = getCollectionName(type);

  const doc = await firestore.collection(collection).doc(id).get();

  if (!doc.exists) return null;

  const data = doc.data() as VectorDocument;
  return {
    ...data,
    // Firestore Vector를 일반 배열로 변환
    embedding: Array.isArray(data.embedding)
      ? data.embedding
      : (data.embedding as any)?.toArray?.() || [],
  };
}

/**
 * 문서 삭제
 */
export async function deleteDocument(
  id: string,
  type: DocumentType
): Promise<void> {
  const firestore = getDb();
  const collection = getCollectionName(type);

  await firestore.collection(collection).doc(id).delete();
}

// ============================================
// 벡터 검색
// ============================================

/**
 * 벡터 유사도 검색
 */
export async function searchByVector(
  query: string,
  options: SearchOptions = {}
): Promise<SearchResult[]> {
  const firestore = getDb();
  const queryEmbedding = await embed(query);

  const {
    limit = 5,
    minScore = 0.5,
    type,
    filter,
  } = options;

  // 검색할 컬렉션 결정
  const collections = type
    ? Array.isArray(type)
      ? type.map(getCollectionName)
      : [getCollectionName(type)]
    : Object.values(COLLECTIONS);

  const allResults: SearchResult[] = [];

  for (const collectionName of collections) {
    try {
      // Firestore Vector Search 쿼리
      let queryRef = firestore.collection(collectionName);

      // 메타데이터 필터 적용
      if (filter) {
        for (const [key, value] of Object.entries(filter)) {
          queryRef = queryRef.where(`metadata.${key}`, '==', value) as any;
        }
      }

      // Vector Search 수행
      const vectorQuery = queryRef.findNearest('embedding', queryEmbedding, {
        limit,
        distanceMeasure: 'COSINE',
      });

      const snapshot = await vectorQuery.get();

      snapshot.forEach((doc) => {
        const data = doc.data() as VectorDocument;

        // 코사인 거리를 유사도로 변환 (1 - distance)
        // Firestore는 거리를 반환하므로 변환 필요
        const distance = (doc as any).distance ?? 0;
        const score = 1 - distance;

        if (score >= minScore) {
          allResults.push({
            document: {
              ...data,
              embedding: Array.isArray(data.embedding)
                ? data.embedding
                : (data.embedding as any)?.toArray?.() || [],
            },
            score,
            searchType: 'vector',
          });
        }
      });
    } catch (error) {
      console.error(`Vector search failed for ${collectionName}:`, error);
    }
  }

  // 점수순 정렬
  allResults.sort((a, b) => b.score - a.score);

  return allResults.slice(0, limit);
}

/**
 * 텍스트 검색 (메타데이터 기반)
 */
export async function searchByText(
  query: string,
  options: SearchOptions = {}
): Promise<SearchResult[]> {
  const firestore = getDb();

  const { limit = 5, type, filter } = options;

  // 검색할 컬렉션 결정
  const collections = type
    ? Array.isArray(type)
      ? type.map(getCollectionName)
      : [getCollectionName(type)]
    : Object.values(COLLECTIONS);

  const allResults: SearchResult[] = [];
  const queryLower = query.toLowerCase();
  const queryWords = queryLower.split(/\s+/);

  for (const collectionName of collections) {
    try {
      let queryRef: any = firestore.collection(collectionName);

      // 메타데이터 필터 적용
      if (filter) {
        for (const [key, value] of Object.entries(filter)) {
          queryRef = queryRef.where(`metadata.${key}`, '==', value);
        }
      }

      const snapshot = await queryRef.limit(limit * 2).get();

      snapshot.forEach((doc: any) => {
        const data = doc.data() as VectorDocument;
        const contentLower = data.content.toLowerCase();

        // 간단한 텍스트 매칭 점수 계산
        const matchCount = queryWords.filter((word) =>
          contentLower.includes(word)
        ).length;
        const score = matchCount / queryWords.length;

        if (score > 0) {
          allResults.push({
            document: {
              ...data,
              embedding: Array.isArray(data.embedding)
                ? data.embedding
                : (data.embedding as any)?.toArray?.() || [],
            },
            score,
            searchType: 'text',
          });
        }
      });
    } catch (error) {
      console.error(`Text search failed for ${collectionName}:`, error);
    }
  }

  // 점수순 정렬
  allResults.sort((a, b) => b.score - a.score);

  return allResults.slice(0, limit);
}

/**
 * 하이브리드 검색 (벡터 + 텍스트)
 */
export async function searchHybrid(
  query: string,
  options: SearchOptions = {}
): Promise<SearchResult[]> {
  const { hybridWeight = 0.3, limit = 5 } = options;

  // 병렬로 두 검색 수행
  const [vectorResults, textResults] = await Promise.all([
    searchByVector(query, { ...options, limit: limit * 2 }),
    searchByText(query, { ...options, limit: limit * 2 }),
  ]);

  // 점수 융합
  const scoreMap = new Map<string, { doc: VectorDocument; score: number }>();

  // 벡터 검색 결과 추가
  for (const result of vectorResults) {
    const existing = scoreMap.get(result.document.id);
    const vectorScore = result.score * (1 - hybridWeight);

    if (existing) {
      existing.score += vectorScore;
    } else {
      scoreMap.set(result.document.id, {
        doc: result.document,
        score: vectorScore,
      });
    }
  }

  // 텍스트 검색 결과 추가/융합
  for (const result of textResults) {
    const existing = scoreMap.get(result.document.id);
    const textScore = result.score * hybridWeight;

    if (existing) {
      existing.score += textScore;
    } else {
      scoreMap.set(result.document.id, {
        doc: result.document,
        score: textScore,
      });
    }
  }

  // 결과 정렬
  const merged = Array.from(scoreMap.values())
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(({ doc, score }) => ({
      document: doc,
      score,
      searchType: 'hybrid' as const,
    }));

  return merged;
}

// ============================================
// 유틸리티
// ============================================

/**
 * 문서 타입에 따른 컬렉션 이름 반환
 */
function getCollectionName(type: DocumentType): string {
  switch (type) {
    case 'benchmark':
      return COLLECTIONS.benchmarks;
    case 'criteria':
      return COLLECTIONS.criteria;
    case 'pattern':
      return COLLECTIONS.patterns;
    case 'domain':
      return COLLECTIONS.domain;
    default:
      throw new Error(`Unknown document type: ${type}`);
  }
}

/**
 * 컬렉션 초기화 (개발용)
 */
export async function clearCollection(type: DocumentType): Promise<void> {
  const firestore = getDb();
  const collection = getCollectionName(type);

  const snapshot = await firestore.collection(collection).get();
  const batch = firestore.batch();

  snapshot.docs.forEach((doc) => {
    batch.delete(doc.ref);
  });

  await batch.commit();
}

/**
 * 컬렉션 문서 수 조회
 */
export async function countDocuments(type: DocumentType): Promise<number> {
  const firestore = getDb();
  const collection = getCollectionName(type);

  const snapshot = await firestore.collection(collection).count().get();
  return snapshot.data().count;
}
