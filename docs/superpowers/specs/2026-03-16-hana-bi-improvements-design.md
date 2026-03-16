# Hana-Bi — Full Improvement Roadmap Design
**Date:** 2026-03-16
**Status:** Approved by user
**Scope:** Pre-launch improvements across all 5 areas: backend, code quality, performance/SEO, UX, and new features

---

## Overview

Hana-Bi is a sustainable denim e-commerce storefront (Next.js 16, React 19, TypeScript, Shopify Storefront API, Stripe, Zustand) currently in development. The site is not yet live. This document defines the full improvement roadmap organized into 5 phases by priority.

---

## Phase 1 — Critical Fixes (Must Fix Before Launch)

### 1.1 Fix Stripe Checkout — Dynamic Line Items (All Carts)

**Decision:** Stripe is used for all checkout flows — both the main store cart and the `/layered-denim` campaign page.

**Problem:** `src/app/api/checkout/route.ts` always creates a Stripe session with a single hardcoded `STRIPE_PRICE_ID`, ignoring actual cart contents entirely.

**Fix:**
- Accept `lineItems` in the POST body: `[{ name, price, quantity, image? }]`
- Build Stripe `price_data` dynamically from those items
- Remove the `STRIPE_PRICE_ID` env var dependency
- Validate the request body (non-empty items, positive prices)

**API shape:**
```ts
// POST /api/checkout
// Body: { items: Array<{ name: string; price: number; quantity: number; image?: string }> }
// Response: { url: string }
```

**Cart integration:** The cart drawer and cart page checkout button should serialize `useCartStore.getState().items` into the above shape before calling this endpoint. The campaign page (`/layered-denim`) also calls this same endpoint.

---

### 1.2 Add Stripe Webhook Handler

**Problem:** The success page trusts the `?session_id` URL parameter without server-side verification. This is spoofable.

**Fix:**
- Add `src/app/api/webhooks/stripe/route.ts`
- Handle `checkout.session.completed` event
- Verify webhook signature using `STRIPE_WEBHOOK_SECRET`
- The success page should call a server action to verify the `session_id` server-side before rendering the confirmation UI
- After successful verification, clear the Zustand cart client-side (the cart is client-only — there is no server-side cart to clear)

**New env vars needed:** `STRIPE_WEBHOOK_SECRET`

**Note on Zustand v5:** The project uses Zustand v5. When adding `persist` middleware (Phase 1.3), test for SSR hydration mismatches — use `skipHydration` if needed for the Next.js App Router.

---

### 1.3 Persist Cart to localStorage

**Problem:** Zustand cart is in-memory only — resets on every page refresh.

**Fix:**
- Add `zustand/middleware` `persist` to `src/store/cart.ts`
- Persist to `localStorage` under key `hana-bi-cart`
- The store interface stays the same — no component changes needed
- Test for hydration mismatches in the App Router; use `skipHydration` option if the cart flickers on load

---

### 1.4 Wire Main Store Cart to Stripe Checkout

**Problem:** The main store cart has no working checkout path — the cart drawer and cart page have no button that calls the checkout API.

**Fix:**
- Add a "Checkout" button to the cart drawer and cart page
- On click, serialize cart items from `useCartStore.getState().items` into the `lineItems` shape from Phase 1.1
- POST to `/api/checkout`, then redirect to the returned Stripe `url`
- Show a loading/disabled state on the button while the request is in flight

**Architecture decision:** Stripe for all checkout flows. The Shopify `createCheckout()` function in `shopify.ts` is kept in place (it provides correct inventory data) but the payment step goes through Stripe.

---

## Phase 2 — Code Quality & Architecture

### 2.1 Centralize Environment Variable Validation

**Problem:** Env var checks are scattered across `shopify.ts`, `checkout/route.ts`, and other files with inconsistent error messaging.

**Fix:**
- Create `src/lib/env.ts` that reads and validates all required env vars at module load time
- Export typed constants: `SHOPIFY_STORE_DOMAIN`, `STRIPE_SECRET_KEY`, etc.
- All other files import from `env.ts` rather than `process.env` directly
- Throw a clear, descriptive error on startup if required vars are missing

---

### 2.2 Remove Redundant Animation Library

**Problem:** Both Framer Motion and GSAP are installed. They overlap for most use cases and add significant bundle weight.

**Fix:**
- Audit all components for GSAP vs. Framer Motion usage (check `src/components/`)
- Migrate GSAP usages to Framer Motion where possible (mount/exit animations, hover effects)
- Keep GSAP only if scroll-triggered timeline animations are genuinely used and can't be replicated in Framer Motion
- Remove whichever library ends up with no remaining usages

---

### 2.3 Review Fallback Data File Size

**Note:** `src/data/products.ts` is currently ~199 lines (6 products) — appropriately sized. Monitor this file as the catalog grows. If it exceeds ~500 lines or 50+ products, consider splitting into per-collection JSON files and lazy-loading with dynamic `import()` to avoid bundle bloat. No action needed now.

---

## Phase 3 — Performance & SEO

### 3.1 Complete Metadata Coverage

**Current state:** Root `metadata` exists in `layout.tsx`. `generateMetadata()` is implemented on `product/[slug]` and `projects/[slug]`. Static pages (shop, about, archive, projects index) and Open Graph images are missing.

**Fix:**
- Add `openGraph.images` to the existing `generateMetadata()` on product and project pages, using the product/project hero image
- Add static `metadata` exports (title, description, openGraph) to: `/shop`, `/about`, `/archive`, `/projects`
- Ensure the root `layout.tsx` metadata includes a default `openGraph.images` fallback

---

### 3.2 Verify Static Generation

**Current state:** `generateStaticParams()` is already implemented on both `product/[slug]` and `projects/[slug]`. The 60s `revalidate` is set in `shopify.ts`.

**Action:** Verify the revalidation strategy is appropriate for production. Confirm that `generateStaticParams` for product pages correctly fetches from Shopify and falls back to local data when the API is unavailable. No new implementation needed unless issues are found.

---

### 3.3 Sitemap and robots.txt

**Fix:**
- Add `src/app/sitemap.ts` — include all product handles, project slugs, and static pages
- Add `src/app/robots.ts` — allow all crawlers, point to the sitemap URL

---

## Phase 4 — UX Polish

### 4.1 Loading Skeletons

**Fix:**
- Add `src/app/shop/loading.tsx` — skeleton grid of product cards
- Add `src/app/product/[slug]/loading.tsx` — skeleton matching the product page layout
- Add `src/app/projects/[slug]/loading.tsx`
- Skeletons should match the paper/ink aesthetic (muted tones, not generic gray boxes)

---

### 4.2 Error Boundaries

**Fix:**
- Add `src/app/shop/error.tsx` — friendly fallback if shop fails to load
- Add `src/app/product/[slug]/error.tsx` — with a "back to shop" link
- Add `src/app/projects/[slug]/error.tsx`
- Each error boundary should match the site's editorial design

---

### 4.3 Mobile Cart & Checkout Audit

**Key files to audit:** cart drawer component (`src/components/cart/`), product purchase panel (`src/components/product/`)

**Fix:**
- Cart drawer: ensure full-width on screens < 480px, tap targets ≥ 44px, large close button
- Product page size selector: no horizontal scroll on mobile
- Add sticky "Add to Cart" CTA on mobile product pages
- Consider swipe-to-close gesture on the cart drawer

---

## Phase 5 — New Features

### 5.1 Product Search

- Add `searchProducts(query: string)` to `src/lib/shopify.ts` using Shopify's `products(query: $query)` GraphQL argument — this function does not exist yet and must be added before the UI can be built
- Add `src/app/search/page.tsx` rendering search results
- Add search icon to `SiteHeader` that navigates to `/search?q=`
- Support query params: `/search?q=jacket`

### 5.2 Wishlist

- localStorage-backed wishlist in a new Zustand store `src/store/wishlist.ts`
- Heart icon on `ProductCard` — filled/outlined based on wishlist state
- `/wishlist` page listing saved items

### 5.3 Newsletter Signup

- Footer email capture form (Resend or Mailchimp)
- Server action at `src/app/actions/newsletter.ts`
- Especially useful pre-launch for building a drop waitlist

### 5.4 URL-Synced Shop Filters

- Replace current in-memory filter state with `useSearchParams` / `useRouter`
- Filters: collection, size, price range, availability
- Makes filtered views shareable (e.g., `/shop?size=M&collection=archive`)

---

## Architecture Summary

| Layer | Current State | Target State |
|-------|--------------|--------------|
| Main store checkout | No checkout button in cart UI | Cart wired to dynamic Stripe checkout |
| Campaign checkout | Hardcoded single Stripe price | Dynamic Stripe line items (same endpoint) |
| Payment verification | Success page trusts URL param | Server-side session verification + webhook |
| Cart state | In-memory Zustand | Persisted to localStorage |
| Env validation | Scattered across files | Centralized `env.ts` |
| Animation | GSAP + Framer Motion | Framer Motion primary |
| SEO metadata | Partial (root + dynamic routes) | Complete coverage + Open Graph images |
| Static gen | Already implemented | Verify + confirm ISR strategy |
| Sitemap/robots | None | `sitemap.ts` + `robots.ts` |
| Error handling | None | `error.tsx` per route segment |
| Loading states | None | `loading.tsx` per route segment |

---

## Implementation Order

1. Phase 1 (Critical) — unblocks a functional, secure checkout
2. Phase 2 (Code quality) — reduces complexity before adding features
3. Phase 3 (SEO/Perf) — easy wins, important for launch visibility
4. Phase 4 (UX) — polish pass before going live
5. Phase 5 (Features) — post-launch or parallel with Phase 4
