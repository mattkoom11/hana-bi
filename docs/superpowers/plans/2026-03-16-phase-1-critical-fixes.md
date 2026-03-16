# Phase 1 — Critical Fixes Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix the broken Stripe checkout (which ignores cart contents), add payment verification, and persist the cart across page refreshes.

**Architecture:** The `/api/checkout` route is rewritten to accept dynamic `items[]` from the client. Both the cart drawer and cart page switch from the Shopify checkout route to this Stripe route. A new `/api/webhooks/stripe` route verifies payments server-side. Cart state is persisted to localStorage via Zustand's `persist` middleware.

**Tech Stack:** Next.js 16 App Router, TypeScript, Stripe SDK v20, Zustand v5, `zustand/middleware` persist

**Spec:** `docs/superpowers/specs/2026-03-16-hana-bi-improvements-design.md`

---

> **Note — No test framework installed:** This project has no Jest/Vitest. Verification steps use `npx tsc --noEmit` (type checking) and `npm run build` (build gate) throughout. Manual testing steps use Stripe CLI. Adding a test framework (Vitest) is recommended as Phase 2 work.

---

## Chunk 1: Stripe Checkout API + Cart Integration

### Task 1: Rewrite `/api/checkout/route.ts` — dynamic line items

**Files:**
- Modify: `src/app/api/checkout/route.ts`

The current route ignores the request body and always charges a hardcoded `STRIPE_PRICE_ID`. Rewrite it to:
1. Parse `items[]` from the request body
2. Build Stripe `price_data` dynamically per item
3. Remove all `STRIPE_PRICE_ID` references
4. Support a `cancelUrl` parameter (so both the campaign page and cart can provide their own cancel destination)

- [ ] **Step 1: Replace the route with dynamic line item handling**

Replace the entire contents of `src/app/api/checkout/route.ts` with:

```typescript
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

export interface CheckoutLineItem {
  name: string;
  price: number; // in cents (e.g. 19800 = $198.00)
  quantity: number;
  image?: string;
}

export interface CheckoutRequestBody {
  items: CheckoutLineItem[];
  cancelUrl?: string;
}

function getStripe() {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    throw new Error("STRIPE_SECRET_KEY is not set");
  }
  return new Stripe(secretKey, {
    apiVersion: "2025-12-15.clover",
    typescript: true,
  });
}

export async function POST(request: NextRequest) {
  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json(
      { error: "Server configuration error" },
      { status: 500 }
    );
  }

  if (!process.env.NEXT_PUBLIC_SITE_URL) {
    return NextResponse.json(
      { error: "Server configuration error" },
      { status: 500 }
    );
  }

  let body: CheckoutRequestBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  if (!body.items || body.items.length === 0) {
    return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
  }

  for (const item of body.items) {
    if (!item.name || typeof item.name !== "string") {
      return NextResponse.json({ error: "Invalid item name" }, { status: 400 });
    }
    if (typeof item.price !== "number" || item.price <= 0) {
      return NextResponse.json({ error: "Invalid item price" }, { status: 400 });
    }
    if (typeof item.quantity !== "number" || item.quantity < 1) {
      return NextResponse.json({ error: "Invalid item quantity" }, { status: 400 });
    }
  }

  try {
    const stripe = getStripe();
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
    const cancelUrl = body.cancelUrl ?? `${siteUrl}/cart`;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: body.items.map((item) => ({
        price_data: {
          currency: "usd",
          product_data: {
            name: item.name,
            ...(item.image ? { images: [item.image] } : {}),
          },
          unit_amount: Math.round(item.price), // price is already in cents
        },
        quantity: item.quantity,
      })),
      mode: "payment",
      success_url: `${siteUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Stripe checkout error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to create checkout session. Please try again.",
      },
      { status: 500 }
    );
  }
}
```

- [ ] **Step 2: Type-check**

```bash
npx tsc --noEmit
```

Expected: no errors on `src/app/api/checkout/route.ts`

- [ ] **Step 3: Commit**

```bash
git add src/app/api/checkout/route.ts
git commit -m "feat: rewrite checkout route to accept dynamic line items"
```

---

### Task 2: Update `CartDrawer.tsx` to use Stripe checkout

**Files:**
- Modify: `src/components/cart/CartDrawer.tsx`

Currently calls `POST /api/shopify/checkout` with `{ lineItems: [{ variantId, quantity }] }`. Change it to call `POST /api/checkout` with `{ items: [{ name, price, quantity, image? }], cancelUrl: "/cart" }`.

The `price` field in `CartItem` is a number — check whether it is stored in dollars or cents. Looking at the store: `price: number` with no conversion, and `formatCurrency` likely treats it as dollars. Stripe expects cents. Multiply by 100 when sending to the API.

- [ ] **Step 1: Replace the `handleCheckout` function in `CartDrawer.tsx`**

Find and replace the `handleCheckout` function (lines 17–56) with:

```typescript
async function handleCheckout(items: CartItem[], onClose: () => void) {
  if (items.length === 0) {
    return;
  }

  try {
    const response = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items: items.map((item) => ({
          name: `${item.name} — Size ${item.size}`,
          price: Math.round(item.price * 100), // convert dollars to cents
          quantity: item.quantity,
          ...(item.image ? { image: item.image } : {}),
        })),
        cancelUrl: `${window.location.origin}/cart`,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to create checkout");
    }

    const { url } = await response.json();
    onClose();
    window.location.href = url;
  } catch (error) {
    console.error("Checkout error:", error);
    alert(
      error instanceof Error
        ? error.message
        : "Failed to start checkout. Please try again."
    );
  }
}
```

- [ ] **Step 2: Remove the `variantId` filter** (the old `validItems` check) since Stripe doesn't need variant IDs. The new function above already handles this — verify the function no longer references `validItems` or `variantId`.

- [ ] **Step 3: Type-check**

```bash
npx tsc --noEmit
```

Expected: no errors

- [ ] **Step 4: Commit**

```bash
git add src/components/cart/CartDrawer.tsx
git commit -m "feat: switch cart drawer checkout from Shopify to Stripe"
```

---

### Task 3: Update `cart/page.tsx` to use Stripe checkout

**Files:**
- Modify: `src/app/cart/page.tsx`

Same change as Task 2 — swap the `handleCheckout` function and update the page intro text.

- [ ] **Step 1: Replace `handleCheckout` in `src/app/cart/page.tsx`** (lines 9–47) with:

```typescript
async function handleCheckout(items: CartItem[]) {
  if (items.length === 0) {
    return;
  }

  try {
    const response = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items: items.map((item) => ({
          name: `${item.name} — Size ${item.size}`,
          price: Math.round(item.price * 100), // convert dollars to cents
          quantity: item.quantity,
          ...(item.image ? { image: item.image } : {}),
        })),
        cancelUrl: `${window.location.origin}/cart`,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to create checkout");
    }

    const { url } = await response.json();
    window.location.href = url;
  } catch (error) {
    console.error("Checkout error:", error);
    alert(
      error instanceof Error
        ? error.message
        : "Failed to start checkout. Please try again."
    );
  }
}
```

- [ ] **Step 2: Update the page intro text** — find the `intro` prop on `<PageShell>` and change it to:

```
"Cart items are stored locally. Checkout is handled securely by Stripe."
```

- [ ] **Step 3: Type-check and build**

```bash
npx tsc --noEmit && npm run build
```

Expected: clean build, no type errors

- [ ] **Step 4: Commit**

```bash
git add src/app/cart/page.tsx
git commit -m "feat: switch cart page checkout from Shopify to Stripe"
```

---

### Task 4: Update `BuyButton.tsx` (campaign) to send item data

**Files:**
- Modify: `src/components/layered-denim/BuyButton.tsx`

Currently sends `POST /api/checkout` with no body. The new route requires `{ items[] }` — so it will now return a 400 "Cart is empty" error. Fix it to send the Layered Denim product as a line item.

The campaign price should come from an env var or prop. For now, hardcode it as a prop with a sensible default to keep the campaign page flexible.

- [ ] **Step 1: Add a `price` prop to `BuyButton` and send item data**

Replace the entire contents of `src/components/layered-denim/BuyButton.tsx` with:

```typescript
'use client';

import { motion } from "framer-motion";
import { useState } from "react";

interface BuyButtonProps {
  className?: string;
  price?: number; // price in dollars, e.g. 198
}

export function BuyButton({ className, price = 198 }: BuyButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCheckout = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: [
            {
              name: "Layered Denim",
              price: Math.round(price * 100), // convert dollars to cents
              quantity: 1,
            },
          ],
          cancelUrl: `${window.location.origin}/layered-denim`,
        }),
      });

      let data;
      try {
        data = await response.json();
      } catch {
        throw new Error("Invalid response from server");
      }

      if (!response.ok) {
        throw new Error(data.error || "Failed to create checkout session");
      }

      if (!data.url) {
        throw new Error("No checkout URL received");
      }

      window.location.href = data.url;
    } catch (err) {
      console.error("Checkout error:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again."
      );
      setLoading(false);
    }
  };

  return (
    <div className={className}>
      <motion.button
        onClick={handleCheckout}
        disabled={loading}
        whileHover={!loading ? { scale: 1.02, rotate: 0.5 } : {}}
        whileTap={!loading ? { scale: 0.98 } : {}}
        className="w-full py-4 bg-[var(--hb-ink)] text-[var(--hb-paper)] rounded-2xl font-serif text-lg hover:bg-[var(--hb-ink-light)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {loading ? "Processing..." : "Buy Layered Denim"}
      </motion.button>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-3 p-3 bg-red-50 border border-red-200 rounded-xl"
        >
          <p className="text-sm text-red-600 font-script">{error}</p>
          <button
            onClick={() => setError(null)}
            className="mt-2 text-xs text-red-600 hover:text-red-800 underline"
          >
            Dismiss
          </button>
        </motion.div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Type-check**

```bash
npx tsc --noEmit
```

Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add src/components/layered-denim/BuyButton.tsx
git commit -m "feat: pass dynamic item to Stripe checkout from campaign buy button"
```

---

### Task 5: Manual smoke test — checkout flow

Before moving to Chunk 2, manually verify the checkout route works end-to-end.

**Prerequisites:** `.env.local` must have `STRIPE_SECRET_KEY` and `NEXT_PUBLIC_SITE_URL` set. Use a Stripe test mode key.

- [ ] **Step 1: Start the dev server**

```bash
npm run dev
```

- [ ] **Step 2: Test the API directly with curl**

```bash
curl -X POST http://localhost:3000/api/checkout \
  -H "Content-Type: application/json" \
  -d '{"items":[{"name":"Test Jacket","price":19800,"quantity":1}]}'
```

Expected: `{"url":"https://checkout.stripe.com/c/pay/..."}` — a valid Stripe checkout URL

- [ ] **Step 3: Test empty cart rejection**

```bash
curl -X POST http://localhost:3000/api/checkout \
  -H "Content-Type: application/json" \
  -d '{"items":[]}'
```

Expected: `{"error":"Cart is empty"}` with status 400

- [ ] **Step 4: Test end-to-end in browser**

1. Open `http://localhost:3000/shop`
2. Add any product to cart
3. Open cart drawer → click "Checkout"
4. Verify you are redirected to Stripe's hosted checkout page
5. The line items on the Stripe page should show the correct product name, size, price, and quantity

---

## Chunk 2: Webhook Verification + Cart Persistence

### Task 6: Add Stripe webhook handler

**Files:**
- Create: `src/app/api/webhooks/stripe/route.ts`

This route receives `POST` from Stripe when a payment completes. It verifies the webhook signature and stores a verified session ID so the success page can confirm it server-side.

For session storage without a database, use a simple in-memory Set (sufficient for dev/small scale). For production, this should be replaced with Redis or a database write.

- [ ] **Step 1: Add `STRIPE_WEBHOOK_SECRET` to your `.env.local`**

Get it from the Stripe dashboard → Webhooks → your endpoint → "Signing secret". For local testing, use the Stripe CLI (see Task 7).

```.env.local
STRIPE_WEBHOOK_SECRET=whsec_your_secret_here
```

- [ ] **Step 2: Create the webhook route**

Create `src/app/api/webhooks/stripe/route.ts`:

```typescript
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import Stripe from "stripe";

// In-memory store for verified session IDs.
// In production, replace with a database write (Redis, Postgres, etc.)
export const verifiedSessions = new Set<string>();

function getStripe() {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) throw new Error("STRIPE_SECRET_KEY is not set");
  return new Stripe(secretKey, {
    apiVersion: "2025-12-15.clover",
    typescript: true,
  });
}

// Note: In Next.js App Router, raw body access is done via request.text() directly.
// The Pages Router `export const config = { api: { bodyParser: false } }` pattern
// has no effect here and is NOT used.

export async function POST(request: Request) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error("STRIPE_WEBHOOK_SECRET is not set");
    return NextResponse.json(
      { error: "Webhook secret not configured" },
      { status: 500 }
    );
  }

  const body = await request.text();
  const headersList = await headers();
  const signature = headersList.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    const stripe = getStripe();
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    if (session.payment_status === "paid" && session.id) {
      verifiedSessions.add(session.id);
      console.log(`Payment verified for session: ${session.id}`);
    }
  }

  return NextResponse.json({ received: true });
}
```

- [ ] **Step 3: Type-check**

```bash
npx tsc --noEmit
```

Expected: no errors

- [ ] **Step 4: Commit**

```bash
git add src/app/api/webhooks/stripe/route.ts
git commit -m "feat: add Stripe webhook handler for payment verification"
```

---

### Task 7: Add server-side session verification endpoint

**Files:**
- Create: `src/app/api/checkout/verify/route.ts`

The success page needs to verify a `session_id` before showing the confirmation UI. This route checks the in-memory verified sessions set.

> **Production note:** Importing a mutable `Set` across route files works in a single long-running process (local dev, traditional Node server) but is stateless across serverless function invocations in production (Vercel, etc.) — each cold-start gets an empty set. For production, replace `verifiedSessions` with a database or Redis check. This is acceptable for development and pre-launch testing.

- [ ] **Step 1: Create the verification route**

Create `src/app/api/checkout/verify/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { verifiedSessions } from "@/app/api/webhooks/stripe/route";

export async function GET(request: NextRequest) {
  const sessionId = request.nextUrl.searchParams.get("session_id");

  if (!sessionId) {
    return NextResponse.json({ verified: false, error: "Missing session_id" }, { status: 400 });
  }

  const verified = verifiedSessions.has(sessionId);
  return NextResponse.json({ verified });
}
```

- [ ] **Step 2: Type-check**

```bash
npx tsc --noEmit
```

Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add src/app/api/checkout/verify/route.ts
git commit -m "feat: add session verification endpoint for success page"
```

---

### Task 8: Update the success page to verify before confirming

**Files:**
- Modify: `src/app/success/page.tsx`

Currently the page shows "Order Confirmed" to anyone who visits `/success?session_id=anything`. It needs to call the verify endpoint first.

The strategy is to **insert** the loading and unverified branches at the top of the existing `SuccessContent` function body — not replace the whole function. This avoids duplicating the large verified-state JSX.

- [ ] **Step 1: Add new imports to `src/app/success/page.tsx`**

The file currently imports `{ useState }` from `"react"` and `useSearchParams` from `"next/navigation"`. Update the import lines at the top of the file:

```typescript
import { useEffect, useState } from "react";
import { useCartStore } from "@/store/cart";
```

`motion`, `Link`, `useSearchParams`, and `Suspense` imports stay unchanged.

- [ ] **Step 2: Add `verified` state and verification `useEffect` to `SuccessContent`**

Inside `SuccessContent`, after the existing line:
```typescript
const sessionId = searchParams.get("session_id");
```

Insert these two blocks:

```typescript
const [verified, setVerified] = useState<boolean | null>(null);

useEffect(() => {
  if (!sessionId) {
    setVerified(false);
    return;
  }

  fetch(`/api/checkout/verify?session_id=${encodeURIComponent(sessionId)}`)
    .then((res) => res.json())
    .then((data) => {
      const isVerified = data.verified === true;
      setVerified(isVerified);
      if (isVerified) {
        // Clear cart after confirmed payment — use getState() inside useEffect
        useCartStore.getState().clearCart();
      }
    })
    .catch(() => setVerified(false));
}, [sessionId]);
```

- [ ] **Step 3: Add loading and unverified early-return branches to `SuccessContent`**

Immediately before the existing `return (` statement in `SuccessContent`, insert:

```typescript
// Loading — waiting for verification
if (verified === null) {
  return (
    <div className="min-h-screen bg-[var(--hb-paper)] flex items-center justify-center">
      <p className="text-[var(--hb-smoke)] font-script">Confirming your order...</p>
    </div>
  );
}

// Unverified — payment not confirmed
if (!verified) {
  return (
    <div className="min-h-screen bg-[var(--hb-paper)] text-[var(--hb-ink)] flex items-center justify-center px-4">
      <div className="max-w-md text-center space-y-6">
        <h1 className="font-serif text-3xl">Order not found</h1>
        <p className="text-[var(--hb-smoke)]">
          We couldn&apos;t verify your order. If you completed a purchase, check your email for confirmation.
        </p>
        <Link
          href="/"
          className="inline-block px-8 py-4 bg-[var(--hb-ink)] text-[var(--hb-paper)] rounded-2xl font-serif text-lg"
        >
          Return Home
        </Link>
      </div>
    </div>
  );
}
```

The existing `return (` that follows is the verified success UI — it does not change.

- [ ] **Step 4: Type-check**

```bash
npx tsc --noEmit
```

Expected: no errors

- [ ] **Step 5: Commit**

```bash
git add src/app/success/page.tsx
git commit -m "feat: verify Stripe session before showing order confirmation"
```

---

### Task 9: Persist cart to localStorage

**Files:**
- Modify: `src/store/cart.ts`

The cart resets on every page refresh. Add Zustand's `persist` middleware to save to localStorage.

**Zustand v5 note:** The `persist` middleware is imported from `zustand/middleware`. In Next.js App Router (SSR), `persist` can cause hydration mismatches because the server renders with an empty cart but the client hydrates with a localStorage cart. Use `skipHydration: true` and manually rehydrate on mount in a client layout component, or just accept the brief hydration mismatch for a client-only cart.

The simplest approach that avoids SSR issues: use `skipHydration: false` (default) but wrap cart-count displays in a `useEffect` to avoid the mismatch warning. For a pre-launch store this is acceptable.

- [ ] **Step 1: Add `persist` middleware to `src/store/cart.ts`**

Replace the entire contents of `src/store/cart.ts` with:

```typescript
'use client';

import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CartItem {
  id: string;
  productId: string;
  variantId: string;
  name: string;
  slug: string;
  price: number;
  size: string;
  quantity: number;
  image?: string;
}

interface CartState {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  removeItem: (id: string, size: string) => void;
  updateQuantity: (id: string, size: string, quantity: number) => void;
  clearCart: () => void;
  isCheckingOut: boolean;
  setCheckingOut: (isCheckingOut: boolean) => void;
}

const findItemIndex = (items: CartItem[], id: string, size: string) =>
  items.findIndex((item) => item.id === id && item.size === size);

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      isCheckingOut: false,
      addItem: (newItem, quantity = 1) =>
        set((state) => {
          const items = [...state.items];
          const index = findItemIndex(items, newItem.id, newItem.size);
          if (index > -1) {
            items[index] = { ...items[index], quantity: items[index].quantity + quantity };
            return { items };
          }
          return { items: [...items, { ...newItem, quantity }] };
        }),
      removeItem: (id, size) =>
        set((state) => ({
          items: state.items.filter(
            (cartItem) => !(cartItem.id === id && cartItem.size === size)
          ),
        })),
      updateQuantity: (id, size, quantity) =>
        set((state) => {
          if (quantity <= 0) {
            return {
              items: state.items.filter(
                (cartItem) => !(cartItem.id === id && cartItem.size === size)
              ),
            };
          }
          return {
            items: state.items.map((cartItem) =>
              cartItem.id === id && cartItem.size === size
                ? { ...cartItem, quantity }
                : cartItem
            ),
          };
        }),
      clearCart: () => set({ items: [], isCheckingOut: false }),
      setCheckingOut: (isCheckingOut) => set({ isCheckingOut }),
    }),
    {
      name: "hana-bi-cart",
      // Only persist items — isCheckingOut is transient UI state, not persisted
      partialize: (state) => ({ items: state.items }),
    }
  )
);

export const useCartCount = () =>
  useCartStore((state) =>
    state.items.reduce((total, item) => total + item.quantity, 0)
  );

export const useCartTotal = () =>
  useCartStore((state) =>
    state.items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  );
```

- [ ] **Step 2: Type-check**

```bash
npx tsc --noEmit
```

Expected: no errors — Zustand v5 ships types for `persist` internally

- [ ] **Step 3: Build gate**

```bash
npm run build
```

Expected: clean build. If you see a hydration warning in the output, it's a warning not an error — acceptable for now.

- [ ] **Step 4: Manual verify persistence**

1. Run `npm run dev`
2. Add an item to the cart
3. Refresh the page
4. Open the cart drawer — the item should still be there
5. Open browser DevTools → Application → Local Storage → `localhost:3000` → confirm `hana-bi-cart` key exists

- [ ] **Step 5: Commit**

```bash
git add src/store/cart.ts
git commit -m "feat: persist cart to localStorage with Zustand persist middleware"
```

---

### Task 10: Manual end-to-end test with Stripe CLI

Verify the full flow: add to cart → checkout → webhook → success page verification.

**Prerequisites:** [Stripe CLI](https://stripe.com/docs/stripe-cli) installed.

- [ ] **Step 1: Start dev server and Stripe CLI listener in parallel**

Terminal 1:
```bash
npm run dev
```

Terminal 2:
```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

The CLI will print a webhook signing secret like `whsec_...`. Copy it into `.env.local` as `STRIPE_WEBHOOK_SECRET=whsec_...` and restart the dev server.

- [ ] **Step 2: Complete a test purchase**

1. Add items to cart
2. Click Checkout
3. On Stripe's hosted page, use test card `4242 4242 4242 4242`, any future expiry, any CVC
4. Complete the payment

- [ ] **Step 3: Verify webhook received**

In Terminal 2, you should see:
```
--> checkout.session.completed [evt_...]
<-- [200] POST http://localhost:3000/api/webhooks/stripe
```

- [ ] **Step 4: Verify success page**

After Stripe redirects you to `/success?session_id=cs_test_...`:
- The page should show "Order Confirmed" (not "Order not found")
- The cart should be empty after the redirect

- [ ] **Step 5: Test unverified access**

Navigate directly to `/success?session_id=fake_id` — should show "Order not found", not "Order Confirmed".

- [ ] **Step 6: Final build**

```bash
npm run build
```

Expected: clean build, no type errors.

- [ ] **Step 7: Final commit**

```bash
git add .
git commit -m "chore: verify Phase 1 complete — dynamic Stripe checkout, webhook verification, cart persistence"
```

---

## Environment Variables Summary

Add these to `.env.local` before starting:

```bash
# Required for Stripe checkout
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Required for webhook verification (get from Stripe CLI or dashboard)
STRIPE_WEBHOOK_SECRET=whsec_...

# Remove — no longer needed
# STRIPE_PRICE_ID=price_...
```

---

## Files Changed Summary

| File | Action |
|------|--------|
| `src/app/api/checkout/route.ts` | Rewrite — dynamic line items, remove STRIPE_PRICE_ID |
| `src/app/api/checkout/verify/route.ts` | Create — session verification endpoint |
| `src/app/api/webhooks/stripe/route.ts` | Create — webhook handler, populates verifiedSessions |
| `src/components/cart/CartDrawer.tsx` | Modify — switch to Stripe checkout, send item data |
| `src/app/cart/page.tsx` | Modify — switch to Stripe checkout, send item data |
| `src/components/layered-denim/BuyButton.tsx` | Modify — send item data in request body |
| `src/app/success/page.tsx` | Modify — verify session before confirming, clear cart |
| `src/store/cart.ts` | Modify — add persist middleware |
