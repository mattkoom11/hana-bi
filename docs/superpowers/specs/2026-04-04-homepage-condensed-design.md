# Homepage Condensed — Design Spec
**Date:** 2026-04-04
**Status:** Approved by user

---

## Overview

The home page is redesigned to let the ambient video background run continuously through all four content sections. All opaque section backgrounds are removed, padding is tightened, and light-section components that assumed a paper background (`PaperBackground`, `HandDrawnDivider`) are stripped out. Text colors in formerly-light sections shift to light cream/muted to stay legible over the dark video overlay.

One structural change to the hero: the full-bleed product image is replaced with a contained portrait card in the right column, so the video shows through the rest of the hero area.

---

## File Changed

| File | Action |
|------|--------|
| `src/app/page.tsx` | Modify — remove opaque backgrounds, condense padding, fix text colors, hero image to right column |

No other files are touched. `PaperBackground`, `HandDrawnDivider`, `InkUnderline`, and `SketchFrame` components are imported today; after this change `PaperBackground` and `HandDrawnDivider` are no longer used in this file and their imports are removed.

---

## Hero Section

**Current:** Full-bleed `<Image>` as `absolute inset-0` background, `bg-[var(--hb-dark)]` on the section.

**New:**
- Section: `bg-transparent` — remove both `bg-[var(--hb-dark)]` and `grain` from the section className
- Remove the `<div className="absolute inset-0 w-full h-full">` image block entirely
- Grid becomes `lg:grid-cols-[1.1fr_0.9fr]` (unchanged) — left column has text + CTAs, right column has the product portrait card
- Right column product card:
  - `relative overflow-hidden` wrapper with `aspect-[3/4]` and `border border-[var(--hb-dark-border)]`
  - `<Image fill className="object-cover" />` of `heroFeature.heroImage`
  - Thin dark gradient overlay at bottom: `linear-gradient(to top, rgba(14,12,11,0.6) 0%, transparent 60%)`
  - Catalog number and garment name overlaid at the bottom of the image: move the `HB-001` `<p>` and the `heroFeature.name` `<h2>` from the existing card block into the image wrapper div, positioned `absolute bottom-4 left-4`. The catalog number remains hardcoded `HB-001`. The `heroFeature.story` paragraph and "View Piece" link are removed from this card — the image with name label is sufficient.
  - The outer `grain bg-[var(--hb-dark-surface)] p-6 border border-[var(--hb-dark-border)]` card wrapper is removed; the image card is bare.
- `花火` ghost kanji stays
- `min-h-[85vh]` unchanged

---

## "What is Hana-Bi?" Section

**Current:** `<PaperBackground>` wrapper, `HandDrawnDivider` at top, `py-24`.

**New:**
- Remove `<PaperBackground>` wrapper — section becomes `bg-transparent`
- Remove `<HandDrawnDivider>` entirely
- `py-24` → `py-16`
- Eyebrow `text-[var(--hb-smoke)]` → `text-[var(--hb-sienna)]` (matches dark section eyebrow style)
- `h3` add `text-[#faf8f4]` (was inheriting dark color from paper context)
- Body paragraph `text-[var(--hb-smoke)] opacity-85` → `text-[var(--hb-dark-muted)]`
- `InkUnderline` stays

---

## "Current Drop" Section

**Current:** `bg-[var(--hb-dark)] grain`, `py-24`.

**New:**
- `bg-transparent`, remove `grain`
- `py-24` → `py-16`
- All text colors already light (designed for dark bg) — no changes needed
- `ProductCard` components unchanged

---

## "Archive Strip" Section

**Current:** `<PaperBackground>` wrapper, `HandDrawnDivider` at top, `py-24`.

**New:**
- Remove `<PaperBackground>` wrapper — section becomes `bg-transparent`
- Remove `<HandDrawnDivider>` entirely
- `py-24` → `py-16`
- Eyebrow `text-[var(--hb-smoke)]` → `text-[var(--hb-sienna)]`
- `h3` add `text-[#faf8f4]`
- Body text inside `SketchFrame` cards: `text-[var(--hb-smoke)] opacity-80` → `text-[var(--hb-dark-muted)]`
- Year label `text-[var(--hb-smoke)]` → `text-[var(--hb-sienna)]`
- `SketchFrame` `strokeOpacity` stays — the frame borders use `var(--hb-border)` internally; pass `className="border-[var(--hb-dark-border)]"` if the component supports it, otherwise leave as-is (subtle border on dark bg is acceptable)
- `InkUnderline` stays
- "Enter Archive" link: `border-dashed border-[var(--hb-border)]` → `border-dashed border-[var(--hb-dark-border)]`, `opacity-70 hover:opacity-100` unchanged

---

## Unused Imports

After these changes, `PaperBackground` and `HandDrawnDivider` are no longer used in `page.tsx`. Remove both imports.
