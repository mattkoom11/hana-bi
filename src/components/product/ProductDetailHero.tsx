"use client";

import { Badge } from "@/components/common/Badge";
import { MarginNote } from "@/components/common/MarginNote";
import { ImageLightbox } from "@/components/common/ImageLightbox";
import { AddToCartButton } from "@/components/shop/AddToCartButton";
import type { Product } from "@/data/products";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import Image from "next/image";
import { useState } from "react";

interface ProductDetailHeroProps {
  product: Product;
  catalogNumber: string | null;
}

// Silently selects "One Size" on mount so the cart button is immediately active
function SizeAutoSelect({ onSelect }: { onSelect: () => void }) {
  useState(() => { onSelect(); });
  return null;
}

export function ProductDetailHero({ product, catalogNumber }: ProductDetailHeroProps) {
  const allImages = product.images && product.images.length > 0 ? product.images : (product.heroImage ? [product.heroImage] : []);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);

  return (
    <>
    <div className="grid gap-12 lg:grid-cols-[1.3fr_0.7fr] items-start">
      {/* Hero image — animated from left */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative space-y-6"
      >
        <div
            className="relative w-full aspect-[3/4] overflow-hidden cursor-zoom-in"
            onClick={() => allImages.length > 0 && setLightboxIndex(0)}
          >
          {/* Ghost 花火 */}
          <span
            aria-hidden="true"
            className="absolute top-6 right-6 z-20 pointer-events-none select-none"
            style={{
              color: "var(--hb-dark-kanji)",
              fontSize: "8rem",
              lineHeight: 1,
              fontFamily: "var(--hb-font-display)",
            }}
          >
            花火
          </span>
          {product.heroImage && (
            <Image
              src={product.heroImage}
              alt={product.name}
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 65vw"
              priority
            />
          )}
          <div className="absolute top-6 left-6 z-10">
            <Badge tone="sienna">
              {product.status === "available"
                ? "Available"
                : product.status === "sold_out"
                ? "Sold Out"
                : "Archived"}
            </Badge>
          </div>
          {product.year && (
            <MarginNote position="top-right" variant="script" size="xs">
              <span style={{ color: "var(--hb-sienna)" }}>{product.year}</span>
            </MarginNote>
          )}
        </div>

        {/* Thumbnail grid */}
        {product.images && product.images.length > 0 && (
          <div className="grid grid-cols-3 gap-4">
            {product.images.map((image, idx) => (
              <div
                key={image}
                className="relative aspect-[4/5] overflow-hidden cursor-zoom-in"
                style={{ transform: `rotate(${idx % 2 === 0 ? "0.8deg" : "-0.8deg"})` }}
                onClick={() => setLightboxIndex(idx)}
              >
                <Image
                  src={image}
                  alt={`${product.name} alternate view ${idx + 1}`}
                  fill
                  sizes="(max-width: 768px) 33vw, 200px"
                  className="object-cover"
                />
              </div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Details panel — animated from right */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, ease: "easeOut", delay: 0.15 }}
        className="space-y-6 sticky top-24 grain bg-[var(--hb-dark-surface)] p-6 border border-[var(--hb-dark-border)]"
      >
        <div className="space-y-4 relative z-10">
          {catalogNumber && (
            <p
              className="text-xs tracking-[0.55em] uppercase opacity-60"
              style={{ fontFamily: "var(--hb-font-mono)", color: "var(--hb-sienna)" }}
            >
              {catalogNumber}
            </p>
          )}
          <h1
            className="text-4xl lg:text-5xl leading-tight text-[#faf8f4] italic font-light"
            style={{ fontFamily: "var(--hb-font-display)" }}
          >
            {product.name}
          </h1>
        </div>

        <div className="space-y-4 pt-4 relative z-10">
          <div>
            <p
              className="text-xs tracking-[0.3em] uppercase mb-2"
              style={{ fontFamily: "var(--hb-font-mono)", color: "var(--hb-dark-muted)" }}
            >
              Collection
            </p>
            <p
              className="text-lg italic font-light text-[#faf8f4]"
              style={{ fontFamily: "var(--hb-font-display)" }}
            >
              {product.collection}
            </p>
          </div>

          <div>
            <p
              className="text-xs tracking-[0.3em] uppercase mb-2"
              style={{ fontFamily: "var(--hb-font-mono)", color: "var(--hb-dark-muted)" }}
            >
              Price
            </p>
            <p
              className="text-2xl"
              style={{ fontFamily: "var(--hb-font-mono)", color: "var(--hb-sienna)" }}
            >
              ${product.price}
            </p>
          </div>

          {product.year && (
            <div>
              <p
                className="text-xs tracking-[0.3em] uppercase mb-2"
                style={{ fontFamily: "var(--hb-font-mono)", color: "var(--hb-dark-muted)" }}
              >
                Year
              </p>
              <p
                className="text-sm"
                style={{ fontFamily: "var(--hb-font-mono)", color: "var(--hb-dark-muted)" }}
              >
                {product.year}
              </p>
            </div>
          )}

          {/* Size selector */}
          {product.sizes && product.sizes.length > 0 && product.sizes[0] !== "One Size" && (
            <div>
              <p
                className="text-xs tracking-[0.3em] uppercase mb-3"
                style={{ fontFamily: "var(--hb-font-mono)", color: "var(--hb-dark-muted)" }}
              >
                Size
              </p>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((size) => {
                  const isSoldOut = product.soldSizes?.includes(size);
                  const isSelected = selectedSize === size;
                  return (
                    <button
                      key={size}
                      disabled={isSoldOut}
                      onClick={() => setSelectedSize(isSelected ? null : size)}
                      className={cn(
                        "px-4 py-2 text-xs uppercase tracking-[0.25em] border transition-all duration-200",
                        isSoldOut
                          ? "border-dashed border-[var(--hb-dark-border)] text-[var(--hb-dark-border)] cursor-not-allowed line-through"
                          : isSelected
                          ? "border-[var(--hb-sienna)] bg-[var(--hb-sienna)]/10 text-[#faf8f4]"
                          : "border-[var(--hb-dark-border)] text-[var(--hb-dark-muted)] hover:border-[#faf8f4]/40 hover:text-[#faf8f4]"
                      )}
                      style={{ fontFamily: "var(--hb-font-mono)" }}
                      aria-label={isSoldOut ? `${size} — sold out` : size}
                    >
                      {size}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* One Size — auto-select */}
          {product.sizes?.[0] === "One Size" && (
            <SizeAutoSelect onSelect={() => setSelectedSize("One Size")} />
          )}

          {/* Add to Cart */}
          <div className="pt-2">
            <AddToCartButton product={product} selectedSize={selectedSize} />
          </div>

          {/* Tags */}
          {product.tags.length > 0 && (
            <div>
              <p
                className="text-xs tracking-[0.3em] uppercase mb-2"
                style={{ fontFamily: "var(--hb-font-mono)", color: "var(--hb-dark-muted)" }}
              >
                Tags
              </p>
              <div className="flex flex-wrap gap-2">
                {product.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs uppercase tracking-[0.2em] border border-dashed border-[var(--hb-dark-border)] px-3 py-1.5"
                    style={{ fontFamily: "var(--hb-font-mono)", color: "var(--hb-dark-muted)" }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>

    {lightboxIndex !== null && (
      <ImageLightbox
        images={allImages}
        initialIndex={lightboxIndex}
        alt={product.name}
        onClose={() => setLightboxIndex(null)}
      />
    )}
    </>
  );
}
