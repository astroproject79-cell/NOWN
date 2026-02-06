'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { themes } from '@/lib/theme';
import { useStore } from '@/lib/store';

var TABS = [
  { id: 'dashboard', label: '대시보드' },
  { id: 'settings', label: '설정' },
  { id: 'chat-prompt', label: '채팅 프롬프트' },
  { id: 'report-prompt', label: '리포트 프롬프트' },
  { id: 'tune', label: 'AI 튜닝' },
];

var MODELS = [
  { id: 'gpt-4o', label: 'GPT-4o', desc: '가장 똑똑함, 비용 높음' },
  { id: 'gpt-4o-mini', label: 'GPT-4o Mini', desc: '빠르고 저렴' },
  { id: 'claude-3.5-sonnet', label: 'Claude Sonnet', desc: '자연스러운 대화' },
  { id: 'gemini-pro', label: 'Gemini Pro', desc: '구글 AI' },
];

function getToken() {
  return typeof window !== 'undefined' ? localStorage.getItem('admin_token') || '' : '';
}

export default function AdminPage() {
  var store = useStore();
  var t = themes[store.theme];
  var router = useRouter();
  var accentRgba = t.pColor1.join(',');
  var accent2Rgba = t.pColor2.join(',');

  var [authed, setAuthed] = useState(false);
  var [pw, setPw] = useState('');
  var [pwError, setPwError] = useState('');
  var [activeTab, setActiveTab] = useState('dashboard');

  var [chatModel, setChatModel] = useState('gpt-4o-mini');
  var [reportModel, setReportModel] = useState('gpt-4o');
  var [premiumPrice, setPremiumPrice] = useState('19900');
  var [consultPrice, setConsultPrice] = useState('29900');
  var [botName, setBotName] = useState('별이');
  var [botGreeting, setBotGreeting] = useState('안녕하세요, {name}예요. 사주 봐드릴게요.\n\n이름이 어떻게 되세요?');
  var [saving, setSaving] = useState(false);
  var [toast, setToast] = useState('');

  var [stats, setStats] = useState({ users: 0, reports: 0, payments: 0, revenue: 0 });
  var [gaLoading, setGaLoading] = useState(false);
  var [gaStats, setGaStats] = useState({ realtime: 0, visitors: 0, pageviews: 0, bounceRate: 0, avgDuration: '0분 0초', mobile: 0, desktop: 0, tablet: 0 });

  var [chatPrompt, setChatPrompt] = useState('');
  var [chatPromptDefault, setChatPromptDefault] = useState(true);
  var [reportSystem, setReportSystem] = useState('');
  var [reportSystemDefault, setReportSystemDefault] = useState(true);
  var [sectionPrompts, setSectionPrompts] = useState<Array<{ key: string; title: string; instruction: string }>>([]);
  var [sectionPromptsDefault, setSectionPromptsDefault] = useState(true);
  var [promptsLoaded, setPromptsLoaded] = useState(false);

  var [tuneTarget, setTuneTarget] = useState('chat');
  var [tuneRequest, setTuneRequest] = useState('');
  var [tuning, setTuning] = useState(false);
  var [tuneResult, setTuneResult] = useState('');

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(function() { setToast(''); }, 2500);
  }

  function handleLogin() {
    fetch('/api/admin/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: pw }),
    })
      .then(function(r) { return r.json(); })
      .then(function(res) {
        if (res.success) {
          setAuthed(true);
          localStorage.setItem('admin_token', res.token);
          loadAll();
        } else {
          setPwError('비밀번호가 틀렸습니다');
        }
      });
  }

  function loadAll() {
    loadSettings();
    loadStats();
    loadPrompts();
  }

  function loadSettings() {
    fetch('/api/admin/settings', { headers: { 'x-admin-token': getToken() } })
      .then(function(r) { return r.json(); })
      .then(function(res) {
        if (res.success) {
          var s = res.data;
          if (s.ai_model) setChatModel(s.ai_model);
          if (s.report_model) setReportModel(s.report_model);
          if (s.premium_price) setPremiumPrice(String(s.premium_price));
          if (s.consult_price) setConsultPrice(String(s.consult_price));
          if (s.bot_name) setBotName(String(s.bot_name));
          if (s.bot_greeting) setBotGreeting(String(s.bot_greeting));
        }
      });
  }

  function loadStats() {
    fetch("/api/admin/stats", { headers: { "x-admin-token": getToken() } })
      .then(function(r) { return r.json(); })
      .then(function(res) {
        if (res.success) setStats(res.data);
      });
    setGaLoading(true);
    fetch("/api/admin/analytics", { headers: { "x-admin-token": getToken() } })
      .then(function(r) { return r.json(); })
      .then(function(res) {
        if (res.success) {
          var d = res.data;
          var mins = Math.floor(d.avgDuration / 60);
          var secs = d.avgDuration % 60;
          setGaStats({
            realtime: d.realtime,
            visitors: d.visitors,
            pageviews: d.pageviews,
            bounceRate: d.bounceRate,
            avgDuration: mins + "분 " + secs + "초",
            mobile: d.mobile,
            desktop: d.desktop,
            tablet: d.tablet,
          });
        }
      })
      .then(function() { setGaLoading(false); }).catch(function(e) { console.log("GA fetch error:", e); setGaLoading(false); });
  }

  function loadPrompts() {
    fetch('/api/admin/prompts', { headers: { 'x-admin-token': getToken() } })
      .then(function(r) { return r.json(); })
      .then(function(res) {
        if (res.success) {
          var d = res.data;
          if (d.chat_system_prompt) {
            setChatPrompt(d.chat_system_prompt.value);
            setChatPromptDefault(d.chat_system_prompt.isDefault);
          }
          if (d.report_system_prompt) {
            setReportSystem(d.report_system_prompt.value);
            setReportSystemDefault(d.report_system_prompt.isDefault);
          }
          if (d.report_section_prompts) {
            setSectionPrompts(d.report_section_prompts.value);
            setSectionPromptsDefault(d.report_section_prompts.isDefault);
          }
          setPromptsLoaded(true);
        }
      });
  }

  function saveSettings() {
    setSaving(true);
    fetch('/api/admin/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'x-admin-token': getToken() },
      body: JSON.stringify({
        ai_model: chatModel,
        report_model: reportModel,
        premium_price: Number(premiumPrice),
        consult_price: Number(consultPrice),
        bot_name: botName,
        bot_greeting: botGreeting,
      }),
    })
      .then(function(r) { return r.json(); })
      .then(function(res) {
        setSaving(false);
        if (res.success) showToast('설정 저장 완료');
        else showToast('저장 실패');
      });
  }

  function savePrompt(key: string, value: any) {
    setSaving(true);
    var payload: Record<string, any> = {};
    payload[key] = value;
    fetch('/api/admin/prompts', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'x-admin-token': getToken() },
      body: JSON.stringify(payload),
    })
      .then(function(r) { return r.json(); })
      .then(function(res) {
        setSaving(false);
        if (res.success) {
          showToast('프롬프트 저장 완료');
          if (key === 'chat_system_prompt') setChatPromptDefault(false);
          if (key === 'report_system_prompt') setReportSystemDefault(false);
          if (key === 'report_section_prompts') setSectionPromptsDefault(false);
        } else {
          showToast('저장 실패');
        }
      });
  }

  function resetPrompt(key: string) {
    if (!confirm('기본값으로 되돌리시겠습니까?')) return;
    setSaving(true);
    fetch('/api/admin/prompts', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json', 'x-admin-token': getToken() },
      body: JSON.stringify({ key: key }),
    })
      .then(function(r) { return r.json(); })
      .then(function(res) {
        setSaving(false);
        if (res.success) {
          showToast('기본값으로 복원됨');
          loadPrompts();
        }
      });
  }

  function handleTune() {
    if (!tuneRequest.trim()) return;
    setTuning(true);
    setTuneResult('');
    var currentPrompt = tuneTarget === 'chat' ? chatPrompt : reportSystem;
    fetch('/api/admin/tune', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-admin-token': getToken() },
      body: JSON.stringify({
        currentPrompt: currentPrompt,
        userRequest: tuneRequest,
        model: chatModel,
      }),
    })
      .then(function(r) { return r.json(); })
      .then(function(res) {
        setTuning(false);
        if (res.success) {
          setTuneResult(res.newPrompt);
        } else {
          setTuneResult('튜닝 실패: ' + (res.error || ''));
        }
      });
  }

  function applyTuneResult() {
    if (!tuneResult) return;
    if (tuneTarget === 'chat') {
      setChatPrompt(tuneResult);
      showToast('채팅 프롬프트에 적용됨 (저장 필요)');
    } else {
      setReportSystem(tuneResult);
      showToast('리포트 프롬프트에 적용됨 (저장 필요)');
    }
    setTuneResult('');
    setTuneRequest('');
  }

  function updateSection(idx: number, field: string, value: string) {
    var updated = sectionPrompts.slice();
    if (field === 'title') updated[idx] = { key: updated[idx].key, title: value, instruction: updated[idx].instruction };
    if (field === 'instruction') updated[idx] = { key: updated[idx].key, title: updated[idx].title, instruction: value };
    setSectionPrompts(updated);
  }

  useEffect(function() {
    var token = localStorage.getItem('admin_token');
    if (token) {
      fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: token }),
      })
        .then(function(r) { return r.json(); })
        .then(function(res) {
          if (res.success) {
            setAuthed(true);
            loadAll();
          }
        });
    }
  }, []);

  var inputStyle = {
    width: '100%', padding: '12px 16px',
    background: 'rgba(' + accentRgba + ',0.04)',
    border: '1px solid rgba(' + accentRgba + ',0.1)',
    borderRadius: 8, color: t.text, fontSize: 14, outline: 'none',
    fontFamily: "'Pretendard',sans-serif",
  };

  var textareaStyle = Object.assign({}, inputStyle, {
    resize: 'vertical' as const, lineHeight: 1.7, fontSize: 13,
  });

  var cardStyle = {
    padding: '20px 24px',
    background: t.fog + '0.25)',
    border: '1px solid rgba(' + accentRgba + ',0.06)',
    borderRadius: 10, marginBottom: 16,
  };

  var labelStyle = { fontSize: 12, color: t.dim, marginBottom: 6, display: 'block' as const };

  var btnPrimary = {
    padding: '14px 24px', border: 'none', borderRadius: 8,
    background: 'linear-gradient(135deg, rgba(' + accentRgba + ',0.2), rgba(' + accent2Rgba + ',0.15))',
    boxShadow: '0 0 0 1px rgba(' + accentRgba + ',0.2)',
    color: '#fff', fontSize: 13, cursor: 'pointer', fontWeight: 500 as const,
    fontFamily: "'Pretendard',sans-serif", transition: 'all 0.3s',
  };

  var btnGhost = {
    padding: '10px 16px', border: '1px solid rgba(' + accentRgba + ',0.12)',
    background: 'transparent', color: t.dim, fontSize: 12, borderRadius: 6,
    cursor: 'pointer', fontFamily: "'Pretendard',sans-serif",
  };

  var badgeDefault = {
    display: 'inline-block', padding: '3px 8px', fontSize: 10, borderRadius: 4,
    background: 'rgba(' + accentRgba + ',0.08)', color: t.dim, marginLeft: 8,
  };

  var badgeCustom = {
    display: 'inline-block', padding: '3px 8px', fontSize: 10, borderRadius: 4,
    background: 'rgba(34,197,94,0.12)', color: '#22c55e', marginLeft: 8,
  };

  if (!authed) {
    return (
      <div style={{ minHeight: '100vh', background: t.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 360, padding: 40 }}>
          <h1 style={{ fontFamily: "'ZEN SERIF TTF',sans-serif", fontSize: 20, color: t.text, marginBottom: 8, fontWeight: 400 }}>관리자</h1>
          <p style={{ fontSize: 13, color: t.dim, marginBottom: 32 }}>비밀번호를 입력하세요</p>
          <input
            type="password" value={pw}
            onChange={function(e) { setPw(e.target.value); setPwError(''); }}
            onKeyDown={function(e) { if (e.key === 'Enter') handleLogin(); }}
            placeholder="Password"
            style={Object.assign({}, inputStyle, { marginBottom: 12 })}
          />
          {pwError && <p style={{ fontSize: 12, color: '#ef4444', marginBottom: 12 }}>{pwError}</p>}
          <button onClick={handleLogin} style={Object.assign({}, btnPrimary, { width: '100%' })}>로그인</button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: t.bg, padding: '32px 20px 80px' }}>
      <div style={{ maxWidth: 720, margin: '0 auto' }}>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
          <div>
            <h1 style={{ fontFamily: "'ZEN SERIF TTF',sans-serif", fontSize: 22, color: t.text, fontWeight: 400 }}>나운 관리자</h1>
            <p style={{ fontSize: 11, color: t.dim, marginTop: 4 }}>NOWN Admin Console</p>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={function() { router.push('/'); }} style={btnGhost}>홈으로</button>
            <button onClick={function() { localStorage.removeItem('admin_token'); setAuthed(false); setPw(''); }} style={btnGhost}>로그아웃</button>
          </div>
        </div>

        <div style={{
          display: 'flex', gap: 4, marginBottom: 32, padding: 4,
          background: t.fog + '0.2)', borderRadius: 10,
          overflowX: 'auto',
        }}>
          {TABS.map(function(tab) {
            var active = activeTab === tab.id;
            return (
              <button key={tab.id} onClick={function() { setActiveTab(tab.id); }} style={{
                padding: '10px 16px', border: 'none', borderRadius: 7,
                background: active ? 'rgba(' + accentRgba + ',0.12)' : 'transparent',
                color: active ? t.text : t.dim,
                fontSize: 13, cursor: 'pointer', whiteSpace: 'nowrap',
                fontFamily: "'Pretendard',sans-serif", fontWeight: active ? 500 : 400,
                transition: 'all 0.2s',
              }}>
                {tab.label}
              </button>
            );
          })}
        </div>

        {activeTab === 'dashboard' && (
          <div>
            <div style={Object.assign({}, cardStyle, { marginBottom: 20 })}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={t.accent} strokeWidth="1.5">
                  <path d="M3 3v18h18" /><path d="M18 9l-5 5-4-4-3 3" />
                </svg>
                <span style={{ fontSize: 14, color: t.text, fontWeight: 500 }}>Google Analytics</span>
                <span style={{ fontSize: 11, color: t.dim, marginLeft: 'auto' }}>최근 7일 기준</span>
                <button onClick={loadStats} style={{ background: "none", border: "none", cursor: "pointer", padding: 4 }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={t.dim} strokeWidth="1.5" style={{ animation: gaLoading ? "spin 1s linear infinite" : "none", transition: "all 0.3s" }}>
                    <path d="M21 12a9 9 0 11-9-9c2.52 0 4.93 1 6.74 2.74L21 8" /><path d="M21 3v5h-5" />
                  </svg>
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 12, marginBottom: 20 }}>
                <div style={{ padding: '16px 14px', background: 'rgba(' + accentRgba + ',0.03)', borderRadius: 10, border: '1px solid rgba(' + accentRgba + ',0.06)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 8px #22c55e' }} />
                    <span style={{ fontSize: 10, color: t.dim, letterSpacing: '0.02em' }}>실시간</span>
                  </div>
                  <div style={{ fontSize: 28, color: t.text, fontFamily: "'ZEN SERIF TTF',sans-serif", fontWeight: 300 }}>{gaStats.realtime}</div>
                  <div style={{ fontSize: 10, color: t.dim, marginTop: 4 }}>활성 사용자</div>
                </div>

                <div style={{ padding: '16px 14px', background: 'rgba(' + accentRgba + ',0.03)', borderRadius: 10, border: '1px solid rgba(' + accentRgba + ',0.06)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={t.dim} strokeWidth="1.5"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/></svg>
                    <span style={{ fontSize: 10, color: t.dim }}>방문자</span>
                  </div>
                  <div style={{ fontSize: 28, color: t.text, fontFamily: "'ZEN SERIF TTF',sans-serif", fontWeight: 300 }}>{gaStats.visitors}</div>
                  <div style={{ fontSize: 10, color: t.dim, marginTop: 4 }}>총 방문자</div>
                </div>

                <div style={{ padding: '16px 14px', background: 'rgba(' + accentRgba + ',0.03)', borderRadius: 10, border: '1px solid rgba(' + accentRgba + ',0.06)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={t.dim} strokeWidth="1.5"><path d="M3 3v18h18"/><path d="M7 16V8M11 16v-5M15 16v-8M19 16v-3"/></svg>
                    <span style={{ fontSize: 10, color: t.dim }}>페이지뷰</span>
                  </div>
                  <div style={{ fontSize: 28, color: t.text, fontFamily: "'ZEN SERIF TTF',sans-serif", fontWeight: 300 }}>{gaStats.pageviews}</div>
                  <div style={{ fontSize: 10, color: t.dim, marginTop: 4 }}>페이지뷰</div>
                </div>

                <div style={{ padding: '16px 14px', background: 'rgba(' + accentRgba + ',0.03)', borderRadius: 10, border: '1px solid rgba(' + accentRgba + ',0.06)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={t.dim} strokeWidth="1.5"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
                    <span style={{ fontSize: 10, color: t.dim }}>이탈률</span>
                  </div>
                  <div style={{ fontSize: 28, color: t.text, fontFamily: "'ZEN SERIF TTF',sans-serif", fontWeight: 300 }}>{gaStats.bounceRate}%</div>
                  <div style={{ fontSize: 10, color: t.dim, marginTop: 4 }}>이탈률</div>
                </div>

                <div style={{ padding: '16px 14px', background: 'rgba(' + accentRgba + ',0.03)', borderRadius: 10, border: '1px solid rgba(' + accentRgba + ',0.06)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={t.dim} strokeWidth="1.5"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
                    <span style={{ fontSize: 10, color: t.dim }}>체류</span>
                  </div>
                  <div style={{ fontSize: 22, color: t.text, fontFamily: "'ZEN SERIF TTF',sans-serif", fontWeight: 300 }}>{gaStats.avgDuration}</div>
                  <div style={{ fontSize: 10, color: t.dim, marginTop: 4 }}>평균 체류</div>
                </div>
              </div>

              <div style={{ borderTop: '1px solid rgba(' + accentRgba + ',0.06)', paddingTop: 16 }}>
                <div style={{ fontSize: 11, color: t.dim, marginBottom: 10 }}>기기별 방문자</div>
                <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' as const }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={t.dim} strokeWidth="1.5"><rect x="5" y="2" width="14" height="20" rx="2"/><line x1="12" y1="18" x2="12" y2="18"/></svg>
                    <span style={{ fontSize: 12, color: t.text }}>모바일</span>
                    <span style={{ fontSize: 13, color: t.accent, fontWeight: 500 }}>{gaStats.mobile}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={t.dim} strokeWidth="1.5"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
                    <span style={{ fontSize: 12, color: t.text }}>데스크톱</span>
                    <span style={{ fontSize: 13, color: t.accent, fontWeight: 500 }}>{gaStats.desktop}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={t.dim} strokeWidth="1.5"><rect x="4" y="2" width="16" height="20" rx="2"/><line x1="12" y1="18" x2="12" y2="18"/></svg>
                    <span style={{ fontSize: 12, color: t.text }}>태블릿</span>
                    <span style={{ fontSize: 13, color: t.accent, fontWeight: 500 }}>{gaStats.tablet}</span>
                  </div>
                </div>
              </div>
            </div>

            <div style={Object.assign({}, cardStyle, { marginBottom: 20 })}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={t.accent} strokeWidth="1.5">
                  <path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
                </svg>
                <span style={{ fontSize: 14, color: t.text, fontWeight: 500 }}>서비스 통계</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12 }}>
                {[
                  { label: '총 사용자', value: stats.users, icon: 'M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 3a4 4 0 100 8 4 4 0 000-8' },
                  { label: '리포트', value: stats.reports, icon: 'M9 12h6M9 16h6M17 21H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
                  { label: '결제 수', value: stats.payments, icon: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z' },
                  { label: '총 매출', value: stats.revenue.toLocaleString() + '원', icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8v2m0 8v2M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
                ].map(function(s, i) {
                  return (
                    <div key={i} style={{ padding: '16px 14px', background: 'rgba(' + accentRgba + ',0.03)', borderRadius: 10, border: '1px solid rgba(' + accentRgba + ',0.06)', textAlign: 'center' as const }}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={t.accent} strokeWidth="1.5" style={{ marginBottom: 8, opacity: 0.6 }}><path d={s.icon} /></svg>
                      <div style={{ fontSize: 22, color: t.text, fontFamily: "'ZEN SERIF TTF',sans-serif", fontWeight: 300, marginBottom: 4 }}>{s.value}</div>
                      <div style={{ fontSize: 10, color: t.dim }}>{s.label}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div style={{ fontSize: 10, color: t.dim, opacity: 0.5 }}>
              * GA 데이터는 Google Analytics API 연동 후 실시간 반영됩니다
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div>
            <div style={cardStyle}>
              <h3 style={{ fontSize: 14, color: t.text, marginBottom: 16, fontWeight: 500 }}>채팅 AI 모델</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 8 }}>
                {MODELS.map(function(m) {
                  var active = chatModel === m.id;
                  return (
                    <button key={m.id} onClick={function() { setChatModel(m.id); }} style={{
                      padding: '14px', textAlign: 'left' as const, cursor: 'pointer',
                      background: active ? 'rgba(' + accentRgba + ',0.1)' : 'rgba(' + accentRgba + ',0.02)',
                      border: active ? '1px solid rgba(' + accentRgba + ',0.3)' : '1px solid rgba(' + accentRgba + ',0.06)',
                      borderRadius: 8, transition: 'all 0.2s',
                    }}>
                      <div style={{ fontSize: 13, color: active ? t.accent : t.text, fontWeight: 500, marginBottom: 2 }}>{m.label}</div>
                      <div style={{ fontSize: 11, color: t.dim }}>{m.desc}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div style={cardStyle}>
              <h3 style={{ fontSize: 14, color: t.text, marginBottom: 16, fontWeight: 500 }}>리포트 AI 모델</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 8 }}>
                {MODELS.map(function(m) {
                  var active = reportModel === m.id;
                  return (
                    <button key={m.id} onClick={function() { setReportModel(m.id); }} style={{
                      padding: '14px', textAlign: 'left' as const, cursor: 'pointer',
                      background: active ? 'rgba(' + accentRgba + ',0.1)' : 'rgba(' + accentRgba + ',0.02)',
                      border: active ? '1px solid rgba(' + accentRgba + ',0.3)' : '1px solid rgba(' + accentRgba + ',0.06)',
                      borderRadius: 8, transition: 'all 0.2s',
                    }}>
                      <div style={{ fontSize: 13, color: active ? t.accent : t.text, fontWeight: 500, marginBottom: 2 }}>{m.label}</div>
                      <div style={{ fontSize: 11, color: t.dim }}>{m.desc}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div style={cardStyle}>
              <h3 style={{ fontSize: 14, color: t.text, marginBottom: 16, fontWeight: 500 }}>가격 설정</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
                <div>
                  <label style={labelStyle}>프리미엄 리포트 (원)</label>
                  <input type="number" value={premiumPrice} onChange={function(e) { setPremiumPrice(e.target.value); }} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>AI 상담 (원)</label>
                  <input type="number" value={consultPrice} onChange={function(e) { setConsultPrice(e.target.value); }} style={inputStyle} />
                </div>
              </div>
            </div>

            <div style={cardStyle}>
              <h3 style={{ fontSize: 14, color: t.text, marginBottom: 16, fontWeight: 500 }}>봇 설정</h3>
              <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 12 }}>
                <div>
                  <label style={labelStyle}>상담사 이름</label>
                  <input type="text" value={botName} onChange={function(e) { setBotName(e.target.value); }} placeholder="별이" style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>첫 인사말 ({'{name}'} = 상담사 이름)</label>
                  <textarea value={botGreeting} onChange={function(e) { setBotGreeting(e.target.value); }} rows={3} style={textareaStyle} />
                </div>
              </div>
            </div>

            <button onClick={saveSettings} disabled={saving} style={Object.assign({}, btnPrimary, { width: '100%' })}>
              {saving ? '저장 중...' : '설정 저장'}
            </button>
          </div>
        )}

        {activeTab === 'chat-prompt' && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ fontSize: 15, color: t.text, fontWeight: 500 }}>채팅 시스템 프롬프트</h3>
              <span style={chatPromptDefault ? badgeDefault : badgeCustom}>
                {chatPromptDefault ? '기본값' : '커스텀'}
              </span>
            </div>
            <p style={{ fontSize: 12, color: t.dim, marginBottom: 16, lineHeight: 1.6 }}>
              AI 상담사의 성격, 말투, 대화 규칙을 정의합니다. 수정 후 저장하면 즉시 반영됩니다.
            </p>
            <textarea
              value={chatPrompt}
              onChange={function(e) { setChatPrompt(e.target.value); }}
              rows={24}
              style={Object.assign({}, textareaStyle, { marginBottom: 16, fontSize: 12.5, lineHeight: 1.8 })}
            />
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={function() { savePrompt('chat_system_prompt', chatPrompt); }} disabled={saving} style={btnPrimary}>
                {saving ? '저장 중...' : '프롬프트 저장'}
              </button>
              {!chatPromptDefault && (
                <button onClick={function() { resetPrompt('chat_system_prompt'); }} style={btnGhost}>기본값 복원</button>
              )}
            </div>
          </div>
        )}

        {activeTab === 'report-prompt' && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ fontSize: 15, color: t.text, fontWeight: 500 }}>리포트 시스템 프롬프트</h3>
              <span style={reportSystemDefault ? badgeDefault : badgeCustom}>
                {reportSystemDefault ? '기본값' : '커스텀'}
              </span>
            </div>
            <p style={{ fontSize: 12, color: t.dim, marginBottom: 16, lineHeight: 1.6 }}>
              리포트 생성 시 AI에게 전달되는 기본 지침입니다. 모든 섹션에 공통 적용됩니다.
            </p>
            <textarea
              value={reportSystem}
              onChange={function(e) { setReportSystem(e.target.value); }}
              rows={10}
              style={Object.assign({}, textareaStyle, { marginBottom: 16, fontSize: 12.5 })}
            />
            <div style={{ display: 'flex', gap: 8, marginBottom: 32 }}>
              <button onClick={function() { savePrompt('report_system_prompt', reportSystem); }} disabled={saving} style={btnPrimary}>
                {saving ? '저장 중...' : '시스템 프롬프트 저장'}
              </button>
              {!reportSystemDefault && (
                <button onClick={function() { resetPrompt('report_system_prompt'); }} style={btnGhost}>기본값 복원</button>
              )}
            </div>

            <div style={{ borderTop: '1px solid rgba(' + accentRgba + ',0.06)', paddingTop: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
                <h3 style={{ fontSize: 15, color: t.text, fontWeight: 500 }}>섹션별 프롬프트 (8개)</h3>
                <span style={sectionPromptsDefault ? badgeDefault : badgeCustom}>
                  {sectionPromptsDefault ? '기본값' : '커스텀'}
                </span>
              </div>
              <p style={{ fontSize: 12, color: t.dim, marginBottom: 16, lineHeight: 1.6 }}>
                리포트의 각 섹션별 AI 지침입니다. 제목과 지시문을 자유롭게 수정할 수 있습니다.
              </p>

              {sectionPrompts.map(function(sec, idx) {
                return (
                  <div key={sec.key} style={Object.assign({}, cardStyle, { marginBottom: 12 })}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                      <span style={{
                        width: 22, height: 22, borderRadius: 6,
                        background: 'rgba(' + accentRgba + ',0.1)',
                        color: t.accent, fontSize: 11, fontWeight: 600,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        {idx + 1}
                      </span>
                      <span style={{ fontSize: 11, color: t.dim, fontFamily: 'monospace' }}>{sec.key}</span>
                    </div>
                    <div style={{ marginBottom: 8 }}>
                      <label style={labelStyle}>섹션 제목</label>
                      <input
                        type="text" value={sec.title}
                        onChange={function(e) { updateSection(idx, 'title', e.target.value); }}
                        style={inputStyle}
                      />
                    </div>
                    <div>
                      <label style={labelStyle}>AI 지시문</label>
                      <textarea
                        value={sec.instruction}
                        onChange={function(e) { updateSection(idx, 'instruction', e.target.value); }}
                        rows={3}
                        style={Object.assign({}, textareaStyle, { fontSize: 12.5 })}
                      />
                    </div>
                  </div>
                );
              })}

              <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
                <button onClick={function() { savePrompt('report_section_prompts', sectionPrompts); }} disabled={saving} style={btnPrimary}>
                  {saving ? '저장 중...' : '섹션 프롬프트 저장'}
                </button>
                {!sectionPromptsDefault && (
                  <button onClick={function() { resetPrompt('report_section_prompts'); }} style={btnGhost}>기본값 복원</button>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'tune' && (
          <div>
            <h3 style={{ fontSize: 15, color: t.text, fontWeight: 500, marginBottom: 8 }}>AI 프롬프트 튜닝</h3>
            <p style={{ fontSize: 12, color: t.dim, marginBottom: 24, lineHeight: 1.6 }}>
              현재 프롬프트를 AI가 자동으로 수정해줍니다. 원하는 변경사항을 입력하세요.
            </p>

            <div style={cardStyle}>
              <label style={labelStyle}>튜닝 대상</label>
              <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
                {[
                  { id: 'chat', label: '채팅 프롬프트' },
                  { id: 'report', label: '리포트 프롬프트' },
                ].map(function(opt) {
                  var active = tuneTarget === opt.id;
                  return (
                    <button key={opt.id} onClick={function() { setTuneTarget(opt.id); }} style={{
                      padding: '10px 20px', border: 'none', borderRadius: 7,
                      background: active ? 'rgba(' + accentRgba + ',0.12)' : 'rgba(' + accentRgba + ',0.03)',
                      color: active ? t.text : t.dim, fontSize: 13, cursor: 'pointer',
                      fontFamily: "'Pretendard',sans-serif",
                    }}>
                      {opt.label}
                    </button>
                  );
                })}
              </div>

              <label style={labelStyle}>변경 요청</label>
              <textarea
                value={tuneRequest}
                onChange={function(e) { setTuneRequest(e.target.value); }}
                placeholder="예: 말투를 더 친근하게 바꿔줘, 후킹 단계에서 더 강하게 어필하게 수정해줘"
                rows={4}
                style={Object.assign({}, textareaStyle, { marginBottom: 16 })}
              />

              <button onClick={handleTune} disabled={tuning || !tuneRequest.trim()} style={Object.assign({}, btnPrimary, {
                opacity: tuning || !tuneRequest.trim() ? 0.5 : 1,
              })}>
                {tuning ? 'AI 튜닝 중...' : 'AI로 프롬프트 수정'}
              </button>
            </div>

            {tuneResult && (
              <div style={Object.assign({}, cardStyle, { marginTop: 16 })}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <h4 style={{ fontSize: 13, color: t.text, fontWeight: 500 }}>튜닝 결과</h4>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={applyTuneResult} style={Object.assign({}, btnPrimary, { padding: '8px 16px', fontSize: 12 })}>
                      적용하기
                    </button>
                    <button onClick={function() { setTuneResult(''); }} style={btnGhost}>취소</button>
                  </div>
                </div>
                <pre style={{
                  padding: 16, borderRadius: 8,
                  background: 'rgba(' + accentRgba + ',0.03)',
                  border: '1px solid rgba(' + accentRgba + ',0.06)',
                  color: t.dim, fontSize: 12, lineHeight: 1.7,
                  whiteSpace: 'pre-wrap', wordBreak: 'break-word' as const,
                  maxHeight: 400, overflow: 'auto',
                  fontFamily: "'Pretendard',monospace",
                }}>
                  {tuneResult}
                </pre>
              </div>
            )}
          </div>
        )}

      </div>

      {toast && (
        <div style={{
          position: 'fixed', bottom: 32, left: '50%', transform: 'translateX(-50%)',
          padding: '12px 24px', borderRadius: 8,
          background: 'rgba(34,197,94,0.15)', backdropFilter: 'blur(12px)',
          border: '1px solid rgba(34,197,94,0.2)',
          color: '#22c55e', fontSize: 13, fontWeight: 500, zIndex: 1000,
          fontFamily: "'Pretendard',sans-serif",
          animation: 'fadeIn 0.2s ease',
        }}>
          {toast}
        </div>
      )}
    </div>
  );
}
