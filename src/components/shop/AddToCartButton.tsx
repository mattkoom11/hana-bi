"use client";

import { Product } from "@/data/products";
import type { ShopifyProductNode } from "@/lib/shopify";
import { findVariantIdBySize } from "@/lib/shopify-mappers";
import { formatCurrency } from "@/lib/utils";
import { useCartStore } from "@/store/cart";
import { useMemo, useState } from "react";
import { Button } from "@/components/common/Button";

interface AddToCartButtonProps {
  product: Product;
  selectedSize: string | null;
  shopifyProductNode?: ShopifyProductNode | null;
}

export function AddToCartButton({
  product,
  selectedSize,
  shopifyProductNode,
}: AddToCartButtonProps) {
  const addItem = useCartStore((state) => state.addItem);
  const [loading, setLoading] = useState(false);
  
  const disabled = useMemo(
    () => product.status !== "available" || !selectedSize,
    [product.status, selectedSize]
  );

  return (
    <Button
      variant="primary"
      disabled={disabled}
      loading={loading}
      className="w-full"
      onClick={() => {
        if (!selectedSize) return;

        // Simulate brief loading state for better UX
        setLoading(true);

        // Find variant ID from Shopify product node if available
        let variantId = "";
        let productId = product.id;

        if (shopifyProductNode) {
          variantId =
            findVariantIdBySize(shopifyProductNode, selectedSize) || "";
          productId = shopifyProductNode.id;
        }

        // If no variant ID found but we have Shopify product, warn
        if (shopifyProductNode && !variantId) {
          console.warn(
            `Could not find variant ID for size ${selectedSize} on product ${product.slug}`
          );
        }

        addItem(
          {
            id: `${product.id}-${selectedSize}`, // Local cart item ID
            productId,
            variantId,
            name: product.name,
            slug: product.slug,
            price: product.price,
            size: selectedSize,
            image: product.heroImage,
          },
          1
        );

        // Reset loading state after a brief moment
        setTimeout(() => setLoading(false), 600);
      }}
    >
      {disabled ? "Select Size" : `Add to Cart — ${formatCurrency(product.price)}`}
    </Button>
  );
}

