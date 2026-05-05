import type { Metadata } from 'next';
import { PageShell } from '@/components/layout/PageShell';
import { ShopContent } from '@/components/shop/ShopContent';
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

export const revalidate = 3600; // re-fetch Stripe catalog at most once per hour

export default async function ShopPage() {
  let shopProducts = fallbackProducts;

  try {
    const stripeProducts = await getStripeCatalog();
    if (stripeProducts.length > 0) shopProducts = stripeProducts;
  } catch (error) {
    console.warn('Failed to fetch from Stripe, using fallback data:', error);
  }

  return (
    <main className="page-transition">
      <PageShell
        variant="dark"
        eyebrow="Shop"
        title="Limited garments, ready to study."
        intro={<>All pieces are made to order. Preorder opens soon — join the waitlist and your payment funds the materials and manufacturing. Garments ship in 3–4 months.</>}
      >
        <ShopContent products={shopProducts} variant="dark" />
      </PageShell>
    </main>
  );
}
