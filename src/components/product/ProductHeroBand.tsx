"use client";

/**
 * ProductHeroBand — Band 1 of the product detail screen: imagery + sticky
 * buy panel. See design/screens/03-product.md.
 *
 * Status is carried by the image (greyscale when not buyable) and a mono
 * label, never a coloured badge. The panel is bare type on hairlines — the
 * only filled element is the add-to-cart action.
 */

import { useState } from "react";
import { ImageLightbox } from "@/components/common/ImageLightbox";
import { StackedImageCarousel } from "@/components/product/StackedImageCarousel";
import { SizeGuideModal } from "@/components/product/SizeGuideModal";
import { AddToCartButton } from "@/components/shop/AddToCartButton";
import type { Product } from "@/data/products";

const metaLabel: React.CSSProperties = {
  fontFamily: "var(--hb-font-mono)",
  fontSize: "0.65rem",
  letterSpacing: "var(--hb-track-meta)",
  textTransform: "uppercase",
  color: "var(--hb-dark-muted)",
  margin: "0 0 0.5rem",
};

const line = "1px solid var(--hb-dark-border)";

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
  const buyable = product.status === "available" && !fullySoldOut;
  const statusLabel =
    product.status === "archived" ? "Archived" : buyable ? null : "Sold out";

  const facts = [
    { label: "Materials", value: product.materials },
    { label: "Care", value: product.care },
  ].filter((f) => f.value);

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
        <div className="hb-product-hero">
          <div style={{ filter: buyable ? undefined : "grayscale(1)", minWidth: 0 }}>
            <StackedImageCarousel images={images} alt={product.name} onImageClick={setLightboxIndex} />
          </div>

          <div className="hb-product-panel">
            <p
              style={{
                fontFamily: "var(--hb-font-mono)",
                fontSize: "0.65rem",
                letterSpacing: "var(--hb-track-catalog)",
                textTransform: "uppercase",
                color: "var(--hb-sienna)",
                margin: 0,
              }}
            >
              {catalogNumber}
              {statusLabel && <span style={{ color: "var(--hb-dark-muted)" }}> · {statusLabel}</span>}
            </p>
            <h1
              style={{
                fontFamily: "var(--hb-font-display)",
                fontStyle: "italic",
                fontWeight: 300,
                fontSize: "2.25rem",
                lineHeight: 1.15,
                color: "var(--hb-on-dark)",
                margin: "1rem 0 0.5rem",
              }}
            >
              {product.name}
            </h1>
            <p
              style={{
                fontFamily: "var(--hb-font-mono)",
                fontSize: "0.65rem",
                letterSpacing: "var(--hb-track-meta)",
                textTransform: "uppercase",
                color: "var(--hb-dark-muted)",
                margin: "0 0 2rem",
              }}
            >
              {product.collection} · {product.year}
            </p>

            <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
              <p style={metaLabel}>Size</p>
              <SizeGuideModal />
            </div>
            <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginBottom: "1.5rem" }}>
              {product.sizes.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSize(s)}
                  aria-pressed={size === s}
                  style={{
                    minWidth: "44px",
                    minHeight: "44px",
                    padding: "0 0.875rem",
                    fontSize: "0.8125rem",
                    cursor: "pointer",
                    borderRadius: 0,
                    background: "transparent",
                    fontFamily: "var(--hb-font-mono)",
                    transition: "border-color 300ms var(--hb-ease-expo-out), color 300ms var(--hb-ease-expo-out)",
                    color: size === s ? "var(--hb-on-dark)" : "var(--hb-dark-muted)",
                    border: size === s ? "1px solid var(--hb-on-dark)" : line,
                  }}
                >
                  {s}
                </button>
              ))}
            </div>

            <AddToCartButton product={product} selectedSize={size} />

            {facts.length > 0 && (
              <dl id="materials" style={{ margin: "2.5rem 0 0", scrollMarginTop: "6rem" }}>
                {facts.map((f) => (
                  <div key={f.label} style={{ borderTop: line, padding: "1rem 0" }}>
                    <dt style={metaLabel}>{f.label}</dt>
                    <dd style={{ margin: 0, fontSize: "0.875rem", lineHeight: 1.7, color: "var(--hb-on-dark)" }}>
                      {f.value}
                    </dd>
                  </div>
                ))}
              </dl>
            )}

            {product.tags.length > 0 && (
              <p style={{ ...metaLabel, borderTop: line, paddingTop: "1rem", margin: 0 }}>
                {product.tags.join(" · ")}
              </p>
            )}
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
