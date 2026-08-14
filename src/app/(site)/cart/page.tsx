"use client";

/**
 * Cart — a ledger in the same vocabulary as Home and Archive: catalogue
 * number, plate, name, hairline rules, tabular figures. See
 * design/screens/04-cart.md — the "Why 1180px" section explains the three
 * defences the row grid depends on; do not "simplify" the breakpoint.
 */

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { PageShell } from "@/components/layout/PageShell";
import { startCheckoutSession } from "@/lib/checkout-client";
import { formatCurrency } from "@/lib/utils";
import { useCartStore, useCartTotal } from "@/store/cart";

const mono: React.CSSProperties = { fontFamily: "var(--hb-font-mono)" };
const meta: React.CSSProperties = {
  ...mono,
  fontSize: "var(--hb-label-xs)",
  textTransform: "uppercase",
  letterSpacing: "var(--hb-track-meta)",
  color: "var(--hb-dark-muted)",
};
const num: React.CSSProperties = { ...mono, fontVariantNumeric: "tabular-nums", color: "var(--hb-on-dark)" };
const bare: React.CSSProperties = { background: "none", border: "none", padding: 0, cursor: "pointer" };
const line = "1px solid var(--hb-dark-border)";

function useNarrow(px: number) {
  const [narrow, setNarrow] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${px - 1}px)`);
    const on = (e: MediaQueryListEvent | MediaQueryList) => setNarrow(e.matches);
    on(mq);
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, [px]);
  return narrow;
}

export default function CartPage() {
  const items = useCartStore((state) => state.items);
  const removeItem = useCartStore((state) => state.removeItem);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const clearCart = useCartStore((state) => state.clearCart);
  const isCheckingOut = useCartStore((state) => state.isCheckingOut);
  const setCheckingOut = useCartStore((state) => state.setCheckingOut);
  const total = useCartTotal();
  const narrow = useNarrow(1180);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const count = items.reduce((n, i) => n + i.quantity, 0);

  const stepper = (item: (typeof items)[number]) => (
    <div style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
      <button
        type="button"
        aria-label={`Decrease quantity of ${item.name}`}
        onClick={() => updateQuantity(item.id, item.size, Math.max(1, item.quantity - 1))}
        style={{ ...bare, ...meta, width: "1.5rem", textAlign: "center", fontSize: "0.875rem", opacity: item.quantity > 1 ? 1 : 0.3 }}
      >
        –
      </button>
      <span style={{ ...num, width: "2rem", textAlign: "center", fontSize: "0.875rem" }}>{item.quantity}</span>
      <button
        type="button"
        aria-label={`Increase quantity of ${item.name}`}
        onClick={() => updateQuantity(item.id, item.size, item.quantity + 1)}
        style={{ ...bare, ...meta, width: "1.5rem", textAlign: "center", fontSize: "0.875rem" }}
      >
        +
      </button>
    </div>
  );

  return (
    <main className="page-transition">
      <PageShell
        variant="dark"
        eyebrow={count > 0 ? `Cart — ${count} piece${count === 1 ? "" : "s"}` : "Cart"}
        title="Your current study."
        intro="Cart items are stored locally. Checkout is handled securely by Stripe."
      >
        {items.length === 0 ? (
          <div style={{ borderTop: line, paddingTop: "3rem", maxWidth: "34rem" }}>
            <p
              style={{
                fontFamily: "var(--hb-font-display)",
                fontStyle: "italic",
                fontWeight: 300,
                fontSize: "clamp(1.5rem, 3vw, 2.25rem)",
                lineHeight: 1.45,
                color: "var(--hb-on-dark)",
                margin: 0,
              }}
            >
              Nothing yet.
            </p>
            <div style={{ display: "flex", gap: "2rem", marginTop: "2rem" }}>
              {[
                ["/shop", "Browse the shop"],
                ["/archive", "Revisit the archive"],
              ].map(([href, label]) => (
                <Link
                  key={href}
                  href={href}
                  style={{ ...meta, color: "var(--hb-sienna)", borderBottom: "1px solid currentColor", paddingBottom: "0.35rem" }}
                >
                  {label}
                </Link>
              ))}
            </div>
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: narrow ? "minmax(0, 1fr)" : "minmax(0, 1fr) minmax(15rem, 18rem)",
              gap: "4rem",
              alignItems: "start",
            }}
          >
            <ol style={{ listStyle: "none", margin: 0, padding: 0 }}>
              {items.map((item) => (
                <li key={item.id + "-" + item.size} style={{ borderTop: line }}>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: narrow ? "4.5rem minmax(0, 1fr)" : "3rem 4rem minmax(7rem, 1fr) 6rem 6rem",
                      gap: "1.25rem",
                      alignItems: "start",
                      padding: "1.75rem 0",
                    }}
                  >
                    {!narrow && (
                      <span style={{ ...mono, fontSize: "var(--hb-label-3xs)", letterSpacing: "var(--hb-track-catalog)", textTransform: "uppercase", color: "var(--hb-sienna)", paddingTop: "0.35rem" }}>
                        {item.catalogNumber ?? "HB-—"}
                      </span>
                    )}

                    <div style={{ aspectRatio: "4 / 5", overflow: "hidden", background: "var(--hb-dark-surface)" }}>
                      {item.image && (
                        <Image src={item.image} alt="" width={200} height={250} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      )}
                    </div>

                    <div style={{ minWidth: 0 }}>
                      <Link
                        href={`/product/${item.slug}`}
                        style={{
                          fontFamily: "var(--hb-font-display)",
                          fontStyle: "italic",
                          fontWeight: 300,
                          fontSize: "clamp(1.25rem, 2vw, 1.75rem)",
                          lineHeight: 1.45,
                          color: "var(--hb-on-dark)",
                          display: "block",
                        }}
                      >
                        {item.name}
                      </Link>
                      <p style={{ ...meta, margin: "0.5rem 0 0" }}>
                        Size {item.size}
                        {item.collection ? " · " + item.collection : ""}
                      </p>
                      {narrow && (
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem", marginTop: "1.25rem" }}>
                          {stepper(item)}
                          <span style={{ ...num, fontSize: "0.875rem" }}>{formatCurrency(item.price * item.quantity)}</span>
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={() => removeItem(item.id, item.size)}
                        style={{ ...bare, ...meta, marginTop: "1.25rem", opacity: 0.7 }}
                      >
                        Remove
                      </button>
                    </div>

                    {!narrow && <div style={{ paddingTop: "0.25rem" }}>{stepper(item)}</div>}
                    {!narrow && (
                      <span style={{ ...num, fontSize: "0.875rem", textAlign: "right", paddingTop: "0.35rem" }}>
                        {formatCurrency(item.price * item.quantity)}
                      </span>
                    )}
                  </div>
                </li>
              ))}
              <li style={{ borderTop: line }} />
            </ol>

            <div style={{ position: narrow ? "static" : "sticky", top: "6rem", display: "flex", flexDirection: "column", gap: "2rem" }}>
              <dl style={{ margin: 0, display: "flex", flexDirection: "column", gap: "0.875rem" }}>
                {[
                  ["Subtotal", formatCurrency(total)],
                  ["Shipping", "At checkout"],
                  ["Lead time", "3–4 months"],
                ].map(([k, v]) => (
                  <div key={k} style={{ display: "flex", justifyContent: "space-between", gap: "1rem" }}>
                    <dt style={meta}>{k}</dt>
                    <dd style={{ ...meta, color: "var(--hb-on-dark)", margin: 0, fontVariantNumeric: "tabular-nums" }}>{v}</dd>
                  </div>
                ))}
                <div style={{ borderTop: line, paddingTop: "1.25rem", display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: "1rem" }}>
                  <dt style={meta}>Total</dt>
                  <dd style={{ ...num, fontSize: "1.5rem", margin: 0 }}>{formatCurrency(total)}</dd>
                </div>
              </dl>

              {error && (
                <div
                  role="alert"
                  style={{
                    border: "1px solid rgba(154,122,90,0.45)",
                    background: "rgba(154,122,90,0.08)",
                    padding: "0.75rem 1rem",
                    fontFamily: "var(--hb-font-mono)",
                    fontSize: "0.7rem",
                    textTransform: "uppercase",
                    letterSpacing: "var(--hb-track-tag)",
                    color: "rgba(250,248,244,0.9)",
                    lineHeight: 1.7,
                  }}
                >
                  {error}
                </div>
              )}

              <button
                type="button"
                disabled={loading || isCheckingOut}
                onClick={async () => {
                  setError(null);
                  setLoading(true);
                  setCheckingOut(true);
                  const result = await startCheckoutSession(items);
                  setLoading(false);
                  setCheckingOut(false);
                  if (!result.ok) setError(result.message ?? "Checkout couldn't start. Please try again.");
                }}
                style={{
                  width: "100%",
                  background: "var(--hb-sienna)",
                  color: "var(--hb-on-dark)",
                  textTransform: "uppercase",
                  letterSpacing: "var(--hb-track-nav)",
                  padding: "1.125rem 1.5rem",
                  fontSize: "0.75rem",
                  border: "none",
                  borderRadius: 0,
                  cursor: loading ? "not-allowed" : "pointer",
                  opacity: loading ? 0.4 : 1,
                  ...mono,
                }}
              >
                {loading ? "Redirecting…" : "Checkout"}
              </button>

              <div style={{ display: "flex", justifyContent: "space-between", gap: "1rem" }}>
                <Link href="/shop" style={{ ...meta, color: "var(--hb-sienna)" }}>
                  Keep looking
                </Link>
                <button type="button" onClick={clearCart} style={{ ...bare, ...meta, opacity: 0.7 }}>
                  Clear cart
                </button>
              </div>
            </div>
          </div>
        )}
      </PageShell>
    </main>
  );
}
