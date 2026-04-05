"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function ProductError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Product error:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[var(--hb-dark)] flex items-center justify-center px-4">
      <div className="max-w-md text-center space-y-6">
        <p
          className="text-xs uppercase tracking-[0.4em] opacity-60"
          style={{ fontFamily: "var(--hb-font-mono)", color: "var(--hb-sienna)" }}
        >
          Product
        </p>
        <h1
          className="text-4xl text-[#faf8f4] italic font-light"
          style={{ fontFamily: "var(--hb-font-display)" }}
        >
          Piece unavailable
        </h1>
        <p
          className="text-sm"
          style={{ fontFamily: "var(--hb-font-mono)", color: "var(--hb-dark-muted)" }}
        >
          This garment couldn&apos;t be loaded. It may have moved or the archive is temporarily unavailable.
        </p>
        <div className="flex gap-4 justify-center pt-2">
          <button
            onClick={reset}
            className="px-6 py-3 border border-[var(--hb-dark-border)] text-[var(--hb-dark-muted)] uppercase tracking-[0.3em] text-xs hover:text-[#faf8f4] hover:border-[var(--hb-sienna)] transition-all duration-300"
            style={{ fontFamily: "var(--hb-font-mono)" }}
          >
            Try again
          </button>
          <Link
            href="/shop"
            className="px-6 py-3 bg-[var(--hb-sienna)] text-[#faf8f4] uppercase tracking-[0.3em] text-xs hover:opacity-90 transition-opacity"
            style={{ fontFamily: "var(--hb-font-mono)" }}
          >
            Back to shop
          </Link>
        </div>
      </div>
    </div>
  );
}
