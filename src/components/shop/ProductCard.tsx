import { Badge } from "@/components/common/Badge";
import { Tag } from "@/components/common/Tag";
import { Product } from "@/data/products";
import { formatCurrency } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  return (
    <Link
      href={`/product/${product.slug}`}
      className="group flex flex-col gap-5 p-5 hover-wispy relative"
    >
      {/* Wispy border effect */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
        <div className="absolute inset-0 border border-[var(--hb-border)] opacity-30" style={{ borderStyle: "dashed", borderWidth: "1px" }} />
      </div>
      
      <div className="relative w-full aspect-[4/5] overflow-hidden bg-[var(--hb-paper-muted)]">
        <Image
          src={product.heroImage}
          alt={product.name}
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          className="object-cover transition duration-700 group-hover:scale-[1.02]"
        />
        {product.featured && (
          <div className="absolute top-5 left-5">
            <Badge tone="sienna">Featured</Badge>
          </div>
        )}
        {product.status !== "available" && (
          <div className="absolute top-5 right-5">
            <Badge tone="smoke">
              {product.status === "sold_out" ? "Sold Out" : "Archived"}
            </Badge>
          </div>
        )}
      </div>
      <div className="space-y-3 relative z-10">
        <p className="font-serif text-xl leading-tight">{product.name}</p>
        <p className="text-sm text-[var(--hb-smoke)] font-script opacity-70">{product.collection}</p>
        <div className="flex items-center justify-between text-sm pt-2">
          <span className="font-serif">{formatCurrency(product.price)}</span>
          <Tag variant="outline">{product.tags[0]}</Tag>
        </div>
      </div>
    </Link>
  );
}

