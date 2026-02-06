'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/lib/store';
import { themes } from '@/lib/theme';
import StarFieldCanvas from '@/components/canvas/StarFieldCanvas';
import Header from '@/components/ui/Header';
import { Ico, ICON_PATHS } from '@/components/icons/SvgIcons';

var PILLAR_LABELS = ['年柱', '月柱', '日柱', '時柱'];
var PILLAR_SUBS = ['태어난 해', '태어난 달', '태어난 날', '태어난 시'];
var EL_MAP: Record<string, { label: string; color: string; hanja: string }> = {
  '목': { label: '木', color: '#22c55e', hanja: '木' },
  '화': { label: '火', color: '#ef4444', hanja: '火' },
  '토': { label: '土', color: '#eab308', hanja: '土' },
  '금': { label: '金', color: '#a3a3a3', hanja: '金' },
  '수': { label: '水', color: '#3b82f6', hanja: '水' },
};

interface PillarData { text: string; stem: string; branch: string; }
interface DayMasterData { char: string; element: string; nature: string; personality: string; color: string; }
interface SajuData {
  userId: string;
  profileId: string;
  fourPillars: { year: PillarData; month: PillarData; day: PillarData; hour: PillarData };
  dayMaster: DayMasterData;
  fiveElements: Record<string, number>;
  focusArea: string;
}

var BLUR_SECTIONS = [
  { title: '재물운', icon: ICON_PATHS.wave },
  { title: '연애·결혼운', icon: ICON_PATHS.hex },
  { title: '직업·진로', icon: ICON_PATHS.zap },
  { title: '건강운', icon: ICON_PATHS.eye },
  { title: '대인관계', icon: ICON_PATHS.user },
  { title: '월별 운세', icon: ICON_PATHS.calendar },
  { title: '조언과 방향', icon: ICON_PATHS.star },
];

export default function FortuneResultPage() {
  var router = useRouter();
  var store = useStore();
  var theme = store.theme;
  var sajuInput = store.sajuInput;
  var t = themes[theme];
  var [loading, setLoading] = useState(true);
  var [data, setData] = useState<SajuData | null>(null);
  var [error, setError] = useState('');

  useEffect(function() {
    if (!sajuInput) {
      router.push('/fortune');
      return;
    }

    fetch('/api/saju/calculate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(sajuInput),
    })
      .then(function(r) { return r.json(); })
      .then(function(res) {
        if (res.success) {
          setData(res.data);
          if (typeof window !== 'undefined') {
            localStorage.setItem('saju_uid', res.data.userId);
            localStorage.setItem('saju_profile_id', res.data.profileId);
          }
        } else {
          setError(res.error || '분석 실패');
        }
      })
      .catch(function() { setError('서버 연결 실패'); })
      .finally(function() { setLoading(false); });
  }, [sajuInput, router]);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: t.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
        <StarFieldCanvas theme={theme} />
        <div style={{ position: 'relative', zIndex: 10, textAlign: 'center' }}>
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none" style={{ animation: 'orbSpin 3s linear infinite' }}>
            <circle cx="24" cy="24" r="20" stroke={t.accent} strokeWidth="1" opacity="0.2" />
            <path d="M24 4a20 20 0 0 1 20 20" stroke={t.accent} strokeWidth="1.5" strokeLinecap="round" opacity="0.7" />
          </svg>
          <p style={{ fontFamily: "'Pretendard',sans-serif", fontSize: 13, color: t.dim, marginTop: 20, fontWeight: 300 }}>
            사주팔자를 분석하고 있습니다...
          </p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div style={{ minHeight: '100vh', background: t.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16 }}>
        <StarFieldCanvas theme={theme} />
        <div style={{ position: 'relative', zIndex: 10, textAlign: 'center' }}>
          <p style={{ color: t.dim, fontSize: 14 }}>{error || '데이터를 불러올 수 없습니다'}</p>
          <button onClick={function() { router.push('/fortune'); }} style={{ marginTop: 16, padding: '10px 24px', background: 'transparent', border: '1px solid rgba(74,111,255,0.3)', color: t.accent, cursor: 'pointer', fontSize: 13 }}>
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  var pillars = [data.fourPillars.year, data.fourPillars.month, data.fourPillars.day, data.fourPillars.hour];
  var elValues = Object.values(data.fiveElements);
  var maxEl = Math.max.apply(null, elValues.concat([1]));
  var accentRgba = t.pColor1.join(',');

  return (
    <div style={{ minHeight: '100vh', background: t.bg, transition: 'background 0.7s' }}>
      <StarFieldCanvas theme={theme} />
      <Header />

      <div style={{ position: 'relative', zIndex: 10, maxWidth: 640, margin: '0 auto', padding: '100px 24px 80px' }}>

        <div style={{ textAlign: 'center', marginBottom: 48, animation: 'fadeSlide 0.8s both' }}>
          <span style={{ fontFamily: "'ZEN SERIF TTF','Pretendard',sans-serif", fontSize: 10, letterSpacing: '0.5em', color: t.accent, opacity: 0.5 }}>
            QUICK READING
          </span>
          <h1 style={{ fontFamily: "'ZEN SERIF TTF','Pretendard',sans-serif", fontSize: 'clamp(22px,4vw,32px)', fontWeight: 300, color: t.text, marginTop: 12 }}>
            {sajuInput ? sajuInput.name : ''}님의 사주
          </h1>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 48, animation: 'fadeSlide 0.8s 0.2s both' }}>
          {pillars.map(function(p, i) {
            return (
              <div key={i} style={{ textAlign: 'center', padding: '20px 8px' }}>
                <div style={{ fontSize: 10, color: t.dim, marginBottom: 4, letterSpacing: '0.15em' }}>{PILLAR_LABELS[i]}</div>
                <div style={{ fontSize: 9, color: t.dim, marginBottom: 14, opacity: 0.5 }}>{PILLAR_SUBS[i]}</div>
                <div style={{ fontSize: 'clamp(28px,5vw,40px)', color: t.text, fontFamily: "'ZEN SERIF TTF',sans-serif", fontWeight: 400, textShadow: '0 0 30px ' + t.glowWide }}>{p.stem}</div>
                <div style={{ width: '0.5px', height: 16, margin: '8px auto', background: 'linear-gradient(to bottom, ' + t.accent + '30, transparent)' }} />
                <div style={{ fontSize: 'clamp(28px,5vw,40px)', color: t.accent, fontFamily: "'ZEN SERIF TTF',sans-serif", fontWeight: 400 }}>{p.branch}</div>
              </div>
            );
          })}
        </div>

        <div style={{ padding: '28px 24px', marginBottom: 48, animation: 'fadeSlide 0.8s 0.25s both', background: t.fog + '0.15)', backdropFilter: 'blur(20px)', borderLeft: '2px solid ' + data.dayMaster.color + '40' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
            <span style={{ fontSize: 28, fontFamily: "'ZEN SERIF TTF',sans-serif", color: data.dayMaster.color }}>{data.dayMaster.char}</span>
            <div>
              <div style={{ fontSize: 13, color: t.text, fontWeight: 500 }}>{data.dayMaster.element} — {data.dayMaster.nature}</div>
              <div style={{ fontSize: 10, color: t.dim, marginTop: 2 }}>일간 · 당신의 본질</div>
            </div>
          </div>
          <p style={{ fontSize: 13, color: t.dim, lineHeight: 1.9, fontWeight: 300 }}>{data.dayMaster.personality}</p>
        </div>

        <div style={{ marginBottom: 48, animation: 'fadeSlide 0.8s 0.3s both' }}>
          <div style={{ fontSize: 11, color: t.dim, letterSpacing: '0.3em', marginBottom: 16 }}>오행 분포</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {Object.entries(data.fiveElements).map(function(entry) {
              var key = entry[0];
              var val = entry[1];
              var el = EL_MAP[key];
              if (!el) return null;
              var widthPct = (val / maxEl) * 100;
              return (
                <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ width: 24, fontSize: 14, color: el.color, fontFamily: "'ZEN SERIF TTF',serif", textAlign: 'center' }}>{el.hanja}</span>
                  <div style={{ flex: 1, height: 3, background: 'rgba(' + accentRgba + ',0.06)', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: widthPct + '%', background: el.color, opacity: 0.6, transition: 'width 1.2s cubic-bezier(0.23,1,0.32,1)' }} />
                  </div>
                  <span style={{ fontSize: 11, color: t.dim, width: 20, textAlign: 'right' }}>{val}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div style={{ marginBottom: 48, animation: 'fadeSlide 0.8s 0.35s both' }}>
          <div style={{ fontSize: 11, color: t.dim, letterSpacing: '0.3em', marginBottom: 20 }}>상세 분석</div>
          {BLUR_SECTIONS.map(function(sec, i) {
            return (
              <div key={i} style={{ marginBottom: 20, position: 'relative' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <Ico d={sec.icon} size={14} color={t.accent} sw={1} />
                  <h3 style={{ fontFamily: "'ZEN SERIF TTF','Pretendard',sans-serif", fontSize: 14, fontWeight: 400, color: t.text }}>{sec.title}</h3>
                </div>
                <div style={{ position: 'relative' }}>
                  <p style={{ fontSize: 13, color: t.dim, lineHeight: 1.9, fontWeight: 300, filter: 'blur(6px)', userSelect: 'none' }}>
                    이 섹션에서는 {sec.title}에 대한 깊이 있는 분석을 제공합니다. 사주팔자의 오행 배치와 십신 관계를 기반으로 구체적인 방향성과 시기별 변화를 알려드립니다.
                  </p>
                  {i === 0 && (
                    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={t.accent} strokeWidth="1.2" opacity="0.5">
                        <rect x="3" y="11" width="18" height="11" rx="2" />
                        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                      </svg>
                    </div>
                  )}
                </div>
                {i < BLUR_SECTIONS.length - 1 && (
                  <div style={{ height: '0.5px', background: 'linear-gradient(to right, transparent, ' + t.accent + '12, transparent)', marginTop: 20 }} />
                )}
              </div>
            );
          })}
        </div>

        <div style={{ textAlign: 'center', padding: '48px 24px', animation: 'fadeSlide 0.8s 0.4s both' }}>
          <h3 style={{ fontFamily: "'ZEN SERIF TTF','Pretendard',sans-serif", fontSize: 20, fontWeight: 300, color: t.text, marginBottom: 10 }}>
            더 깊은 운명을 읽어보세요
          </h3>
          <p style={{ fontSize: 13, color: t.dim, lineHeight: 1.9, fontWeight: 300, marginBottom: 36 }}>
            눈치 빠른 AI 상담사와 대화하며
            <br />16,000자의 프리미엄 리포트를 받아보세요
          </p>
          <button className="btn-glow" onClick={function() { router.push('/chat'); }} style={{
            padding: '16px 44px', border: 'none', color: '#fff',
            fontFamily: "'ZEN SERIF TTF','Pretendard',sans-serif",
            fontSize: 14, fontWeight: 400, letterSpacing: '0.12em',
            cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 10,
            background: 'linear-gradient(135deg, rgba(' + t.pColor2.join(',') + ',0.2), rgba(' + t.pColor3.join(',') + ',0.15))',
            boxShadow: '0 0 0 1px rgba(' + t.pColor2.join(',') + ',0.2), 0 4px 30px rgba(' + t.pColor2.join(',') + ',0.12)',
            backdropFilter: 'blur(12px)', transition: 'all 0.5s cubic-bezier(0.23,1,0.32,1)',
          }}>
            AI 상담 사주 시작하기
            <Ico d={ICON_PATHS.chat} size={14} color="#fff" sw={1.5} />
          </button>
        </div>
      </div>
    </div>
  );
}
