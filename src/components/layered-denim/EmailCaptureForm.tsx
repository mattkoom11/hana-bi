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
            className="text-center font-serif text-xl"
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
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={formState === 'loading'}
              className="w-full px-0 py-3 bg-transparent border-0 border-b border-[var(--hb-border)] focus:outline-none focus:border-[var(--hb-accent)] disabled:opacity-50 transition-colors font-serif placeholder:text-[var(--hb-smoke)]/50"
              placeholder="your@email.com"
            />

            {formState === 'error' && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-sm text-red-600 font-script"
              >
                Something went wrong. Please try again.
              </motion.p>
            )}

            <motion.button
              type="submit"
              disabled={formState === 'loading'}
              whileHover={{ scale: formState === 'loading' ? 1 : 1.02 }}
              whileTap={{ scale: formState === 'loading' ? 1 : 0.98 }}
              className={cn(
                "w-full py-4 bg-[var(--hb-ink)] text-[var(--hb-paper)] font-serif text-lg transition-colors",
                "hover:bg-[var(--hb-ink-light)] disabled:opacity-50 disabled:cursor-not-allowed"
              )}
            >
              {formState === 'loading' ? 'Joining...' : 'Join the Drop List'}
            </motion.button>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}
