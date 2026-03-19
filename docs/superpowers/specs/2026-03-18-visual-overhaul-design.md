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

### Badge

No structural changes. On dark surfaces, the `"sienna"` tone Badge is preferred for all status labels.

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

### Cart Page (`/cart`) and Success Page (`/success`)

- Background: `--hb-dark`
- Cart item rows: `--hb-dark-surface` cards, cream text, sienna accents
- Checkout button: filled sienna
- No hand-drawn elements

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
| Cart / Success | `--hb-dark` | No | Sienna |

---

## Implementation Order (Foundation-First)

1. **Global tokens** — add dark track to `globals.css`
2. **`useHeaderTheme` hook** — new file, route-based theme detection
3. **SiteHeader** — adaptive transparent header
4. **SiteFooter** — dark treatment
5. **Homepage** — hero, product grid sections
6. **ProductCard** — add `variant` prop, dark styles
7. **Shop page** — dark background, pass `variant="dark"` to grid
8. **Product detail page** — dark top, light bottom seam
9. **Cart / Success pages** — dark treatment
10. **Consistency pass** — sienna accent audit across all remaining pages

---

## What Does NOT Change

- All font families (serif, sans, script) — unchanged
- All hand-drawn component logic (SketchFrame, InkUnderline, HandDrawnDivider, MarginNote, PaperBackground) — unchanged, just not rendered on dark surfaces
- All spacing/layout patterns — unchanged
- Projects, About, Archive pages — untouched
- Stripe/cart/checkout logic — untouched
- Shopify data fetching — untouched
