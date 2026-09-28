"use client";

import { Product } from "@/data/products";
import { openCartDrawer } from "@/lib/open-cart";
import { cn, formatCurrency } from "@/lib/utils";
import { useCartStore } from "@/store/cart";
import { useMemo } from "react";
import { toast } from "sonner";

interface AddToCartButtonProps {
  product: Product;
  selectedSize: string | null;
  compact?: boolean;
}

export function AddToCartButton({
  product,
  selectedSize,
  compact,
}: AddToCartButtonProps) {
  const addItem = useCartStore((state) => state.addItem);
  const soldOut = useMemo(
    () =>
      product.status !== "available" ||
      (product.sizes.length > 0 &&
        product.sizes.every((s) => product.soldSizes?.includes(s) ?? false)),
    [product.status, product.sizes, product.soldSizes]
  );
  const disabled = useMemo(
    () =>
      soldOut ||
      !selectedSize ||
      (product.soldSizes?.includes(selectedSize) ?? false),
    [soldOut, selectedSize, product.soldSizes]
  );

  return (
    <button
      disabled={disabled}
      onClick={() => {
        if (!selectedSize) return;

        addItem(
          {
            id: `${product.id}-${selectedSize}`, // Local cart item ID
            productId: product.id,
            variantId: "",
            name: product.name,
            slug: product.slug,
            price: product.price,
            size: selectedSize,
            image: product.heroImage,
            stripePriceId: product.stripePriceId,
            catalogNumber: product.catalogNumber,
            collection: product.collection,
          },
          1
        );
        toast.success("Added to cart", {
          description: `${product.name} · Size ${selectedSize} · ${formatCurrency(product.price)}`,
          action: {
            label: "View cart",
            onClick: () => openCartDrawer(),
          },
        });
      }}
      // The page's one filled element when it can act; a hairline while it
      // is waiting on a size or sold out.
      className={cn(
        "w-full min-h-[44px] border px-6 py-4 uppercase tracking-[0.35em] text-xs transition-colors duration-300",
        disabled
          ? "bg-transparent border-[var(--hb-dark-border)] text-[var(--hb-dark-muted)] cursor-not-allowed"
          : "bg-[var(--hb-sienna)] border-[var(--hb-sienna)] text-[var(--hb-on-dark)]"
      )}
      style={{ fontFamily: "var(--hb-font-mono)" }}
    >
      {soldOut ? "Sold Out" : disabled ? "Select Size" : compact ? "Add" : `Add to Cart — ${formatCurrency(product.price)}`}
    </button>
  );
}

