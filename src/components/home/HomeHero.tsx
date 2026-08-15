"use client";

/**
 * HomeHero — Act 1 of the homepage. See design/screens/01-home.md.
 * A client component only for the CTA hover state; everything else here
 * could be static.
 */

import { useState } from "react";
import Link from "next/link";
import { SplitText } from "@/components/common/SplitText";

export function HomeHero() {
  const [hovered, setHovered] = useState<string | null>(null);

  return (
    <section
      style={{
        minHeight: "76vh",
        display: "flex",
        alignItems: "center",
        padding: "4rem var(--hb-gutter)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <span
        aria-hidden="true"
        style={{
          position: "absolute",
          bottom: 0,
          right: "-0.02em",
          userSelect: "none",
          pointerEvents: "none",
          fontFamily: "var(--hb-font-kanji)",
          fontSize: "clamp(9rem, 26vw, 22rem)",
          lineHeight: 0.9,
          color: "var(--hb-dark-kanji)",
        }}
      >
        花火
      </span>

      <div style={{ position: "relative", zIndex: 2, maxWidth: "58rem" }}>
        <p
          style={{
            fontFamily: "var(--hb-font-mono)",
            fontSize: "0.75rem",
            textTransform: "uppercase",
            letterSpacing: "var(--hb-track-eyebrow)",
            color: "var(--hb-sienna)",
            margin: 0,
          }}
        >
          HB — Editions of Denim
        </p>
        <h1
          style={{
            fontFamily: "var(--hb-font-display)",
            fontStyle: "italic",
            fontWeight: 300,
            fontSize: "var(--hb-display-hero)",
            lineHeight: "var(--hb-display-leading-hero)",
            letterSpacing: "var(--hb-display-tracking)",
            color: "var(--hb-on-dark)",
            margin: "2.5rem 0",
            textWrap: "balance",
          }}
        >
          <SplitText tag="span" charDelay={35}>
            Archival garments documented like museum pieces.
          </SplitText>
        </h1>
        <p
          style={{
            fontSize: "var(--hb-body-lg)",
            lineHeight: 1.7,
            color: "var(--hb-dark-muted)",
            maxWidth: "34rem",
            margin: 0,
          }}
        >
          Hana-Bi traces Japanese magazine spreads and gothic annotations to tell the
          story of sustainable denim. Limited drops move swiftly from studio floor to
          archive shelves.
        </p>
        <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", paddingTop: "2.5rem" }}>
          <Link
            href="/shop"
            onMouseEnter={() => setHovered("shop")}
            onMouseLeave={() => setHovered(null)}
            style={{
              fontFamily: "var(--hb-font-mono)",
              fontSize: "0.75rem",
              textTransform: "uppercase",
              letterSpacing: "var(--hb-track-nav)",
              padding: "1rem 2rem",
              transition: "opacity 300ms ease, border-color 300ms ease, color 300ms ease",
              background: "var(--hb-sienna)",
              color: "var(--hb-on-dark)",
              opacity: hovered === "shop" ? 1 : 0.9,
            }}
          >
            Enter Shop
          </Link>
          <Link
            href="/about"
            onMouseEnter={() => setHovered("about")}
            onMouseLeave={() => setHovered(null)}
            style={{
              fontFamily: "var(--hb-font-mono)",
              fontSize: "0.75rem",
              textTransform: "uppercase",
              letterSpacing: "var(--hb-track-nav)",
              padding: "1rem 2rem",
              transition: "opacity 300ms ease, border-color 300ms ease, color 300ms ease",
              border: `1px solid ${hovered === "about" ? "var(--hb-sienna)" : "var(--hb-dark-border)"}`,
              color: hovered === "about" ? "var(--hb-on-dark)" : "var(--hb-dark-muted)",
            }}
          >
            What is Hana-Bi?
          </Link>
        </div>
      </div>
    </section>
  );
}
