'use client';

import { useState } from 'react';
import { themes } from '@/lib/theme';
import { Theme } from '@/types';

function GlowChar({ ch, delay, theme }: { ch: string; delay: number; theme: Theme }) {
  const [hov, setHov] = useState(false);
  const t = themes[theme];
  if (ch === ' ') return <span style={{ width: '0.3em', display: 'inline-block' }} />;
  return (
    <span
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: 'inline-block',
        cursor: 'default',
        transition: 'all 0.4s cubic-bezier(0.23,1,0.32,1)',
        transform: hov ? 'translateY(-10px) scale(1.12)' : 'translateY(0) scale(1)',
        color: hov ? '#fff' : t.text,
        textShadow: hov
          ? `0 0 10px ${t.glow}, 0 0 30px ${t.glow}, 0 0 60px ${t.glowWide}, 0 0 100px ${t.glowWide}`
          : `0 0 40px ${t.glowWide}`,
        animation: `charReveal 0.8s cubic-bezier(0.16,1,0.3,1) ${delay}s both`,
      }}
    >
      {ch}
    </span>
  );
}

interface Props {
  text: string;
  theme: Theme;
  weight?: number;
  fontSize?: string;
  delay?: number;
}

export default function GlowText({ text, theme, weight = 300, fontSize = 'clamp(26px,5.2vw,50px)', delay = 0.5 }: Props) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center' }}>
      {text.split('').map((c, i) => (
        <span key={i} style={{
          fontFamily: "'ZEN SERIF TTF','Pretendard',-apple-system,sans-serif",
          fontWeight: weight,
          fontSize,
          letterSpacing: '-0.02em',
        }}>
          <GlowChar ch={c} delay={delay + i * 0.05} theme={theme} />
        </span>
      ))}
    </div>
  );
}
