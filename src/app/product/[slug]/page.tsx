import { HandDrawnDivider } from '@/components/common/HandDrawnDivider';
import { InkUnderline } from '@/components/common/InkUnderline';
import { PaperBackground } from '@/components/common/PaperBackground';
import { SketchFrame } from '@/components/common/SketchFrame';
import { Tag } from '@/components/common/Tag';
import { PageShell } from '@/components/layout/PageShell';
import { ProductCard } from '@/components/shop/ProductCard';
import { ProductDetailHero } from '@/components/product/ProductDetailHero';
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
      {/* ── Dark Top Section ───────────────────────────────────── */}
      <section className="relative bg-[var(--hb-dark)] min-h-[70vh] flex items-center justify-center overflow-hidden mb-0">
        <div className="relative z-10 w-full px-4 sm:px-8 md:px-12 lg:px-20 py-16">
          <div className="max-w-7xl mx-auto">
            <ProductDetailHero product={product} catalogNumber={catalogNumber} />
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
                <p className="uppercase text-xs tracking-[0.4em] text-[var(--hb-smoke)] opacity-70" style={{ fontFamily: "var(--hb-font-mono)" }}>
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
                  <p className="uppercase text-xs tracking-[0.3em] text-[var(--hb-smoke)] opacity-70" style={{ fontFamily: "var(--hb-font-mono)" }}>
                    Materials
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
