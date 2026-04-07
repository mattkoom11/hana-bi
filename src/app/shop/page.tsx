import type { Metadata } from 'next';
import { PageShell } from '@/components/layout/PageShell';
import { ShopContent } from '@/components/shop/ShopContent';
import { GarmentStage } from '@/components/shop/GarmentStage';
import { getStripeCatalog } from '@/lib/stripe-catalog';
import { products as fallbackProducts } from '@/data/products';

export const metadata: Metadata = {
  title: 'Shop — Hana-Bi',
  description:
    'Browse limited denim garments from the Hana-Bi archive. Each piece is documented like an artifact.',
  openGraph: {
    title: 'Shop — Hana-Bi',
    description:
      'Browse limited denim garments from the Hana-Bi archive. Each piece is documented like an artifact.',
  },
};

export default async function ShopPage() {
  let shopProducts = fallbackProducts;

  try {
    const stripeProducts = await getStripeCatalog();
    if (stripeProducts.length > 0) shopProducts = stripeProducts;
  } catch (error) {
    console.warn('Failed to fetch from Stripe, using fallback data:', error);
  }

  const featuredProduct =
    shopProducts.find((p) => p.status === 'available') ?? shopProducts[0];

  const catalogIndex = shopProducts.findIndex((p) => p.slug === featuredProduct.slug);
  const catalogNumber =
    catalogIndex >= 0 ? `HB-${String(catalogIndex + 1).padStart(3, '0')}` : 'HB-001';

  return (
    <main className="page-transition">
      <GarmentStage product={featuredProduct} catalogNumber={catalogNumber} />
      <PageShell
        variant="dark"
        eyebrow="Shop"
        title="Limited garments, ready to study."
        intro={<>Filter by size, category, or availability.</>}
      >
        <ShopContent products={shopProducts} variant="dark" />
      </PageShell>
    </main>
  );
}
