import { Badge } from "@/components/common/Badge";
import { Tag } from "@/components/common/Tag";
import { PageShell } from "@/components/layout/PageShell";
import { ProductPurchasePanel } from "@/components/product/ProductPurchasePanel";
import { SizeGuideModal } from "@/components/product/SizeGuideModal";
import { ProductCard } from "@/components/shop/ProductCard";
import {
  getProductBySlug,
  products,
  type Product,
} from "@/data/products";
import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";

interface ProductPageProps {
  params: { slug: string };
}

export function generateStaticParams() {
  return products.map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const product = getProductBySlug(params.slug);

  if (!product) {
    return {
      title: "Piece not found — Hana-Bi",
    };
  }

  return {
    title: `${product.name} — Hana-Bi`,
    description: product.description,
  };
}

const getRelatedProducts = (current: Product) =>
  products
    .filter((product) => product.slug !== current.slug && product.status === "available")
    .slice(0, 3);

export default function ProductPage({ params }: ProductPageProps) {
  const product = getProductBySlug(params.slug);

  if (!product) {
    notFound();
  }

  const related = getRelatedProducts(product);

  return (
    <main>
      <section className="px-4 sm:px-8 md:px-12 lg:px-20 py-16 space-y-12">
        <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-4">
            <div className="relative w-full aspect-[4/5] border border-[var(--hb-border)]">
              <Image
                src={product.heroImage}
                alt={product.name}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 60vw"
              />
              <div className="absolute top-4 left-4">
                <Badge tone={product.status === "available" ? "sienna" : "smoke"}>
                  {product.status === "available" ? "Edition" : product.status.replace("_", " ")}
                </Badge>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {product.images.map((image) => (
                <div key={image} className="relative aspect-[4/5] border border-[var(--hb-border)]">
                  <Image
                    src={image}
                    alt={`${product.name} alternate view`}
                    fill
                    sizes="200px"
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
          <div className="space-y-6">
            <ProductPurchasePanel product={product} />
            <div className="space-y-3 border border-[var(--hb-border)] p-6">
              <p className="uppercase text-xs tracking-[0.3em] text-[var(--hb-smoke)]">
                Story
              </p>
              <p className="text-sm leading-relaxed">{product.story}</p>
              <SizeGuideModal />
            </div>
            <div className="grid gap-4 border border-[var(--hb-border)] p-6">
              <div>
                <p className="uppercase text-xs tracking-[0.3em] text-[var(--hb-smoke)]">
                  Materials
                </p>
                <p className="text-sm leading-relaxed">{product.materials}</p>
              </div>
              <div>
                <p className="uppercase text-xs tracking-[0.3em] text-[var(--hb-smoke)]">
                  Care
                </p>
                <p className="text-sm leading-relaxed">{product.care}</p>
              </div>
              <div>
                <p className="uppercase text-xs tracking-[0.3em] text-[var(--hb-smoke)]">
                  Notes
                </p>
                <p className="text-sm leading-relaxed">{product.notes}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {product.tags.map((tag) => (
                  <Tag key={tag}>{tag}</Tag>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {related.length > 0 && (
        <PageShell
          eyebrow="From the archive"
          title="You may also like"
          intro="Pieces that share fabrication notes or silhouettes with this garment."
          className="pt-0"
        >
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {related.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </PageShell>
      )}
    </main>
  );
}

