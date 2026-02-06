'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { IconSaju, IconLock } from '@/components/Icons';

export default function AdminLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const adminPw = process.env.NEXT_PUBLIC_ADMIN_PW || 'admin1234';
    if (password === adminPw) {
      localStorage.setItem('admin_auth', 'true');
      router.push('/admin');
    } else {
      setError('비밀번호가 일치하지 않습니다');
      setTimeout(() => setError(''), 3000);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center px-6" style={{ background: 'var(--bg)', color: 'var(--text)' }}>
      <div className="w-full max-w-xs">
        <div className="text-center mb-8">
          <IconSaju size={32} color="var(--accent)" className="mx-auto mb-4" />
          <h1 className="font-serif text-lg font-light">관리자 로그인</h1>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="relative">
            <IconLock size={16} color="var(--text-muted)" className="absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="비밀번호"
              className="input-field pl-11"
              autoFocus
            />
          </div>
          {error && <p className="text-xs text-center" style={{ color: 'var(--error)' }}>{error}</p>}
          <button type="submit" className="btn-primary w-full">로그인</button>
        </form>
      </div>
    </main>
  );
}
