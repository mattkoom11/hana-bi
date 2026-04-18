import Link from "next/link";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";

export default function NotFound() {
  return (
    <div className="relative min-h-screen flex flex-col bg-[var(--hb-dark)]">
      <SiteHeader />

      <main className="flex-1 flex items-center justify-center px-6 relative overflow-hidden">
        {/* Oversized background numeral */}
        <span
          aria-hidden="true"
          className="absolute select-none pointer-events-none"
          style={{
            fontFamily: "var(--hb-font-display)",
            fontSize: "clamp(12rem, 40vw, 28rem)",
            lineHeight: 1,
            color: "var(--hb-dark-kanji)",
            bottom: "-0.1em",
            right: "-0.05em",
            fontStyle: "italic",
            fontWeight: 300,
          }}
        >
          404
        </span>

        <div className="relative z-10 space-y-8 max-w-lg">
          <p
            className="uppercase text-xs tracking-[0.5em] opacity-60"
            style={{ fontFamily: "var(--hb-font-mono)", color: "var(--hb-sienna)" }}
          >
            HB — Page Not Found
          </p>
          <h1
            className="text-[#faf8f4] italic font-light leading-tight"
            style={{
              fontFamily: "var(--hb-font-display)",
              fontSize: "clamp(2.5rem, 6vw, 5rem)",
            }}
          >
            Lost to the archive.
          </h1>
          <p className="text-[var(--hb-dark-muted)] leading-relaxed">
            This page has been catalogued, folded, and filed somewhere unreachable.
            It may have never existed — or it may have passed through the shop and closed.
          </p>
          <div className="flex gap-4 flex-wrap pt-2">
            <Link
              href="/"
              className="bg-[var(--hb-sienna)] text-[#faf8f4] uppercase tracking-[0.4em] px-8 py-4 text-xs opacity-90 hover:opacity-100 transition-opacity"
              style={{ fontFamily: "var(--hb-font-mono)" }}
            >
              Return Home
            </Link>
            <Link
              href="/shop"
              className="border border-[var(--hb-dark-border)] text-[var(--hb-dark-muted)] uppercase tracking-[0.4em] px-8 py-4 text-xs hover:text-[#faf8f4] hover:border-[var(--hb-sienna)] transition-all duration-300"
              style={{ fontFamily: "var(--hb-font-mono)" }}
            >
              Browse Shop
            </Link>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
