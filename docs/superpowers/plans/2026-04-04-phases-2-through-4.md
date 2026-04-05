# Phases 2–4 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Complete the pre-launch improvement roadmap phases 2–4: centralize env vars, remove dead GSAP code, add full SEO metadata, sitemap/robots, loading skeletons, error boundaries, and mobile cart/checkout fixes.

**Architecture:** Each phase is independent — env centralization (Task 1), dead code removal (Task 2), SEO/metadata (Tasks 3–5), loading/error UI (Tasks 6–7), and mobile polish (Task 8). No phase depends on any other except Task 1 optionally informs API route cleanup.

**Tech Stack:** Next.js 16 App Router, TypeScript, Tailwind CSS, Zustand v5, Framer Motion (primary animation library), Stripe SDK, Shopify Storefront API.

---

## File Map

**Create:**
- `src/lib/env.ts` — typed exports for all env vars; single source of truth
- `src/app/projects/layout.tsx` — static metadata for `/projects` (page.tsx is `'use client'` and cannot export metadata)
- `src/app/sitemap.ts` — Next.js sitemap route
- `src/app/robots.ts` — Next.js robots route
- `src/app/shop/loading.tsx` — skeleton product grid
- `src/app/product/[slug]/loading.tsx` — skeleton product page
- `src/app/projects/[slug]/loading.tsx` — skeleton project page
- `src/app/shop/error.tsx` — error boundary for shop
- `src/app/product/[slug]/error.tsx` — error boundary for product detail
- `src/app/projects/[slug]/error.tsx` — error boundary for project detail

**Modify:**
- `src/lib/shopify.ts` — import Shopify env vars from `env.ts`
- `src/app/api/checkout/route.ts` — import Stripe env vars from `env.ts`
- `src/app/api/webhooks/stripe/route.ts` — import Stripe env vars from `env.ts`
- `src/app/layout.tsx` — add default `openGraph.images` to root metadata
- `src/app/shop/page.tsx` — add static `metadata` export
- `src/app/about/page.tsx` — add static `metadata` export
- `src/app/archive/page.tsx` — add static `metadata` export
- `src/app/projects/[slug]/page.tsx` — add `openGraph.images` to `generateMetadata`
- `src/components/cart/CartDrawer.tsx` — mobile tap targets, full-width on small screens
- `src/components/product/ProductPurchasePanel.tsx` — size button tap targets, sticky mobile CTA

**Delete:**
- `src/components/draw-random-underline.tsx` — dead code (not imported anywhere)
- `src/components/ui/draw-random-underline.tsx` — duplicate dead code

---

## Task 1: Centralize Environment Variable Exports

**Files:**
- Create: `src/lib/env.ts`
- Modify: `src/lib/shopify.ts:16-19`
- Modify: `src/app/api/checkout/route.ts:17-24`
- Modify: `src/app/api/webhooks/stripe/route.ts:9-15`

**Context:** Currently `process.env.STRIPE_SECRET_KEY`, `process.env.STRIPE_WEBHOOK_SECRET`, `process.env.NEXT_PUBLIC_SITE_URL`, and Shopify vars are read directly in multiple files. This task DRYs that up. Note: Shopify vars are optional at build time (the app falls back gracefully); Stripe vars are only needed at request time. `env.ts` exports the raw values — individual routes remain responsible for handling missing values at request time.

- [ ] **Step 1: Create `src/lib/env.ts`**

```ts
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

// Shopify — optional; app falls back to local data when missing
export const SHOPIFY_STORE_DOMAIN = process.env.SHOPIFY_STORE_DOMAIN;
export const SHOPIFY_STOREFRONT_ACCESS_TOKEN =
  process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN;
export const SHOPIFY_API_VERSION =
  process.env.SHOPIFY_API_VERSION ?? "2025-01";
```

- [ ] **Step 2: Update `src/lib/shopify.ts` — replace top-level `process.env` reads**

Replace lines 16–19 (the four `const` declarations at the top of the file):

```ts
import {
  SHOPIFY_STORE_DOMAIN,
  SHOPIFY_STOREFRONT_ACCESS_TOKEN,
  SHOPIFY_API_VERSION,
} from "@/lib/env";

if (!SHOPIFY_STORE_DOMAIN || !SHOPIFY_STOREFRONT_ACCESS_TOKEN) {
  console.warn(
    "Shopify credentials not found. Set SHOPIFY_STORE_DOMAIN and SHOPIFY_STOREFRONT_ACCESS_TOKEN in .env.local"
  );
}
```

Remove the old `const SHOPIFY_STORE_DOMAIN = process.env...` lines entirely. The rest of the file (`endpoint`, GraphQL functions) continues to reference these constants by name — no other changes needed.

- [ ] **Step 3: Update `src/app/api/checkout/route.ts` — replace `process.env` reads**

In `getStripe()` (line 17) and the two `process.env` checks at the top of `POST` (lines 28–37), replace all `process.env.STRIPE_SECRET_KEY` and `process.env.NEXT_PUBLIC_SITE_URL` with imports:

Add at the top of the file (after the existing imports):
```ts
import { STRIPE_SECRET_KEY, NEXT_PUBLIC_SITE_URL } from "@/lib/env";
```

Then in `getStripe()`:
```ts
function getStripe() {
  if (!STRIPE_SECRET_KEY) {
    throw new Error("STRIPE_SECRET_KEY is not set");
  }
  return new Stripe(STRIPE_SECRET_KEY, {
    apiVersion: "2025-12-15.clover",
    typescript: true,
  });
}
```

And in `POST`, replace the two early-return guards:
```ts
if (!STRIPE_SECRET_KEY) {
  return NextResponse.json(
    { error: "Server configuration error" },
    { status: 500 }
  );
}

if (!NEXT_PUBLIC_SITE_URL) {
  return NextResponse.json(
    { error: "Server configuration error" },
    { status: 500 }
  );
}
```

And where `siteUrl` is assigned:
```ts
const siteUrl = NEXT_PUBLIC_SITE_URL;
```

- [ ] **Step 4: Update `src/app/api/webhooks/stripe/route.ts` — replace `process.env` reads**

Add at the top (after existing imports):
```ts
import { STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET } from "@/lib/env";
```

In `getStripe()`:
```ts
function getStripe() {
  if (!STRIPE_SECRET_KEY) throw new Error("STRIPE_SECRET_KEY is not set");
  return new Stripe(STRIPE_SECRET_KEY, {
    apiVersion: "2025-12-15.clover",
    typescript: true,
  });
}
```

In `POST`, replace the webhook secret read:
```ts
if (!STRIPE_WEBHOOK_SECRET) {
  console.error("STRIPE_WEBHOOK_SECRET is not set");
  return NextResponse.json(
    { error: "Webhook secret not configured" },
    { status: 500 }
  );
}
// ...
event = stripe.webhooks.constructEvent(body, signature, STRIPE_WEBHOOK_SECRET);
```

- [ ] **Step 5: Verify the build compiles**

```bash
npx tsc --noEmit
```

Expected: no type errors.

- [ ] **Step 6: Commit**

```bash
git add src/lib/env.ts src/lib/shopify.ts src/app/api/checkout/route.ts src/app/api/webhooks/stripe/route.ts
git commit -m "refactor: centralize env var exports in src/lib/env.ts"
```

---

## Task 2: Remove Dead GSAP Code

**Files:**
- Delete: `src/components/draw-random-underline.tsx`
- Delete: `src/components/ui/draw-random-underline.tsx`
- Modify: `package.json` (remove `gsap` dependency)

**Context:** `gsap` is only used in these two files. Neither file is imported anywhere in the app (verified via grep). The `gsap` package can be removed entirely. Framer Motion remains as the primary animation library.

- [ ] **Step 1: Confirm neither file is imported**

```bash
grep -r "draw-random-underline\|UnderlineAnimation" src/ --include="*.tsx" --include="*.ts"
```

Expected output: only the two files themselves appear (no import sites). If any import sites appear, stop and investigate before proceeding.

- [ ] **Step 2: Delete both files**

```bash
rm src/components/draw-random-underline.tsx
rm src/components/ui/draw-random-underline.tsx
```

- [ ] **Step 3: Uninstall gsap**

```bash
npm uninstall gsap
```

- [ ] **Step 4: Verify build**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "chore: remove dead GSAP draw-underline components, uninstall gsap"
```

---

## Task 3: Static Metadata for `/shop`, `/about`, `/archive`

**Files:**
- Modify: `src/app/shop/page.tsx`
- Modify: `src/app/about/page.tsx`
- Modify: `src/app/archive/page.tsx`
- Modify: `src/app/layout.tsx`

**Context:** These are server components and can export a `metadata` const directly. Root layout already has a `metadata` export but is missing `openGraph.images` — add a default fallback there too.

- [ ] **Step 1: Add metadata to `src/app/shop/page.tsx`**

Add before `export default async function ShopPage()`:

```ts
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Shop — Hana-Bi",
  description:
    "Browse limited denim garments from the Hana-Bi archive. Each piece is documented like an artifact.",
  openGraph: {
    title: "Shop — Hana-Bi",
    description:
      "Browse limited denim garments from the Hana-Bi archive. Each piece is documented like an artifact.",
  },
};
```

- [ ] **Step 2: Add metadata to `src/app/about/page.tsx`**

Add before `export default function AboutPage()`:

```ts
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About — Hana-Bi",
  description:
    "Hana-Bi is a sustainable denim house with an editorial mindset. Each garment is treated like an artifact.",
  openGraph: {
    title: "About — Hana-Bi",
    description:
      "Hana-Bi is a sustainable denim house with an editorial mindset. Each garment is treated like an artifact.",
  },
};
```

- [ ] **Step 3: Add metadata to `src/app/archive/page.tsx`**

Add before `export default async function ArchivePage()`:

```ts
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Archive — Hana-Bi",
  description:
    "Sold-out and archived Hana-Bi garments, preserved with editorial annotations and fabric provenance.",
  openGraph: {
    title: "Archive — Hana-Bi",
    description:
      "Sold-out and archived Hana-Bi garments, preserved with editorial annotations and fabric provenance.",
  },
};
```

- [ ] **Step 4: Add default `openGraph.images` to root layout metadata in `src/app/layout.tsx`**

Replace the existing `export const metadata` block:

```ts
export const metadata: Metadata = {
  title: "Hana-Bi — Archival Denim",
  description:
    "Hana-Bi is a sustainable denim house documenting each garment like an artifact.",
  openGraph: {
    title: "Hana-Bi — Archival Denim",
    description:
      "Hana-Bi is a sustainable denim house documenting each garment like an artifact.",
    images: ["/og-default.jpg"],
  },
};
```

Note: `/og-default.jpg` is a placeholder. Replace with an actual 1200×630 image in `public/` before launch.

- [ ] **Step 5: Verify types**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 6: Commit**

```bash
git add src/app/shop/page.tsx src/app/about/page.tsx src/app/archive/page.tsx src/app/layout.tsx
git commit -m "feat: add static metadata to shop, about, archive pages and root OG fallback"
```

---

## Task 4: Metadata for `/projects` Index and `/projects/[slug]` OpenGraph

**Files:**
- Create: `src/app/projects/layout.tsx`
- Modify: `src/app/projects/[slug]/page.tsx:57-60`

**Context:** `src/app/projects/page.tsx` is a `'use client'` component, so it cannot export `metadata`. The solution is a sibling `layout.tsx` (a server component) that sets metadata for the `/projects` route segment. For `/projects/[slug]`, `generateMetadata` already exists but is missing `openGraph.images` — add `project.heroImage`.

- [ ] **Step 1: Create `src/app/projects/layout.tsx`**

```tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Projects — Hana-Bi",
  description:
    "Personal sewing projects documenting garment construction, pattern drafting, and textile techniques. Not for sale.",
  openGraph: {
    title: "Projects — Hana-Bi",
    description:
      "Personal sewing projects documenting garment construction, pattern drafting, and textile techniques.",
  },
};

export default function ProjectsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
```

- [ ] **Step 2: Add `openGraph.images` to `generateMetadata` in `src/app/projects/[slug]/page.tsx`**

The current return (around line 57–60) is:
```ts
  return {
    title: `${project.name} — Hana-Bi Projects`,
    description: project.description,
  };
```

Replace with:
```ts
  return {
    title: `${project.name} — Hana-Bi Projects`,
    description: project.description,
    openGraph: {
      title: `${project.name} — Hana-Bi Projects`,
      description: project.description,
      images: [project.heroImage],
    },
  };
```

- [ ] **Step 3: Verify types**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add src/app/projects/layout.tsx src/app/projects/[slug]/page.tsx
git commit -m "feat: add metadata to projects index (layout.tsx) and OG images to project detail"
```

---

## Task 5: Sitemap and robots.txt

**Files:**
- Create: `src/app/sitemap.ts`
- Create: `src/app/robots.ts`

**Context:** Next.js 13+ App Router supports `sitemap.ts` and `robots.ts` as special route files. `sitemap.ts` must export a default function returning `MetadataRoute.Sitemap`. It fetches product and project slugs to build the full URL list. `NEXT_PUBLIC_SITE_URL` from `env.ts` is the base URL.

- [ ] **Step 1: Create `src/app/sitemap.ts`**

```ts
import type { MetadataRoute } from "next";
import { getAllProducts } from "@/lib/shopify";
import { mapShopifyProductToHanaBiProduct } from "@/lib/shopify-mappers";
import { products as fallbackProducts } from "@/data/products";
import { projects } from "@/data/projects";
import { NEXT_PUBLIC_SITE_URL } from "@/lib/env";

const BASE_URL = NEXT_PUBLIC_SITE_URL ?? "https://hana-bi.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Static pages
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: BASE_URL, lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    { url: `${BASE_URL}/shop`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${BASE_URL}/about`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE_URL}/archive`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE_URL}/projects`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.7 },
  ];

  // Product pages
  let productSlugs: string[] = fallbackProducts.map((p) => p.slug);
  try {
    const shopifyProducts = await getAllProducts();
    productSlugs = shopifyProducts.map((p) => p.handle);
  } catch {
    // fall back to local slugs
  }

  const productRoutes: MetadataRoute.Sitemap = productSlugs.map((slug) => ({
    url: `${BASE_URL}/product/${slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  // Project pages (local data only — no API)
  const projectRoutes: MetadataRoute.Sitemap = projects.map((project) => ({
    url: `${BASE_URL}/projects/${project.slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  return [...staticRoutes, ...productRoutes, ...projectRoutes];
}
```

- [ ] **Step 2: Create `src/app/robots.ts`**

```ts
import type { MetadataRoute } from "next";
import { NEXT_PUBLIC_SITE_URL } from "@/lib/env";

const BASE_URL = NEXT_PUBLIC_SITE_URL ?? "https://hana-bi.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/"],
    },
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
```

- [ ] **Step 3: Verify types**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add src/app/sitemap.ts src/app/robots.ts
git commit -m "feat: add sitemap.ts and robots.ts"
```

---

## Task 6: Loading Skeletons

**Files:**
- Create: `src/app/shop/loading.tsx`
- Create: `src/app/product/[slug]/loading.tsx`
- Create: `src/app/projects/[slug]/loading.tsx`

**Context:** Next.js App Router automatically shows `loading.tsx` during server component suspense. These must be server components (no `'use client'`). Match the site's dark/paper aesthetic — use `bg-[var(--hb-dark-surface)]` or `bg-[var(--hb-smoke)]/20` for skeleton rectangles, not generic gray.

- [ ] **Step 1: Create `src/app/shop/loading.tsx`**

```tsx
export default function ShopLoading() {
  return (
    <div className="px-4 sm:px-8 md:px-12 lg:px-20 py-16 bg-[var(--hb-dark)] min-h-screen">
      {/* Page shell skeleton */}
      <div className="space-y-3 mb-12 max-w-2xl">
        <div className="h-3 w-16 bg-[var(--hb-dark-surface)] rounded" />
        <div className="h-10 w-80 bg-[var(--hb-dark-surface)] rounded" />
        <div className="h-4 w-64 bg-[var(--hb-dark-surface)] rounded opacity-60" />
      </div>
      {/* Filter skeleton */}
      <div className="flex gap-3 mb-8">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-8 w-20 bg-[var(--hb-dark-surface)] rounded" />
        ))}
      </div>
      {/* Product grid skeleton */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="space-y-3 animate-pulse">
            <div className="aspect-[3/4] bg-[var(--hb-dark-surface)] rounded" />
            <div className="h-4 w-3/4 bg-[var(--hb-dark-surface)] rounded" />
            <div className="h-3 w-1/2 bg-[var(--hb-dark-surface)] rounded opacity-60" />
          </div>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Create `src/app/product/[slug]/loading.tsx`**

```tsx
export default function ProductLoading() {
  return (
    <div className="animate-pulse">
      {/* Dark hero section */}
      <section className="bg-[var(--hb-dark)] min-h-[70vh] px-4 sm:px-8 md:px-12 lg:px-20 py-16">
        <div className="max-w-7xl mx-auto grid gap-12 lg:grid-cols-[1fr_1fr] items-center">
          {/* Image skeleton */}
          <div className="aspect-[3/4] bg-[var(--hb-dark-surface)] rounded" />
          {/* Purchase panel skeleton */}
          <div className="space-y-6">
            <div className="h-3 w-24 bg-[var(--hb-dark-surface)] rounded" />
            <div className="h-10 w-3/4 bg-[var(--hb-dark-surface)] rounded" />
            <div className="h-4 w-20 bg-[var(--hb-dark-surface)] rounded" />
            <div className="flex gap-3 pt-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-11 w-16 bg-[var(--hb-dark-surface)] rounded" />
              ))}
            </div>
            <div className="h-14 w-full bg-[var(--hb-dark-surface)] rounded" />
          </div>
        </div>
      </section>
      {/* Light section skeleton */}
      <section className="px-4 sm:px-8 md:px-12 lg:px-20 py-16">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="h-32 bg-[var(--hb-smoke)]/10 rounded" />
          <div className="grid gap-6 md:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-[var(--hb-smoke)]/10 rounded" />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
```

- [ ] **Step 3: Create `src/app/projects/[slug]/loading.tsx`**

```tsx
export default function ProjectLoading() {
  return (
    <div className="px-4 sm:px-8 md:px-12 lg:px-20 py-16 animate-pulse">
      <div className="max-w-5xl mx-auto space-y-10">
        {/* Breadcrumb */}
        <div className="h-3 w-24 bg-[var(--hb-smoke)]/20 rounded" />
        {/* Hero image */}
        <div className="aspect-[16/9] bg-[var(--hb-smoke)]/10 rounded" />
        {/* Title block */}
        <div className="space-y-3">
          <div className="h-10 w-2/3 bg-[var(--hb-smoke)]/10 rounded" />
          <div className="h-4 w-1/2 bg-[var(--hb-smoke)]/10 rounded" />
        </div>
        {/* Content blocks */}
        <div className="grid gap-6 md:grid-cols-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-20 bg-[var(--hb-smoke)]/10 rounded" />
          ))}
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Commit**

```bash
git add src/app/shop/loading.tsx src/app/product/[slug]/loading.tsx src/app/projects/[slug]/loading.tsx
git commit -m "feat: add loading skeletons for shop, product, and project pages"
```

---

## Task 7: Error Boundaries

**Files:**
- Create: `src/app/shop/error.tsx`
- Create: `src/app/product/[slug]/error.tsx`
- Create: `src/app/projects/[slug]/error.tsx`

**Context:** Next.js App Router `error.tsx` files must be `'use client'` components (the error boundary must be client-side). They receive `error: Error` and `reset: () => void` props. Match the site's editorial aesthetic — dark background, Cormorant headline, DM Mono body text.

- [ ] **Step 1: Create `src/app/shop/error.tsx`**

```tsx
"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function ShopError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Shop error:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[var(--hb-dark)] flex items-center justify-center px-4">
      <div className="max-w-md text-center space-y-6">
        <p
          className="text-xs uppercase tracking-[0.4em] opacity-60"
          style={{ fontFamily: "var(--hb-font-mono)", color: "var(--hb-sienna)" }}
        >
          Shop
        </p>
        <h1
          className="text-4xl text-[#faf8f4] italic font-light"
          style={{ fontFamily: "var(--hb-font-display)" }}
        >
          Something went wrong
        </h1>
        <p
          className="text-sm"
          style={{ fontFamily: "var(--hb-font-mono)", color: "var(--hb-dark-muted)" }}
        >
          The shop couldn&apos;t be loaded. Try again or return home.
        </p>
        <div className="flex gap-4 justify-center pt-2">
          <button
            onClick={reset}
            className="px-6 py-3 border border-[var(--hb-dark-border)] text-[var(--hb-dark-muted)] uppercase tracking-[0.3em] text-xs hover:text-[#faf8f4] hover:border-[var(--hb-sienna)] transition-all duration-300"
            style={{ fontFamily: "var(--hb-font-mono)" }}
          >
            Try again
          </button>
          <Link
            href="/"
            className="px-6 py-3 bg-[var(--hb-sienna)] text-[#faf8f4] uppercase tracking-[0.3em] text-xs hover:opacity-90 transition-opacity"
            style={{ fontFamily: "var(--hb-font-mono)" }}
          >
            Return home
          </Link>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Create `src/app/product/[slug]/error.tsx`**

```tsx
"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function ProductError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Product error:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[var(--hb-dark)] flex items-center justify-center px-4">
      <div className="max-w-md text-center space-y-6">
        <p
          className="text-xs uppercase tracking-[0.4em] opacity-60"
          style={{ fontFamily: "var(--hb-font-mono)", color: "var(--hb-sienna)" }}
        >
          Product
        </p>
        <h1
          className="text-4xl text-[#faf8f4] italic font-light"
          style={{ fontFamily: "var(--hb-font-display)" }}
        >
          Piece unavailable
        </h1>
        <p
          className="text-sm"
          style={{ fontFamily: "var(--hb-font-mono)", color: "var(--hb-dark-muted)" }}
        >
          This garment couldn&apos;t be loaded. It may have moved or the archive is temporarily unavailable.
        </p>
        <div className="flex gap-4 justify-center pt-2">
          <button
            onClick={reset}
            className="px-6 py-3 border border-[var(--hb-dark-border)] text-[var(--hb-dark-muted)] uppercase tracking-[0.3em] text-xs hover:text-[#faf8f4] hover:border-[var(--hb-sienna)] transition-all duration-300"
            style={{ fontFamily: "var(--hb-font-mono)" }}
          >
            Try again
          </button>
          <Link
            href="/shop"
            className="px-6 py-3 bg-[var(--hb-sienna)] text-[#faf8f4] uppercase tracking-[0.3em] text-xs hover:opacity-90 transition-opacity"
            style={{ fontFamily: "var(--hb-font-mono)" }}
          >
            Back to shop
          </Link>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Create `src/app/projects/[slug]/error.tsx`**

```tsx
"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function ProjectError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Project error:", error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-md text-center space-y-6">
        <p
          className="text-xs uppercase tracking-[0.4em] opacity-60 font-script"
          style={{ color: "var(--hb-smoke)" }}
        >
          Projects
        </p>
        <h1 className="font-serif text-4xl leading-tight">
          Project not found
        </h1>
        <p
          className="text-sm"
          style={{ color: "var(--hb-smoke)" }}
        >
          This project couldn&apos;t be loaded. Return to the projects index to browse documentation.
        </p>
        <div className="flex gap-4 justify-center pt-2">
          <button
            onClick={reset}
            className="px-6 py-3 border border-dashed border-[var(--hb-border)] text-[var(--hb-smoke)] uppercase tracking-[0.3em] text-xs hover:border-[var(--hb-ink)] transition-all duration-300"
            style={{ fontFamily: "var(--hb-font-mono)" }}
          >
            Try again
          </button>
          <Link
            href="/projects"
            className="px-6 py-3 border border-[var(--hb-ink)] text-[var(--hb-ink)] uppercase tracking-[0.3em] text-xs hover:bg-[var(--hb-ink)] hover:text-[var(--hb-paper)] transition-all duration-300"
            style={{ fontFamily: "var(--hb-font-mono)" }}
          >
            All projects
          </Link>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Commit**

```bash
git add src/app/shop/error.tsx src/app/product/[slug]/error.tsx src/app/projects/[slug]/error.tsx
git commit -m "feat: add error boundaries for shop, product, and project pages"
```

---

## Task 8: Mobile Cart and Checkout Polish

**Files:**
- Modify: `src/components/cart/CartDrawer.tsx`
- Modify: `src/components/product/ProductPurchasePanel.tsx`

**Context:** Two issues to fix:
1. **CartDrawer** — quantity `+`/`–` buttons are `w-8 h-8` (32px), below the 44px minimum touch target. Close button is text-only with no height guarantee. The drawer uses `max-w-md` which already fills the screen on narrow viewports, but the close button and quantity controls need explicit min-height.
2. **ProductPurchasePanel** — size selector buttons use `px-5 py-2.5` which can be shorter than 44px depending on font. They need `min-h-[44px]`. Additionally, on mobile product pages the purchase panel is buried below the hero image; add a sticky bottom bar with price + "Add to cart" that's visible while scrolling. This sticky bar only shows on mobile (`md:hidden`).

**Sticky CTA note:** The sticky bar lives in `ProductPurchasePanel` as a fixed-position element. It listens to `selectedSize` state (already in scope) and dispatches the same `AddToCartButton` logic. The `AddToCartButton` component is already wired to the cart store.

- [ ] **Step 1: Fix CartDrawer tap targets in `src/components/cart/CartDrawer.tsx`**

Replace the close button:
```tsx
<button
  onClick={onClose}
  className="flex items-center justify-center min-h-[44px] min-w-[44px] text-xs uppercase tracking-[0.3em] text-[var(--hb-dark-muted)] hover:text-[#faf8f4] transition-colors"
  style={{ fontFamily: "var(--hb-font-mono)" }}
>
  Close
</button>
```

Replace quantity `–` button (currently `w-8 h-8`):
```tsx
<button
  onClick={() => updateQuantity(item.id, item.size, Math.max(1, item.quantity - 1))}
  className="w-11 h-11 text-[#faf8f4] flex items-center justify-center"
  style={{ fontFamily: "var(--hb-font-mono)" }}
>
  –
</button>
```

Replace the quantity display span:
```tsx
<span
  className="w-10 text-center text-[#faf8f4] text-sm self-center"
  style={{ fontFamily: "var(--hb-font-mono)" }}
>
  {item.quantity}
</span>
```

Replace quantity `+` button:
```tsx
<button
  onClick={() => updateQuantity(item.id, item.size, item.quantity + 1)}
  className="w-11 h-11 text-[#faf8f4] flex items-center justify-center"
  style={{ fontFamily: "var(--hb-font-mono)" }}
>
  +
</button>
```

- [ ] **Step 2: Fix size selector tap targets in `src/components/product/ProductPurchasePanel.tsx`**

In the size selector `button`, add `min-h-[44px]` to the className:

```tsx
<button
  key={size}
  onClick={() => setSelectedSize(size)}
  className={`px-5 py-2.5 min-h-[44px] border text-xs uppercase tracking-[0.3em] transition-all duration-300 hover-wispy ${
    selectedSize === size
      ? "border-[var(--hb-ink)] bg-[var(--hb-ink)] text-[var(--hb-paper)]"
      : "border-[var(--hb-border)] border-dashed text-[var(--hb-smoke)] hover:border-[var(--hb-ink-light)]"
  }`}
  style={{ borderWidth: "1px" }}
>
  {size}
</button>
```

- [ ] **Step 3: Add sticky mobile CTA to `src/components/product/ProductPurchasePanel.tsx`**

Import `AddToCartButton` is already imported. Add the sticky bar at the bottom of the returned JSX, after the existing `</div>` that closes `relative z-10`:

```tsx
{/* Sticky mobile Add to Cart — visible only below md breakpoint */}
<div className="fixed bottom-0 left-0 right-0 z-40 md:hidden border-t border-[var(--hb-dark-border)] bg-[var(--hb-dark)]/95 backdrop-blur-sm px-4 py-3 flex items-center gap-4">
  <div className="flex-1 min-w-0">
    <p
      className="text-xs uppercase tracking-[0.3em] truncate"
      style={{ fontFamily: "var(--hb-font-mono)", color: "var(--hb-dark-muted)" }}
    >
      {selectedSize ? `Size ${selectedSize}` : "Select a size"}
    </p>
    <p
      className="text-base text-[#faf8f4] italic font-light truncate"
      style={{ fontFamily: "var(--hb-font-display)" }}
    >
      {formatCurrency(product.price)}
    </p>
  </div>
  <div className="shrink-0">
    <AddToCartButton
      product={product}
      selectedSize={selectedSize}
      shopifyProductNode={shopifyProductNode}
      compact
    />
  </div>
</div>
```

**Important:** `AddToCartButton` doesn't currently accept a `compact` prop. Either:
- (a) Add `compact?: boolean` to its props and render a shorter button label (`"Add"` instead of `"Add to Cart"`) when compact is true, OR
- (b) Skip the `compact` prop and accept the standard button size.

Use option (a). Open `src/components/shop/AddToCartButton.tsx`, add `compact?: boolean` to its props interface, and render `compact ? "Add" : "Add to Cart"` (and `compact ? "Adding..." : "Adding to cart..."`) for the button text. Do this before adding the sticky bar.

- [ ] **Step 4: Update `src/components/shop/AddToCartButton.tsx` for compact mode**

Read the current file first, then add `compact?: boolean` to props and update the button label:

```tsx
// In the props interface:
interface AddToCartButtonProps {
  product: Product;
  selectedSize: string | null;
  shopifyProductNode?: ShopifyProductNode | null;
  compact?: boolean;
}

// In the button JSX, replace the text:
{isAdded
  ? "Added"
  : isLoading
  ? compact ? "Adding..." : "Adding to cart..."
  : compact ? "Add" : "Add to Cart"}
```

- [ ] **Step 5: Verify types**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 6: Commit**

```bash
git add src/components/cart/CartDrawer.tsx src/components/product/ProductPurchasePanel.tsx src/components/shop/AddToCartButton.tsx
git commit -m "feat: mobile polish — 44px tap targets in cart drawer, sticky Add to Cart on product pages"
```

---

## Self-Review

**Spec coverage check:**
- ✅ 2.1 — Task 1 creates `src/lib/env.ts` and updates all 3 API files
- ✅ 2.2 — Task 2 removes GSAP and dead draw-random-underline components
- ✅ 3.1 — Tasks 3–4 add metadata to all 5 static pages and fix openGraph images on dynamic routes
- ✅ 3.3 — Task 5 adds sitemap and robots
- ✅ 4.1 — Task 6 adds loading skeletons for shop, product, projects/[slug]
- ✅ 4.2 — Task 7 adds error boundaries for shop, product, projects/[slug]
- ✅ 4.3 — Task 8 fixes cart tap targets and adds sticky product page CTA

**Not in scope (Phase 5, post-launch):** search, wishlist, newsletter, URL-synced filters.

**Phase 3.2 (verify static generation)** — spec says "verify, no new implementation unless issues found." No task created; review manually after deployment.
