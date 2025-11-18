"use client";

import { Product } from "@/data/products";
import { cn, formatCurrency } from "@/lib/utils";
import { useCartStore } from "@/store/cart";
import { useMemo } from "react";

interface AddToCartButtonProps {
  product: Product;
  selectedSize: string | null;
}

export function AddToCartButton({
  product,
  selectedSize,
}: AddToCartButtonProps) {
  const addItem = useCartStore((state) => state.addItem);
  const disabled = useMemo(
    () => product.status !== "available" || !selectedSize,
    [product.status, selectedSize]
  );

  return (
    <button
      disabled={disabled}
      onClick={() => {
        if (!selectedSize) return;
        addItem(
          {
            id: product.id,
            name: product.name,
            slug: product.slug,
            price: product.price,
            size: selectedSize,
          },
          1
        );
      }}
      className={cn(
        "w-full border border-[var(--hb-ink)] px-6 py-4 uppercase tracking-[0.35em] text-xs",
        "transition hover:-translate-y-0.5",
        disabled
          ? "bg-[var(--hb-paper-muted)] text-[var(--hb-smoke)] cursor-not-allowed"
          : "bg-[var(--hb-ink)] text-[var(--hb-paper)]"
      )}
    >
      {disabled ? "Select Size" : `Add to Cart — ${formatCurrency(product.price)}`}
    </button>
  );
}

