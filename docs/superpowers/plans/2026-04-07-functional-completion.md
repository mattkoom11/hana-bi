# Functional Completion Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Complete the 7 remaining gaps that prevent Hana-Bi from operating as a real store.

**Architecture:** All changes are server-side Next.js App Router (API routes + RSC). Session verification moves from an in-memory Set to direct Stripe API lookup. Shipping is collected via Stripe Checkout's built-in fields. Per-size sold-out state lives in Stripe product metadata. Email capture uses Resend. No database is introduced.

**Tech Stack:** Next.js 15 App Router, Stripe Node SDK, Resend, TypeScript, Zustand (cart), Tailwind CSS.

---

## Chunk 1: Quick wins (Tags, 404, Autopaging)

### Task 1: Parse `tags` metadata from Stripe

**Files:**
- Modify: `src/lib/stripe-catalog.ts:45`

The `mapStripeProduct` function hard-codes `tags: []`. A Stripe product can store a `tags` metadata key as a comma-separated string (e.g. `indigo,selvedge,runway`). Parse it.

- [ ] **Step 1: Update `mapStripeProduct` in `src/lib/stripe-catalog.ts`**

Replace the `tags` line:
```diff
-    tags: [], // Stripe products have no native tag array; add tags via a 'tags' metadata key if needed
+    tags: m.tags ? m.tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
```

- [ ] **Step 2: Verify manually**

In Stripe Dashboard → a product → Metadata, add key `tags` with value `indigo,selvedge`. Restart dev server (`npm run dev`). Navigate to the product detail page and confirm the tags render in the tag strip at the bottom of the page ([src/app/product/[slug]/page.tsx:139](src/app/product/[slug]/page.tsx#L139)).

- [ ] **Step 3: Commit**
```bash
git add src/lib/stripe-catalog.ts
git commit -m "feat: parse tags from Stripe product metadata"
```

---

### Task 2: Custom 404 page

**Files:**
- Create: `src/app/not-found.tsx`

Next.js App Router automatically uses `src/app/not-found.tsx` for all unmatched routes and explicit `notFound()` calls. The existing product page already calls `notFound()` for missing slugs.

- [ ] **Step 1: Create `src/app/not-found.tsx`**

```tsx
import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="min-h-screen bg-[var(--hb-dark)] flex items-center justify-center px-4">
      <div className="max-w-md text-center space-y-8">
        <p
          className="uppercase text-xs tracking-[0.5em] opacity-70"
          style={{ fontFamily: 'var(--hb-font-mono)', color: 'var(--hb-sienna)' }}
        >
          HB — 404
        </p>
        <h1
          className="text-5xl lg:text-6xl leading-tight text-[#faf8f4] italic font-light"
          style={{ fontFamily: 'var(--hb-font-display)' }}
        >
          Page not found.
        </h1>
        <p
          className="text-sm leading-relaxed"
          style={{ fontFamily: 'var(--hb-font-mono)', color: 'var(--hb-dark-muted)' }}
        >
          This garment may have moved to the archive, or the URL was mistyped.
        </p>
        <div className="flex gap-4 justify-center flex-wrap pt-4">
          <Link
            href="/shop"
            className="px-8 py-4 bg-[var(--hb-sienna)] text-[#faf8f4] uppercase tracking-[0.4em] text-xs hover:opacity-90 transition-opacity"
            style={{ fontFamily: 'var(--hb-font-mono)' }}
          >
            Browse Shop
          </Link>
          <Link
            href="/archive"
            className="px-8 py-4 border border-[var(--hb-dark-border)] text-[var(--hb-dark-muted)] uppercase tracking-[0.4em] text-xs hover:text-[#faf8f4] hover:border-[var(--hb-sienna)] transition-all"
            style={{ fontFamily: 'var(--hb-font-mono)' }}
          >
            Enter Archive
          </Link>
        </div>
      </div>
    </main>
  );
}
```

- [ ] **Step 2: Verify manually**

Navigate to `http://localhost:3000/this-does-not-exist`. Should render the custom 404 instead of Next.js default.

- [ ] **Step 3: Commit**
```bash
git add src/app/not-found.tsx
git commit -m "feat: add custom 404 page"
```

---

### Task 3: Catalog autopaging

**Files:**
- Modify: `src/lib/stripe-catalog.ts:65-85`

The current fetch uses `stripe.products.list(...)` with `limit: 100` and logs a warning when `has_more=true`. Replace with `autoPagingEach` so all products are always fetched regardless of catalog size.

- [ ] **Step 1: Replace the list call in `getStripeCatalog`**

In `src/lib/stripe-catalog.ts`, replace the body of `getStripeCatalog` from the `stripe.products.list(...)` call to the end of the function:

```ts
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
```

> The `for await ... of stripe.products.list(...)` pattern uses Stripe's built-in auto-paging. Each iteration fetches the next page automatically. Remove the old `has_more` warning block entirely.

- [ ] **Step 2: Verify the build compiles**
```bash
npm run build
```
Expected: no TypeScript errors.

- [ ] **Step 3: Commit**
```bash
git add src/lib/stripe-catalog.ts
git commit -m "feat: autopaginate Stripe catalog fetch"
```

---

## Chunk 2: Checkout hardening (Verification + Shipping)

### Task 4: Fix session verification — use Stripe API directly

**Files:**
- Modify: `src/app/api/checkout/verify/route.ts`
- Modify: `src/app/api/webhooks/stripe/route.ts`

**Problem:** `verify/route.ts` imports `verifiedSessions` (an in-memory `Set`) from the webhook route. On Vercel, each serverless function invocation runs in isolation — the webhook writes to one instance, the verify poll hits a different one, and verification always returns `false`.

**Fix:** The verify route calls Stripe directly to retrieve the session and checks `payment_status === 'paid'`. No shared state needed. The webhook handler keeps running (it's useful for future order fulfillment hooks) but the `verifiedSessions` Set and its import are removed.

- [ ] **Step 1: Rewrite `src/app/api/checkout/verify/route.ts`**

```ts
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { STRIPE_SECRET_KEY } from '@/lib/env';

let _stripe: Stripe | null = null;
function getStripe(): Stripe {
  if (_stripe) return _stripe;
  if (!STRIPE_SECRET_KEY) throw new Error('STRIPE_SECRET_KEY is not set');
  _stripe = new Stripe(STRIPE_SECRET_KEY, { apiVersion: '2025-12-15.clover', typescript: true });
  return _stripe;
}

export async function GET(request: NextRequest) {
  const sessionId = request.nextUrl.searchParams.get('session_id');

  if (!sessionId || !sessionId.startsWith('cs_')) {
    return NextResponse.json({ verified: false, error: 'Invalid session_id' }, { status: 400 });
  }

  if (!STRIPE_SECRET_KEY) {
    return NextResponse.json({ verified: false, error: 'Server configuration error' }, { status: 500 });
  }

  try {
    const stripe = getStripe();
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    const verified = session.payment_status === 'paid';
    return NextResponse.json({ verified });
  } catch (error) {
    console.error('Session verification error:', error);
    return NextResponse.json({ verified: false }, { status: 200 });
  }
}
```

- [ ] **Step 2: Remove `verifiedSessions` from `src/app/api/webhooks/stripe/route.ts`**

Delete the export and all references to it. The webhook handler body stays intact (it logs the payment) but no longer manages a Set:

```diff
-// In-memory store for verified session IDs.
-// In production, replace with a database write (Redis, Postgres, etc.)
-export const verifiedSessions = new Set<string>();
-
 function getStripe() {
```

And inside the handler, remove the `.add` call:
```diff
   if (event.type === 'checkout.session.completed') {
     const session = event.data.object as Stripe.Checkout.Session;
     if (session.payment_status === 'paid' && session.id) {
-      verifiedSessions.add(session.id);
       console.log(`Payment verified for session: ${session.id}`);
     }
   }
```

- [ ] **Step 3: Verify the build compiles**
```bash
npm run build
```
Expected: no TypeScript errors (no dangling import).

- [ ] **Step 4: Manual test**

  1. Run `stripe listen --forward-to localhost:3000/api/webhooks/stripe`
  2. Add a product to cart → Checkout → use Stripe test card `4242 4242 4242 4242`
  3. Confirm redirect to `/success` and that "Order Confirmed" appears (not "Order not found")

- [ ] **Step 5: Commit**
```bash
git add src/app/api/checkout/verify/route.ts src/app/api/webhooks/stripe/route.ts
git commit -m "fix: verify checkout session via Stripe API instead of in-memory set"
```

---

### Task 5: Add shipping address collection to checkout

**Files:**
- Modify: `src/lib/env.ts`
- Modify: `src/app/api/checkout/route.ts`

Stripe Checkout can collect a shipping address and apply pre-configured shipping rates. Shipping rates are created in the Stripe Dashboard (Products → Shipping rates) and referenced by ID. This task adds address collection and optional shipping rates via env var.

- [ ] **Step 1: Add env vars to `src/lib/env.ts`**

```diff
 // Site
 export const NEXT_PUBLIC_SITE_URL = process.env.NEXT_PUBLIC_SITE_URL;
+
+// Shipping
+// Comma-separated Stripe shipping rate IDs, e.g. shr_xxx,shr_yyy
+// Leave unset to collect address only with no shipping rate applied.
+export const STRIPE_SHIPPING_RATE_IDS = process.env.STRIPE_SHIPPING_RATE_IDS;
+// Comma-separated ISO 3166-1 alpha-2 country codes allowed for shipping
+export const STRIPE_SHIPPING_COUNTRIES = process.env.STRIPE_SHIPPING_COUNTRIES ?? 'US,CA,GB,JP,AU';
```

- [ ] **Step 2: Add shipping to the checkout session in `src/app/api/checkout/route.ts`**

Import the new env vars at the top:
```diff
-import { STRIPE_SECRET_KEY, NEXT_PUBLIC_SITE_URL } from '@/lib/env';
+import { STRIPE_SECRET_KEY, NEXT_PUBLIC_SITE_URL, STRIPE_SHIPPING_RATE_IDS, STRIPE_SHIPPING_COUNTRIES } from '@/lib/env';
```

Then add shipping fields to `stripe.checkout.sessions.create(...)`:

```diff
     const session = await stripe.checkout.sessions.create({
       payment_method_types: ['card'],
       line_items: body.items.map((item) => ({
         price: item.priceId,
         quantity: item.quantity,
       })),
       mode: 'payment',
+      shipping_address_collection: {
+        allowed_countries: STRIPE_SHIPPING_COUNTRIES.split(',').map((c) => c.trim()) as Stripe.Checkout.SessionCreateParams.ShippingAddressCollection.AllowedCountry[],
+      },
+      ...(STRIPE_SHIPPING_RATE_IDS
+        ? {
+            shipping_options: STRIPE_SHIPPING_RATE_IDS.split(',')
+              .map((id) => id.trim())
+              .filter(Boolean)
+              .map((shipping_rate) => ({ shipping_rate })),
+          }
+        : {}),
       success_url: `${siteUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
       cancel_url: cancelUrl,
     });
```

- [ ] **Step 3: Add optional vars to `.env.local`** (if you have Stripe shipping rates configured)

```env
# Optional — leave unset if you haven't created shipping rates yet
# STRIPE_SHIPPING_RATE_IDS=shr_xxx
STRIPE_SHIPPING_COUNTRIES=US,CA,GB,JP,AU
```

- [ ] **Step 4: Verify the build compiles**
```bash
npm run build
```

- [ ] **Step 5: Manual test**

Checkout flow should now show a shipping address form on the Stripe-hosted page. If `STRIPE_SHIPPING_RATE_IDS` is not set, it collects the address silently with no shipping cost shown.

- [ ] **Step 6: Commit**
```bash
git add src/lib/env.ts src/app/api/checkout/route.ts .env.local
git commit -m "feat: collect shipping address in Stripe Checkout"
```

---

## Chunk 3: Per-size inventory + Email capture

### Task 6: Per-size sold-out state via Stripe metadata

**Files:**
- Modify: `src/data/products.ts` — add `soldSizes` to `Product` type
- Modify: `src/lib/stripe-catalog.ts` — parse `sold_sizes` metadata
- Modify: `src/components/product/ProductPurchasePanel.tsx` — disable sold-out size buttons

Stripe doesn't have native per-variant inventory. The pattern here is to store a `sold_sizes` metadata key on the Stripe product (e.g. `XS,S`) listing sizes that have sold out. The UI disables those size buttons and adds a "Sold out" label.

- [ ] **Step 1: Add `soldSizes` to the `Product` type in `src/data/products.ts`**

```diff
   featured?: boolean;
+  soldSizes?: string[];
 }
```

Also update the fallback product data at the bottom of the file — `soldSizes` is optional so no data migration needed.

- [ ] **Step 2: Parse `sold_sizes` in `mapStripeProduct` in `src/lib/stripe-catalog.ts`**

```diff
     featured: m.featured === 'true',
+    soldSizes: m.sold_sizes ? m.sold_sizes.split(',').map((s) => s.trim()).filter(Boolean) : [],
   };
 }
```

- [ ] **Step 3: Update `ProductPurchasePanel.tsx` to disable sold-out sizes**

The size map currently renders all sizes as selectable. Add a check:

```diff
 export function ProductPurchasePanel({ product }: ProductPurchasePanelProps) {
   const [selectedSize, setSelectedSize] = useState<string | null>(
-    product.sizes[0] ?? null
+    product.sizes.find((s) => !product.soldSizes?.includes(s)) ?? product.sizes[0] ?? null
   );
   const isAvailable = product.status === 'available';
```

Then in the size button loop:

```diff
           {product.sizes.map((size) => {
+            const isSoldOut = product.soldSizes?.includes(size);
             return (
               <button
                 key={size}
-                onClick={() => setSelectedSize(size)}
+                onClick={() => !isSoldOut && setSelectedSize(size)}
+                disabled={isSoldOut}
                 className={`px-5 py-2.5 min-h-[44px] border text-xs uppercase tracking-[0.3em] transition-all duration-300 hover-wispy ${
                   selectedSize === size
                     ? 'border-[var(--hb-ink)] bg-[var(--hb-ink)] text-[var(--hb-paper)]'
-                    : 'border-[var(--hb-border)] border-dashed text-[var(--hb-smoke)] hover:border-[var(--hb-ink-light)]'
+                    : isSoldOut
+                    ? 'border-[var(--hb-border)] border-dashed text-[var(--hb-smoke)] opacity-30 cursor-not-allowed line-through'
+                    : 'border-[var(--hb-border)] border-dashed text-[var(--hb-smoke)] hover:border-[var(--hb-ink-light)]'
                 }`}
                 style={{ borderWidth: '1px' }}
               >
                 {size}
               </button>
             );
           })}
```

> Note: the existing JSX uses `.map()` directly without `return`. Adjust to a block body as shown above.

- [ ] **Step 4: Verify manually**

In Stripe Dashboard → product → Metadata, add `sold_sizes` = `XS`. Restart dev server. On the product page, XS should appear struck-through and unclickable.

- [ ] **Step 5: Commit**
```bash
git add src/data/products.ts src/lib/stripe-catalog.ts src/components/product/ProductPurchasePanel.tsx
git commit -m "feat: per-size sold-out state via Stripe metadata"
```

---

### Task 7: Wire up email capture form to Resend

**Files:**
- Create: `src/app/api/waitlist/route.ts`
- Modify: `src/components/layered-denim/EmailCaptureForm.tsx`
- Modify: `src/lib/env.ts`
- Modify: `.env.local`

**Pre-requisite:** Sign up at [resend.com](https://resend.com), create an API key, and verify your sending domain (or use `onboarding@resend.dev` for testing before domain verification).

- [ ] **Step 1: Install Resend**
```bash
npm install resend
```

- [ ] **Step 2: Add env vars to `src/lib/env.ts`**

```diff
+// Email (Resend)
+export const RESEND_API_KEY = process.env.RESEND_API_KEY;
+// Address that receives waitlist notification emails
+export const WAITLIST_NOTIFY_EMAIL = process.env.WAITLIST_NOTIFY_EMAIL;
```

- [ ] **Step 3: Add vars to `.env.local`**

```env
RESEND_API_KEY=re_...
WAITLIST_NOTIFY_EMAIL=hello@hana-bi.com
```

- [ ] **Step 4: Create `src/app/api/waitlist/route.ts`**

```ts
import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { RESEND_API_KEY, WAITLIST_NOTIFY_EMAIL } from '@/lib/env';

function getResend() {
  if (!RESEND_API_KEY) throw new Error('RESEND_API_KEY is not set');
  return new Resend(RESEND_API_KEY);
}

export async function POST(request: NextRequest) {
  if (!RESEND_API_KEY) {
    return NextResponse.json({ error: 'Email service not configured' }, { status: 500 });
  }

  let body: { name: string; email: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const { name, email } = body;

  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    return NextResponse.json({ error: 'Name is required' }, { status: 400 });
  }
  if (!email || typeof email !== 'string' || !email.includes('@')) {
    return NextResponse.json({ error: 'Valid email is required' }, { status: 400 });
  }

  const resend = getResend();

  // Send confirmation to subscriber
  await resend.emails.send({
    from: 'Hana-Bi <onboarding@resend.dev>', // swap to your verified domain sender
    to: email,
    subject: "You're on the Hana-Bi drop list",
    html: `<p>Hi ${name},</p><p>You're on the waitlist for Layered Denim. We'll notify you when it drops.</p><p>— Hana-Bi Studio</p>`,
  });

  // Notify store owner
  if (WAITLIST_NOTIFY_EMAIL) {
    await resend.emails.send({
      from: 'Hana-Bi Waitlist <onboarding@resend.dev>',
      to: WAITLIST_NOTIFY_EMAIL,
      subject: `New waitlist signup: ${name}`,
      html: `<p><strong>${name}</strong> (${email}) joined the Layered Denim waitlist.</p>`,
    });
  }

  return NextResponse.json({ success: true });
}
```

- [ ] **Step 5: Update `src/components/layered-denim/EmailCaptureForm.tsx`**

Replace the fake `handleSubmit` with a real fetch call:

```diff
   const handleSubmit = async (e: React.FormEvent) => {
     e.preventDefault();
     setFormState('loading');

-    // Simulate API call
-    await new Promise((resolve) => setTimeout(resolve, 1500));
-
-    // Simulate success (in real app, check response)
-    const success = Math.random() > 0.2; // 80% success rate for demo
-
-    if (success) {
+    try {
+      const res = await fetch('/api/waitlist', {
+        method: 'POST',
+        headers: { 'Content-Type': 'application/json' },
+        body: JSON.stringify({ name, email }),
+      });
+      if (!res.ok) throw new Error('Request failed');
       setFormState('success');
       setName('');
       setEmail('');
-    } else {
+    } catch {
       setFormState('error');
     }
   };
```

- [ ] **Step 6: Verify manually**

  1. Start dev server
  2. Navigate to `/layered-denim`
  3. Submit the form with your email
  4. Confirm you receive the confirmation email and the owner notification email

- [ ] **Step 7: Commit**
```bash
git add src/app/api/waitlist/route.ts src/components/layered-denim/EmailCaptureForm.tsx src/lib/env.ts
git commit -m "feat: wire email capture form to Resend waitlist API"
```
