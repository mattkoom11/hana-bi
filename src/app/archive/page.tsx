import type { Metadata } from 'next';
import { SketchFrame } from '@/components/common/SketchFrame';
import { PageShell } from '@/components/layout/PageShell';
import { getStripeCatalog } from '@/lib/stripe-catalog';
import { archivedProducts as fallbackArchived } from '@/data/products';
import type { Product } from '@/data/products';

export const metadata: Metadata = {
  title: 'Archive — Hana-Bi',
  description:
    'Past retail drops from Hana-Bi — sold-out garments preserved with editorial annotations and fabric provenance.',
  openGraph: {
    title: 'Archive — Hana-Bi',
    description:
      'Past retail drops from Hana-Bi — sold-out garments preserved with editorial annotations and fabric provenance.',
  },
};

export default async function ArchivePage() {
  let archivedProducts: Product[] = fallbackArchived;

  try {
    const catalog = await getStripeCatalog();
    if (catalog.length > 0) {
      archivedProducts = catalog.filter(
        (p) => p.status === 'archived' || p.status === 'sold_out'
      );
    }
  } catch (error) {
    console.warn('Failed to fetch archived products from Stripe, using fallback:', error);
  }

  const groupedByYear = archivedProducts.reduce<Record<number, Product[]>>(
    (acc, product) => {
      if (!acc[product.year]) acc[product.year] = [];
      acc[product.year].push(product);
      return acc;
    },
    {}
  );

  const years = Object.keys(groupedByYear)
    .map(Number)
    .sort((a, b) => b - a);

  return (
    <main className="page-transition">
      <PageShell
        eyebrow="Archive"
        title="Past retail drops, preserved."
        intro="Every garment that has passed through the shop lives here — sold-out and closed editions catalogued with fabric provenance and editorial notes."
      >
        <div className="space-y-16">
          {years.map((year) => (
            <section key={year} className="space-y-8">
              <p className="uppercase text-xs tracking-[0.4em] text-[var(--hb-smoke)] font-script opacity-70">
                {year}
              </p>
              <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-3">
                {groupedByYear[year].map((product, index) => (
                  <SketchFrame
                    key={product.id}
                    tilt={index % 3 === 0 ? 'left' : index % 3 === 1 ? 'right' : 'none'}
                    strokeOpacity={0.3}
                  >
                    <div className="space-y-4">
                      <p className="uppercase text-[0.65rem] tracking-[0.4em] text-[var(--hb-smoke)] font-script opacity-70">
                        {product.collection}
                      </p>
                      <h3 className="font-serif text-2xl leading-tight">{product.name}</h3>
                      <p className="text-sm text-[var(--hb-smoke)] opacity-80 leading-relaxed">
                        {product.description}
                      </p>
                      <p
                        className="text-xs uppercase tracking-[0.3em] font-script opacity-60 pt-2 border-t border-dashed border-[var(--hb-border)]"
                        style={{ borderWidth: '1px' }}
                      >
                        {product.status === 'sold_out' ? 'Sold Out' : 'Archived'}
                      </p>
                    </div>
                  </SketchFrame>
                ))}
              </div>
            </section>
          ))}
        </div>
      </PageShell>
    </main>
  );
}
