import { calculateFourPillars } from './luckiwi/core/fourPillars';
import { FourPillarsResult } from './luckiwi/core/fourPillars';

const STEM_ELEMENT: Record<string, string> = {
  '갑': '목', '을': '목', '병': '화', '정': '화', '무': '토',
  '기': '토', '경': '금', '신': '금', '임': '수', '계': '수',
};

const BRANCH_ELEMENT: Record<string, string> = {
  '자': '수', '축': '토', '인': '목', '묘': '목', '진': '토', '사': '화',
  '오': '화', '미': '토', '신': '금', '유': '금', '술': '토', '해': '수',
};

const HOUR_RANGES: Record<string, number> = {
  '23-01': 0, '01-03': 1, '03-05': 2, '05-07': 3,
  '07-09': 4, '09-11': 5, '11-13': 6, '13-15': 7,
  '15-17': 8, '17-19': 9, '19-21': 10, '21-23': 11,
};

function hourRangeToHour(range: string): number {
  const idx = HOUR_RANGES[range];
  if (idx === undefined) return 12;
  const hours = [0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22];
  return hours[idx];
}

export interface SajuResult {
  yearPillar: string;
  monthPillar: string;
  dayPillar: string;
  hourPillar: string;
  dayMaster: string;
  dayMasterElement: string;
  elements: Record<string, number>;
  raw?: FourPillarsResult;
}

export async function calculateSaju(
  birth: string,
  hour: string,
  calendar: string
): Promise<SajuResult> {
  const [year, month, day] = birth.split('-').map(Number);

  let solarYear = year;
  let solarMonth = month;
  let solarDay = day;

  if (calendar === 'lunar') {
    const { Lunar } = await import('lunar-javascript');
    const lunar = Lunar.fromYmd(year, month, day);
    const solar = lunar.getSolar();
    solarYear = solar.getYear();
    solarMonth = solar.getMonth();
    solarDay = solar.getDay();
  }

  const calcHour = hour && hour !== 'unknown' ? hourRangeToHour(hour) : 12;

  const result = calculateFourPillars(solarYear, solarMonth, solarDay, calcHour, 0);

  const fp = result.fourPillars;
  const yearPillar = fp.year.full;
  const monthPillar = fp.month.full;
  const dayPillar = fp.day.full;
  const hourPillar = hour && hour !== 'unknown' ? fp.hour.full : '미상';
  const dayMaster = fp.day.stem;

  const stems = [fp.year.stem, fp.month.stem, fp.day.stem];
  const branches = [fp.year.branch, fp.month.branch, fp.day.branch];
  if (hour && hour !== 'unknown') {
    stems.push(fp.hour.stem);
    branches.push(fp.hour.branch);
  }

  const elements: Record<string, number> = { '목': 0, '화': 0, '토': 0, '금': 0, '수': 0 };
  stems.forEach((s) => {
    const el = STEM_ELEMENT[s];
    if (el) elements[el]++;
  });
  branches.forEach((b) => {
    const el = BRANCH_ELEMENT[b];
    if (el) elements[el]++;
  });

  return {
    yearPillar,
    monthPillar,
    dayPillar,
    hourPillar,
    dayMaster,
    dayMasterElement: STEM_ELEMENT[dayMaster] || '',
    elements,
    raw: result,
  };
}

export const DAY_MASTER_INFO: Record<string, {
  element: string;
  nature: string;
  personality: string;
  color: string;
}> = {
  '갑': { element: '목(木)', nature: '큰 나무', color: '#6bcf8e', personality: '곧은 소나무처럼 자존심이 강하고 리더십이 있어요. 한번 정한 목표는 끝까지 밀어붙이는 추진력의 소유자.' },
  '을': { element: '목(木)', nature: '풀과 꽃', color: '#4ade80', personality: '유연한 덩굴처럼 적응력이 뛰어나요. 부드럽지만 끈질긴 생명력으로 어디서든 뿌리내리는 타입.' },
  '병': { element: '화(火)', nature: '태양', color: '#f59e42', personality: '태양처럼 밝고 따뜻해서 주변에 사람이 모여요. 열정적이지만 가끔 너무 뜨거워서 스스로 지치기도.' },
  '정': { element: '화(火)', nature: '촛불', color: '#fb923c', personality: '촛불처럼 은은하게 주변을 밝히는 사람. 섬세하고 로맨틱하지만, 바람에 흔들리기도 해요.' },
  '무': { element: '토(土)', nature: '산과 대지', color: '#c8a87c', personality: '산처럼 듬직하고 믿음직해요. 느리지만 확실하게, 한번 믿으면 끝까지 가는 의리파.' },
  '기': { element: '토(土)', nature: '논밭', color: '#a68b64', personality: '비옥한 땅처럼 품이 넓어요. 누구든 받아주는 포용력, 하지만 가끔 너무 많이 짊어지려 해요.' },
  '경': { element: '금(金)', nature: '바위와 쇠', color: '#e2e8f0', personality: '강철 같은 의지와 원칙주의자. 한번 정한 건 바꾸지 않아요. 카리스마 있지만 융통성은 연습이 필요해요.' },
  '신': { element: '금(金)', nature: '보석', color: '#cbd5e1', personality: '다듬어진 보석처럼 세련되고 날카로워요. 완벽주의 성향에 예리한 판단력, 근데 좀 예민할 수 있어요.' },
  '임': { element: '수(水)', nature: '바다와 강', color: '#60a5fa', personality: '바다처럼 깊고 넓은 사고방식. 지혜롭고 적응력 좋지만, 가끔 감정의 파도에 휩쓸리기도.' },
  '계': { element: '수(水)', nature: '비와 이슬', color: '#93c5fd', personality: '이슬처럼 섬세하고 감성적이에요. 직관력이 뛰어나고 공감능력 최고, 하지만 눈물도 많은 편.' },
};
