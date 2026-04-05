"use client";

import { AddToCartButton } from "@/components/shop/AddToCartButton";
import { Product } from "@/data/products";
import type { ShopifyProductNode } from "@/lib/shopify";
import { formatCurrency } from "@/lib/utils";
import { useState } from "react";

interface ProductPurchasePanelProps {
  product: Product;
  shopifyProductNode?: ShopifyProductNode | null;
}

export function ProductPurchasePanel({
  product,
  shopifyProductNode,
}: ProductPurchasePanelProps) {
  const [selectedSize, setSelectedSize] = useState<string | null>(
    product.sizes[0] ?? null
  );
  const isAvailable = product.status === "available";

  return (
    <div className="space-y-6 border border-[var(--hb-border)] border-dashed p-8 relative">
      {/* Subtle paper texture */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-[0.02]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100' height='100' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          backgroundSize: "200px 200px",
        }}
      />
      
      <div className="relative z-10">
        <div>
          <p className="font-serif text-3xl lg:text-4xl leading-tight">{product.name}</p>
          <p className="uppercase text-xs tracking-[0.4em] text-[var(--hb-smoke)] font-script opacity-70 mt-3">
            {product.collection} · {product.year}
          </p>
          <p className="mt-6 text-xl font-serif">{formatCurrency(product.price)}</p>
          <p className="text-sm text-[var(--hb-smoke)] opacity-80 mt-2">
            {isAvailable ? "Ships in 2 weeks" : "Preserved in the archive"}
          </p>
        </div>

        <div className="space-y-4 pt-6">
          <p className="uppercase text-xs tracking-[0.3em] text-[var(--hb-smoke)] font-script opacity-70">
            Select Size
          </p>
          <div className="flex flex-wrap gap-3">
            {product.sizes.map((size) => (
              <button
                key={size}
                onClick={() => setSelectedSize(size)}
                className={`px-5 py-2.5 min-h-[44px] border text-xs uppercase tracking-[0.3em] transition-all duration-300 hover-wispy ${
                  selectedSize === size
                    ? "border-[var(--hb-ink)] bg-[var(--hb-ink)] text-[var(--hb-paper)]"
                    : "border-[var(--hb-border)] border-dashed text-[var(--hb-smoke)] hover:border-[var(--hb-ink-light)]"
                }`}
                style={{ borderWidth: "1px" }}
              >
                {size}
              </button>
            ))}
          </div>
        </div>

        <div className="pt-4">
          <AddToCartButton
            product={product}
            selectedSize={selectedSize}
            shopifyProductNode={shopifyProductNode}
          />
        </div>
        
        <p className="text-[0.75rem] text-[var(--hb-smoke)] opacity-70 mt-6 leading-relaxed">
          Need a custom tailoring note? Add it during checkout or email studio@hana-bi.example.
        </p>
      </div>

      {/* Sticky mobile Add to Cart — visible only below md breakpoint */}
      <div className="fixed bottom-0 left-0 right-0 z-40 md:hidden border-t border-[var(--hb-dark-border)] bg-[var(--hb-dark)]/95 backdrop-blur-sm px-4 py-3 flex items-center gap-4">
        <div className="flex-1 min-w-0">
          <p
            className="text-xs uppercase tracking-[0.3em] truncate"
            style={{ fontFamily: "var(--hb-font-mono)", color: "var(--hb-dark-muted)" }}
          >
            {selectedSize ? `Size ${selectedSize}` : "Select a size"}
          </p>
          <p
            className="text-base text-[#faf8f4] italic font-light truncate"
            style={{ fontFamily: "var(--hb-font-display)" }}
          >
            {formatCurrency(product.price)}
          </p>
        </div>
        <div className="shrink-0">
          <AddToCartButton
            product={product}
            selectedSize={selectedSize}
            shopifyProductNode={shopifyProductNode}
            compact
          />
        </div>
      </div>
    </div>
  );
}

