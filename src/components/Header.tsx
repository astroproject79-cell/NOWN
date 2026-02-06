'use client'

import Link from 'next/link'

export default function Header() {
  return (
    <header className="header-safe" style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      minHeight: '60px',
      display: 'flex',
      alignItems: 'flex-end',
      justifyContent: 'space-between',
      paddingLeft: '24px',
      paddingRight: '24px',
      paddingBottom: '16px',
      background: 'rgba(10, 10, 15, 0.9)',
      backdropFilter: 'blur(20px)',
      borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
      zIndex: 100,
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
