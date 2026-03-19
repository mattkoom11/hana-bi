import { Badge } from "@/components/common/Badge";
import { MarginNote } from "@/components/common/MarginNote";
import { Product } from "@/data/products";
import { formatCurrency } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";

interface ProductCardProps {
  product: Product;
  variant?: "dark" | "light";
}

function getAnnotation(product: Product): string {
  if (product.tags.some((t) => t.toLowerCase().includes("denim"))) {
    return "raw denim";
  }
  if (product.tags.some((t) => t.toLowerCase().includes("selvedge"))) {
    return "selvedge";
  }
  if (product.collection.toLowerCase().includes("sample")) {
    return "sample 001";
  }
  return "edition piece";
}

export function ProductCard({ product, variant = "dark" }: ProductCardProps) {
  const annotation = getAnnotation(product);
  const isDark = variant === "dark";

  return (
    <Link
      href={`/product/${product.slug}`}
      className="group flex flex-col gap-5 p-5 hover-wispy relative"
    >
      {/* Hand-drawn frame on hover — light variant only */}
      {!isDark && (
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none">
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 500" preserveAspectRatio="none">
            <defs>
              <linearGradient id="card-frame-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="var(--hb-ink)" stopOpacity="0.3" />
                <stop offset="50%" stopColor="var(--hb-ink)" stopOpacity="0.15" />
                <stop offset="100%" stopColor="var(--hb-ink)" stopOpacity="0.25" />
              </linearGradient>
            </defs>
            <path
              d="M 8,8 Q 12,6 16,8 Q 200,4 384,8 Q 388,6 392,8 Q 392,12 392,16 Q 396,250 392,484 Q 392,488 392,492 Q 388,494 384,492 Q 200,496 16,492 Q 12,494 8,492 Q 8,488 8,484 Q 4,250 8,16 Q 8,12 8,8 Z"
              fill="none"
              stroke="url(#card-frame-gradient)"
              strokeWidth="1.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              vectorEffect="non-scaling-stroke"
            />
          </svg>
        </div>
      )}

      {/* Dark variant: sienna bottom border on hover */}
      {isDark && (
        <div className="absolute bottom-0 left-5 right-5 h-px bg-[var(--hb-sienna)] opacity-0 group-hover:opacity-60 transition-opacity duration-500 pointer-events-none" />
      )}

      <div
        className={`relative w-full aspect-[4/5] overflow-hidden ${
          isDark ? "bg-[var(--hb-dark-surface)]" : "bg-[var(--hb-paper-muted)]"
        }`}
      >
        <Image
          src={product.heroImage}
          alt={product.name}
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          className="object-cover transition duration-700 group-hover:scale-[1.02]"
        />
        {product.featured && (
          <div className="absolute top-5 left-5 z-10">
            <Badge tone="sienna">Featured</Badge>
          </div>
        )}
        {product.status !== "available" && (
          <div className="absolute top-5 right-5 z-10">
            <Badge tone="smoke">
              {product.status === "sold_out" ? "Sold Out" : "Archived"}
            </Badge>
          </div>
        )}

        {/* Hover-revealed pencil annotation — light variant only */}
        {!isDark && (
          <div className="absolute bottom-4 left-4 opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10">
            <MarginNote
              position="bottom-left"
              variant="script"
              size="xs"
              className="!opacity-80 !relative !top-0 !left-0 !transform-none"
            >
              {annotation}
            </MarginNote>
          </div>
        )}
      </div>

      <div className="space-y-3 relative z-10">
        <p
          className={`font-serif text-xl leading-tight ${
            isDark ? "text-[#faf8f4]" : ""
          }`}
        >
          {product.name}
        </p>
        <p
          className={`text-sm font-script opacity-70 ${
            isDark ? "text-[var(--hb-sienna)]" : "text-[var(--hb-smoke)]"
          }`}
        >
          {product.collection}
        </p>
        <div className="flex items-center justify-between text-sm pt-2">
          <span
            className={`font-serif ${isDark ? "text-[#faf8f4]" : ""}`}
          >
            {formatCurrency(product.price)}
          </span>
          <span
            className={`text-xs uppercase tracking-[0.2em] border px-2 py-1 ${
              isDark
                ? "border-[var(--hb-dark-border)] text-[var(--hb-dark-muted)]"
                : ""
            }`}
          >
            {product.tags[0]}
          </span>
        </div>
      </div>
    </Link>
  );
}
