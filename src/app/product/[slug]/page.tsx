import { Badge } from "@/components/common/Badge";
import { HandDrawnDivider } from "@/components/common/HandDrawnDivider";
import { InkUnderline } from "@/components/common/InkUnderline";
import { MarginNote } from "@/components/common/MarginNote";
import { PaperBackground } from "@/components/common/PaperBackground";
import { SketchFrame } from "@/components/common/SketchFrame";
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
    <main className="page-transition">
      {/* Editorial hero section with large image */}
      <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden mb-20">
        <PaperBackground intensity="subtle" texture="both" className="absolute inset-0" />
        
        <div className="relative z-10 w-full px-4 sm:px-8 md:px-12 lg:px-20 py-16">
          <div className="max-w-7xl mx-auto">
            <div className="grid gap-12 lg:grid-cols-[1.3fr_0.7fr] items-start">
              {/* Large editorial hero image */}
              <div className="relative space-y-6">
                <div className="relative w-full aspect-[3/4] overflow-hidden -rotate-[0.5deg]">
                  {/* Hand-drawn border overlay */}
                  <svg className="absolute inset-0 w-full h-full pointer-events-none z-20" viewBox="0 0 400 533" preserveAspectRatio="none" style={{ opacity: 0.25 }}>
                    <defs>
                      <linearGradient id="hero-frame-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="var(--hb-ink)" stopOpacity="0.4" />
                        <stop offset="50%" stopColor="var(--hb-ink)" stopOpacity="0.2" />
                        <stop offset="100%" stopColor="var(--hb-ink)" stopOpacity="0.35" />
                      </linearGradient>
                    </defs>
                    <path
                      d="M 10,10 Q 14,8 18,10 Q 200,6 382,10 Q 386,8 390,10 Q 390,14 390,18 Q 394,266 390,515 Q 390,519 390,523 Q 386,525 382,523 Q 200,527 18,523 Q 14,525 10,523 Q 10,519 10,515 Q 6,266 10,18 Q 10,14 10,10 Z"
                      fill="none"
                      stroke="url(#hero-frame-gradient)"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      vectorEffect="non-scaling-stroke"
                    />
                  </svg>
                  <div className="relative w-full h-full">
                    <Image
                      src={product.heroImage}
                      alt={product.name}
                      fill
                      className="object-cover"
                      sizes="(max-width: 1024px) 100vw, 65vw"
                      priority
                    />
                    <div className="absolute top-6 left-6 z-10">
                      <Badge tone={product.status === "available" ? "sienna" : "smoke"}>
                        {product.status === "available" ? "Edition" : product.status.replace("_", " ")}
                      </Badge>
                    </div>
                    
                    {/* Margin notes */}
                    <MarginNote position="top-right" variant="script" size="xs">
                      pattern {product.year}
                    </MarginNote>
                    <MarginNote position="bottom-left" variant="script" size="xs">
                      {product.collection}
                    </MarginNote>
                  </div>
                </div>
                
                {/* Thumbnail grid with hand-drawn frames */}
                <div className="grid grid-cols-3 gap-4">
                  {product.images.map((image, idx) => (
                    <div key={image} className="relative aspect-[4/5] overflow-hidden" style={{ transform: `rotate(${idx % 2 === 0 ? '0.8deg' : '-0.8deg'})` }}>
                      {/* Hand-drawn border */}
                      <svg className="absolute inset-0 w-full h-full pointer-events-none z-10" viewBox="0 0 200 250" preserveAspectRatio="none" style={{ opacity: 0.2 }}>
                        <defs>
                          <linearGradient id={`thumb-frame-${idx}`} x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="var(--hb-ink)" stopOpacity="0.3" />
                            <stop offset="100%" stopColor="var(--hb-ink)" stopOpacity="0.2" />
                          </linearGradient>
                        </defs>
                        <path
                          d="M 5,5 Q 7,4 9,5 Q 100,3 191,5 Q 193,4 195,5 Q 195,7 195,9 Q 197,125 195,241 Q 195,243 195,245 Q 193,246 191,245 Q 100,247 9,245 Q 7,246 5,245 Q 5,243 5,241 Q 3,125 5,9 Q 5,7 5,5 Z"
                          fill="none"
                          stroke={`url(#thumb-frame-${idx})`}
                          strokeWidth="1"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          vectorEffect="non-scaling-stroke"
                        />
                      </svg>
                      <Image
                        src={image}
                        alt={`${product.name} alternate view ${idx + 1}`}
                        fill
                        sizes="(max-width: 768px) 33vw, 200px"
                        className="object-cover relative z-0"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Purchase panel and details */}
              <div className="space-y-6 sticky top-24">
                <ProductPurchasePanel
                  product={product}
                  shopifyProductNode={shopifyProductNode}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Editorial details section */}
      <section className="px-4 sm:px-8 md:px-12 lg:px-20 py-16 relative">
        <PaperBackground intensity="subtle" texture="grain">
          <div className="absolute top-0 left-0 right-0 flex justify-center">
            <HandDrawnDivider variant="wispy" strokeOpacity={0.3} />
          </div>
          
          <div className="max-w-4xl mx-auto mt-16 space-y-12">
            {/* Story section */}
            <SketchFrame tilt="none" strokeOpacity={0.25} className="w-full">
              <div className="space-y-4">
                <p className="uppercase text-xs tracking-[0.4em] text-[var(--hb-smoke)] font-script opacity-70">
                  Story
                </p>
                <InkUnderline width={80} variant="delicate" strokeOpacity={0.3} className="mb-4" />
                <p className="text-base leading-relaxed text-[var(--hb-smoke)] opacity-85">{product.story}</p>
                <div className="pt-4">
                  <SizeGuideModal />
                </div>
              </div>
            </SketchFrame>

            {/* Materials, Care, Notes */}
            <div className="grid gap-6 md:grid-cols-3">
              <SketchFrame tilt="right" strokeOpacity={0.2} className="w-full">
                <div className="space-y-3">
                  <p className="uppercase text-xs tracking-[0.3em] text-[var(--hb-smoke)] font-script opacity-70">
                    Materials
                  </p>
                  <p className="text-sm leading-relaxed text-[var(--hb-smoke)] opacity-80">{product.materials}</p>
                </div>
              </SketchFrame>
              
              <SketchFrame tilt="left" strokeOpacity={0.2} className="w-full">
                <div className="space-y-3">
                  <p className="uppercase text-xs tracking-[0.3em] text-[var(--hb-smoke)] font-script opacity-70">
                    Care
                  </p>
                  <p className="text-sm leading-relaxed text-[var(--hb-smoke)] opacity-80">{product.care}</p>
                </div>
              </SketchFrame>
              
              <SketchFrame tilt="right" strokeOpacity={0.2} className="w-full">
                <div className="space-y-3">
                  <p className="uppercase text-xs tracking-[0.3em] text-[var(--hb-smoke)] font-script opacity-70">
                    Notes
                  </p>
                  <p className="text-sm leading-relaxed text-[var(--hb-smoke)] opacity-80">{product.notes}</p>
                </div>
              </SketchFrame>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-3 pt-4">
              {product.tags.map((tag) => (
                <Tag key={tag}>{tag}</Tag>
              ))}
            </div>
          </div>
        </PaperBackground>
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

