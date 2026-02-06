'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function Header() {
  var pathname = usePathname();
  var isLanding = pathname === '/';
  var [scrolled, setScrolled] = useState(false);

  useEffect(function() {
    function handleScroll() {
      setScrolled(window.scrollY > 100);
    }
    window.addEventListener('scroll', handleScroll);
    return function() { window.removeEventListener('scroll', handleScroll); };
  }, []);

  var showBg = !isLanding || scrolled;

  return (
    <header className="pwa-header" style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      height: 60,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingLeft: 24,
      paddingRight: 24,
      background: showBg ? 'rgba(10, 10, 15, 0.9)' : 'transparent',
      backdropFilter: showBg ? 'blur(20px)' : 'none',
      WebkitBackdropFilter: showBg ? 'blur(20px)' : 'none',
      borderBottom: showBg ? '1px solid rgba(255, 255, 255, 0.05)' : 'none',
      zIndex: 100,
      transition: 'background 0.3s, backdrop-filter 0.3s',
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
