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
    <div
      style={{
        display: "grid",
        gap: "var(--hb-grid-gap)",
        gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 18rem), 1fr))",
      }}
    >
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
