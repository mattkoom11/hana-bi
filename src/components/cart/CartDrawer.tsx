"use client";

import { formatCurrency } from "@/lib/utils";
import {
  useCartCount,
  useCartStore,
  useCartTotal,
  type CartItem,
} from "@/store/cart";
import { useState } from "react";

interface CartDrawerProps {
  open: boolean;
  onClose: () => void;
}

async function handleCheckout(items: CartItem[], onClose: () => void) {
  if (items.length === 0) {
    return;
  }

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
    onClose();
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

export function CartDrawer({ open, onClose }: CartDrawerProps) {
  const items = useCartStore((state) => state.items);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeItem = useCartStore((state) => state.removeItem);
  const clearCart = useCartStore((state) => state.clearCart);
  const itemCount = useCartCount();
  const total = useCartTotal();
  const setCheckingOut = useCartStore((state) => state.setCheckingOut);
  const [isLoading, setIsLoading] = useState(false);

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex">
      <div
        className="flex-1"
        style={{ background: "rgba(14,12,11,0.7)" }}
        onClick={onClose}
      />
      <section className="w-full max-w-md bg-[var(--hb-dark-surface)] border-l border-[var(--hb-dark-border)]">
        <header className="px-6 py-5 flex items-center justify-between border-b border-[var(--hb-dark-border)]">
          <div>
            <p className="uppercase text-xs tracking-[0.35em] text-[var(--hb-sienna)]">
              Cart
            </p>
            <h2 className="font-serif text-2xl mt-1 text-[#faf8f4]">
              {itemCount === 0 ? "Empty" : `${itemCount} item${itemCount > 1 ? "s" : ""}`}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-xs uppercase tracking-[0.3em] text-[var(--hb-dark-muted)] hover:text-[#faf8f4] transition-colors"
          >
            Close
          </button>
        </header>
        <div className="max-h-[65vh] overflow-y-auto divide-y divide-[var(--hb-dark-border)]">
          {items.length === 0 ? (
            <p className="px-6 py-12 text-sm text-[var(--hb-dark-muted)] leading-relaxed">
              The drawer is quiet. Add a garment to begin your Hana-Bi study.
            </p>
          ) : (
            items.map((item) => (
              <article key={`${item.id}-${item.size}`} className="px-6 py-5 bg-[var(--hb-dark)]">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-serif text-lg text-[#faf8f4]">{item.name}</p>
                    <p className="text-xs uppercase tracking-[0.25em] text-[var(--hb-dark-muted)] mt-1">
                      Size {item.size}
                    </p>
                  </div>
                  <button
                    onClick={() => removeItem(item.id, item.size)}
                    className="text-xs uppercase tracking-[0.2em] text-[var(--hb-dark-muted)] hover:text-[#faf8f4] transition-colors"
                  >
                    Remove
                  </button>
                </div>
                <div className="flex items-center justify-between mt-4">
                  <span className="text-sm text-[var(--hb-sienna)]">{formatCurrency(item.price)}</span>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() =>
                        updateQuantity(item.id, item.size, Math.max(1, item.quantity - 1))
                      }
                      className="w-6 h-6 border border-[var(--hb-dark-border)] flex items-center justify-center text-[#faf8f4] hover:border-[var(--hb-sienna)] transition-colors"
                      aria-label="Decrease quantity"
                    >
                      –
                    </button>
                    <span className="text-sm w-6 text-center text-[#faf8f4]">{item.quantity}</span>
                    <button
                      onClick={() =>
                        updateQuantity(item.id, item.size, item.quantity + 1)
                      }
                      className="w-6 h-6 border border-[var(--hb-dark-border)] flex items-center justify-center text-[#faf8f4] hover:border-[var(--hb-sienna)] transition-colors"
                      aria-label="Increase quantity"
                    >
                      +
                    </button>
                  </div>
                </div>
              </article>
            ))
          )}
        </div>
        <footer className="px-6 py-5 border-t border-[var(--hb-dark-border)] space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-[var(--hb-dark-muted)]">Total</span>
            <span className="font-semibold text-[#faf8f4]">{formatCurrency(total)}</span>
          </div>
          <button
            onClick={async () => {
              setIsLoading(true);
              setCheckingOut(true);
              await handleCheckout(items, onClose);
              setIsLoading(false);
              setCheckingOut(false);
            }}
            disabled={items.length === 0 || isLoading}
            className="w-full py-3 bg-[var(--hb-sienna)] text-[#faf8f4] uppercase tracking-[0.3em] text-xs hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isLoading ? "Redirecting..." : "Checkout"}
          </button>
          {items.length > 0 && (
            <button
              onClick={clearCart}
              className="w-full text-xs uppercase tracking-[0.3em] text-[var(--hb-dark-muted)] hover:text-[#faf8f4] transition-colors"
            >
              Clear cart
            </button>
          )}
        </footer>
      </section>
    </div>
  );
}

