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
            fontSize: "clamp(12rem, 38vw, 26rem)",
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

        <div className="relative z-10 max-w-lg" style={{ maxWidth: "32rem" }}>
          <p
            className="uppercase text-xs opacity-60"
            style={{
              fontFamily: "var(--hb-font-mono)",
              letterSpacing: "var(--hb-track-eyebrow)",
              color: "var(--hb-sienna)",
              margin: 0,
            }}
          >
            HB — Page Not Found
          </p>
          <h1
            className="italic font-light"
            style={{
              fontFamily: "var(--hb-font-display)",
              fontSize: "clamp(2.25rem, 5vw, 4rem)",
              lineHeight: 1.15,
              margin: "2rem 0",
              color: "#faf8f4",
            }}
          >
            Lost to the archive.
          </h1>
          <p style={{ color: "var(--hb-dark-muted)", lineHeight: 1.7, margin: "0 0 2rem" }}>
            This page has been catalogued, folded, and filed somewhere unreachable.
            It may have never existed — or it may have passed through the shop and closed.
          </p>
          <div className="flex gap-4 flex-wrap pt-2">
            <Link
              href="/"
              className="uppercase px-8 py-4 text-xs opacity-90 hover:opacity-100 transition-opacity"
              style={{
                fontFamily: "var(--hb-font-mono)",
                letterSpacing: "var(--hb-track-nav)",
                background: "var(--hb-sienna)",
                color: "var(--hb-on-dark)",
              }}
            >
              Return Home
            </Link>
            <Link
              href="/shop"
              className="uppercase px-8 py-4 text-xs transition-all duration-300"
              style={{
                fontFamily: "var(--hb-font-mono)",
                letterSpacing: "var(--hb-track-nav)",
                border: "1px solid var(--hb-dark-border)",
                color: "var(--hb-dark-muted)",
              }}
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
