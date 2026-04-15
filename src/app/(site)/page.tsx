import { RollText } from "@/components/common/RollText";
import { SplitText } from "@/components/common/SplitText";
import { KanjiCanvas } from "@/components/common/KanjiCanvas";
import { CulturalExplainer } from "@/components/common/CulturalExplainer";
import { MorphingKanji } from "@/components/common/MorphingKanji";
import { getStripeCatalog } from "@/lib/stripe-catalog";
import Image from "next/image";
import Link from "next/link";

export default async function Home() {
  let layeredDenim = null;

  try {
    const catalog = await getStripeCatalog();
    layeredDenim =
      catalog.find((p) => p.slug === "layered-denim") ??
      catalog.find((p) => p.name.toLowerCase().includes("layered denim")) ??
      null;
  } catch {
    // no Stripe — render without the product card
  }

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
            {/* Left: copy + CTAs */}
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
                  className="group bg-[var(--hb-sienna)] text-[#faf8f4] uppercase tracking-[0.4em] px-8 py-4 text-xs opacity-90 hover:opacity-100 transition-opacity"
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

            {/* Right: Layered Denim product card */}
            {layeredDenim && layeredDenim.heroImage && (
              <Link href={`/product/${layeredDenim.slug}`} className="group block relative overflow-hidden aspect-[3/4] border border-[var(--hb-dark-border)]">
                <Image
                  src={layeredDenim.heroImage}
                  alt={layeredDenim.name}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  priority
                  sizes="(max-width: 1024px) 90vw, 40vw"
                />
                <div
                  className="absolute inset-0"
                  style={{
                    background:
                      "linear-gradient(to top, rgba(14,12,11,0.65) 0%, transparent 55%)",
                  }}
                />
                <div className="absolute bottom-4 left-4 space-y-1">
                  <p
                    className="uppercase text-xs tracking-[0.55em] opacity-60"
                    style={{ fontFamily: "var(--hb-font-mono)", color: "var(--hb-sienna)" }}
                  >
                    {layeredDenim.status === "available"
                      ? "Now Available"
                      : layeredDenim.status === "sold_out"
                      ? "Sold Out"
                      : "New Drop"}
                  </p>
                  <h2
                    className="text-xl leading-tight text-[#faf8f4] italic font-light"
                    style={{ fontFamily: "var(--hb-font-display)" }}
                  >
                    {layeredDenim.name}
                  </h2>
                </div>
                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <span
                    className="uppercase text-[0.6rem] tracking-[0.4em] text-[#faf8f4] border border-[rgba(250,248,244,0.35)] px-3 py-1.5"
                    style={{ fontFamily: "var(--hb-font-mono)" }}
                  >
                    View Product
                  </span>
                </div>
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* ── MorphingKanji ─────────────────────────────────────────── */}
      <section>
        <MorphingKanji />
      </section>
    </main>
  );
}
