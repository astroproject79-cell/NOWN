'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useStore } from '@/lib/store';
import { themes } from '@/lib/theme';

export default function Header() {
  var router = useRouter();
  var pathname = usePathname();
  var store = useStore();
  var theme = store.theme;
  var setTheme = store.setTheme;
  var t = themes[theme];
  var isAdmin = pathname === '/admin';

  return (
    <header style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
      padding: '16px 24px',
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      backdropFilter: 'blur(12px)',
      background: t.fog + '0.6)',
      borderBottom: '1px solid rgba(' + t.pColor1.join(',') + ',0.04)',
    }}>
      <div onClick={function() { router.push('/'); }} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
        <svg width="20" height="20" viewBox="0 0 32 32" fill="none">
          <circle cx="16" cy="16" r="12" stroke={t.accent} strokeWidth="1" opacity="0.6" />
          <circle cx="16" cy="16" r="3" fill={t.accent} opacity="0.8" />
          <circle cx="16" cy="6" r="1.5" fill={t.accent} opacity="0.4" />
          <circle cx="16" cy="26" r="1.5" fill={t.accent} opacity="0.4" />
          <circle cx="6" cy="16" r="1.5" fill={t.accent} opacity="0.4" />
          <circle cx="26" cy="16" r="1.5" fill={t.accent} opacity="0.4" />
        </svg>
        <span style={{ fontFamily: "'ZEN SERIF TTF',sans-serif", fontSize: 13, color: t.text, letterSpacing: '0.15em', opacity: 0.8 }}>NOWN</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {!isAdmin && (
          <button onClick={function() { router.push('/admin'); }} title="관리자" style={{
            width: 32, height: 32, border: 'none', borderRadius: 6,
            background: 'transparent', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            opacity: 0.25, transition: 'opacity 0.3s',
          }}
          onMouseEnter={function(e) { e.currentTarget.style.opacity = '0.6'; }}
          onMouseLeave={function(e) { e.currentTarget.style.opacity = '0.25'; }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={t.dim} strokeWidth="1.5" strokeLinecap="round">
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
          </button>
        )}
        <button onClick={function() { setTheme(theme === 'dark' ? 'light' : 'dark'); }} style={{
          width: 32, height: 32, border: 'none', borderRadius: 6,
          background: 'transparent', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          {theme === 'dark' ? (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={t.dim} strokeWidth="1.5">
              <circle cx="12" cy="12" r="5" />
              <line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" />
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
              <line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" />
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
            </svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={t.dim} strokeWidth="1.5">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
            </svg>
          )}
        </button>
      </div>
    </header>
  );
}
