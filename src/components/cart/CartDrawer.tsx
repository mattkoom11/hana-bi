"use client";

/**
 * CartDrawer — shares vocabulary with the cart page ledger: hairline rules,
 * no per-row fills, unboxed steppers, tabular figures, one filled element
 * (checkout). See design/components/cart-and-drawer.md.
 */

import { startCheckoutSession } from "@/lib/checkout-client";
import { formatCurrency } from "@/lib/utils";
import { useCartCount, useCartStore, useCartTotal } from "@/store/cart";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

interface CartDrawerProps {
  open: boolean;
  onClose: () => void;
}

const mono: React.CSSProperties = { fontFamily: "var(--hb-font-mono)" };
const meta: React.CSSProperties = {
  ...mono,
  fontSize: "0.75rem",
  textTransform: "uppercase",
  letterSpacing: "var(--hb-track-meta)",
  color: "var(--hb-dark-muted)",
};
const num: React.CSSProperties = { ...mono, fontVariantNumeric: "tabular-nums" };
const bare: React.CSSProperties = { background: "none", border: "none", padding: 0, cursor: "pointer" };
const line = "1px solid var(--hb-dark-border)";

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
        <div style={{ position: "fixed", inset: 0, zIndex: 50, display: "flex" }}>
          <motion.div
            key="backdrop"
            style={{ flex: 1, background: "var(--overlay-modal)" }}
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
            className="hb-grain"
            style={{
              width: "100%",
              maxWidth: "28rem",
              background: "var(--hb-dark-surface)",
              borderLeft: "1px solid var(--hb-dark-border)",
              display: "flex",
              flexDirection: "column",
              boxShadow: "var(--hb-shadow-drawer)",
            }}
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 280 }}
          >
            <header
              style={{
                padding: "1.25rem 1.5rem",
                borderBottom: line,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div>
                <p style={{ ...mono, fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.35em", color: "var(--hb-sienna)", opacity: 0.7, margin: 0 }}>
                  Cart
                </p>
                <h2
                  style={{
                    fontFamily: "var(--hb-font-display)",
                    fontStyle: "italic",
                    fontWeight: 300,
                    fontSize: "1.5rem",
                    color: "var(--hb-on-dark)",
                    marginTop: "0.25rem",
                  }}
                >
                  {itemCount === 0 ? "Empty" : `${itemCount} item${itemCount > 1 ? "s" : ""}`}
                </h2>
              </div>
              <button
                ref={closeButtonRef}
                type="button"
                onClick={onClose}
                style={{ ...meta, display: "flex", alignItems: "center", justifyContent: "center", minHeight: 44, minWidth: 44 }}
              >
                Close
              </button>
            </header>

            <div style={{ maxHeight: "65%", overflowY: "auto", flex: 1 }}>
              {items.length === 0 ? (
                <div style={{ padding: "3rem 1.5rem" }}>
                  <p
                    style={{
                      fontFamily: "var(--hb-font-display)",
                      fontStyle: "italic",
                      fontWeight: 300,
                      fontSize: "1.5rem",
                      lineHeight: 1.45,
                      color: "var(--hb-on-dark)",
                      margin: 0,
                    }}
                  >
                    Nothing yet.
                  </p>
                  <Link
                    href="/shop"
                    onClick={onClose}
                    style={{
                      display: "inline-flex",
                      minHeight: 44,
                      alignItems: "center",
                      marginTop: "1.5rem",
                      ...meta,
                      color: "var(--hb-sienna)",
                      borderBottom: "1px solid currentColor",
                      paddingBottom: "0.35rem",
                    }}
                  >
                    Browse the shop
                  </Link>
                </div>
              ) : (
                items.map((item) => (
                  <div key={item.id + "-" + item.size} style={{ padding: "1.5rem", borderTop: line }}>
                    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "1rem" }}>
                      <div style={{ minWidth: 0 }}>
                        <p style={{ fontFamily: "var(--hb-font-display)", fontStyle: "italic", fontWeight: 300, fontSize: "1.125rem", lineHeight: 1.35, color: "var(--hb-on-dark)", margin: 0 }}>
                          {item.name}
                        </p>
                        <p style={{ ...mono, fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.25em", color: "var(--hb-dark-muted)", marginTop: "0.25rem" }}>
                          Size {item.size}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeItem(item.id, item.size)}
                        aria-label={`Remove ${item.name}`}
                        style={{ ...bare, ...meta, minHeight: 44, minWidth: 44, flexShrink: 0, opacity: 0.7 }}
                      >
                        Remove
                      </button>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "0.75rem", gap: "1rem" }}>
                      <div style={{ display: "flex", alignItems: "center", marginLeft: "-0.75rem" }}>
                        <button
                          type="button"
                          aria-label="Decrease quantity"
                          onClick={() => updateQuantity(item.id, item.size, Math.max(1, item.quantity - 1))}
                          style={{ ...bare, width: 44, height: 44, color: "var(--hb-on-dark)", display: "flex", alignItems: "center", justifyContent: "center" }}
                        >
                          –
                        </button>
                        <span style={{ ...num, width: 40, textAlign: "center", fontSize: "0.875rem", color: "var(--hb-on-dark)" }}>
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          aria-label="Increase quantity"
                          onClick={() => updateQuantity(item.id, item.size, item.quantity + 1)}
                          style={{ ...bare, width: 44, height: 44, color: "var(--hb-on-dark)", display: "flex", alignItems: "center", justifyContent: "center" }}
                        >
                          +
                        </button>
                      </div>
                      <span style={{ ...num, fontSize: "0.875rem", color: "var(--hb-on-dark)", flexShrink: 0 }}>
                        {formatCurrency(item.price * item.quantity)}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>

            {items.length > 0 && (
              <footer style={{ padding: "1.25rem 1.5rem", borderTop: line, display: "flex", flexDirection: "column", gap: "1rem" }}>
                {checkoutError && (
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
                    {checkoutError}
                  </div>
                )}
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={meta}>Total</span>
                  <span style={{ ...num, fontSize: "1rem", color: "var(--hb-on-dark)" }}>{formatCurrency(total)}</span>
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
                      setCheckoutError(result.message || "Checkout couldn't start. Please try again.");
                      toast.error("Checkout couldn't start", { description: result.message });
                    }
                  }}
                  disabled={isLoading}
                  style={{
                    width: "100%",
                    background: "var(--hb-sienna)",
                    color: "var(--hb-on-dark)",
                    textTransform: "uppercase",
                    letterSpacing: "var(--hb-track-nav)",
                    padding: "1rem 1.5rem",
                    fontSize: "0.75rem",
                    border: "none",
                    borderRadius: 0,
                    cursor: isLoading ? "not-allowed" : "pointer",
                    opacity: isLoading ? 0.4 : 1,
                    transition: "opacity 300ms ease",
                    ...mono,
                  }}
                >
                  {isLoading ? "Redirecting…" : "Checkout"}
                </button>
                <button type="button" onClick={clearCart} style={{ ...bare, ...meta, width: "100%" }}>
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
