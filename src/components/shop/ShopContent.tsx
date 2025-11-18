"use client";

import { Product } from "@/data/products";
import { useMemo, useState } from "react";
import { ProductFilters } from "./ProductFilters";
import { ProductGrid } from "./ProductGrid";

interface ShopContentProps {
  products: Product[];
}

export function ShopContent({ products }: ShopContentProps) {
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [availability, setAvailability] = useState<"available" | "archived">(
    "available"
  );

  const tags = useMemo(() => {
    const unique = new Set<string>();
    products.forEach((product) =>
      product.tags.forEach((tag) => unique.add(tag))
    );
    return Array.from(unique);
  }, [products]);

  const sizes = useMemo(() => {
    const unique = new Set<string>();
    products.forEach((product) => product.sizes.forEach((size) => unique.add(size)));
    return Array.from(unique);
  }, [products]);

  const filteredProducts = products.filter((product) => {
    if (availability === "available" && product.status !== "available") {
      return false;
    }
    if (availability === "archived" && product.status === "available") {
      return false;
    }

    if (selectedTag && !product.tags.includes(selectedTag)) {
      return false;
    }

    if (selectedSize && !product.sizes.includes(selectedSize)) {
      return false;
    }

    return true;
  });

  return (
    <div className="space-y-8">
      <ProductFilters
        tags={tags}
        sizes={sizes}
        selectedTag={selectedTag}
        selectedSize={selectedSize}
        availability={availability}
        onTagChange={setSelectedTag}
        onSizeChange={setSelectedSize}
        onAvailabilityChange={setAvailability}
      />
      <ProductGrid products={filteredProducts} />
    </div>
  );
}

