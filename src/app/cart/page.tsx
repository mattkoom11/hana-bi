'use client';

import { PageShell } from "@/components/layout/PageShell";
import { formatCurrency } from "@/lib/utils";
import { useCartStore, useCartTotal, type CartItem } from "@/store/cart";
import Link from "next/link";
import { useState } from "react";

async function handleCheckout(items: CartItem[]) {
  if (items.length === 0) return;

  try {
    const response = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items: items.map((item) => ({
          name: `${item.name} — Size ${item.size}`,
          price: Math.round(item.price * 100),
          quantity: item.quantity,
          ...(item.image ? { image: item.image } : {}),
        })),
        cancelUrl: `${window.location.origin}/cart`,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to create checkout");
    }

    const { url } = await response.json();
    window.location.href = url;
  } catch (error) {
    console.error("Checkout error:", error);
    alert(
      error instanceof Error
        ? error.message
        : "Failed to start checkout. Please try again."
    );
  }
}

export default function CartPage() {
  const items = useCartStore((state) => state.items);
  const removeItem = useCartStore((state) => state.removeItem);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const clearCart = useCartStore((state) => state.clearCart);
  const total = useCartTotal();
  const isCheckingOut = useCartStore((state) => state.isCheckingOut);
  const setCheckingOut = useCartStore((state) => state.setCheckingOut);
  const [isLoading, setIsLoading] = useState(false);

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
            <div className="p-6 text-sm text-[var(--hb-dark-muted)]">
              Nothing yet. Browse the{" "}
              <Link href="/shop" className="text-[var(--hb-sienna)] underline">
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
                  <p className="font-serif text-xl text-[#faf8f4]">{item.name}</p>
                  <p className="text-xs uppercase tracking-[0.3em] text-[var(--hb-dark-muted)]">
                    Size {item.size}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center border border-[var(--hb-dark-border)]">
                    <button
                      onClick={() =>
                        updateQuantity(item.id, item.size, Math.max(1, item.quantity - 1))
                      }
                      className="w-8 h-8 text-[#faf8f4]"
                    >
                      –
                    </button>
                    <span className="w-10 text-center text-[#faf8f4]">{item.quantity}</span>
                    <button
                      onClick={() =>
                        updateQuantity(item.id, item.size, item.quantity + 1)
                      }
                      className="w-8 h-8 text-[#faf8f4]"
                    >
                      +
                    </button>
                  </div>
                  <p className="text-[var(--hb-sienna)]">{formatCurrency(item.price * item.quantity)}</p>
                  <button
                    onClick={() => removeItem(item.id, item.size)}
                    className="text-xs uppercase tracking-[0.3em] text-[var(--hb-dark-muted)] hover:text-[#faf8f4] transition-colors"
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
            <div className="flex items-center justify-between text-sm">
              <span className="text-[var(--hb-dark-muted)]">Total</span>
              <span className="font-semibold text-[#faf8f4]">{formatCurrency(total)}</span>
            </div>
            <button
              onClick={async () => {
                setIsLoading(true);
                setCheckingOut(true);
                await handleCheckout(items);
                setIsLoading(false);
                setCheckingOut(false);
              }}
              disabled={isLoading || isCheckingOut}
              className="w-full bg-[var(--hb-sienna)] text-[#faf8f4] uppercase tracking-[0.4em] px-6 py-4 text-xs hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {isLoading ? "Redirecting to checkout..." : "Checkout"}
            </button>
            <button
              onClick={clearCart}
              className="text-xs uppercase tracking-[0.3em] text-[var(--hb-dark-muted)] hover:text-[#faf8f4] transition-colors"
            >
              Clear cart
            </button>
          </div>
        )}
      </div>
    </PageShell>
  );
}
