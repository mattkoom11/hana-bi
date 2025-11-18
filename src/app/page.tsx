import { InkUnderline } from "@/components/common/InkUnderline";
import { SketchFrame } from "@/components/common/SketchFrame";
import { ProductCard } from "@/components/shop/ProductCard";
import {
  archivedProducts,
  featuredProducts,
  products,
} from "@/data/products";
import Link from "next/link";

const featured = featuredProducts.slice(0, 3);
const archiveSlices = archivedProducts.slice(0, 2);
const heroFeature = featuredProducts[0] ?? products[0];

export default function Home() {
  return (
    <main>
      <section className="px-4 sm:px-8 md:px-12 lg:px-20 py-16 grid gap-10 lg:grid-cols-[1.1fr_0.9fr] items-center">
        <div className="space-y-6">
          <p className="uppercase text-xs tracking-[0.5em] text-[var(--hb-smoke)]">
            Hana-Bi — Editions of Denim
          </p>
          <h1 className="font-serif text-5xl leading-tight">
            Archival garments documented like museum pieces.
          </h1>
          <p className="text-base leading-relaxed text-[var(--hb-smoke)]">
            Hana-Bi traces Japanese magazine spreads and gothic annotations to
            tell the story of sustainable denim. Limited drops move swiftly from
            studio floor to archive shelves.
          </p>
          <div className="flex gap-4 flex-wrap">
            <Link
              href="/shop"
              className="border border-[var(--hb-ink)] bg-[var(--hb-ink)] text-[var(--hb-paper)] uppercase tracking-[0.4em] px-6 py-3 text-xs"
            >
              Enter Shop
            </Link>
            <Link
              href="/about"
              className="border border-[var(--hb-border)] uppercase tracking-[0.4em] px-6 py-3 text-xs"
            >
              What is Hana-Bi?
            </Link>
          </div>
        </div>
        {heroFeature && (
          <SketchFrame tilt="right" className="w-full">
            <div className="space-y-4">
              <p className="uppercase text-xs tracking-[0.4em] text-[var(--hb-smoke)]">
                Featured Garment
              </p>
              <h2 className="font-serif text-3xl">{heroFeature.name}</h2>
              <p className="text-sm leading-relaxed text-[var(--hb-smoke)]">
                {heroFeature.story}
              </p>
              <Link
                href={`/product/${heroFeature.slug}`}
                className="text-xs uppercase tracking-[0.4em] underline underline-offset-4"
              >
                View Piece
              </Link>
            </div>
          </SketchFrame>
        )}
      </section>

      <section className="px-4 sm:px-8 md:px-12 lg:px-20 py-12 border-t border-b border-[var(--hb-border)] bg-[var(--hb-paper-muted)]">
        <InkUnderline />
        <div className="grid gap-8 lg:grid-cols-2 mt-6">
          <div>
            <p className="uppercase text-xs tracking-[0.5em] text-[var(--hb-smoke)]">
              What is Hana-Bi?
            </p>
            <h3 className="font-serif text-3xl mt-3">Retail, but archival.</h3>
          </div>
          <p className="text-sm leading-relaxed text-[var(--hb-smoke)]">
            We work like an editorial studio. Each garment is catalogued with
            handwritten notes, nodded to with doodled borders and inked
            underlines throughout the site. Copy, imagery, and drop cadence can
            be edited inside `/data/products.ts` and future CMS hooks.
          </p>
        </div>
      </section>

      <section className="px-4 sm:px-8 md:px-12 lg:px-20 py-16 space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <p className="uppercase text-xs tracking-[0.4em] text-[var(--hb-smoke)]">
              Featured Pieces
            </p>
            <h3 className="font-serif text-3xl mt-2">Current Drop</h3>
          </div>
          <Link
            href="/shop"
            className="text-xs uppercase tracking-[0.4em] border-b border-[var(--hb-border)]"
          >
            View All
          </Link>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {featured.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      <section className="px-4 sm:px-8 md:px-12 lg:px-20 py-16 border-t border-[var(--hb-border)] bg-[var(--hb-paper-muted)] space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="uppercase text-xs tracking-[0.4em] text-[var(--hb-smoke)]">
              From The Archive
            </p>
            <h3 className="font-serif text-3xl mt-2">Lookbook strips</h3>
          </div>
          <Link
            href="/archive"
            className="text-xs uppercase tracking-[0.4em] border-b border-[var(--hb-border)]"
          >
            Enter Archive
          </Link>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {archiveSlices.map((piece) => (
            <article
              key={piece.id}
              className="flex flex-col gap-2 border border-[var(--hb-border)] p-4"
            >
              <p className="uppercase text-[0.65rem] tracking-[0.4em] text-[var(--hb-smoke)]">
                {piece.year}
              </p>
              <h4 className="font-serif text-2xl">{piece.name}</h4>
              <p className="text-sm text-[var(--hb-smoke)]">{piece.description}</p>
              <Link
                href={`/product/${piece.slug}`}
                className="text-xs uppercase tracking-[0.4em] underline underline-offset-4"
              >
                View Dossier
              </Link>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
