"use client";

/**
 * ProductHeroBand — Band 1 of the product detail screen: imagery + sticky
 * buy panel. See design/screens/03-product.md.
 */

import { useState } from "react";
import { Badge } from "@/components/common/Badge";
import { ImageLightbox } from "@/components/common/ImageLightbox";
import { RoughBorderCard } from "@/components/layered-denim/RoughBorderCard";
import { StackedImageCarousel } from "@/components/product/StackedImageCarousel";
import { SizeGuideModal } from "@/components/product/SizeGuideModal";
import { AddToCartButton } from "@/components/shop/AddToCartButton";
import type { Product } from "@/data/products";

const MATERIALS_INFO = [
  {
    title: "Japanese Selvedge Denim",
    description:
      "Woven on traditional shuttle looms, creating a dense, durable fabric with distinctive edge characteristics.",
  },
  {
    title: "Indigo Character",
    description:
      "Deep, rich indigo that fades uniquely with wear. Each piece develops its own signature patterns over time.",
  },
  {
    title: "Hand Feel & Weight",
    description:
      "13.5oz range. Structured initially, the fabric softens with wear while maintaining integrity at key stress points.",
  },
];

const metaLabel: React.CSSProperties = {
  fontFamily: "var(--hb-font-mono)",
  fontSize: "0.75rem",
  letterSpacing: "var(--hb-track-meta)",
  textTransform: "uppercase",
  color: "var(--hb-dark-muted)",
  margin: "0 0 0.5rem",
};

interface ProductHeroBandProps {
  product: Product;
  catalogNumber: string;
}

export function ProductHeroBand({ product, catalogNumber }: ProductHeroBandProps) {
  const images = product.images && product.images.length ? product.images : [product.heroImage];
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [size, setSize] = useState<string | null>(null);

  const fullySoldOut =
    product.status === "available" &&
    product.sizes.length > 0 &&
    product.sizes.every((s) => product.soldSizes?.includes(s) ?? false);

  const statusLabel =
    product.status === "sold_out" || fullySoldOut
      ? "Sold Out"
      : product.status === "available"
        ? "Available"
        : "Archived";

  return (
    <section
      className="hb-grain"
      style={{ position: "relative", background: "rgba(14,12,11,0.85)", overflow: "hidden" }}
    >
      <div
        style={{
          position: "relative",
          zIndex: 10,
          padding: "4rem var(--hb-gutter)",
          maxWidth: "var(--hb-max-width)",
          margin: "0 auto",
        }}
      >
        <div
          style={{
            display: "grid",
            gap: "3rem",
            gridTemplateColumns: "1.3fr 0.7fr",
            alignItems: "start",
          }}
        >
          <div style={{ position: "relative" }}>
            <span
              aria-hidden="true"
              style={{
                position: "absolute",
                top: "1.5rem",
                right: "1.5rem",
                zIndex: 50,
                pointerEvents: "none",
                userSelect: "none",
                color: "var(--hb-dark-kanji)",
                fontSize: "8rem",
                lineHeight: 1,
                fontFamily: "var(--hb-font-kanji)",
              }}
            >
              花火
            </span>
            <div style={{ position: "absolute", top: "1.5rem", left: "1.5rem", zIndex: 50 }}>
              <Badge tone="sienna">{statusLabel}</Badge>
            </div>
            <StackedImageCarousel images={images} alt={product.name} onImageClick={setLightboxIndex} />
          </div>

          <div
            className="hb-grain"
            style={{
              position: "sticky",
              top: "5rem",
              background: "var(--hb-dark-surface)",
              padding: "1.5rem",
              border: "1px solid var(--hb-dark-border)",
            }}
          >
            <div style={{ position: "relative", zIndex: 10 }}>
              <p
                style={{
                  fontFamily: "var(--hb-font-mono)",
                  fontSize: "0.75rem",
                  letterSpacing: "var(--hb-track-catalog)",
                  textTransform: "uppercase",
                  opacity: 0.6,
                  color: "var(--hb-sienna)",
                  margin: 0,
                }}
              >
                {catalogNumber}
              </p>
              <h1
                style={{
                  fontFamily: "var(--hb-font-display)",
                  fontStyle: "italic",
                  fontWeight: 300,
                  fontSize: "2.25rem",
                  lineHeight: 1.15,
                  color: "var(--hb-on-dark)",
                  margin: "1rem 0 1.5rem",
                }}
              >
                {product.name}
              </h1>

              <p style={metaLabel}>Collection</p>
              <p
                style={{
                  fontFamily: "var(--hb-font-display)",
                  fontStyle: "italic",
                  fontWeight: 300,
                  fontSize: "1.125rem",
                  color: "var(--hb-on-dark)",
                  margin: "0 0 1.25rem",
                }}
              >
                {product.collection}
              </p>

              <p style={metaLabel}>Year</p>
              <p
                style={{
                  fontFamily: "var(--hb-font-mono)",
                  fontSize: "0.875rem",
                  color: "var(--hb-dark-muted)",
                  margin: "0 0 1.25rem",
                }}
              >
                {product.year}
              </p>

              <p style={metaLabel}>Size</p>
              <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginBottom: "1rem" }}>
                {product.sizes.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSize(s)}
                    style={{
                      padding: "0.5rem 1rem",
                      fontSize: "0.875rem",
                      cursor: "pointer",
                      borderRadius: 0,
                      fontFamily: "var(--hb-font-mono)",
                      transition: "all 300ms ease",
                      ...(size === s
                        ? { background: "var(--hb-on-dark)", color: "var(--hb-ink)", border: "1px solid var(--hb-on-dark)" }
                        : { background: "transparent", color: "var(--hb-on-dark)", border: "1px solid rgba(250,248,244,0.5)" }),
                    }}
                  >
                    {s}
                  </button>
                ))}
              </div>

              <div style={{ background: "var(--hb-paper)", padding: "0.75rem 1rem", marginBottom: "1.25rem", display: "inline-block" }}>
                <SizeGuideModal />
              </div>

              <AddToCartButton product={product} selectedSize={size} />

              <p style={{ ...metaLabel, marginTop: "1.5rem" }}>Tags</p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginBottom: "1.25rem" }}>
                {product.tags.map((tag) => (
                  <span
                    key={tag}
                    style={{
                      fontFamily: "var(--hb-font-mono)",
                      fontSize: "0.75rem",
                      textTransform: "uppercase",
                      letterSpacing: "var(--hb-track-tag)",
                      border: "1px dashed var(--hb-dark-border)",
                      padding: "0.375rem 0.75rem",
                      color: "var(--hb-dark-muted)",
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                {MATERIALS_INFO.map((m) => (
                  <RoughBorderCard key={m.title} className="p-4 bg-[var(--hb-dark-surface)]" hover={false}>
                    <h3
                      style={{
                        fontFamily: "var(--hb-font-serif)",
                        fontSize: "1rem",
                        margin: "0 0 0.25rem",
                        color: "var(--hb-on-dark)",
                      }}
                    >
                      {m.title}
                    </h3>
                    <p style={{ fontSize: "0.75rem", lineHeight: 1.7, color: "var(--hb-dark-muted)", margin: 0 }}>
                      {m.description}
                    </p>
                  </RoughBorderCard>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {lightboxIndex !== null && (
        <ImageLightbox
          images={images}
          initialIndex={lightboxIndex}
          alt={product.name}
          onClose={() => setLightboxIndex(null)}
        />
      )}
    </section>
  );
}
