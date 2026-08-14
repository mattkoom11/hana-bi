"use client";

/**
 * Success — order confirmation. The circled checkmark is gone; this is the
 * same ledger vocabulary as the cart. See design/screens/04-cart.md.
 */

import { useEffect, useState, Suspense } from "react";
import { useCartStore } from "@/store/cart";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { PageShell } from "@/components/layout/PageShell";

const mono: React.CSSProperties = { fontFamily: "var(--hb-font-mono)" };
const meta: React.CSSProperties = {
  ...mono,
  fontSize: "var(--hb-label-xs)",
  textTransform: "uppercase",
  letterSpacing: "var(--hb-track-meta)",
  color: "var(--hb-dark-muted)",
};
const line = "1px solid var(--hb-dark-border)";

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
            if (attempts < maxAttempts) setTimeout(verify, retryDelayMs);
            else setVerified(false);
          }
        })
        .catch(() => {
          attempts += 1;
          if (attempts < maxAttempts) setTimeout(verify, retryDelayMs);
          else setVerified(false);
        });
    };

    verify();
  }, [sessionId]);

  if (verified === null) {
    return (
      <PageShell variant="dark" eyebrow="Order confirmed" title="Confirming your order." intro="One moment while we verify your payment with Stripe.">
        <div />
      </PageShell>
    );
  }

  if (!verified) {
    return (
      <PageShell
        variant="dark"
        eyebrow="Order not found"
        title="We couldn't verify that order."
        intro="If you completed a purchase, check your email for confirmation."
      >
        <Link
          href="/"
          style={{
            display: "inline-block",
            background: "var(--hb-sienna)",
            color: "var(--hb-on-dark)",
            textTransform: "uppercase",
            letterSpacing: "var(--hb-track-nav)",
            padding: "1rem 2rem",
            fontSize: "0.75rem",
            ...mono,
          }}
        >
          Return Home
        </Link>
      </PageShell>
    );
  }

  return (
    <PageShell
      variant="dark"
      eyebrow="Order confirmed"
      title="Received. We begin cutting."
      intro="Payment has cleared and your garment enters the production queue. A confirmation email is on its way."
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(18rem, 1fr))",
          gap: "4rem",
          maxWidth: "62rem",
        }}
      >
        <dl style={{ margin: 0, display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          {[
            ["Order", sessionId ?? "—"],
            ["Ships", "6–8 weeks (first drop)"],
            ["Contact", "hello@hanabiny.com"],
          ].map(([k, v]) => (
            <div key={k} style={{ borderTop: line, paddingTop: "1rem" }}>
              <dt style={{ ...meta, color: "var(--hb-sienna)" }}>{k}</dt>
              <dd style={{ ...mono, fontSize: "0.875rem", color: "var(--hb-on-dark)", margin: "0.5rem 0 0", wordBreak: "break-all" }}>
                {v}
              </dd>
            </div>
          ))}
        </dl>

        <ol style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          {[
            "An email confirmation follows with your order details.",
            "We notify you when the piece ships.",
            "It arrives ready to break in and age with you.",
          ].map((text, i) => (
            <li key={i} style={{ display: "grid", gridTemplateColumns: "2.5rem minmax(0, 1fr)", gap: "0.5rem", alignItems: "baseline" }}>
              <span style={{ ...mono, fontSize: "var(--hb-label-3xs)", letterSpacing: "var(--hb-track-catalog)", color: "var(--hb-sienna)" }}>
                {String(i + 1).padStart(2, "0")}
              </span>
              <p style={{ ...mono, fontSize: "0.875rem", lineHeight: 1.7, color: "var(--hb-dark-muted)", margin: 0 }}>{text}</p>
            </li>
          ))}
        </ol>
      </div>

      <div style={{ display: "flex", gap: "2rem", marginTop: "4rem" }}>
        <Link href="/shop" style={{ ...meta, color: "var(--hb-sienna)", borderBottom: "1px solid currentColor", paddingBottom: "0.35rem" }}>
          Back to shop
        </Link>
        <Link href="/" style={{ ...meta, borderBottom: "1px solid var(--hb-dark-border)", paddingBottom: "0.35rem" }}>
          Return home
        </Link>
      </div>
    </PageShell>
  );
}

export default function SuccessPage() {
  return (
    <main className="page-transition">
      <Suspense
        fallback={
          <PageShell variant="dark" eyebrow="Order confirmed" title="Loading." intro="">
            <div />
          </PageShell>
        }
      >
        <SuccessContent />
      </Suspense>
    </main>
  );
}
