'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useStore } from '@/lib/store';
import { themes } from '@/lib/theme';
import Header from '@/components/ui/Header';

var SECTION_CONFIG: Record<string, { title: string; num: string; killing?: boolean; iconPath: string }> = {
  overview: {
    num: '01',
    title: '나의 사주 한눈에 보기',
    iconPath: 'M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5',
  },
  personality: {
    num: '02',
    title: '타고난 나',
    killing: true,
    iconPath: 'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8z',
  },
  yearly: {
    num: '03',
    title: '올해의 흐름',
    iconPath: 'M22 12h-4l-3 9L9 3l-3 9H2',
  },
  career_wealth: {
    num: '04',
    title: '돈과 커리어',
    killing: true,
    iconPath: 'M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6',
  },
  love: {
    num: '05',
    title: '연애와 관계',
    killing: true,
    iconPath: 'M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z',
  },
  health: {
    num: '06',
    title: '건강 체크',
    iconPath: 'M22 12h-4l-3 9L9 3l-3 9H2',
  },
  monthly: {
    num: '07',
    title: '2026년 월별 운세',
    iconPath: 'M19 4H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2zM16 2v4M8 2v4M3 10h18',
  },
  advice: {
    num: '08',
    title: '나운의 조언',
    iconPath: 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z',
  },
};

var ELEMENT_COLORS: Record<string, { bg: string; text: string; glow: string }> = {
  '\uBAA9': { bg: 'rgba(74,222,128,0.12)', text: '#4ade80', glow: 'rgba(74,222,128,0.3)' },
  '\uD654': { bg: 'rgba(248,113,113,0.12)', text: '#f87171', glow: 'rgba(248,113,113,0.3)' },
  '\uD1A0': { bg: 'rgba(251,191,36,0.12)', text: '#fbbf24', glow: 'rgba(251,191,36,0.3)' },
  '\uAE08': { bg: 'rgba(226,232,240,0.12)', text: '#e2e8f0', glow: 'rgba(226,232,240,0.3)' },
  '\uC218': { bg: 'rgba(96,165,250,0.12)', text: '#60a5fa', glow: 'rgba(96,165,250,0.3)' },
};

var ELEMENT_TO_FILE: Record<string, string> = {
  '\uBAA9': 'wood', '\uD654': 'fire', '\uD1A0': 'earth', '\uAE08': 'metal', '\uC218': 'water',
};

var PILLAR_LABELS = ['\uB144\uC8FC', '\uC6D4\uC8FC', '\uC77C\uC8FC', '\uC2DC\uC8FC'];
var PILLAR_SUB = ['\uBFCC\uB9AC', '\uC904\uAE30', '\uB098', '\uC5F4\uB9E4'];

function getCharacterImage(element: string, gender: string) {
  var base = ELEMENT_TO_FILE[element] || 'earth';
  var suffix = gender === 'male' ? 'm' : 'f';
  return '/characters/' + base + '-' + suffix + '.png';
}

function formatContent(text: string) {
  if (!text) return [];
  var lines = text.split('\n');
  var elements: any[] = [];
  var idx = 0;
  for (var i = 0; i < lines.length; i++) {
    var line = lines[i];
    if (!line.trim()) { elements.push({ type: 'spacer', key: 'sp-' + idx++ }); continue; }
    if (line.startsWith('## ')) { elements.push({ type: 'h2', text: line.replace('## ', ''), key: 'h2-' + idx++ }); }
    else if (line.startsWith('### ')) { elements.push({ type: 'h3', text: line.replace('### ', ''), key: 'h3-' + idx++ }); }
    else if (line.match(/^[-*]\s/)) { elements.push({ type: 'li', text: line.replace(/^[-*]\s/, ''), key: 'li-' + idx++ }); }
    else if (line.match(/^\d+\.\s/)) { elements.push({ type: 'oli', text: line.replace(/^\d+\.\s/, ''), key: 'oli-' + idx++ }); }
    else { elements.push({ type: 'p', text: line, key: 'p-' + idx++ }); }
  }
  return elements;
}

function renderBold(text: string, accentColor: string) {
  var parts = text.split(/\*\*(.+?)\*\*/g);
  return parts.map(function(part, i) {
    if (i % 2 === 1) return <span key={i} style={{ color: accentColor, fontWeight: 600 }}>{part}</span>;
    return <span key={i}>{part}</span>;
  });
}

export default function ReportViewerPage() {
  var params = useParams();
  var router = useRouter();
  var store = useStore();
  var t = themes[store.theme];
  var gold = '#C9A96E';
  var goldRgba = '201,169,110';
  var [report, setReport] = useState<any>(null);
  var [loading, setLoading] = useState(true);
  var [activeNav, setActiveNav] = useState('overview');
  var sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});

  useEffect(function() {
    var id = params.id;
    if (!id) return;
    fetch('/api/report/' + id)
      .then(function(r) { return r.json(); })
      .then(function(res) {
        if (res.success) setReport(res.data);
        setLoading(false);
      })
      .catch(function() { setLoading(false); });
  }, [params.id]);

  useEffect(function() {
    if (!report) return;
    var observer = new IntersectionObserver(
      function(entries) {
        for (var i = 0; i < entries.length; i++) {
          if (entries[i].isIntersecting) setActiveNav(entries[i].target.id);
        }
      },
      { rootMargin: '-30% 0px -60% 0px', threshold: 0 }
    );
    var keys = Object.keys(SECTION_CONFIG);
    for (var k = 0; k < keys.length; k++) {
      var el = sectionRefs.current[keys[k]];
      if (el) observer.observe(el);
    }
    return function() { observer.disconnect(); };
  }, [report]);

  function scrollTo(key: string) {
    var el = sectionRefs.current[key];
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: t.bg, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
        <svg width="48" height="48" viewBox="0 0 48 48" fill="none" style={{ animation: 'reportSpin 2s linear infinite' }}>
          <circle cx="24" cy="24" r="20" stroke={gold} strokeWidth="1" opacity="0.15" />
          <path d="M24 4a20 20 0 0 1 20 20" stroke={gold} strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
        </svg>
        <p style={{ color: t.dim, fontSize: 13 }}>리포트를 불러오고 있어요</p>
        <style>{`@keyframes reportSpin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!report) {
    return (
      <div style={{ minHeight: '100vh', background: t.bg, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={t.dim} strokeWidth="1.5"><circle cx="12" cy="12" r="10" /><path d="M16 16s-1.5-2-4-2-4 2-4 2" /><line x1="9" y1="9" x2="9.01" y2="9" /><line x1="15" y1="9" x2="15.01" y2="9" /></svg>
        <p style={{ color: t.dim, fontSize: 14 }}>리포트를 찾을 수 없습니다</p>
        <button onClick={function() { router.push('/'); }} style={{ marginTop: 8, padding: '10px 24px', background: 'rgba(' + goldRgba + ',0.1)', border: '1px solid rgba(' + goldRgba + ',0.15)', borderRadius: 8, color: gold, fontSize: 13, cursor: 'pointer' }}>홈으로</button>
      </div>
    );
  }

  var sajuData = report.saju_data || {};
  var sections = report.sections || {};
  var fp = sajuData.fourPillars || {};
  var dm = sajuData.dayMaster || {};
  var elems = sajuData.elements?.distribution || sajuData.elements || {};
  var elemTotal = 0;
  for (var ek in elems) elemTotal += Number(elems[ek]) || 0;
  var userName = report.user_name && report.user_name !== '\uC0AC\uC6A9\uC790' ? report.user_name : '';
  var userGender = report.user_gender || 'female';
  var orderedKeys = ['overview', 'personality', 'yearly', 'career_wealth', 'love', 'health', 'monthly', 'advice'];
  var availableKeys = orderedKeys.filter(function(k) { return k === 'overview' || sections[k]; });

  return (
    <div style={{ minHeight: '100vh', background: t.bg }}>
      <Header />
      <style>{`
        @keyframes reportFadeUp { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes reportSpin { to { transform: rotate(360deg); } }
        .report-card { animation: reportFadeUp 0.6s ease both; }
        .report-card:nth-child(2) { animation-delay: 0.1s; }
        .report-card:nth-child(3) { animation-delay: 0.15s; }
        .toc-item { transition: all 0.2s ease; }
        .toc-item:hover { background: rgba(${goldRgba},0.08) !important; }
        @media print { .report-nav, .report-header-actions { display: none !important; } .report-card { break-inside: avoid; } }
        @media (max-width: 768px) { .report-toc { display: none !important; } .report-main { margin-left: 0 !important; max-width: 100% !important; } }
      `}</style>

      <div style={{ display: 'flex', maxWidth: 1100, margin: '0 auto', padding: '80px 20px 60px', gap: 32 }}>
        <nav className="report-toc" style={{ position: 'sticky', top: 88, width: 200, flexShrink: 0, height: 'fit-content', padding: '16px 0', borderRight: '1px solid rgba(' + goldRgba + ',0.06)' }}>
          {availableKeys.map(function(key) {
            var cfg = SECTION_CONFIG[key];
            if (!cfg) return null;
            var isActive = activeNav === key;
            return (
              <button key={key} onClick={function() { scrollTo(key); }} className="toc-item" style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '10px 16px', border: 'none', borderRadius: 8, cursor: 'pointer', background: isActive ? 'rgba(' + goldRgba + ',0.1)' : 'transparent', textAlign: 'left' }}>
                <span style={{ fontSize: 10, fontWeight: 600, color: isActive ? gold : t.dim, minWidth: 18, opacity: isActive ? 1 : 0.5 }}>{cfg.num}</span>
                <span style={{ fontSize: 12.5, color: isActive ? t.text : t.dim, fontWeight: isActive ? 500 : 400 }}>
                  {cfg.title}
                  {cfg.killing && <svg width="8" height="8" viewBox="0 0 24 24" fill={gold} style={{ marginLeft: 4, verticalAlign: 'middle', opacity: 0.7 }}><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>}
                </span>
              </button>
            );
          })}
        </nav>

        <main className="report-main" style={{ flex: 1, maxWidth: 720, minWidth: 0 }}>
          <div className="report-card" style={{ textAlign: 'center', marginBottom: 48, padding: '40px 24px' }}>
            <div style={{ width: 100, height: 100, margin: '0 auto 20px', borderRadius: '50%', overflow: 'hidden', border: '2px solid rgba(' + goldRgba + ',0.2)', boxShadow: '0 0 32px rgba(' + goldRgba + ',0.15)' }}>
              <img src={getCharacterImage(dm.element || '\uD1A0', userGender)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={function(e: any) { e.target.style.display = 'none'; }} />
            </div>
            <h1 style={{ fontFamily: "'Noto Serif KR','serif'", fontSize: 'clamp(22px, 4vw, 28px)', color: t.text, fontWeight: 400, marginBottom: 8, letterSpacing: '-0.02em' }}>
              {userName ? userName + '님의 사주 리포트' : '프리미엄 사주 리포트'}
            </h1>
            <p style={{ fontSize: 13, color: t.dim }}>{report.total_chars?.toLocaleString()}자 · {new Date(report.created_at).toLocaleDateString('ko-KR')} 생성</p>
          </div>

          <section id="overview" ref={function(el) { sectionRefs.current.overview = el; }} className="report-card" style={{ marginBottom: 32 }}>
            <div style={{ padding: '28px 24px', background: 'rgba(' + goldRgba + ',0.03)', border: '1px solid rgba(' + goldRgba + ',0.08)', borderRadius: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 }}>
                <span style={{ width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(' + goldRgba + ',0.1)', border: '1px solid rgba(' + goldRgba + ',0.15)', fontSize: 11, fontWeight: 700, color: gold }}>01</span>
                <h2 style={{ fontFamily: "'Noto Serif KR','serif'", fontSize: 18, color: t.text, fontWeight: 400 }}>나의 사주 한눈에 보기</h2>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginBottom: 24 }}>
                {['year', 'month', 'day', 'hour'].map(function(pos, i) {
                  var pillar = fp[pos] || {};
                  var isDay = pos === 'day';
                  return (
                    <div key={pos} style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: 10, color: t.dim, marginBottom: 6, letterSpacing: '0.05em' }}>
                        {PILLAR_LABELS[i]}
                        <span style={{ display: 'block', fontSize: 9, opacity: 0.5, marginTop: 2 }}>{PILLAR_SUB[i]}</span>
                      </div>
                      <div style={{ padding: '14px 4px', borderRadius: 12, background: isDay ? 'rgba(' + goldRgba + ',0.08)' : 'rgba(' + goldRgba + ',0.02)', border: isDay ? '1px solid rgba(' + goldRgba + ',0.2)' : '1px solid rgba(' + goldRgba + ',0.05)', position: 'relative' }}>
                        {isDay && <div style={{ position: 'absolute', top: -6, left: '50%', transform: 'translateX(-50%)', fontSize: 8, color: gold, background: t.bg, padding: '1px 8px', border: '1px solid rgba(' + goldRgba + ',0.2)', borderRadius: 99, fontWeight: 600 }}>ME</div>}
                        <div style={{ fontFamily: "'Noto Serif KR','serif'", fontSize: 24, fontWeight: 400, color: t.text, marginBottom: 2 }}>{pillar.stem || ''}</div>
                        <div style={{ width: 16, height: 1, background: 'rgba(' + goldRgba + ',0.1)', margin: '6px auto' }} />
                        <div style={{ fontFamily: "'Noto Serif KR','serif'", fontSize: 24, fontWeight: 400, color: gold, opacity: 0.85 }}>{pillar.branch || ''}</div>
                      </div>
                      <div style={{ fontSize: 9, color: t.dim, marginTop: 6, opacity: 0.4 }}>{pillar.hanja || ''}</div>
                    </div>
                  );
                })}
              </div>

              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 11, color: t.dim, marginBottom: 14, fontWeight: 500 }}>오행 밸런스</div>
                <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
                  {['\uBAA9', '\uD654', '\uD1A0', '\uAE08', '\uC218'].map(function(elem) {
                    var val = Number(elems[elem]) || 0;
                    var pct = elemTotal > 0 ? (val / elemTotal) * 100 : 0;
                    var ec = ELEMENT_COLORS[elem];
                    return (
                      <div key={elem} style={{ flex: pct > 0 ? pct : 1, minWidth: 36, textAlign: 'center' }}>
                        <div style={{ height: 28, borderRadius: 6, background: ec?.bg || 'rgba(255,255,255,0.05)', border: '1px solid ' + (ec?.text || '#666') + '22', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <span style={{ fontSize: 12, fontWeight: 600, color: ec?.text || t.text }}>{elem}</span>
                        </div>
                        <span style={{ fontSize: 10, color: t.dim, marginTop: 4, display: 'block' }}>{val}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
                <div style={{ padding: '14px 12px', background: 'rgba(' + goldRgba + ',0.04)', borderRadius: 10, border: '1px solid rgba(' + goldRgba + ',0.06)', textAlign: 'center' }}>
                  <div style={{ fontSize: 10, color: t.dim, marginBottom: 4 }}>일간</div>
                  <div style={{ fontFamily: "'Noto Serif KR','serif'", fontSize: 22, color: t.text }}>{dm.char || ''}</div>
                  <div style={{ fontSize: 11, color: gold, marginTop: 2 }}>{dm.element || ''} · {dm.yinYang || ''}</div>
                </div>
                {sajuData.structure?.type && (
                  <div style={{ padding: '14px 12px', background: 'rgba(' + goldRgba + ',0.04)', borderRadius: 10, border: '1px solid rgba(' + goldRgba + ',0.06)', textAlign: 'center' }}>
                    <div style={{ fontSize: 10, color: t.dim, marginBottom: 4 }}>격국</div>
                    <div style={{ fontSize: 14, color: t.text, fontWeight: 500 }}>{sajuData.structure.type}</div>
                  </div>
                )}
                {sajuData.usefulGod?.element && (
                  <div style={{ padding: '14px 12px', background: 'rgba(' + goldRgba + ',0.04)', borderRadius: 10, border: '1px solid rgba(' + goldRgba + ',0.06)', textAlign: 'center' }}>
                    <div style={{ fontSize: 10, color: t.dim, marginBottom: 4 }}>용신</div>
                    <div style={{ fontSize: 18, color: ELEMENT_COLORS[sajuData.usefulGod.element]?.text || gold }}>{sajuData.usefulGod.element}</div>
                  </div>
                )}
              </div>

              {sections.overview && (
                <div style={{ marginTop: 20, padding: '16px 0 0', borderTop: '1px solid rgba(' + goldRgba + ',0.06)' }}>
                  <p style={{ fontSize: 14, color: t.text, lineHeight: 1.9, opacity: 0.85 }}>{sections.overview}</p>
                </div>
              )}
            </div>
          </section>

          {availableKeys.filter(function(k) { return k !== 'overview'; }).map(function(key) {
            var cfg = SECTION_CONFIG[key];
            if (!cfg) return null;
            var content = sections[key] || '';
            var parsed = formatContent(content);
            var isKilling = cfg.killing;
            return (
              <section key={key} id={key} ref={function(el) { sectionRefs.current[key] = el; }} className="report-card" style={{ marginBottom: 32 }}>
                <div style={{ padding: '32px 28px', borderRadius: 16, background: isKilling ? 'rgba(' + goldRgba + ',0.04)' : 'rgba(' + goldRgba + ',0.02)', border: isKilling ? '1px solid rgba(' + goldRgba + ',0.15)' : '1px solid rgba(' + goldRgba + ',0.06)', position: 'relative', overflow: 'hidden' }}>
                  {isKilling && <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'linear-gradient(90deg, transparent, rgba(' + goldRgba + ',0.4), transparent)' }} />}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
                    <span style={{ width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: isKilling ? 'rgba(' + goldRgba + ',0.15)' : 'rgba(' + goldRgba + ',0.08)', border: '1px solid rgba(' + goldRgba + ',' + (isKilling ? '0.25' : '0.12') + ')', fontSize: 11, fontWeight: 700, color: gold }}>{cfg.num}</span>
                    <h2 style={{ fontFamily: "'Noto Serif KR','serif'", fontSize: 18, color: t.text, fontWeight: 400, display: 'flex', alignItems: 'center', gap: 8, flex: 1 }}>
                      {cfg.title}
                      {isKilling && <span style={{ fontSize: 9, color: gold, background: 'rgba(' + goldRgba + ',0.1)', padding: '2px 8px', borderRadius: 99, fontWeight: 600, letterSpacing: '0.05em' }}>HIGHLIGHT</span>}
                    </h2>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={gold} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.3 }}><path d={cfg.iconPath} /></svg>
                  </div>
                  <div>
                    {parsed.map(function(el: any) {
                      if (el.type === 'spacer') return <div key={el.key} style={{ height: 12 }} />;
                      if (el.type === 'h2') return <h3 key={el.key} style={{ fontSize: 15, fontWeight: 600, color: gold, margin: '24px 0 10px', paddingBottom: 8, borderBottom: '1px solid rgba(' + goldRgba + ',0.08)' }}>{el.text}</h3>;
                      if (el.type === 'h3') return <h4 key={el.key} style={{ fontSize: 14, fontWeight: 600, color: t.text, margin: '18px 0 8px' }}>{el.text}</h4>;
                      if (el.type === 'li') return (
                        <div key={el.key} style={{ display: 'flex', gap: 10, marginBottom: 6, paddingLeft: 4 }}>
                          <svg width="6" height="6" viewBox="0 0 6 6" style={{ marginTop: 9, flexShrink: 0 }}><circle cx="3" cy="3" r="3" fill={gold} opacity="0.5" /></svg>
                          <span style={{ fontSize: 14, color: t.text, lineHeight: 1.9, opacity: 0.85 }}>{renderBold(el.text, gold)}</span>
                        </div>
                      );
                      if (el.type === 'oli') return (
                        <div key={el.key} style={{ display: 'flex', gap: 10, marginBottom: 6, paddingLeft: 4 }}>
                          <span style={{ color: gold, fontSize: 12, fontWeight: 600, marginTop: 2, flexShrink: 0, minWidth: 16 }}>{el.key.split('-')[1]}.</span>
                          <span style={{ fontSize: 14, color: t.text, lineHeight: 1.9, opacity: 0.85 }}>{renderBold(el.text, gold)}</span>
                        </div>
                      );
                      return <p key={el.key} style={{ fontSize: 14, color: t.text, lineHeight: 1.95, marginBottom: 4, opacity: 0.85 }}>{renderBold(el.text, gold)}</p>;
                    })}
                  </div>
                </div>
              </section>
            );
          })}

          <div className="report-card" style={{ textAlign: 'center', padding: '40px 24px 60px' }}>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 12, marginBottom: 24 }}>
              <button onClick={function() { window.print(); }} style={{ padding: '12px 28px', background: 'rgba(' + goldRgba + ',0.1)', border: '1px solid rgba(' + goldRgba + ',0.15)', borderRadius: 10, color: t.text, fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
                PDF 저장
              </button>
              <button onClick={function() { if (navigator.share) { navigator.share({ title: '나운 사주 리포트', url: window.location.href }); } else { navigator.clipboard.writeText(window.location.href); } }} style={{ padding: '12px 28px', background: 'rgba(' + goldRgba + ',0.1)', border: '1px solid rgba(' + goldRgba + ',0.15)', borderRadius: 10, color: t.text, fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" /><line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" /></svg>
                공유하기
              </button>
            </div>
            <p style={{ fontSize: 11, color: t.dim, opacity: 0.4 }}>{report.total_chars?.toLocaleString()}자 · {report.model} · {new Date(report.created_at).toLocaleDateString('ko-KR')}</p>
          </div>
        </main>
      </div>
    </div>
  );
}
