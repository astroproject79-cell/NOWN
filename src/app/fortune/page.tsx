'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/lib/store';
import { themes } from '@/lib/theme';
import { FocusArea } from '@/types';
import StarFieldCanvas from '@/components/canvas/StarFieldCanvas';
import Header from '@/components/ui/Header';
import { Ico, ICON_PATHS } from '@/components/icons/SvgIcons';

const STEPS = [
  { key: 'name', label: '이름', sub: '운명의 주인공은 누구인가요?' },
  { key: 'birth', label: '생년월일', sub: '태어난 날을 알려주세요' },
  { key: 'time', label: '태어난 시간', sub: '시간을 모르면 "모름"을 선택하세요' },
  { key: 'gender', label: '성별', sub: '음양의 기운을 판별합니다' },
  { key: 'focus', label: '관심 영역', sub: '가장 궁금한 영역을 선택하세요' },
];

const TIME_OPTIONS = [
  { value: '23-01', label: '子時 (23:00~01:00)' },
  { value: '01-03', label: '丑時 (01:00~03:00)' },
  { value: '03-05', label: '寅時 (03:00~05:00)' },
  { value: '05-07', label: '卯時 (05:00~07:00)' },
  { value: '07-09', label: '辰時 (07:00~09:00)' },
  { value: '09-11', label: '巳時 (09:00~11:00)' },
  { value: '11-13', label: '午時 (11:00~13:00)' },
  { value: '13-15', label: '未時 (13:00~15:00)' },
  { value: '15-17', label: '申時 (15:00~17:00)' },
  { value: '17-19', label: '酉時 (17:00~19:00)' },
  { value: '19-21', label: '戌時 (19:00~21:00)' },
  { value: '21-23', label: '亥時 (21:00~23:00)' },
  { value: 'unknown', label: '모름' },
];

const FOCUS_OPTIONS: { value: FocusArea; label: string; icon: string }[] = [
  { value: 'all', label: '종합 운세', icon: ICON_PATHS.star },
  { value: 'love', label: '연애·결혼', icon: ICON_PATHS.hex },
  { value: 'career', label: '직업·진로', icon: ICON_PATHS.zap },
  { value: 'wealth', label: '재물·금전', icon: ICON_PATHS.wave },
  { value: 'health', label: '건강·체질', icon: ICON_PATHS.eye },
];

export default function FortunePage() {
  const router = useRouter();
  const { theme, setSajuInput } = useStore();
  const t = themes[theme];
  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [birthTime, setBirthTime] = useState('');
  const [isLunar, setIsLunar] = useState(false);
  const [gender, setGender] = useState<'male' | 'female' | ''>('');
  const [focus, setFocus] = useState<FocusArea>('all');

  const canNext = () => {
    if (step === 0) return name.trim().length >= 2;
    if (step === 1) return birthDate.length === 10;
    if (step === 2) return birthTime !== '';
    if (step === 3) return gender !== '';
    return true;
  };

  const next = () => {
    if (step < 4) setStep(step + 1);
    else {
      setSajuInput({ name, birthDate, birthTime, gender: gender as 'male' | 'female', isLunar, focusArea: focus });
      router.push('/fortune/result');
    }
  };

  const inputBase: React.CSSProperties = {
    width: '100%', maxWidth: 320, padding: '14px 18px',
    background: `rgba(${t.pColor1.join(',')},0.05)`,
    border: `1px solid rgba(${t.pColor1.join(',')},0.12)`,
    color: t.text, fontSize: 15,
    fontFamily: "'Pretendard',-apple-system,sans-serif", fontWeight: 300,
    outline: 'none', transition: 'all 0.3s',
  };

  const selectBtn = (active: boolean): React.CSSProperties => ({
    padding: '12px 20px',
    background: active ? `rgba(${t.pColor1.join(',')},0.12)` : 'transparent',
    border: `1px solid ${active ? t.accent + '40' : 'rgba(' + t.pColor1.join(',') + ',0.1)'}`,
    color: active ? t.text : t.dim,
    fontFamily: "'Pretendard',-apple-system,sans-serif", fontSize: 13, fontWeight: 300,
    cursor: 'pointer', transition: 'all 0.3s',
    boxShadow: active ? `0 0 20px rgba(${t.pColor1.join(',')},0.08)` : 'none',
  });

  return (
    <div style={{ minHeight: '100vh', background: t.bg, transition: 'background 0.7s' }}>
      <StarFieldCanvas theme={theme} />
      <Header />

      <div style={{
        position: 'relative', zIndex: 10,
        minHeight: '100vh', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: '100px 24px 60px',
      }}>
        <div style={{
          display: 'flex', gap: 6, marginBottom: 48,
          animation: 'fadeIn 0.6s both',
        }}>
          {STEPS.map((_, i) => (
            <div key={i} style={{
              width: i === step ? 32 : 8, height: 3,
              background: i <= step ? t.accent : `rgba(${t.pColor1.join(',')},0.15)`,
              transition: 'all 0.5s cubic-bezier(0.23,1,0.32,1)',
              opacity: i <= step ? 0.8 : 0.3,
            }} />
          ))}
        </div>

        <div style={{
          textAlign: 'center', marginBottom: 12,
          animation: 'fadeSlide 0.5s both',
          key: step,
        }}>
          <span style={{
            fontFamily: "'ZEN SERIF TTF','Pretendard',-apple-system,sans-serif",
            fontSize: 10, letterSpacing: '0.5em', color: t.accent, opacity: 0.5,
          }}>STEP {step + 1} / {STEPS.length}</span>
        </div>

        <h2 style={{
          fontFamily: "'ZEN SERIF TTF','Pretendard',-apple-system,sans-serif",
          fontSize: 'clamp(20px,4vw,30px)', fontWeight: 300,
          color: t.text, textAlign: 'center', marginBottom: 8,
          animation: 'fadeSlide 0.5s both',
        }}>{STEPS[step].label}</h2>

        <p style={{
          fontFamily: "'Pretendard',-apple-system,sans-serif",
          fontSize: 13, color: t.dim, fontWeight: 300,
          textAlign: 'center', marginBottom: 40,
          animation: 'fadeSlide 0.5s 0.1s both',
        }}>{STEPS[step].sub}</p>

        <div style={{ animation: 'fadeSlide 0.5s 0.15s both', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
          {step === 0 && (
            <input
              type="text" value={name}
              onChange={e => setName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && canNext() && next()}
              placeholder="이름을 입력하세요"
              style={inputBase}
              autoFocus
            />
          )}

          {step === 1 && (
            <>
              <input
                type="date" value={birthDate}
                onChange={e => setBirthDate(e.target.value)}
                style={{ ...inputBase, colorScheme: theme }}
                autoFocus
              />
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', marginTop: 8 }}>
                <input type="checkbox" checked={isLunar} onChange={e => setIsLunar(e.target.checked)}
                  style={{ accentColor: t.accent }} />
                <span style={{ fontSize: 12, color: t.dim, fontFamily: "'Pretendard',-apple-system,sans-serif" }}>음력 생일이에요</span>
              </label>
            </>
          )}

          {step === 2 && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8, maxWidth: 360 }}>
              {TIME_OPTIONS.map(opt => (
                <button key={opt.value} onClick={() => setBirthTime(opt.value)} style={selectBtn(birthTime === opt.value)}>
                  {opt.label}
                </button>
              ))}
            </div>
          )}

          {step === 3 && (
            <div style={{ display: 'flex', gap: 12 }}>
              <button onClick={() => setGender('male')} style={{ ...selectBtn(gender === 'male'), padding: '16px 36px', fontSize: 14 }}>
                남성 (양)
              </button>
              <button onClick={() => setGender('female')} style={{ ...selectBtn(gender === 'female'), padding: '16px 36px', fontSize: 14 }}>
                여성 (음)
              </button>
            </div>
          )}

          {step === 4 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, justifyContent: 'center', maxWidth: 400 }}>
              {FOCUS_OPTIONS.map(opt => (
                <button key={opt.value} onClick={() => setFocus(opt.value)} style={{
                  ...selectBtn(focus === opt.value),
                  display: 'flex', alignItems: 'center', gap: 8, padding: '14px 20px',
                }}>
                  <Ico d={opt.icon} size={16} color={focus === opt.value ? t.accent : t.dim} sw={1} />
                  {opt.label}
                </button>
              ))}
            </div>
          )}
        </div>

        <div style={{ marginTop: 48, display: 'flex', gap: 12, animation: 'fadeSlide 0.5s 0.2s both' }}>
          {step > 0 && (
            <button onClick={() => setStep(step - 1)} style={{
              padding: '14px 28px', background: 'transparent',
              border: 'none', borderBottom: `1px solid rgba(${t.pColor1.join(',')},0.15)`,
              color: t.dim, fontFamily: "'Pretendard',-apple-system,sans-serif",
              fontSize: 13, fontWeight: 300, cursor: 'pointer', transition: 'all 0.3s',
            }}>이전</button>
          )}
          <button
            className="btn-glow"
            onClick={next}
            disabled={!canNext()}
            style={{
              padding: '14px 36px', border: 'none', color: '#fff',
              fontFamily: "'ZEN SERIF TTF','Pretendard',-apple-system,sans-serif",
              fontSize: 13, fontWeight: 400, letterSpacing: '0.1em',
              cursor: canNext() ? 'pointer' : 'default',
              display: 'flex', alignItems: 'center', gap: 8,
              background: canNext()
                ? `linear-gradient(135deg, rgba(${t.pColor1.join(',')},0.2), rgba(${t.pColor2.join(',')},0.15))`
                : `rgba(${t.pColor1.join(',')},0.06)`,
              boxShadow: canNext()
                ? `0 0 0 1px rgba(${t.pColor1.join(',')},0.2), 0 4px 30px rgba(${t.pColor1.join(',')},0.15)`
                : 'none',
              opacity: canNext() ? 1 : 0.3,
              backdropFilter: 'blur(12px)', transition: 'all 0.5s',
            }}
          >
            {step === 4 ? '사주 확인하기' : '다음'}
            <Ico d={ICON_PATHS.arrow} size={14} color="#fff" sw={1.5} />
          </button>
        </div>
      </div>
    </div>
  );
}
