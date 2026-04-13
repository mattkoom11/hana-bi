import { HandDrawnDivider } from '@/components/common/HandDrawnDivider';
import { InkUnderline } from '@/components/common/InkUnderline';
import { PaperBackground } from '@/components/common/PaperBackground';
import { SketchFrame } from '@/components/common/SketchFrame';
import { Tag } from '@/components/common/Tag';
import { PageShell } from '@/components/layout/PageShell';
import { ProductCard } from '@/components/shop/ProductCard';
import { ProductDetailHero } from '@/components/product/ProductDetailHero';
import { ProductStickyNav } from '@/components/product/ProductStickyNav';
import { RoughBorderCard } from '@/components/layered-denim/RoughBorderCard';
import { ScribbleArrow } from '@/components/layered-denim/ScribbleArrow';
import { EmailCaptureForm } from '@/components/layered-denim/EmailCaptureForm';
import { getStripeCatalog, getStripeProductBySlug } from '@/lib/stripe-catalog';
import {
  getProductBySlug,
  products as fallbackProducts,
  type Product,
} from '@/data/products';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  try {
    const catalog = await getStripeCatalog();
    if (catalog.length > 0) return catalog.map((p) => ({ slug: p.slug }));
  } catch {}
  return fallbackProducts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  let product: Product | null = null;
  try {
    product = await getStripeProductBySlug(slug);
  } catch {}
  if (!product) product = getProductBySlug(slug) ?? null;
  if (!product) return { title: 'Piece not found — Hana-Bi' };
  return {
    title: `${product.name} — Hana-Bi`,
    description: product.description,
    openGraph: { images: [product.heroImage] },
  };
}

async function getRelatedProducts(currentSlug: string): Promise<Product[]> {
  try {
    const catalog = await getStripeCatalog();
    if (catalog.length > 0) {
      return catalog.filter((p) => p.slug !== currentSlug && p.status === 'available').slice(0, 3);
    }
  } catch {}
  return fallbackProducts
    .filter((p) => p.slug !== currentSlug && p.status === 'available')
    .slice(0, 3);
}

const materialsInfo = [
  {
    title: 'Japanese Selvedge Denim',
    description: 'Woven on traditional shuttle looms, creating a dense, durable fabric with distinctive edge characteristics.',
  },
  {
    title: 'Indigo Character',
    description: 'Deep, rich indigo that fades uniquely with wear. Each piece develops its own signature patterns over time.',
  },
  {
    title: 'Hand Feel & Weight',
    description: '13–15oz range. Structured initially, the fabric softens with wear while maintaining integrity at key stress points.',
  },
];

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  let product: Product | null = null;

  try {
    product = await getStripeProductBySlug(slug);
  } catch (error) {
    console.warn('Failed to fetch product from Stripe, using fallback:', error);
  }

  if (!product) product = getProductBySlug(slug) ?? null;
  if (!product) notFound();

  const catalogIndex = fallbackProducts.findIndex((p) => p.slug === slug);
  const catalogNumber =
    catalogIndex >= 0 ? `HB-${String(catalogIndex + 1).padStart(3, '0')}` : null;

  const related = await getRelatedProducts(product.slug);

  return (
    <main className="page-transition">
      <ProductStickyNav />

      {/* ── Dark Hero ──────────────────────────────────────────────── */}
      <section className="relative bg-[var(--hb-dark)] min-h-[70vh] flex items-center justify-center overflow-hidden mb-0">
        <div className="relative z-10 w-full px-4 sm:px-8 md:px-12 lg:px-20 py-16">
          <div className="max-w-7xl mx-auto">
            <ProductDetailHero product={product} catalogNumber={catalogNumber} />
          </div>
        </div>
      </section>

      {/* ── Materials ──────────────────────────────────────────────── */}
      <section id="materials" className="px-4 sm:px-8 md:px-12 lg:px-20 py-16 bg-[var(--hb-paper-muted)]/30">
        <div className="max-w-4xl mx-auto space-y-10">
          <div className="space-y-3">
            <p className="uppercase text-xs tracking-[0.4em] text-[var(--hb-smoke)] opacity-70" style={{ fontFamily: "var(--hb-font-mono)" }}>
              Materials
            </p>
            <HandDrawnDivider variant="wispy" strokeOpacity={0.3} />
          </div>

          {/* Product-specific materials */}
          <div className="grid gap-6 md:grid-cols-3">
            <SketchFrame tilt="right" strokeOpacity={0.2} className="w-full">
              <div className="space-y-3">
                <p className="uppercase text-xs tracking-[0.3em] text-[var(--hb-smoke)] opacity-70" style={{ fontFamily: "var(--hb-font-mono)" }}>
                  Composition
                </p>
                <p className="text-sm leading-relaxed text-[var(--hb-smoke)] opacity-80">
                  {product.materials}
                </p>
              </div>
            </SketchFrame>

            <SketchFrame tilt="left" strokeOpacity={0.2} className="w-full">
              <div className="space-y-3">
                <p className="uppercase text-xs tracking-[0.3em] text-[var(--hb-smoke)] opacity-70" style={{ fontFamily: "var(--hb-font-mono)" }}>
                  Care
                </p>
                <p className="text-sm leading-relaxed text-[var(--hb-smoke)] opacity-80">
                  {product.care}
                </p>
              </div>
            </SketchFrame>

            <SketchFrame tilt="right" strokeOpacity={0.2} className="w-full">
              <div className="space-y-3">
                <p className="uppercase text-xs tracking-[0.3em] text-[var(--hb-smoke)] opacity-70" style={{ fontFamily: "var(--hb-font-mono)" }}>
                  Notes
                </p>
                <p className="text-sm leading-relaxed text-[var(--hb-smoke)] opacity-80">
                  {product.notes}
                </p>
              </div>
            </SketchFrame>
          </div>

          {/* Denim material characteristics */}
          <div className="grid md:grid-cols-3 gap-6 pt-4">
            {materialsInfo.map((m, i) => (
              <RoughBorderCard key={i} hover className="p-6 bg-[var(--hb-paper)]">
                <h3 className="font-serif text-lg mb-3 text-[var(--hb-ink)]">{m.title}</h3>
                <p className="text-sm text-[var(--hb-smoke)] leading-relaxed">{m.description}</p>
              </RoughBorderCard>
            ))}
          </div>

          <div className="flex flex-wrap gap-3 pt-2">
            {product.tags.map((tag) => (
              <Tag key={tag}>{tag}</Tag>
            ))}
          </div>
        </div>
      </section>

      {/* ── Drop List ──────────────────────────────────────────────── */}
      <section id="drop-list" className="px-4 sm:px-8 md:px-12 lg:px-20 py-16 bg-[var(--hb-paper-muted)]/30">
        <div className="max-w-2xl mx-auto text-center space-y-6">
          <div className="space-y-3">
            <p className="uppercase text-xs tracking-[0.4em] text-[var(--hb-smoke)] opacity-70" style={{ fontFamily: "var(--hb-font-mono)" }}>
              Stay in the Loop
            </p>
            <InkUnderline width={80} variant="delicate" strokeOpacity={0.3} className="mx-auto mb-2" />
            <h2 className="font-serif text-3xl md:text-4xl text-[var(--hb-ink)] italic font-light">
              Join the Drop List
            </h2>
            <p className="text-[var(--hb-smoke)] text-base">
              Be the first to know about future releases and updates.
            </p>
          </div>
          <div className="flex justify-center pt-2">
            <ScribbleArrow direction="down" size={28} strokeOpacity={0.4} />
          </div>
          <EmailCaptureForm />
        </div>
      </section>

      {/* ── Related Products ───────────────────────────────────────── */}
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
