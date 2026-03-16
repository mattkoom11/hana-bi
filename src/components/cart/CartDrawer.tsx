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
          price: Math.round(item.price * 100), // convert dollars to cents
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
        className="flex-1 bg-black/30 backdrop-blur-[1px]"
        onClick={onClose}
      />
      <section className="w-full max-w-md bg-[var(--hb-paper)] border-l border-[var(--hb-border)]">
        <header className="px-6 py-5 flex items-center justify-between border-b border-[var(--hb-border)]">
          <div>
            <p className="uppercase text-xs tracking-[0.35em] text-[var(--hb-smoke)]">
              Cart
            </p>
            <h2 className="font-serif text-2xl mt-1">
              {itemCount === 0 ? "Empty" : `${itemCount} item${itemCount > 1 ? "s" : ""}`}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-xs uppercase tracking-[0.3em] text-[var(--hb-smoke)] hover:text-[var(--hb-ink)]"
          >
            Close
          </button>
        </header>
        <div className="max-h-[65vh] overflow-y-auto divide-y divide-[var(--hb-border)]">
          {items.length === 0 ? (
            <p className="px-6 py-12 text-sm text-[var(--hb-smoke)] leading-relaxed">
              The drawer is quiet. Add a garment to begin your Hana-Bi study.
            </p>
          ) : (
            items.map((item) => (
              <article key={`${item.id}-${item.size}`} className="px-6 py-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-serif text-lg">{item.name}</p>
                    <p className="text-xs uppercase tracking-[0.25em] text-[var(--hb-smoke)] mt-1">
                      Size {item.size}
                    </p>
                  </div>
                  <button
                    onClick={() => removeItem(item.id, item.size)}
                    className="text-xs uppercase tracking-[0.2em] text-[var(--hb-smoke)] hover:text-[var(--hb-ink)]"
                  >
                    Remove
                  </button>
                </div>
                <div className="flex items-center justify-between mt-4">
                  <span className="text-sm">{formatCurrency(item.price)}</span>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() =>
                        updateQuantity(
                          item.id,
                          item.size,
                          Math.max(1, item.quantity - 1)
                        )
                      }
                      className="w-6 h-6 border border-[var(--hb-border)] flex items-center justify-center"
                      aria-label="Decrease quantity"
                    >
                      –
                    </button>
                    <span className="text-sm w-6 text-center">{item.quantity}</span>
                    <button
                      onClick={() =>
                        updateQuantity(item.id, item.size, item.quantity + 1)
                      }
                      className="w-6 h-6 border border-[var(--hb-border)] flex items-center justify-center"
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
        <footer className="px-6 py-5 border-t border-[var(--hb-border)] space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span>Total</span>
            <span className="font-semibold">{formatCurrency(total)}</span>
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
            className="w-full py-3 border border-[var(--hb-ink)] bg-[var(--hb-ink)] text-[var(--hb-paper)] uppercase tracking-[0.3em] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Redirecting..." : "Checkout"}
          </button>
          {items.length > 0 && (
            <button
              onClick={clearCart}
              className="w-full text-xs uppercase tracking-[0.3em] text-[var(--hb-smoke)]"
            >
              Clear cart
            </button>
          )}
        </footer>
      </section>
    </div>
  );
}

