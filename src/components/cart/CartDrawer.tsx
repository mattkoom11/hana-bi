"use client";

import { startCheckoutSession } from "@/lib/checkout-client";
import { formatCurrency } from "@/lib/utils";
import {
  useCartCount,
  useCartStore,
  useCartTotal,
} from "@/store/cart";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

interface CartDrawerProps {
  open: boolean;
  onClose: () => void;
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
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) setCheckoutError(null);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  useEffect(() => {
    if (open) closeButtonRef.current?.focus();
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex">
          <motion.div
            key="backdrop"
            className="flex-1"
            style={{ background: "rgba(14,12,11,0.7)" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            aria-hidden="true"
          />

          <motion.section
            key="panel"
            role="dialog"
            aria-modal="true"
            aria-label="Shopping cart"
            className="grain w-full max-w-md bg-[var(--hb-dark-surface)] border-l border-[var(--hb-dark-border)] flex flex-col shadow-2xl shadow-black/40"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 280 }}
          >
            <header className="px-6 py-5 flex items-center justify-between border-b border-[var(--hb-dark-border)]">
              <div>
                <p
                  className="uppercase text-xs tracking-[0.35em] opacity-70"
                  style={{ fontFamily: "var(--hb-font-mono)", color: "var(--hb-sienna)" }}
                >
                  Cart
                </p>
                <h2
                  className="text-2xl mt-1 text-[#faf8f4] italic font-light"
                  style={{ fontFamily: "var(--hb-font-display)" }}
                >
                  {itemCount === 0 ? "Empty" : `${itemCount} item${itemCount > 1 ? "s" : ""}`}
                </h2>
              </div>
              <button
                ref={closeButtonRef}
                type="button"
                onClick={onClose}
                className="flex items-center justify-center min-h-[44px] min-w-[44px] text-xs uppercase tracking-[0.3em] text-[var(--hb-dark-muted)] hover:text-[#faf8f4] transition-colors"
                style={{ fontFamily: "var(--hb-font-mono)" }}
              >
                Close
              </button>
            </header>

            <div className="max-h-[65vh] overflow-y-auto divide-y divide-[var(--hb-dark-border)]">
              {items.length === 0 ? (
                <div className="px-6 py-14 text-center space-y-6">
                  <p
                    className="text-sm text-[var(--hb-dark-muted)] leading-relaxed max-w-[22rem] mx-auto"
                    style={{ fontFamily: "var(--hb-font-mono)" }}
                  >
                    The drawer is quiet. Add a garment from the shop to begin your Hana-Bi study.
                  </p>
                  <Link
                    href="/shop"
                    onClick={onClose}
                    className="inline-flex items-center justify-center border border-[var(--hb-sienna)]/60 px-5 py-3 text-xs uppercase tracking-[0.35em] text-[var(--hb-sienna)] hover:bg-[var(--hb-sienna)]/10 transition-colors"
                    style={{ fontFamily: "var(--hb-font-mono)" }}
                  >
                    Browse the collection
                  </Link>
                </div>
              ) : (
                items.map((item) => (
                  <article
                    key={`${item.id}-${item.size}`}
                    className="px-6 py-5 bg-[var(--hb-dark)]"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <p
                          className="text-lg text-[#faf8f4] italic font-light leading-snug"
                          style={{ fontFamily: "var(--hb-font-display)" }}
                        >
                          {item.name}
                        </p>
                        <p
                          className="text-xs uppercase tracking-[0.25em] mt-1"
                          style={{
                            fontFamily: "var(--hb-font-mono)",
                            color: "var(--hb-dark-muted)",
                          }}
                        >
                          Size {item.size}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeItem(item.id, item.size)}
                        aria-label={`Remove ${item.name}`}
                        className="shrink-0 text-xs uppercase tracking-[0.3em] text-[var(--hb-dark-muted)] hover:text-[#faf8f4] transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                        style={{ fontFamily: "var(--hb-font-mono)" }}
                      >
                        ×
                      </button>
                    </div>
                    <div className="flex items-center justify-between mt-3 gap-4">
                      <div className="flex items-center border border-[var(--hb-dark-border)]">
                        <button
                          type="button"
                          onClick={() =>
                            updateQuantity(item.id, item.size, Math.max(1, item.quantity - 1))
                          }
                          aria-label="Decrease quantity"
                          className="w-11 h-11 text-[#faf8f4] flex items-center justify-center hover:bg-[var(--hb-dark-surface)] transition-colors"
                          style={{ fontFamily: "var(--hb-font-mono)" }}
                        >
                          –
                        </button>
                        <span
                          className="w-10 text-center text-[#faf8f4] text-sm self-center tabular-nums"
                          style={{ fontFamily: "var(--hb-font-mono)" }}
                        >
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            updateQuantity(item.id, item.size, item.quantity + 1)
                          }
                          aria-label="Increase quantity"
                          className="w-11 h-11 text-[#faf8f4] flex items-center justify-center hover:bg-[var(--hb-dark-surface)] transition-colors"
                          style={{ fontFamily: "var(--hb-font-mono)" }}
                        >
                          +
                        </button>
                      </div>
                      <span
                        className="text-sm tabular-nums shrink-0"
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
                {checkoutError && (
                  <div
                    role="alert"
                    className="border border-[var(--hb-sienna)]/45 bg-[var(--hb-sienna)]/[0.08] px-4 py-3 text-[0.7rem] uppercase tracking-[0.2em] text-[#faf8f4]/90 leading-relaxed"
                    style={{ fontFamily: "var(--hb-font-mono)" }}
                  >
                    {checkoutError}
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span
                    className="text-xs uppercase tracking-[0.3em]"
                    style={{ fontFamily: "var(--hb-font-mono)", color: "var(--hb-dark-muted)" }}
                  >
                    Total
                  </span>
                  <span
                    className="text-base text-[#faf8f4] tabular-nums"
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
                    const result = await startCheckoutSession(items, onClose);
                    setIsLoading(false);
                    setCheckingOut(false);
                    if (!result.ok) {
                      setCheckoutError(result.message);
                      toast.error("Checkout couldn’t start", {
                        description: result.message,
                      });
                    }
                  }}
                  disabled={isLoading}
                  className="w-full bg-[var(--hb-sienna)] text-[#faf8f4] uppercase tracking-[0.4em] px-6 py-4 text-xs hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{ fontFamily: "var(--hb-font-mono)" }}
                >
                  {isLoading ? "Redirecting…" : "Checkout"}
                </button>
                <button
                  type="button"
                  onClick={clearCart}
                  className="w-full text-xs uppercase tracking-[0.3em] text-[var(--hb-dark-muted)] hover:text-[#faf8f4] transition-colors"
                  style={{ fontFamily: "var(--hb-font-mono)" }}
                >
                  Clear cart
                </button>
              </footer>
            )}
          </motion.section>
        </div>
      )}
    </AnimatePresence>
  );
}
