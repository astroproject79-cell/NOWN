'use client';

import { useState } from 'react';

export default function FloatingChatButton() {
  const [showToast, setShowToast] = useState(false);
  const handleClick = () => { setShowToast(true); setTimeout(() => setShowToast(false), 2000); };

  return (
    <>
      <button onClick={handleClick} style={{
        position: 'fixed', bottom: 24, right: 24, width: 52, height: 52, borderRadius: '50%',
        background: 'linear-gradient(135deg, rgba(201,169,110,0.15), rgba(201,169,110,0.05))',
        border: '1px solid rgba(201,169,110,0.2)', boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
        cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 1000, transition: 'all 0.3s', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
      }} aria-label="고객 상담">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--gold-400)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
        </svg>
      </button>
      {showToast && (
        <div style={{
          position: 'fixed', bottom: 88, right: 24, background: 'rgba(15,27,45,0.95)',
          border: '1px solid rgba(201,169,110,0.15)', borderRadius: 12, padding: '12px 20px',
          zIndex: 1001, backdropFilter: 'blur(12px)', animation: 'fadeUp 0.3s var(--ease-smooth)',
        }}>
          <p style={{ fontSize: 13, color: 'var(--cream-200)', margin: 0, fontFamily: 'var(--font-sans)', fontWeight: 300 }}>준비 중이에요</p>
        </div>
      )}
    </>
  );
}
