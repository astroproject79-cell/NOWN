'use client';

import { Suspense } from 'react';
import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useStore } from '@/lib/store';
import { themes } from '@/lib/theme';
import AmbientCanvas from '@/components/canvas/AmbientCanvas';

function PaymentSuccessContent() {
  var router = useRouter();
  var params = useSearchParams();
  var store = useStore();
  var t = themes[store.theme];
  var [status, setStatus] = useState<'confirming' | 'generating' | 'done' | 'error'>('confirming');
  var [progress, setProgress] = useState(0);
  var [reportId, setReportId] = useState('');
  var [errorMsg, setErrorMsg] = useState('');

  useEffect(function() {
    var paymentKey = params.get('paymentKey') || '';
    var orderId = params.get('orderId') || '';
    var amountParam = params.get('amount');
    var isDemo = orderId.startsWith('DEMO_');

    var userId = params.get('userId') || localStorage.getItem('saju_uid') || '';
    var profileId = params.get('profileId') || localStorage.getItem('saju_profile_id') || '';

    if (!isDemo && (!paymentKey || !orderId || !amountParam)) {
      setStatus('error');
      setErrorMsg('결제 정보가 없습니다');
      return;
    }

    if (!isDemo && !userId) {
      setStatus('error');
      setErrorMsg('사용자 정보를 찾을 수 없습니다. 다시 시도해주세요.');
      return;
    }

    var amount = Number(amountParam) || 19900;

    async function process() {
      try {
        setProgress(10);

        if (!isDemo) {
          var confirmRes = await fetch('/api/payment/confirm', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ paymentKey: paymentKey, orderId: orderId, amount: amount, userId: userId }),
          });
          var confirmData = await confirmRes.json();

          if (!confirmData.success) {
            setStatus('error');
            setErrorMsg(confirmData.error || '결제 확인 실패');
            return;
          }
        }

        setStatus('generating');
        setProgress(30);

        var interval = setInterval(function() {
          setProgress(function(p) { return Math.min(p + Math.random() * 8, 90); });
        }, 800);

        var reportRes = await fetch('/api/report/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: userId, profileId: profileId, orderId: orderId, isDemo: isDemo }),
        });
        var reportData = await reportRes.json();

        clearInterval(interval);

        if (reportData.success) {
          setProgress(100);
          setReportId(reportData.reportId);
          setStatus('done');

          localStorage.removeItem('nown_pending_order');

          setTimeout(function() {
            router.push('/report/' + reportData.reportId);
          }, 1500);
        } else {
          setStatus('error');
          setErrorMsg(reportData.error || '리포트 생성 실패');
        }
      } catch (e: any) {
        setStatus('error');
        setErrorMsg(e.message || '처리 중 오류');
      }
    }

    process();
  }, []);

  var messages: Record<string, string> = {
    confirming: '결제를 확인하고 있어요...',
    generating: '사주 리포트를 생성하고 있어요...',
    done: '리포트가 완성되었어요!',
    error: errorMsg,
  };

  var subMessages: Record<string, string> = {
    confirming: '잠시만 기다려주세요',
    generating: 'AI가 16,000자 심층 분석 중입니다',
    done: '잠시 후 리포트 페이지로 이동합니다',
    error: '',
  };

  return (
    <div style={{ minHeight: '100vh', background: t.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <AmbientCanvas theme={store.theme} />
      <div style={{ position: 'relative', zIndex: 10, textAlign: 'center', padding: '0 20px' }}>
        <div style={{ marginBottom: 32 }}>
          {status === 'error' ? (
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
              <circle cx="24" cy="24" r="20" stroke="#ef4444" strokeWidth="1" opacity="0.4" />
              <path d="M16 16l16 16M32 16l-16 16" stroke="#ef4444" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
            </svg>
          ) : status === 'done' ? (
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
              <circle cx="24" cy="24" r="20" stroke="#22c55e" strokeWidth="1" opacity="0.4" />
              <path d="M15 24l6 6 12-12" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" opacity="0.7" />
            </svg>
          ) : (
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none" style={{ animation: 'orbSpin 3s linear infinite' }}>
              <circle cx="24" cy="24" r="20" stroke={t.accent} strokeWidth="1" opacity="0.2" />
              <path d="M24 4a20 20 0 0 1 20 20" stroke={t.accent} strokeWidth="1.5" strokeLinecap="round" opacity="0.7" />
            </svg>
          )}
        </div>

        <h2 style={{ fontFamily: "'ZEN SERIF TTF',sans-serif", fontSize: 18, color: status === 'error' ? '#ef4444' : t.text, marginBottom: 8, fontWeight: 400 }}>
          {messages[status]}
        </h2>
        <p style={{ fontSize: 13, color: t.dim, marginBottom: 32 }}>{subMessages[status]}</p>

        {status !== 'error' && (
          <div style={{ width: 240, height: 2, background: 'rgba(' + t.pColor1.join(',') + ',0.1)', borderRadius: 1, margin: '0 auto' }}>
            <div style={{
              height: '100%', borderRadius: 1,
              background: 'linear-gradient(90deg, ' + t.accent + ', rgba(' + t.pColor2.join(',') + ',0.8))',
              width: progress + '%', transition: 'width 0.5s ease',
            }} />
          </div>
        )}

        {status === 'error' && (
          <button onClick={function() { router.push('/'); }} style={{
            marginTop: 24, padding: '12px 24px', border: '1px solid rgba(' + t.pColor1.join(',') + ',0.15)',
            background: 'transparent', color: t.dim, fontSize: 13, borderRadius: 8, cursor: 'pointer',
          }}>
            돌아가기
          </button>
        )}
      </div>
    </div>
  );
}

function LoadingFallback() {
  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0f', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <svg width="48" height="48" viewBox="0 0 48 48" fill="none" style={{ animation: 'orbSpin 3s linear infinite' }}>
          <circle cx="24" cy="24" r="20" stroke="#d4a574" strokeWidth="1" opacity="0.2" />
          <path d="M24 4a20 20 0 0 1 20 20" stroke="#d4a574" strokeWidth="1.5" strokeLinecap="round" opacity="0.7" />
        </svg>
        <p style={{ marginTop: 16, color: '#888', fontSize: 13 }}>로딩 중...</p>
      </div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <PaymentSuccessContent />
    </Suspense>
  );
}
