'use client';

import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

type FormState = 'idle' | 'loading' | 'success' | 'error';

interface EmailCaptureFormProps {
  className?: string;
}

export function EmailCaptureForm({ className }: EmailCaptureFormProps) {
  const [formState, setFormState] = useState<FormState>('idle');
  const [email, setEmail] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormState('loading');

    try {
      const res = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) throw new Error('Request failed');
      setFormState('success');
      setEmail('');
    } catch {
      setFormState('error');
    }
  };

  return (
    <div className={cn("w-full max-w-md mx-auto", className)}>
      <AnimatePresence mode="wait">
        {formState === 'success' ? (
          <motion.p
            key="success"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center font-display text-xl"
          >
            You&apos;re on the list.
          </motion.p>
        ) : (
          <motion.form
            key="form"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onSubmit={handleSubmit}
            className="space-y-4"
          >
            <div className="space-y-1">
              <label
                htmlFor="email"
                className="block text-xs uppercase tracking-[0.35em]"
                style={{ fontFamily: 'var(--hb-font-mono)', color: 'rgba(250,248,244,0.45)' }}
              >
                Email address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={formState === 'loading'}
                className="w-full px-0 py-3 bg-transparent border-0 border-b border-[var(--hb-dark-border)] text-[var(--hb-on-dark)] focus:outline-none focus:border-[var(--hb-on-dark)] disabled:opacity-50 transition-colors font-display placeholder:text-[var(--hb-dark-muted)]"
                placeholder="your@email.com"
              />
            </div>

            {formState === 'error' && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-sm text-red-600 font-script"
              >
                Something went wrong. Please try again.
              </motion.p>
            )}

            {/* Hairline, not filled — the page's filled element is its
                primary action, and this form never is. */}
            <motion.button
              type="submit"
              disabled={formState === 'loading'}
              className={cn(
                "w-full min-h-[44px] py-4 border border-[var(--hb-dark-border)] text-[var(--hb-on-dark)] text-xs uppercase tracking-[0.35em] transition-colors duration-300",
                "hover:border-[var(--hb-on-dark)] disabled:opacity-50 disabled:cursor-not-allowed"
              )}
              style={{ fontFamily: 'var(--hb-font-mono)' }}
            >
              {formState === 'loading' ? 'Joining...' : 'Join the Drop List'}
            </motion.button>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}
