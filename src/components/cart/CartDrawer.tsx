"use client";

import { formatCurrency } from "@/lib/utils";
import {
  useCartCount,
  useCartStore,
  useCartTotal,
  type CartItem,
} from "@/store/cart";
import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

interface CartDrawerProps {
  open: boolean;
  onClose: () => void;
}

async function handleCheckout(items: CartItem[], onClose: () => void) {
  if (items.length === 0) return;

  const missingPrice = items.find((item) => !item.stripePriceId);
  if (missingPrice) {
    alert(`"${missingPrice.name}" has no Stripe price ID. Please configure products in the Stripe Dashboard.`);
    return;
  }

  try {
    const response = await fetch('/api/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        items: items.map((item) => ({
          priceId: item.stripePriceId!,
          quantity: item.quantity,
        })),
        cancelUrl: `${window.location.origin}/cart`,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create checkout');
    }

    const { url } = await response.json();
    onClose();
    window.location.href = url;
  } catch (error) {
    console.error('Checkout error:', error);
    alert(
      error instanceof Error
        ? error.message
        : 'Failed to start checkout. Please try again.'
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

  return (
    <Sheet open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <SheetContent
        side="right"
        className="grain w-full max-w-md p-0 gap-0 bg-[var(--hb-dark-surface)] border-l border-[var(--hb-dark-border)] [&>button]:hidden"
      >
        <SheetHeader className="px-6 py-5 flex-row items-center justify-between border-b border-[var(--hb-dark-border)] space-y-0">
          <div>
            <p
              className="uppercase text-xs tracking-[0.35em] opacity-70"
              style={{ fontFamily: "var(--hb-font-mono)", color: "var(--hb-sienna)" }}
            >
              Cart
            </p>
            <SheetTitle
              className="text-2xl mt-1 text-[#faf8f4] italic font-light border-none"
              style={{ fontFamily: "var(--hb-font-display)" }}
            >
              {itemCount === 0 ? "Empty" : `${itemCount} item${itemCount > 1 ? "s" : ""}`}
            </SheetTitle>
          </div>
          <button
            onClick={onClose}
            className="flex items-center justify-center min-h-[44px] min-w-[44px] text-xs uppercase tracking-[0.3em] text-[var(--hb-dark-muted)] hover:text-[#faf8f4] transition-colors"
            style={{ fontFamily: "var(--hb-font-mono)" }}
          >
            Close
          </button>
        </SheetHeader>

        <div className="max-h-[65vh] overflow-y-auto divide-y divide-[var(--hb-dark-border)]">
          {items.length === 0 ? (
            <p
              className="px-6 py-12 text-sm text-[var(--hb-dark-muted)] leading-relaxed"
              style={{ fontFamily: "var(--hb-font-mono)" }}
            >
              The drawer is quiet. Add a garment to begin your Hana-Bi study.
            </p>
          ) : (
            items.map((item) => (
              <article
                key={`${item.id}-${item.size}`}
                className="px-6 py-5 bg-[var(--hb-dark)]"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p
                      className="text-lg text-[#faf8f4] italic font-light"
                      style={{ fontFamily: "var(--hb-font-display)" }}
                    >
                      {item.name}
                    </p>
                    <p
                      className="text-xs uppercase tracking-[0.25em] mt-1"
                      style={{ fontFamily: "var(--hb-font-mono)", color: "var(--hb-dark-muted)" }}
                    >
                      Size {item.size}
                    </p>
                  </div>
                  <button
                    onClick={() => removeItem(item.id, item.size)}
                    className="text-xs uppercase tracking-[0.3em] text-[var(--hb-dark-muted)] hover:text-[#faf8f4] transition-colors"
                    style={{ fontFamily: "var(--hb-font-mono)" }}
                  >
                    ×
                  </button>
                </div>
                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center border border-[var(--hb-dark-border)]">
                    <button
                      onClick={() => updateQuantity(item.id, item.size, Math.max(1, item.quantity - 1))}
                      className="w-11 h-11 text-[#faf8f4] flex items-center justify-center"
                      style={{ fontFamily: "var(--hb-font-mono)" }}
                    >
                      –
                    </button>
                    <span
                      className="w-10 text-center text-[#faf8f4] text-sm self-center"
                      style={{ fontFamily: "var(--hb-font-mono)" }}
                    >
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.id, item.size, item.quantity + 1)}
                      className="w-11 h-11 text-[#faf8f4] flex items-center justify-center"
                      style={{ fontFamily: "var(--hb-font-mono)" }}
                    >
                      +
                    </button>
                  </div>
                  <span
                    className="text-sm"
                    style={{ fontFamily: "var(--hb-font-mono)", color: "var(--hb-sienna)" }}
                  >
                    {formatCurrency(item.price * item.quantity)}
                  </span>
                </div>
              </article>
            ))
          )}
        </div>

        {items.length > 0 && (
          <footer className="px-6 py-5 border-t border-[var(--hb-dark-border)] space-y-4">
            <div className="flex items-center justify-between">
              <span
                className="text-xs uppercase tracking-[0.3em]"
                style={{ fontFamily: "var(--hb-font-mono)", color: "var(--hb-dark-muted)" }}
              >
                Total
              </span>
              <span
                className="text-base text-[#faf8f4]"
                style={{ fontFamily: "var(--hb-font-mono)" }}
              >
                {formatCurrency(total)}
              </span>
            </div>
            <button
              onClick={async () => {
                setIsLoading(true);
                setCheckingOut(true);
                await handleCheckout(items, onClose);
                setIsLoading(false);
                setCheckingOut(false);
              }}
              disabled={isLoading}
              className="w-full bg-[var(--hb-sienna)] text-[#faf8f4] uppercase tracking-[0.4em] px-6 py-4 text-xs hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ fontFamily: "var(--hb-font-mono)" }}
            >
              {isLoading ? "Redirecting..." : "Checkout"}
            </button>
            <button
              onClick={clearCart}
              className="w-full text-xs uppercase tracking-[0.3em] text-[var(--hb-dark-muted)] hover:text-[#faf8f4] transition-colors"
              style={{ fontFamily: "var(--hb-font-mono)" }}
            >
              Clear cart
            </button>
          </footer>
        )}
      </SheetContent>
    </Sheet>
  );
}
