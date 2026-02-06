'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function Header() {
  var pathname = usePathname();
  var isLanding = pathname === '/';
  var [scrolled, setScrolled] = useState(false);
  var [safeTop, setSafeTop] = useState(0);

  useEffect(function() {
    var isStandalone = window.matchMedia('(display-mode: standalone)').matches 
      || (window.navigator as any).standalone === true;
    
    if (isStandalone) {
      var h = window.screen.height;
      var w = window.screen.width;
      if ((h === 932 && w === 430) || (h === 852 && w === 393) || (h === 896 && w === 414) || (h === 926 && w === 428)) {
        setSafeTop(59);
      } else if (h >= 812) {
        setSafeTop(47);
      } else {
        setSafeTop(20);
      }
    }

    function handleScroll() {
      setScrolled(window.scrollY > 100);
    }
    window.addEventListener('scroll', handleScroll);
    return function() { window.removeEventListener('scroll', handleScroll); };
  }, []);

  var showBg = !isLanding || scrolled;

  return (
    <header style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      paddingTop: safeTop,
      height: 60 + safeTop,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingLeft: 24,
      paddingRight: 24,
      background: showBg ? 'rgba(10, 10, 15, 0.95)' : 'rgba(10, 10, 15, 0.8)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      borderBottom: showBg ? '1px solid rgba(255, 255, 255, 0.05)' : 'none',
      zIndex: 100,
      transition: 'background 0.3s',
    }}>
      <Link href="/" style={{ 
        fontSize: 18, 
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
