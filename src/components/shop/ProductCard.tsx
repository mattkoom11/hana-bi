"use client";

/**
 * ProductCard — one image, one name, one price, one line. See
 * design/components/product-grid.md.
 *
 * A garment you are about to spend $640 on should be shown, not decorated —
 * every element the old card carried (tilt, shadow, sketch frame, margin
 * note, badges over the image) was competing with the photograph.
 */

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Product } from "@/data/products";
import { formatCurrency } from "@/lib/utils";

interface ProductCardProps {
  product: Product;
  variant?: "dark" | "light";
  catalogIndex?: number;
}

export function ProductCard({ product, variant = "dark", catalogIndex }: ProductCardProps) {
  const [broken, setBroken] = useState(false);
  const isDark = variant === "dark";
  const isAvailable = product.status === "available";

  const fg = isDark ? "var(--hb-on-dark)" : "var(--hb-ink)";
  const dim = isDark ? "var(--hb-dark-muted)" : "var(--hb-smoke)";
  const line = isDark ? "var(--hb-dark-border)" : "var(--hb-border)";

  const number =
    product.catalogNumber ??
    (catalogIndex !== undefined ? "HB-" + String(catalogIndex + 1).padStart(3, "0") : null);

  const statusLabel =
    product.status === "sold_out" ? "Sold Out" : product.status === "archived" ? "Archived" : "Available";

  return (
    <Link
      href={`/product/${product.slug}`}
      className="group"
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "1rem",
        opacity: 0.86,
        transition: "opacity 400ms ease",
      }}
    >
      <div
        className={isDark ? "hb-grain" : undefined}
        style={{
          position: "relative",
          width: "100%",
          aspectRatio: "4 / 5",
          overflow: "hidden",
          background: isDark ? "var(--hb-dark-surface)" : "var(--hb-paper-muted)",
        }}
      >
        {product.heroImage && !broken && (
          <Image
            src={product.heroImage}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            onError={() => setBroken(true)}
            style={{
              position: "absolute",
              inset: 0,
              objectFit: "cover",
              filter: isAvailable ? "none" : "grayscale(1)",
              transform: "scale(1)",
              transition: "transform 900ms var(--hb-ease-expo-out)",
            }}
            className="group-hover:scale-[1.03]"
          />
        )}
        {(broken || !product.heroImage) && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "flex-end",
              padding: "1rem",
            }}
          >
            <span
              style={{
                fontFamily: "var(--hb-font-mono)",
                fontSize: "var(--hb-label-2xs)",
                textTransform: "uppercase",
                color: dim,
              }}
            >
              {statusLabel} — image missing
            </span>
          </div>
        )}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
        {number && (
          <span
            style={{
              fontFamily: "var(--hb-font-mono)",
              fontSize: "var(--hb-label-3xs)",
              textTransform: "uppercase",
              letterSpacing: "var(--hb-track-catalog)",
              color: isDark ? "var(--hb-sienna)" : dim,
            }}
          >
            {number}
          </span>
        )}

        <span
          style={{
            fontFamily: "var(--hb-font-display)",
            fontStyle: "italic",
            fontWeight: 300,
            fontSize: "1.5rem",
            lineHeight: 1.2,
            color: fg,
          }}
        >
          {product.name}
        </span>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: "1rem",
            fontFamily: "var(--hb-font-mono)",
            fontSize: "0.75rem",
            textTransform: "uppercase",
            letterSpacing: "var(--hb-track-meta)",
            color: dim,
            borderTop: `1px solid ${line}`,
            paddingTop: "0.75rem",
          }}
        >
          <span>{product.sizes.join(" · ")}</span>
          <span style={isAvailable ? { color: fg } : undefined}>
            {isAvailable ? formatCurrency(product.price) : statusLabel}
          </span>
        </div>
      </div>
    </Link>
  );
}
