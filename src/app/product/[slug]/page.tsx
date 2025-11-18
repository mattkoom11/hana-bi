import { Badge } from "@/components/common/Badge";
import { Tag } from "@/components/common/Tag";
import { PageShell } from "@/components/layout/PageShell";
import { ProductPurchasePanel } from "@/components/product/ProductPurchasePanel";
import { SizeGuideModal } from "@/components/product/SizeGuideModal";
import { ProductCard } from "@/components/shop/ProductCard";
import {
  getAllProducts,
  getProductByHandle,
  type ShopifyProductNode,
} from "@/lib/shopify";
import { mapShopifyProductToHanaBiProduct } from "@/lib/shopify-mappers";
import {
  getProductBySlug,
  products as fallbackProducts,
  type Product,
} from "@/data/products";
import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";

interface ProductPageProps {
  params: { slug: string };
}

/**
 * Generate static params for product pages
 * 
 * Note: In production with Shopify, you may want to fetch all product handles
 * at build time. For now, this uses fallback data.
 */
export async function generateStaticParams() {
  try {
    const shopifyProducts = await getAllProducts();
    return shopifyProducts.map((product) => ({ slug: product.handle }));
  } catch {
    // Fallback to local data if Shopify unavailable
    return fallbackProducts.map((product) => ({ slug: product.slug }));
  }
}

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  let product: Product | null = null;

  try {
    const shopifyProduct = await getProductByHandle(params.slug);
    if (shopifyProduct) {
      product = mapShopifyProductToHanaBiProduct(shopifyProduct);
    }
  } catch {
    // Fallback to local data
    product = getProductBySlug(params.slug) ?? null;
  }

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

/**
 * Get related products (available products excluding current)
 */
async function getRelatedProducts(
  currentSlug: string
): Promise<Product[]> {
  try {
    const allProducts = await getAllProducts();
    const mapped = allProducts.map(mapShopifyProductToHanaBiProduct);
    return mapped
      .filter((p) => p.slug !== currentSlug && p.status === "available")
      .slice(0, 3);
  } catch {
    // Fallback to local data
    return fallbackProducts
      .filter((p) => p.slug !== currentSlug && p.status === "available")
      .slice(0, 3);
  }
}

export default async function ProductPage({ params }: ProductPageProps) {
  let product: Product | null = null;
  let shopifyProductNode: ShopifyProductNode | null = null;

  try {
    shopifyProductNode = await getProductByHandle(params.slug);
    if (shopifyProductNode) {
      product = mapShopifyProductToHanaBiProduct(shopifyProductNode);
    }
  } catch (error) {
    console.warn(
      "Failed to fetch product from Shopify, using fallback:",
      error
    );
  }

  // Fallback to local data if Shopify fetch failed
  if (!product) {
    product = getProductBySlug(params.slug) ?? null;
  }

  if (!product) {
    notFound();
  }

  const related = await getRelatedProducts(product.slug);

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
            <ProductPurchasePanel
              product={product}
              shopifyProductNode={shopifyProductNode}
            />
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

