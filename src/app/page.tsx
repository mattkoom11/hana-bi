import { HandDrawnDivider } from "@/components/common/HandDrawnDivider";
import { InkUnderline } from "@/components/common/InkUnderline";
import { PaperBackground } from "@/components/common/PaperBackground";
import { SketchFrame } from "@/components/common/SketchFrame";
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

export default async function Home() {
  let allProducts = fallbackProducts;
  let featured: typeof allProducts = [];
  let archiveSlices: typeof allProducts = [];

  try {
    try {
      const featuredCollection = await getCollectionProducts("featured");
      featured = featuredCollection.map(mapShopifyProductToHanaBiProduct).slice(0, 3);
    } catch {
      const shopifyProducts = await getAllProducts();
      allProducts = shopifyProducts.map(mapShopifyProductToHanaBiProduct);
      featured = allProducts.filter((p) => p.featured).slice(0, 3);
    }

    archiveSlices = allProducts
      .filter(
        (p) =>
          p.status === "archived" ||
          p.status === "sold_out" ||
          p.tags.some((t) => t.toUpperCase().includes("ARCHIVE"))
      )
      .slice(0, 2);
  } catch (error) {
    console.warn("Failed to fetch from Shopify, using fallback data:", error);
    featured = fallbackFeatured.slice(0, 3);
    archiveSlices = fallbackArchived.slice(0, 2);
  }

  const heroFeature = featured[0] ?? allProducts[0] ?? fallbackProducts[0];

  return (
    <main className="page-transition">
      {/* ── Dark Hero ─────────────────────────────────────────── */}
      <section className="grain relative min-h-[85vh] flex items-center justify-center overflow-hidden bg-[var(--hb-dark)]">
        {heroFeature && (
          <div className="absolute inset-0 w-full h-full">
            <Image
              src={heroFeature.heroImage}
              alt={heroFeature.name}
              fill
              className="object-cover"
              priority
              sizes="100vw"
            />
            <div
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(to top, rgba(14,12,11,0.85) 0%, rgba(14,12,11,0.3) 60%, transparent 100%)",
              }}
            />
          </div>
        )}

        {/* Ghost 花火 */}
        <span
          aria-hidden="true"
          className="absolute bottom-8 right-8 pointer-events-none select-none italic"
          style={{
            color: "var(--hb-dark-kanji)",
            fontSize: "12rem",
            lineHeight: 1,
            fontFamily: "var(--hb-font-display)",
          }}
        >
          花火
        </span>

        <div className="relative z-10 px-4 sm:px-8 md:px-12 lg:px-20 py-24 w-full max-w-6xl mx-auto">
          <div className="grid gap-16 lg:grid-cols-[1.1fr_0.9fr] items-center">
            <div className="space-y-8">
              <p
                className="uppercase text-xs tracking-[0.5em] opacity-70"
                style={{ fontFamily: "var(--hb-font-mono)", color: "var(--hb-sienna)" }}
              >
                HB — Editions of Denim
              </p>
              <h1
                className="leading-[0.92] tracking-tight text-[#faf8f4] italic font-light"
                style={{
                  fontFamily: "var(--hb-font-display)",
                  fontSize: "clamp(4rem, 10vw, 8rem)",
                }}
              >
                Archival garments documented like museum pieces.
              </h1>
              <p className="text-lg leading-relaxed text-[var(--hb-dark-muted)] max-w-lg">
                Hana-Bi traces Japanese magazine spreads and gothic annotations to
                tell the story of sustainable denim. Limited drops move swiftly from
                studio floor to archive shelves.
              </p>
              <div className="flex gap-5 flex-wrap pt-4">
                <Link
                  href="/shop"
                  className="bg-[var(--hb-sienna)] text-[#faf8f4] uppercase tracking-[0.4em] px-8 py-4 text-xs hover-wispy opacity-90 hover:opacity-100 transition-opacity"
                  style={{ fontFamily: "var(--hb-font-mono)" }}
                >
                  Enter Shop
                </Link>
                <Link
                  href="/about"
                  className="border border-[rgba(250,248,244,0.25)] text-[rgba(250,248,244,0.7)] uppercase tracking-[0.4em] px-8 py-4 text-xs hover:text-[#faf8f4] hover:border-[rgba(250,248,244,0.5)] transition-all duration-300"
                  style={{ fontFamily: "var(--hb-font-mono)" }}
                >
                  What is Hana-Bi?
                </Link>
              </div>
            </div>

            {/* Featured garment card */}
            {heroFeature && (
              <div className="grain bg-[var(--hb-dark-surface)] p-6 space-y-5 border border-[var(--hb-dark-border)]">
                <div className="relative z-10 space-y-5">
                  <p
                    className="uppercase text-xs tracking-[0.55em] opacity-60"
                    style={{ fontFamily: "var(--hb-font-mono)", color: "var(--hb-sienna)" }}
                  >
                    HB-001
                  </p>
                  <p
                    className="uppercase text-xs tracking-[0.4em] opacity-70"
                    style={{ fontFamily: "var(--hb-font-mono)", color: "var(--hb-sienna)" }}
                  >
                    Featured Garment
                  </p>
                  <h2
                    className="text-3xl leading-tight text-[#faf8f4] italic font-light"
                    style={{ fontFamily: "var(--hb-font-display)" }}
                  >
                    {heroFeature.name}
                  </h2>
                  <p className="text-sm leading-relaxed text-[var(--hb-dark-muted)]">
                    {heroFeature.story}
                  </p>
                  <Link
                    href={`/product/${heroFeature.slug}`}
                    className="text-xs uppercase tracking-[0.4em] border-b border-[var(--hb-sienna)] pb-1 inline-block hover:opacity-80 transition-opacity"
                    style={{ fontFamily: "var(--hb-font-mono)", color: "var(--hb-sienna)" }}
                  >
                    View Piece
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── Light: What is Hana-Bi? ───────────────────────────── */}
      <section className="px-4 sm:px-8 md:px-12 lg:px-20 py-24 relative">
        <PaperBackground intensity="subtle" texture="grain">
          <div className="absolute top-0 left-0 right-0 flex justify-center">
            <HandDrawnDivider variant="wispy" strokeOpacity={0.3} />
          </div>
          <div className="grid gap-16 lg:grid-cols-2 mt-12 items-center">
            <div className="space-y-6">
              <p className="uppercase text-xs tracking-[0.5em] text-[var(--hb-smoke)] font-script opacity-70">
                What is Hana-Bi?
              </p>
              <h3
                className="text-4xl lg:text-5xl leading-tight italic font-light"
                style={{ fontFamily: "var(--hb-font-display)" }}
              >
                Retail, but archival.
              </h3>
              <InkUnderline width={140} variant="delicate" strokeOpacity={0.35} className="mt-3" />
            </div>
            <p className="text-base leading-relaxed text-[var(--hb-smoke)] opacity-85 max-w-lg">
              We work like an editorial studio. Each garment is catalogued, nodded to with
              doodled borders and inked underlines throughout the site.
            </p>
          </div>
        </PaperBackground>
      </section>

      {/* ── Dark: Current Drop ────────────────────────────────── */}
      <section className="grain px-4 sm:px-8 md:px-12 lg:px-20 py-24 space-y-16 bg-[var(--hb-dark)]">
        <div className="flex items-center justify-between relative z-10">
          <div className="space-y-3">
            <p
              className="uppercase text-xs tracking-[0.4em] opacity-70"
              style={{ fontFamily: "var(--hb-font-mono)", color: "var(--hb-sienna)" }}
            >
              Featured Pieces
            </p>
            <h3
              className="text-4xl lg:text-5xl leading-tight text-[#faf8f4] italic font-light"
              style={{ fontFamily: "var(--hb-font-display)" }}
            >
              Current Drop
            </h3>
          </div>
          <Link
            href="/shop"
            className="text-xs uppercase tracking-[0.4em] border-b border-[var(--hb-dark-border)] pb-1.5 text-[var(--hb-dark-muted)] hover:text-[#faf8f4] hover:border-[var(--hb-sienna)] transition-all duration-300"
            style={{ fontFamily: "var(--hb-font-mono)" }}
          >
            View All
          </Link>
        </div>
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-3 relative z-10">
          {featured.map((product, index) => (
            <ProductCard
              key={product.id}
              product={product}
              variant="dark"
              catalogIndex={index}
            />
          ))}
        </div>
      </section>

      {/* ── Light: Archive Strip ──────────────────────────────── */}
      <section className="px-4 sm:px-8 md:px-12 lg:px-20 py-24 relative space-y-12">
        <PaperBackground intensity="subtle" texture="both">
          <div className="absolute top-0 left-0 right-0 flex justify-center">
            <HandDrawnDivider variant="delicate" strokeOpacity={0.25} />
          </div>
          <div className="flex items-center justify-between mt-12">
            <div className="space-y-3">
              <p className="uppercase text-xs tracking-[0.4em] text-[var(--hb-smoke)] font-script opacity-70">
                From The Archive
              </p>
              <h3
                className="text-4xl lg:text-5xl leading-tight italic font-light"
                style={{ fontFamily: "var(--hb-font-display)" }}
              >
                Lookbook strips
              </h3>
              <InkUnderline width={140} variant="delicate" strokeOpacity={0.35} className="mt-2" />
            </div>
            <Link
              href="/archive"
              className="text-xs uppercase tracking-[0.4em] border-b border-dashed border-[var(--hb-border)] pb-1.5 hover-wispy opacity-70 hover:opacity-100"
              style={{ fontFamily: "var(--hb-font-mono)" }}
            >
              Enter Archive
            </Link>
          </div>
          <div className="grid gap-8 md:grid-cols-2">
            {archiveSlices.map((piece) => (
              <SketchFrame
                key={piece.id}
                tilt={piece.id.includes("sea") ? "left" : "right"}
                strokeOpacity={0.3}
              >
                <div className="space-y-4">
                  <p className="uppercase text-[0.65rem] tracking-[0.4em] text-[var(--hb-smoke)] font-script opacity-70">
                    {piece.year}
                  </p>
                  <h4
                    className="text-2xl leading-tight italic font-light"
                    style={{ fontFamily: "var(--hb-font-display)" }}
                  >
                    {piece.name}
                  </h4>
                  <p className="text-sm text-[var(--hb-smoke)] opacity-80 leading-relaxed">
                    {piece.description}
                  </p>
                  <Link
                    href={`/product/${piece.slug}`}
                    className="text-xs uppercase tracking-[0.4em] border-b border-dashed border-[var(--hb-border)] pb-1 inline-block hover-wispy opacity-70 hover:opacity-100"
                    style={{ fontFamily: "var(--hb-font-mono)" }}
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
