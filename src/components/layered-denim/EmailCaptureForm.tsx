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
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormState('loading');

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Simulate success (in real app, check response)
    const success = Math.random() > 0.2; // 80% success rate for demo

    if (success) {
      setFormState('success');
      setName('');
      setEmail('');
    } else {
      setFormState('error');
    }
  };

  return (
    <div className={cn("w-full max-w-md mx-auto", className)}>
      <AnimatePresence mode="wait">
        {formState === 'success' ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="text-center space-y-4"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", delay: 0.2 }}
              className="w-16 h-16 mx-auto rounded-full bg-[var(--hb-accent)]/10 flex items-center justify-center"
            >
              <svg
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                stroke="var(--hb-accent)"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M20 6L9 17l-5-5" />
              </svg>
            </motion.div>
            <h3 className="font-serif text-2xl">You&apos;re on the list</h3>
            <p className="text-[var(--hb-smoke)]">
              We&apos;ll notify you when Layered Denim is available.
            </p>
            
            {/* Drop Notes Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mt-6 p-6 bg-[var(--hb-paper-muted)] rounded-2xl border border-[var(--hb-border)]"
            >
              <h4 className="font-serif text-lg mb-2">Drop Notes</h4>
              <p className="text-sm text-[var(--hb-smoke)] font-script">
                Limited release. First drop ships in 6-8 weeks.
              </p>
            </motion.div>
          </motion.div>
        ) : (
          <motion.form
            key="form"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onSubmit={handleSubmit}
            className="space-y-4"
          >
            <div>
              <label htmlFor="name" className="block text-sm font-script mb-2 text-[var(--hb-smoke)]">
                Name
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                disabled={formState === 'loading'}
                className="w-full px-4 py-3 bg-[var(--hb-paper-muted)] border border-[var(--hb-border)] rounded-2xl focus:outline-none focus:ring-2 focus:ring-[var(--hb-accent)]/50 focus:border-transparent disabled:opacity-50 transition-all"
                placeholder="Your name"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-script mb-2 text-[var(--hb-smoke)]">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={formState === 'loading'}
                className="w-full px-4 py-3 bg-[var(--hb-paper-muted)] border border-[var(--hb-border)] rounded-2xl focus:outline-none focus:ring-2 focus:ring-[var(--hb-accent)]/50 focus:border-transparent disabled:opacity-50 transition-all"
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

            <motion.button
              type="submit"
              disabled={formState === 'loading'}
              whileHover={{ scale: formState === 'loading' ? 1 : 1.02 }}
              whileTap={{ scale: formState === 'loading' ? 1 : 0.98 }}
              className="w-full py-4 bg-[var(--hb-ink)] text-[var(--hb-paper)] rounded-2xl font-serif text-lg hover:bg-[var(--hb-ink-light)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {formState === 'loading' ? 'Joining...' : 'Join the Drop List'}
            </motion.button>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}

