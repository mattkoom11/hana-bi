'use client';

import { motion } from "framer-motion";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function SuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");

  return (
    <div className="min-h-screen bg-[var(--hb-paper)] text-[var(--hb-ink)] flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="max-w-2xl mx-auto text-center space-y-8"
      >
        {/* Success Icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", delay: 0.2, stiffness: 200 }}
          className="w-24 h-24 mx-auto rounded-full bg-[var(--hb-accent)]/10 flex items-center justify-center"
        >
          <svg
            width="48"
            height="48"
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

        {/* Heading */}
        <div className="space-y-4">
          <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl">
            Order Confirmed
          </h1>
          <p className="text-lg text-[var(--hb-smoke)] max-w-md mx-auto">
            Thank you for your order. We&apos;ve received your payment and will begin processing your Layered Denim.
          </p>
        </div>

        {/* Order Details */}
        {sessionId && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="p-6 bg-[var(--hb-paper-muted)] rounded-2xl border border-[var(--hb-border)]"
          >
            <p className="text-sm font-script text-[var(--hb-smoke)] mb-2">
              Order ID
            </p>
            <p className="font-mono text-sm text-[var(--hb-ink)] break-all">
              {sessionId}
            </p>
          </motion.div>
        )}

        {/* What's Next */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="space-y-4 pt-8"
        >
          <h2 className="font-serif text-2xl">What&apos;s Next?</h2>
          <div className="space-y-3 text-left max-w-md mx-auto">
            <div className="flex items-start gap-3">
              <span className="font-serif text-lg text-[var(--hb-accent)]">
                1.
              </span>
              <p className="text-[var(--hb-smoke)]">
                You&apos;ll receive an email confirmation with your order details.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <span className="font-serif text-lg text-[var(--hb-accent)]">
                2.
              </span>
              <p className="text-[var(--hb-smoke)]">
                We&apos;ll notify you when your order ships (6-8 weeks for first drop).
              </p>
            </div>
            <div className="flex items-start gap-3">
              <span className="font-serif text-lg text-[var(--hb-accent)]">
                3.
              </span>
              <p className="text-[var(--hb-smoke)]">
                Your Layered Denim will arrive ready to break in and age with you.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="flex flex-col sm:flex-row gap-4 justify-center pt-8"
        >
          <Link
            href="/layered-denim"
            className="px-8 py-4 border-2 border-[var(--hb-ink)] rounded-2xl font-serif text-lg hover:bg-[var(--hb-paper-muted)] transition-colors"
          >
            Back to Product
          </Link>
          <Link
            href="/"
            className="px-8 py-4 bg-[var(--hb-ink)] text-[var(--hb-paper)] rounded-2xl font-serif text-lg hover:bg-[var(--hb-ink-light)] transition-colors"
          >
            Return Home
          </Link>
        </motion.div>

        {/* Additional Info */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="text-sm text-[var(--hb-smoke)] font-script pt-8"
        >
          Questions? Contact us at{" "}
          <a
            href="mailto:hello@hana-bi.com"
            className="underline hover:text-[var(--hb-ink)] transition-colors"
          >
            hello@hana-bi.com
          </a>
        </motion.p>
      </motion.div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[var(--hb-paper)] flex items-center justify-center">
          <p className="text-[var(--hb-smoke)] font-script">Loading...</p>
        </div>
      }
    >
      <SuccessContent />
    </Suspense>
  );
}

