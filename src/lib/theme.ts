export const colors = {
  navy: {
    900: '#080E1A',
    800: '#0F1B2D',
    700: '#162640',
    600: '#1E3354',
    500: '#2A4068',
  },
  gold: {
    100: '#FBF5E8',
    200: '#F0DFB8',
    300: '#E2C88A',
    400: '#D4B06C',
    500: '#C9A96E',
    600: '#B8944F',
  },
  cream: {
    50: '#FEFCF8',
    100: '#FAF6EE',
    200: '#F5F0E8',
    300: '#EDE5D8',
    400: '#DDD3C2',
  },
  text: {
    primary: '#F5F0E8',
    secondary: 'rgba(245,240,232,0.65)',
    muted: 'rgba(245,240,232,0.35)',
    dark: '#1A1A2E',
    darkSub: 'rgba(26,26,46,0.6)',
  },
} as const;

export const easings = {
  smooth: 'cubic-bezier(0.23, 1, 0.32, 1)',
  bounce: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
  snap: 'cubic-bezier(0.5, 0, 0, 1)',
} as const;

export type Theme = 'dark' | 'light';

export interface ThemeColors {
  bg: string; text: string; dim: string; accent: string;
  glow: string; glowWide: string;
  pColor1: number[]; pColor2: number[]; pColor3: number[];
  pBase: number; pPeak: number; fog: string; line: string;
}

export var themes: Record<string, ThemeColors> = {
  dark: {
    bg: '#080E1A',
    text: '#F5F0E8',
    dim: 'rgba(245,240,232,0.65)',
    accent: '#C9A96E',
    glow: 'rgba(201,169,110,0.55)',
    glowWide: 'rgba(201,169,110,0.18)',
    pColor1: [201, 169, 110],
    pColor2: [212, 176, 108],
    pColor3: [226, 200, 138],
    pBase: 0.15,
    pPeak: 0.95,
    fog: 'rgba(8,14,26,',
    line: 'rgba(201,169,110,0.06)',
  },
  light: {
    bg: '#FAF6EE',
    text: '#1A1A2E',
    dim: 'rgba(26,26,46,0.6)',
    accent: '#B8944F',
    glow: 'rgba(184,148,79,0.45)',
    glowWide: 'rgba(184,148,79,0.15)',
    pColor1: [184, 148, 79],
    pColor2: [170, 135, 70],
    pColor3: [160, 128, 68],
    pBase: 0.06,
    pPeak: 0.5,
    fog: 'rgba(250,246,238,',
    line: 'rgba(184,148,79,0.06)',
  },
};
