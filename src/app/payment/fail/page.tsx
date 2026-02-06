import Link from 'next/link';
import Header from '@/components/Header';

export default function PaymentFailPage() {
  return (
    <main className="min-h-screen" style={{ background: 'var(--bg)', color: 'var(--text)' }}>
      <Header />
      <div className="flex flex-col items-center justify-center min-h-[70vh] px-6 text-center">
        <div className="w-16 h-16 rounded-full mb-6 flex items-center justify-center" style={{ background: 'rgba(207,107,107,0.1)' }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--error)" strokeWidth="1.5" strokeLinecap="round">
            <circle cx="12" cy="12" r="10" />
            <path d="M15 9l-6 6M9 9l6 6" />
          </svg>
        </div>
        <h1 className="font-serif text-xl font-light mb-2">결제에 실패했어요</h1>
        <p className="text-sm mb-8" style={{ color: 'var(--text-muted)' }}>잠시 후 다시 시도해주세요</p>
        <Link href="/result/free" className="btn-primary">다시 시도하기</Link>
      </div>
    </main>
  );
}
