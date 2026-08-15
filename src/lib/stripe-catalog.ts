// src/lib/stripe-catalog.ts
import { cache } from 'react';
import Stripe from 'stripe';
import type { Product, ProductStatus } from '@/data/products';
import { STRIPE_SECRET_KEY } from '@/lib/env';

let _stripe: Stripe | null = null;
function getStripe(): Stripe {
  if (_stripe) return _stripe;
  const key = STRIPE_SECRET_KEY;
  if (!key) throw new Error('STRIPE_SECRET_KEY is not set');
  _stripe = new Stripe(key, { apiVersion: '2025-12-15.clover', typescript: true });
  return _stripe;
}

function metaStatus(value: string | undefined): ProductStatus {
  if (value === 'archived') return 'archived';
  if (value === 'sold_out' || value === 'sold-out') return 'sold_out';
  return 'available';
}

/**
 * Slugs that must never be purchasable, enforced in code regardless of Stripe
 * metadata. These garments stay visible in Shop but every size is forced sold
 * out so the buy button is permanently disabled.
 */
const NON_PURCHASABLE_SLUGS = new Set(['layered-denim']);

function mapStripeProduct(
  product: Stripe.Product,
  price: Stripe.Price
): Product & { stripePriceId: string } {
  const m = product.metadata ?? {};
  const sizes = m.sizes ? m.sizes.split(',').map((s) => s.trim()).filter(Boolean) : ['One Size'];
  const year = m.year ? parseInt(m.year, 10) : new Date().getFullYear();

  const localImages = m.images ? m.images.split(',').map((s) => s.trim()).filter(Boolean) : [];
  const allImages = localImages.length > 0 ? localImages : product.images;

  const slug = m.slug ?? product.id;
  const metaSoldSizes = m.sold_sizes ? m.sold_sizes.split(',').map((s) => s.trim()).filter(Boolean) : [];
  // Force every size sold out for non-purchasable garments so they remain
  // visible in Shop but can never be added to cart. See NON_PURCHASABLE_SLUGS.
  const soldSizes = NON_PURCHASABLE_SLUGS.has(slug) ? [...sizes] : metaSoldSizes;

  return {
    id: product.id,
    slug,
    name: product.name,
    price: price.unit_amount ? price.unit_amount / 100 : 0,
    stripePriceId: price.id,
    status: metaStatus(m.status),
    description: product.description ?? '',
    story: m.story ?? product.description ?? '',
    materials: m.materials ?? '',
    care: m.care ?? '',
    sizes,
    heroImage: allImages[0] ?? '',
    images: allImages,
    collection: m.collection ?? 'Uncategorized',
    tags: m.tags ? m.tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
    year: isNaN(year) ? new Date().getFullYear() : year,
    notes: m.notes ?? '',
    featured: m.featured === 'true',
    soldSizes,
    // Both optional and metadata-driven — never fabricated. A garment without
    // catalog_number metadata falls back to position-derived numbering in the
    // UI; a garment without marker metadata simply has no construction gallery.
    catalogNumber: m.catalog_number || undefined,
    marker: m.marker || undefined,
  };
}

export type StripeProduct = Product & { stripePriceId: string };

/**
 * Fetch all active Stripe products with their default prices.
 * Falls back to [] if STRIPE_SECRET_KEY is missing (dev without Stripe configured).
 */
export const getStripeCatalog = cache(async (): Promise<StripeProduct[]> => {
  if (!STRIPE_SECRET_KEY) {
    console.warn('STRIPE_SECRET_KEY not set — returning empty catalog');
    return [];
  }

  const stripe = getStripe();
  const allProducts: Stripe.Product[] = [];

  for await (const product of stripe.products.list({
    active: true,
    expand: ['data.default_price'],
    limit: 100,
  })) {
    allProducts.push(product);
  }

  return allProducts
    .filter(
      (p) =>
        p.default_price &&
        typeof p.default_price !== 'string' &&
        (p.default_price as Stripe.Price).unit_amount !== null
    )
    .map((p) => mapStripeProduct(p, p.default_price as Stripe.Price))
    .filter((p) => p.slug);
});

/**
 * Fetch a single Stripe product by its metadata slug.
 */
export const getStripeProductBySlug = cache(async (slug: string): Promise<StripeProduct | null> => {
  const catalog = await getStripeCatalog();
  return catalog.find((p) => p.slug === slug) ?? null;
});
