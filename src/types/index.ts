export interface SajuInput {
  name: string;
  birthDate: string;
  birthTime: string;
  gender: 'male' | 'female';
  isLunar: boolean;
  focusArea?: FocusArea;
}

export type FocusArea = 'love' | 'career' | 'wealth' | 'health' | 'all';

export interface FourPillars {
  year: { stem: string; branch: string };
  month: { stem: string; branch: string };
  day: { stem: string; branch: string };
  hour: { stem: string; branch: string };
}

export interface FiveElements {
  wood: number;
  fire: number;
  earth: number;
  metal: number;
  water: number;
}

export interface SajuProfile {
  id: string;
  userId: string;
  fourPillars: FourPillars;
  fiveElements: FiveElements;
  mainElement: string;
  tenGods: Record<string, string>;
  analysis: Record<string, unknown>;
  createdAt: string;
}

export interface ReportSection {
  slug: string;
  title: string;
  content: string;
  isFreePreview: boolean;
}

export interface Report {
  id: string;
  userId: string;
  type: 'quick' | 'premium' | 'compatibility';
  sections: ReportSection[];
  model: string;
  status: 'pending' | 'generating' | 'completed' | 'failed';
  totalChars: number;
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
}

export interface ChatSession {
  id: string;
  userId: string;
  messages: ChatMessage[];
  sajuContext?: SajuProfile;
  model: string;
  status: 'active' | 'completed';
}

export interface Payment {
  id: string;
  userId: string;
  reportId?: string;
  orderId: string;
  paymentKey?: string;
  amount: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'failed';
  productType: 'premium_report' | 'ai_consult';
  createdAt: string;
}

export type Theme = 'dark' | 'light';

export interface ThemeColors {
  bg: string;
  text: string;
  dim: string;
  accent: string;
  glow: string;
  glowWide: string;
  pColor1: number[];
  pColor2: number[];
  pColor3: number[];
  pBase: number;
  pPeak: number;
  fog: string;
  line: string;
}
