'use client';

import { openCartDrawer } from "@/lib/open-cart";
import { formatCurrency } from "@/lib/utils";
import { useCartStore } from "@/store/cart";
import type { Product } from "@/data/products";
import { motion } from "framer-motion";
import { useState } from "react";
import { toast } from "sonner";

const SIZES = ["28", "29", "30", "31", "32", "33", "34", "35", "36"] as const;
type Size = typeof SIZES[number];

interface BuyButtonProps {
  product: Product & { stripePriceId?: string };
}

export function BuyButton({ product }: BuyButtonProps) {
  const addItem = useCartStore((state) => state.addItem);
  const [selectedSize, setSelectedSize] = useState<Size | null>(null);
  const [sizeError, setSizeError] = useState(false);

  const handleAddToCart = () => {
    if (!selectedSize) {
      setSizeError(true);
      return;
    }
    setSizeError(false);

    addItem(
      {
        id: `${product.id}-${selectedSize}`,
        productId: product.id,
        variantId: "",
        name: product.name,
        slug: product.slug,
        price: product.price,
        size: selectedSize,
        image: product.heroImage,
        stripePriceId: product.stripePriceId,
      },
      1
    );

    toast.success("Added to cart", {
      description: `${product.name} · Size ${selectedSize} · ${formatCurrency(product.price)}`,
      action: { label: "View cart", onClick: () => openCartDrawer() },
    });

    openCartDrawer();
  };

  return (
    <div>
      <div className="mb-4 space-y-2">
        <p
          className="text-xs tracking-[0.3em] uppercase"
          style={{ fontFamily: "var(--hb-font-mono)", color: sizeError ? "var(--hb-sienna)" : "var(--hb-dark-muted)" }}
        >
          {sizeError ? "Select a size" : "Size"}
        </p>
        <div className="flex gap-2 flex-wrap">
          {SIZES.map((size) => (
            <button
              key={size}
              type="button"
              onClick={() => { setSelectedSize(size); setSizeError(false); }}
              className={`px-4 py-2 text-sm border transition-colors ${
                selectedSize === size
                  ? "bg-[#faf8f4] text-[var(--hb-ink)] border-[#faf8f4]"
                  : "bg-transparent text-[#faf8f4] border-[#faf8f4]/50 hover:border-[#faf8f4] hover:bg-[#faf8f4]/10"
              }`}
              style={{ fontFamily: "var(--hb-font-mono)" }}
            >
              {size}
            </button>
          ))}
        </div>
      </div>

      <motion.button
        onClick={handleAddToCart}
        whileHover={{ scale: 1.02, rotate: 0.5 }}
        whileTap={{ scale: 0.98 }}
        className="w-full py-4 bg-[var(--hb-ink)] text-[var(--hb-paper)] rounded-2xl font-serif text-lg hover:bg-[var(--hb-ink-light)] transition-colors"
      >
        Add to Cart — {formatCurrency(product.price)}
      </motion.button>
    </div>
  );
}
