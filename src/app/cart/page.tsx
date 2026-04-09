"use client";

import { PageShell } from "@/components/layout/PageShell";
import { startCheckoutSession } from "@/lib/checkout-client";
import { formatCurrency } from "@/lib/utils";
import { useCartStore, useCartTotal } from "@/store/cart";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";

export default function CartPage() {
  const items = useCartStore((state) => state.items);
  const removeItem = useCartStore((state) => state.removeItem);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const clearCart = useCartStore((state) => state.clearCart);
  const total = useCartTotal();
  const isCheckingOut = useCartStore((state) => state.isCheckingOut);
  const setCheckingOut = useCartStore((state) => state.setCheckingOut);
  const [isLoading, setIsLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  return (
    <PageShell
      variant="dark"
      eyebrow="Cart"
      title="Your current study."
      intro="Cart items are stored locally. Checkout is handled securely by Stripe."
    >
      <div className="space-y-8">
        <div className="border border-[var(--hb-dark-border)] divide-y divide-[var(--hb-dark-border)]">
          {items.length === 0 ? (
            <div
              className="p-6 text-sm text-[var(--hb-dark-muted)]"
              style={{ fontFamily: "var(--hb-font-mono)" }}
            >
              Nothing yet. Browse the{" "}
              <Link href="/shop" className="underline" style={{ color: "var(--hb-sienna)" }}>
                shop
              </Link>{" "}
              or revisit the archive.
            </div>
          ) : (
            items.map((item) => (
              <article
                key={`${item.id}-${item.size}`}
                className="p-6 bg-[var(--hb-dark-surface)] flex flex-col gap-4 md:flex-row md:items-center md:justify-between"
              >
                <div>
                  <p
                    className="text-xl text-[#faf8f4] italic font-light"
                    style={{ fontFamily: "var(--hb-font-display)" }}
                  >
                    {item.name}
                  </p>
                  <p
                    className="text-xs uppercase tracking-[0.3em] mt-1"
                    style={{ fontFamily: "var(--hb-font-mono)", color: "var(--hb-dark-muted)" }}
                  >
                    Size {item.size}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center border border-[var(--hb-dark-border)]">
                    <button
                      type="button"
                      onClick={() =>
                        updateQuantity(item.id, item.size, Math.max(1, item.quantity - 1))
                      }
                      className="w-8 h-8 text-[#faf8f4]"
                      style={{ fontFamily: "var(--hb-font-mono)" }}
                    >
                      –
                    </button>
                    <span
                      className="w-10 text-center text-[#faf8f4] tabular-nums"
                      style={{ fontFamily: "var(--hb-font-mono)" }}
                    >
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.id, item.size, item.quantity + 1)}
                      className="w-8 h-8 text-[#faf8f4]"
                      style={{ fontFamily: "var(--hb-font-mono)" }}
                    >
                      +
                    </button>
                  </div>
                  <p
                    className="tabular-nums"
                    style={{ fontFamily: "var(--hb-font-mono)", color: "var(--hb-sienna)" }}
                  >
                    {formatCurrency(item.price * item.quantity)}
                  </p>
                  <button
                    type="button"
                    onClick={() => removeItem(item.id, item.size)}
                    className="text-xs uppercase tracking-[0.3em] text-[var(--hb-dark-muted)] hover:text-[#faf8f4] transition-colors"
                    style={{ fontFamily: "var(--hb-font-mono)" }}
                  >
                    Remove
                  </button>
                </div>
              </article>
            ))
          )}
        </div>
        {items.length > 0 && (
          <div className="space-y-4">
            {checkoutError && (
              <div
                role="alert"
                className="border border-[var(--hb-sienna)]/45 bg-[var(--hb-sienna)]/[0.08] px-4 py-3 text-[0.7rem] uppercase tracking-[0.2em] text-[#faf8f4]/90 leading-relaxed"
                style={{ fontFamily: "var(--hb-font-mono)" }}
              >
                {checkoutError}
              </div>
            )}
            <div className="flex items-center justify-between text-sm">
              <span
                style={{ fontFamily: "var(--hb-font-mono)", color: "var(--hb-dark-muted)" }}
              >
                Total
              </span>
              <span
                className="font-semibold text-[#faf8f4] tabular-nums"
                style={{ fontFamily: "var(--hb-font-mono)" }}
              >
                {formatCurrency(total)}
              </span>
            </div>
            <button
              type="button"
              onClick={async () => {
                setCheckoutError(null);
                setIsLoading(true);
                setCheckingOut(true);
                const result = await startCheckoutSession(items);
                setIsLoading(false);
                setCheckingOut(false);
                if (!result.ok) {
                  setCheckoutError(result.message);
                  toast.error("Checkout couldn’t start", {
                    description: result.message,
                  });
                }
              }}
              disabled={isLoading || isCheckingOut}
              className="w-full bg-[var(--hb-sienna)] text-[#faf8f4] uppercase tracking-[0.4em] px-6 py-4 text-xs hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ fontFamily: "var(--hb-font-mono)" }}
            >
              {isLoading ? "Redirecting…" : "Checkout"}
            </button>
            <button
              type="button"
              onClick={clearCart}
              className="text-xs uppercase tracking-[0.3em] text-[var(--hb-dark-muted)] hover:text-[#faf8f4] transition-colors"
              style={{ fontFamily: "var(--hb-font-mono)" }}
            >
              Clear cart
            </button>
          </div>
        )}
      </div>
    </PageShell>
  );
}
