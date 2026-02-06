/**
 * 사주 Knowledge Graph 스키마 정의
 */

// ============================================
// 노드 타입 정의
// ============================================

/** 천간 (10개) */
export interface HeavenlyStemNode {
  name: string;           // 갑, 을, 병, 정, 무, 기, 경, 신, 임, 계
  hanja: string;          // 甲, 乙, 丙, 丁, 戊, 己, 庚, 辛, 壬, 癸
  element: Element;       // 오행
  polarity: 'yang' | 'yin'; // 음양
}

/** 지지 (12개) */
export interface EarthlyBranchNode {
  name: string;           // 자, 축, 인, 묘, 진, 사, 오, 미, 신, 유, 술, 해
  hanja: string;          // 子, 丑, 寅, 卯, 辰, 巳, 午, 未, 申, 酉, 戌, 亥
  element: Element;       // 오행
  season: string;         // 계절
  month: number;          // 월 (1-12)
  hiddenStems: string[];  // 장간 (본기, 중기, 여기)
}

/** 일주 (60개) */
export interface DayPillarNode {
  name: string;           // 갑자, 을축, ...
  stem: string;           // 천간
  branch: string;         // 지지
  stemElement: Element;   // 천간 오행
  branchElement: Element; // 지지 오행
  napiSemantic?: string;  // 납음 의미 (예: 해중금)
}

/** 십신 (10개) */
export interface TenGodNode {
  name: string;           // 비견, 겁재, 식신, 상관, 편재, 정재, 편관, 정관, 편인, 정인
  hanja: string;          // 比肩, 劫財, ...
  category: 'self' | 'output' | 'wealth' | 'authority' | 'resource';
  polarity: 'yang' | 'yin';
  keywords: string[];     // 키워드 (예: ['동료', '경쟁', '자존심'])
}

/** 격국 (14개+) */
export interface StructureNode {
  name: string;           // 정관격, 편관격, ...
  hanja: string;          // 正官格, 偏官格, ...
  category: 'regular' | 'special';
  baseTenGod?: string;    // 기반 십신
  keywords: string[];
}

/** 오행 (5개) */
export interface ElementNode {
  name: Element;          // 목, 화, 토, 금, 수
  hanja: string;          // 木, 火, 土, 金, 水
  color: string;          // 청, 적, 황, 백, 흑
  direction: string;      // 동, 남, 중앙, 서, 북
  season: string;         // 봄, 여름, 환절기, 가을, 겨울
  generates: Element;     // 생하는 오행
  controls: Element;      // 극하는 오행
}

/** 해석 노드 */
export interface InterpretationNode {
  id: string;
  level: 0 | 1 | 2 | 3 | 4;  // 계층 레벨
  category: InterpretationCategory;
  content: string;        // 해석 내용
  source?: string;        // 출처 (적천수, 궁통보감 등)
  keywords: string[];     // 관련 키워드
  conditions?: string[];  // 적용 조건
}

export type Element = '목' | '화' | '토' | '금' | '수';

export type InterpretationCategory =
  | 'dayPillar'     // 일주 해석
  | 'structure'     // 격국 해석
  | 'tenGod'        // 십신 해석
  | 'element'       // 오행 해석
  | 'usefulGod'     // 용신 해석
  | 'spirit'        // 신살 해석
  | 'relation'      // 관계 해석 (합충형해파)
  | 'combination';  // 조합 해석

// ============================================
// 엣지 타입 정의
// ============================================

export type EdgeType =
  | 'GENERATES'           // 생 (목→화)
  | 'CONTROLS'            // 극 (목→토)
  | 'COMBINES_WITH'       // 합 (갑+기→토)
  | 'CLASHES_WITH'        // 충 (자↔오)
  | 'PUNISHES'            // 형
  | 'HARMS'               // 해
  | 'DESTROYS'            // 파
  | 'HAS_INTERPRETATION'  // 해석 연결
  | 'WITH_CONDITION'      // 조건부 해석
  | 'COMPOSED_OF'         // 구성 (일주 = 천간 + 지지)
  | 'HIDDEN_IN';          // 장간 포함

// ============================================
// 그래프 초기화 Cypher 쿼리
// ============================================

export const INIT_CONSTRAINTS = `
// 유니크 제약 조건
CREATE CONSTRAINT stem_name IF NOT EXISTS FOR (s:HeavenlyStem) REQUIRE s.name IS UNIQUE;
CREATE CONSTRAINT branch_name IF NOT EXISTS FOR (b:EarthlyBranch) REQUIRE b.name IS UNIQUE;
CREATE CONSTRAINT dayPillar_name IF NOT EXISTS FOR (d:DayPillar) REQUIRE d.name IS UNIQUE;
CREATE CONSTRAINT tenGod_name IF NOT EXISTS FOR (t:TenGod) REQUIRE t.name IS UNIQUE;
CREATE CONSTRAINT structure_name IF NOT EXISTS FOR (s:Structure) REQUIRE s.name IS UNIQUE;
CREATE CONSTRAINT element_name IF NOT EXISTS FOR (e:Element) REQUIRE e.name IS UNIQUE;
CREATE CONSTRAINT interp_id IF NOT EXISTS FOR (i:Interpretation) REQUIRE i.id IS UNIQUE;
`;

export const INIT_INDEXES = `
// 검색용 인덱스
CREATE INDEX interp_category IF NOT EXISTS FOR (i:Interpretation) ON (i.category);
CREATE INDEX interp_level IF NOT EXISTS FOR (i:Interpretation) ON (i.level);
`;

// ============================================
// 기본 데이터
// ============================================

export const HEAVENLY_STEMS: HeavenlyStemNode[] = [
  { name: '갑', hanja: '甲', element: '목', polarity: 'yang' },
  { name: '을', hanja: '乙', element: '목', polarity: 'yin' },
  { name: '병', hanja: '丙', element: '화', polarity: 'yang' },
  { name: '정', hanja: '丁', element: '화', polarity: 'yin' },
  { name: '무', hanja: '戊', element: '토', polarity: 'yang' },
  { name: '기', hanja: '己', element: '토', polarity: 'yin' },
  { name: '경', hanja: '庚', element: '금', polarity: 'yang' },
  { name: '신', hanja: '辛', element: '금', polarity: 'yin' },
  { name: '임', hanja: '壬', element: '수', polarity: 'yang' },
  { name: '계', hanja: '癸', element: '수', polarity: 'yin' },
];

export const EARTHLY_BRANCHES: EarthlyBranchNode[] = [
  { name: '자', hanja: '子', element: '수', season: '겨울', month: 11, hiddenStems: ['계'] },
  { name: '축', hanja: '丑', element: '토', season: '겨울', month: 12, hiddenStems: ['기', '계', '신'] },
  { name: '인', hanja: '寅', element: '목', season: '봄', month: 1, hiddenStems: ['갑', '병', '무'] },
  { name: '묘', hanja: '卯', element: '목', season: '봄', month: 2, hiddenStems: ['을'] },
  { name: '진', hanja: '辰', element: '토', season: '봄', month: 3, hiddenStems: ['무', '을', '계'] },
  { name: '사', hanja: '巳', element: '화', season: '여름', month: 4, hiddenStems: ['병', '무', '경'] },
  { name: '오', hanja: '午', element: '화', season: '여름', month: 5, hiddenStems: ['정', '기'] },
  { name: '미', hanja: '未', element: '토', season: '여름', month: 6, hiddenStems: ['기', '정', '을'] },
  { name: '신', hanja: '申', element: '금', season: '가을', month: 7, hiddenStems: ['경', '임', '무'] },
  { name: '유', hanja: '酉', element: '금', season: '가을', month: 8, hiddenStems: ['신'] },
  { name: '술', hanja: '戌', element: '토', season: '가을', month: 9, hiddenStems: ['무', '신', '정'] },
  { name: '해', hanja: '亥', element: '수', season: '겨울', month: 10, hiddenStems: ['임', '갑'] },
];

export const ELEMENTS: ElementNode[] = [
  { name: '목', hanja: '木', color: '청', direction: '동', season: '봄', generates: '화', controls: '토' },
  { name: '화', hanja: '火', color: '적', direction: '남', season: '여름', generates: '토', controls: '금' },
  { name: '토', hanja: '土', color: '황', direction: '중앙', season: '환절기', generates: '금', controls: '수' },
  { name: '금', hanja: '金', color: '백', direction: '서', season: '가을', generates: '수', controls: '목' },
  { name: '수', hanja: '水', color: '흑', direction: '북', season: '겨울', generates: '목', controls: '화' },
];

export const TEN_GODS: TenGodNode[] = [
  { name: '비견', hanja: '比肩', category: 'self', polarity: 'yang', keywords: ['동료', '경쟁', '자존심', '독립'] },
  { name: '겁재', hanja: '劫財', category: 'self', polarity: 'yin', keywords: ['형제', '다툼', '승부욕', '야망'] },
  { name: '식신', hanja: '食神', category: 'output', polarity: 'yang', keywords: ['재능', '표현', '여유', '복록'] },
  { name: '상관', hanja: '傷官', category: 'output', polarity: 'yin', keywords: ['예술', '반항', '자유', '창의'] },
  { name: '편재', hanja: '偏財', category: 'wealth', polarity: 'yang', keywords: ['투자', '사업', '아버지', '애인'] },
  { name: '정재', hanja: '正財', category: 'wealth', polarity: 'yin', keywords: ['월급', '저축', '안정', '배우자'] },
  { name: '편관', hanja: '偏官', category: 'authority', polarity: 'yang', keywords: ['권력', '도전', '압박', '칠살'] },
  { name: '정관', hanja: '正官', category: 'authority', polarity: 'yin', keywords: ['명예', '직장', '책임', '질서'] },
  { name: '편인', hanja: '偏印', category: 'resource', polarity: 'yang', keywords: ['학문', '종교', '고독', '효신'] },
  { name: '정인', hanja: '正印', category: 'resource', polarity: 'yin', keywords: ['어머니', '학력', '인덕', '보호'] },
];

export const STRUCTURES: StructureNode[] = [
  { name: '건록격', hanja: '建祿格', category: 'special', keywords: ['자수성가', '독립', '노력'] },
  { name: '양인격', hanja: '羊刃格', category: 'special', keywords: ['강인', '권위', '무관'] },
  { name: '정관격', hanja: '正官格', category: 'regular', baseTenGod: '정관', keywords: ['명예', '안정', '출세'] },
  { name: '편관격', hanja: '偏官格', category: 'regular', baseTenGod: '편관', keywords: ['권력', '무관', '도전'] },
  { name: '정인격', hanja: '正印格', category: 'regular', baseTenGod: '정인', keywords: ['학문', '명예', '인덕'] },
  { name: '편인격', hanja: '偏印格', category: 'regular', baseTenGod: '편인', keywords: ['재주', '예술', '고독'] },
  { name: '정재격', hanja: '正財格', category: 'regular', baseTenGod: '정재', keywords: ['재물', '안정', '근면'] },
  { name: '편재격', hanja: '偏財格', category: 'regular', baseTenGod: '편재', keywords: ['사업', '투기', '활동'] },
  { name: '식신격', hanja: '食神格', category: 'regular', baseTenGod: '식신', keywords: ['복록', '재능', '풍요'] },
  { name: '상관격', hanja: '傷官格', category: 'regular', baseTenGod: '상관', keywords: ['예술', '표현', '반골'] },
  { name: '종아격', hanja: '從兒格', category: 'special', keywords: ['식상', '재능', '예체능'] },
  { name: '종재격', hanja: '從財格', category: 'special', keywords: ['재물', '실리', '사업'] },
  { name: '종살격', hanja: '從殺格', category: 'special', keywords: ['권력', '복종', '무관'] },
  { name: '종강격', hanja: '從强格', category: 'special', keywords: ['비겁', '독립', '자존'] },
];

// 60갑자 생성 함수
export function generate60DayPillars(): DayPillarNode[] {
  const stems = HEAVENLY_STEMS;
  const branches = EARTHLY_BRANCHES;
  const pillars: DayPillarNode[] = [];

  for (let i = 0; i < 60; i++) {
    const stem = stems[i % 10];
    const branch = branches[i % 12];
    pillars.push({
      name: stem.name + branch.name,
      stem: stem.name,
      branch: branch.name,
      stemElement: stem.element,
      branchElement: branch.element,
    });
  }

  return pillars;
}

export const DAY_PILLARS = generate60DayPillars();
