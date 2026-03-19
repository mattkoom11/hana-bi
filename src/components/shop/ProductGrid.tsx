import { Product } from "@/data/products";
import { ProductCard } from "./ProductCard";

interface ProductGridProps {
  products: Product[];
  variant?: "dark" | "light";
}

export function ProductGrid({ products, variant = "dark" }: ProductGridProps) {
  if (!products.length) {
    return (
      <p
        className="text-sm"
        style={{
          fontFamily: "var(--hb-font-mono)",
          color: variant === "dark" ? "var(--hb-dark-muted)" : "var(--hb-smoke)",
        }}
      >
        No garments match these filters yet.
      </p>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {products.map((product, index) => (
        <ProductCard
          key={product.id}
          product={product}
          variant={variant}
          catalogIndex={index}
        />
      ))}
    </div>
  );
}
