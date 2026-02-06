/**
 * Neo4j Cypher 쿼리 모음
 */
import { runWrite, runQuery, runTransaction } from './client';
import {
  HEAVENLY_STEMS,
  EARTHLY_BRANCHES,
  ELEMENTS,
  TEN_GODS,
  STRUCTURES,
  DAY_PILLARS,
  INIT_CONSTRAINTS,
  INIT_INDEXES,
  InterpretationNode,
} from './schema';
import neo4j from 'neo4j-driver';

// ============================================
// 초기화 쿼리
// ============================================

/**
 * 제약 조건 및 인덱스 생성
 */
export async function initConstraintsAndIndexes(): Promise<void> {
  const constraints = INIT_CONSTRAINTS.split(';').filter((q) => q.trim());
  const indexes = INIT_INDEXES.split(';').filter((q) => q.trim());

  for (const query of [...constraints, ...indexes]) {
    try {
      await runWrite(query.trim());
    } catch (error) {
      // 이미 존재하는 경우 무시
      console.log('Constraint/Index might already exist:', (error as Error).message);
    }
  }
  console.log('Constraints and indexes initialized');
}

/**
 * 기본 데이터 삽입 (천간, 지지, 오행, 십신, 격국, 일주)
 */
export async function seedBaseData(): Promise<void> {
  await runTransaction(async (tx) => {
    // 오행 노드
    for (const element of ELEMENTS) {
      await tx.run(
        `MERGE (e:Element {name: $name})
         SET e.hanja = $hanja, e.color = $color,
             e.direction = $direction, e.season = $season,
             e.generates = $generates, e.controls = $controls`,
        element
      );
    }

    // 천간 노드
    for (const stem of HEAVENLY_STEMS) {
      await tx.run(
        `MERGE (s:HeavenlyStem {name: $name})
         SET s.hanja = $hanja, s.element = $element, s.polarity = $polarity`,
        stem
      );
    }

    // 지지 노드
    for (const branch of EARTHLY_BRANCHES) {
      await tx.run(
        `MERGE (b:EarthlyBranch {name: $name})
         SET b.hanja = $hanja, b.element = $element,
             b.season = $season, b.month = $month,
             b.hiddenStems = $hiddenStems`,
        branch
      );
    }

    // 십신 노드
    for (const tenGod of TEN_GODS) {
      await tx.run(
        `MERGE (t:TenGod {name: $name})
         SET t.hanja = $hanja, t.category = $category,
             t.polarity = $polarity, t.keywords = $keywords`,
        tenGod
      );
    }

    // 격국 노드
    for (const structure of STRUCTURES) {
      await tx.run(
        `MERGE (s:Structure {name: $name})
         SET s.hanja = $hanja, s.category = $category,
             s.baseTenGod = $baseTenGod, s.keywords = $keywords`,
        { ...structure, baseTenGod: structure.baseTenGod || null }
      );
    }

    // 일주 노드
    for (const pillar of DAY_PILLARS) {
      await tx.run(
        `MERGE (d:DayPillar {name: $name})
         SET d.stem = $stem, d.branch = $branch,
             d.stemElement = $stemElement, d.branchElement = $branchElement`,
        pillar
      );
    }

    return null;
  });

  console.log('Base data seeded');
}

/**
 * 오행 관계 생성 (생극)
 */
export async function createElementRelations(): Promise<void> {
  // 상생 관계
  await runWrite(`
    MATCH (e1:Element), (e2:Element)
    WHERE e1.generates = e2.name
    MERGE (e1)-[:GENERATES]->(e2)
  `);

  // 상극 관계
  await runWrite(`
    MATCH (e1:Element), (e2:Element)
    WHERE e1.controls = e2.name
    MERGE (e1)-[:CONTROLS]->(e2)
  `);

  console.log('Element relations created');
}

/**
 * 일주-천간-지지 관계 생성
 */
export async function createDayPillarRelations(): Promise<void> {
  await runWrite(`
    MATCH (d:DayPillar), (s:HeavenlyStem), (b:EarthlyBranch)
    WHERE d.stem = s.name AND d.branch = b.name
    MERGE (d)-[:COMPOSED_OF {role: 'stem'}]->(s)
    MERGE (d)-[:COMPOSED_OF {role: 'branch'}]->(b)
  `);

  console.log('DayPillar relations created');
}

/**
 * 전체 초기화
 */
export async function initializeGraph(): Promise<void> {
  console.log('Initializing knowledge graph...');
  await initConstraintsAndIndexes();
  await seedBaseData();
  await createElementRelations();
  await createDayPillarRelations();
  console.log('Knowledge graph initialized!');
}

// ============================================
// 해석 노드 관리
// ============================================

/**
 * 해석 노드 추가
 */
export async function addInterpretation(
  interpretation: InterpretationNode
): Promise<void> {
  await runWrite(
    `CREATE (i:Interpretation {
      id: $id,
      level: $level,
      category: $category,
      content: $content,
      source: $source,
      keywords: $keywords,
      conditions: $conditions
    })`,
    {
      ...interpretation,
      source: interpretation.source || null,
      conditions: interpretation.conditions || [],
    }
  );
}

/**
 * 일주에 해석 연결
 */
export async function linkInterpretationToDayPillar(
  dayPillarName: string,
  interpretationId: string,
  condition?: string
): Promise<void> {
  await runWrite(
    `MATCH (d:DayPillar {name: $dayPillarName})
     MATCH (i:Interpretation {id: $interpretationId})
     MERGE (d)-[:HAS_INTERPRETATION ${condition ? '{condition: $condition}' : ''}]->(i)`,
    { dayPillarName, interpretationId, condition: condition || null }
  );
}

/**
 * 격국에 해석 연결
 */
export async function linkInterpretationToStructure(
  structureName: string,
  interpretationId: string
): Promise<void> {
  await runWrite(
    `MATCH (s:Structure {name: $structureName})
     MATCH (i:Interpretation {id: $interpretationId})
     MERGE (s)-[:HAS_INTERPRETATION]->(i)`,
    { structureName, interpretationId }
  );
}

// ============================================
// 검색 쿼리
// ============================================

/**
 * 일주 기본 정보 조회
 */
export async function getDayPillarInfo(name: string) {
  const result = await runQuery<{
    dayPillar: Record<string, unknown>;
    stem: Record<string, unknown>;
    branch: Record<string, unknown>;
  }>(
    `MATCH (d:DayPillar {name: $name})
     MATCH (d)-[:COMPOSED_OF {role: 'stem'}]->(s:HeavenlyStem)
     MATCH (d)-[:COMPOSED_OF {role: 'branch'}]->(b:EarthlyBranch)
     RETURN d as dayPillar, s as stem, b as branch`,
    { name }
  );
  return result[0] || null;
}

/**
 * 일주 해석 조회
 */
export async function getDayPillarInterpretations(
  name: string,
  level?: number
) {
  const levelFilter = level !== undefined ? 'AND i.level = $level' : '';
  const result = await runQuery<{
    interpretation: InterpretationNode;
    condition: string | null;
  }>(
    `MATCH (d:DayPillar {name: $name})-[r:HAS_INTERPRETATION]->(i:Interpretation)
     WHERE true ${levelFilter}
     RETURN i as interpretation, r.condition as condition
     ORDER BY i.level ASC`,
    { name, level }
  );
  return result;
}

/**
 * 복합 조건 해석 검색
 * 예: 경자일주 + 정관격 + 신약
 */
export async function findCombinedInterpretation(
  dayPillar: string,
  structure?: string,
  strength?: 'strong' | 'neutral' | 'weak'
) {
  // 조건 문자열 생성
  const conditions: string[] = [];
  if (structure) conditions.push(structure);
  if (strength) conditions.push(strength);

  const result = await runQuery<{ interpretation: InterpretationNode }>(
    `MATCH (d:DayPillar {name: $dayPillar})-[:HAS_INTERPRETATION]->(i:Interpretation)
     WHERE ALL(cond IN $conditions WHERE cond IN i.conditions)
     RETURN i as interpretation
     ORDER BY i.level DESC
     LIMIT 5`,
    { dayPillar, conditions }
  );

  return result.map((r) => r.interpretation);
}

/**
 * 그래프 통계
 */
export async function getGraphStats() {
  const result = await runQuery<{ label: string; count: number }>(`
    CALL {
      MATCH (n:DayPillar) RETURN 'DayPillar' as label, count(n) as count
      UNION ALL
      MATCH (n:HeavenlyStem) RETURN 'HeavenlyStem' as label, count(n) as count
      UNION ALL
      MATCH (n:EarthlyBranch) RETURN 'EarthlyBranch' as label, count(n) as count
      UNION ALL
      MATCH (n:Element) RETURN 'Element' as label, count(n) as count
      UNION ALL
      MATCH (n:TenGod) RETURN 'TenGod' as label, count(n) as count
      UNION ALL
      MATCH (n:Structure) RETURN 'Structure' as label, count(n) as count
      UNION ALL
      MATCH (n:Interpretation) RETURN 'Interpretation' as label, count(n) as count
    }
    RETURN label, count
  `);

  return Object.fromEntries(
    result.map((r) => [r.label, typeof r.count === 'object' && 'toNumber' in r.count
      ? (r.count as { toNumber: () => number }).toNumber()
      : r.count])
  );
}

/**
 * 전체 그래프 삭제 (개발용)
 */
export async function clearGraph(): Promise<void> {
  await runWrite('MATCH (n) DETACH DELETE n');
  console.log('Graph cleared');
}
