'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, visible };
}

function AnimDiv({ visible, delay = 0, children, style }: {
  visible: boolean; delay?: number; children: React.ReactNode; style?: React.CSSProperties;
}) {
  return (
    <div style={{
      opacity: visible ? 1 : 0,
      transform: visible ? 'translateY(0)' : 'translateY(40px)',
      transition: `all 0.8s cubic-bezier(0.23,1,0.32,1) ${delay}s`,
      ...style,
    }}>{children}</div>
  );
}

const HOOKS = [
  { q: '올해 나한테 좋은 일이 생길까?', icon: '✦' },
  { q: '나랑 잘 맞는 사람은 어떤 유형?', icon: '♡' },
  { q: '이직해도 괜찮을 시기는 언제?', icon: '◈' },
  { q: '내 성격의 숨겨진 면이 궁금해', icon: '◇' },
];

export default function LandingPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [activeHook, setActiveHook] = useState(0);
  const [stars, setStars] = useState<Array<{ x: number; y: number; s: number; dl: number; du: number }>>([]);

  const story = useInView(0.1);
  const hook = useInView(0.08);
  const report = useInView(0.1);
  const cta = useInView(0.1);

  useEffect(() => {
    setStars(Array.from({ length: 40 }, () => ({
      x: Math.random() * 100, y: Math.random() * 50,
      s: Math.random() * 2 + 0.5, dl: Math.random() * 5, du: Math.random() * 3 + 2,
    })));
  }, []);

  useEffect(() => {
    var vid = document.querySelector('video') as HTMLVideoElement;
    if (vid) {
      vid.play().catch(() => {});
      document.addEventListener('touchstart', function handler() {
        vid.play().catch(() => {});
        document.removeEventListener('touchstart', handler);
      }, { once: true });
    }
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setActiveHook(p => (p + 1) % HOOKS.length), 3000);
    return () => clearInterval(timer);
  }, []);
  const handleSubmit = async () => {
    if (!email.trim() || submitting) return;
    setSubmitting(true);
    try {
      await fetch('/api/preregister', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });
    } catch {}
    setSubmitted(true);
    setSubmitting(false);
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--navy-900)', overflow: 'hidden' }}>

      {stars.map((st, i) => (
        <div key={i} style={{
          position: 'fixed', left: `${st.x}%`, top: `${st.y}%`,
          width: st.s, height: st.s, borderRadius: '50%',
          background: 'var(--gold-400)', pointerEvents: 'none', zIndex: 1,
          animation: `star-twinkle ${st.du}s ease-in-out ${st.dl}s infinite`,
        }} />
      ))}

      <header style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        padding: '20px 32px',
        background: 'linear-gradient(to bottom, rgba(8,14,26,0.95) 0%, rgba(8,14,26,0.6) 70%, transparent)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <svg width={20} height={20} viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="9" stroke="var(--gold-500)" strokeWidth="1" />
            <path d="M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0z" fill="var(--gold-500)" opacity="0.3" />
            <circle cx="12" cy="12" r="2" fill="var(--gold-500)" />
          </svg>
          <span style={{ fontFamily: 'var(--font-serif)', fontSize: 15, fontWeight: 700, color: 'var(--cream-100)', letterSpacing: '0.08em' }}>나운</span>
        </div>
        <a href="#register" style={{
          fontFamily: 'var(--font-sans)', fontSize: 11, fontWeight: 500,
          color: 'var(--navy-900)', textDecoration: 'none',
          background: 'linear-gradient(135deg, var(--gold-400), var(--gold-600))',
          padding: '8px 20px', borderRadius: 999,
        }}>사전등록</a>
      </header>

      <section style={{
        position: 'relative', height: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% 90%, rgba(201,169,110,0.08) 0%, transparent 50%)' }} />

        <div style={{
          flex: 1, display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          position: 'relative', zIndex: 3, paddingTop: 40, paddingBottom: 'var(--hero-text-pb)',
        }}>
          <div style={{ animation: 'fadeIn 1s 0.2s both', marginBottom: 20 }}>
            <svg width={28} height={28} viewBox="0 0 24 24" fill="none" style={{ opacity: 0.4 }}>
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" stroke="var(--gold-400)" strokeWidth="1" />
            </svg>
          </div>
          <div style={{
            fontFamily: 'var(--font-sans)', fontSize: 10, fontWeight: 400,
            letterSpacing: '0.3em', color: 'var(--gold-500)', opacity: 0.6,
            marginBottom: 24, animation: 'fadeUp 0.8s var(--ease-smooth) 0.3s both',
          }}>AI SAJU REPORT</div>
          <h1 style={{
            fontFamily: 'var(--font-serif)', fontWeight: 400,
            fontSize: 'clamp(32px, 5.5vw, 56px)',
            color: 'var(--cream-50)', lineHeight: 1.35, textAlign: 'center',
            letterSpacing: '-0.02em', animation: 'fadeUp 0.8s var(--ease-smooth) 0.4s both',
          }}>
            태어난 순간,<br />
            <span style={{
              background: 'linear-gradient(135deg, var(--gold-300), var(--gold-500), var(--gold-300))',
              backgroundSize: '200% auto',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
              fontWeight: 700, animation: 'shimmer 4s linear infinite',
            }}>운명은 이미 쓰여 있었다</span>
          </h1>
          <div style={{
            position: 'relative', height: 28, overflow: 'hidden',
            marginTop: 28, animation: 'fadeUp 0.8s var(--ease-smooth) 0.7s both',
          }}>
            {HOOKS.map((h, i) => (
              <div key={i} style={{
                position: 'absolute', width: '100%', textAlign: 'center',
                fontFamily: 'var(--font-sans)', fontSize: 14, fontWeight: 300, color: 'var(--text-secondary)',
                opacity: activeHook === i ? 1 : 0,
                transform: activeHook === i ? 'translateY(0)' : 'translateY(16px)',
                transition: 'all 0.5s var(--ease-smooth)',
              }}>
                <span style={{ color: 'var(--gold-400)', marginRight: 8 }}>{h.icon}</span>"{h.q}"
              </div>
            ))}
          </div>
        </div>

        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, height: 'var(--hero-video-h)', zIndex: 2,
          display: 'flex', justifyContent: 'center', alignItems: 'flex-end',
        }}>
          <video autoPlay muted loop playsInline webkit-playsinline="true" x5-playsinline="true" x5-video-player-type="h5" preload="auto" style={{
            width: 'var(--hero-video-w)', height: 'auto', objectFit: 'cover',
            maskImage: 'linear-gradient(to top, rgba(0,0,0,1) 0%, rgba(0,0,0,0.8) 30%, rgba(0,0,0,0.3) 60%, transparent 80%)',
            WebkitMaskImage: 'linear-gradient(to top, rgba(0,0,0,1) 0%, rgba(0,0,0,0.8) 30%, rgba(0,0,0,0.3) 60%, transparent 80%)',
          }}>
            <source src="/videos/hero-loop.mp4" type="video/mp4" />
          </video>
        </div>

        <div style={{
          position: 'absolute', bottom: 24, left: '50%', transform: 'translateX(-50%)',
          zIndex: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
          animation: 'fadeIn 1s 1.5s both',
        }}>
          <span style={{ fontFamily: 'var(--font-sans)', fontSize: 10, fontWeight: 300, color: 'var(--text-muted)', letterSpacing: '0.1em' }}>SCROLL</span>
          <svg width={14} height={20} viewBox="0 0 14 20" fill="none" style={{ animation: 'scroll-hint 2.5s ease-in-out infinite' }}>
            <rect x="1" y="1" width="12" height="18" rx="6" stroke="var(--gold-500)" strokeWidth="0.8" opacity="0.3" />
            <circle cx="7" cy="7" r="1.5" fill="var(--gold-500)" opacity="0.5" />
          </svg>
        </div>
      </section>

      <section ref={story.ref} style={{ padding: '120px 24px', maxWidth: 680, margin: '0 auto', textAlign: 'center' }}>
        <AnimDiv visible={story.visible}>
          <p style={{
            fontFamily: 'var(--font-serif)', fontSize: 'clamp(18px, 3vw, 26px)',
            fontWeight: 400, color: 'var(--cream-100)', lineHeight: 1.9, letterSpacing: '-0.01em',
          }}>
            사주팔자에는<br />내가 몰랐던 <span style={{ color: 'var(--gold-400)', fontWeight: 700 }}>나</span>에 대한<br />이야기가 담겨 있어요
          </p>
        </AnimDiv>
        <AnimDiv visible={story.visible} delay={0.2}>
          <p style={{
            fontFamily: 'var(--font-sans)', fontSize: 13, fontWeight: 300,
            color: 'var(--text-secondary)', lineHeight: 2, maxWidth: 400, margin: '32px auto 0',
          }}>
            생년월일시 네 기둥에 담긴 천간과 지지.<br />그 안에 성격, 재물운, 연애운, 건강까지—<br />AI가 16,000자로 풀어드려요.
          </p>
        </AnimDiv>
        <AnimDiv visible={story.visible} delay={0.4}>
          <button onClick={() => router.push('/fortune')} style={{
            fontFamily: 'var(--font-sans)', fontSize: 14, fontWeight: 500,
            color: 'var(--navy-900)', padding: '16px 40px', border: 'none',
            borderRadius: 999, cursor: 'pointer', marginTop: 48,
            background: 'linear-gradient(135deg, var(--gold-300), var(--gold-500))',
            boxShadow: '0 4px 24px rgba(201,169,110,0.25)', transition: 'all 0.4s var(--ease-smooth)',
          }}>무료로 내 사주 보기</button>
        </AnimDiv>
      </section>

      <div style={{ width: 1, height: 80, margin: '0 auto', background: 'linear-gradient(to bottom, transparent, rgba(201,169,110,0.2), transparent)' }} />

      <section ref={hook.ref} style={{ padding: '80px 24px', maxWidth: 800, margin: '0 auto' }}>
        <AnimDiv visible={hook.visible} style={{ textAlign: 'center', marginBottom: 48 }}>
          <span style={{ fontFamily: 'var(--font-sans)', fontSize: 10, fontWeight: 500, letterSpacing: '0.25em', color: 'var(--gold-500)' }}>WHAT WE READ</span>
          <h2 style={{
            fontFamily: 'var(--font-serif)', fontSize: 'clamp(22px, 3.5vw, 30px)',
            fontWeight: 400, color: 'var(--cream-100)', lineHeight: 1.5, letterSpacing: '-0.02em', marginTop: 16,
          }}>리포트에 이런 이야기가 <span style={{ color: 'var(--gold-400)', fontWeight: 700 }}>담겨요</span></h2>
        </AnimDiv>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
          {[
            { sym: '✦', label: '나의 사주 한눈에', sub: '만세력표 + 오행 분석', free: true },
            { sym: '◈', label: '타고난 성격과 기질', sub: '일주 기반 심층 해석', free: true },
            { sym: '◇', label: '올해의 운세 흐름', sub: '대운·세운 통합 분석', free: false },
            { sym: '▣', label: '돈과 커리어', sub: '재성·관성 운세', free: false },
            { sym: '♡', label: '연애와 인간관계', sub: '도화살·합충 해석', free: false },
            { sym: '⊕', label: '건강 체크', sub: '오행 과불급 진단', free: false },
            { sym: '☾', label: '12개월 월별 운세', sub: '매달 핵심 키워드', free: false },
            { sym: '✧', label: '나운의 종합 조언', sub: 'AI 맞춤 가이드', free: false },
          ].map((item, i) => (
            <AnimDiv key={i} visible={hook.visible} delay={0.1 + i * 0.06}>
              <div style={{
                padding: '22px 20px',
                background: item.free ? 'linear-gradient(135deg, rgba(201,169,110,0.1), rgba(201,169,110,0.03))' : 'rgba(255,255,255,0.015)',
                border: `1px solid ${item.free ? 'rgba(201,169,110,0.2)' : 'rgba(255,255,255,0.04)'}`,
                borderRadius: 14, display: 'flex', alignItems: 'center', gap: 14,
              }}>
                <span style={{ fontSize: 18, color: 'var(--gold-400)', opacity: 0.6, width: 24, textAlign: 'center', flexShrink: 0 }}>{item.sym}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: 'var(--font-sans)', fontSize: 13, fontWeight: 500, color: 'var(--cream-200)' }}>{item.label}</div>
                  <div style={{ fontFamily: 'var(--font-sans)', fontSize: 11, fontWeight: 300, color: 'var(--text-muted)', marginTop: 2 }}>{item.sub}</div>
                </div>
                <span style={{
                  fontFamily: 'var(--font-sans)', fontSize: 9, fontWeight: 600, padding: '3px 8px', borderRadius: 999, flexShrink: 0,
                  background: item.free ? 'rgba(201,169,110,0.15)' : 'rgba(255,255,255,0.05)',
                  color: item.free ? 'var(--gold-400)' : 'var(--text-muted)', letterSpacing: '0.05em',
                }}>{item.free ? '무료' : 'PRO'}</span>
              </div>
            </AnimDiv>
          ))}
        </div>
        <AnimDiv visible={hook.visible} delay={0.7} style={{ textAlign: 'center', marginTop: 24 }}>
          <p style={{ fontFamily: 'var(--font-sans)', fontSize: 12, fontWeight: 300, color: 'var(--text-muted)' }}>무료로 2개 섹션 확인 후, PRO 리포트로 나머지를 만나보세요</p>
        </AnimDiv>
      </section>

      <div style={{ width: 1, height: 80, margin: '0 auto', background: 'linear-gradient(to bottom, transparent, rgba(201,169,110,0.2), transparent)' }} />

      <section ref={report.ref} style={{ padding: '80px 24px 100px', maxWidth: 600, margin: '0 auto', textAlign: 'center' }}>
        <AnimDiv visible={report.visible}>
          <span style={{ fontFamily: 'var(--font-sans)', fontSize: 10, fontWeight: 500, letterSpacing: '0.25em', color: 'var(--gold-500)' }}>HOW IT WORKS</span>
          <h2 style={{
            fontFamily: 'var(--font-serif)', fontSize: 'clamp(22px, 3.5vw, 30px)',
            fontWeight: 400, color: 'var(--cream-100)', lineHeight: 1.5, letterSpacing: '-0.02em', marginTop: 16, marginBottom: 48,
          }}><span style={{ color: 'var(--gold-400)', fontWeight: 700 }}>3분</span>이면 충분해요</h2>
        </AnimDiv>
        {[
          { n: '01', title: '생년월일시 입력', desc: '양력 혹은 음력, 태어난 시간까지' },
          { n: '02', title: 'AI가 사주를 분석', desc: '절기 보정, 지방시 계산, 정밀 만세력 도출' },
          { n: '03', title: '16,000자 리포트', desc: '8개 섹션, 한 권의 책처럼 읽는 운명 해석' },
        ].map((step, i) => (
          <AnimDiv key={i} visible={report.visible} delay={0.15 + i * 0.15}>
            <div style={{
              display: 'flex', alignItems: 'flex-start', gap: 20, textAlign: 'left', padding: '24px 0',
              borderBottom: i < 2 ? '1px solid rgba(201,169,110,0.06)' : 'none',
            }}>
              <span style={{ fontFamily: 'var(--font-serif)', fontSize: 28, fontWeight: 700, color: 'var(--gold-500)', opacity: 0.3, lineHeight: 1, flexShrink: 0, width: 40 }}>{step.n}</span>
              <div>
                <div style={{ fontFamily: 'var(--font-serif)', fontSize: 17, fontWeight: 700, color: 'var(--cream-100)', marginBottom: 6 }}>{step.title}</div>
                <div style={{ fontFamily: 'var(--font-sans)', fontSize: 13, fontWeight: 300, color: 'var(--text-secondary)', lineHeight: 1.7 }}>{step.desc}</div>
              </div>
            </div>
          </AnimDiv>
        ))}
        <AnimDiv visible={report.visible} delay={0.6}>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 40 }}>
            <button onClick={() => router.push('/fortune')} style={{
              fontFamily: 'var(--font-sans)', fontSize: 13, fontWeight: 500, color: 'var(--navy-900)',
              padding: '14px 32px', border: 'none', borderRadius: 999, cursor: 'pointer',
              background: 'linear-gradient(135deg, var(--gold-300), var(--gold-500))',
              boxShadow: '0 4px 24px rgba(201,169,110,0.25)', transition: 'all 0.4s var(--ease-smooth)',
            }}>무료로 사주 보기</button>
            <button onClick={() => router.push('/chat')} style={{
              fontFamily: 'var(--font-sans)', fontSize: 13, fontWeight: 400, color: 'var(--cream-200)',
              padding: '14px 32px', cursor: 'pointer', background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(201,169,110,0.2)', borderRadius: 999,
              backdropFilter: 'blur(12px)', transition: 'all 0.4s var(--ease-smooth)',
            }}>AI 상담으로 시작</button>
          </div>
        </AnimDiv>
      </section>

      <div style={{ width: 1, height: 80, margin: '0 auto', background: 'linear-gradient(to bottom, transparent, rgba(201,169,110,0.2), transparent)' }} />

      <section id="register" ref={cta.ref} style={{ padding: '80px 24px 120px', maxWidth: 480, margin: '0 auto', textAlign: 'center' }}>
        <AnimDiv visible={cta.visible}>
          <span style={{ fontFamily: 'var(--font-sans)', fontSize: 10, fontWeight: 500, letterSpacing: '0.25em', color: 'var(--gold-500)' }}>PRE-REGISTER</span>
          <h2 style={{
            fontFamily: 'var(--font-serif)', fontSize: 'clamp(22px, 3.5vw, 30px)',
            fontWeight: 400, color: 'var(--cream-100)', lineHeight: 1.5, letterSpacing: '-0.02em', marginTop: 16, marginBottom: 12,
          }}>오픈 알림,<br /><span style={{ color: 'var(--gold-400)', fontWeight: 700 }}>가장 먼저</span> 받아보세요</h2>
          <p style={{ fontFamily: 'var(--font-sans)', fontSize: 13, fontWeight: 300, color: 'var(--text-secondary)', lineHeight: 1.9, marginBottom: 36 }}>사전등록하면 첫 리포트 <span style={{ color: 'var(--gold-400)', fontWeight: 500 }}>50% 할인</span></p>
        </AnimDiv>
        {!submitted ? (
          <AnimDiv visible={cta.visible} delay={0.2}>
            <div style={{ display: 'flex', gap: 10, maxWidth: 400, margin: '0 auto', flexWrap: 'wrap', justifyContent: 'center' }}>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSubmit()} placeholder="이메일 주소" style={{
                flex: 1, minWidth: 200, padding: '15px 20px', fontFamily: 'var(--font-sans)', fontSize: 13, fontWeight: 300,
                color: 'var(--cream-100)', background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(201,169,110,0.12)', borderRadius: 12, outline: 'none', transition: 'all 0.3s',
              }} />
              <button onClick={handleSubmit} disabled={submitting || !email.trim()} style={{
                fontFamily: 'var(--font-sans)', fontSize: 13, fontWeight: 600, color: 'var(--navy-900)',
                padding: '15px 28px', border: 'none', borderRadius: 12, cursor: 'pointer',
                background: email.trim() ? 'linear-gradient(135deg, var(--gold-300), var(--gold-500))' : 'rgba(201,169,110,0.15)',
                transition: 'all 0.4s var(--ease-smooth)', opacity: submitting ? 0.6 : 1, whiteSpace: 'nowrap',
              }}>{submitting ? '등록 중...' : '알림 받기'}</button>
            </div>
            <p style={{ fontFamily: 'var(--font-sans)', fontSize: 10, fontWeight: 300, color: 'var(--text-muted)', marginTop: 14 }}>오픈 소식만, 스팸 없이</p>
          </AnimDiv>
        ) : (
          <div style={{
            padding: '32px 24px', borderRadius: 16,
            background: 'linear-gradient(135deg, rgba(201,169,110,0.1), rgba(201,169,110,0.03))',
            border: '1px solid rgba(201,169,110,0.2)', animation: 'fadeUp 0.5s var(--ease-smooth) both',
          }}>
            <svg width={28} height={28} viewBox="0 0 24 24" fill="none" style={{ marginBottom: 12 }}>
              <circle cx="12" cy="12" r="10" stroke="var(--gold-400)" strokeWidth="1.5" />
              <path d="M8 12l3 3 5-5" stroke="var(--gold-400)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <p style={{ fontFamily: 'var(--font-serif)', fontSize: 17, fontWeight: 700, color: 'var(--cream-100)', marginBottom: 8 }}>등록 완료</p>
            <p style={{ fontFamily: 'var(--font-sans)', fontSize: 13, fontWeight: 300, color: 'var(--text-secondary)' }}>오픈 시 가장 먼저 알려드릴게요</p>
          </div>
        )}
      </section>

      <footer style={{ padding: '40px 24px 56px', textAlign: 'center', borderTop: '1px solid rgba(201,169,110,0.06)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 10 }}>
          <svg width={14} height={14} viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="9" stroke="var(--gold-500)" strokeWidth="1" opacity="0.4" />
            <circle cx="12" cy="12" r="2" fill="var(--gold-500)" opacity="0.5" />
          </svg>
          <span style={{ fontFamily: 'var(--font-serif)', fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.08em' }}>나운 NOWN</span>
        </div>
        <p style={{ fontFamily: 'var(--font-sans)', fontSize: 11, fontWeight: 300, color: 'var(--text-muted)', opacity: 0.5, marginBottom: 16 }}>구름 위에서 읽는 운명</p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 16, flexWrap: 'wrap' }}>
          <span onClick={() => router.push('/privacy')} style={{ fontFamily: 'var(--font-sans)', fontSize: 10, fontWeight: 300, color: 'var(--text-muted)', opacity: 0.4, cursor: 'pointer' }}>개인정보처리방침</span>
          <span style={{ color: 'var(--text-muted)', opacity: 0.15 }}>·</span>
          <span onClick={() => router.push('/terms')} style={{ fontFamily: 'var(--font-sans)', fontSize: 10, fontWeight: 300, color: 'var(--text-muted)', opacity: 0.4, cursor: 'pointer' }}>이용약관</span>
          <span style={{ color: 'var(--text-muted)', opacity: 0.15 }}>·</span>
          <span style={{ fontFamily: 'var(--font-sans)', fontSize: 10, fontWeight: 300, color: 'var(--text-muted)', opacity: 0.4 }}>astro.project79@gmail.com</span>
        </div>
      </footer>
    </div>
  );
}
