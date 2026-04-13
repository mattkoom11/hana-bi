'use client';

import { EmailCaptureForm } from '@/components/layered-denim/EmailCaptureForm';
import { InkUnderline } from '@/components/common/InkUnderline';
import { cn } from '@/lib/utils';
import { useSearchParams } from 'next/navigation';
import { useState, Suspense } from 'react';

type UnlockState = 'idle' | 'loading' | 'error';

function LockedPageInner() {
  const searchParams = useSearchParams();
  const from = searchParams.get('from') ?? '/';

  const [password, setPassword] = useState('');
  const [unlockState, setUnlockState] = useState<UnlockState>('idle');

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    setUnlockState('loading');
    const res = await fetch(`/api/unlock?from=${encodeURIComponent(from)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });
    if (res.redirected) {
      window.location.href = res.url;
    } else {
      setUnlockState('error');
    }
  };

  return (
    <main className="min-h-screen bg-[var(--hb-ink)] text-[var(--hb-paper)] flex flex-col items-center justify-center px-6 py-20">
      <div className="w-full max-w-sm space-y-16 text-center">

        {/* Brand */}
        <div className="space-y-4">
          <p className="uppercase text-xs tracking-[0.5em] text-[var(--hb-sienna)]"
            style={{ fontFamily: 'var(--hb-font-mono)' }}>
            Hana-Bi
          </p>
          <h1 className="font-serif text-5xl italic font-light">
            Coming Soon
          </h1>
          <div className="flex justify-center">
            <InkUnderline width={120} variant="delicate" strokeOpacity={0.3} />
          </div>
          <p className="text-sm leading-relaxed" style={{ color: 'rgba(250,248,244,0.55)' }}>
            Sustainable denim, made to order.<br />Something is on its way.
          </p>
        </div>

        {/* Email signup */}
        <div className="space-y-4">
          <p className="uppercase text-xs tracking-[0.4em]"
            style={{ fontFamily: 'var(--hb-font-mono)', color: 'rgba(250,248,244,0.45)' }}>
            Get notified at launch
          </p>
          <EmailCaptureForm />
        </div>

        {/* Divider */}
        <div className="flex items-center gap-4">
          <div className="flex-1 border-t" style={{ borderColor: 'rgba(250,248,244,0.1)' }} />
          <span className="text-xs font-script" style={{ color: 'rgba(250,248,244,0.3)' }}>
            or
          </span>
          <div className="flex-1 border-t" style={{ borderColor: 'rgba(250,248,244,0.1)' }} />
        </div>

        {/* Password unlock */}
        <form onSubmit={handleUnlock} className="space-y-3">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter password"
            required
            disabled={unlockState === 'loading'}
            className="w-full px-0 py-2 bg-transparent border-0 border-b text-center focus:outline-none disabled:opacity-50 transition-colors font-serif text-sm placeholder:text-center"
            style={{
              borderColor: 'rgba(250,248,244,0.2)',
              color: 'rgba(250,248,244,0.9)',
            }}
          />
          {unlockState === 'error' && (
            <p className="text-xs text-red-400 font-script">Incorrect password.</p>
          )}
          <button
            type="submit"
            disabled={unlockState === 'loading'}
            className={cn(
              'w-full border px-6 py-3 uppercase tracking-[0.35em] text-xs transition hover:-translate-y-0.5',
              'disabled:opacity-50 disabled:cursor-not-allowed',
            )}
            style={{ borderColor: 'rgba(250,248,244,0.25)', color: 'rgba(250,248,244,0.7)' }}
          >
            {unlockState === 'loading' ? 'Unlocking...' : 'Enter'}
          </button>
        </form>

      </div>
    </main>
  );
}

export default function LockedPage() {
  return (
    <Suspense>
      <LockedPageInner />
    </Suspense>
  );
}
