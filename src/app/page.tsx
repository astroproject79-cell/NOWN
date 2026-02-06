'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/lib/store';
import { themes } from '@/lib/theme';
import TerrainCanvas from '@/components/canvas/TerrainCanvas';
import Header from '@/components/ui/Header';
import GlowText from '@/components/ui/GlowText';
import { Ico, ConstellationSvg, OrbitRingSvg, ScrollIndicator, ICON_PATHS } from '@/components/icons/SvgIcons';

function Feature({ icon, title, desc, delay, theme }: {
  icon: React.ReactNode; title: string; desc: string; delay: number; theme: string;
}) {
  const [hov, setHov] = useState(false);
  const t = themes[theme];
  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        textAlign: 'center', maxWidth: 240, cursor: 'default',
        animation: `fadeSlide 0.7s cubic-bezier(0.23,1,0.32,1) ${delay}s both`,
        transition: 'transform 0.5s cubic-bezier(0.23,1,0.32,1)',
        transform: hov ? 'translateY(-8px)' : 'none',
      }}
    >
      <div style={{
        width: 52, height: 52, margin: '0 auto 18px', borderRadius: '50%',
        border: `1px solid ${hov ? t.accent + '40' : 'rgba(74,111,255,0.12)'}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'all 0.5s',
        background: hov ? `rgba(${t.pColor1.join(',')},0.06)` : 'transparent',
        boxShadow: hov ? `0 0 30px rgba(${t.pColor1.join(',')},0.1)` : 'none',
      }}>{icon}</div>
      <div style={{
        fontFamily: "'ZEN SERIF TTF','Pretendard',-apple-system,sans-serif",
        fontSize: 15, fontWeight: 500, color: t.text, marginBottom: 10,
      }}>{title}</div>
      <div style={{
        fontFamily: "'Pretendard',-apple-system,sans-serif",
        fontSize: 12.5, color: t.dim, lineHeight: 1.85, fontWeight: 300,
      }}>{desc}</div>
    </div>
  );
}

export default function LandingPage() {
  const router = useRouter();
  const { theme } = useStore();
  const t = themes[theme];

  const btnBase = {
    fontFamily: "'ZEN SERIF TTF','Pretendard',-apple-system,sans-serif",
    fontSize: 13, fontWeight: 400, letterSpacing: '0.12em',
    cursor: 'pointer' as const,
    transition: 'all 0.5s cubic-bezier(0.23,1,0.32,1)',
  };

  const glowBtnStyle = (c1: number[], c2: number[], isDark: boolean) => ({
    ...btnBase,
    padding: '14px 40px',
    border: 'none',
    borderRadius: 999,
    color: isDark ? 'rgba(255,255,255,0.85)' : 'rgba(20,30,80,0.9)',
    background: isDark ? `linear-gradient(135deg, rgba(${c1.join(',')},0.06), rgba(${c2.join(',')},0.03))` : `linear-gradient(135deg, rgba(${c1.join(',')},0.12), rgba(${c2.join(',')},0.08))`,
    boxShadow: isDark ? `0 0 0 0.5px rgba(${c1.join(',')},0.15), 0 0 40px -10px rgba(${c1.join(',')},0.12)` : `0 0 0 1px rgba(${c1.join(',')},0.25), 0 4px 20px rgba(${c1.join(',')},0.15)`,
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    display: 'flex' as const,
    alignItems: 'center' as const,
    gap: 10,
  });

  return (
    <div style={{ minHeight: '100vh', background: t.bg, transition: 'background 0.7s', overflow: 'hidden' }}>
      <TerrainCanvas theme={theme} />
      <Header />

      <div style={{ position: 'relative', zIndex: 10 }}>
        <section style={{
          minHeight: '100vh', display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          padding: '160px 24px 60px', textAlign: 'center', position: 'relative',
        }}>
          <OrbitRingSvg size={420} color={t.accent} style={{
            position: 'absolute', top: '50%', left: '50%',
            animation: 'orbSpin 90s linear infinite', pointerEvents: 'none', opacity: 0.12,
          }} />

          <div style={{ animation: 'fadeIn 1.2s 0.2s both', marginBottom: 32 }}>
            <ConstellationSvg color={t.accent} style={{ animation: 'drift 7s ease-in-out infinite', opacity: 0.5 }} />
          </div>

          <div style={{ animation: 'fadeIn 1s 0.3s both', marginBottom: 36 }}>
            <span style={{
              fontFamily: "'ZEN SERIF TTF','Pretendard',-apple-system,sans-serif",
              fontSize: 10, letterSpacing: '0.7em', color: t.accent, opacity: 0.55,
            }}>CELESTIAL FORTUNE</span>
          </div>

          <GlowText text="태어난 순간," theme={theme} weight={200} />
          <div style={{ height: 4 }} />
          <GlowText text="이미 쓰여 있었다" theme={theme} weight={500} />

          <div style={{
            width: 1, height: 48, margin: '36px auto',
            background: `linear-gradient(to bottom, transparent, ${t.accent}25, transparent)`,
            animation: 'fadeIn 1s 2s both',
          }} />

          <p style={{
            fontFamily: "'Pretendard',-apple-system,sans-serif",
            fontSize: 'clamp(12px,1.6vw,14px)', color: t.dim,
            lineHeight: 2.1, fontWeight: 300, maxWidth: 360,
            animation: 'fadeSlide 0.8s 2.2s both',
          }}>
            사주명리학의 지혜로 당신의 천명을 읽어드립니다
            <br />AI가 해석하는 16,000자의 깊은 운명 리포트
          </p>

          <div className="hero-buttons" style={{ marginTop: 48, justifyContent: 'center',
            animation: 'fadeSlide 0.8s 2.5s both',
          }}>
            <button
              className="btn-glow"
              onClick={() => router.push('/fortune')}
              style={glowBtnStyle(t.pColor1, t.pColor2, theme === 'dark')}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-3px) scale(1.01)';
                e.currentTarget.style.boxShadow = `0 0 0 0.5px rgba(${t.pColor1.join(',')},0.3), 0 0 60px -5px rgba(${t.pColor1.join(',')},0.2), 0 0 20px rgba(${t.pColor1.join(',')},0.08)`;
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = '';
                e.currentTarget.style.boxShadow = glowBtnStyle(t.pColor1, t.pColor2, theme === 'dark').boxShadow;
              }}
            >
              사주 풀이 보기 <Ico d={ICON_PATHS.zap} size={13} color={theme === "dark" ? "rgba(255,255,255,0.6)" : "rgba(30,50,120,0.7)"} sw={1.2} />
            </button>
            <button
              className="btn-glow"
              onClick={() => router.push('/chat')}
              style={glowBtnStyle(t.pColor2, t.pColor3, theme === 'dark')}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-3px) scale(1.01)';
                e.currentTarget.style.boxShadow = `0 0 0 0.5px rgba(${t.pColor2.join(',')},0.3), 0 0 60px -5px rgba(${t.pColor2.join(',')},0.2), 0 0 20px rgba(${t.pColor2.join(',')},0.08)`;
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = '';
                e.currentTarget.style.boxShadow = glowBtnStyle(t.pColor2, t.pColor3, theme === 'dark').boxShadow;
              }}
            >
              AI 상담 시작 <Ico d={ICON_PATHS.chat} size={13} color={theme === "dark" ? "rgba(255,255,255,0.6)" : "rgba(30,50,120,0.7)"} sw={1.2} />
            </button>
          </div>

          <div style={{ position: 'absolute', bottom: 28, animation: 'scrollBounce 2.8s ease-in-out infinite' }}>
            <ScrollIndicator color={t.dim} />
          </div>
        </section>

        <section style={{ padding: '100px 24px 120px', maxWidth: 880, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 72 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 20, marginBottom: 16 }}>
              <div style={{ width: 50, height: '0.5px', background: `linear-gradient(to right, transparent, ${t.accent}30)`, animation: 'lineGrow 1s 0.5s both', transformOrigin: 'right' }} />
              <span style={{ fontFamily: "'ZEN SERIF TTF','Pretendard',-apple-system,sans-serif", fontSize: 9, letterSpacing: '0.6em', color: t.accent, opacity: 0.5 }}>FEATURES</span>
              <div style={{ width: 50, height: '0.5px', background: `linear-gradient(to left, transparent, ${t.accent}30)`, animation: 'lineGrow 1s 0.5s both', transformOrigin: 'left' }} />
            </div>
            <h2 style={{
              fontFamily: "'ZEN SERIF TTF','Pretendard',-apple-system,sans-serif",
              fontSize: 'clamp(18px,3.2vw,26px)', fontWeight: 300, color: t.text,
            }}>두 가지 방법으로 운명을 읽다</h2>
          </div>

          <div style={{ position: 'relative' }}>
            <svg className="hide-mobile" style={{ position: 'absolute', top: '26px', left: '16%', right: '16%', height: 2, width: '68%', overflow: 'visible' }} viewBox="0 0 600 2" preserveAspectRatio="none" fill="none">
              <line x1="0" y1="1" x2="600" y2="1" stroke={t.accent} strokeWidth="0.3" opacity="0.1" strokeDasharray="3 8" />
              <circle cx="0" cy="1" r="2" fill={t.accent} opacity="0.15" />
              <circle cx="300" cy="1" r="2" fill={t.accent} opacity="0.15" />
              <circle cx="600" cy="1" r="2" fill={t.accent} opacity="0.15" />
            </svg>
            <div className="feature-grid" style={{ position: 'relative', zIndex: 2,
            }}>
              <Feature theme={theme} delay={0.15}
                icon={<Ico d={ICON_PATHS.zap} size={22} color={t.accent} sw={1} />}
                title="퀵 사주"
                desc="생년월일시만 입력하면 즉시 사주 팔자를 확인할 수 있습니다. 무료로 내 운명의 기초를 확인하세요."
              />
              <Feature theme={theme} delay={0.3}
                icon={<Ico d={ICON_PATHS.chat} size={22} color={t.accent} sw={1} />}
                title="AI 상담 사주"
                desc="눈치 빠른 AI와 대화하며 깊은 운세 리포트를 받아보세요. 16,000자의 맞춤형 운명 해석을 드립니다."
              />
              <Feature theme={theme} delay={0.45}
                icon={<Ico d={ICON_PATHS.eye} size={22} color={t.accent} sw={0.8} />}
                title="정밀 분석 엔진"
                desc="절기 보정, 지방시 계산, 천간·지지·십신·오행까지. 전문가 수준의 정밀한 사주 분석을 제공합니다."
              />
            </div>
          </div>
        </section>

        <footer style={{ padding: '32px 24px 48px', textAlign: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 8 }}>
            <svg width={12} height={12} viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke={t.accent} strokeWidth="0.6" opacity="0.5" />
              <circle cx="12" cy="12" r="2" fill={t.accent} opacity="0.7" />
            </svg>
            <span style={{ fontFamily: "'ZEN SERIF TTF','Pretendard',-apple-system,sans-serif", fontSize: 10, color: t.dim, letterSpacing: '0.2em' }}>NOWN</span>
          </div>
          <p style={{ fontFamily: "'Pretendard',-apple-system,sans-serif", fontSize: 10, color: t.dim, opacity: 0.35, fontWeight: 300, marginBottom: 12 }}>
            당신의 하늘을 읽는 시간
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 16 }}>
            <span
              onClick={() => router.push('/privacy')}
              style={{
                fontFamily: "'Pretendard',-apple-system,sans-serif",
                fontSize: 10, color: t.dim, opacity: 0.3, cursor: 'pointer',
                transition: 'opacity 0.3s',
              }}
              onMouseEnter={e => { e.currentTarget.style.opacity = '0.6'; }}
              onMouseLeave={e => { e.currentTarget.style.opacity = '0.3'; }}
            >
              개인정보처리방침
            </span>
            <span style={{ fontSize: 10, color: t.dim, opacity: 0.15 }}>·</span>
            <span style={{
              fontFamily: "'Pretendard',-apple-system,sans-serif",
              fontSize: 10, color: t.dim, opacity: 0.3,
            }}>
              astro.project79@gmail.com
            </span>
          </div>
        </footer>
      </div>
    </div>
  );
}
