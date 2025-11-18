'use client';

import { PageShell } from "@/components/layout/PageShell";
import { formatCurrency } from "@/lib/utils";
import { useCartStore, useCartTotal } from "@/store/cart";
import Link from "next/link";

export default function CartPage() {
  const items = useCartStore((state) => state.items);
  const removeItem = useCartStore((state) => state.removeItem);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const clearCart = useCartStore((state) => state.clearCart);
  const total = useCartTotal();

  return (
    <PageShell
      eyebrow="Cart"
      title="Your current study."
      intro="This cart lives entirely on the client for now. It is set up via Zustand, so swapping in a real API session is straightforward."
    >
      <div className="space-y-8">
        <div className="border border-[var(--hb-border)] divide-y divide-[var(--hb-border)]">
          {items.length === 0 ? (
            <div className="p-6 text-sm text-[var(--hb-smoke)]">
              Nothing yet. Browse the{" "}
              <Link href="/shop" className="underline">
                shop
              </Link>{" "}
              or revisit the archive.
            </div>
          ) : (
            items.map((item) => (
              <article
                key={`${item.id}-${item.size}`}
                className="p-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between"
              >
                <div>
                  <p className="font-serif text-xl">{item.name}</p>
                  <p className="text-xs uppercase tracking-[0.3em] text-[var(--hb-smoke)]">
                    Size {item.size}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center border border-[var(--hb-border)]">
                    <button
                      onClick={() =>
                        updateQuantity(
                          item.id,
                          item.size,
                          Math.max(1, item.quantity - 1)
                        )
                      }
                      className="w-8 h-8"
                    >
                      –
                    </button>
                    <span className="w-10 text-center">{item.quantity}</span>
                    <button
                      onClick={() =>
                        updateQuantity(item.id, item.size, item.quantity + 1)
                      }
                      className="w-8 h-8"
                    >
                      +
                    </button>
                  </div>
                  <p>{formatCurrency(item.price * item.quantity)}</p>
                  <button
                    onClick={() => removeItem(item.id, item.size)}
                    className="text-xs uppercase tracking-[0.3em] text-[var(--hb-smoke)]"
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
              <span>Total</span>
              <span className="font-semibold">{formatCurrency(total)}</span>
            </div>
            <button className="w-full border border-[var(--hb-ink)] bg-[var(--hb-ink)] text-[var(--hb-paper)] uppercase tracking-[0.4em] px-6 py-4 text-xs">
              Checkout (coming soon)
            </button>
            <button
              onClick={clearCart}
              className="text-xs uppercase tracking-[0.3em] text-[var(--hb-smoke)]"
            >
              Clear cart
            </button>
          </div>
        )}
      </div>
    </PageShell>
  );
}

