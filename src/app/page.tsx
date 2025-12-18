import { HandDrawnDivider } from "@/components/common/HandDrawnDivider";
import { InkUnderline } from "@/components/common/InkUnderline";
import { MarginNote } from "@/components/common/MarginNote";
import { PaperBackground } from "@/components/common/PaperBackground";
import { SketchFrame } from "@/components/common/SketchFrame";
import { Button } from "@/components/common/Button";
import { ProductCard } from "@/components/shop/ProductCard";
import { getAllProducts, getCollectionProducts } from "@/lib/shopify";
import { mapShopifyProductToHanaBiProduct } from "@/lib/shopify-mappers";
import {
  archivedProducts as fallbackArchived,
  featuredProducts as fallbackFeatured,
  products as fallbackProducts,
} from "@/data/products";
import Image from "next/image";
import Link from "next/link";

/**
 * Home page - fetches featured and archived products from Shopify
 *
 * Tries to fetch from a "featured" collection first, then falls back to
 * filtering all products by the featured metafield. Archived products
 * are filtered by status or "ARCHIVE" tag.
 */
export default async function Home() {
  let allProducts = fallbackProducts;
  let featured: typeof allProducts = [];
  let archiveSlices: typeof allProducts = [];

  try {
    // Try to fetch from a "featured" collection first
    // Customize the collection handle in getCollectionProducts("your-featured-handle")
    try {
      const featuredCollection = await getCollectionProducts("featured");
      featured = featuredCollection
        .map(mapShopifyProductToHanaBiProduct)
        .slice(0, 3);
    } catch {
      // If "featured" collection doesn't exist, fetch all and filter
      const shopifyProducts = await getAllProducts();
      allProducts = shopifyProducts.map(mapShopifyProductToHanaBiProduct);
      featured = allProducts.filter((p) => p.featured).slice(0, 3);
    }

    // Get archived products (status archived or sold_out, or ARCHIVE tag)
    archiveSlices = allProducts
      .filter(
        (p) =>
          p.status === "archived" ||
          p.status === "sold_out" ||
          p.tags.some((t) => t.toUpperCase().includes("ARCHIVE"))
      )
      .slice(0, 2);
  } catch (error) {
    console.warn(
      "Failed to fetch products from Shopify, using fallback data:",
      error
    );
    // Use fallback data
    featured = fallbackFeatured.slice(0, 3);
    archiveSlices = fallbackArchived.slice(0, 2);
  }

  const heroFeature = featured[0] ?? allProducts[0] ?? fallbackProducts[0];
  return (
    <main className="page-transition">
      {/* Full-bleed editorial hero section */}
      <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden">
        <PaperBackground intensity="subtle" texture="both" className="absolute inset-0" />
        
        {/* Full-bleed hero image with sketched border */}
        {heroFeature && (
          <div className="absolute inset-0 w-full h-full">
            <div className="relative w-full h-full">
              <Image
                src={heroFeature.heroImage}
                alt={heroFeature.name}
                fill
                className="object-cover opacity-20"
                priority
                sizes="100vw"
              />
              {/* Subtle ink strokes radiating outward */}
              <div className="absolute inset-0 pointer-events-none">
                <svg className="w-full h-full" viewBox="0 0 1000 1000" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="radial-stroke" x1="50%" y1="50%" x2="50%" y2="0%">
                      <stop offset="0%" stopColor="var(--hb-ink)" stopOpacity="0.15" />
                      <stop offset="100%" stopColor="var(--hb-ink)" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <path
                    d="M 500,500 Q 300,200 200,200 Q 100,200 100,300 Q 100,400 200,400 Q 300,400 500,500"
                    fill="none"
                    stroke="url(#radial-stroke)"
                    strokeWidth="1.5"
                    opacity="0.3"
                  />
                  <path
                    d="M 500,500 Q 700,200 800,200 Q 900,200 900,300 Q 900,400 800,400 Q 700,400 500,500"
                    fill="none"
                    stroke="url(#radial-stroke)"
                    strokeWidth="1.5"
                    opacity="0.3"
                  />
                </svg>
              </div>
            </div>
          </div>
        )}

        {/* Editorial content overlay */}
        <div className="relative z-10 px-4 sm:px-8 md:px-12 lg:px-20 py-24 w-full max-w-6xl mx-auto">
          <div className="grid gap-16 lg:grid-cols-[1.1fr_0.9fr] items-center">
            <div className="space-y-8">
              <p className="uppercase text-xs tracking-[0.5em] text-[var(--hb-smoke)] font-script opacity-70">
                Hana-Bi — Editions of Denim
              </p>
              <h1 className="font-serif text-5xl lg:text-7xl leading-[1.05] tracking-tight">
                Archival garments documented like museum pieces.
              </h1>
              <InkUnderline width={220} variant="wispy" strokeOpacity={0.4} />
              <p className="text-lg leading-relaxed text-[var(--hb-smoke)] opacity-85 max-w-lg">
                Hana-Bi traces Japanese magazine spreads and gothic annotations to
                tell the story of sustainable denim. Limited drops move swiftly from
                studio floor to archive shelves.
              </p>
              <div className="flex gap-5 flex-wrap pt-4">
                <Link href="/shop">
                  <Button variant="primary">
                    Enter Shop
                  </Button>
                </Link>
                <Link href="/about">
                  <Button variant="secondary">
                    What is Hana-Bi?
                  </Button>
                </Link>
              </div>
            </div>
            {heroFeature && (
              <SketchFrame tilt="right" className="w-full" strokeOpacity={0.3}>
                <div className="space-y-5">
                  <p className="uppercase text-xs tracking-[0.4em] text-[var(--hb-smoke)] font-script opacity-70">
                    Featured Garment
                  </p>
                  <h2 className="font-serif text-3xl leading-tight">{heroFeature.name}</h2>
                  <p className="text-sm leading-relaxed text-[var(--hb-smoke)] opacity-80">
                    {heroFeature.story}
                  </p>
                  <Link
                    href={`/product/${heroFeature.slug}`}
                    className="text-xs uppercase tracking-[0.4em] border-b border-dashed border-[var(--hb-border)] pb-1 inline-block hover-wispy opacity-70 hover:opacity-100"
                  >
                    View Piece
                  </Link>
                </div>
              </SketchFrame>
            )}
          </div>
        </div>

        {/* Handwritten signature */}
        <MarginNote position="bottom-right" variant="script" size="sm" className="!opacity-50 z-10">
          Hana-Bi
        </MarginNote>
      </section>

      <section className="px-4 sm:px-8 md:px-12 lg:px-20 py-24 relative">
        <PaperBackground intensity="subtle" texture="grain">
          {/* Hand-drawn divider */}
          <div className="absolute top-0 left-0 right-0 flex justify-center">
            <HandDrawnDivider variant="wispy" strokeOpacity={0.3} />
          </div>
          
          <div className="grid gap-16 lg:grid-cols-2 mt-12 items-center">
            <div className="space-y-6">
              <p className="uppercase text-xs tracking-[0.5em] text-[var(--hb-smoke)] font-script opacity-70">
                What is Hana-Bi?
              </p>
              <h3 className="font-serif text-4xl lg:text-5xl leading-tight">Retail, but archival.</h3>
              <InkUnderline width={140} variant="delicate" strokeOpacity={0.35} className="mt-3" />
            </div>
            <p className="text-base leading-relaxed text-[var(--hb-smoke)] opacity-85 max-w-lg">
              We work like an editorial studio. Each garment is catalogued with
              handwritten notes, nodded to with doodled borders and inked
              underlines throughout the site. Copy, imagery, and drop cadence can
              be edited inside `/data/products.ts` and future CMS hooks.
            </p>
          </div>
        </PaperBackground>
      </section>

      <section className="px-4 sm:px-8 md:px-12 lg:px-20 py-24 space-y-16">
        <div className="flex items-center justify-between">
          <div className="space-y-3">
            <p className="uppercase text-xs tracking-[0.4em] text-[var(--hb-smoke)] font-script opacity-70">
              Featured Pieces
            </p>
            <h3 className="font-serif text-4xl lg:text-5xl leading-tight">Current Drop</h3>
            <InkUnderline width={120} variant="wispy" strokeOpacity={0.35} className="mt-2" />
          </div>
          <Link
            href="/shop"
            className="text-xs uppercase tracking-[0.4em] border-b border-dashed border-[var(--hb-border)] pb-1.5 hover-wispy opacity-70 hover:opacity-100"
          >
            View All
          </Link>
        </div>
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-3">
          {featured.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      <section className="px-4 sm:px-8 md:px-12 lg:px-20 py-24 relative space-y-12">
        <PaperBackground intensity="subtle" texture="both">
          {/* Hand-drawn divider */}
          <div className="absolute top-0 left-0 right-0 flex justify-center">
            <HandDrawnDivider variant="delicate" strokeOpacity={0.25} />
          </div>
          
          <div className="flex items-center justify-between mt-12">
            <div className="space-y-3">
              <p className="uppercase text-xs tracking-[0.4em] text-[var(--hb-smoke)] font-script opacity-70">
                From The Archive
              </p>
              <h3 className="font-serif text-4xl lg:text-5xl leading-tight">Lookbook strips</h3>
              <InkUnderline width={140} variant="delicate" strokeOpacity={0.35} className="mt-2" />
            </div>
            <Link
              href="/archive"
              className="text-xs uppercase tracking-[0.4em] border-b border-dashed border-[var(--hb-border)] pb-1.5 hover-wispy opacity-70 hover:opacity-100"
            >
              Enter Archive
            </Link>
          </div>
          <div className="grid gap-8 md:grid-cols-2">
            {archiveSlices.map((piece) => (
              <SketchFrame key={piece.id} tilt={piece.id.includes("sea") ? "left" : "right"} strokeOpacity={0.3}>
                <div className="space-y-4">
                  <p className="uppercase text-[0.65rem] tracking-[0.4em] text-[var(--hb-smoke)] font-script opacity-70">
                    {piece.year}
                  </p>
                  <h4 className="font-serif text-2xl leading-tight">{piece.name}</h4>
                  <p className="text-sm text-[var(--hb-smoke)] opacity-80 leading-relaxed">{piece.description}</p>
                  <Link
                    href={`/product/${piece.slug}`}
                    className="text-xs uppercase tracking-[0.4em] border-b border-dashed border-[var(--hb-border)] pb-1 inline-block hover-wispy opacity-70 hover:opacity-100"
                  >
                    View Dossier
                  </Link>
                </div>
              </SketchFrame>
            ))}
          </div>
        </PaperBackground>
      </section>
    </main>
  );
}
