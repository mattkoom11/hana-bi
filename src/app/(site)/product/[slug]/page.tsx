import { InkUnderline } from '@/components/common/InkUnderline';
import { PaperBackground } from '@/components/common/PaperBackground';
import { Tag } from '@/components/common/Tag';
import { PageShell } from '@/components/layout/PageShell';
import { ProductCard } from '@/components/shop/ProductCard';
import { ProductDetailHero } from '@/components/product/ProductDetailHero';
import { ProductStickyNav } from '@/components/product/ProductStickyNav';
import { ScribbleArrow } from '@/components/layered-denim/ScribbleArrow';
import { EmailCaptureForm } from '@/components/layered-denim/EmailCaptureForm';
import { BuyButton } from '@/components/layered-denim/BuyButton';
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

export const revalidate = 3600; // re-fetch Stripe catalog at most once per hour

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
      <ProductStickyNav />

      {/* ── Dark Hero ──────────────────────────────────────────────── */}
      <section className="relative bg-[var(--hb-dark)] min-h-[70vh] flex items-center justify-center overflow-hidden mb-0">
        <div className="relative z-10 w-full px-4 sm:px-8 md:px-12 lg:px-20 py-16">
          <div className="max-w-7xl mx-auto">
            <ProductDetailHero
              product={product}
              catalogNumber={catalogNumber}
              purchaseSlot={slug === 'layered-denim' ? <BuyButton product={product} /> : undefined}
            />
          </div>
        </div>
      </section>

      {/* ── Preorder Notice ────────────────────────────────────────── */}
      <section className="px-4 sm:px-8 md:px-12 lg:px-20 py-16 bg-[var(--hb-paper-muted)]/30">
        <div className="max-w-2xl mx-auto space-y-10">
          <div className="space-y-3">
            <p className="uppercase text-xs tracking-[0.4em] text-[var(--hb-smoke)]" style={{ fontFamily: 'var(--hb-font-mono)' }}>
              Preorder
            </p>
            <h2 className="font-serif text-3xl">Made to order — no excess, no waste.</h2>
          </div>
          <div className="space-y-5 text-base leading-relaxed text-[var(--hb-ink)]">
            <p>
              Every piece on this site is a preorder. When you purchase, your payment goes directly toward sourcing materials and manufacturing your garment. Nothing is produced speculatively.
            </p>
            <p>
              Production only begins once we reach a minimum number of orders. If that threshold isn&apos;t met, you will be fully refunded — no questions asked.
            </p>
            <p>
              Once production begins, your garment is cut, sewn, and shipped to you in <strong>2–3 months</strong>.
            </p>
          </div>
        </div>
      </section>

      {/* ── Materials ──────────────────────────────────────────────── */}
      <section id="materials" className="px-4 sm:px-8 md:px-12 lg:px-20 py-10 bg-[var(--hb-paper-muted)]/30">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-wrap gap-3">
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
