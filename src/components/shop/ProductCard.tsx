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
      className="group flex flex-col gap-4 border border-[var(--hb-border)] p-4 hover:-translate-y-1 transition"
    >
      <div className="relative w-full aspect-[4/5] overflow-hidden bg-[var(--hb-paper-muted)]">
        <Image
          src={product.heroImage}
          alt={product.name}
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          className="object-cover transition duration-700 group-hover:scale-[1.03]"
        />
        {product.featured && (
          <div className="absolute top-4 left-4">
            <Badge tone="sienna">Featured</Badge>
          </div>
        )}
        {product.status !== "available" && (
          <div className="absolute top-4 right-4">
            <Badge tone="smoke">
              {product.status === "sold_out" ? "Sold Out" : "Archived"}
            </Badge>
          </div>
        )}
      </div>
      <div className="space-y-2">
        <p className="font-serif text-lg">{product.name}</p>
        <p className="text-sm text-[var(--hb-smoke)]">{product.collection}</p>
        <div className="flex items-center justify-between text-sm">
          <span>{formatCurrency(product.price)}</span>
          <Tag variant="outline">{product.tags[0]}</Tag>
        </div>
      </div>
    </Link>
  );
}

