/**
 * Neo4j 클라이언트
 */
import neo4j, { Driver, Session, ManagedTransaction } from 'neo4j-driver';

let driver: Driver | null = null;

export interface Neo4jConfig {
  uri: string;
  user: string;
  password: string;
}

/**
 * Neo4j 드라이버 초기화
 */
export function initNeo4j(config?: Neo4jConfig): Driver {
  if (driver) return driver;

  const uri = config?.uri || process.env.NEO4J_URI || 'bolt://localhost:7687';
  const user = config?.user || process.env.NEO4J_USER || 'neo4j';
  const password = config?.password || process.env.NEO4J_PASSWORD || 'luckiwi123';

  driver = neo4j.driver(uri, neo4j.auth.basic(user, password), {
    maxConnectionPoolSize: 50,
    connectionAcquisitionTimeout: 30000,
  });

  return driver;
}

/**
 * Neo4j 드라이버 가져오기
 */
export function getDriver(): Driver {
  if (!driver) {
    return initNeo4j();
  }
  return driver;
}

/**
 * 세션 가져오기
 */
export function getSession(database = 'neo4j'): Session {
  return getDriver().session({ database });
}

/**
 * 쿼리 실행 (읽기)
 */
export async function runQuery<T = unknown>(
  cypher: string,
  params: Record<string, unknown> = {}
): Promise<T[]> {
  const session = getSession();
  try {
    const result = await session.run(cypher, params);
    return result.records.map((record) => record.toObject() as T);
  } finally {
    await session.close();
  }
}

/**
 * 쿼리 실행 (쓰기)
 */
export async function runWrite<T = unknown>(
  cypher: string,
  params: Record<string, unknown> = {}
): Promise<T[]> {
  const session = getSession();
  try {
    const result = await session.executeWrite(async (tx) => {
      return await tx.run(cypher, params);
    });
    return result.records.map((record) => record.toObject() as T);
  } finally {
    await session.close();
  }
}

/**
 * 트랜잭션 실행
 */
export async function runTransaction<T>(
  work: (tx: ManagedTransaction) => Promise<T>
): Promise<T> {
  const session = getSession();
  try {
    return await session.executeWrite(work);
  } finally {
    await session.close();
  }
}

/**
 * 연결 테스트
 */
export async function testConnection(): Promise<boolean> {
  try {
    const result = await runQuery<{ message: string }>(
      'RETURN "Connected to Neo4j!" as message'
    );
    console.log('Neo4j:', result[0]?.message);
    return true;
  } catch (error) {
    console.error('Neo4j connection failed:', error);
    return false;
  }
}

/**
 * 드라이버 종료
 */
export async function closeNeo4j(): Promise<void> {
  if (driver) {
    await driver.close();
    driver = null;
  }
}

export { neo4j };
