import { Badge } from "@/components/common/Badge";
import { MarginNote } from "@/components/common/MarginNote";
import { Product } from "@/data/products";
import { formatCurrency } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";

interface ProductCardProps {
  product: Product;
  variant?: "dark" | "light";
  catalogIndex?: number;
}

function getAnnotation(product: Product): string {
  if (product.tags.some((t) => t.toLowerCase().includes("denim"))) return "raw denim";
  if (product.tags.some((t) => t.toLowerCase().includes("selvedge"))) return "selvedge";
  if (product.collection.toLowerCase().includes("sample")) return "sample 001";
  return "edition piece";
}

function formatCatalogNumber(index: number): string {
  return `HB-${String(index + 1).padStart(3, "0")}`;
}

export function ProductCard({ product, variant = "dark", catalogIndex }: ProductCardProps) {
  const annotation = getAnnotation(product);
  const isDark = variant === "dark";
  const catalogNumber = catalogIndex !== undefined ? formatCatalogNumber(catalogIndex) : null;

  return (
    <Link
      href={`/product/${product.slug}`}
      className="group flex flex-col gap-3 p-5 hover-wispy relative"
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

      {/* Dark variant: sienna bottom rule slides in from left on hover */}
      {isDark && (
        <div className="absolute bottom-0 left-5 right-5 h-px bg-[var(--hb-sienna)] scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-[400ms] pointer-events-none" />
      )}

      {/* Catalog number — above image */}
      {catalogNumber && (
        <p
          className={`text-[0.55rem] uppercase tracking-[0.55em] transition-opacity duration-[400ms] ${
            isDark
              ? "text-[var(--hb-dark-muted)] opacity-[0.35] group-hover:opacity-100"
              : "text-[var(--hb-smoke)] opacity-50"
          }`}
          style={{ fontFamily: "var(--hb-font-mono)" }}
        >
          {catalogNumber}
        </p>
      )}

      <div
        className={`relative w-full aspect-[4/5] overflow-hidden ${
          isDark ? "bg-[var(--hb-dark-surface)] grain" : "bg-[var(--hb-paper-muted)]"
        }`}
      >
        <Image
          src={product.heroImage}
          alt={product.name}
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          className="object-cover transition duration-700 group-hover:scale-[1.02] relative z-10"
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

        {/* Hover annotation — light variant only */}
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

      <div className="space-y-2 relative z-10 pt-1">
        <p
          className={`text-xl leading-tight italic font-light ${isDark ? "text-[#faf8f4]" : ""}`}
          style={{ fontFamily: "var(--hb-font-display)" }}
        >
          {product.name}
        </p>
        <p
          className={`text-xs uppercase tracking-[0.3em] opacity-60 ${
            isDark ? "" : "text-[var(--hb-smoke)]"
          }`}
          style={{
            fontFamily: "var(--hb-font-mono)",
            color: isDark ? "var(--hb-sienna)" : undefined,
          }}
        >
          {product.collection}
        </p>
        <div className="flex items-center justify-between text-sm pt-1">
          <span
            className={isDark ? "text-[#faf8f4]" : ""}
            style={{ fontFamily: "var(--hb-font-mono)" }}
          >
            {formatCurrency(product.price)}
          </span>
          <span
            className={`text-xs uppercase tracking-[0.2em] border px-2 py-1 ${
              isDark
                ? "border-[var(--hb-dark-border)] text-[var(--hb-dark-muted)]"
                : ""
            }`}
            style={{ fontFamily: "var(--hb-font-mono)" }}
          >
            {product.tags[0]}
          </span>
        </div>
      </div>
    </Link>
  );
}
