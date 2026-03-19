# Visual Overhaul v2 Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add Cormorant Garamond + DM Mono typography, SVG grain texture on dark surfaces, and a catalog numbering system (HB-001…) to the existing dark cinematic overhaul.

**Architecture:** Foundation-first — load fonts and add CSS tokens first, then update components from outermost (layout) inward, then pages. A new `ProductDetailHero` client component isolates Framer Motion from the Server Component product detail page.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript 5, Tailwind CSS 4, `next/font/google`, Framer Motion (already installed)

---

## Chunk 1: Foundation

### Task 1: Load Fonts + Add CSS Tokens

**Files:**
- Modify: `src/app/layout.tsx`
- Modify: `src/app/globals.css`

**Context:** The project uses `next/font/google` for Spectral, Inter, and Kalam — injected as CSS variables `--font-hanabi-serif`, `--font-hanabi-sans`, `--font-hanabi-script`. Add Cormorant Garamond and DM Mono the same way. Add `--hb-font-display` and `--hb-font-mono` CSS tokens to `:root`. Add the `.grain` utility class to globals.css.

- [ ] **Step 1: Add font imports to layout.tsx**

In `src/app/layout.tsx`, change the import line from:
```tsx
import { Spectral, Inter, Kalam } from "next/font/google";
```
to:
```tsx
import { Spectral, Inter, Kalam, Cormorant_Garamond, DM_Mono } from "next/font/google";
```

Then add these two font definitions after the existing three (after the `hanabiScript` block):
```tsx
const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
  display: "swap",
});

const dmMono = DM_Mono({
  subsets: ["latin"],
  weight: ["300"],
  variable: "--font-dm-mono",
  display: "swap",
});
```

Then update the `<body>` className to include the two new variables:
```tsx
<body
  className={`${hanabiSerif.variable} ${hanabiSans.variable} ${hanabiScript.variable} ${cormorant.variable} ${dmMono.variable} antialiased min-h-screen`}
>
```

- [ ] **Step 2: Add CSS tokens and grain utility to globals.css**

In `src/app/globals.css`, inside the `:root` block, add these two lines after `--hb-dark-kanji`:
```css
  --hb-font-display: var(--font-cormorant), Georgia, serif;
  --hb-font-mono:    var(--font-dm-mono), 'Courier New', monospace;
```

Then, at the end of `globals.css` (after all existing rules), add the grain utility class:
```css
/* Grain texture overlay for dark surfaces */
.grain {
  position: relative;
}
.grain::after {
  content: '';
  position: absolute;
  inset: 0;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)' opacity='0.055'/%3E%3C/svg%3E");
  pointer-events: none;
  z-index: 0;
}
```

- [ ] **Step 3: Verify build**

```bash
cd c:/hana-bi && npm run build 2>&1 | tail -15
```

Expected: build passes, 25 static pages generated, 0 TypeScript errors. The site visually unchanged at this point — fonts load but no components use them yet.

- [ ] **Step 4: Commit**

```bash
cd c:/hana-bi && git add src/app/layout.tsx src/app/globals.css && git commit -m "feat: load Cormorant Garamond + DM Mono via next/font, add CSS tokens and grain utility"
```

---

### Task 2: ProductDetailHero Client Component

**Files:**
- Create: `src/components/product/ProductDetailHero.tsx`

**Context:** The product detail page is an async Server Component (uses `generateStaticParams`, `generateMetadata`, `await getProductByHandle`). Framer Motion requires `"use client"`. This new component isolates the animated hero image + details panel so the page stays a Server Component. The page will import and render this component in Task 12.

- [ ] **Step 1: Create the file**

Create `src/components/product/ProductDetailHero.tsx` with this content:

```tsx
"use client";

import { Badge } from "@/components/common/Badge";
import { MarginNote } from "@/components/common/MarginNote";
import type { Product } from "@/data/products";
import { motion } from "framer-motion";
import Image from "next/image";

interface ProductDetailHeroProps {
  product: Product;
  catalogNumber: string | null;
}

export function ProductDetailHero({ product, catalogNumber }: ProductDetailHeroProps) {
  return (
    <div className="grid gap-12 lg:grid-cols-[1.3fr_0.7fr] items-start">
      {/* Hero image — animated from left */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative space-y-6"
      >
        <div className="relative w-full aspect-[3/4] overflow-hidden">
          {/* Ghost 花火 */}
          <span
            aria-hidden="true"
            className="absolute top-6 right-6 z-20 pointer-events-none select-none"
            style={{
              color: "var(--hb-dark-kanji)",
              fontSize: "8rem",
              lineHeight: 1,
              fontFamily: "var(--hb-font-display)",
            }}
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

        {/* Thumbnail grid */}
        {product.images && product.images.length > 0 && (
          <div className="grid grid-cols-3 gap-4">
            {product.images.map((image, idx) => (
              <div
                key={image}
                className="relative aspect-[4/5] overflow-hidden"
                style={{ transform: `rotate(${idx % 2 === 0 ? "0.8deg" : "-0.8deg"})` }}
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
      </motion.div>

      {/* Details panel — animated from right */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, ease: "easeOut", delay: 0.15 }}
        className="space-y-6 sticky top-24 grain bg-[var(--hb-dark-surface)] p-6 border border-[var(--hb-dark-border)]"
      >
        <div className="space-y-4 relative z-10">
          {catalogNumber && (
            <p
              className="text-xs tracking-[0.55em] uppercase opacity-60"
              style={{ fontFamily: "var(--hb-font-mono)", color: "var(--hb-sienna)" }}
            >
              {catalogNumber}
            </p>
          )}
          <h1
            className="text-4xl lg:text-5xl leading-tight text-[#faf8f4] italic font-light"
            style={{ fontFamily: "var(--hb-font-display)" }}
          >
            {product.name}
          </h1>
        </div>

        <div className="space-y-4 pt-4 relative z-10">
          <div>
            <p
              className="text-xs tracking-[0.3em] uppercase mb-2"
              style={{ fontFamily: "var(--hb-font-mono)", color: "var(--hb-dark-muted)" }}
            >
              Collection
            </p>
            <p
              className="text-lg italic font-light text-[#faf8f4]"
              style={{ fontFamily: "var(--hb-font-display)" }}
            >
              {product.collection}
            </p>
          </div>

          <div>
            <p
              className="text-xs tracking-[0.3em] uppercase mb-2"
              style={{ fontFamily: "var(--hb-font-mono)", color: "var(--hb-dark-muted)" }}
            >
              Price
            </p>
            <p
              className="text-2xl"
              style={{ fontFamily: "var(--hb-font-mono)", color: "var(--hb-sienna)" }}
            >
              ${product.price}
            </p>
          </div>

          {product.year && (
            <div>
              <p
                className="text-xs tracking-[0.3em] uppercase mb-2"
                style={{ fontFamily: "var(--hb-font-mono)", color: "var(--hb-dark-muted)" }}
              >
                Year
              </p>
              <p
                className="text-sm"
                style={{ fontFamily: "var(--hb-font-mono)", color: "var(--hb-dark-muted)" }}
              >
                {product.year}
              </p>
            </div>
          )}

          <div>
            <p
              className="text-xs tracking-[0.3em] uppercase mb-2"
              style={{ fontFamily: "var(--hb-font-mono)", color: "var(--hb-dark-muted)" }}
            >
              Tags
            </p>
            <div className="flex flex-wrap gap-2">
              {product.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-xs uppercase tracking-[0.2em] border border-dashed border-[var(--hb-dark-border)] px-3 py-1.5"
                  style={{ fontFamily: "var(--hb-font-mono)", color: "var(--hb-dark-muted)" }}
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
```

- [ ] **Step 2: Verify build**

```bash
cd c:/hana-bi && npm run build 2>&1 | tail -10
```

Expected: build passes. The component isn't used yet so no visual change.

- [ ] **Step 3: Commit**

```bash
cd c:/hana-bi && git add src/components/product/ProductDetailHero.tsx && git commit -m "feat: ProductDetailHero client component with Framer Motion staggered entry"
```

---

## Chunk 2: Layout Components

### Task 3: SiteHeader

**Files:**
- Modify: `src/components/layout/SiteHeader.tsx`

**Context:** Apply Cormorant Garamond to the "Hana-Bi" site name and DM Mono to all nav links and cart button text. Use `style={{ fontFamily: "var(--hb-font-display)" }}` and `style={{ fontFamily: "var(--hb-font-mono)" }}` — avoid changing class names that control layout/color, only update font-family.

- [ ] **Step 1: Update SiteHeader**

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
            className={`text-3xl tracking-[0.08em] hover-wispy relative group transition-colors italic font-light ${
              isDark ? "text-[#faf8f4]" : "text-[var(--hb-ink)]"
            }`}
            style={{ fontFamily: "var(--hb-font-display)" }}
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
            style={{ fontFamily: "var(--hb-font-mono)" }}
          >
            Cart
            {cartCount > 0 && (
              <span
                className={`absolute -top-2 -right-2 w-5 h-5 text-[0.65rem] rounded-full flex items-center justify-center ${
                  isDark
                    ? "bg-[var(--hb-sienna)] text-[#faf8f4]"
                    : "bg-[var(--hb-ink)] text-[var(--hb-paper)]"
                }`}
                style={{ fontFamily: "var(--hb-font-mono)" }}
              >
                {cartCount}
              </span>
            )}
          </button>
        </div>

        <nav
          className={`flex flex-wrap gap-8 text-xs uppercase tracking-[0.4em] ${
            isDark ? "text-[var(--hb-dark-muted)]" : "text-[var(--hb-smoke)]"
          }`}
          style={{ fontFamily: "var(--hb-font-mono)" }}
        >
          {NAV_LINKS.map((link) => {
            const isActive =
              link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`pb-2 relative hover-wispy transition-all duration-300 ${
                  isActive
                    ? isDark ? "text-[#faf8f4]" : "text-[var(--hb-ink)]"
                    : isDark ? "hover:text-[#faf8f4]" : "hover:text-[var(--hb-ink-light)]"
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

- [ ] **Step 2: Verify build**

```bash
cd c:/hana-bi && npm run build 2>&1 | tail -10
```

Expected: build passes.

- [ ] **Step 3: Commit**

```bash
cd c:/hana-bi && git add src/components/layout/SiteHeader.tsx && git commit -m "feat: SiteHeader — Cormorant site name, DM Mono nav"
```

---

### Task 4: SiteFooter

**Files:**
- Modify: `src/components/layout/SiteFooter.tsx`

**Context:** Change "Hana-Bi" eyebrow from `font-script` to DM Mono. Change "Study the Archive." from `font-serif` to Cormorant italic. Change footer links and copyright to DM Mono.

- [ ] **Step 1: Update SiteFooter**

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
    <footer className="bg-[var(--hb-dark)] px-4 sm:px-8 md:px-12 lg:px-20 py-12 relative mt-20 grain">
      {/* Top border */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[var(--hb-dark-border)] to-transparent" />

      <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between relative z-10">
        <div className="space-y-3">
          <p
            className="uppercase text-xs tracking-[0.35em] opacity-70"
            style={{ fontFamily: "var(--hb-font-mono)", color: "var(--hb-sienna)" }}
          >
            Hana-Bi
          </p>
          <h3
            className="text-3xl tracking-tight text-[#faf8f4] italic font-light"
            style={{ fontFamily: "var(--hb-font-display)" }}
          >
            Study the Archive.
          </h3>
          <p className="text-sm text-[var(--hb-dark-muted)] leading-relaxed">
            Sustainable denim and garments captured like museum pieces.
          </p>
        </div>
        <div
          className="flex flex-wrap gap-6 text-xs uppercase tracking-[0.3em] text-[var(--hb-dark-muted)]"
          style={{ fontFamily: "var(--hb-font-mono)" }}
        >
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
      <div
        className="mt-10 text-[0.65rem] uppercase tracking-[0.4em] text-[var(--hb-dark-muted)] opacity-50 relative z-10"
        style={{ fontFamily: "var(--hb-font-mono)" }}
      >
        © {new Date().getFullYear()} Hana-Bi Atelier — Crafted in limited runs.
      </div>
    </footer>
  );
}
```

- [ ] **Step 2: Verify build**

```bash
cd c:/hana-bi && npm run build 2>&1 | tail -10
```

Expected: build passes.

- [ ] **Step 3: Commit**

```bash
cd c:/hana-bi && git add src/components/layout/SiteFooter.tsx && git commit -m "feat: SiteFooter — Cormorant headline, DM Mono links, grain texture"
```

---

### Task 5: CartDrawer

**Files:**
- Modify: `src/components/cart/CartDrawer.tsx`

**Context:** Apply Cormorant italic to item names, DM Mono to all labels/buttons/prices. Add `.grain` class to the drawer panel. All interactive children inside `.grain` must have `relative z-10`. Preserve the `handleCheckout` function exactly.

- [ ] **Step 1: Update CartDrawer**

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
      <section className="grain w-full max-w-md bg-[var(--hb-dark-surface)] border-l border-[var(--hb-dark-border)]">
        <header className="px-6 py-5 flex items-center justify-between border-b border-[var(--hb-dark-border)] relative z-10">
          <div>
            <p
              className="uppercase text-xs tracking-[0.35em] opacity-70"
              style={{ fontFamily: "var(--hb-font-mono)", color: "var(--hb-sienna)" }}
            >
              Cart
            </p>
            <h2
              className="text-2xl mt-1 text-[#faf8f4] italic font-light"
              style={{ fontFamily: "var(--hb-font-display)" }}
            >
              {itemCount === 0 ? "Empty" : `${itemCount} item${itemCount > 1 ? "s" : ""}`}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-xs uppercase tracking-[0.3em] text-[var(--hb-dark-muted)] hover:text-[#faf8f4] transition-colors"
            style={{ fontFamily: "var(--hb-font-mono)" }}
          >
            Close
          </button>
        </header>
        <div className="max-h-[65vh] overflow-y-auto divide-y divide-[var(--hb-dark-border)] relative z-10">
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
                      className="w-8 h-8 text-[#faf8f4]"
                      style={{ fontFamily: "var(--hb-font-mono)" }}
                    >
                      –
                    </button>
                    <span
                      className="w-10 text-center text-[#faf8f4] text-sm"
                      style={{ fontFamily: "var(--hb-font-mono)" }}
                    >
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.id, item.size, item.quantity + 1)}
                      className="w-8 h-8 text-[#faf8f4]"
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
          <footer className="px-6 py-5 border-t border-[var(--hb-dark-border)] space-y-4 relative z-10">
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
      </section>
    </div>
  );
}
```

- [ ] **Step 2: Verify build**

```bash
cd c:/hana-bi && npm run build 2>&1 | tail -10
```

Expected: build passes.

- [ ] **Step 3: Commit**

```bash
cd c:/hana-bi && git add src/components/cart/CartDrawer.tsx && git commit -m "feat: CartDrawer — Cormorant item names, DM Mono labels, grain texture"
```

---

## Chunk 3: Shop + Shell Components

### Task 6: PageShell

**Files:**
- Modify: `src/components/layout/PageShell.tsx`

**Context:** Switch title from `font-serif` to Cormorant italic. Switch eyebrow from `font-script` to DM Mono. Add `.grain` class to the section wrapper when `variant="dark"`. All existing children already have `relative z-10` — confirm this is still true after the rewrite.

- [ ] **Step 1: Update PageShell**

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
        isDark ? "bg-[var(--hb-dark)] grain" : "",
        className
      )}
    >
      {!isDark && (
        <PaperBackground intensity="subtle" texture="grain" className="absolute inset-0" />
      )}

      <header className="max-w-4xl mb-20 relative z-10">
        {eyebrow && (
          <span
            className={`uppercase text-xs tracking-[0.4em] opacity-70 ${
              isDark ? "" : "font-script text-[var(--hb-smoke)]"
            }`}
            style={
              isDark
                ? { fontFamily: "var(--hb-font-mono)", color: "var(--hb-sienna)" }
                : undefined
            }
          >
            {eyebrow}
          </span>
        )}
        <div className="mt-8 space-y-4">
          <h1
            className={`text-5xl sm:text-6xl lg:text-7xl tracking-tight leading-[1.05] italic font-light ${
              isDark ? "text-[#faf8f4]" : ""
            }`}
            style={{ fontFamily: "var(--hb-font-display)" }}
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
cd c:/hana-bi && npm run build 2>&1 | tail -10
```

Expected: build passes.

- [ ] **Step 3: Commit**

```bash
cd c:/hana-bi && git add src/components/layout/PageShell.tsx && git commit -m "feat: PageShell — Cormorant title, DM Mono eyebrow, grain on dark variant"
```

---

### Task 7: ProductCard

**Files:**
- Modify: `src/components/shop/ProductCard.tsx`

**Context:** Add `catalogIndex?: number` prop. Format as `HB-${String(catalogIndex + 1).padStart(3, "0")}`. Display catalog number above the image container. Switch product name to Cormorant italic. Switch price/tag/collection to DM Mono. Dark variant image container gets `.grain` class. Sienna hover rule changes from opacity transition to CSS `scaleX` transform. Catalog number gets opacity transition on hover (0.35 → 1).

- [ ] **Step 1: Update ProductCard**

Replace the entire contents of `src/components/shop/ProductCard.tsx` with:

```tsx
import { Badge } from "@/components/common/Badge";
import { MarginNote } from "@/components/common/MarginNote";
import { Product } from "@/data/products";
import { formatCurrency } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";

interface ProductCardProps {
  product: Product;
  variant?: "dark" | "light";
  catalogIndex?: number;
}

function getAnnotation(product: Product): string {
  if (product.tags.some((t) => t.toLowerCase().includes("denim"))) return "raw denim";
  if (product.tags.some((t) => t.toLowerCase().includes("selvedge"))) return "selvedge";
  if (product.collection.toLowerCase().includes("sample")) return "sample 001";
  return "edition piece";
}

function formatCatalogNumber(index: number): string {
  return `HB-${String(index + 1).padStart(3, "0")}`;
}

export function ProductCard({ product, variant = "dark", catalogIndex }: ProductCardProps) {
  const annotation = getAnnotation(product);
  const isDark = variant === "dark";
  const catalogNumber = catalogIndex !== undefined ? formatCatalogNumber(catalogIndex) : null;

  return (
    <Link
      href={`/product/${product.slug}`}
      className="group flex flex-col gap-3 p-5 hover-wispy relative"
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

      {/* Dark variant: sienna bottom rule slides in from left on hover */}
      {isDark && (
        <div className="absolute bottom-0 left-5 right-5 h-px bg-[var(--hb-sienna)] scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-[400ms] pointer-events-none" />
      )}

      {/* Catalog number — above image */}
      {catalogNumber && (
        <p
          className={`text-[0.55rem] uppercase tracking-[0.55em] transition-opacity duration-[400ms] ${
            isDark
              ? "text-[var(--hb-dark-muted)] opacity-[0.35] group-hover:opacity-100"
              : "text-[var(--hb-smoke)] opacity-50"
          }`}
          style={{ fontFamily: "var(--hb-font-mono)" }}
        >
          {catalogNumber}
        </p>
      )}

      <div
        className={`relative w-full aspect-[4/5] overflow-hidden ${
          isDark ? "bg-[var(--hb-dark-surface)] grain" : "bg-[var(--hb-paper-muted)]"
        }`}
      >
        <Image
          src={product.heroImage}
          alt={product.name}
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          className="object-cover transition duration-700 group-hover:scale-[1.02] relative z-10"
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

        {/* Hover annotation — light variant only */}
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

      <div className="space-y-2 relative z-10 pt-1">
        <p
          className={`text-xl leading-tight italic font-light ${isDark ? "text-[#faf8f4]" : ""}`}
          style={{ fontFamily: "var(--hb-font-display)" }}
        >
          {product.name}
        </p>
        <p
          className={`text-xs uppercase tracking-[0.3em] opacity-60 ${
            isDark ? "" : "text-[var(--hb-smoke)]"
          }`}
          style={{
            fontFamily: "var(--hb-font-mono)",
            color: isDark ? "var(--hb-sienna)" : undefined,
          }}
        >
          {product.collection}
        </p>
        <div className="flex items-center justify-between text-sm pt-1">
          <span
            className={isDark ? "text-[#faf8f4]" : ""}
            style={{ fontFamily: "var(--hb-font-mono)" }}
          >
            {formatCurrency(product.price)}
          </span>
          <span
            className={`text-xs uppercase tracking-[0.2em] border px-2 py-1 ${
              isDark
                ? "border-[var(--hb-dark-border)] text-[var(--hb-dark-muted)]"
                : ""
            }`}
            style={{ fontFamily: "var(--hb-font-mono)" }}
          >
            {product.tags[0]}
          </span>
        </div>
      </div>
    </Link>
  );
}
```

- [ ] **Step 2: Verify build**

```bash
cd c:/hana-bi && npm run build 2>&1 | tail -10
```

Expected: build passes.

- [ ] **Step 3: Commit**

```bash
cd c:/hana-bi && git add src/components/shop/ProductCard.tsx && git commit -m "feat: ProductCard — catalog number, Cormorant name, DM Mono, grain, scaleX hover rule"
```

---

### Task 8: ProductGrid

**Files:**
- Modify: `src/components/shop/ProductGrid.tsx`

**Context:** Pass `catalogIndex={index}` to each `ProductCard`. No other changes.

- [ ] **Step 1: Update ProductGrid**

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
        className="text-sm"
        style={{
          fontFamily: "var(--hb-font-mono)",
          color: variant === "dark" ? "var(--hb-dark-muted)" : "var(--hb-smoke)",
        }}
      >
        No garments match these filters yet.
      </p>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {products.map((product, index) => (
        <ProductCard
          key={product.id}
          product={product}
          variant={variant}
          catalogIndex={index}
        />
      ))}
    </div>
  );
}
```

- [ ] **Step 2: Verify build**

```bash
cd c:/hana-bi && npm run build 2>&1 | tail -10
```

Expected: build passes.

- [ ] **Step 3: Commit**

```bash
cd c:/hana-bi && git add src/components/shop/ProductGrid.tsx && git commit -m "feat: ProductGrid — pass catalogIndex to ProductCard"
```

---

### Task 9: ProductFilters

**Files:**
- Modify: `src/components/shop/ProductFilters.tsx`

**Context:** All text in the filters bar should use DM Mono. The component is already `"use client"`. Read the full current file and add `style={{ fontFamily: "var(--hb-font-mono)" }}` to: the container div, all `<button>` elements, both `<label>` spans, and both `<select>` elements.

- [ ] **Step 1: Read current ProductFilters.tsx**

Read `src/components/shop/ProductFilters.tsx` in full to understand the complete current JSX.

- [ ] **Step 2: Add DM Mono font-family**

On each of the following elements, add `style={{ fontFamily: "var(--hb-font-mono)" }}`:
- The outer container `<div>` (the one with `flex flex-col gap-4 border p-4`)
- All `<button>` elements (Available, Archived)
- Both `<span>` elements inside `<label>` (Category, Size)
- Both `<select>` elements

Do not change any class names, colors, or logic — only add the font-family style.

- [ ] **Step 3: Verify build**

```bash
cd c:/hana-bi && npm run build 2>&1 | tail -10
```

Expected: build passes.

- [ ] **Step 4: Commit**

```bash
cd c:/hana-bi && git add src/components/shop/ProductFilters.tsx && git commit -m "feat: ProductFilters — DM Mono labels"
```

---

## Chunk 4: Pages

### Task 10: Homepage

**Files:**
- Modify: `src/app/page.tsx`

**Context:** Apply Cormorant italic to the hero headline and featured garment card heading. Apply DM Mono to the eyebrow, CTAs, "Featured Garment" label, and Current Drop headings. Add `.grain` class to the hero section and featured card. Hero eyebrow becomes `HB — EDITIONS OF DENIM`. Featured card catalog number is hardcoded `HB-001`. Data fetching logic is unchanged.

- [ ] **Step 1: Update homepage**

Replace the entire contents of `src/app/page.tsx` with:

```tsx
import { HandDrawnDivider } from "@/components/common/HandDrawnDivider";
import { InkUnderline } from "@/components/common/InkUnderline";
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
      featured = featuredCollection.map(mapShopifyProductToHanaBiProduct).slice(0, 3);
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
    console.warn("Failed to fetch from Shopify, using fallback data:", error);
    featured = fallbackFeatured.slice(0, 3);
    archiveSlices = fallbackArchived.slice(0, 2);
  }

  const heroFeature = featured[0] ?? allProducts[0] ?? fallbackProducts[0];

  return (
    <main className="page-transition">
      {/* ── Dark Hero ─────────────────────────────────────────── */}
      <section className="grain relative min-h-[85vh] flex items-center justify-center overflow-hidden bg-[var(--hb-dark)]">
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
            <div
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(to top, rgba(14,12,11,0.85) 0%, rgba(14,12,11,0.3) 60%, transparent 100%)",
              }}
            />
          </div>
        )}

        {/* Ghost 花火 */}
        <span
          aria-hidden="true"
          className="absolute bottom-8 right-8 pointer-events-none select-none italic"
          style={{
            color: "var(--hb-dark-kanji)",
            fontSize: "12rem",
            lineHeight: 1,
            fontFamily: "var(--hb-font-display)",
          }}
        >
          花火
        </span>

        <div className="relative z-10 px-4 sm:px-8 md:px-12 lg:px-20 py-24 w-full max-w-6xl mx-auto">
          <div className="grid gap-16 lg:grid-cols-[1.1fr_0.9fr] items-center">
            <div className="space-y-8">
              <p
                className="uppercase text-xs tracking-[0.5em] opacity-70"
                style={{ fontFamily: "var(--hb-font-mono)", color: "var(--hb-sienna)" }}
              >
                HB — Editions of Denim
              </p>
              <h1
                className="leading-[0.92] tracking-tight text-[#faf8f4] italic font-light"
                style={{
                  fontFamily: "var(--hb-font-display)",
                  fontSize: "clamp(4rem, 10vw, 8rem)",
                }}
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
                  style={{ fontFamily: "var(--hb-font-mono)" }}
                >
                  Enter Shop
                </Link>
                <Link
                  href="/about"
                  className="border border-[rgba(250,248,244,0.25)] text-[rgba(250,248,244,0.7)] uppercase tracking-[0.4em] px-8 py-4 text-xs hover:text-[#faf8f4] hover:border-[rgba(250,248,244,0.5)] transition-all duration-300"
                  style={{ fontFamily: "var(--hb-font-mono)" }}
                >
                  What is Hana-Bi?
                </Link>
              </div>
            </div>

            {/* Featured garment card */}
            {heroFeature && (
              <div className="grain bg-[var(--hb-dark-surface)] p-6 space-y-5 border border-[var(--hb-dark-border)]">
                <div className="relative z-10 space-y-5">
                  <p
                    className="uppercase text-xs tracking-[0.55em] opacity-60"
                    style={{ fontFamily: "var(--hb-font-mono)", color: "var(--hb-sienna)" }}
                  >
                    HB-001
                  </p>
                  <p
                    className="uppercase text-xs tracking-[0.4em] opacity-70"
                    style={{ fontFamily: "var(--hb-font-mono)", color: "var(--hb-sienna)" }}
                  >
                    Featured Garment
                  </p>
                  <h2
                    className="text-3xl leading-tight text-[#faf8f4] italic font-light"
                    style={{ fontFamily: "var(--hb-font-display)" }}
                  >
                    {heroFeature.name}
                  </h2>
                  <p className="text-sm leading-relaxed text-[var(--hb-dark-muted)]">
                    {heroFeature.story}
                  </p>
                  <Link
                    href={`/product/${heroFeature.slug}`}
                    className="text-xs uppercase tracking-[0.4em] border-b border-[var(--hb-sienna)] pb-1 inline-block hover:opacity-80 transition-opacity"
                    style={{ fontFamily: "var(--hb-font-mono)", color: "var(--hb-sienna)" }}
                  >
                    View Piece
                  </Link>
                </div>
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
              <h3
                className="text-4xl lg:text-5xl leading-tight italic font-light"
                style={{ fontFamily: "var(--hb-font-display)" }}
              >
                Retail, but archival.
              </h3>
              <InkUnderline width={140} variant="delicate" strokeOpacity={0.35} className="mt-3" />
            </div>
            <p className="text-base leading-relaxed text-[var(--hb-smoke)] opacity-85 max-w-lg">
              We work like an editorial studio. Each garment is catalogued, nodded to with
              doodled borders and inked underlines throughout the site.
            </p>
          </div>
        </PaperBackground>
      </section>

      {/* ── Dark: Current Drop ────────────────────────────────── */}
      <section className="grain px-4 sm:px-8 md:px-12 lg:px-20 py-24 space-y-16 bg-[var(--hb-dark)]">
        <div className="flex items-center justify-between relative z-10">
          <div className="space-y-3">
            <p
              className="uppercase text-xs tracking-[0.4em] opacity-70"
              style={{ fontFamily: "var(--hb-font-mono)", color: "var(--hb-sienna)" }}
            >
              Featured Pieces
            </p>
            <h3
              className="text-4xl lg:text-5xl leading-tight text-[#faf8f4] italic font-light"
              style={{ fontFamily: "var(--hb-font-display)" }}
            >
              Current Drop
            </h3>
          </div>
          <Link
            href="/shop"
            className="text-xs uppercase tracking-[0.4em] border-b border-[var(--hb-dark-border)] pb-1.5 text-[var(--hb-dark-muted)] hover:text-[#faf8f4] hover:border-[var(--hb-sienna)] transition-all duration-300"
            style={{ fontFamily: "var(--hb-font-mono)" }}
          >
            View All
          </Link>
        </div>
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-3 relative z-10">
          {featured.map((product, index) => (
            <ProductCard
              key={product.id}
              product={product}
              variant="dark"
              catalogIndex={index}
            />
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
              <h3
                className="text-4xl lg:text-5xl leading-tight italic font-light"
                style={{ fontFamily: "var(--hb-font-display)" }}
              >
                Lookbook strips
              </h3>
              <InkUnderline width={140} variant="delicate" strokeOpacity={0.35} className="mt-2" />
            </div>
            <Link
              href="/archive"
              className="text-xs uppercase tracking-[0.4em] border-b border-dashed border-[var(--hb-border)] pb-1.5 hover-wispy opacity-70 hover:opacity-100"
              style={{ fontFamily: "var(--hb-font-mono)" }}
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
                  <h4
                    className="text-2xl leading-tight italic font-light"
                    style={{ fontFamily: "var(--hb-font-display)" }}
                  >
                    {piece.name}
                  </h4>
                  <p className="text-sm text-[var(--hb-smoke)] opacity-80 leading-relaxed">
                    {piece.description}
                  </p>
                  <Link
                    href={`/product/${piece.slug}`}
                    className="text-xs uppercase tracking-[0.4em] border-b border-dashed border-[var(--hb-border)] pb-1 inline-block hover-wispy opacity-70 hover:opacity-100"
                    style={{ fontFamily: "var(--hb-font-mono)" }}
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
cd c:/hana-bi && npm run build 2>&1 | tail -10
```

Expected: build passes.

- [ ] **Step 3: Commit**

```bash
cd c:/hana-bi && git add src/app/page.tsx && git commit -m "feat: homepage — Cormorant hero, DM Mono labels, grain texture, catalog HB-001"
```

---

### Task 11: Shop Page

**Files:**
- Modify: `src/app/shop/page.tsx`

**Context:** This file just wraps `PageShell` and `ShopContent` — no changes needed beyond verifying the build still passes with the updated components. The only change is removing the hardcoded `intro` string referencing the CMS file path, replacing it with cleaner copy.

- [ ] **Step 1: Update shop page**

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
    console.warn("Failed to fetch from Shopify, using fallback data:", error);
  }

  return (
    <main className="page-transition">
      <PageShell
        variant="dark"
        eyebrow="Shop"
        title="Limited garments, ready to study."
        intro={<>Filter by size, category, or availability.</>}
      >
        <ShopContent products={shopifyProducts} variant="dark" />
      </PageShell>
    </main>
  );
}
```

- [ ] **Step 2: Verify build**

```bash
cd c:/hana-bi && npm run build 2>&1 | tail -10
```

Expected: build passes.

- [ ] **Step 3: Commit**

```bash
cd c:/hana-bi && git add src/app/shop/page.tsx && git commit -m "feat: shop page — clean intro copy"
```

---

### Task 12: Product Detail Page

**Files:**
- Modify: `src/app/product/[slug]/page.tsx`

**Context:** Import `ProductDetailHero`. Calculate `catalogNumber` from `products.findIndex(p => p.slug === params.slug)`. Pass to `ProductDetailHero`. Apply Cormorant to SketchFrame headings in the light story section. Apply DM Mono to the "Story" eyebrow labels.

- [ ] **Step 1: Read the current full product detail page**

Read `src/app/product/[slug]/page.tsx` in its entirety to understand the exact current structure before editing.

- [ ] **Step 2: Update the product detail page**

Make these targeted changes to `src/app/product/[slug]/page.tsx`:

**a) Add import for ProductDetailHero** — add after the existing imports:
```tsx
import { ProductDetailHero } from "@/components/product/ProductDetailHero";
import { products as allFallbackProducts } from "@/data/products";
```

**b) Add catalog number calculation** — in `ProductPage`, after `if (!product) { notFound(); }`, add:
```tsx
const catalogIndex = allFallbackProducts.findIndex(p => p.slug === params.slug);
const catalogNumber = catalogIndex >= 0
  ? `HB-${String(catalogIndex + 1).padStart(3, "0")}`
  : null;
```

**c) Replace the dark top section grid** — find the `<div className="grid gap-12 lg:grid-cols-[1.3fr_0.7fr] items-start">` block (the hero image + details panel grid inside the dark section) and replace it with:
```tsx
<ProductDetailHero product={product} catalogNumber={catalogNumber} />
```

**d) Apply Cormorant to story section headings** — in the light story section (inside `<PaperBackground>`), find any `<p>` or heading tags that have `font-serif` class and replace `font-serif` with `italic font-light` + `style={{ fontFamily: "var(--hb-font-display)" }}`.

**e) Apply DM Mono to story section labels** — find `font-script` labels like "Story", "Collection", "Sizes", "Status" in the light section and replace `font-script` with `style={{ fontFamily: "var(--hb-font-mono)" }}`.

- [ ] **Step 3: Verify build**

```bash
cd c:/hana-bi && npm run build 2>&1 | tail -15
```

If there are import errors (e.g. `allFallbackProducts` already imported under a different name), use the existing import alias instead. Expected: build passes, 25 pages.

- [ ] **Step 4: Commit**

```bash
cd c:/hana-bi && git add "src/app/product/[slug]/page.tsx" && git commit -m "feat: product detail — ProductDetailHero with catalog number, Cormorant story section"
```

---

### Task 13: Cart Page

**Files:**
- Modify: `src/app/cart/page.tsx`

**Context:** Apply Cormorant italic to the PageShell title (already handled by updated PageShell). Apply DM Mono to item size/quantity/price labels and the checkout button. Apply Cormorant to item names.

- [ ] **Step 1: Read the current cart page**

Read `src/app/cart/page.tsx` in full.

- [ ] **Step 2: Update cart page**

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
            <div
              className="p-6 text-sm text-[var(--hb-dark-muted)]"
              style={{ fontFamily: "var(--hb-font-mono)" }}
            >
              Nothing yet. Browse the{" "}
              <Link href="/shop" className="underline" style={{ color: "var(--hb-sienna)" }}>
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
                  <p
                    className="text-xl text-[#faf8f4] italic font-light"
                    style={{ fontFamily: "var(--hb-font-display)" }}
                  >
                    {item.name}
                  </p>
                  <p
                    className="text-xs uppercase tracking-[0.3em] mt-1"
                    style={{ fontFamily: "var(--hb-font-mono)", color: "var(--hb-dark-muted)" }}
                  >
                    Size {item.size}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center border border-[var(--hb-dark-border)]">
                    <button
                      onClick={() => updateQuantity(item.id, item.size, Math.max(1, item.quantity - 1))}
                      className="w-8 h-8 text-[#faf8f4]"
                      style={{ fontFamily: "var(--hb-font-mono)" }}
                    >
                      –
                    </button>
                    <span
                      className="w-10 text-center text-[#faf8f4]"
                      style={{ fontFamily: "var(--hb-font-mono)" }}
                    >
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.id, item.size, item.quantity + 1)}
                      className="w-8 h-8 text-[#faf8f4]"
                      style={{ fontFamily: "var(--hb-font-mono)" }}
                    >
                      +
                    </button>
                  </div>
                  <p style={{ fontFamily: "var(--hb-font-mono)", color: "var(--hb-sienna)" }}>
                    {formatCurrency(item.price * item.quantity)}
                  </p>
                  <button
                    onClick={() => removeItem(item.id, item.size)}
                    className="text-xs uppercase tracking-[0.3em] text-[var(--hb-dark-muted)] hover:text-[#faf8f4] transition-colors"
                    style={{ fontFamily: "var(--hb-font-mono)" }}
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
              <span
                style={{ fontFamily: "var(--hb-font-mono)", color: "var(--hb-dark-muted)" }}
              >
                Total
              </span>
              <span
                className="font-semibold text-[#faf8f4]"
                style={{ fontFamily: "var(--hb-font-mono)" }}
              >
                {formatCurrency(total)}
              </span>
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
              style={{ fontFamily: "var(--hb-font-mono)" }}
            >
              {isLoading ? "Redirecting to checkout..." : "Checkout"}
            </button>
            <button
              onClick={clearCart}
              className="text-xs uppercase tracking-[0.3em] text-[var(--hb-dark-muted)] hover:text-[#faf8f4] transition-colors"
              style={{ fontFamily: "var(--hb-font-mono)" }}
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
cd c:/hana-bi && npm run build 2>&1 | tail -10
```

Expected: build passes.

- [ ] **Step 3: Commit**

```bash
cd c:/hana-bi && git add src/app/cart/page.tsx && git commit -m "feat: cart page — Cormorant item names, DM Mono labels"
```

---

### Task 14: Success Page

**Files:**
- Modify: `src/app/success/page.tsx`

**Context:** Apply Cormorant italic to "Order Confirmed" h1 and "What's Next?" h2. Apply DM Mono to all other text (status messages, order ID, step descriptions, contact email). Replace `font-script` and `font-mono` class usages with DM Mono via `style`. Verification retry logic is unchanged.

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

  if (verified === null) {
    return (
      <div className="min-h-screen bg-[var(--hb-dark)] flex items-center justify-center">
        <p
          className="text-sm"
          style={{ fontFamily: "var(--hb-font-mono)", color: "var(--hb-dark-muted)" }}
        >
          Confirming your order...
        </p>
      </div>
    );
  }

  if (!verified) {
    return (
      <div className="min-h-screen bg-[var(--hb-dark)] flex items-center justify-center px-4">
        <div className="max-w-md text-center space-y-6">
          <h1
            className="text-3xl text-[#faf8f4] italic font-light"
            style={{ fontFamily: "var(--hb-font-display)" }}
          >
            Order not found
          </h1>
          <p
            className="text-sm"
            style={{ fontFamily: "var(--hb-font-mono)", color: "var(--hb-dark-muted)" }}
          >
            We couldn&apos;t verify your order. If you completed a purchase, check your email for confirmation.
          </p>
          <Link
            href="/"
            className="inline-block px-8 py-4 bg-[var(--hb-sienna)] text-[#faf8f4] uppercase tracking-[0.4em] text-xs hover:opacity-90 transition-opacity"
            style={{ fontFamily: "var(--hb-font-mono)" }}
          >
            Return Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--hb-dark)] flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="max-w-2xl mx-auto text-center space-y-8"
      >
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
          <h1
            className="text-4xl md:text-5xl lg:text-6xl text-[#faf8f4] italic font-light"
            style={{ fontFamily: "var(--hb-font-display)" }}
          >
            Order Confirmed
          </h1>
          <p
            className="text-base max-w-md mx-auto"
            style={{ fontFamily: "var(--hb-font-mono)", color: "var(--hb-dark-muted)" }}
          >
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
            <p
              className="text-xs mb-2"
              style={{ fontFamily: "var(--hb-font-mono)", color: "var(--hb-sienna)" }}
            >
              Order ID
            </p>
            <p
              className="text-sm break-all"
              style={{ fontFamily: "var(--hb-font-mono)", color: "var(--hb-dark-muted)" }}
            >
              {sessionId}
            </p>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="space-y-4 pt-8"
        >
          <h2
            className="text-2xl text-[#faf8f4] italic font-light"
            style={{ fontFamily: "var(--hb-font-display)" }}
          >
            What&apos;s Next?
          </h2>
          <div className="space-y-3 text-left max-w-md mx-auto">
            {[
              "You'll receive an email confirmation with your order details.",
              "We'll notify you when your order ships (6–8 weeks for first drop).",
              "Your garment will arrive ready to break in and age with you.",
            ].map((text, i) => (
              <div key={i} className="flex items-start gap-3">
                <span
                  className="text-lg"
                  style={{ fontFamily: "var(--hb-font-display)", color: "var(--hb-sienna)", fontStyle: "italic" }}
                >
                  {i + 1}.
                </span>
                <p
                  className="text-sm"
                  style={{ fontFamily: "var(--hb-font-mono)", color: "var(--hb-dark-muted)" }}
                >
                  {text}
                </p>
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
            style={{ fontFamily: "var(--hb-font-mono)" }}
          >
            Back to Shop
          </Link>
          <Link
            href="/"
            className="px-8 py-4 bg-[var(--hb-sienna)] text-[#faf8f4] uppercase tracking-[0.4em] text-xs hover:opacity-90 transition-opacity"
            style={{ fontFamily: "var(--hb-font-mono)" }}
          >
            Return Home
          </Link>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="text-sm pt-8"
          style={{ fontFamily: "var(--hb-font-mono)", color: "var(--hb-dark-muted)" }}
        >
          Questions? Contact us at{" "}
          <a
            href="mailto:hello@hana-bi.com"
            className="hover:opacity-80 transition-opacity"
            style={{ color: "var(--hb-sienna)" }}
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
          <p
            className="text-sm"
            style={{ fontFamily: "var(--hb-font-mono)", color: "var(--hb-dark-muted)" }}
          >
            Loading...
          </p>
        </div>
      }
    >
      <SuccessContent />
    </Suspense>
  );
}
```

- [ ] **Step 2: Verify final build**

```bash
cd c:/hana-bi && npm run build
```

Expected: build passes cleanly. All 25 static pages generated, 0 TypeScript errors.

- [ ] **Step 3: Commit**

```bash
cd c:/hana-bi && git add src/app/success/page.tsx && git commit -m "feat: success page — Cormorant headlines, DM Mono utility text"
```
