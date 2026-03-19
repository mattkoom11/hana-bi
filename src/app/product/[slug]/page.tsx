import { Badge } from "@/components/common/Badge";
import { HandDrawnDivider } from "@/components/common/HandDrawnDivider";
import { InkUnderline } from "@/components/common/InkUnderline";
import { MarginNote } from "@/components/common/MarginNote";
import { PaperBackground } from "@/components/common/PaperBackground";
import { SketchFrame } from "@/components/common/SketchFrame";
import { Tag } from "@/components/common/Tag";
import { PageShell } from "@/components/layout/PageShell";
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

export async function generateStaticParams() {
  try {
    const shopifyProducts = await getAllProducts();
    return shopifyProducts.map((product) => ({ slug: product.handle }));
  } catch {
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
    product = getProductBySlug(params.slug) ?? null;
  }

  if (!product) {
    return { title: "Piece not found — Hana-Bi" };
  }

  return {
    title: `${product.name} — Hana-Bi`,
    description: product.description,
    openGraph: { images: [product.heroImage] },
  };
}

async function getRelatedProducts(currentSlug: string): Promise<Product[]> {
  try {
    const allProducts = await getAllProducts();
    const mapped = allProducts.map(mapShopifyProductToHanaBiProduct);
    return mapped
      .filter((p) => p.slug !== currentSlug && p.status === "available")
      .slice(0, 3);
  } catch {
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

  if (!product) {
    product = getProductBySlug(params.slug) ?? null;
  }

  if (!product) {
    notFound();
  }

  const related = await getRelatedProducts(product.slug);

  return (
    <main className="page-transition">
      {/* ── Dark Top Section ───────────────────────────────────── */}
      <section className="relative bg-[var(--hb-dark)] min-h-[70vh] flex items-center justify-center overflow-hidden mb-0">
        <div className="relative z-10 w-full px-4 sm:px-8 md:px-12 lg:px-20 py-16">
          <div className="max-w-7xl mx-auto">
            <div className="grid gap-12 lg:grid-cols-[1.3fr_0.7fr] items-start">
              {/* Hero image — full opacity, no SVG sketch border */}
              <div className="relative space-y-6">
                <div className="relative w-full aspect-[3/4] overflow-hidden">
                  {/* Ghost 花火 */}
                  <span
                    aria-hidden="true"
                    className="absolute top-6 right-6 z-20 pointer-events-none select-none font-serif"
                    style={{ color: "var(--hb-dark-kanji)", fontSize: "8rem", lineHeight: 1 }}
                  >
                    花火
                  </span>
                  <Image
                    src={product.heroImage}
                    alt={product.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 65vw"
                    priority
                  />
                  <div className="absolute top-6 left-6 z-10">
                    <Badge tone="sienna">
                      {product.status === "available"
                        ? "Available"
                        : product.status === "sold_out"
                        ? "Sold Out"
                        : "Archived"}
                    </Badge>
                  </div>
                  <MarginNote position="top-right" variant="script" size="xs">
                    <span style={{ color: "var(--hb-sienna)" }}>{product.year}</span>
                  </MarginNote>
                </div>

                {/* Thumbnail grid — full opacity, no SVG borders */}
                {product.images.length > 0 && (
                  <div className="grid grid-cols-3 gap-4">
                    {product.images.map((image, idx) => (
                      <div
                        key={image}
                        className="relative aspect-[4/5] overflow-hidden"
                        style={{
                          transform: `rotate(${idx % 2 === 0 ? "0.8deg" : "-0.8deg"})`,
                        }}
                      >
                        <Image
                          src={image}
                          alt={`${product.name} alternate view ${idx + 1}`}
                          fill
                          sizes="(max-width: 768px) 33vw, 200px"
                          className="object-cover"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Details panel — dark surface */}
              <div className="space-y-6 sticky top-24 bg-[var(--hb-dark-surface)] p-6 border border-[var(--hb-dark-border)]">
                <div className="space-y-4">
                  <p className="uppercase text-xs tracking-[0.4em] text-[var(--hb-sienna)] font-script opacity-70">
                    Product Details
                  </p>
                  <h1 className="font-serif text-4xl lg:text-5xl leading-tight text-[#faf8f4]">
                    {product.name}
                  </h1>
                </div>

                <div className="space-y-4 pt-4">
                  <div>
                    <p className="text-sm uppercase tracking-[0.3em] text-[var(--hb-dark-muted)] mb-2">
                      Collection
                    </p>
                    <p className="font-serif text-lg text-[#faf8f4]">{product.collection}</p>
                  </div>

                  <div>
                    <p className="text-sm uppercase tracking-[0.3em] text-[var(--hb-dark-muted)] mb-2">
                      Price
                    </p>
                    <p className="font-serif text-2xl text-[var(--hb-sienna)]">
                      ${product.price}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm uppercase tracking-[0.3em] text-[var(--hb-dark-muted)] mb-2">
                      Year
                    </p>
                    <p className="text-sm text-[var(--hb-dark-muted)]">{product.year}</p>
                  </div>

                  <div>
                    <p className="text-sm uppercase tracking-[0.3em] text-[var(--hb-dark-muted)] mb-2">
                      Tags
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {product.tags.map((tag) => (
                        <span
                          key={tag}
                          className="text-xs uppercase tracking-[0.2em] text-[var(--hb-dark-muted)] border border-dashed border-[var(--hb-dark-border)] px-3 py-1.5"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Light Bottom: Story / Materials / Notes ─────────────── */}
      <section className="px-4 sm:px-8 md:px-12 lg:px-20 py-16 relative">
        <PaperBackground intensity="subtle" texture="grain">
          <div className="absolute top-0 left-0 right-0 flex justify-center">
            <HandDrawnDivider variant="wispy" strokeOpacity={0.3} />
          </div>
          <div className="max-w-4xl mx-auto mt-16 space-y-12">
            <SketchFrame tilt="none" strokeOpacity={0.25} className="w-full">
              <div className="space-y-4">
                <p className="uppercase text-xs tracking-[0.4em] text-[var(--hb-smoke)] font-script opacity-70">
                  Story
                </p>
                <InkUnderline width={80} variant="delicate" strokeOpacity={0.3} className="mb-4" />
                <p className="text-base leading-relaxed text-[var(--hb-smoke)] opacity-85">
                  {product.story}
                </p>
              </div>
            </SketchFrame>

            <div className="grid gap-6 md:grid-cols-3">
              <SketchFrame tilt="right" strokeOpacity={0.2} className="w-full">
                <div className="space-y-3">
                  <p className="uppercase text-xs tracking-[0.3em] text-[var(--hb-smoke)] font-script opacity-70">
                    Materials
                  </p>
                  <p className="text-sm leading-relaxed text-[var(--hb-smoke)] opacity-80">
                    {product.materials}
                  </p>
                </div>
              </SketchFrame>

              <SketchFrame tilt="left" strokeOpacity={0.2} className="w-full">
                <div className="space-y-3">
                  <p className="uppercase text-xs tracking-[0.3em] text-[var(--hb-smoke)] font-script opacity-70">
                    Care
                  </p>
                  <p className="text-sm leading-relaxed text-[var(--hb-smoke)] opacity-80">
                    {product.care}
                  </p>
                </div>
              </SketchFrame>

              <SketchFrame tilt="right" strokeOpacity={0.2} className="w-full">
                <div className="space-y-3">
                  <p className="uppercase text-xs tracking-[0.3em] text-[var(--hb-smoke)] font-script opacity-70">
                    Notes
                  </p>
                  <p className="text-sm leading-relaxed text-[var(--hb-smoke)] opacity-80">
                    {product.notes}
                  </p>
                </div>
              </SketchFrame>
            </div>

            <div className="flex flex-wrap gap-3 pt-4">
              {product.tags.map((tag) => (
                <Tag key={tag}>{tag}</Tag>
              ))}
            </div>
          </div>
        </PaperBackground>
      </section>

      {/* ── Related Products (light) ─────────────────────────── */}
      {related.length > 0 && (
        <PageShell
          eyebrow="From the archive"
          title="You may also like"
          intro="Pieces that share fabrication notes or silhouettes with this garment."
          className="pt-0"
        >
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} variant="light" />
            ))}
          </div>
        </PageShell>
      )}
    </main>
  );
}
