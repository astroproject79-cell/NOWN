'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useStore } from '@/lib/store';
import { themes } from '@/lib/theme';
import Header from '@/components/ui/Header';

interface ReportSection {
  key: string;
  title: string;
  icon: string;
  content: string;
}

var SECTION_META: Record<string, { title: string; icon: string }> = {
  personality: { title: '종합 성격 분석', icon: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z' },
  love: { title: '연애·결혼 운세', icon: 'M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z' },
  wealth: { title: '재물·금전 운세', icon: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm0-4h-2V7h2v8z' },
  career: { title: '직업·진로 분석', icon: 'M20 6h-4V4c0-1.11-.89-2-2-2h-4c-1.11 0-2 .89-2 2v2H4c-1.11 0-2 .89-2 2v11c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-6 0h-4V4h4v2z' },
  health: { title: '건강·체질 분석', icon: 'M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-2 10h-4v4h-2v-4H7v-2h4V7h2v4h4v2z' },
  relations: { title: '대인관계·사회운', icon: 'M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5z' },
  monthly: { title: '2026년 월별 운세', icon: 'M19 3h-1V1h-2v2H8V1H6v2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11z' },
  advice: { title: '맞춤 조언과 방향', icon: 'M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71z' },
};

var ELEMENT_COLORS: Record<string, string> = {
  '목': '#4ade80', '화': '#f87171', '토': '#fbbf24', '금': '#e2e8f0', '수': '#60a5fa',
};

export default function ReportViewerPage() {
  var params = useParams();
  var store = useStore();
  var t = themes[store.theme];
  var accentRgba = t.pColor1.join(',');
  var [report, setReport] = useState<any>(null);
  var [loading, setLoading] = useState(true);
  var [activeSection, setActiveSection] = useState(0);

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

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: t.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <svg width="32" height="32" viewBox="0 0 48 48" fill="none" style={{ animation: 'orbSpin 3s linear infinite' }}>
          <circle cx="24" cy="24" r="20" stroke={t.accent} strokeWidth="1" opacity="0.2" />
          <path d="M24 4a20 20 0 0 1 20 20" stroke={t.accent} strokeWidth="1.5" strokeLinecap="round" opacity="0.7" />
        </svg>
      </div>
    );
  }

  if (!report) {
    return (
      <div style={{ minHeight: '100vh', background: t.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: t.dim }}>리포트를 찾을 수 없습니다</p>
      </div>
    );
  }

  var sajuData = report.saju_data || {};
  var sections = report.sections || {};
  var sectionKeys = Object.keys(sections);
  var sectionList: ReportSection[] = sectionKeys.map(function(key) {
    var meta = SECTION_META[key] || { title: key, icon: '' };
    return { key: key, title: meta.title, icon: meta.icon, content: sections[key] };
  });

  var fp = sajuData.fourPillars || {};
  var dm = sajuData.dayMaster || {};
  var elems = sajuData.elements?.distribution || {};
  var elemMax = Math.max(1, ...Object.values(elems).map(Number));

  return (
    <div style={{ minHeight: '100vh', background: t.bg }}>
      <Header />
      <div style={{ maxWidth: 720, margin: '0 auto', padding: '80px 20px 60px' }}>

        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <h1 style={{ fontFamily: "'ZEN SERIF TTF',sans-serif", fontSize: 24, color: t.text, fontWeight: 400, marginBottom: 8 }}>프리미엄 사주 리포트</h1>
          <p style={{ fontSize: 13, color: t.dim }}>{report.total_chars?.toLocaleString()}자 · {report.model}</p>
        </div>

        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 40,
          padding: 24, background: t.fog + '0.3)', backdropFilter: 'blur(12px)',
          border: '1px solid rgba(' + accentRgba + ',0.06)', borderRadius: 12,
        }}>
          {['year', 'month', 'day', 'hour'].map(function(pos, i) {
            var pillar = fp[pos] || {};
            var labels = ['년주', '월주', '일주', '시주'];
            var isDay = pos === 'day';
            return (
              <div key={pos} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 11, color: t.dim, marginBottom: 8 }}>{labels[i]}</div>
                <div style={{
                  padding: '16px 8px', borderRadius: 8,
                  background: isDay ? 'rgba(' + accentRgba + ',0.1)' : 'transparent',
                  border: isDay ? '1px solid rgba(' + accentRgba + ',0.2)' : '1px solid rgba(' + accentRgba + ',0.04)',
                }}>
                  <div style={{ fontFamily: "'ZEN SERIF TTF',sans-serif", fontSize: 22, color: t.text, marginBottom: 4 }}>{pillar.stem || ''}</div>
                  <div style={{ fontFamily: "'ZEN SERIF TTF',sans-serif", fontSize: 22, color: t.accent, opacity: 0.8 }}>{pillar.branch || ''}</div>
                </div>
                <div style={{ fontSize: 10, color: t.dim, marginTop: 6, opacity: 0.5 }}>{pillar.hanja || ''}</div>
              </div>
            );
          })}
        </div>

        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 40,
        }}>
          <div style={{
            padding: 24, background: t.fog + '0.3)', backdropFilter: 'blur(12px)',
            border: '1px solid rgba(' + accentRgba + ',0.06)', borderRadius: 12,
          }}>
            <div style={{ fontSize: 12, color: t.dim, marginBottom: 16 }}>오행 분포</div>
            {['목', '화', '토', '금', '수'].map(function(elem) {
              var val = Number(elems[elem]) || 0;
              var pct = elemMax > 0 ? (val / elemMax) * 100 : 0;
              return (
                <div key={elem} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <span style={{ width: 20, fontSize: 13, color: ELEMENT_COLORS[elem] || t.text, fontWeight: 500 }}>{elem}</span>
                  <div style={{ flex: 1, height: 6, background: 'rgba(' + accentRgba + ',0.06)', borderRadius: 3 }}>
                    <div style={{ height: '100%', borderRadius: 3, width: pct + '%', background: ELEMENT_COLORS[elem], transition: 'width 1s ease', opacity: 0.7 }} />
                  </div>
                  <span style={{ fontSize: 11, color: t.dim, width: 16, textAlign: 'right' }}>{val}</span>
                </div>
              );
            })}
          </div>

          <div style={{
            padding: 24, background: t.fog + '0.3)', backdropFilter: 'blur(12px)',
            border: '1px solid rgba(' + accentRgba + ',0.06)', borderRadius: 12,
          }}>
            <div style={{ fontSize: 12, color: t.dim, marginBottom: 16 }}>일간 분석</div>
            <div style={{ fontFamily: "'ZEN SERIF TTF',sans-serif", fontSize: 36, color: t.text, marginBottom: 8 }}>{dm.char || ''}</div>
            <div style={{ fontSize: 13, color: t.accent, marginBottom: 4 }}>{dm.element || ''} · {dm.yinYang || ''}</div>
            <div style={{ fontSize: 12, color: t.dim, marginBottom: 12 }}>
              강약: {dm.strength === 'strong' ? '신강' : dm.strength === 'weak' ? '신약' : '중화'} ({dm.score || 50}점)
            </div>
            <div style={{ width: '100%', height: 4, background: 'rgba(' + accentRgba + ',0.08)', borderRadius: 2 }}>
              <div style={{ height: '100%', borderRadius: 2, width: (dm.score || 50) + '%', background: t.accent, opacity: 0.6, transition: 'width 1s ease' }} />
            </div>
          </div>
        </div>

        {sajuData.structure?.type && (
          <div style={{
            display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 40,
          }}>
            <div style={{ padding: '16px 20px', background: t.fog + '0.3)', border: '1px solid rgba(' + accentRgba + ',0.06)', borderRadius: 8, textAlign: 'center' }}>
              <div style={{ fontSize: 11, color: t.dim, marginBottom: 4 }}>격국</div>
              <div style={{ fontSize: 14, color: t.text }}>{sajuData.structure.type}</div>
            </div>
            <div style={{ padding: '16px 20px', background: t.fog + '0.3)', border: '1px solid rgba(' + accentRgba + ',0.06)', borderRadius: 8, textAlign: 'center' }}>
              <div style={{ fontSize: 11, color: t.dim, marginBottom: 4 }}>용신</div>
              <div style={{ fontSize: 14, color: ELEMENT_COLORS[sajuData.usefulGod?.element] || t.text }}>{sajuData.usefulGod?.element || '-'}</div>
            </div>
            <div style={{ padding: '16px 20px', background: t.fog + '0.3)', border: '1px solid rgba(' + accentRgba + ',0.06)', borderRadius: 8, textAlign: 'center' }}>
              <div style={{ fontSize: 11, color: t.dim, marginBottom: 4 }}>기신</div>
              <div style={{ fontSize: 14, color: '#ef4444' }}>{sajuData.usefulGod?.jealousGod || '-'}</div>
            </div>
          </div>
        )}

        <div style={{ display: 'flex', gap: 6, overflowX: 'auto', marginBottom: 24, paddingBottom: 8 }}>
          {sectionList.map(function(s, i) {
            var active = activeSection === i;
            return (
              <button key={s.key} onClick={function() { setActiveSection(i); }} style={{
                padding: '10px 16px', whiteSpace: 'nowrap', border: 'none', borderRadius: 8, cursor: 'pointer',
                background: active ? 'rgba(' + accentRgba + ',0.12)' : 'transparent',
                color: active ? t.accent : t.dim, fontSize: 12.5, fontWeight: active ? 500 : 400,
                transition: 'all 0.2s', fontFamily: "'Pretendard',sans-serif",
              }}>
                {s.title}
              </button>
            );
          })}
        </div>

        <div style={{
          padding: '32px 28px', background: t.fog + '0.3)', backdropFilter: 'blur(12px)',
          border: '1px solid rgba(' + accentRgba + ',0.06)', borderRadius: 12, minHeight: 400,
        }}>
          <h2 style={{ fontFamily: "'ZEN SERIF TTF',sans-serif", fontSize: 18, color: t.text, fontWeight: 400, marginBottom: 20 }}>
            {sectionList[activeSection]?.title || ''}
          </h2>
          <div style={{
            fontFamily: "'Pretendard',sans-serif", fontSize: 14.5, color: t.text,
            lineHeight: 2, whiteSpace: 'pre-wrap', opacity: 0.9,
          }}>
            {sectionList[activeSection]?.content || '내용이 없습니다'}
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: 40, paddingBottom: 40 }}>
          <p style={{ fontSize: 11, color: t.dim, opacity: 0.4 }}>
            {report.total_chars?.toLocaleString()}자 · {new Date(report.created_at).toLocaleDateString('ko-KR')} 생성
          </p>
        </div>
      </div>
    </div>
  );
}
