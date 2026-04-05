import { InkUnderline } from "@/components/common/InkUnderline";
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
      {/* ── Hero ──────────────────────────────────────────────────── */}
      <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden">
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

            {/* Featured garment portrait card */}
            {heroFeature && (
              <div className="relative overflow-hidden aspect-[3/4] border border-[var(--hb-dark-border)]">
                <Image
                  src={heroFeature.heroImage}
                  alt={heroFeature.name}
                  fill
                  className="object-cover"
                  priority
                  sizes="(max-width: 1024px) 90vw, 40vw"
                />
                <div
                  className="absolute inset-0"
                  style={{
                    background:
                      "linear-gradient(to top, rgba(14,12,11,0.6) 0%, transparent 60%)",
                  }}
                />
                <div className="absolute bottom-4 left-4 space-y-1">
                  <p
                    className="uppercase text-xs tracking-[0.55em] opacity-60"
                    style={{ fontFamily: "var(--hb-font-mono)", color: "var(--hb-sienna)" }}
                  >
                    HB-001
                  </p>
                  <h2
                    className="text-xl leading-tight text-[#faf8f4] italic font-light"
                    style={{ fontFamily: "var(--hb-font-display)" }}
                  >
                    {heroFeature.name}
                  </h2>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── What is Hana-Bi? ──────────────────────────────────────── */}
      <section className="px-4 sm:px-8 md:px-12 lg:px-20 py-16 relative">
        <div className="grid gap-16 lg:grid-cols-2 items-center">
          <div className="space-y-6">
            <p
              className="uppercase text-xs tracking-[0.5em] opacity-70"
              style={{ fontFamily: "var(--hb-font-mono)", color: "var(--hb-sienna)" }}
            >
              What is Hana-Bi?
            </p>
            <h3
              className="text-4xl lg:text-5xl leading-tight italic font-light text-[#faf8f4]"
              style={{ fontFamily: "var(--hb-font-display)" }}
            >
              Retail, but archival.
            </h3>
            <InkUnderline width={140} variant="delicate" strokeOpacity={0.35} className="mt-3" />
          </div>
          <p className="text-base leading-relaxed text-[var(--hb-dark-muted)] max-w-lg">
            We work like an editorial studio. Each garment is catalogued, nodded to with
            doodled borders and inked underlines throughout the site.
          </p>
        </div>
      </section>

      {/* ── Current Drop ──────────────────────────────────────────── */}
      <section className="px-4 sm:px-8 md:px-12 lg:px-20 py-16 space-y-16">
        <div className="flex items-center justify-between">
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
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-3">
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

      {/* ── Archive Strip ─────────────────────────────────────────── */}
      <section className="px-4 sm:px-8 md:px-12 lg:px-20 py-16 space-y-12">
        <div className="flex items-center justify-between">
          <div className="space-y-3">
            <p
              className="uppercase text-xs tracking-[0.4em] opacity-70"
              style={{ fontFamily: "var(--hb-font-mono)", color: "var(--hb-sienna)" }}
            >
              From The Archive
            </p>
            <h3
              className="text-4xl lg:text-5xl leading-tight text-[#faf8f4] italic font-light"
              style={{ fontFamily: "var(--hb-font-display)" }}
            >
              Lookbook strips
            </h3>
            <InkUnderline width={140} variant="delicate" strokeOpacity={0.35} className="mt-2" />
          </div>
          <Link
            href="/archive"
            className="text-xs uppercase tracking-[0.4em] border-b border-dashed border-[var(--hb-dark-border)] pb-1.5 text-[var(--hb-dark-muted)] opacity-70 hover:opacity-100 transition-opacity"
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
              className="border-[var(--hb-dark-border)]"
            >
              <div className="space-y-4">
                <p
                  className="uppercase text-[0.65rem] tracking-[0.4em] opacity-70"
                  style={{ fontFamily: "var(--hb-font-mono)", color: "var(--hb-sienna)" }}
                >
                  {piece.year}
                </p>
                <h4
                  className="text-2xl leading-tight text-[#faf8f4] italic font-light"
                  style={{ fontFamily: "var(--hb-font-display)" }}
                >
                  {piece.name}
                </h4>
                <p className="text-sm text-[var(--hb-dark-muted)] leading-relaxed">
                  {piece.description}
                </p>
                <Link
                  href={`/product/${piece.slug}`}
                  className="text-xs uppercase tracking-[0.4em] border-b border-dashed border-[var(--hb-dark-border)] pb-1 inline-block opacity-70 hover:opacity-100 transition-opacity"
                  style={{ fontFamily: "var(--hb-font-mono)", color: "var(--hb-sienna)" }}
                >
                  View Dossier
                </Link>
              </div>
            </SketchFrame>
          ))}
        </div>
      </section>
    </main>
  );
}
