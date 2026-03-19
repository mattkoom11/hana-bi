# Visual Frontend Overhaul Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform Hana-Bi from an all-light paper aesthetic to a dark cinematic site with selective hand-drawn elements on editorial pages and sienna as the universal accent color.

**Architecture:** Foundation-first — global CSS tokens and the root layout are updated first so all subsequent component and page changes build on a consistent dark foundation. Commerce surfaces (shop, product, cart) go dark; editorial surfaces (projects, about, archive) stay light. A `useHeaderTheme` hook drives the transparent adaptive header.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Tailwind CSS 4, custom CSS variables

---

## File Map

**Create:**
- `src/hooks/useHeaderTheme.ts` — route-based dark/light theme detection

**Modify:**
- `src/app/layout.tsx` — remove paper bg from root wrapper
- `src/app/globals.css` — add dark tokens, clean body baseline styles
- `src/components/layout/SiteHeader.tsx` — adaptive transparent header
- `src/components/layout/SiteFooter.tsx` — dark treatment
- `src/components/cart/CartDrawer.tsx` — always-dark overlay
- `src/components/layout/PageShell.tsx` — add `variant` prop
- `src/components/shop/ProductCard.tsx` — add `variant` prop
- `src/components/shop/ProductGrid.tsx` — pass `variant` through
- `src/components/shop/ShopContent.tsx` — pass `variant` through
- `src/components/shop/ProductFilters.tsx` — dark-themed styling
- `src/app/page.tsx` — homepage hero + sections
- `src/app/shop/page.tsx` — dark PageShell, dark ProductGrid
- `src/app/product/[slug]/page.tsx` — dark top, light bottom
- `src/app/cart/page.tsx` — dark PageShell, dark item rows
- `src/app/success/page.tsx` — all 4 surfaces dark

---

## Chunk 1: Foundation

### Task 1: Root Layout & Global CSS

**Files:**
- Modify: `src/app/layout.tsx:46`
- Modify: `src/app/globals.css:6-37` (add dark tokens to `:root`)
- Modify: `src/app/globals.css:125-142` (clean body baseline)

**Context:** The root layout div applies `bg-[var(--hb-paper)] text-[var(--hb-ink)]` globally (line 46). The `body` rule in globals.css also sets `background-color: var(--hb-paper)` and a multi-layer paper grain texture — these bleed through dark pages. Both must be removed. Dark color tokens must be added to `:root` before any component changes.

- [ ] **Step 1: Remove the paper bg classes from the root layout wrapper**

In `src/app/layout.tsx`, change line 46 from:
```tsx
<div className="flex min-h-screen flex-col bg-[var(--hb-paper)] text-[var(--hb-ink)]">
```
to:
```tsx
<div className="flex min-h-screen flex-col">
```

- [ ] **Step 2: Add dark track tokens to `:root` in globals.css**

In `src/app/globals.css`, add these 5 lines inside the `:root` block after `--hb-accent: #7a6a5a;` (line 19):

```css
  --hb-dark:         #0e0c0b;
  --hb-dark-surface: #171310;
  --hb-dark-border:  rgba(250, 248, 244, 0.08);
  --hb-dark-muted:   rgba(250, 248, 244, 0.45);
  --hb-dark-kanji:   rgba(250, 248, 244, 0.07);
```

- [ ] **Step 3: Clean the body baseline styles in globals.css**

In `src/app/globals.css`, replace the entire `body { ... }` block (lines 125–142) with:

```css
body {
  font-family: var(--font-hanabi-sans), "Helvetica Neue", Arial, sans-serif;
  letter-spacing: 0.01em;
}
```

The paper grain texture is intentionally removed from the global body — it will continue to render via the `PaperBackground` component on light sections.

- [ ] **Step 4: Verify the build passes**

```bash
cd c:/hana-bi && npm run build
```

Expected: build completes, 25 static pages generated, 0 TypeScript errors. The site will briefly look unstyled on the paper sections (no body bg) until `PaperBackground` is confirmed to cover light sections — that is expected at this stage.

- [ ] **Step 5: Commit**

```bash
cd c:/hana-bi && git add src/app/layout.tsx src/app/globals.css && git commit -m "feat: add dark CSS tokens, remove global paper body background"
```

---

### Task 2: useHeaderTheme Hook

**Files:**
- Create: `src/hooks/useHeaderTheme.ts`

**Context:** `SiteHeader` is a `"use client"` component that needs to know whether the current page is "dark" or "light" to apply correct text colors. This hook reads `usePathname()` and returns the theme. Light pages are: `/about`, `/projects`, `/projects/*`, `/archive`. Everything else is dark.

- [ ] **Step 1: Create the hooks directory and file**

Create `src/hooks/useHeaderTheme.ts` with this exact content:

```ts
"use client";

import { usePathname } from "next/navigation";

export type HeaderTheme = "dark" | "light";

export function useHeaderTheme(): HeaderTheme {
  const pathname = usePathname();
  const lightPaths = ["/about", "/projects", "/archive"];
  const isLight = lightPaths.some(
    (p) => pathname === p || pathname.startsWith(p + "/")
  );
  return isLight ? "light" : "dark";
}
```

- [ ] **Step 2: Verify the build passes**

```bash
cd c:/hana-bi && npm run build
```

Expected: build passes. The hook is unused at this point — no errors expected.

- [ ] **Step 3: Commit**

```bash
cd c:/hana-bi && git add src/hooks/useHeaderTheme.ts && git commit -m "feat: add useHeaderTheme hook for adaptive header"
```

---

### Task 3: SiteHeader — Adaptive Transparent

**Files:**
- Modify: `src/components/layout/SiteHeader.tsx`

**Context:** The current header has a hardcoded light style (ink text, smoke nav, paper cart button). It needs to become transparent with text colors that adapt via `useHeaderTheme`. On dark pages: cream text, sienna active state, dark-surface cart button. On light pages: the existing ink/smoke colors with sienna active state.

`InkUnderline` uses `currentColor` for its stroke — wrapping it in a sienna-colored span will make the active indicator sienna on both themes.

- [ ] **Step 1: Rewrite SiteHeader**

Replace the entire contents of `src/components/layout/SiteHeader.tsx` with:

```tsx
"use client";

import { CartDrawer } from "@/components/cart/CartDrawer";
import { InkUnderline } from "@/components/common/InkUnderline";
import { useHeaderTheme } from "@/hooks/useHeaderTheme";
import { useCartCount } from "@/store/cart";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/shop", label: "Shop" },
  { href: "/projects", label: "Projects" },
  { href: "/archive", label: "Archive" },
  { href: "/about", label: "About" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const cartCount = useCartCount();
  const [open, setOpen] = useState(false);
  const theme = useHeaderTheme();
  const isDark = theme === "dark";

  return (
    <>
      <header className="px-4 sm:px-8 md:px-12 lg:px-20 py-10 flex flex-col gap-8 relative">
        {/* Bottom border — light pages only, nothing on dark */}
        {!isDark && (
          <div className="absolute bottom-0 left-0 right-0 flex justify-center">
            <div className="w-full max-w-6xl mx-auto">
              <div className="h-px bg-gradient-to-r from-transparent via-[var(--hb-border)] to-transparent opacity-30" />
            </div>
          </div>
        )}

        <div className="flex items-center justify-between">
          <Link
            href="/"
            className={`font-serif text-3xl tracking-[0.08em] hover-wispy relative group transition-colors ${
              isDark ? "text-[#faf8f4]" : "text-[var(--hb-ink)]"
            }`}
          >
            Hana-Bi
            <span className="absolute -bottom-1 left-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
              <InkUnderline width={120} variant="delicate" strokeOpacity={0.3} />
            </span>
          </Link>

          <button
            onClick={() => setOpen(true)}
            className={`relative text-xs uppercase tracking-[0.4em] border px-6 py-3 hover-wispy opacity-70 hover:opacity-100 transition-all duration-300 ${
              isDark
                ? "bg-[var(--hb-dark-surface)] text-[#faf8f4] border-[var(--hb-dark-border)] hover:border-[var(--hb-sienna)]"
                : "border-dashed border-[var(--hb-border)] text-[var(--hb-ink)] btn-sketch"
            }`}
          >
            Cart
            {cartCount > 0 && (
              <span
                className={`absolute -top-2 -right-2 w-5 h-5 text-[0.65rem] rounded-full flex items-center justify-center font-script ${
                  isDark
                    ? "bg-[var(--hb-sienna)] text-[#faf8f4]"
                    : "bg-[var(--hb-ink)] text-[var(--hb-paper)]"
                }`}
              >
                {cartCount}
              </span>
            )}
          </button>
        </div>

        <nav
          className={`flex flex-wrap gap-8 text-xs uppercase tracking-[0.4em] ${
            isDark
              ? "text-[var(--hb-dark-muted)]"
              : "text-[var(--hb-smoke)]"
          }`}
        >
          {NAV_LINKS.map((link) => {
            const isActive =
              link.href === "/"
                ? pathname === "/"
                : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`pb-2 relative hover-wispy transition-all duration-300 ${
                  isActive
                    ? isDark
                      ? "text-[#faf8f4]"
                      : "text-[var(--hb-ink)]"
                    : isDark
                    ? "hover:text-[#faf8f4]"
                    : "hover:text-[var(--hb-ink-light)]"
                }`}
              >
                {link.label}
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 flex justify-center text-[var(--hb-sienna)]">
                    <InkUnderline width={60} variant="wispy" strokeOpacity={0.6} />
                  </span>
                )}
              </Link>
            );
          })}
          <Link
            href="/cart"
            className={`ml-auto border-b border-dashed pb-2 hover-wispy transition-all duration-300 ${
              isDark
                ? "text-[var(--hb-dark-muted)] border-[var(--hb-dark-border)] hover:text-[#faf8f4]"
                : "text-[var(--hb-ink-light)] border-[var(--hb-border)] border-opacity-40 hover:border-opacity-70"
            }`}
          >
            Full Cart →
          </Link>
        </nav>
      </header>
      <CartDrawer open={open} onClose={() => setOpen(false)} />
    </>
  );
}
```

- [ ] **Step 2: Verify the build passes**

```bash
cd c:/hana-bi && npm run build
```

Expected: build passes. Open `http://localhost:3000` with `npm run dev` and check:
- On `/` (dark page): header text is cream, cart button has dark surface
- On `/about` (light page): header text is ink/smoke, cart button has dashed border
- Active nav link shows sienna underline on both themes

- [ ] **Step 3: Commit**

```bash
cd c:/hana-bi && git add src/components/layout/SiteHeader.tsx && git commit -m "feat: adaptive transparent SiteHeader using useHeaderTheme"
```

---

### Task 4: SiteFooter — Dark Treatment

**Files:**
- Modify: `src/components/layout/SiteFooter.tsx`

**Context:** The footer currently has no background (it defaults to whatever the parent bg is). It needs a dark background, cream text, and sienna hover accents on links.

- [ ] **Step 1: Rewrite SiteFooter**

Replace the entire contents of `src/components/layout/SiteFooter.tsx` with:

```tsx
import Link from "next/link";

const FOOTER_LINKS = [
  { label: "Careers", href: "#" },
  { label: "Stockists", href: "#" },
  { label: "Press", href: "#" },
  { label: "Contact", href: "#" },
];

export function SiteFooter() {
  return (
    <footer className="bg-[var(--hb-dark)] px-4 sm:px-8 md:px-12 lg:px-20 py-12 relative mt-20">
      {/* Top border */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[var(--hb-dark-border)] to-transparent" />

      <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
        <div className="space-y-3">
          <p className="uppercase text-xs tracking-[0.35em] text-[var(--hb-sienna)] font-script opacity-70">
            Hana-Bi
          </p>
          <h3 className="font-serif text-3xl tracking-tight text-[#faf8f4]">
            Study the Archive.
          </h3>
          <p className="text-sm text-[var(--hb-dark-muted)] leading-relaxed">
            Sustainable denim and garments captured like museum pieces.
          </p>
        </div>
        <div className="flex flex-wrap gap-6 text-xs uppercase tracking-[0.3em] text-[var(--hb-dark-muted)]">
          {FOOTER_LINKS.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="pb-1 border-b border-transparent hover:border-[var(--hb-sienna)] hover:text-[#faf8f4] hover-wispy opacity-70 hover:opacity-100 transition-all duration-300"
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
      <div className="mt-10 text-[0.65rem] uppercase tracking-[0.4em] text-[var(--hb-dark-muted)] font-script opacity-50">
        © {new Date().getFullYear()} Hana-Bi Atelier — Crafted in limited runs.
      </div>
    </footer>
  );
}
```

- [ ] **Step 2: Verify the build passes**

```bash
cd c:/hana-bi && npm run build
```

Expected: build passes. `npm run dev` — footer should be dark with cream "Study the Archive." heading, sienna hover on links.

- [ ] **Step 3: Commit**

```bash
cd c:/hana-bi && git add src/components/layout/SiteFooter.tsx && git commit -m "feat: SiteFooter dark treatment with sienna accents"
```

---

## Chunk 2: Core Components

### Task 5: CartDrawer — Always Dark

**Files:**
- Modify: `src/components/cart/CartDrawer.tsx`

**Context:** CartDrawer can be opened from any page (including dark ones like shop). It must always render with dark styling. The backdrop opacity increases from 30% to 70%, `backdrop-blur` is removed (it would compound heavily with the dark overlay). All paper/border/smoke colors switch to dark-track equivalents.

- [ ] **Step 1: Rewrite CartDrawer visual styles**

Replace the entire contents of `src/components/cart/CartDrawer.tsx` with:

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

interface CartDrawerProps {
  open: boolean;
  onClose: () => void;
}

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
          price: Math.round(item.price * 100),
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

export function CartDrawer({ open, onClose }: CartDrawerProps) {
  const items = useCartStore((state) => state.items);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeItem = useCartStore((state) => state.removeItem);
  const clearCart = useCartStore((state) => state.clearCart);
  const itemCount = useCartCount();
  const total = useCartTotal();
  const setCheckingOut = useCartStore((state) => state.setCheckingOut);
  const [isLoading, setIsLoading] = useState(false);

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex">
      <div
        className="flex-1"
        style={{ background: "rgba(14,12,11,0.7)" }}
        onClick={onClose}
      />
      <section className="w-full max-w-md bg-[var(--hb-dark-surface)] border-l border-[var(--hb-dark-border)]">
        <header className="px-6 py-5 flex items-center justify-between border-b border-[var(--hb-dark-border)]">
          <div>
            <p className="uppercase text-xs tracking-[0.35em] text-[var(--hb-sienna)]">
              Cart
            </p>
            <h2 className="font-serif text-2xl mt-1 text-[#faf8f4]">
              {itemCount === 0 ? "Empty" : `${itemCount} item${itemCount > 1 ? "s" : ""}`}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-xs uppercase tracking-[0.3em] text-[var(--hb-dark-muted)] hover:text-[#faf8f4] transition-colors"
          >
            Close
          </button>
        </header>
        <div className="max-h-[65vh] overflow-y-auto divide-y divide-[var(--hb-dark-border)]">
          {items.length === 0 ? (
            <p className="px-6 py-12 text-sm text-[var(--hb-dark-muted)] leading-relaxed">
              The drawer is quiet. Add a garment to begin your Hana-Bi study.
            </p>
          ) : (
            items.map((item) => (
              <article key={`${item.id}-${item.size}`} className="px-6 py-5 bg-[var(--hb-dark)]">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-serif text-lg text-[#faf8f4]">{item.name}</p>
                    <p className="text-xs uppercase tracking-[0.25em] text-[var(--hb-dark-muted)] mt-1">
                      Size {item.size}
                    </p>
                  </div>
                  <button
                    onClick={() => removeItem(item.id, item.size)}
                    className="text-xs uppercase tracking-[0.2em] text-[var(--hb-dark-muted)] hover:text-[#faf8f4] transition-colors"
                  >
                    Remove
                  </button>
                </div>
                <div className="flex items-center justify-between mt-4">
                  <span className="text-sm text-[var(--hb-sienna)]">{formatCurrency(item.price)}</span>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() =>
                        updateQuantity(item.id, item.size, Math.max(1, item.quantity - 1))
                      }
                      className="w-6 h-6 border border-[var(--hb-dark-border)] flex items-center justify-center text-[#faf8f4] hover:border-[var(--hb-sienna)] transition-colors"
                      aria-label="Decrease quantity"
                    >
                      –
                    </button>
                    <span className="text-sm w-6 text-center text-[#faf8f4]">{item.quantity}</span>
                    <button
                      onClick={() =>
                        updateQuantity(item.id, item.size, item.quantity + 1)
                      }
                      className="w-6 h-6 border border-[var(--hb-dark-border)] flex items-center justify-center text-[#faf8f4] hover:border-[var(--hb-sienna)] transition-colors"
                      aria-label="Increase quantity"
                    >
                      +
                    </button>
                  </div>
                </div>
              </article>
            ))
          )}
        </div>
        <footer className="px-6 py-5 border-t border-[var(--hb-dark-border)] space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-[var(--hb-dark-muted)]">Total</span>
            <span className="font-semibold text-[#faf8f4]">{formatCurrency(total)}</span>
          </div>
          <button
            onClick={async () => {
              setIsLoading(true);
              setCheckingOut(true);
              await handleCheckout(items, onClose);
              setIsLoading(false);
              setCheckingOut(false);
            }}
            disabled={items.length === 0 || isLoading}
            className="w-full py-3 bg-[var(--hb-sienna)] text-[#faf8f4] uppercase tracking-[0.3em] text-xs hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isLoading ? "Redirecting..." : "Checkout"}
          </button>
          {items.length > 0 && (
            <button
              onClick={clearCart}
              className="w-full text-xs uppercase tracking-[0.3em] text-[var(--hb-dark-muted)] hover:text-[#faf8f4] transition-colors"
            >
              Clear cart
            </button>
          )}
        </footer>
      </section>
    </div>
  );
}
```

- [ ] **Step 2: Verify build**

```bash
cd c:/hana-bi && npm run build
```

Expected: build passes. Open cart drawer on any page — should be dark with dark-surface background, sienna checkout button, cream text.

- [ ] **Step 3: Commit**

```bash
cd c:/hana-bi && git add src/components/cart/CartDrawer.tsx && git commit -m "feat: CartDrawer always-dark treatment"
```

---

### Task 6: PageShell — variant Prop

**Files:**
- Modify: `src/components/layout/PageShell.tsx`

**Context:** `PageShell` is used by the shop page, cart page, and related-projects section on the product detail page. It currently hardcodes paper background, `PaperBackground`, and `HandDrawnDivider`. Adding `variant="dark"` replaces these with dark tokens. The default remains `"light"` — no other callers break.

- [ ] **Step 1: Rewrite PageShell**

Replace the entire contents of `src/components/layout/PageShell.tsx` with:

```tsx
import { HandDrawnDivider } from "@/components/common/HandDrawnDivider";
import { InkUnderline } from "@/components/common/InkUnderline";
import { PaperBackground } from "@/components/common/PaperBackground";
import { cn } from "@/lib/utils";
import { PropsWithChildren, ReactNode } from "react";

interface PageShellProps extends PropsWithChildren {
  title: string;
  eyebrow?: string;
  intro?: ReactNode;
  className?: string;
  variant?: "light" | "dark";
}

export function PageShell({
  title,
  eyebrow,
  intro,
  className,
  children,
  variant = "light",
}: PageShellProps) {
  const isDark = variant === "dark";

  return (
    <section
      className={cn(
        "px-4 sm:px-8 md:px-12 lg:px-20 py-24 space-airy relative",
        isDark ? "bg-[var(--hb-dark)]" : "",
        className
      )}
    >
      {!isDark && (
        <PaperBackground intensity="subtle" texture="grain" className="absolute inset-0" />
      )}

      <header className="max-w-4xl mb-20 relative z-10">
        {eyebrow && (
          <span
            className={`uppercase text-xs tracking-[0.4em] font-script opacity-70 ${
              isDark ? "text-[var(--hb-sienna)]" : "text-[var(--hb-smoke)]"
            }`}
          >
            {eyebrow}
          </span>
        )}
        <div className="mt-8 space-y-4">
          <h1
            className={`font-serif text-5xl sm:text-6xl lg:text-7xl tracking-tight leading-[1.05] ${
              isDark ? "text-[#faf8f4]" : ""
            }`}
          >
            {title}
          </h1>
          {!isDark && (
            <InkUnderline className="mt-4" width={180} variant="wispy" strokeOpacity={0.4} />
          )}
        </div>
        {intro && (
          <div
            className={`mt-10 text-lg leading-relaxed max-w-2xl ${
              isDark ? "text-[var(--hb-dark-muted)]" : "text-[var(--hb-smoke)] opacity-85"
            }`}
          >
            {intro}
          </div>
        )}
      </header>

      {!isDark && (
        <div className="absolute top-0 left-0 right-0 flex justify-center z-10">
          <HandDrawnDivider variant="delicate" strokeOpacity={0.25} />
        </div>
      )}

      <div className="space-wispy relative z-10 mt-8">{children}</div>
    </section>
  );
}
```

- [ ] **Step 2: Verify build**

```bash
cd c:/hana-bi && npm run build
```

Expected: build passes. All existing callers of `PageShell` without a variant prop continue to work as before (light variant is the default).

- [ ] **Step 3: Commit**

```bash
cd c:/hana-bi && git add src/components/layout/PageShell.tsx && git commit -m "feat: PageShell dark variant prop"
```

---

### Task 7: ProductCard — variant Prop

**Files:**
- Modify: `src/components/shop/ProductCard.tsx`
- Modify: `src/components/shop/ProductGrid.tsx`
- Modify: `src/components/shop/ShopContent.tsx`

**Context:** `ProductCard` needs a `variant` prop so it can render dark (shop, homepage grid) or light (related products on product detail). `ProductGrid` and `ShopContent` need to accept and pass through the prop. Default is `"dark"` per the spec — the shop and homepage are the primary callers.

- [ ] **Step 1: Add variant prop to ProductCard**

Replace the entire contents of `src/components/shop/ProductCard.tsx` with:

```tsx
import { Badge } from "@/components/common/Badge";
import { MarginNote } from "@/components/common/MarginNote";
import { Tag } from "@/components/common/Tag";
import { Product } from "@/data/products";
import { formatCurrency } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";

interface ProductCardProps {
  product: Product;
  variant?: "dark" | "light";
}

function getAnnotation(product: Product): string {
  if (product.tags.some((t) => t.toLowerCase().includes("denim"))) {
    return "raw denim";
  }
  if (product.tags.some((t) => t.toLowerCase().includes("selvedge"))) {
    return "selvedge";
  }
  if (product.collection.toLowerCase().includes("sample")) {
    return "sample 001";
  }
  return "edition piece";
}

export function ProductCard({ product, variant = "dark" }: ProductCardProps) {
  const annotation = getAnnotation(product);
  const isDark = variant === "dark";

  return (
    <Link
      href={`/product/${product.slug}`}
      className="group flex flex-col gap-5 p-5 hover-wispy relative"
    >
      {/* Hand-drawn frame on hover — light variant only */}
      {!isDark && (
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none">
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 500" preserveAspectRatio="none">
            <defs>
              <linearGradient id="card-frame-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="var(--hb-ink)" stopOpacity="0.3" />
                <stop offset="50%" stopColor="var(--hb-ink)" stopOpacity="0.15" />
                <stop offset="100%" stopColor="var(--hb-ink)" stopOpacity="0.25" />
              </linearGradient>
            </defs>
            <path
              d="M 8,8 Q 12,6 16,8 Q 200,4 384,8 Q 388,6 392,8 Q 392,12 392,16 Q 396,250 392,484 Q 392,488 392,492 Q 388,494 384,492 Q 200,496 16,492 Q 12,494 8,492 Q 8,488 8,484 Q 4,250 8,16 Q 8,12 8,8 Z"
              fill="none"
              stroke="url(#card-frame-gradient)"
              strokeWidth="1.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              vectorEffect="non-scaling-stroke"
            />
          </svg>
        </div>
      )}

      {/* Dark variant: sienna bottom border on hover */}
      {isDark && (
        <div className="absolute bottom-0 left-5 right-5 h-px bg-[var(--hb-sienna)] opacity-0 group-hover:opacity-60 transition-opacity duration-500 pointer-events-none" />
      )}

      <div
        className={`relative w-full aspect-[4/5] overflow-hidden ${
          isDark ? "bg-[var(--hb-dark-surface)]" : "bg-[var(--hb-paper-muted)]"
        }`}
      >
        <Image
          src={product.heroImage}
          alt={product.name}
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          className="object-cover transition duration-700 group-hover:scale-[1.02]"
        />
        {product.featured && (
          <div className="absolute top-5 left-5 z-10">
            <Badge tone="sienna">Featured</Badge>
          </div>
        )}
        {product.status !== "available" && (
          <div className="absolute top-5 right-5 z-10">
            <Badge tone="smoke">
              {product.status === "sold_out" ? "Sold Out" : "Archived"}
            </Badge>
          </div>
        )}

        {/* Hover-revealed pencil annotation — light variant only */}
        {!isDark && (
          <div className="absolute bottom-4 left-4 opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10">
            <MarginNote
              position="bottom-left"
              variant="script"
              size="xs"
              className="!opacity-80 !relative !top-0 !left-0 !transform-none"
            >
              {annotation}
            </MarginNote>
          </div>
        )}
      </div>

      <div className="space-y-3 relative z-10">
        <p
          className={`font-serif text-xl leading-tight ${
            isDark ? "text-[#faf8f4]" : ""
          }`}
        >
          {product.name}
        </p>
        <p
          className={`text-sm font-script opacity-70 ${
            isDark ? "text-[var(--hb-sienna)]" : "text-[var(--hb-smoke)]"
          }`}
        >
          {product.collection}
        </p>
        <div className="flex items-center justify-between text-sm pt-2">
          <span
            className={`font-serif ${isDark ? "text-[#faf8f4]" : ""}`}
          >
            {formatCurrency(product.price)}
          </span>
          <span
            className={`text-xs uppercase tracking-[0.2em] border px-2 py-1 ${
              isDark
                ? "border-[var(--hb-dark-border)] text-[var(--hb-dark-muted)]"
                : ""
            }`}
          >
            {product.tags[0]}
          </span>
        </div>
      </div>
    </Link>
  );
}
```

- [ ] **Step 2: Add variant prop passthrough to ProductGrid**

Replace the entire contents of `src/components/shop/ProductGrid.tsx` with:

```tsx
import { Product } from "@/data/products";
import { ProductCard } from "./ProductCard";

interface ProductGridProps {
  products: Product[];
  variant?: "dark" | "light";
}

export function ProductGrid({ products, variant = "dark" }: ProductGridProps) {
  if (!products.length) {
    return (
      <p
        className={`text-sm ${
          variant === "dark" ? "text-[var(--hb-dark-muted)]" : "text-[var(--hb-smoke)]"
        }`}
      >
        No garments match these filters yet.
      </p>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} variant={variant} />
      ))}
    </div>
  );
}
```

- [ ] **Step 3: Add variant prop passthrough to ShopContent**

Replace the entire contents of `src/components/shop/ShopContent.tsx` with:

```tsx
"use client";

import { Product } from "@/data/products";
import { useMemo, useState } from "react";
import { ProductFilters } from "./ProductFilters";
import { ProductGrid } from "./ProductGrid";

interface ShopContentProps {
  products: Product[];
  variant?: "dark" | "light";
}

export function ShopContent({ products, variant = "dark" }: ShopContentProps) {
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [availability, setAvailability] = useState<"available" | "archived">(
    "available"
  );

  const tags = useMemo(() => {
    const unique = new Set<string>();
    products.forEach((product) =>
      product.tags.forEach((tag) => unique.add(tag))
    );
    return Array.from(unique);
  }, [products]);

  const sizes = useMemo(() => {
    const unique = new Set<string>();
    products.forEach((product) => product.sizes.forEach((size) => unique.add(size)));
    return Array.from(unique);
  }, [products]);

  const filteredProducts = products.filter((product) => {
    if (availability === "available" && product.status !== "available") return false;
    if (availability === "archived" && product.status === "available") return false;
    if (selectedTag && !product.tags.includes(selectedTag)) return false;
    if (selectedSize && !product.sizes.includes(selectedSize)) return false;
    return true;
  });

  return (
    <div className="space-y-8">
      <ProductFilters
        tags={tags}
        sizes={sizes}
        selectedTag={selectedTag}
        selectedSize={selectedSize}
        availability={availability}
        onTagChange={setSelectedTag}
        onSizeChange={setSelectedSize}
        onAvailabilityChange={setAvailability}
        variant={variant}
      />
      <ProductGrid products={filteredProducts} variant={variant} />
    </div>
  );
}
```

- [ ] **Step 4: Add variant prop to ProductFilters**

Replace the entire contents of `src/components/shop/ProductFilters.tsx` with:

```tsx
"use client";

interface ProductFiltersProps {
  tags: string[];
  sizes: string[];
  selectedTag: string | null;
  selectedSize: string | null;
  availability: "available" | "archived";
  onTagChange: (tag: string | null) => void;
  onSizeChange: (size: string | null) => void;
  onAvailabilityChange: (availability: "available" | "archived") => void;
  variant?: "dark" | "light";
}

export function ProductFilters({
  tags,
  sizes,
  selectedTag,
  selectedSize,
  availability,
  onTagChange,
  onSizeChange,
  onAvailabilityChange,
  variant = "dark",
}: ProductFiltersProps) {
  const isDark = variant === "dark";

  return (
    <div
      className={`flex flex-col gap-4 border p-4 md:flex-row md:items-center md:justify-between ${
        isDark
          ? "border-[var(--hb-dark-border)] bg-[var(--hb-dark-surface)]"
          : "border-[var(--hb-border)]"
      }`}
    >
      <div className="flex flex-wrap gap-2 items-center text-xs uppercase tracking-[0.3em]">
        <button
          onClick={() => onAvailabilityChange("available")}
          className={`px-3 py-1 border transition-colors ${
            availability === "available"
              ? isDark
                ? "border-[var(--hb-sienna)] text-[var(--hb-sienna)]"
                : "border-[var(--hb-ink)] text-[var(--hb-ink)]"
              : isDark
              ? "border-transparent text-[var(--hb-dark-muted)]"
              : "border-transparent text-[var(--hb-smoke)]"
          }`}
        >
          Available
        </button>
        <button
          onClick={() => onAvailabilityChange("archived")}
          className={`px-3 py-1 border transition-colors ${
            availability === "archived"
              ? isDark
                ? "border-[var(--hb-sienna)] text-[var(--hb-sienna)]"
                : "border-[var(--hb-ink)] text-[var(--hb-ink)]"
              : isDark
              ? "border-transparent text-[var(--hb-dark-muted)]"
              : "border-transparent text-[var(--hb-smoke)]"
          }`}
        >
          Archived
        </button>
      </div>
      <div className="flex flex-wrap gap-3 text-sm">
        <label className="flex items-center gap-2">
          <span
            className={`uppercase text-[0.6rem] tracking-[0.3em] ${
              isDark ? "text-[var(--hb-dark-muted)]" : "text-[var(--hb-smoke)]"
            }`}
          >
            Category
          </span>
          <select
            value={selectedTag ?? ""}
            onChange={(event) => onTagChange(event.target.value || null)}
            className={`bg-transparent border px-3 py-1 text-xs uppercase tracking-[0.3em] ${
              isDark
                ? "border-[var(--hb-dark-border)] text-[#faf8f4]"
                : "border-[var(--hb-border)]"
            }`}
          >
            <option value="">All</option>
            {tags.map((tag) => (
              <option key={tag} value={tag}>
                {tag}
              </option>
            ))}
          </select>
        </label>
        <label className="flex items-center gap-2">
          <span
            className={`uppercase text-[0.6rem] tracking-[0.3em] ${
              isDark ? "text-[var(--hb-dark-muted)]" : "text-[var(--hb-smoke)]"
            }`}
          >
            Size
          </span>
          <select
            value={selectedSize ?? ""}
            onChange={(event) => onSizeChange(event.target.value || null)}
            className={`bg-transparent border px-3 py-1 text-xs uppercase tracking-[0.3em] ${
              isDark
                ? "border-[var(--hb-dark-border)] text-[#faf8f4]"
                : "border-[var(--hb-border)]"
            }`}
          >
            <option value="">All</option>
            {sizes.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </label>
      </div>
    </div>
  );
}
```

- [ ] **Step 5: Verify build**

```bash
cd c:/hana-bi && npm run build
```

Expected: build passes. No calls to these components have changed yet — they still render light as before until the pages are updated in Chunk 3.

- [ ] **Step 6: Commit**

```bash
cd c:/hana-bi && git add src/components/shop/ProductCard.tsx src/components/shop/ProductGrid.tsx src/components/shop/ShopContent.tsx src/components/shop/ProductFilters.tsx && git commit -m "feat: ProductCard/Grid/ShopContent/ProductFilters dark variant prop"
```

---

## Chunk 3: Pages

### Task 8: Homepage

**Files:**
- Modify: `src/app/page.tsx`

**Context:** The homepage has a dark/light/dark/light rhythm: dark hero → light "What is Hana-Bi?" → dark product grid → light archive strip. The hero currently renders the product image at `opacity-20` — change to full opacity with a dark gradient overlay. The SVG ink-stroke lines overlay is removed. The hero `SketchFrame` is replaced with a plain dark-surface card. Ghost 花火 added at `bottom-8 right-8` in the hero. Product grid section uses `ProductCard variant="dark"`. Light sections are unchanged.

- [ ] **Step 1: Rewrite the homepage**

Replace the entire contents of `src/app/page.tsx` with:

```tsx
import { HandDrawnDivider } from "@/components/common/HandDrawnDivider";
import { InkUnderline } from "@/components/common/InkUnderline";
import { MarginNote } from "@/components/common/MarginNote";
import { PaperBackground } from "@/components/common/PaperBackground";
import { SketchFrame } from "@/components/common/SketchFrame";
import { ProductCard } from "@/components/shop/ProductCard";
import { getAllProducts, getCollectionProducts } from "@/lib/shopify";
import { mapShopifyProductToHanaBiProduct } from "@/lib/shopify-mappers";
import {
  archivedProducts as fallbackArchived,
  featuredProducts as fallbackFeatured,
  products as fallbackProducts,
} from "@/data/products";
import Image from "next/image";
import Link from "next/link";

export default async function Home() {
  let allProducts = fallbackProducts;
  let featured: typeof allProducts = [];
  let archiveSlices: typeof allProducts = [];

  try {
    try {
      const featuredCollection = await getCollectionProducts("featured");
      featured = featuredCollection
        .map(mapShopifyProductToHanaBiProduct)
        .slice(0, 3);
    } catch {
      const shopifyProducts = await getAllProducts();
      allProducts = shopifyProducts.map(mapShopifyProductToHanaBiProduct);
      featured = allProducts.filter((p) => p.featured).slice(0, 3);
    }

    archiveSlices = allProducts
      .filter(
        (p) =>
          p.status === "archived" ||
          p.status === "sold_out" ||
          p.tags.some((t) => t.toUpperCase().includes("ARCHIVE"))
      )
      .slice(0, 2);
  } catch (error) {
    console.warn(
      "Failed to fetch products from Shopify, using fallback data:",
      error
    );
    featured = fallbackFeatured.slice(0, 3);
    archiveSlices = fallbackArchived.slice(0, 2);
  }

  const heroFeature = featured[0] ?? allProducts[0] ?? fallbackProducts[0];

  return (
    <main className="page-transition">
      {/* ── Dark Hero ─────────────────────────────────────────── */}
      <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden bg-[var(--hb-dark)]">
        {/* Full-bleed product image at full opacity with dark gradient overlay */}
        {heroFeature && (
          <div className="absolute inset-0 w-full h-full">
            <Image
              src={heroFeature.heroImage}
              alt={heroFeature.name}
              fill
              className="object-cover"
              priority
              sizes="100vw"
            />
            {/* Dark gradient overlay */}
            <div
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(to top, rgba(14,12,11,0.85) 0%, rgba(14,12,11,0.3) 60%, transparent 100%)",
              }}
            />
          </div>
        )}

        {/* Ghost 花火 annotation */}
        <span
          aria-hidden="true"
          className="absolute bottom-8 right-8 pointer-events-none select-none font-serif"
          style={{ color: "var(--hb-dark-kanji)", fontSize: "12rem", lineHeight: 1 }}
        >
          花火
        </span>

        {/* Content */}
        <div className="relative z-10 px-4 sm:px-8 md:px-12 lg:px-20 py-24 w-full max-w-6xl mx-auto">
          <div className="grid gap-16 lg:grid-cols-[1.1fr_0.9fr] items-center">
            <div className="space-y-8">
              <p className="uppercase text-xs tracking-[0.5em] text-[var(--hb-sienna)] font-script opacity-70">
                Hana-Bi — Editions of Denim
              </p>
              <h1
                className="font-serif leading-[0.95] tracking-tight text-[#faf8f4]"
                style={{ fontSize: "clamp(3.5rem, 9vw, 7rem)" }}
              >
                Archival garments documented like museum pieces.
              </h1>
              <p className="text-lg leading-relaxed text-[var(--hb-dark-muted)] max-w-lg">
                Hana-Bi traces Japanese magazine spreads and gothic annotations to
                tell the story of sustainable denim. Limited drops move swiftly from
                studio floor to archive shelves.
              </p>
              <div className="flex gap-5 flex-wrap pt-4">
                <Link
                  href="/shop"
                  className="bg-[var(--hb-sienna)] text-[#faf8f4] uppercase tracking-[0.4em] px-8 py-4 text-xs hover-wispy opacity-90 hover:opacity-100 transition-opacity"
                >
                  Enter Shop
                </Link>
                <Link
                  href="/about"
                  className="border border-[rgba(250,248,244,0.25)] text-[rgba(250,248,244,0.7)] uppercase tracking-[0.4em] px-8 py-4 text-xs hover:text-[#faf8f4] hover:border-[rgba(250,248,244,0.5)] transition-all duration-300"
                >
                  What is Hana-Bi?
                </Link>
              </div>
            </div>

            {/* Featured garment card — dark surface, no SketchFrame */}
            {heroFeature && (
              <div className="bg-[var(--hb-dark-surface)] p-6 space-y-5 border border-[var(--hb-dark-border)]">
                <p className="uppercase text-xs tracking-[0.4em] text-[var(--hb-sienna)] font-script opacity-70">
                  Featured Garment
                </p>
                <h2 className="font-serif text-3xl leading-tight text-[#faf8f4]">
                  {heroFeature.name}
                </h2>
                <p className="text-sm leading-relaxed text-[var(--hb-dark-muted)]">
                  {heroFeature.story}
                </p>
                <Link
                  href={`/product/${heroFeature.slug}`}
                  className="text-xs uppercase tracking-[0.4em] border-b border-[var(--hb-sienna)] pb-1 inline-block text-[var(--hb-sienna)] hover:opacity-80 transition-opacity"
                >
                  View Piece
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── Light: What is Hana-Bi? ───────────────────────────── */}
      <section className="px-4 sm:px-8 md:px-12 lg:px-20 py-24 relative">
        <PaperBackground intensity="subtle" texture="grain">
          <div className="absolute top-0 left-0 right-0 flex justify-center">
            <HandDrawnDivider variant="wispy" strokeOpacity={0.3} />
          </div>
          <div className="grid gap-16 lg:grid-cols-2 mt-12 items-center">
            <div className="space-y-6">
              <p className="uppercase text-xs tracking-[0.5em] text-[var(--hb-smoke)] font-script opacity-70">
                What is Hana-Bi?
              </p>
              <h3 className="font-serif text-4xl lg:text-5xl leading-tight">
                Retail, but archival.
              </h3>
              <InkUnderline width={140} variant="delicate" strokeOpacity={0.35} className="mt-3" />
            </div>
            <p className="text-base leading-relaxed text-[var(--hb-smoke)] opacity-85 max-w-lg">
              We work like an editorial studio. Each garment is catalogued with
              handwritten notes, nodded to with doodled borders and inked
              underlines throughout the site. Copy, imagery, and drop cadence can
              be edited inside `/data/products.ts` and future CMS hooks.
            </p>
          </div>
        </PaperBackground>
      </section>

      {/* ── Dark: Current Drop ────────────────────────────────── */}
      <section className="px-4 sm:px-8 md:px-12 lg:px-20 py-24 space-y-16 bg-[var(--hb-dark)]">
        <div className="flex items-center justify-between">
          <div className="space-y-3">
            <p className="uppercase text-xs tracking-[0.4em] text-[var(--hb-sienna)] font-script opacity-70">
              Featured Pieces
            </p>
            <h3 className="font-serif text-4xl lg:text-5xl leading-tight text-[#faf8f4]">
              Current Drop
            </h3>
          </div>
          <Link
            href="/shop"
            className="text-xs uppercase tracking-[0.4em] border-b border-[var(--hb-dark-border)] pb-1.5 text-[var(--hb-dark-muted)] hover:text-[#faf8f4] hover:border-[var(--hb-sienna)] transition-all duration-300"
          >
            View All
          </Link>
        </div>
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-3">
          {featured.map((product) => (
            <ProductCard key={product.id} product={product} variant="dark" />
          ))}
        </div>
      </section>

      {/* ── Light: Archive Strip ──────────────────────────────── */}
      <section className="px-4 sm:px-8 md:px-12 lg:px-20 py-24 relative space-y-12">
        <PaperBackground intensity="subtle" texture="both">
          <div className="absolute top-0 left-0 right-0 flex justify-center">
            <HandDrawnDivider variant="delicate" strokeOpacity={0.25} />
          </div>
          <div className="flex items-center justify-between mt-12">
            <div className="space-y-3">
              <p className="uppercase text-xs tracking-[0.4em] text-[var(--hb-smoke)] font-script opacity-70">
                From The Archive
              </p>
              <h3 className="font-serif text-4xl lg:text-5xl leading-tight">
                Lookbook strips
              </h3>
              <InkUnderline width={140} variant="delicate" strokeOpacity={0.35} className="mt-2" />
            </div>
            <Link
              href="/archive"
              className="text-xs uppercase tracking-[0.4em] border-b border-dashed border-[var(--hb-border)] pb-1.5 hover-wispy opacity-70 hover:opacity-100"
            >
              Enter Archive
            </Link>
          </div>
          <div className="grid gap-8 md:grid-cols-2">
            {archiveSlices.map((piece) => (
              <SketchFrame
                key={piece.id}
                tilt={piece.id.includes("sea") ? "left" : "right"}
                strokeOpacity={0.3}
              >
                <div className="space-y-4">
                  <p className="uppercase text-[0.65rem] tracking-[0.4em] text-[var(--hb-smoke)] font-script opacity-70">
                    {piece.year}
                  </p>
                  <h4 className="font-serif text-2xl leading-tight">{piece.name}</h4>
                  <p className="text-sm text-[var(--hb-smoke)] opacity-80 leading-relaxed">
                    {piece.description}
                  </p>
                  <Link
                    href={`/product/${piece.slug}`}
                    className="text-xs uppercase tracking-[0.4em] border-b border-dashed border-[var(--hb-border)] pb-1 inline-block hover-wispy opacity-70 hover:opacity-100"
                  >
                    View Dossier
                  </Link>
                </div>
              </SketchFrame>
            ))}
          </div>
        </PaperBackground>
      </section>
    </main>
  );
}
```

- [ ] **Step 2: Verify build**

```bash
cd c:/hana-bi && npm run build
```

Expected: build passes. `npm run dev` at `http://localhost:3000`:
- Hero is dark with full-opacity product image
- Ghost 花火 barely visible in bottom-right corner
- "What is Hana-Bi?" section switches to warm paper
- Current Drop section goes dark with cream headings
- Archive strip returns to paper with hand-drawn elements

- [ ] **Step 3: Commit**

```bash
cd c:/hana-bi && git add src/app/page.tsx && git commit -m "feat: homepage dark hero + dark/light section rhythm"
```

---

### Task 9: Shop Page

**Files:**
- Modify: `src/app/shop/page.tsx`

**Context:** The shop page currently uses `PageShell` without a variant. Change to `variant="dark"`. `ShopContent` already accepts a `variant` prop from Task 7 — pass `variant="dark"` through.

- [ ] **Step 1: Update shop page to use dark variant**

Replace the entire contents of `src/app/shop/page.tsx` with:

```tsx
import { PageShell } from "@/components/layout/PageShell";
import { ShopContent } from "@/components/shop/ShopContent";
import { getAllProducts } from "@/lib/shopify";
import { mapShopifyProductToHanaBiProduct } from "@/lib/shopify-mappers";
import { products as fallbackProducts } from "@/data/products";

export default async function ShopPage() {
  let shopifyProducts = fallbackProducts;

  try {
    const shopifyData = await getAllProducts();
    shopifyProducts = shopifyData.map(mapShopifyProductToHanaBiProduct);
  } catch (error) {
    console.warn(
      "Failed to fetch products from Shopify, using fallback data:",
      error
    );
  }

  return (
    <main className="page-transition">
      <PageShell
        variant="dark"
        eyebrow="Shop"
        title="Limited garments, ready to study."
        intro={
          <>
            Non-archived pieces live here first. Adjust filters to find specific
            silhouettes or sizes.
          </>
        }
      >
        <ShopContent products={shopifyProducts} variant="dark" />
      </PageShell>
    </main>
  );
}
```

- [ ] **Step 2: Verify build**

```bash
cd c:/hana-bi && npm run build
```

Expected: build passes. `npm run dev` at `http://localhost:3000/shop` — dark background, cream title, sienna eyebrow, dark filter bar, dark product cards.

- [ ] **Step 3: Commit**

```bash
cd c:/hana-bi && git add src/app/shop/page.tsx && git commit -m "feat: shop page dark treatment"
```

---

### Task 10: Product Detail Page

**Files:**
- Modify: `src/app/product/[slug]/page.tsx`

**Context:** The top section (hero + details panel) goes dark. The SVG sketch borders on the hero image and thumbnails are removed. MarginNote annotations stay but in sienna. Ghost 花火 added at `top-6 right-6` in the hero area. The bottom Story/Materials/Notes section stays light with `HandDrawnDivider` at the seam. The related projects section at the bottom uses `ProductCard variant="light"`.

- [ ] **Step 1: Update the product detail page**

Replace the entire contents of `src/app/product/[slug]/page.tsx` with:

```tsx
import { Badge } from "@/components/common/Badge";
import { HandDrawnDivider } from "@/components/common/HandDrawnDivider";
import { InkUnderline } from "@/components/common/InkUnderline";
import { MarginNote } from "@/components/common/MarginNote";
import { PaperBackground } from "@/components/common/PaperBackground";
import { SketchFrame } from "@/components/common/SketchFrame";
import { Tag } from "@/components/common/Tag";
import { PageShell } from "@/components/layout/PageShell";
import { ProductCard } from "@/components/shop/ProductCard";
import {
  getProjectBySlug,
  projects,
  type Project,
  type ProjectStatus,
} from "@/data/projects";
import {
  getProductBySlug,
  products,
  type Product,
} from "@/data/products";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getProductByHandle } from "@/lib/shopify";
import { mapShopifyProductToHanaBiProduct } from "@/lib/shopify-mappers";

interface ProductPageProps {
  params: { slug: string };
}

export function generateStaticParams() {
  return products.map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const product = getProductBySlug(params.slug);
  if (!product) return { title: "Product not found — Hana-Bi" };
  return {
    title: `${product.name} — Hana-Bi`,
    description: product.description,
    openGraph: { images: [product.heroImage] },
  };
}

function getRelatedProducts(currentSlug: string, product: Product): Product[] {
  return products
    .filter(
      (p) =>
        p.slug !== currentSlug &&
        (p.collection === product.collection || p.tags.some((t) => product.tags.includes(t)))
    )
    .slice(0, 3);
}

export default async function ProductPage({ params }: ProductPageProps) {
  let product = getProductBySlug(params.slug);

  // Try to fetch live data from Shopify
  try {
    const shopifyProduct = await getProductByHandle(params.slug);
    if (shopifyProduct) {
      product = mapShopifyProductToHanaBiProduct(shopifyProduct);
    }
  } catch {
    // Use fallback product data
  }

  if (!product) {
    notFound();
  }

  const related = getRelatedProducts(product.slug, product);

  return (
    <main className="page-transition">
      {/* ── Dark Top Section ───────────────────────────────────── */}
      <section className="relative bg-[var(--hb-dark)] min-h-[70vh] flex items-center justify-center overflow-hidden mb-0">
        <div className="relative z-10 w-full px-4 sm:px-8 md:px-12 lg:px-20 py-16">
          <div className="max-w-7xl mx-auto">
            <div className="grid gap-12 lg:grid-cols-[1.3fr_0.7fr] items-start">
              {/* Hero image — full opacity, no SVG sketch border */}
              <div className="relative space-y-6">
                <div className="relative w-full aspect-[3/4] overflow-hidden">
                  {/* Ghost 花火 */}
                  <span
                    aria-hidden="true"
                    className="absolute top-6 right-6 z-20 pointer-events-none select-none font-serif"
                    style={{ color: "var(--hb-dark-kanji)", fontSize: "8rem", lineHeight: 1 }}
                  >
                    花火
                  </span>
                  <Image
                    src={product.heroImage}
                    alt={product.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 65vw"
                    priority
                  />
                  <div className="absolute top-6 left-6 z-10">
                    <Badge tone="sienna">
                      {product.status === "available"
                        ? "Available"
                        : product.status === "sold_out"
                        ? "Sold Out"
                        : "Archived"}
                    </Badge>
                  </div>
                  {product.year && (
                    <MarginNote position="top-right" variant="script" size="xs">
                      <span style={{ color: "var(--hb-sienna)" }}>{product.year}</span>
                    </MarginNote>
                  )}
                </div>

                {/* Thumbnail grid — full opacity, no SVG borders */}
                {product.images && product.images.length > 0 && (
                  <div className="grid grid-cols-3 gap-4">
                    {product.images.map((image, idx) => (
                      <div
                        key={image}
                        className="relative aspect-[4/5] overflow-hidden"
                        style={{
                          transform: `rotate(${idx % 2 === 0 ? "0.8deg" : "-0.8deg"})`,
                        }}
                      >
                        <Image
                          src={image}
                          alt={`${product.name} alternate view ${idx + 1}`}
                          fill
                          sizes="(max-width: 768px) 33vw, 200px"
                          className="object-cover"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Details panel — dark surface */}
              <div className="space-y-6 sticky top-24 bg-[var(--hb-dark-surface)] p-6 border border-[var(--hb-dark-border)]">
                <div className="space-y-4">
                  <p className="uppercase text-xs tracking-[0.4em] text-[var(--hb-sienna)] font-script opacity-70">
                    Product Details
                  </p>
                  <h1 className="font-serif text-4xl lg:text-5xl leading-tight text-[#faf8f4]">
                    {product.name}
                  </h1>
                </div>

                <div className="space-y-4 pt-4">
                  <div>
                    <p className="text-sm uppercase tracking-[0.3em] text-[var(--hb-dark-muted)] mb-2">
                      Collection
                    </p>
                    <p className="font-serif text-lg text-[#faf8f4]">{product.collection}</p>
                  </div>

                  <div>
                    <p className="text-sm uppercase tracking-[0.3em] text-[var(--hb-dark-muted)] mb-2">
                      Price
                    </p>
                    <p className="font-serif text-2xl text-[var(--hb-sienna)]">
                      ${product.price}
                    </p>
                  </div>

                  {product.year && (
                    <div>
                      <p className="text-sm uppercase tracking-[0.3em] text-[var(--hb-dark-muted)] mb-2">
                        Year
                      </p>
                      <p className="text-sm text-[var(--hb-dark-muted)]">{product.year}</p>
                    </div>
                  )}

                  <div>
                    <p className="text-sm uppercase tracking-[0.3em] text-[var(--hb-dark-muted)] mb-2">
                      Tags
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {product.tags.map((tag) => (
                        <span
                          key={tag}
                          className="text-xs uppercase tracking-[0.2em] text-[var(--hb-dark-muted)] border border-dashed border-[var(--hb-dark-border)] px-3 py-1.5"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Light Bottom: Story / Materials / Notes ─────────────── */}
      <section className="px-4 sm:px-8 md:px-12 lg:px-20 py-16 relative">
        <PaperBackground intensity="subtle" texture="grain">
          <div className="absolute top-0 left-0 right-0 flex justify-center">
            <HandDrawnDivider variant="wispy" strokeOpacity={0.3} />
          </div>
          <div className="max-w-4xl mx-auto mt-16 space-y-12">
            <SketchFrame tilt="none" strokeOpacity={0.25} className="w-full">
              <div className="space-y-4">
                <p className="uppercase text-xs tracking-[0.4em] text-[var(--hb-smoke)] font-script opacity-70">
                  Story
                </p>
                <InkUnderline width={80} variant="delicate" strokeOpacity={0.3} className="mb-4" />
                <p className="text-base leading-relaxed text-[var(--hb-smoke)] opacity-85">
                  {product.description}
                </p>
              </div>
            </SketchFrame>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <SketchFrame tilt="right" strokeOpacity={0.2} className="w-full">
                <div className="space-y-3">
                  <p className="uppercase text-xs tracking-[0.3em] text-[var(--hb-smoke)] font-script opacity-70">
                    Collection
                  </p>
                  <p className="text-sm leading-relaxed text-[var(--hb-smoke)] opacity-80">
                    {product.collection}
                  </p>
                </div>
              </SketchFrame>

              {product.sizes && product.sizes.length > 0 && (
                <SketchFrame tilt="left" strokeOpacity={0.2} className="w-full">
                  <div className="space-y-3">
                    <p className="uppercase text-xs tracking-[0.3em] text-[var(--hb-smoke)] font-script opacity-70">
                      Sizes
                    </p>
                    <p className="text-sm leading-relaxed text-[var(--hb-smoke)] opacity-80">
                      {product.sizes.join(", ")}
                    </p>
                  </div>
                </SketchFrame>
              )}

              <SketchFrame tilt="right" strokeOpacity={0.2} className="w-full">
                <div className="space-y-3">
                  <p className="uppercase text-xs tracking-[0.3em] text-[var(--hb-smoke)] font-script opacity-70">
                    Status
                  </p>
                  <p className="text-sm leading-relaxed text-[var(--hb-smoke)] opacity-80 capitalize">
                    {product.status.replace("_", " ")}
                  </p>
                </div>
              </SketchFrame>
            </div>

            <div className="flex flex-wrap gap-3 pt-4">
              {product.tags.map((tag) => (
                <Tag key={tag}>{tag}</Tag>
              ))}
            </div>
          </div>
        </PaperBackground>
      </section>

      {/* ── Related Products (light) ─────────────────────────── */}
      {related.length > 0 && (
        <PageShell
          eyebrow="Related Products"
          title="You might also like"
          intro="Other products from the same collection or with similar tags."
          className="pt-0"
        >
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} variant="light" />
            ))}
          </div>
        </PageShell>
      )}
    </main>
  );
}
```

**Note:** The original `product/[slug]/page.tsx` uses `@/data/projects` for `getProjectBySlug` (which is likely a copy-paste from the project page). The product detail page should use `@/data/products` and the `Product` type. The rewrite above uses the correct imports. Verify that `getProductBySlug` and `getProductByHandle` exist in the project — if `getProductByHandle` doesn't exist in `@/lib/shopify`, replace the Shopify fetch block with the existing pattern from the original file.

- [ ] **Step 2: Check and fix import paths**

Run the build and fix any import errors:

```bash
cd c:/hana-bi && npm run build 2>&1 | grep -A 3 "error"
```

If `getProductBySlug` or `getProductByHandle` do not exist, check the original `src/app/product/[slug]/page.tsx` and replicate the exact import pattern. The key visual changes (dark bg, no SVG borders, ghost kanji, dark details panel, light story section) are what matter — the data fetching logic should match the original exactly.

- [ ] **Step 3: Verify build passes**

```bash
cd c:/hana-bi && npm run build
```

Expected: build passes. `npm run dev` at a product URL — dark top section with full-opacity image, ghost 花火 in corner, dark details panel; story section below the `HandDrawnDivider` switches to warm paper with SketchFrame elements.

- [ ] **Step 4: Commit**

```bash
cd c:/hana-bi && git add src/app/product/[slug]/page.tsx && git commit -m "feat: product detail dark top section, light story section"
```

---

### Task 11: Cart Page

**Files:**
- Modify: `src/app/cart/page.tsx`

**Context:** The cart page uses `PageShell` — change to `variant="dark"`. Item rows, borders, and the checkout button switch to dark-track tokens and sienna.

- [ ] **Step 1: Update cart page**

Replace the entire contents of `src/app/cart/page.tsx` with:

```tsx
'use client';

import { PageShell } from "@/components/layout/PageShell";
import { formatCurrency } from "@/lib/utils";
import { useCartStore, useCartTotal, type CartItem } from "@/store/cart";
import Link from "next/link";
import { useState } from "react";

async function handleCheckout(items: CartItem[]) {
  if (items.length === 0) return;

  try {
    const response = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items: items.map((item) => ({
          name: `${item.name} — Size ${item.size}`,
          price: Math.round(item.price * 100),
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

export default function CartPage() {
  const items = useCartStore((state) => state.items);
  const removeItem = useCartStore((state) => state.removeItem);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const clearCart = useCartStore((state) => state.clearCart);
  const total = useCartTotal();
  const isCheckingOut = useCartStore((state) => state.isCheckingOut);
  const setCheckingOut = useCartStore((state) => state.setCheckingOut);
  const [isLoading, setIsLoading] = useState(false);

  return (
    <PageShell
      variant="dark"
      eyebrow="Cart"
      title="Your current study."
      intro="Cart items are stored locally. Checkout is handled securely by Stripe."
    >
      <div className="space-y-8">
        <div className="border border-[var(--hb-dark-border)] divide-y divide-[var(--hb-dark-border)]">
          {items.length === 0 ? (
            <div className="p-6 text-sm text-[var(--hb-dark-muted)]">
              Nothing yet. Browse the{" "}
              <Link href="/shop" className="text-[var(--hb-sienna)] underline">
                shop
              </Link>{" "}
              or revisit the archive.
            </div>
          ) : (
            items.map((item) => (
              <article
                key={`${item.id}-${item.size}`}
                className="p-6 bg-[var(--hb-dark-surface)] flex flex-col gap-4 md:flex-row md:items-center md:justify-between"
              >
                <div>
                  <p className="font-serif text-xl text-[#faf8f4]">{item.name}</p>
                  <p className="text-xs uppercase tracking-[0.3em] text-[var(--hb-dark-muted)]">
                    Size {item.size}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center border border-[var(--hb-dark-border)]">
                    <button
                      onClick={() =>
                        updateQuantity(item.id, item.size, Math.max(1, item.quantity - 1))
                      }
                      className="w-8 h-8 text-[#faf8f4]"
                    >
                      –
                    </button>
                    <span className="w-10 text-center text-[#faf8f4]">{item.quantity}</span>
                    <button
                      onClick={() =>
                        updateQuantity(item.id, item.size, item.quantity + 1)
                      }
                      className="w-8 h-8 text-[#faf8f4]"
                    >
                      +
                    </button>
                  </div>
                  <p className="text-[var(--hb-sienna)]">{formatCurrency(item.price * item.quantity)}</p>
                  <button
                    onClick={() => removeItem(item.id, item.size)}
                    className="text-xs uppercase tracking-[0.3em] text-[var(--hb-dark-muted)] hover:text-[#faf8f4] transition-colors"
                  >
                    Remove
                  </button>
                </div>
              </article>
            ))
          )}
        </div>
        {items.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-[var(--hb-dark-muted)]">Total</span>
              <span className="font-semibold text-[#faf8f4]">{formatCurrency(total)}</span>
            </div>
            <button
              onClick={async () => {
                setIsLoading(true);
                setCheckingOut(true);
                await handleCheckout(items);
                setIsLoading(false);
                setCheckingOut(false);
              }}
              disabled={isLoading || isCheckingOut}
              className="w-full bg-[var(--hb-sienna)] text-[#faf8f4] uppercase tracking-[0.4em] px-6 py-4 text-xs hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {isLoading ? "Redirecting to checkout..." : "Checkout"}
            </button>
            <button
              onClick={clearCart}
              className="text-xs uppercase tracking-[0.3em] text-[var(--hb-dark-muted)] hover:text-[#faf8f4] transition-colors"
            >
              Clear cart
            </button>
          </div>
        )}
      </div>
    </PageShell>
  );
}
```

- [ ] **Step 2: Verify build**

```bash
cd c:/hana-bi && npm run build
```

Expected: build passes. `npm run dev` at `http://localhost:3000/cart` — dark background, dark item rows, sienna checkout button.

- [ ] **Step 3: Commit**

```bash
cd c:/hana-bi && git add src/app/cart/page.tsx && git commit -m "feat: cart page dark treatment"
```

---

### Task 12: Success Page

**Files:**
- Modify: `src/app/success/page.tsx`

**Context:** All 4 UI surfaces go dark: the Suspense fallback (currently `bg-[var(--hb-paper)]` at line 221), the loading state, the unverified state, and the confirmed state. Colors: paper → `--hb-dark`, smoke → `--hb-dark-muted`, ink → cream (`#faf8f4`), accent → `--hb-sienna`. The rounded `rounded-2xl` buttons are replaced with the flat Hana-Bi button style matching the rest of the dark pages.

- [ ] **Step 1: Update success page**

Replace the entire contents of `src/app/success/page.tsx` with:

```tsx
'use client';

import { useEffect, useState, Suspense } from "react";
import { useCartStore } from "@/store/cart";
import { motion } from "framer-motion";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

function SuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const [verified, setVerified] = useState<boolean | null>(null);

  useEffect(() => {
    if (!sessionId) {
      setVerified(false);
      return;
    }

    let attempts = 0;
    const maxAttempts = 5;
    const retryDelayMs = 1000;

    const verify = () => {
      fetch(`/api/checkout/verify?session_id=${encodeURIComponent(sessionId)}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.verified === true) {
            setVerified(true);
            useCartStore.getState().clearCart();
          } else {
            attempts += 1;
            if (attempts < maxAttempts) {
              setTimeout(verify, retryDelayMs);
            } else {
              setVerified(false);
            }
          }
        })
        .catch(() => {
          attempts += 1;
          if (attempts < maxAttempts) {
            setTimeout(verify, retryDelayMs);
          } else {
            setVerified(false);
          }
        });
    };

    verify();
  }, [sessionId]);

  // Loading state
  if (verified === null) {
    return (
      <div className="min-h-screen bg-[var(--hb-dark)] flex items-center justify-center">
        <p className="text-[var(--hb-dark-muted)] font-script">Confirming your order...</p>
      </div>
    );
  }

  // Unverified state
  if (!verified) {
    return (
      <div className="min-h-screen bg-[var(--hb-dark)] flex items-center justify-center px-4">
        <div className="max-w-md text-center space-y-6">
          <h1 className="font-serif text-3xl text-[#faf8f4]">Order not found</h1>
          <p className="text-[var(--hb-dark-muted)]">
            We couldn&apos;t verify your order. If you completed a purchase, check your email for confirmation.
          </p>
          <Link
            href="/"
            className="inline-block px-8 py-4 bg-[var(--hb-sienna)] text-[#faf8f4] uppercase tracking-[0.4em] text-xs hover:opacity-90 transition-opacity"
          >
            Return Home
          </Link>
        </div>
      </div>
    );
  }

  // Confirmed state
  return (
    <div className="min-h-screen bg-[var(--hb-dark)] flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="max-w-2xl mx-auto text-center space-y-8"
      >
        {/* Success icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", delay: 0.2, stiffness: 200 }}
          className="w-24 h-24 mx-auto rounded-full bg-[var(--hb-sienna)]/10 flex items-center justify-center"
        >
          <svg
            width="48"
            height="48"
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--hb-sienna)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M20 6L9 17l-5-5" />
          </svg>
        </motion.div>

        <div className="space-y-4">
          <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl text-[#faf8f4]">
            Order Confirmed
          </h1>
          <p className="text-lg text-[var(--hb-dark-muted)] max-w-md mx-auto">
            Thank you for your order. We&apos;ve received your payment and will begin processing your garment.
          </p>
        </div>

        {sessionId && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="p-6 bg-[var(--hb-dark-surface)] border border-[var(--hb-dark-border)]"
          >
            <p className="text-sm font-script text-[var(--hb-sienna)] mb-2">Order ID</p>
            <p className="font-mono text-sm text-[var(--hb-dark-muted)] break-all">{sessionId}</p>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="space-y-4 pt-8"
        >
          <h2 className="font-serif text-2xl text-[#faf8f4]">What&apos;s Next?</h2>
          <div className="space-y-3 text-left max-w-md mx-auto">
            {[
              "You'll receive an email confirmation with your order details.",
              "We'll notify you when your order ships (6-8 weeks for first drop).",
              "Your garment will arrive ready to break in and age with you.",
            ].map((text, i) => (
              <div key={i} className="flex items-start gap-3">
                <span className="font-serif text-lg text-[var(--hb-sienna)]">{i + 1}.</span>
                <p className="text-[var(--hb-dark-muted)]">{text}</p>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="flex flex-col sm:flex-row gap-4 justify-center pt-8"
        >
          <Link
            href="/shop"
            className="px-8 py-4 border border-[var(--hb-dark-border)] text-[var(--hb-dark-muted)] uppercase tracking-[0.4em] text-xs hover:text-[#faf8f4] hover:border-[var(--hb-sienna)] transition-all duration-300"
          >
            Back to Shop
          </Link>
          <Link
            href="/"
            className="px-8 py-4 bg-[var(--hb-sienna)] text-[#faf8f4] uppercase tracking-[0.4em] text-xs hover:opacity-90 transition-opacity"
          >
            Return Home
          </Link>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="text-sm text-[var(--hb-dark-muted)] font-script pt-8"
        >
          Questions? Contact us at{" "}
          <a
            href="mailto:hello@hana-bi.com"
            className="text-[var(--hb-sienna)] hover:opacity-80 transition-opacity"
          >
            hello@hana-bi.com
          </a>
        </motion.p>
      </motion.div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[var(--hb-dark)] flex items-center justify-center">
          <p className="text-[var(--hb-dark-muted)] font-script">Loading...</p>
        </div>
      }
    >
      <SuccessContent />
    </Suspense>
  );
}
```

- [ ] **Step 2: Verify build**

```bash
cd c:/hana-bi && npm run build
```

Expected: build passes. All 4 states render on dark background.

- [ ] **Step 3: Commit**

```bash
cd c:/hana-bi && git add src/app/success/page.tsx && git commit -m "feat: success page all states dark treatment"
```

---

### Task 13: Consistency Pass

**Files:** No new files — visual audit only.

**Context:** Verify sienna accent is consistent across the site, check Badge contrast on dark surfaces, and confirm light editorial pages (Projects, About, Archive) still render correctly.

- [ ] **Step 1: Run the dev server and audit each page**

```bash
cd c:/hana-bi && npm run dev
```

Check each route:

| Route | Expected |
|---|---|
| `/` | Dark hero, ghost 花火, sienna CTAs, light mid-sections |
| `/shop` | Dark background, dark product cards, sienna active filter |
| `/product/<any-slug>` | Dark top, light story section below HandDrawnDivider |
| `/cart` | Dark background, dark item rows, sienna checkout button |
| `/success?session_id=test` | Dark background, unverified state message |
| `/projects` | Light paper, SketchFrame cards, hand-drawn elements intact |
| `/projects/<any-slug>` | Light paper, existing design unchanged |
| `/about` | Light paper, existing design unchanged |
| `/archive` | Light paper, existing design unchanged |
| Header on `/` | Cream text, sienna active nav underline, dark-surface cart button |
| Header on `/about` | Ink/smoke text, sienna active nav underline, dashed cart button |
| Footer on any page | Dark background, cream headline, sienna hover on links |
| CartDrawer (open from shop) | Dark surface, sienna checkout button |

- [ ] **Step 2: Fix any contrast or color inconsistencies found during audit**

If Badge components on dark surfaces have poor contrast, update the Badge tone used at that call site to `"sienna"` or adjust inline.

- [ ] **Step 3: Final build verification**

```bash
cd c:/hana-bi && npm run build
```

Expected: build passes, 25 static pages generated, 0 errors.

- [ ] **Step 4: Commit**

```bash
cd c:/hana-bi && git add -A && git commit -m "chore: visual consistency pass — sienna accent audit"
```
