"use client";

import { AddToCartButton } from "@/components/shop/AddToCartButton";
import { Product } from "@/data/products";
import { formatCurrency } from "@/lib/utils";
import { useState } from "react";

interface ProductPurchasePanelProps {
  product: Product;
}

export function ProductPurchasePanel({ product }: ProductPurchasePanelProps) {
  const [selectedSize, setSelectedSize] = useState<string | null>(
    product.sizes[0] ?? null
  );
  const isAvailable = product.status === "available";

  return (
    <div className="space-y-6 border border-[var(--hb-border)] p-6">
      <div>
        <p className="font-serif text-3xl">{product.name}</p>
        <p className="uppercase text-xs tracking-[0.4em] text-[var(--hb-smoke)] mt-2">
          {product.collection} · {product.year}
        </p>
        <p className="mt-4 text-base">{formatCurrency(product.price)}</p>
        <p className="text-sm text-[var(--hb-smoke)]">
          {isAvailable ? "Ships in 2 weeks" : "Preserved in the archive"}
        </p>
      </div>

      <div className="space-y-3">
        <p className="uppercase text-xs tracking-[0.3em] text-[var(--hb-smoke)]">
          Select Size
        </p>
        <div className="flex flex-wrap gap-2">
          {product.sizes.map((size) => (
            <button
              key={size}
              onClick={() => setSelectedSize(size)}
              className={`px-4 py-2 border text-xs uppercase tracking-[0.3em] ${
                selectedSize === size
                  ? "border-[var(--hb-ink)]"
                  : "border-[var(--hb-border)] text-[var(--hb-smoke)]"
              }`}
            >
              {size}
            </button>
          ))}
        </div>
      </div>

      <AddToCartButton product={product} selectedSize={selectedSize} />
      <p className="text-[0.75rem] text-[var(--hb-smoke)]">
        Need a custom tailoring note? Add it during checkout or email studio@hana-bi.example.
      </p>
    </div>
  );
}

