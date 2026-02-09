'use client';

import { useState } from 'react';
import { useStore } from '@/lib/store';
import { themes } from '@/lib/theme';

export default function FloatingChatButton() {
  var store = useStore();
  var t = themes[store.theme];
  var [showToast, setShowToast] = useState(false);

  var handleClick = function() {
    setShowToast(true);
    setTimeout(function() {
      setShowToast(false);
    }, 2000);
  };

  return (
    <>
      <button
        onClick={handleClick}
        style={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          width: 56,
          height: 56,
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #3B1E54 0%, #1a0a2e 100%)',
          border: '1px solid rgba(255,255,255,0.1)',
          boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          transition: 'transform 0.2s, box-shadow 0.2s',
        }}
        onMouseEnter={function(e) {
          e.currentTarget.style.transform = 'scale(1.05)';
          e.currentTarget.style.boxShadow = '0 6px 24px rgba(0,0,0,0.4)';
        }}
        onMouseLeave={function(e) {
          e.currentTarget.style.transform = 'scale(1)';
          e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.3)';
        }}
        aria-label="고객 상담"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.9)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
        </svg>
      </button>

      {showToast && (
        <div style={{
          position: 'fixed',
          bottom: 92,
          right: 24,
          background: 'rgba(30,20,40,0.95)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 12,
          padding: '12px 20px',
          zIndex: 1001,
          animation: 'fadeIn 0.2s ease-out',
        }}>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.9)', margin: 0 }}>
            준비 중입니다
          </p>
        </div>
      )}

      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </>
  );
}
