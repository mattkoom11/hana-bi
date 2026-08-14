"use client";

import { Product } from "@/data/products";
import { useMemo, useState } from "react";
import { ProductFilters } from "./ProductFilters";
import { ProductGrid } from "./ProductGrid";

interface ShopContentProps {
  products: Product[];
  variant?: "dark" | "light";
}

const SIZE_ORDER = ["XS", "S", "M", "L", "XL", "One Size"];

function sortSizes(sizes: string[]): string[] {
  return [...sizes].sort((a, b) => {
    const ai = SIZE_ORDER.indexOf(a);
    const bi = SIZE_ORDER.indexOf(b);
    if (ai !== -1 || bi !== -1) return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
    return Number(a) - Number(b);
  });
}

export function ShopContent({ products, variant = "dark" }: ShopContentProps) {
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [availability, setAvailability] = useState<"available" | "archived" | "all">(
    "available"
  );

  // Chips are derived from the garments the availability filter currently shows,
  // not the whole catalogue — no chip that leads to an empty grid, and no wall
  // of chips above a handful of products. See design/screens/02-shop.md.
  const inScope = useMemo(
    () =>
      products.filter((product) => {
        if (availability === "available") return product.status === "available";
        if (availability === "archived") return product.status !== "available";
        return true;
      }),
    [products, availability]
  );

  const tags = useMemo(
    () => Array.from(new Set(inScope.flatMap((product) => product.tags))),
    [inScope]
  );

  const sizes = useMemo(
    () => sortSizes(Array.from(new Set(inScope.flatMap((product) => product.sizes)))),
    [inScope]
  );

  const filteredProducts = products.filter((product) => {
    if (availability === "available" && product.status !== "available") return false;
    if (availability === "archived" && product.status === "available") return false;
    if (selectedTag && !product.tags.includes(selectedTag)) return false;
    if (selectedSize && !product.sizes.includes(selectedSize)) return false;
    return true;
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "3rem" }}>
      <ProductFilters
        tags={tags}
        sizes={sizes}
        selectedTag={selectedTag}
        selectedSize={selectedSize}
        availability={availability}
        onTagChange={setSelectedTag}
        onSizeChange={setSelectedSize}
        onAvailabilityChange={setAvailability}
        variant={variant}
      />
      <ProductGrid products={filteredProducts} variant={variant} />
    </div>
  );
}
