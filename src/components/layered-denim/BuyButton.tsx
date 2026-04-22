'use client';

import { motion } from "framer-motion";
import { useState } from "react";

const SIZES = ["28", "29", "30", "31", "32", "33", "34", "35", "36"] as const;
type Size = typeof SIZES[number];

interface BuyButtonProps {
  className?: string;
  price?: number; // price in dollars, e.g. 198
}

export function BuyButton({ className, price = 198 }: BuyButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<Size | null>(null);

  const handleCheckout = async () => {
    if (!selectedSize) {
      setError("Please select a size before continuing.");
      return;
    }
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: [
            {
              name: `Layered Denim — Size ${selectedSize}`,
              price: Math.round(price * 100),
              quantity: 1,
            },
          ],
          cancelUrl: `${window.location.origin}/layered-denim`,
        }),
      });

      let data;
      try {
        data = await response.json();
      } catch {
        throw new Error("Invalid response from server");
      }

      if (!response.ok) {
        throw new Error(data.error || "Failed to create checkout session");
      }

      if (!data.url) {
        throw new Error("No checkout URL received");
      }

      window.location.href = data.url;
    } catch (err) {
      console.error("Checkout error:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again."
      );
      setLoading(false);
    }
  };

  return (
    <div className={className}>
      <div className="mb-4 space-y-2">
        <p className="text-xs tracking-[0.3em] uppercase" style={{ fontFamily: "var(--hb-font-mono)", color: "var(--hb-dark-muted)" }}>
          Size
        </p>
        <div className="flex gap-2 flex-wrap">
          {SIZES.map((size) => (
            <button
              key={size}
              type="button"
              onClick={() => { setSelectedSize(size); setError(null); }}
              className={`px-4 py-2 text-sm border transition-colors ${
                selectedSize === size
                  ? "bg-[var(--hb-ink)] text-[var(--hb-paper)] border-[var(--hb-ink)]"
                  : "bg-transparent text-[var(--hb-ink)] border-[var(--hb-ink)] hover:bg-[var(--hb-ink)] hover:text-[var(--hb-paper)]"
              }`}
              style={{ fontFamily: "var(--hb-font-mono)" }}
            >
              {size}
            </button>
          ))}
        </div>
      </div>

      <motion.button
        onClick={handleCheckout}
        disabled={loading}
        whileHover={!loading ? { scale: 1.02, rotate: 0.5 } : {}}
        whileTap={!loading ? { scale: 0.98 } : {}}
        className="w-full py-4 bg-[var(--hb-ink)] text-[var(--hb-paper)] rounded-2xl font-serif text-lg hover:bg-[var(--hb-ink-light)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {loading ? "Processing..." : "Buy Layered Denim"}
      </motion.button>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-3 p-3 bg-red-50 border border-red-200 rounded-xl"
        >
          <p className="text-sm text-red-600 font-script">{error}</p>
          <button
            onClick={() => setError(null)}
            className="mt-2 text-xs text-red-600 hover:text-red-800 underline"
          >
            Dismiss
          </button>
        </motion.div>
      )}
    </div>
  );
}
