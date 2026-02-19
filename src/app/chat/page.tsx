'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/lib/store';
import { themes } from '@/lib/theme';
import AmbientCanvas from '@/components/canvas/AmbientCanvas';
import Header from '@/components/ui/Header';
import ManseTable from '@/components/ui/ManseTable';

interface Msg {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

interface SajuData {
  fourPillars: {
    year: { stem: string; branch: string };
    month: { stem: string; branch: string };
    day: { stem: string; branch: string };
    hour: { stem: string; branch: string };
  };
  fiveElements: Record<string, number>;
  dayMaster?: { char: string; element: string };
}

function cleanCTA(text: string) {
  return text.replace(/\[PREMIUM_CTA\]/g, '');
}

function hasCTA(text: string) {
  if (text.indexOf('[PREMIUM_CTA]') >= 0) return true;
  if (text.indexOf('프리미엄 리포트') >= 0 && text.indexOf('16,000') >= 0) return true;
  if (text.indexOf('프리미엄 리포트') >= 0 && text.indexOf('다루고 있어요') >= 0) return true;
  return false;
}

export default function ChatPage() {
  var router = useRouter();
  var store = useStore();
  var theme = store.theme;
  var sajuInput = store.sajuInput;
  var t = themes[theme];
  var [messages, setMessages] = useState<Msg[]>([]);
  var [input, setInput] = useState('');
  var [isStreaming, setIsStreaming] = useState(false);
  var [ready, setReady] = useState(false);
  var [sajuData, setSajuData] = useState<SajuData | null>(null);

  useEffect(function() {
    if (sajuInput && sajuInput.birthDate) {
      fetch('/api/saju/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: sajuInput.name || '사용자',
          birthDate: sajuInput.birthDate,
          birthTime: sajuInput.birthTime,
          gender: sajuInput.gender,
          isLunar: sajuInput.isLunar,
        }),
      })
        .then(function(r) { return r.json(); })
        .then(function(res) {
          if (res.success && res.data) {
            var d = res.data;
            setSajuData({
              fourPillars: {
                year: { stem: d.fourPillars.year.stem, branch: d.fourPillars.year.branch },
                month: { stem: d.fourPillars.month.stem, branch: d.fourPillars.month.branch },
                day: { stem: d.fourPillars.day.stem, branch: d.fourPillars.day.branch },
                hour: { stem: d.fourPillars.hour.stem, branch: d.fourPillars.hour.branch },
              },
              fiveElements: d.fiveElements,
              dayMaster: d.dayMaster,
            });
          }
        })
        .catch(function() {});
    }
  }, [sajuInput]);

  useEffect(function() {
    if (messages.length > 0 && !isStreaming) {
      var lastMsg = messages[messages.length - 1];
      if (lastMsg.role === "assistant" && hasCTA(lastMsg.content)) {
        var timer = setTimeout(function() {
          router.push("/payment");
        }, 2500);
        return function() { clearTimeout(timer); };
      }
    }
  }, [messages, isStreaming, router]);

  var bottomRef = useRef<HTMLDivElement>(null);
  var inputRef = useRef<HTMLInputElement>(null);
  var streamContent = useRef('');
  var accentRgba = t.pColor1.join(',');
  var accent2Rgba = t.pColor2.join(',');

  useEffect(function() {
    fetch('/api/admin/settings')
      .then(function(r) { return r.json(); })
      .then(function(res) {
        var d = res.data || {};
        var botName = d.bot_name || '별이';
        var greeting = '';
        if (sajuInput && sajuInput.name) {
          greeting = sajuInput.name + '님, 반가워요. ' + botName + '예요. 사주 봤는데... 요즘 뭐가 제일 신경 쓰여요?';
        } else {
          var raw = d.bot_greeting || '안녕하세요, {name}예요. 성함이 어떻게 되세요?';
          greeting = String(raw).replace(/\{name\}/g, botName);
        }
        setMessages([{ id: '0', role: 'assistant', content: greeting }]);
        setReady(true);
      })
      .catch(function() {
        if (sajuInput && sajuInput.name) {
          setMessages([{ id: '0', role: 'assistant', content: sajuInput.name + '님, 반가워요. 별이예요. 사주 봤는데... 요즘 뭐가 제일 신경 쓰여요?' }]);
        } else {
          setMessages([{ id: '0', role: 'assistant', content: '안녕하세요, 별이예요. 성함이 어떻게 되세요?' }]);
        }
        setReady(true);
      });
  }, []);

  useEffect(function() {
    if (bottomRef.current) bottomRef.current.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  var send = useCallback(async function() {
    var text = input.trim();
    if (!text || isStreaming) return;

    var userMsg: Msg = { id: Date.now().toString(), role: 'user', content: text };
    var newMessages = messages.concat([userMsg]);
    setMessages(newMessages);
    setInput('');
    setIsStreaming(true);

    var aiId = (Date.now() + 1).toString();
    streamContent.current = '';
    setMessages(function(prev) { return prev.concat([{ id: aiId, role: 'assistant', content: '' }]); });

    try {
      var res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          history: newMessages.slice(1).map(function(m) { return { role: m.role, content: m.content }; }),
          sajuData: sajuInput || null,
        }),
      });

      if (!res.ok) throw new Error('API error');
      var reader = res.body?.getReader();
      if (!reader) throw new Error('No reader');
      var decoder = new TextDecoder();
      var buffer = '';

      while (true) {
        var chunk = await reader.read();
        if (chunk.done) break;

        buffer += decoder.decode(chunk.value, { stream: true });
        var lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (var li = 0; li < lines.length; li++) {
          var line = lines[li];
          if (line.indexOf('data: ') !== 0) continue;
          try {
            var json = JSON.parse(line.slice(6));
            if (json.done) break;
            if (json.text) {
              streamContent.current += json.text;
              var snapshot = streamContent.current;
              setMessages(function(prev) {
                return prev.map(function(m) {
                  if (m.id === aiId) return { id: m.id, role: m.role, content: snapshot };
                  return m;
                });
              });
            }
          } catch (e) {}
        }
      }
    } catch (e) {
      streamContent.current = '죄송합니다, 잠시 연결이 불안정해요. 다시 말씀해주세요.';
      setMessages(function(prev) {
        return prev.map(function(m) {
          if (m.id === aiId) return { id: m.id, role: m.role, content: streamContent.current };
          return m;
        });
      });
    }

    setIsStreaming(false);
    if (inputRef.current) inputRef.current.focus();
  }, [input, isStreaming, messages, sajuInput]);

  if (!ready) {
    return (
      <div style={{ minHeight: '100vh', background: t.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <AmbientCanvas theme={theme} />
        <div style={{ position: 'relative', zIndex: 10 }}>
          <svg width="32" height="32" viewBox="0 0 48 48" fill="none" style={{ animation: 'orbSpin 3s linear infinite' }}>
            <circle cx="24" cy="24" r="20" stroke={t.accent} strokeWidth="1" opacity="0.2" />
            <path d="M24 4a20 20 0 0 1 20 20" stroke={t.accent} strokeWidth="1.5" strokeLinecap="round" opacity="0.7" />
          </svg>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: t.bg, transition: 'background 0.7s', display: 'flex', flexDirection: 'column' }}>
      <AmbientCanvas theme={theme} />
      <Header />

      <div style={{
        position: 'relative', zIndex: 10,
        flex: 1, display: 'flex', flexDirection: 'column',
        maxWidth: 640, width: '100%', margin: '0 auto', padding: '80px 0 0',
      }}>
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px 20px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          
          {sajuData && sajuData.fourPillars && (
            <ManseTable fourPillars={sajuData.fourPillars} fiveElements={sajuData.fiveElements} />
          )}

          {messages.map(function(msg) {
            var isUser = msg.role === 'user';
            var isLast = msg.id === messages[messages.length - 1].id;
            var showCTA = !isUser && hasCTA(msg.content) && !isStreaming;
            var displayContent = cleanCTA(msg.content);

            return (
              <div key={msg.id} style={{ display: 'flex', justifyContent: isUser ? 'flex-end' : 'flex-start', animation: 'fadeSlide 0.4s both' }}>
                {!isUser && (
                  <div style={{
                    width: 32, height: 32, borderRadius: '50%', flexShrink: 0, marginRight: 10, marginTop: 2,
                    overflow: 'hidden',
                    border: '1.5px solid rgba(' + accentRgba + ',0.25)',
                    boxShadow: '0 0 8px rgba(' + accentRgba + ',0.15)',
                  }}>
                    <img src="/characters/avatar-f.png" alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                )}
                <div style={{ maxWidth: '75%' }}>
                  <div style={{
                    padding: '14px 18px',
                    background: isUser
                      ? 'linear-gradient(135deg, rgba(' + accentRgba + ',0.15), rgba(' + accent2Rgba + ',0.1))'
                      : t.fog + '0.25)',
                    backdropFilter: 'blur(16px)',
                    border: isUser
                      ? '1px solid rgba(' + accentRgba + ',0.12)'
                      : '1px solid rgba(' + accentRgba + ',0.05)',
                    borderRadius: isUser ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                  }}>
                    <p style={{ fontFamily: "'Pretendard',sans-serif", fontSize: 15, color: t.text, lineHeight: 1.85, fontWeight: 400, whiteSpace: 'pre-wrap' }}>
                      {displayContent}
                      {isStreaming && isLast && !isUser && <span style={{ opacity: 0.5, animation: 'gentlePulse 1s infinite' }}>|</span>}
                    </p>
                  </div>
                  {showCTA && (
                    <div
                      style={{
                        marginTop: 10, width: '100%', padding: '14px 20px',
                        background: 'linear-gradient(135deg, rgba(' + accentRgba + ',0.2), rgba(' + accent2Rgba + ',0.15))',
                        border: 'none', borderRadius: 10, cursor: 'pointer',
                        boxShadow: '0 0 16px rgba(' + accentRgba + ',0.12), 0 0 0 1px rgba(' + accentRgba + ',0.15)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                        animation: 'fadeSlide 0.6s both',
                      }}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.5">
                        <path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71z" />
                      </svg>
                      <span style={{ color: '#fff', fontSize: 14, fontWeight: 500, fontFamily: "'Pretendard',sans-serif" }}>잠시 후 리포트 페이지로 이동합니다...</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>

        <div style={{ padding: '16px 20px 28px', background: t.fog + '0.5)', backdropFilter: 'blur(20px)', borderTop: '1px solid rgba(' + accentRgba + ',0.05)' }}>
          <div style={{ display: 'flex', gap: 10 }}>
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={function(e) { setInput(e.target.value); }}
              onKeyDown={function(e) { if (e.key === 'Enter' && !e.nativeEvent.isComposing) send(); }}
              placeholder="메시지를 입력하세요..."
              style={{
                flex: 1, padding: '14px 18px',
                background: 'rgba(' + accentRgba + ',0.04)',
                border: '1px solid rgba(' + accentRgba + ',0.1)',
                borderRadius: 12,
                color: t.text, fontSize: 15,
                fontFamily: "'Pretendard',sans-serif", fontWeight: 400,
                outline: 'none', transition: 'border 0.3s',
              }}
            />
            <button
              onClick={send}
              disabled={!input.trim() || isStreaming}
              style={{
                width: 48, height: 48, border: 'none', borderRadius: 12,
                background: input.trim() && !isStreaming
                  ? 'linear-gradient(135deg, rgba(' + accentRgba + ',0.2), rgba(' + accent2Rgba + ',0.15))'
                  : 'rgba(' + accentRgba + ',0.05)',
                boxShadow: input.trim() && !isStreaming ? '0 0 0 1px rgba(' + accentRgba + ',0.2)' : 'none',
                cursor: input.trim() && !isStreaming ? 'pointer' : 'default',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.3s', opacity: input.trim() && !isStreaming ? 1 : 0.3,
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.5" strokeLinecap="round">
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
