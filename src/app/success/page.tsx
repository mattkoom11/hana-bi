'use client';

import { useEffect, useState, Suspense } from "react";
import { useCartStore } from "@/store/cart";
import { motion } from "framer-motion";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

function SuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const [verified, setVerified] = useState<boolean | null>(null);

  useEffect(() => {
    if (!sessionId) {
      setVerified(false);
      return;
    }

    let attempts = 0;
    const maxAttempts = 5;
    const retryDelayMs = 1000;

    const verify = () => {
      fetch(`/api/checkout/verify?session_id=${encodeURIComponent(sessionId)}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.verified === true) {
            setVerified(true);
            useCartStore.getState().clearCart();
          } else {
            attempts += 1;
            if (attempts < maxAttempts) {
              setTimeout(verify, retryDelayMs);
            } else {
              setVerified(false);
            }
          }
        })
        .catch(() => {
          attempts += 1;
          if (attempts < maxAttempts) {
            setTimeout(verify, retryDelayMs);
          } else {
            setVerified(false);
          }
        });
    };

    verify();
  }, [sessionId]);

  if (verified === null) {
    return (
      <div className="min-h-screen bg-[var(--hb-dark)] flex items-center justify-center">
        <p
          className="text-sm"
          style={{ fontFamily: "var(--hb-font-mono)", color: "var(--hb-dark-muted)" }}
        >
          Confirming your order...
        </p>
      </div>
    );
  }

  if (!verified) {
    return (
      <div className="min-h-screen bg-[var(--hb-dark)] flex items-center justify-center px-4">
        <div className="max-w-md text-center space-y-6">
          <h1
            className="text-3xl text-[#faf8f4] italic font-light"
            style={{ fontFamily: "var(--hb-font-display)" }}
          >
            Order not found
          </h1>
          <p
            className="text-sm"
            style={{ fontFamily: "var(--hb-font-mono)", color: "var(--hb-dark-muted)" }}
          >
            We couldn&apos;t verify your order. If you completed a purchase, check your email for confirmation.
          </p>
          <Link
            href="/"
            className="inline-block px-8 py-4 bg-[var(--hb-sienna)] text-[#faf8f4] uppercase tracking-[0.4em] text-xs hover:opacity-90 transition-opacity"
            style={{ fontFamily: "var(--hb-font-mono)" }}
          >
            Return Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--hb-dark)] flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="max-w-2xl mx-auto text-center space-y-8"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", delay: 0.2, stiffness: 200 }}
          className="w-24 h-24 mx-auto rounded-full bg-[var(--hb-sienna)]/10 flex items-center justify-center"
        >
          <svg
            width="48"
            height="48"
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--hb-sienna)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M20 6L9 17l-5-5" />
          </svg>
        </motion.div>

        <div className="space-y-4">
          <h1
            className="text-4xl md:text-5xl lg:text-6xl text-[#faf8f4] italic font-light"
            style={{ fontFamily: "var(--hb-font-display)" }}
          >
            Order Confirmed
          </h1>
          <p
            className="text-base max-w-md mx-auto"
            style={{ fontFamily: "var(--hb-font-mono)", color: "var(--hb-dark-muted)" }}
          >
            Thank you for your order. We&apos;ve received your payment and will begin processing your garment.
          </p>
        </div>

        {sessionId && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="p-6 bg-[var(--hb-dark-surface)] border border-[var(--hb-dark-border)]"
          >
            <p
              className="text-xs mb-2"
              style={{ fontFamily: "var(--hb-font-mono)", color: "var(--hb-sienna)" }}
            >
              Order ID
            </p>
            <p
              className="text-sm break-all"
              style={{ fontFamily: "var(--hb-font-mono)", color: "var(--hb-dark-muted)" }}
            >
              {sessionId}
            </p>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="space-y-4 pt-8"
        >
          <h2
            className="text-2xl text-[#faf8f4] italic font-light"
            style={{ fontFamily: "var(--hb-font-display)" }}
          >
            What&apos;s Next?
          </h2>
          <div className="space-y-3 text-left max-w-md mx-auto">
            {[
              "You'll receive an email confirmation with your order details.",
              "We'll notify you when your order ships (6–8 weeks for first drop).",
              "Your garment will arrive ready to break in and age with you.",
            ].map((text, i) => (
              <div key={i} className="flex items-start gap-3">
                <span
                  className="text-lg"
                  style={{ fontFamily: "var(--hb-font-display)", color: "var(--hb-sienna)", fontStyle: "italic" }}
                >
                  {i + 1}.
                </span>
                <p
                  className="text-sm"
                  style={{ fontFamily: "var(--hb-font-mono)", color: "var(--hb-dark-muted)" }}
                >
                  {text}
                </p>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="flex flex-col sm:flex-row gap-4 justify-center pt-8"
        >
          <Link
            href="/shop"
            className="px-8 py-4 border border-[var(--hb-dark-border)] text-[var(--hb-dark-muted)] uppercase tracking-[0.4em] text-xs hover:text-[#faf8f4] hover:border-[var(--hb-sienna)] transition-all duration-300"
            style={{ fontFamily: "var(--hb-font-mono)" }}
          >
            Back to Shop
          </Link>
          <Link
            href="/"
            className="px-8 py-4 bg-[var(--hb-sienna)] text-[#faf8f4] uppercase tracking-[0.4em] text-xs hover:opacity-90 transition-opacity"
            style={{ fontFamily: "var(--hb-font-mono)" }}
          >
            Return Home
          </Link>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="text-sm pt-8"
          style={{ fontFamily: "var(--hb-font-mono)", color: "var(--hb-dark-muted)" }}
        >
          Questions? Contact us at{" "}
          <a
            href="mailto:hello@hanabiny.com"
            className="hover:opacity-80 transition-opacity"
            style={{ color: "var(--hb-sienna)" }}
          >
            hello@hanabiny.com
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
        <div className="min-h-screen bg-[var(--hb-dark)] flex items-center justify-center">
          <p
            className="text-sm"
            style={{ fontFamily: "var(--hb-font-mono)", color: "var(--hb-dark-muted)" }}
          >
            Loading...
          </p>
        </div>
      }
    >
      <SuccessContent />
    </Suspense>
  );
}
