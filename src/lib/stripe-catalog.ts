// src/lib/stripe-catalog.ts
import Stripe from 'stripe';
import type { Product, ProductStatus } from '@/data/products';

function getStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error('STRIPE_SECRET_KEY is not set');
  return new Stripe(key, { apiVersion: '2025-12-15.clover', typescript: true });
}

function metaStatus(value: string | undefined): ProductStatus {
  if (value === 'archived') return 'archived';
  if (value === 'sold_out' || value === 'sold-out') return 'sold_out';
  return 'available';
}

function mapStripeProduct(
  product: Stripe.Product,
  price: Stripe.Price
): Product & { stripePriceId: string } {
  const m = product.metadata ?? {};
  const sizes = m.sizes ? m.sizes.split(',').map((s) => s.trim()).filter(Boolean) : ['One Size'];
  const year = m.year ? parseInt(m.year, 10) : new Date().getFullYear();

  return {
    id: product.id,
    slug: m.slug ?? product.id,
    name: product.name,
    price: price.unit_amount ? price.unit_amount / 100 : 0,
    stripePriceId: price.id,
    status: metaStatus(m.status),
    description: product.description ?? '',
    story: m.story ?? product.description ?? '',
    materials: m.materials ?? '',
    care: m.care ?? '',
    sizes,
    heroImage: product.images[0] ?? '',
    images: product.images,
    collection: m.collection ?? 'Uncategorized',
    tags: [],
    year: isNaN(year) ? new Date().getFullYear() : year,
    notes: m.notes ?? '',
    featured: m.featured === 'true',
  };
}

export type StripeProduct = Product & { stripePriceId: string };

/**
 * Fetch all active Stripe products with their default prices.
 * Falls back to [] if STRIPE_SECRET_KEY is missing (dev without Stripe configured).
 */
export async function getStripeCatalog(): Promise<StripeProduct[]> {
  if (!process.env.STRIPE_SECRET_KEY) {
    console.warn('STRIPE_SECRET_KEY not set — returning empty catalog');
    return [];
  }

  const stripe = getStripe();
  const products = await stripe.products.list({
    active: true,
    expand: ['data.default_price'],
    limit: 100,
  });

  return products.data
    .filter((p) => p.default_price && typeof p.default_price !== 'string')
    .map((p) => mapStripeProduct(p, p.default_price as Stripe.Price))
    .filter((p) => p.slug);
}

/**
 * Fetch a single Stripe product by its metadata slug.
 */
export async function getStripeProductBySlug(slug: string): Promise<StripeProduct | null> {
  const catalog = await getStripeCatalog();
  return catalog.find((p) => p.slug === slug) ?? null;
}
