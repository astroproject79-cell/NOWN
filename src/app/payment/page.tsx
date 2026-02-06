'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/lib/store';
import { themes } from '@/lib/theme';
import AmbientCanvas from '@/components/canvas/AmbientCanvas';
import Header from '@/components/ui/Header';

export default function PaymentPage() {
  var router = useRouter();
  var store = useStore();
  var t = themes[store.theme];
  var accentRgba = t.pColor1.join(',');
  var accent2Rgba = t.pColor2.join(',');
  var [loading, setLoading] = useState(true);
  var [error, setError] = useState('');
  var [price, setPrice] = useState(0);
  var [priceLoaded, setPriceLoaded] = useState(false);
  var widgetRef = useRef<any>(null);

  useEffect(function() {
    fetch('/api/admin/settings')
      .then(function(r) { return r.json(); })
      .then(function(res) {
        if (res.success && res.data && res.data.premium_price) {
          var p = res.data.premium_price;
          setPrice(typeof p === 'number' ? p : Number(p));
        } else {
          setPrice(19900);
        }
        setPriceLoaded(true);
      })
      .catch(function() {
        setPrice(19900);
        setPriceLoaded(true);
      });
  }, []);

  useEffect(function() {
    if (!priceLoaded) return;
    var userId = localStorage.getItem('saju_uid') || 'guest-' + Date.now();
    var script = document.createElement('script');
    script.src = 'https://js.tosspayments.com/v2/standard';
    script.onload = async function() {
      try {
        var clientKey = process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY || '';
        if (!clientKey) {
          setError('결제 설정이 완료되지 않았습니다');
          setLoading(false);
          return;
        }
        var tp = await (window as any).TossPayments(clientKey);
        widgetRef.current = tp.payment({ customerKey: userId });
        setLoading(false);
      } catch (e: any) {
        setError(e.message || '결제 모듈 로딩 실패');
        setLoading(false);
      }
    };
    document.head.appendChild(script);
  }, [priceLoaded]);

  async function handlePayment() {
    if (!widgetRef.current || !price) return;
    var orderId = 'NOWN-' + Date.now() + '-' + Math.random().toString(36).slice(2, 8);

    localStorage.setItem('nown_pending_order', orderId);

    try {
      await widgetRef.current.requestPayment({
        method: 'CARD',
        amount: { currency: 'KRW', value: price },
        orderId: orderId,
        orderName: '프리미엄 사주 리포트',
        successUrl: window.location.origin + '/payment/success',
        failUrl: window.location.origin + '/payment/fail',
      });
    } catch (e: any) {
      if (e.code === 'USER_CANCEL') return;
      setError(e.message || '결제 요청 실패');
    }
  }

  var formattedPrice = price ? price.toLocaleString() : '---';

  return (
    <div style={{ minHeight: '100vh', background: t.bg, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <AmbientCanvas theme={store.theme} />
      <Header />
      <div style={{ position: 'relative', zIndex: 10, maxWidth: 420, width: '100%', padding: '0 20px', textAlign: 'center' }}>
        <div style={{ marginBottom: 40 }}>
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none" style={{ marginBottom: 16 }}>
            <circle cx="24" cy="24" r="20" stroke={t.accent} strokeWidth="1" opacity="0.3" />
            <circle cx="24" cy="24" r="12" stroke={t.accent} strokeWidth="0.5" opacity="0.2" />
            <circle cx="24" cy="24" r="4" fill={t.accent} opacity="0.6" />
            <path d="M24 4 L24 8 M24 40 L24 44 M4 24 L8 24 M40 24 L44 24" stroke={t.accent} strokeWidth="0.5" opacity="0.3" />
          </svg>
          <h1 style={{ fontFamily: "'ZEN SERIF TTF',sans-serif", fontSize: 22, color: t.text, marginBottom: 8, fontWeight: 400 }}>프리미엄 사주 리포트</h1>
          <p style={{ fontSize: 13, color: t.dim, lineHeight: 1.8 }}>16,000자 심층 분석 · 8개 섹션 · PDF 저장</p>
        </div>

        <div style={{
          padding: '28px 24px', marginBottom: 24,
          background: t.fog + '0.3)', backdropFilter: 'blur(12px)',
          border: '1px solid rgba(' + accentRgba + ',0.08)', borderRadius: 12,
          textAlign: 'left',
        }}>
          {[
            '종합 성격 분석 (일간·격국·용신)',
            '연애·결혼 운세',
            '재물·직업 운세',
            '건강·체질 분석',
            '대인관계·사회운',
            '올해 월별 상세 운세',
            '대운 흐름 (10년 단위)',
            '맞춤 조언과 방향',
          ].map(function(item, i) {
            return (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0' }}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <circle cx="8" cy="8" r="6" stroke={t.accent} strokeWidth="0.8" opacity="0.4" />
                  <path d="M5 8l2 2 4-4" stroke={t.accent} strokeWidth="1" strokeLinecap="round" opacity="0.7" />
                </svg>
                <span style={{ fontSize: 13.5, color: t.text, opacity: 0.85 }}>{item}</span>
              </div>
            );
          })}
        </div>

        <div style={{
          padding: '20px 24px', marginBottom: 24,
          background: 'rgba(' + accentRgba + ',0.06)',
          border: '1px solid rgba(' + accentRgba + ',0.1)', borderRadius: 12,
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <span style={{ fontSize: 13, color: t.dim }}>결제 금액</span>
          <span style={{ fontFamily: "'ZEN SERIF TTF',sans-serif", fontSize: 24, color: t.text }}>
            {formattedPrice}<span style={{ fontSize: 13, color: t.dim, marginLeft: 2 }}>원</span>
          </span>
        </div>

        {error && <p style={{ fontSize: 12, color: '#ef4444', marginBottom: 16 }}>{error}</p>}

        <button
          onClick={handlePayment}
          disabled={loading || !priceLoaded}
          style={{
            width: '100%', padding: '18px', border: 'none', borderRadius: 12,
            background: loading
              ? 'rgba(' + accentRgba + ',0.1)'
              : 'linear-gradient(135deg, rgba(' + accentRgba + ',0.25), rgba(' + accent2Rgba + ',0.2))',
            boxShadow: loading ? 'none' : '0 0 20px rgba(' + accentRgba + ',0.15), 0 0 0 1px rgba(' + accentRgba + ',0.2)',
            color: '#fff', fontSize: 15, fontWeight: 500, cursor: loading ? 'default' : 'pointer',
            fontFamily: "'Pretendard',sans-serif", transition: 'all 0.3s',
          }}
        >
          {loading ? '결제 모듈 로딩 중...' : '결제하기'}
        </button>

        <button
          onClick={() => {
            const params = new URLSearchParams(window.location.search);
            const userId = params.get('userId');
            const profileId = params.get('profileId');
            window.location.href = `/payment/success?orderId=DEMO_${Date.now()}&amount=${price}&userId=${userId}&profileId=${profileId}`;
          }}
          style={{
            width: '100%', padding: '14px', marginTop: 12, border: '1px dashed rgba(' + accentRgba + ',0.3)',
            borderRadius: 12, background: 'transparent', color: t.dim, fontSize: 13,
            cursor: 'pointer', fontFamily: "'Pretendard',sans-serif", transition: 'all 0.3s',
          }}
        >
          ⟨테스트⟩ 데모 결제
        </button>

        <p style={{ fontSize: 11, color: t.dim, marginTop: 16, opacity: 0.5 }}>
          결제 완료 즉시 리포트가 생성됩니다
        </p>
      </div>
    </div>
  );
}
