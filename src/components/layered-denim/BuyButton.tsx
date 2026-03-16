'use client';

import { motion } from "framer-motion";
import { useState } from "react";

interface BuyButtonProps {
  className?: string;
}

export function BuyButton({ className }: BuyButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCheckout = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      let data;
      try {
        data = await response.json();
      } catch (jsonError) {
        throw new Error("Invalid response from server");
      }

      if (!response.ok) {
        throw new Error(data.error || "Failed to create checkout session");
      }

      if (!data.url) {
        throw new Error("No checkout URL received");
      }

      // Redirect to Stripe Checkout
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

