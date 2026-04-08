import { RollText } from "@/components/common/RollText";
import { SplitText } from "@/components/common/SplitText";
import { KanjiCanvas } from "@/components/common/KanjiCanvas";
import { CulturalExplainer } from "@/components/common/CulturalExplainer";
import { MorphingKanji } from "@/components/common/MorphingKanji";
import Link from "next/link";

export default function Home() {
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
          <div className="space-y-8 max-w-2xl">
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
        </div>
      </section>

      {/* ── MorphingKanji ─────────────────────────────────────────── */}
      <section>
        <MorphingKanji />
      </section>
    </main>
  );
}
