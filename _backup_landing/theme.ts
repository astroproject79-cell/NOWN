import { ThemeColors } from '@/types';

export var themes: Record<string, ThemeColors> = {
  dark: {
    bg: '#05081a',
    text: '#edf0ff',
    dim: 'rgba(190,200,240,0.7)',
    accent: '#4a6fff',
    glow: 'rgba(74,111,255,0.55)',
    glowWide: 'rgba(74,111,255,0.18)',
    pColor1: [65, 100, 255],
    pColor2: [130, 80, 255],
    pColor3: [180, 120, 255],
    pBase: 0.15,
    pPeak: 0.95,
    fog: 'rgba(5,8,26,',
    line: 'rgba(74,111,255,0.06)',
  },
  light: {
    bg: '#edf0f9',
    text: '#0a0e2a',
    dim: 'rgba(30,40,90,0.6)',
    accent: '#2a4fd6',
    glow: 'rgba(42,79,214,0.45)',
    glowWide: 'rgba(42,79,214,0.15)',
    pColor1: [42, 70, 200],
    pColor2: [90, 55, 190],
    pColor3: [130, 80, 210],
    pBase: 0.06,
    pPeak: 0.5,
    fog: 'rgba(237,240,249,',
    line: 'rgba(42,79,214,0.06)',
  },
};
