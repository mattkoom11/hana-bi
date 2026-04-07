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
