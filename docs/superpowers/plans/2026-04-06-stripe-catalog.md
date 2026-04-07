# Stripe Catalog Integration Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace Shopify as the product catalog and checkout provider with Stripe Products + Stripe Checkout, closing the client-supplied price security hole in the process.

**Architecture:** Products are defined in the Stripe Dashboard with metadata fields for editorial content (story, materials, care, sizes, etc.). A new `src/lib/stripe-catalog.ts` module fetches and maps Stripe products to the existing `Product` type. The checkout endpoint is updated to accept `{ priceId, quantity }[]` and look up prices server-side from Stripe — eliminating the vulnerability where the client could send arbitrary prices. All Shopify code is removed.

**Tech Stack:** Stripe Node.js SDK (`stripe` v20, already installed), Next.js 14 App Router, TypeScript, existing `Product` type from `src/data/products.ts`.

---

## Context: Stripe Dashboard Setup (do this before running any tasks)

Each Hana-Bi garment needs a Product in the Stripe Dashboard:

1. Go to Stripe Dashboard → Products → Add product
2. Fill in Name (e.g. "Indigo Serenade Coat")
3. Add a one-time Price (e.g. $640.00 USD) — this becomes the `default_price`
4. In the **Metadata** section add these key/value pairs:

| Key | Example value | Required? |
|-----|--------------|-----------|
| `slug` | `indigo-serenade-coat` | **Yes** — must match the URL |
| `status` | `available` | Yes — `available`, `sold_out`, or `archived` |
| `sizes` | `XS,S,M,L` | Yes — comma-separated |
| `collection` | `Runway 01` | Yes |
| `year` | `2025` | Yes |
| `story` | Full editorial text | No |
| `materials` | Fabric description | No |
| `care` | Care instructions | No |
| `notes` | Edition notes | No |
| `featured` | `true` | No — omit or `false` if not featured |

5. Activate the product (toggle to Active)

**Required `.env.local` variables:**
```
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
NEXT_PUBLIC_SITE_URL=http://localhost:3000
STRIPE_WEBHOOK_SECRET=whsec_...
```

---

## File Structure

| File | Action | Responsibility |
|------|--------|---------------|
| `src/lib/stripe-catalog.ts` | **Create** | Fetch Stripe products, map to `Product` type |
| `src/data/products.ts` | **Modify** | Add `stripePriceId?: string` to `Product` interface |
| `src/store/cart.ts` | **Modify** | Add `stripePriceId?: string` to `CartItem` |
| `src/app/api/checkout/route.ts` | **Modify** | Accept `{ priceId, quantity }[]`, look up server-side |
| `src/components/cart/CartDrawer.tsx` | **Modify** | Send `priceId` in checkout payload |
| `src/app/cart/page.tsx` | **Modify** | Send `priceId` in checkout payload |
| `src/app/shop/page.tsx` | **Modify** | Replace Shopify fetch with `getStripeCatalog()` |
| `src/app/product/[slug]/page.tsx` | **Modify** | Replace Shopify fetch with `getStripeProductBySlug()` |
| `src/app/archive/page.tsx` | **Modify** | Replace Shopify fetch with `getStripeCatalog()` |
| `src/app/page.tsx` | **Modify** | Replace Shopify fetch with `getStripeCatalog()` |
| `src/lib/env.ts` | **Modify** | Remove Shopify vars |
| `src/lib/shopify.ts` | **Delete** | — |
| `src/lib/shopify-mappers.ts` | **Delete** | — |
| `src/app/api/shopify/checkout/route.ts` | **Delete** | — |
| `src/app/actions/checkout.ts` | **Delete** | — |
| `SHOPIFY_INTEGRATION.md` | **Replace** | Become `STRIPE_CATALOG.md` |

---

## Task 1: Create `src/lib/stripe-catalog.ts`

**Files:**
- Create: `src/lib/stripe-catalog.ts`

This module fetches all active Stripe products (with their default prices expanded) and maps them to the Hana-Bi `Product` type. It is the only file that talks to the Stripe catalog API.

- [ ] **Step 1: Create the file**

```typescript
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
    tags: [], // Stripe products have no tags — add manually via metadata if needed
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
    .filter((p) => p.slug); // require slug metadata
}

/**
 * Fetch a single Stripe product by its metadata slug.
 */
export async function getStripeProductBySlug(slug: string): Promise<StripeProduct | null> {
  const catalog = await getStripeCatalog();
  return catalog.find((p) => p.slug === slug) ?? null;
}
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add src/lib/stripe-catalog.ts
git commit -m "feat: add stripe-catalog — fetch Stripe products, map to Product type"
```

---

## Task 2: Update `Product` type and `CartItem` type

**Files:**
- Modify: `src/data/products.ts`
- Modify: `src/store/cart.ts`

Both changes are additive — `stripePriceId` is optional so existing local fallback data is unaffected.

- [ ] **Step 1: Add `stripePriceId` to `Product` interface in `src/data/products.ts`**

Change the `Product` interface (currently lines 19–38) to add one field:

```typescript
export interface Product {
  id: string;
  slug: string;
  name: string;
  price: number;
  stripePriceId?: string;    // ← add this line
  status: ProductStatus;
  description: string;
  story: string;
  materials: string;
  care: string;
  sizes: string[];
  heroImage: string;
  images: string[];
  collection: string;
  tags: string[];
  year: number;
  notes: string;
  featured?: boolean;
}
```

- [ ] **Step 2: Add `stripePriceId` to `CartItem` in `src/store/cart.ts`**

Change the `CartItem` interface (currently lines 7–17):

```typescript
export interface CartItem {
  id: string;
  productId: string;
  variantId: string;
  name: string;
  slug: string;
  price: number;
  stripePriceId?: string;    // ← add this line
  size: string;
  quantity: number;
  image?: string;
}
```

- [ ] **Step 3: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: no errors

- [ ] **Step 4: Commit**

```bash
git add src/data/products.ts src/store/cart.ts
git commit -m "feat: add stripePriceId to Product and CartItem types"
```

---

## Task 3: Update checkout API route to use server-side prices

**Files:**
- Modify: `src/app/api/checkout/route.ts`

The current route accepts `{ name, price, quantity, image }` — a security hole because the client controls the price. The new route accepts `{ priceId, quantity }[]` and constructs Stripe line items using Stripe's own price IDs, so the amount charged always comes from Stripe, never the client.

- [ ] **Step 1: Replace `src/app/api/checkout/route.ts` entirely**

```typescript
// src/app/api/checkout/route.ts
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { STRIPE_SECRET_KEY, NEXT_PUBLIC_SITE_URL } from '@/lib/env';

export interface CheckoutLineItem {
  priceId: string;
  quantity: number;
}

export interface CheckoutRequestBody {
  items: CheckoutLineItem[];
  cancelUrl?: string;
}

function getStripe(): Stripe {
  if (!STRIPE_SECRET_KEY) throw new Error('STRIPE_SECRET_KEY is not set');
  return new Stripe(STRIPE_SECRET_KEY, { apiVersion: '2025-12-15.clover', typescript: true });
}

export async function POST(request: NextRequest) {
  if (!STRIPE_SECRET_KEY) {
    return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
  }
  if (!NEXT_PUBLIC_SITE_URL) {
    return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
  }

  let body: CheckoutRequestBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  if (!body.items || body.items.length === 0) {
    return NextResponse.json({ error: 'Cart is empty' }, { status: 400 });
  }

  for (const item of body.items) {
    if (!item.priceId || typeof item.priceId !== 'string' || !item.priceId.startsWith('price_')) {
      return NextResponse.json({ error: 'Invalid price ID' }, { status: 400 });
    }
    if (typeof item.quantity !== 'number' || !Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > 1000) {
      return NextResponse.json({ error: 'Invalid item quantity' }, { status: 400 });
    }
  }

  try {
    const stripe = getStripe();
    const siteUrl = NEXT_PUBLIC_SITE_URL;

    const rawCancelUrl = body.cancelUrl;
    const cancelUrl =
      rawCancelUrl && rawCancelUrl.startsWith(siteUrl)
        ? rawCancelUrl
        : `${siteUrl}/cart`;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: body.items.map((item) => ({
        price: item.priceId,
        quantity: item.quantity,
      })),
      mode: 'payment',
      success_url: `${siteUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('Stripe checkout error:', error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Failed to create checkout session. Please try again.',
      },
      { status: 500 }
    );
  }
}
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add src/app/api/checkout/route.ts
git commit -m "feat: checkout route now accepts priceId/quantity — prices sourced server-side from Stripe"
```

---

## Task 4: Update cart UI to send `priceId` to checkout

**Files:**
- Modify: `src/components/cart/CartDrawer.tsx`
- Modify: `src/app/cart/page.tsx`

Both files have a `handleCheckout` function that currently sends `{ name, price, quantity, image }`. They need to send `{ priceId, quantity }` instead.

- [ ] **Step 1: Update `handleCheckout` in `src/components/cart/CartDrawer.tsx`**

Replace the existing `handleCheckout` function (lines 17–53) with:

```typescript
async function handleCheckout(items: CartItem[], onClose: () => void) {
  if (items.length === 0) return;

  // Items without a stripePriceId cannot be checked out via Stripe catalog.
  // This happens with local fallback products (no Stripe configured).
  const missingPrice = items.find((item) => !item.stripePriceId);
  if (missingPrice) {
    alert(`"${missingPrice.name}" has no Stripe price ID. Please configure products in the Stripe Dashboard.`);
    return;
  }

  try {
    const response = await fetch('/api/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        items: items.map((item) => ({
          priceId: item.stripePriceId,
          quantity: item.quantity,
        })),
        cancelUrl: `${window.location.origin}/cart`,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create checkout');
    }

    const { url } = await response.json();
    onClose();
    window.location.href = url;
  } catch (error) {
    console.error('Checkout error:', error);
    alert(
      error instanceof Error
        ? error.message
        : 'Failed to start checkout. Please try again.'
    );
  }
}
```

- [ ] **Step 2: Update `handleCheckout` in `src/app/cart/page.tsx`**

Replace the existing `handleCheckout` function (lines 9–42) with:

```typescript
async function handleCheckout(items: CartItem[]) {
  if (items.length === 0) return;

  const missingPrice = items.find((item) => !item.stripePriceId);
  if (missingPrice) {
    alert(`"${missingPrice.name}" has no Stripe price ID. Please configure products in the Stripe Dashboard.`);
    return;
  }

  try {
    const response = await fetch('/api/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        items: items.map((item) => ({
          priceId: item.stripePriceId,
          quantity: item.quantity,
        })),
        cancelUrl: `${window.location.origin}/cart`,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create checkout');
    }

    const { url } = await response.json();
    window.location.href = url;
  } catch (error) {
    console.error('Checkout error:', error);
    alert(
      error instanceof Error
        ? error.message
        : 'Failed to start checkout. Please try again.'
    );
  }
}
```

- [ ] **Step 3: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: no errors

- [ ] **Step 4: Commit**

```bash
git add src/components/cart/CartDrawer.tsx src/app/cart/page.tsx
git commit -m "feat: cart sends priceId to checkout instead of client-supplied price"
```

---

## Task 5: Update product pages to use Stripe catalog

**Files:**
- Modify: `src/app/shop/page.tsx`
- Modify: `src/app/product/[slug]/page.tsx`
- Modify: `src/app/archive/page.tsx`
- Modify: `src/app/page.tsx`

Each page currently imports from `@/lib/shopify` and `@/lib/shopify-mappers`. Replace all of those with `getStripeCatalog()` / `getStripeProductBySlug()` from `@/lib/stripe-catalog`. Keep the local `fallbackProducts` fallback for when Stripe is not configured.

Note: `getStripeCatalog()` returns `StripeProduct[]` which is a superset of `Product` (has `stripePriceId`). The fallback `products` array from `data/products.ts` does not have `stripePriceId` — that's fine, those items will show a warning at checkout.

- [ ] **Step 1: Replace `src/app/shop/page.tsx`**

```typescript
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
```

- [ ] **Step 2: Replace `src/app/archive/page.tsx`**

```typescript
import type { Metadata } from 'next';
import { SketchFrame } from '@/components/common/SketchFrame';
import { PageShell } from '@/components/layout/PageShell';
import { getStripeCatalog } from '@/lib/stripe-catalog';
import { archivedProducts as fallbackArchived } from '@/data/products';
import type { Product } from '@/data/products';

export const metadata: Metadata = {
  title: 'Archive — Hana-Bi',
  description:
    'Sold-out and archived Hana-Bi garments, preserved with editorial annotations and fabric provenance.',
  openGraph: {
    title: 'Archive — Hana-Bi',
    description:
      'Sold-out and archived Hana-Bi garments, preserved with editorial annotations and fabric provenance.',
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
        title="A museum wall of Hana-Bi silhouettes."
        intro="Sold out and archived garments live here with editorial annotations. Use this spread as inspiration for future drops or to document provenance."
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
```

- [ ] **Step 3: Replace Shopify imports in `src/app/product/[slug]/page.tsx`**

Change only the import block and the three fetch functions. Everything from `return (` onward stays identical.

Replace lines 1–73 with:

```typescript
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
  params: { slug: string };
}

export async function generateStaticParams() {
  try {
    const catalog = await getStripeCatalog();
    if (catalog.length > 0) return catalog.map((p) => ({ slug: p.slug }));
  } catch {}
  return fallbackProducts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  let product: Product | null = null;
  try {
    product = await getStripeProductBySlug(params.slug);
  } catch {}
  if (!product) product = getProductBySlug(params.slug) ?? null;
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
  let product: Product | null = null;

  try {
    product = await getStripeProductBySlug(params.slug);
  } catch (error) {
    console.warn('Failed to fetch product from Stripe, using fallback:', error);
  }

  if (!product) product = getProductBySlug(params.slug) ?? null;
  if (!product) notFound();

  const catalogIndex = fallbackProducts.findIndex((p) => p.slug === params.slug);
  const catalogNumber =
    catalogIndex >= 0 ? `HB-${String(catalogIndex + 1).padStart(3, '0')}` : null;

  const related = await getRelatedProducts(product.slug);
```

The rest of the component JSX (return statement, `<main>` etc.) is unchanged from the current file.

- [ ] **Step 4: Replace Shopify imports in `src/app/page.tsx`**

Replace lines 11–17 (the shopify imports):

```typescript
import { getStripeCatalog } from '@/lib/stripe-catalog';
import {
  archivedProducts as fallbackArchived,
  featuredProducts as fallbackFeatured,
  products as fallbackProducts,
} from '@/data/products';
```

Replace lines 57–84 (the data fetching inside `Home()`):

```typescript
export default async function Home() {
  let allProducts = fallbackProducts;
  let featured: typeof allProducts = [];
  let archiveSlices: typeof allProducts = [];

  try {
    const catalog = await getStripeCatalog();
    if (catalog.length > 0) {
      allProducts = catalog;
      featured = catalog.filter((p) => p.featured).slice(0, 3);
      archiveSlices = catalog
        .filter((p) => p.status === 'archived' || p.status === 'sold_out')
        .slice(0, 2);
    } else {
      featured = fallbackFeatured.slice(0, 3);
      archiveSlices = fallbackArchived.slice(0, 2);
    }
  } catch (error) {
    console.warn('Failed to fetch from Stripe, using fallback data:', error);
    featured = fallbackFeatured.slice(0, 3);
    archiveSlices = fallbackArchived.slice(0, 2);
  }

  const heroFeature = featured[0] ?? allProducts[0] ?? fallbackProducts[0];
```

- [ ] **Step 5: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: no errors

- [ ] **Step 6: Commit**

```bash
git add src/app/shop/page.tsx src/app/archive/page.tsx src/app/product/[slug]/page.tsx src/app/page.tsx
git commit -m "feat: replace Shopify product fetches with Stripe catalog on all pages"
```

---

## Task 6: Remove Shopify files and clean up env

**Files:**
- Delete: `src/lib/shopify.ts`
- Delete: `src/lib/shopify-mappers.ts`
- Delete: `src/app/api/shopify/checkout/route.ts`
- Delete: `src/app/actions/checkout.ts`
- Modify: `src/lib/env.ts`

- [ ] **Step 1: Delete Shopify library files**

```bash
rm src/lib/shopify.ts
rm src/lib/shopify-mappers.ts
```

- [ ] **Step 2: Delete Shopify API route and server action**

```bash
rm src/app/api/shopify/checkout/route.ts
rmdir src/app/api/shopify/checkout
rmdir src/app/api/shopify
rm src/app/actions/checkout.ts
rmdir src/app/actions
```

- [ ] **Step 3: Update `src/lib/env.ts`** — remove Shopify vars

Replace the entire file with:

```typescript
/**
 * Centralized environment variable exports.
 *
 * All process.env accesses for external services live here.
 * Routes validate required vars at request time (not module load)
 * because Next.js static generation runs without runtime secrets.
 */

// Stripe
export const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
export const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;

// Site
export const NEXT_PUBLIC_SITE_URL = process.env.NEXT_PUBLIC_SITE_URL;
```

- [ ] **Step 4: Verify TypeScript compiles with no Shopify references**

Run: `npx tsc --noEmit`
Expected: no errors

Also verify no remaining Shopify imports:
```bash
grep -r "shopify" src/ --include="*.ts" --include="*.tsx" -l
```
Expected: no output (zero files)

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "chore: remove Shopify library, API route, server action, and env vars"
```

---

## Task 7: Replace `SHOPIFY_INTEGRATION.md` with `STRIPE_CATALOG.md`

**Files:**
- Delete: `SHOPIFY_INTEGRATION.md`
- Create: `STRIPE_CATALOG.md`

- [ ] **Step 1: Delete old docs**

```bash
rm SHOPIFY_INTEGRATION.md
```

- [ ] **Step 2: Create `STRIPE_CATALOG.md`**

```markdown
# Stripe Catalog Integration

Hana-Bi uses Stripe as the source of truth for products and payments.

## Overview

- **Product catalog:** Products and prices defined in Stripe Dashboard
- **Checkout:** Stripe Checkout Sessions (server-side price lookup — clients cannot manipulate prices)
- **Webhooks:** `checkout.session.completed` marks sessions as verified
- **Success page:** `/success?session_id=...` polls `/api/checkout/verify` to confirm payment

## Setup

### 1. Environment Variables

Create `.env.local` in the project root:

```env
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
NEXT_PUBLIC_SITE_URL=http://localhost:3000
STRIPE_WEBHOOK_SECRET=whsec_...   # from Stripe CLI or Dashboard webhook settings
```

### 2. Create Products in Stripe Dashboard

For each garment:
1. Stripe Dashboard → Products → Add product
2. Set Name (displayed on checkout)
3. Add a one-time Price (USD) — this becomes the `default_price`
4. Add Metadata:

| Key | Required | Example |
|-----|----------|---------|
| `slug` | Yes | `indigo-serenade-coat` |
| `status` | Yes | `available` / `sold_out` / `archived` |
| `sizes` | Yes | `XS,S,M,L` |
| `collection` | Yes | `Runway 01` |
| `year` | Yes | `2025` |
| `story` | No | Long editorial text |
| `materials` | No | Fabric description |
| `care` | No | Care instructions |
| `notes` | No | Edition notes |
| `featured` | No | `true` |

5. Add product images (first image becomes `heroImage`)
6. Set product as **Active**

### 3. Test Webhooks Locally

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

Copy the webhook signing secret (`whsec_...`) to `.env.local` as `STRIPE_WEBHOOK_SECRET`.

## Architecture

### Core Files

- **`lib/stripe-catalog.ts`** — Fetches all active Stripe products + default prices, maps to `Product` type
  - `getStripeCatalog()` — returns `StripeProduct[]` (all active products)
  - `getStripeProductBySlug(slug)` — returns single product or `null`

- **`app/api/checkout/route.ts`** — Creates Stripe Checkout Session
  - Accepts: `{ items: { priceId: string; quantity: number }[] }`
  - Server looks up prices by ID — client cannot supply arbitrary amounts

- **`app/api/webhooks/stripe/route.ts`** — Webhook handler
  - Verifies `checkout.session.completed` events
  - Adds verified `session.id` to in-memory set

- **`app/api/checkout/verify/route.ts`** — GET endpoint polled by success page
  - Returns `{ verified: true }` if session ID is in verified set

### Checkout Flow

1. User clicks Checkout in cart
2. Client POSTs `{ items: [{ priceId, quantity }] }` to `/api/checkout`
3. Server creates Stripe Checkout Session with price IDs
4. Server returns `{ url: session.url }`
5. Client redirects to Stripe-hosted checkout
6. After payment, Stripe redirects to `/success?session_id=...`
7. Success page polls `/api/checkout/verify?session_id=...`
8. Stripe webhook fires `checkout.session.completed` → session marked verified
9. Success page shows confirmation, cart is cleared

### Fallback Behavior

If `STRIPE_SECRET_KEY` is not set, `getStripeCatalog()` returns `[]` and pages fall back to local data in `data/products.ts`. Local fallback products do not have `stripePriceId`, so checkout is blocked with a clear error message.

## Troubleshooting

**Products not showing:** Verify products are Active in Stripe Dashboard and have `slug` metadata set.

**Checkout fails with "Invalid price ID":** The product was added to cart without a `stripePriceId` — likely a fallback product. Add `STRIPE_SECRET_KEY` and refresh the page.

**Verification always fails:** Webhook is not delivering. Run `stripe listen --forward-to localhost:3000/api/webhooks/stripe` and ensure `STRIPE_WEBHOOK_SECRET` matches.
```

- [ ] **Step 3: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: no errors

- [ ] **Step 4: Commit**

```bash
git add STRIPE_CATALOG.md SHOPIFY_INTEGRATION.md
git commit -m "docs: replace SHOPIFY_INTEGRATION.md with STRIPE_CATALOG.md"
```

---

## Self-Review

**Spec coverage:**
- ✅ Stripe Products as catalog source — Task 1
- ✅ Metadata fields mapped to `Product` type — Task 1
- ✅ `Product` and `CartItem` types updated — Task 2
- ✅ Server-side price lookup (security fix) — Task 3
- ✅ Cart UI sends `priceId` not raw price — Task 4
- ✅ All pages replaced (shop, product, archive, home) — Task 5
- ✅ All Shopify files removed — Task 6
- ✅ env.ts cleaned — Task 6
- ✅ Docs updated — Task 7

**Placeholder scan:** None found. All code blocks are complete.

**Type consistency:**
- `StripeProduct = Product & { stripePriceId: string }` defined in Task 1
- `Product.stripePriceId?: string` added in Task 2 (same field name)
- `CartItem.stripePriceId?: string` added in Task 2
- Cart UI reads `item.stripePriceId` in Task 4 — matches Task 2
- Checkout route reads `item.priceId` from request body in Task 3, cart sends `priceId: item.stripePriceId` in Task 4 — consistent
- `getStripeCatalog()` and `getStripeProductBySlug()` used consistently across Tasks 1 and 5
