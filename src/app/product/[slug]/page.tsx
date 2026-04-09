import { HandDrawnDivider } from '@/components/common/HandDrawnDivider';
import { InkUnderline } from '@/components/common/InkUnderline';
import { PaperBackground } from '@/components/common/PaperBackground';
import { SketchFrame } from '@/components/common/SketchFrame';
import { Tag } from '@/components/common/Tag';
import { PageShell } from '@/components/layout/PageShell';
import { ProductCard } from '@/components/shop/ProductCard';
import { ProductDetailHero } from '@/components/product/ProductDetailHero';
import { ProductStickyNav } from '@/components/product/ProductStickyNav';
import { FAQAccordion } from '@/components/layered-denim/FAQAccordion';
import { WearTimeline } from '@/components/layered-denim/WearTimeline';
import { RoughBorderCard } from '@/components/layered-denim/RoughBorderCard';
import { ScribbleUnderline } from '@/components/layered-denim/ScribbleUnderline';
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

const faqItems = [
  {
    question: 'Where is this garment made?',
    answer: 'Designed and manufactured in small batches with meticulous attention to detail. Each garment is constructed with the same care given to archival pieces.',
  },
  {
    question: 'What is selvedge denim?',
    answer: 'Selvedge (self-edge) denim refers to denim woven on traditional shuttle looms, creating a finished edge that prevents unraveling. This method produces a denser, higher-quality fabric with distinctive edge characteristics.',
  },
  {
    question: 'How should I care for this garment?',
    answer: 'Wash infrequently (every 6–12 months for best fades), inside out, cold water, hang dry. Avoid machine drying to preserve fabric integrity and prevent excessive shrinkage.',
  },
  {
    question: 'What sizing is available?',
    answer: 'Refer to the size options listed on this page. Sizing runs true — size down for a closer fit, or go with your usual size for a relaxed silhouette.',
  },
  {
    question: 'Will there be a restock?',
    answer: 'Each drop is limited. We may produce additional runs based on demand, but each batch is unique. Join the drop list to be notified of future availability.',
  },
  {
    question: 'What are shipping options?',
    answer: 'We ship worldwide. Domestic shipping takes 5–7 business days. International shipping varies by destination. All orders include tracking.',
  },
];

const timelineItems = [
  {
    period: 'Day 1',
    title: 'Fresh Cut',
    description: 'Crisp indigo with structured hand. The fabric feels substantial and holds its shape.',
  },
  {
    period: 'Month 3',
    title: 'Breaking In',
    description: 'The denim begins to mold to your body. First creases form at stress points—knees, seat, and cuffs.',
  },
  {
    period: 'Year 1',
    title: 'Character Emerges',
    description: 'Distinctive fade patterns unique to your wear. The fabric softens while maintaining structure at key areas.',
  },
];

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

      {/* ── Story ──────────────────────────────────────────────────── */}
      <section id="story" className="px-4 sm:px-8 md:px-12 lg:px-20 py-16 relative">
        <PaperBackground intensity="subtle" texture="grain">
          <div className="absolute top-0 left-0 right-0 flex justify-center">
            <HandDrawnDivider variant="wispy" strokeOpacity={0.3} />
          </div>
          <div className="max-w-4xl mx-auto mt-16 space-y-6">
            <p className="uppercase text-xs tracking-[0.4em] text-[var(--hb-smoke)] opacity-70" style={{ fontFamily: "var(--hb-font-mono)" }}>
              Story
            </p>
            <ScribbleUnderline width={80} strokeOpacity={0.4} />
            <SketchFrame tilt="none" strokeOpacity={0.25} className="w-full">
              <p className="text-base leading-relaxed text-[var(--hb-smoke)] opacity-85">
                {product.story}
              </p>
            </SketchFrame>
            <div className="pt-4 space-y-2">
              <p className="font-script text-[var(--hb-smoke)] text-sm italic">Built to age.</p>
              <p className="font-script text-[var(--hb-smoke)] text-sm italic">Wear marks encouraged.</p>
            </div>
          </div>
        </PaperBackground>
      </section>

      {/* ── Materials ──────────────────────────────────────────────── */}
      <section id="materials" className="px-4 sm:px-8 md:px-12 lg:px-20 py-16 bg-[var(--hb-paper-muted)]/30">
        <div className="max-w-4xl mx-auto space-y-10">
          <div className="space-y-3">
            <p className="uppercase text-xs tracking-[0.4em] text-[var(--hb-smoke)] opacity-70" style={{ fontFamily: "var(--hb-font-mono)" }}>
              Materials
            </p>
            <ScribbleUnderline width={100} strokeOpacity={0.4} />
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

      {/* ── Construction ───────────────────────────────────────────── */}
      <section id="construction" className="px-4 sm:px-8 md:px-12 lg:px-20 py-16">
        <div className="max-w-4xl mx-auto space-y-10">
          <div className="space-y-3">
            <p className="uppercase text-xs tracking-[0.4em] text-[var(--hb-smoke)] opacity-70" style={{ fontFamily: "var(--hb-font-mono)" }}>
              Construction
            </p>
            <ScribbleUnderline width={120} strokeOpacity={0.4} />
            <p className="text-[var(--hb-smoke)] text-base max-w-xl">
              Layered panel construction with reinforced seams at every stress point.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              {[
                {
                  title: 'Layered Panel Construction',
                  body: 'Multiple fabric layers at key areas—seat, knees, and cuffs—provide durability while allowing natural movement.',
                },
                {
                  title: 'Reinforced Seams',
                  body: 'Double-stitched and bar-tacked at all stress points. Chain-stitched hems for authentic finish.',
                },
                {
                  title: 'Hand-Finished Details',
                  body: 'Pockets, edges, and closures receive individual attention. Each garment is inspected before finishing.',
                },
              ].map((item) => (
                <div key={item.title} className="flex gap-4 items-start">
                  <ScribbleArrow direction="right" size={20} strokeOpacity={0.5} className="mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-serif text-lg mb-1 text-[var(--hb-ink)]">{item.title}</h3>
                    <p className="text-sm text-[var(--hb-smoke)] leading-relaxed">{item.body}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* X-ray diagram */}
            <div className="relative bg-[var(--hb-paper-muted)] p-8 aspect-square">
              <svg
                viewBox="0 0 300 300"
                className="w-full h-full"
                fill="none"
                stroke="var(--hb-ink)"
                strokeWidth="2"
                strokeOpacity="0.3"
              >
                <path d="M150 50 L120 80 L110 150 L115 220 L140 260 L160 260 L185 220 L190 150 L180 80 Z" />
                <path d="M150 80 L150 220" strokeDasharray="4 4" />
                <path d="M130 150 L170 150" strokeDasharray="4 4" />
                <circle cx="130" cy="120" r="8" fill="var(--hb-sienna)" opacity="0.35" />
                <circle cx="170" cy="120" r="8" fill="var(--hb-sienna)" opacity="0.35" />
                <circle cx="135" cy="200" r="8" fill="var(--hb-sienna)" opacity="0.35" />
                <circle cx="165" cy="200" r="8" fill="var(--hb-sienna)" opacity="0.35" />
              </svg>
              <p className="absolute bottom-4 left-1/2 -translate-x-1/2 text-xs font-script text-[var(--hb-smoke)]">
                Construction diagram
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Fit & Wear ─────────────────────────────────────────────── */}
      <section id="fit" className="px-4 sm:px-8 md:px-12 lg:px-20 py-16 bg-[var(--hb-paper-muted)]/30">
        <div className="max-w-4xl mx-auto space-y-10">
          <div className="space-y-3">
            <p className="uppercase text-xs tracking-[0.4em] text-[var(--hb-smoke)] opacity-70" style={{ fontFamily: "var(--hb-font-mono)" }}>
              Fit & Wear
            </p>
            <ScribbleUnderline width={90} strokeOpacity={0.4} />
          </div>

          <div className="grid md:grid-cols-2 gap-12">
            <div className="space-y-4">
              <h3 className="font-serif text-2xl text-[var(--hb-ink)]">Fit</h3>
              <p className="text-[var(--hb-smoke)] leading-relaxed text-sm">
                Straight-leg silhouette with a relaxed rise. The cut allows natural movement while maintaining a clean, contemporary line. Sits at the natural waist with room through the thigh.
              </p>
              <p className="text-[var(--hb-smoke)] leading-relaxed text-sm">
                Sizing runs true. We recommend your usual size for a relaxed fit, or size down for a closer silhouette. The denim will soften and mold to your body with wear.
              </p>
            </div>

            <div className="space-y-4">
              <h3 className="font-serif text-2xl text-[var(--hb-ink)]">How It Ages</h3>
              <p className="text-[var(--hb-smoke)] leading-relaxed text-sm mb-6">
                The denim evolves with your wear patterns. Indigo fades gradually, creating unique patterns that are yours alone.
              </p>
              <WearTimeline items={timelineItems} />
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ ────────────────────────────────────────────────────── */}
      <section id="faq" className="px-4 sm:px-8 md:px-12 lg:px-20 py-16">
        <div className="max-w-3xl mx-auto space-y-8">
          <div className="space-y-3">
            <p className="uppercase text-xs tracking-[0.4em] text-[var(--hb-smoke)] opacity-70" style={{ fontFamily: "var(--hb-font-mono)" }}>
              FAQ
            </p>
            <ScribbleUnderline width={60} strokeOpacity={0.4} />
          </div>
          <FAQAccordion items={faqItems} />
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
