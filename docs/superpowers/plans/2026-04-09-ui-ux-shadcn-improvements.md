# UI/UX Shadcn + 21st.dev Improvements Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace five custom-built UI components with shadcn/ui and 21st.dev equivalents to gain proper accessibility, focus management, and a more polished feel — without touching the Hana-Bi visual aesthetic.

**Architecture:** Each task is a drop-in replacement: install the shadcn component, rewrite the file to use it as the structural shell, and preserve all existing Tailwind/CSS-variable styling on top. No new pages, no routing changes, no store changes.

**Tech Stack:** Next.js 15 App Router, shadcn/ui (new-york style), Sonner (toast), 21st.dev Magic MCP, Tailwind CSS, Framer Motion, custom `--hb-*` CSS variables.

---

## Pre-flight check

- [ ] Run `npm run dev` in `/c/hana-bi` and confirm the site loads at `http://localhost:3000`
- [ ] `components.json` is already present at repo root (confirmed: new-york style, cssVariables: true)
- [ ] shadcn CSS variables already exist in `src/app/globals.css`

---

## Chunk 1: Sonner Toast — add-to-cart feedback

**Problem:** `AddToCartButton` silently calls `addItem()` with no user confirmation.  
**Fix:** Install Sonner, mount `<Toaster>` in the root layout, fire a toast on add.

**Files:**
- Modify: `src/app/layout.tsx`
- Modify: `src/components/shop/AddToCartButton.tsx`

### Task 1: Install and wire Sonner

- [ ] **Step 1: Install the sonner shadcn component**

```bash
cd /c/hana-bi && npx shadcn@latest add sonner
```

Expected: creates `src/components/ui/sonner.tsx`, installs `sonner` npm package.

- [ ] **Step 2: Add `<Toaster>` to root layout**

In `src/app/layout.tsx`, add the import and mount the Toaster inside `<body>`, after `<CustomScrollbar />`:

```tsx
import { Toaster } from "@/components/ui/sonner";
```

```tsx
<CustomScrollbar />
<Toaster
  position="bottom-right"
  toastOptions={{
    classNames: {
      toast: "bg-[var(--hb-dark-surface)] border border-[var(--hb-dark-border)] text-[#faf8f4]",
      description: "text-[var(--hb-dark-muted)]",
    },
  }}
/>
```

- [ ] **Step 3: Fire toast in AddToCartButton**

In `src/components/shop/AddToCartButton.tsx`:

Add import at top:
```tsx
import { toast } from "sonner";
```

Replace the `onClick` handler body:
```tsx
onClick={() => {
  if (!selectedSize) return;
  addItem(
    {
      id: `${product.id}-${selectedSize}`,
      productId: product.id,
      variantId: "",
      name: product.name,
      slug: product.slug,
      price: product.price,
      size: selectedSize,
      image: product.heroImage,
      stripePriceId: product.stripePriceId,
    },
    1
  );
  toast(`${product.name} added`, {
    description: `Size ${selectedSize} · ${formatCurrency(product.price)}`,
  });
}}
```

- [ ] **Step 4: Verify manually**

1. Run `npm run dev`
2. Navigate to any product page
3. Select a size and click "Add to Cart"
4. Confirm a toast appears bottom-right with the product name and size
5. Confirm toast auto-dismisses after ~4 seconds

- [ ] **Step 5: Commit**

```bash
cd /c/hana-bi && git add src/app/layout.tsx src/components/shop/AddToCartButton.tsx src/components/ui/sonner.tsx package.json package-lock.json
git commit -m "feat: add sonner toast on add-to-cart"
```

---

## Chunk 2: Sheet — CartDrawer focus trapping

**Problem:** `CartDrawer` mounts a raw `div` overlay with no focus trapping or ARIA role. Keyboard users and screen readers can't properly use it.  
**Fix:** Replace the outer shell with shadcn `Sheet`. Keep all visual styling inside.

**Files:**
- Modify: `src/components/cart/CartDrawer.tsx`

### Task 2: Refactor CartDrawer to use Sheet

- [ ] **Step 1: Install the sheet shadcn component**

```bash
cd /c/hana-bi && npx shadcn@latest add sheet
```

Expected: creates `src/components/ui/sheet.tsx`.

- [ ] **Step 2: Rewrite CartDrawer.tsx**

Replace the entire file content with:

```tsx
"use client";

import { formatCurrency } from "@/lib/utils";
import {
  useCartCount,
  useCartStore,
  useCartTotal,
  type CartItem,
} from "@/store/cart";
import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

interface CartDrawerProps {
  open: boolean;
  onClose: () => void;
}

async function handleCheckout(items: CartItem[], onClose: () => void) {
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
          priceId: item.stripePriceId!,
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

export function CartDrawer({ open, onClose }: CartDrawerProps) {
  const items = useCartStore((state) => state.items);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeItem = useCartStore((state) => state.removeItem);
  const clearCart = useCartStore((state) => state.clearCart);
  const itemCount = useCartCount();
  const total = useCartTotal();
  const setCheckingOut = useCartStore((state) => state.setCheckingOut);
  const [isLoading, setIsLoading] = useState(false);

  return (
    <Sheet open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <SheetContent
        side="right"
        className="grain w-full max-w-md p-0 bg-[var(--hb-dark-surface)] border-l border-[var(--hb-dark-border)] [&>button]:hidden"
      >
        <SheetHeader className="px-6 py-5 flex-row items-center justify-between border-b border-[var(--hb-dark-border)] space-y-0">
          <div>
            <p
              className="uppercase text-xs tracking-[0.35em] opacity-70"
              style={{ fontFamily: "var(--hb-font-mono)", color: "var(--hb-sienna)" }}
            >
              Cart
            </p>
            <SheetTitle
              className="text-2xl mt-1 text-[#faf8f4] italic font-light border-none"
              style={{ fontFamily: "var(--hb-font-display)" }}
            >
              {itemCount === 0 ? "Empty" : `${itemCount} item${itemCount > 1 ? "s" : ""}`}
            </SheetTitle>
          </div>
          <button
            onClick={onClose}
            className="flex items-center justify-center min-h-[44px] min-w-[44px] text-xs uppercase tracking-[0.3em] text-[var(--hb-dark-muted)] hover:text-[#faf8f4] transition-colors"
            style={{ fontFamily: "var(--hb-font-mono)" }}
          >
            Close
          </button>
        </SheetHeader>

        <div className="max-h-[65vh] overflow-y-auto divide-y divide-[var(--hb-dark-border)]">
          {items.length === 0 ? (
            <p
              className="px-6 py-12 text-sm text-[var(--hb-dark-muted)] leading-relaxed"
              style={{ fontFamily: "var(--hb-font-mono)" }}
            >
              The drawer is quiet. Add a garment to begin your Hana-Bi study.
            </p>
          ) : (
            items.map((item) => (
              <article
                key={`${item.id}-${item.size}`}
                className="px-6 py-5 bg-[var(--hb-dark)]"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p
                      className="text-lg text-[#faf8f4] italic font-light"
                      style={{ fontFamily: "var(--hb-font-display)" }}
                    >
                      {item.name}
                    </p>
                    <p
                      className="text-xs uppercase tracking-[0.25em] mt-1"
                      style={{ fontFamily: "var(--hb-font-mono)", color: "var(--hb-dark-muted)" }}
                    >
                      Size {item.size}
                    </p>
                  </div>
                  <button
                    onClick={() => removeItem(item.id, item.size)}
                    className="text-xs uppercase tracking-[0.3em] text-[var(--hb-dark-muted)] hover:text-[#faf8f4] transition-colors"
                    style={{ fontFamily: "var(--hb-font-mono)" }}
                  >
                    ×
                  </button>
                </div>
                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center border border-[var(--hb-dark-border)]">
                    <button
                      onClick={() => updateQuantity(item.id, item.size, Math.max(1, item.quantity - 1))}
                      className="w-11 h-11 text-[#faf8f4] flex items-center justify-center"
                      style={{ fontFamily: "var(--hb-font-mono)" }}
                    >
                      –
                    </button>
                    <span
                      className="w-10 text-center text-[#faf8f4] text-sm self-center"
                      style={{ fontFamily: "var(--hb-font-mono)" }}
                    >
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.id, item.size, item.quantity + 1)}
                      className="w-11 h-11 text-[#faf8f4] flex items-center justify-center"
                      style={{ fontFamily: "var(--hb-font-mono)" }}
                    >
                      +
                    </button>
                  </div>
                  <span
                    className="text-sm"
                    style={{ fontFamily: "var(--hb-font-mono)", color: "var(--hb-sienna)" }}
                  >
                    {formatCurrency(item.price * item.quantity)}
                  </span>
                </div>
              </article>
            ))
          )}
        </div>

        {items.length > 0 && (
          <footer className="px-6 py-5 border-t border-[var(--hb-dark-border)] space-y-4">
            <div className="flex items-center justify-between">
              <span
                className="text-xs uppercase tracking-[0.3em]"
                style={{ fontFamily: "var(--hb-font-mono)", color: "var(--hb-dark-muted)" }}
              >
                Total
              </span>
              <span
                className="text-base text-[#faf8f4]"
                style={{ fontFamily: "var(--hb-font-mono)" }}
              >
                {formatCurrency(total)}
              </span>
            </div>
            <button
              onClick={async () => {
                setIsLoading(true);
                setCheckingOut(true);
                await handleCheckout(items, onClose);
                setIsLoading(false);
                setCheckingOut(false);
              }}
              disabled={isLoading}
              className="w-full bg-[var(--hb-sienna)] text-[#faf8f4] uppercase tracking-[0.4em] px-6 py-4 text-xs hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ fontFamily: "var(--hb-font-mono)" }}
            >
              {isLoading ? "Redirecting..." : "Checkout"}
            </button>
            <button
              onClick={clearCart}
              className="w-full text-xs uppercase tracking-[0.3em] text-[var(--hb-dark-muted)] hover:text-[#faf8f4] transition-colors"
              style={{ fontFamily: "var(--hb-font-mono)" }}
            >
              Clear cart
            </button>
          </footer>
        )}
      </SheetContent>
    </Sheet>
  );
}
```

- [ ] **Step 3: Verify manually**

1. Open the cart drawer via the header "Cart" button
2. Confirm the drawer slides in from the right, visually identical to before
3. Tab through the drawer — focus should stay trapped inside
4. Press `Escape` — drawer should close
5. Click the backdrop — drawer should close
6. Confirm items, quantity controls, and checkout button all work

- [ ] **Step 4: Commit**

```bash
cd /c/hana-bi && git add src/components/cart/CartDrawer.tsx src/components/ui/sheet.tsx package.json package-lock.json
git commit -m "feat: replace CartDrawer with shadcn Sheet for focus trapping"
```

---

## Chunk 3: Dialog — SizeGuideModal accessibility

**Problem:** `SizeGuideModal` is a raw `div` with no ARIA role, no `Escape` key handler, no focus lock, and no scroll lock.  
**Fix:** Replace with shadcn `Dialog`.

**Files:**
- Modify: `src/components/product/SizeGuideModal.tsx`

### Task 3: Refactor SizeGuideModal to use Dialog

- [ ] **Step 1: Install the dialog shadcn component**

```bash
cd /c/hana-bi && npx shadcn@latest add dialog
```

Expected: creates `src/components/ui/dialog.tsx`.

- [ ] **Step 2: Rewrite SizeGuideModal.tsx**

Replace the entire file content with:

```tsx
"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const MEASUREMENTS = [
  { label: "Shoulder", value: "38cm" },
  { label: "Chest", value: "92cm" },
  { label: "Waist", value: "74cm" },
  { label: "Hip", value: "98cm" },
];

export function SizeGuideModal() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <button className="text-xs uppercase tracking-[0.3em] text-[var(--hb-smoke)] border-b border-[var(--hb-border)]">
          Size Guide
        </button>
      </DialogTrigger>
      <DialogContent className="bg-[var(--hb-paper)] border border-[var(--hb-border)] max-w-md [&>button]:text-[var(--hb-smoke)] [&>button]:hover:text-[var(--hb-ink)]">
        <DialogHeader>
          <DialogTitle className="uppercase text-xs tracking-[0.35em] text-[var(--hb-smoke)] font-normal">
            Measurements
          </DialogTitle>
        </DialogHeader>
        <ul className="space-y-2 mt-2">
          {MEASUREMENTS.map((measure) => (
            <li
              key={measure.label}
              className="flex items-center justify-between text-sm"
            >
              <span>{measure.label}</span>
              <span className="text-[var(--hb-smoke)]">{measure.value}</span>
            </li>
          ))}
        </ul>
        <p className="text-[0.75rem] text-[var(--hb-smoke)] mt-4">
          Measurements based on sample size M. Adjustments available in studio fittings.
        </p>
      </DialogContent>
    </Dialog>
  );
}
```

- [ ] **Step 3: Verify manually**

1. Navigate to any product page
2. Click "Size Guide" — modal should open, backdrop should darken
3. Press `Escape` — modal should close
4. Click outside the modal — modal should close
5. Tab through the modal — focus should be trapped
6. Confirm measurements list renders correctly

- [ ] **Step 4: Commit**

```bash
cd /c/hana-bi && git add src/components/product/SizeGuideModal.tsx src/components/ui/dialog.tsx package.json package-lock.json
git commit -m "feat: replace SizeGuideModal with shadcn Dialog for a11y"
```

---

## Chunk 4: Accordion — FAQAccordion keyboard navigation

**Problem:** `FAQAccordion` is a custom accordion with no keyboard navigation (arrow keys) and missing ARIA `role="region"` on panels.  
**Fix:** Replace with shadcn `Accordion`, preserve all visual styling.

**Files:**
- Modify: `src/components/layered-denim/FAQAccordion.tsx`

### Task 4: Refactor FAQAccordion to use shadcn Accordion

- [ ] **Step 1: Install the accordion shadcn component**

```bash
cd /c/hana-bi && npx shadcn@latest add accordion
```

Expected: creates `src/components/ui/accordion.tsx`.

- [ ] **Step 2: Rewrite FAQAccordion.tsx**

Replace the entire file content with:

```tsx
'use client';

import { cn } from "@/lib/utils";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQAccordionProps {
  items: FAQItem[];
  className?: string;
}

export function FAQAccordion({ items, className }: FAQAccordionProps) {
  return (
    <Accordion type="single" collapsible className={cn("space-y-0", className)}>
      {items.map((item, index) => (
        <AccordionItem
          key={index}
          value={`item-${index}`}
          className="border-b border-[var(--hb-border)] border-t-0 border-l-0 border-r-0"
        >
          <AccordionTrigger className="font-serif text-lg text-left hover:text-[var(--hb-accent)] hover:no-underline py-4 [&>svg]:text-[var(--hb-smoke)]">
            {item.question}
          </AccordionTrigger>
          <AccordionContent className="text-[var(--hb-smoke)] leading-relaxed pb-4">
            {item.answer}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
```

- [ ] **Step 3: Verify manually**

1. Navigate to `/layered-denim`
2. Confirm the FAQ section renders correctly
3. Click a question — it should expand with animation
4. Press arrow keys — focus should move between questions
5. Press `Space` or `Enter` — focused item should toggle
6. Confirm only one item is open at a time

- [ ] **Step 4: Commit**

```bash
cd /c/hana-bi && git add src/components/layered-denim/FAQAccordion.tsx src/components/ui/accordion.tsx package.json package-lock.json
git commit -m "feat: replace FAQAccordion with shadcn Accordion for keyboard nav"
```

---

## Chunk 5: 21st.dev Magic — EmailCaptureForm polish

**Problem:** `EmailCaptureForm` uses plain `<input>` elements with minimal styling. The editorial aesthetic calls for something more considered.  
**Fix:** Use the Magic MCP to find a polished waitlist/email capture component, then adapt it to match Hana-Bi's CSS variables and typography.

**Files:**
- Modify: `src/components/layered-denim/EmailCaptureForm.tsx`

### Task 5: Enhance EmailCaptureForm with 21st.dev Magic

- [ ] **Step 1: Search Magic for a relevant component**

Use the `magic` MCP tool to search for a component. The prompt to use:

> "waitlist email signup form with name and email fields, minimal editorial style, success state animation"

Review the results and pick the component that best matches: minimal, no heavy shadows, clean input borders, serif-friendly.

- [ ] **Step 2: Adapt the component**

Take the chosen component's structure and adapt it to `EmailCaptureForm.tsx`. The required constraints:
- Keep the existing `FormState` type and `handleSubmit` logic (the API call is correct)
- Keep `AnimatePresence` success state with the checkmark SVG
- Replace the input/button HTML with the 21st.dev component's structure
- Map any color tokens to `--hb-*` variables:
  - backgrounds → `var(--hb-paper-muted)`
  - borders → `var(--hb-border)`
  - focus ring → `var(--hb-accent)`
  - submit button → `var(--hb-ink)` bg, `var(--hb-paper)` text
- Keep `font-serif` on the button, `font-script` on labels

Example of what the adapted inputs should look like (adjust based on what Magic returns):

```tsx
<input
  id="name"
  type="text"
  value={name}
  onChange={(e) => setName(e.target.value)}
  required
  disabled={formState === 'loading'}
  className="w-full px-4 py-3 bg-transparent border-b border-[var(--hb-border)] focus:outline-none focus:border-[var(--hb-accent)] disabled:opacity-50 transition-colors font-serif placeholder:text-[var(--hb-smoke)]/50"
  placeholder="Your name"
/>
```

The key change from the current version: switch from `rounded-2xl` bordered boxes to **bottom-border-only underline inputs** — more editorial, less SaaS.

- [ ] **Step 3: Verify manually**

1. Navigate to `/layered-denim`
2. Confirm the form renders with underline-style inputs
3. Focus each input — confirm the border color transitions
4. Submit the form — confirm the success animation still plays
5. Check mobile — inputs should be full-width and touch-friendly

- [ ] **Step 4: Commit**

```bash
cd /c/hana-bi && git add src/components/layered-denim/EmailCaptureForm.tsx
git commit -m "feat: editorial underline inputs in EmailCaptureForm via 21st.dev"
```

---

## Final verification

- [ ] Run `npm run build` and confirm no TypeScript or build errors
- [ ] Run through all five changed surfaces in the browser
- [ ] Check mobile viewport (375px) for each change

```bash
cd /c/hana-bi && npm run build
```
