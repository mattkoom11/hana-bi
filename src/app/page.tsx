import { InkUnderline } from "@/components/common/InkUnderline";
import { RollText } from "@/components/common/RollText";
import { SketchFrame } from "@/components/common/SketchFrame";
import { SplitText } from "@/components/common/SplitText";
import { FillLink } from "@/components/common/FillLink";
import { KanjiCanvas } from "@/components/common/KanjiCanvas";
import { CulturalExplainer } from "@/components/common/CulturalExplainer";
import { MorphingKanji } from "@/components/common/MorphingKanji";
import { StickyScrollSection } from "@/components/common/StickyScrollSection";
import { ProductCard } from "@/components/shop/ProductCard";
import { getStripeCatalog } from '@/lib/stripe-catalog';
import {
  archivedProducts as fallbackArchived,
  featuredProducts as fallbackFeatured,
  products as fallbackProducts,
} from '@/data/products';
import Image from "next/image";
import Link from "next/link";

const PHILOSOPHY_PANELS = [
  {
    id: "craft",
    content: (
      <div className="space-y-6 max-w-xl">
        <p className="uppercase text-xs tracking-[0.5em] opacity-70" style={{ fontFamily: "var(--hb-font-mono)", color: "var(--hb-sienna)" }}>Craft</p>
        <h3 className="text-4xl lg:text-5xl leading-tight italic font-light text-[#faf8f4]" style={{ fontFamily: "var(--hb-font-display)" }}>Retail, but archival.</h3>
        <InkUnderline width={140} variant="delicate" strokeOpacity={0.35} />
        <p className="text-base leading-relaxed text-[var(--hb-dark-muted)]">We work like an editorial studio. Each garment is catalogued, nodded to with doodled borders and inked underlines throughout the site.</p>
      </div>
    ),
  },
  {
    id: "material",
    content: (
      <div className="space-y-6 max-w-xl">
        <p className="uppercase text-xs tracking-[0.5em] opacity-70" style={{ fontFamily: "var(--hb-font-mono)", color: "var(--hb-sienna)" }}>Material</p>
        <h3 className="text-4xl lg:text-5xl leading-tight italic font-light text-[#faf8f4]" style={{ fontFamily: "var(--hb-font-display)" }}>Denim as document.</h3>
        <InkUnderline width={140} variant="delicate" strokeOpacity={0.35} />
        <p className="text-base leading-relaxed text-[var(--hb-dark-muted)]">Japanese selvedge, sourced from the same mills that supplied post-war Americana. Every thread carries provenance you can read like a margin note.</p>
      </div>
    ),
  },
  {
    id: "edition",
    content: (
      <div className="space-y-6 max-w-xl">
        <p className="uppercase text-xs tracking-[0.5em] opacity-70" style={{ fontFamily: "var(--hb-font-mono)", color: "var(--hb-sienna)" }}>Edition</p>
        <h3 className="text-4xl lg:text-5xl leading-tight italic font-light text-[#faf8f4]" style={{ fontFamily: "var(--hb-font-display)" }}>Limited. Numbered. Gone.</h3>
        <InkUnderline width={140} variant="delicate" strokeOpacity={0.35} />
        <p className="text-base leading-relaxed text-[var(--hb-dark-muted)]">Once a run closes, it moves to the Archive. No restocks — only records. The garment you hold is the garment that existed.</p>
      </div>
    ),
  },
];

export default async function Home() {
  let allProducts = fallbackProducts;
  let featured: typeof allProducts = [];
  let archiveSlices: typeof allProducts = [];

  try {
    const catalog = await getStripeCatalog();
    if (catalog.length > 0) {
      allProducts = catalog;
      featured = catalog.filter((p) => p.featured).slice(0, 3);
      archiveSlices = catalog
        .filter((p) => p.status === 'archived' || p.status === 'sold_out')
        .slice(0, 2);
    } else {
      featured = fallbackFeatured.slice(0, 3);
      archiveSlices = fallbackArchived.slice(0, 2);
    }
  } catch (error) {
    console.warn('Failed to fetch from Stripe, using fallback data:', error);
    featured = fallbackFeatured.slice(0, 3);
    archiveSlices = fallbackArchived.slice(0, 2);
  }

  const heroFeature = featured[0] ?? allProducts[0] ?? fallbackProducts[0];

  return (
    <main className="page-transition">
      {/* ── Hero ──────────────────────────────────────────────────── */}
      <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden">
        {/* KanjiCanvas 花火 */}
        <div
          aria-hidden="true"
          className="absolute bottom-8 right-8 pointer-events-none select-none"
          style={{ width: "420px", height: "280px" }}
        >
          <KanjiCanvas kanji="花火" sampleStep={5} />
        </div>

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
                  fontSize: "clamp(2.5rem, 7vw, 7rem)",
                }}
              >
                <SplitText tag="span" charDelay={35}>Archival garments documented like museum pieces.</SplitText>
              </h1>
              <p className="text-lg leading-relaxed text-[var(--hb-dark-muted)] max-w-lg">
                Hana-Bi traces Japanese magazine spreads and gothic annotations to
                tell the story of sustainable denim. Limited drops move swiftly from
                studio floor to archive shelves.
              </p>
              <div className="flex gap-5 flex-wrap pt-4">
                <Link
                  href="/shop"
                  className="group bg-[var(--hb-sienna)] text-[#faf8f4] uppercase tracking-[0.4em] px-8 py-4 text-xs opacity-90 hover:opacity-100 transition-opacity"
                  style={{ fontFamily: "var(--hb-font-mono)" }}
                >
                  <RollText>Enter Shop</RollText>
                </Link>
                <Link
                  href="/about"
                  className="group border border-[rgba(250,248,244,0.25)] text-[rgba(250,248,244,0.7)] uppercase tracking-[0.4em] px-8 py-4 text-xs hover:text-[#faf8f4] hover:border-[rgba(250,248,244,0.5)] transition-all duration-300"
                  style={{ fontFamily: "var(--hb-font-mono)" }}
                >
                  <RollText>What is Hana-Bi?</RollText>
                </Link>
              </div>
              <CulturalExplainer
                trigger="scroll"
                term={{ kanji: "花火", reading: "Hana-Bi", meaning: "fireworks — lit. flower fire" }}
                className="mt-6"
              />
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

      {/* ── MorphingKanji ─────────────────────────────────────────── */}
      <section>
        <MorphingKanji />
      </section>

      {/* ── Philosophy (StickyScrollSection) ─────────────────────── */}
      <StickyScrollSection
        sectionLabel="Philosophy"
        panels={PHILOSOPHY_PANELS}
        className="px-4 sm:px-8 md:px-12 lg:px-20"
      />

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
              <SplitText tag="span" charDelay={30}>Current Drop</SplitText>
            </h3>
          </div>
          <Link
            href="/shop"
            className="group text-xs uppercase tracking-[0.4em] border-b border-[var(--hb-dark-border)] pb-1.5 text-[var(--hb-dark-muted)] hover:text-[#faf8f4] hover:border-[var(--hb-sienna)] transition-all duration-300"
            style={{ fontFamily: "var(--hb-font-mono)" }}
          >
            <RollText>View All</RollText>
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
              <SplitText tag="span" charDelay={35}>Lookbook strips</SplitText>
            </h3>
            <InkUnderline width={140} variant="delicate" strokeOpacity={0.35} className="mt-2" />
          </div>
          <Link
            href="/archive"
            className="group text-xs uppercase tracking-[0.4em] border-b border-dashed border-[var(--hb-dark-border)] pb-1.5 text-[var(--hb-dark-muted)] opacity-70 hover:opacity-100 transition-opacity"
            style={{ fontFamily: "var(--hb-font-mono)" }}
          >
            <RollText>Enter Archive</RollText>
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
                <FillLink
                  href={`/product/${piece.slug}`}
                  className="text-xs uppercase tracking-[0.4em] border-b border-dashed border-[var(--hb-dark-border)] pb-1 inline-block opacity-70 hover:opacity-100 transition-opacity"
                  style={{ fontFamily: "var(--hb-font-mono)", color: "var(--hb-sienna)" }}
                >
                  <RollText>View Dossier</RollText>
                </FillLink>
              </div>
            </SketchFrame>
          ))}
        </div>
      </section>
    </main>
  );
}
