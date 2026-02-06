'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function Header() {
  var pathname = usePathname();
  var isLanding = pathname === '/';
  var [scrolled, setScrolled] = useState(false);
  var [isPWA, setIsPWA] = useState(false);

  useEffect(function() {
    var isStandalone = window.matchMedia('(display-mode: standalone)').matches 
      || (window.navigator as any).standalone === true;
    setIsPWA(isStandalone);

    function handleScroll() {
      setScrolled(window.scrollY > 50);
    }
    window.addEventListener('scroll', handleScroll);
    return function() { window.removeEventListener('scroll', handleScroll); };
  }, []);

  if (isLanding && !scrolled) return null;

  return (
    <header style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      paddingTop: isPWA ? 'max(env(safe-area-inset-top, 0px), 44px)' : '0px',
      height: isPWA ? 'calc(60px + max(env(safe-area-inset-top, 0px), 44px))' : '60px',
      display: 'flex',
      alignItems: 'flex-end',
      justifyContent: 'space-between',
      paddingLeft: '24px',
      paddingRight: '24px',
      paddingBottom: '16px',
      background: 'rgba(10, 10, 15, 0.9)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
      zIndex: 100,
      transition: 'all 0.3s',
    }}>
      <Link href="/" style={{ 
        fontSize: '18px', 
        fontWeight: 600, 
        color: '#d4a574',
        textDecoration: 'none',
        letterSpacing: '0.1em'
      }}>
        NOWN
      </Link>
    </header>
  )
}
