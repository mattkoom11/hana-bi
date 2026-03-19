# Hana-Bi — Visual Frontend Overhaul Design
**Date:** 2026-03-18
**Status:** Approved by user
**Scope:** Full visual redesign — dark cinematic aesthetic with selective hand-drawn elements and sienna accent unification

---

## Overview

Hana-Bi's current aesthetic is warm, soft, and editorial — paper-toned backgrounds, hand-drawn ink borders, gentle opacity treatments. The overhaul shifts the site toward a **dark cinematic** direction inspired by Japanese editorial and fashion references (evangelion.jp, claygarden.jp, milez.jp, recruit-yamaguchi-kogyo.jp, daimaru-matsuzakaya.com), while preserving the handmade identity on editorial/content pages.

**Core principle:** The site shell (header, footer) and commerce surfaces (shop, product pages, homepage hero) go dark. Editorial content surfaces (projects, about, archive, and story sections within product pages) stay light with hand-drawn elements intact. Sienna (`#9a7a5a`) is the single accent color that bridges both worlds.

---

## Design Decisions

### Direction
- Inspired by directions B (dark cinematic) and C (Japanese editorial hybrid) from the reference set
- **Mostly dark** — black/near-black is the default; light sections are intentional editorial moments
- **Hand-drawn elements selectively** — SketchFrame, InkUnderline, HandDrawnDivider, MarginNote survive only on light/editorial surfaces
- **Subtle kanji** — 花火 character appears as a ghost annotation in dark section corners at very low opacity (~7%), never as a dominant element
- **Implementation strategy: foundation-first** — color tokens and global shell (header/footer) first, then pages

---

## Color System

### New Dark Track Tokens (add to `globals.css` `:root`)

```css
--hb-dark:         #0e0c0b;   /* near-black, warm — not cold blue-black */
--hb-dark-surface: #171310;   /* slightly lighter for cards/panels on dark backgrounds */
--hb-dark-border:  rgba(250, 248, 244, 0.08);  /* subtle dividers on dark */
--hb-dark-muted:   rgba(250, 248, 244, 0.45);  /* body/secondary text on dark */
--hb-dark-kanji:   rgba(250, 248, 244, 0.07);  /* ghost 花火 annotations */
```

### Existing Tokens — Unchanged
All current tokens (`--hb-paper`, `--hb-ink`, `--hb-smoke`, `--hb-sienna`, `--hb-gold`, `--hb-border`, `--hb-tag`, `--hb-accent`) remain exactly as-is. They continue to apply on light editorial sections.

### Accent Unification
`--hb-sienna` (`#9a7a5a`) becomes the universal accent on **both** dark and light surfaces:
- Dark sections: sienna for eyebrow labels, active nav states, CTA button fills, badge backgrounds, hover borders
- Light sections: sienna continues its existing role (badges, underline accents, script labels)

---

## Root Layout Change

The root layout `div` in `src/app/layout.tsx` currently applies `bg-[var(--hb-paper)] text-[var(--hb-ink)]` globally. These must be removed — individual pages and page sections are responsible for their own backgrounds. The wrapper becomes:

```tsx
<div className="flex min-h-screen flex-col">
```

Without this change, page-level dark backgrounds will render correctly but the overall page shell will bleed the paper color in any uncovered gap (e.g., between sections or below the footer).

---

## Component Changes

### SiteHeader

**Behavior:** Transparent background, no fill. Text color adapts per route via a `useHeaderTheme` hook.

```ts
// Dark pages (home, shop, product/[slug], cart, layered-denim):
// - Nav links: --hb-dark-muted at rest, cream (#faf8f4) on hover/active
// - Active indicator: sienna InkUnderline
// - Cart button: --hb-dark-surface bg, cream text, sienna border on hover
// - Logo: cream text

// Light pages (about, projects, projects/[slug], archive):
// - Nav links: --hb-smoke at rest, --hb-ink on hover/active
// - Active indicator: sienna InkUnderline (replaces current ink InkUnderline)
// - Cart button: existing dashed border style, ink text
// - Logo: ink text
```

**`useHeaderTheme` hook** — new file `src/hooks/useHeaderTheme.ts`:
- Reads `usePathname()`
- Returns `"dark"` for: `/`, `/shop`, `/product/*`, `/cart`, `/layered-denim`
- Returns `"light"` for: `/about`, `/projects`, `/projects/*`, `/archive`
- Default: `"dark"`

**Removed:** The thin gradient bottom border. Replaced with nothing on dark pages, and `--hb-border` hairline on light pages.

### SiteFooter

- Background: `--hb-dark`
- "Study the Archive." headline: cream serif
- Body text: `--hb-dark-muted`
- Footer links: `--hb-dark-muted` at rest, cream on hover, sienna underline on hover
- Copyright line: `--hb-dark-muted` at reduced opacity
- Top border: `--hb-dark-border` hairline

### ProductCard

Add a `variant` prop: `"dark"` | `"light"`. Default: `"dark"`.

**`variant="dark"`** (used on homepage grid, shop page):
- Container background: `--hb-dark-surface`
- Image: full opacity (remove current `opacity-20` treatment if any, render at 100%)
- No SketchFrame border — clean hard edge
- Product name: cream (`#faf8f4`)
- Year/secondary text: sienna
- Technique tags: `--hb-dark-border` border, `--hb-dark-muted` text
- Hover: image scale stays, sienna bottom border slides in
- Status Badge: sienna tone

**`variant="light"`** (reserved for future use on light surfaces):
- Existing styles unchanged

### PageShell

`PageShell` is currently used by the shop page (via `ShopContent`) and the cart page. It hardcodes paper background, `PaperBackground`, `HandDrawnDivider`, and `InkUnderline`. Dark pages must not use `PageShell` as their root wrapper.

Add a `variant` prop: `"light"` (default, existing behavior) | `"dark"`.

**`variant="dark"`:**
- Background: `--hb-dark`
- No `PaperBackground`
- No `HandDrawnDivider`
- Eyebrow label: sienna
- Title: cream serif
- Intro text: `--hb-dark-muted`
- `InkUnderline` removed (or rendered with cream stroke at low opacity)

**`variant="light"`:** existing behavior unchanged — no changes to Projects, About, Archive.

### CartDrawer

`CartDrawer` can open from any page (including dark pages like shop and homepage). It must always use a dark treatment regardless of the current page — it is a floating overlay and a consistent dark style is simpler and more deliberate than switching per page.

- Background: `--hb-dark-surface`
- Item cards: `--hb-dark` background
- Item name: cream, price: sienna
- Quantity controls: `--hb-dark-border` border, cream text
- "Checkout" button: filled sienna, cream text
- Close button: `--hb-dark-muted`, cream on hover
- Overlay backdrop: `rgba(14,12,11,0.7)`
- No hand-drawn elements

### Ghost Kanji Element (花火)

The 花火 character is **not a new reusable component** — it is inline JSX placed in specific dark sections. Render it as an absolutely positioned `<span>` with `aria-hidden="true"`:

```tsx
<span
  aria-hidden="true"
  className="absolute pointer-events-none select-none font-serif"
  style={{ color: "var(--hb-dark-kanji)", fontSize: "12rem", lineHeight: 1 }}
>
  花火
</span>
```

**Used in exactly two places:**
1. Homepage hero — `bottom-8 right-8`
2. Product detail page hero image area — `top-6 right-6`

No other pages or components use this element.

### ProjectCard

No changes. `ProjectCard` is used only on light/paper pages (Projects index, Project detail) and does not receive a variant prop. The existing styles are correct.

### Badge

No structural changes. On dark surfaces, the `"sienna"` tone Badge is preferred for all status labels. Step 10 (consistency pass) audits existing Badge usage on dark surfaces to confirm contrast is acceptable — this is a visual check, not a code change.

---

## Page Designs

### Homepage (`/`)

**Section rhythm:** dark hero → light editorial → dark products → light archive

#### Hero Section (dark)
- Background: `--hb-dark`, full-bleed product image at **100% opacity** with dark gradient overlay (`linear-gradient(to top, rgba(14,12,11,0.85) 0%, rgba(14,12,11,0.3) 60%, transparent 100%)`)
- Remove current `opacity-20` on the background image
- Remove current SVG ink-stroke radiating lines overlay
- Headline: `font-serif text-7xl lg:text-[clamp(5rem,10vw,9rem)]`, cream, tight leading (`leading-[0.95]`)
- Eyebrow label: sienna, `font-script`, uppercase, wide tracking
- Ghost 花火: positioned `bottom-8 right-8`, `text-[12rem]`, color `--hb-dark-kanji`, `pointer-events-none`, `select-none`, `font-serif`
- CTAs: "Enter Shop" — filled sienna bg, cream text; "What is Hana-Bi?" — ghost cream border, cream text
- Remove current SketchFrame wrapping the featured garment panel; replace with a plain dark-surface card

#### "What is Hana-Bi?" Section (light)
- Background: `--hb-paper` (no change from current)
- HandDrawnDivider at the top seam (already exists, keep it)
- All existing hand-drawn elements, copy, and layout unchanged

#### Current Drop / Featured Products Section (dark)
- Background: `--hb-dark`
- Section heading: cream serif, sienna eyebrow
- ProductCard with `variant="dark"`
- InkUnderline under heading: cream stroke (`strokeColor` prop or CSS override), `strokeOpacity={0.25}`

#### Archive Strip Section (light)
- Background: `--hb-paper` (no change)
- HandDrawnDivider at the top seam (keep)
- SketchFrame elements restored, existing layout unchanged

---

### Shop Page (`/shop`)

- Page wrapper: `PageShell variant="dark"` (replaces current light `PageShell`)
- Page background: `--hb-dark`
- Page title / eyebrow: cream and sienna
- `ProductGrid`: renders `ProductCard` with `variant="dark"`
- `ProductFilters`: dark-themed — `--hb-dark-surface` background for filter container, sienna for active filter pills, `--hb-dark-muted` for inactive labels, `--hb-dark-border` dividers
- No hand-drawn elements on this page

---

### Product Detail Page (`/product/[slug]`)

**Top section (dark):**
- Background: `--hb-dark`
- Hero image column: full opacity, no SVG sketch border overlay, hard clean edge
- Remove the `opacity: 0.25` SVG frame path entirely
- Remove the thumbnail SVG borders (the `thumb-frame-${idx}` gradients)
- Images at 100% opacity
- Details panel: `--hb-dark-surface` background
- Headline: cream serif
- Status badge: sienna tone
- MarginNote year/pattern annotations: keep but render in sienna (`--hb-sienna`) instead of ink
- Technique tags: `--hb-dark-border` dashed border, `--hb-dark-muted` text
- Started/Completed dates: `--hb-dark-muted`
- Ghost 花火: `top-6 right-6` within the hero image area, same ghost opacity

**Bottom Story/Materials/Notes section (light):**
- Background: `--hb-paper`
- `HandDrawnDivider` at the seam between dark top and light bottom
- All SketchFrame cards, InkUnderline, hand-drawn elements restored
- Text colors revert to existing smoke/ink values
- Process Notes, Tags: unchanged

**Related Projects section (light, bottom of page):**
- This section uses `PageShell` (light variant — keep as-is)
- `ProductCard` here uses `variant="light"` — these render inside a light surface
- Do not apply dark card styles to related products in this section

---

### Projects Pages (`/projects`, `/projects/[slug]`)

**No changes.** These are editorial pages. Existing paper background, SketchFrame cards, MarginNote, InkUnderline, Badge all remain.

**Minor consistency pass only:**
- Active nav indicator in SiteHeader: sienna (from `useHeaderTheme`)
- Status badge tone: already uses sienna for "completed" — no change needed

---

### About Page (`/about`)

**No changes.** Keep entirely as-is.

---

### Archive Page (`/archive`)

**No changes.** Keep as-is — light/paper treatment.

---

### Cart Page (`/cart`)

- Replace `PageShell` wrapper with `PageShell variant="dark"` (or a plain dark wrapper if PageShell is insufficient)
- Background: `--hb-dark`
- Cart item rows: `--hb-dark-surface` cards, cream text, sienna accents
- Checkout button: filled sienna, cream text
- Remove/hide any `PaperBackground` or `HandDrawnDivider` used in the current cart page
- No hand-drawn elements

### Success Page (`/success`)

The success page has three UI states. **All three states use `--hb-dark` background:**

1. **Loading/verifying** (polling `/api/checkout/verify`, up to 5 retries): dark background, `--hb-dark-muted` loading text, sienna spinner or pulse indicator
2. **Unverified/error** ("Order not found" fallback): dark background, cream headline, `--hb-dark-muted` body text, sienna "Return to Shop" link
3. **Confirmed** (payment verified): dark background, cream confirmation headline, sienna accent, order details in `--hb-dark-muted`

No hand-drawn elements on any state.

### Layered Denim Campaign Page (`/layered-denim`)

This page renders its **own internal sticky header and footer** (not SiteHeader/SiteFooter), so the `useHeaderTheme` hook has no visual effect on it. The global SiteHeader and SiteFooter are present in the DOM above and below but are visually overridden by the page's self-contained layout.

**Treatment:** The layered-denim page is a standalone dark experience. Its existing dark background and internal navigation are already compatible with the overhaul direction. **No changes required to this page** — the internal header/footer will naturally sit within the dark page context. The global SiteHeader/SiteFooter should still render correctly since the layout wrapper's paper background is being removed (see Root Layout Change).

---

## Surface Summary

| Surface | Background | Hand-drawn elements | Accent |
|---|---|---|---|
| Header | Transparent/adaptive | No (dark pages) / No (light pages) | Sienna |
| Footer | `--hb-dark` | No | Sienna |
| Home hero | `--hb-dark` | No | Sienna |
| Home "What is Hana-Bi?" | `--hb-paper` | Yes | Sienna |
| Home product grid | `--hb-dark` | No | Sienna |
| Home archive strip | `--hb-paper` | Yes | Sienna |
| Shop | `--hb-dark` | No | Sienna |
| Product detail (top) | `--hb-dark` | No (MarginNote in sienna) | Sienna |
| Product detail (story/notes) | `--hb-paper` | Yes | Sienna |
| Projects index | `--hb-paper` | Yes | Sienna |
| Project detail | `--hb-paper` | Yes | Sienna |
| About | `--hb-paper` | Yes | Sienna |
| Archive | `--hb-paper` | Yes | Sienna |
| Cart | `--hb-dark` | No | Sienna |
| Success (all states) | `--hb-dark` | No | Sienna |
| Layered Denim | Dark (existing) | Existing | Existing |
| CartDrawer (overlay) | `--hb-dark-surface` | No | Sienna |

---

## Implementation Order (Foundation-First)

1. **Root layout** — remove `bg-[var(--hb-paper)] text-[var(--hb-ink)]` from layout wrapper
2. **Global tokens** — add dark track to `globals.css`
3. **`useHeaderTheme` hook** — new file `src/hooks/useHeaderTheme.ts`, route-based theme detection
4. **SiteHeader** — adaptive transparent header using `useHeaderTheme`
5. **SiteFooter** — dark treatment
6. **CartDrawer** — always-dark overlay treatment
7. **PageShell** — add `variant` prop
8. **ProductCard** — add `variant` prop, dark styles
9. **Homepage** — hero, product grid sections, ghost kanji
10. **Shop page** — `PageShell variant="dark"`, `ProductCard variant="dark"`, dark filters
11. **Product detail page** — dark top section, light bottom seam, related products `variant="light"`
12. **Cart page** — `PageShell variant="dark"`, dark item rows
13. **Success page** — dark treatment for all three UI states
14. **Consistency pass** — sienna accent audit across all pages, Badge contrast check on dark surfaces

---

## What Does NOT Change

- All font families (serif, sans, script) — unchanged
- All hand-drawn component logic (SketchFrame, InkUnderline, HandDrawnDivider, MarginNote, PaperBackground) — unchanged, just not rendered on dark surfaces
- All spacing/layout patterns — unchanged
- Projects, About, Archive pages — untouched
- Layered Denim page — untouched (already dark, self-contained)
- ProjectCard — no changes, light-only pages only
- Stripe/cart/checkout logic — untouched
- Shopify data fetching — untouched
