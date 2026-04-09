![1775685678005](image/CLAUDE/1775685678005.png)# Hana-Bi — Claude Project Context

## What This Is

Hana-Bi is a sustainable denim brand website built with Next.js 15 App Router. It functions as both a storefront and a personal project portfolio. The aesthetic is editorial — Japanese fashion magazine-inspired, with hand-drawn SVG borders, ink underlines, paper textures, and archival typography.

## Tech Stack

- **Framework:** Next.js 15 App Router (TypeScript)
- **Styling:** Tailwind CSS with custom CSS variables (see `globals.css`)
- **Payments:** Stripe (Checkout Sessions, webhooks)
- **Email:** Resend
- **Cart:** Zustand (client-side, persisted locally)
- **Animations:** Framer Motion
- **Package manager:** npm

## Key Architecture Decisions

### Stripe as Product Source of Truth
- All shop products come from Stripe Dashboard via `src/lib/stripe-catalog.ts`
- `getStripeCatalog()` uses `for await` autopaging — fetches all products regardless of catalog size
- Falls back to `src/data/products.ts` local data if `STRIPE_SECRET_KEY` is missing
- Product metadata keys in Stripe: `slug`, `status`, `sizes`, `collection`, `year`, `story`, `materials`, `care`, `notes`, `featured`, `tags`, `sold_sizes`
- `sold_sizes` = comma-separated sizes that are sold out per product (e.g. `XS,S`)

### Checkout Flow
- Client POSTs `{ items: [{ priceId, quantity }] }` to `/api/checkout`
- Server creates Stripe Checkout Session with `shipping_address_collection`
- Success page polls `/api/checkout/verify` which calls `stripe.checkout.sessions.retrieve()` directly — no in-memory state
- Webhook at `/api/webhooks/stripe` sends branded order confirmation email via Resend on `checkout.session.completed`

### Session Verification
- Previously used an in-memory `Set` (broken in serverless) — now calls Stripe API directly in `/api/checkout/verify/route.ts`

### Waitlist / Email Capture
- `/api/waitlist` route handles the Layered Denim email capture form
- Sends confirmation to subscriber + notification to `WAITLIST_NOTIFY_EMAIL` via Resend
- `EmailCaptureForm` component in `src/components/layered-denim/`

## Environment Variables

```env
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
NEXT_PUBLIC_SITE_URL=http://localhost:3000        # must be real domain in production
STRIPE_WEBHOOK_SECRET=whsec_...                  # from stripe listen or Dashboard
STRIPE_SHIPPING_COUNTRIES=US,CA,GB,JP,AU         # optional, comma-separated ISO codes
STRIPE_SHIPPING_RATE_IDS=shr_...                 # optional, comma-separated Stripe rate IDs
RESEND_API_KEY=re_...
WAITLIST_NOTIFY_EMAIL=hello@hana-bi.com
```

## Routes

| Route | Type | Purpose |
|-------|------|---------|
| `/` | Static | Homepage — hero, philosophy panels, featured products, archive strip |
| `/shop` | Static | Full product grid with filters |
| `/product/[slug]` | SSG | Product detail — images, story, materials, purchase panel |
| `/archive` | Static | Sold-out/archived Stripe products grouped by year |
| `/projects` | Static | Personal sewing projects (not for sale) |
| `/projects/[slug]` | SSG | Project detail — gallery with lightbox, story, fabric |
| `/about` | Static | Brand story with tilt-card chapters |
| `/cart` | Client | Cart page |
| `/success` | Client | Post-checkout confirmation, polls verify endpoint |
| `/layered-denim` | Static | Upcoming drop landing page with waitlist form |
| `/api/checkout` | Dynamic | Creates Stripe Checkout Session |
| `/api/checkout/verify` | Dynamic | Verifies payment via Stripe API |
| `/api/webhooks/stripe` | Dynamic | Handles Stripe webhook events |
| `/api/waitlist` | Dynamic | Handles waitlist form submissions |

## Data Files

### `src/data/products.ts`
Local fallback product data. Only used when Stripe is not configured. `Product` type is the shared interface for both Stripe and fallback products.

### `src/data/projects.ts`
Personal sewing projects data — separate from shop products. Fields: `id`, `slug`, `name`, `status`, `description`, `story`, `fabric?`, `heroImage`, `images[]`, `year`. No Stripe integration — fully local.

**Project statuses:** `in_progress` | `completed` | `on_hold` | `planning`

**Media:** Stored in `public/projects/<project-name>-media/` as `.jpg` files. Use root-relative paths (e.g. `/projects/wool-trousers-media/wool-trousers-hero.jpg`).

**Note:** `.avif` files exported from iPhone/Mac are actually HEIF encoded and won't display in browsers. Convert with ImageMagick: `magick input.avif output.jpg`

## Navigation Order

Home → Shop → Archive → Projects → About

## Page Purposes (important distinction)
- **Shop** — current available products for purchase (from Stripe)
- **Archive** — past retail drops that are sold out or archived (from Stripe, filtered by status)
- **Projects** — personal pre-retail builds and experiments (local data, not for sale)

## Key Components

| Component | Purpose |
|-----------|---------|
| `src/components/common/TiltCard.tsx` | Mouse-tracking 3D perspective tilt — used on About page chapter cards |
| `src/components/common/ImageLightbox.tsx` | Full-screen image viewer with keyboard nav (Esc, ←, →) |
| `src/components/projects/ProjectGallery.tsx` | Client component — hero + thumbnails with lightbox integration |
| `src/components/about/ChapterCards.tsx` | Origin/Process/Future Drops cards with tilt effect |
| `src/components/cart/CartDrawer.tsx` | Slide-in cart drawer |
| `src/components/shop/AddToCartButton.tsx` | Checks `status === 'available'` AND `soldSizes` before allowing add |
| `src/lib/stripe-catalog.ts` | Fetches + maps Stripe products to `Product` type |
| `src/lib/env.ts` | Centralised env var exports |

## Deployment Checklist (before going live)

- [ ] Update `NEXT_PUBLIC_SITE_URL` to real domain
- [ ] Set `STRIPE_WEBHOOK_SECRET` to production webhook secret (not CLI)
- [ ] Update Resend `from:` address from `onboarding@resend.dev` to verified domain sender in:
  - `src/app/api/waitlist/route.ts`
  - `src/app/api/webhooks/stripe/route.ts`
- [ ] Add `public/og-default.jpg` (1200×630px) for social sharing previews
- [ ] Switch Stripe from test mode (`sk_test_`) to live (`sk_live_`)

## Known Limitations / Future Work

- Webhook handler sends order confirmation email but has no order tracking/fulfillment system
- Per-size inventory is managed manually via `sold_sizes` Stripe metadata — no automatic decrement
- Catalog pagination is handled but >100 products have never been tested
- Projects data is hardcoded — no CMS
