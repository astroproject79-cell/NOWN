'use client'

import Link from 'next/link'

export default function Header() {
  return (
    <header style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      paddingTop: 'env(safe-area-inset-top)',
      height: 'calc(60px + env(safe-area-inset-top))',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: 'env(safe-area-inset-top) 24px 0 24px',
      background: 'rgba(10, 10, 15, 0.8)',
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
