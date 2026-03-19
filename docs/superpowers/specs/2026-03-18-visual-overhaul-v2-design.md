# Visual Overhaul v2 — Design Spec

## Goal

Redo the Hana-Bi visual overhaul using the frontend-design aesthetic philosophy: distinctive typography, grain texture, catalog numbering, and refined motion. Same 13-file scope as the previous overhaul, but built for memorability rather than spec compliance.

## Design Direction

**B+C hybrid — Luxury Dark Atelier + Architectural Grid**

Dark luxury atelier feel (textured, refined, understated) combined with a contemporary catalog/grid system (numbered pieces, architectural layouts). Feels like a high-end Japanese fashion house crossed with a contemporary art gallery.

## Typography System

**Display font:** Cormorant Garamond (Google Fonts)
- Weights: 300 normal, 300 italic, 400 normal, 400 italic
- Used for: all headings, product names, site name, success page headlines
- Style: italic, weight 300 as the primary expression

**Utility font:** DM Mono (Google Fonts)
- Weight: 300
- Used for: all eyebrows, nav links, labels, prices, catalog numbers, button text, filter controls, order IDs, copyright
- Tracking: 0.3em–0.55em uppercase throughout

**Body font:** existing `--font-hanabi-sans` (unchanged)

**New CSS tokens:**
```css
--hb-font-display: 'Cormorant Garamond', Georgia, serif;
--hb-font-mono:    'DM Mono', 'Courier New', monospace;
```

## Color Palette

Unchanged from v1 overhaul:
- `--hb-dark: #0e0c0b` — primary dark background
- `--hb-dark-surface: #171310` — elevated surfaces, cards
- `--hb-dark-border: rgba(250,248,244,0.08)` — subtle borders
- `--hb-dark-muted: rgba(250,248,244,0.45)` — secondary text
- `--hb-dark-kanji: rgba(250,248,244,0.07)` — ghost 花火
- `--hb-sienna: #9a7a5a` — accent (muted sienna, existing value in globals.css — do not change)
- `#faf8f4` — cream, hardcoded on dark surfaces

## Grain Texture

All dark surfaces get a CSS grain overlay via a `.grain` utility class using an SVG `feTurbulence` noise filter at ~5.5% opacity. Applied as a `::after` pseudo-element so it never interferes with interactive children.

```css
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

Applied to: hero section, dark PageShell sections, CartDrawer panel, featured garment card, ProductCard image container (dark variant), details panel on product page, success page confirmed state.

**Stacking context:** All interactive children inside a `.grain` element must have `className="relative z-10"` to render above the `::after` grain layer. Specifically: all `<button>`, `<a>`, and text content blocks inside CartDrawer, PageShell, and the product detail panel must carry `relative z-10`.

## Catalog Numbering System

Products displayed with catalog numbers in the format `HB-XXX` (zero-padded to 3 digits, e.g. `HB-001`, `HB-002`). Purely presentational — not stored in data.

**ProductCard / ProductGrid:** The number is the post-filter display index (position 0 in the rendered array = `HB-001`). `ProductGrid` passes `catalogIndex={index}` from its `.map((product, index) => ...)`. `ProductCard` receives `catalogIndex?: number` and renders `HB-${String((catalogIndex ?? 0) + 1).padStart(3, "0")}`. If `catalogIndex` is undefined, render nothing.

**Homepage featured garment card:** Always hardcoded to `HB-001` — it is the hero piece, first in the featured array.

**Product detail page (`/product/[slug]`):** Fetch `products` from `@/data/products` (the full static array), find `products.findIndex(p => p.slug === params.slug)`, format as `HB-XXX`. If not found (Shopify-only product), omit the catalog number eyebrow entirely.

- Displayed in DM Mono above product images on ProductCard
- Displayed as the eyebrow on the product detail page dark section (when found)
- Displayed in the hero featured garment card (hardcoded `HB-001`)

## Font Import

The existing `layout.tsx` uses `next/font/google` for Spectral, Inter, and Kalam. Cormorant Garamond and DM Mono must be loaded the same way to match the project pattern and get Next.js font optimization (preloading, `font-display: swap`, no FOUT).

Add to `src/app/layout.tsx`:
```tsx
import { Cormorant_Garamond, DM_Mono } from "next/font/google";

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

Inject both CSS variables into `<body>` alongside the existing font variables:
```tsx
<body className={`${existingFonts.variable} ${cormorant.variable} ${dmMono.variable}`}>
```

Then in `globals.css`, reference via the injected CSS variables:
```css
--hb-font-display: var(--font-cormorant), Georgia, serif;
--hb-font-mono:    var(--font-dm-mono), 'Courier New', monospace;
```

## Motion

**Staggered entry on product detail page:** The current page is an async Server Component — adding Framer Motion directly would require `"use client"` which breaks `generateStaticParams` and `generateMetadata`. Instead, extract the animated section into a new Client Component:

Create `src/components/product/ProductDetailHero.tsx` (new file, `"use client"`):
- Receives `product` and `catalogNumber` as props
- Contains the Framer Motion wrappers: image fades+slides from left (`x: -20, opacity: 0`), details panel from right (`x: 20, opacity: 0`), `delay: 0.15` stagger, `duration: 0.6`
- The Server Component page (`product/[slug]/page.tsx`) imports and renders `<ProductDetailHero>` passing resolved product data

**ProductCard hover (dark variant) — CSS only, no Framer Motion:**
- Catalog number: `opacity-[0.35] group-hover:opacity-100 transition-opacity duration-400`
- Sienna rule: `scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-400` (Tailwind CSS transform, no JS needed)
- ProductCard stays a pure function component with no `"use client"` requirement

**No new animations elsewhere** — existing hover-wispy and page-transition classes are sufficient.

## Component Specs

### SiteHeader
- Site name "Hana-Bi" → `font-family: var(--hb-font-display)`, italic, ~1.1rem, weight 300
- Nav links → `font-family: var(--hb-font-mono)`, 0.55rem, tracking-[0.4em], uppercase
- Cart button (dark pages) → DM Mono label, `--hb-dark-surface` bg, sienna text
- Cart button (light pages) → DM Mono label, dashed border
- Active route indicator → sienna InkUnderline (unchanged mechanism)

### SiteFooter
- "Study the Archive." → `font-family: var(--hb-font-display)`, italic, ~3rem, weight 300
- Footer links → `font-family: var(--hb-font-mono)`, tracked uppercase
- Copyright → DM Mono, opacity 0.4

### ProductCard
**Dark variant:**
- Catalog number `HB-XXX` → DM Mono, 0.55rem, tracked, `--hb-dark-muted` (brightens on hover)
- Product name → Cormorant italic, 1.4rem
- Price → DM Mono
- Tag pill → DM Mono, `--hb-dark-border`
- Grain class on image container
- Sienna bottom rule on hover (scaleX animation)

**Light variant:**
- Catalog number `HB-XXX` → DM Mono, 0.55rem, tracked, `--hb-smoke` opacity 0.5
- Product name → Cormorant italic
- Existing hand-drawn SVG frame on hover
- Existing MarginNote annotation

### ProductGrid
- Passes `index` to ProductCard for catalog number generation
- ProductCard receives optional `catalogIndex?: number` prop

### ShopContent / ProductFilters
- All filter labels, select text, button text → DM Mono
- No structural changes

### PageShell
- Title → `font-family: var(--hb-font-display)`, italic, weight 300, 5xl–7xl
- Eyebrow → `font-family: var(--hb-font-mono)`, 0.55rem, tracked
- Dark variant: grain class on section wrapper
- Light variant: unchanged (PaperBackground, HandDrawnDivider, InkUnderline)

### CartDrawer
- Panel: grain class
- Item names → Cormorant italic
- Size / qty / labels → DM Mono
- "Checkout" button → DM Mono, sienna bg
- "Close" button → DM Mono

## Page Specs

### Homepage (`src/app/page.tsx`)
Dark/light/dark/light rhythm retained. Changes:
- Hero headline → Cormorant italic at `clamp(4rem, 10vw, 8rem)`, weight 300, line-height 0.92
- Hero eyebrow → DM Mono `HB — EDITIONS OF DENIM`
- CTAs → DM Mono uppercase (sienna filled + ghost border)
- Featured garment card → grain class, DM Mono `HB-001` catalog number, Cormorant product name
- Ghost 花火 at `bottom-8 right-8` retained
- Current Drop section: catalog numbers on ProductCards

### Shop page (`src/app/shop/page.tsx`)
- `PageShell variant="dark"` with DM Mono eyebrow, Cormorant italic title
- `ShopContent variant="dark"` — ProductGrid passes indexes for catalog numbers

### Product Detail (`src/app/product/[slug]/page.tsx`)
- Dark top section: DM Mono catalog number as eyebrow (`HB-XXX`)
- Product name → Cormorant italic, ~5xl
- Details panel: grain class, DM Mono labels, Cormorant collection name, DM Mono price
- Staggered Framer Motion entry: image fades+slides from left (x: -20), panel from right (x: 20), delay 0.15s stagger
- Ghost 花火 at `top-6 right-6` retained
- Light story section: Cormorant headings on SketchFrame sections, unchanged structure
- Related products: `ProductCard variant="light"` with catalog numbers

### Cart (`src/app/cart/page.tsx`)
- `PageShell variant="dark"`, Cormorant italic title
- Item names → Cormorant italic
- Size / qty / price → DM Mono
- Checkout button → DM Mono

### Success (`src/app/success/page.tsx`)
- All 4 states dark (unchanged from v1)
- "Order Confirmed" → Cormorant italic, ~5xl
- DM Mono for status text, order ID (fits naturally as monospace)
- Verification retry logic preserved exactly

## File Map

**Create:**
- `src/components/product/ProductDetailHero.tsx` — `"use client"` component with Framer Motion staggered entry for product detail page

**Modify:**
- `src/app/layout.tsx` — add Cormorant Garamond + DM Mono via `next/font/google`, inject CSS variables into `<body>`
- `src/app/globals.css` — add `--hb-font-display`, `--hb-font-mono` tokens + `.grain` utility class
- `src/components/layout/SiteHeader.tsx` — Cormorant site name, DM Mono nav
- `src/components/layout/SiteFooter.tsx` — Cormorant headline, DM Mono links
- `src/components/cart/CartDrawer.tsx` — Cormorant item names, DM Mono labels, grain
- `src/components/layout/PageShell.tsx` — Cormorant title, DM Mono eyebrow, grain on dark variant
- `src/components/shop/ProductCard.tsx` — catalog number prop, Cormorant name, DM Mono price/tags, grain
- `src/components/shop/ProductGrid.tsx` — pass index as catalogIndex to ProductCard
- `src/components/shop/ShopContent.tsx` — unchanged except passing variant through (already done)
- `src/components/shop/ProductFilters.tsx` — DM Mono labels
- `src/app/page.tsx` — Cormorant hero, DM Mono eyebrow/CTAs, catalog number on featured card, grain
- `src/app/shop/page.tsx` — minimal (variant already set)
- `src/app/product/[slug]/page.tsx` — catalog number eyebrow, Cormorant name, staggered motion, grain on panel
- `src/app/cart/page.tsx` — Cormorant title, DM Mono items
- `src/app/success/page.tsx` — Cormorant headline, DM Mono utility text

## What Changes vs v1

| Area | v1 | v2 |
|---|---|---|
| Display font | project serif (`--font-hanabi-serif`) | Cormorant Garamond italic 300 |
| Utility font | project script (`--font-hanabi-script`) | DM Mono 300 |
| Dark surface texture | flat color | flat color + SVG grain |
| Product identity | name only | catalog number (HB-001) + name |
| Motion | none beyond existing CSS | staggered Framer Motion on product detail |
| Card hover | sienna rule | sienna rule + catalog number brightens |
