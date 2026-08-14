# 01 — Home

**Route:** `src/app/(site)/page.tsx`
**Surface:** dark, over the site-wide video background

## Purpose

State what Hana-Bi is, show the work being made, and list what is currently buyable. Three acts, no more.

## What was cut

The old homepage ran a kanji particle canvas, a 3D tilt stage, depth and parallax layers, a cursor spotlight, `CulturalExplainer`, `MorphingKanji`, `RollText`, and a single featured-product card. All removed. What remains: one headline over footage, one turning object, one index.

Do not reintroduce any of it. The subtraction was tested against the alternative and approved.

---

## Act 1 — Hero

```
<section>
  min-height: 76vh
  display: flex; align-items: center
  padding: 4rem var(--hb-gutter)
  position: relative; overflow: hidden
```

**Kanji watermark** — `aria-hidden`, absolutely positioned, non-interactive:

- content `花火`
- `bottom: -0.12em; right: -0.02em`
- `font-family: var(--hb-font-kanji)` (Spectral)
- `font-size: clamp(9rem, 26vw, 22rem)`, `line-height: 0.9`
- `color: var(--hb-dark-kanji)` — `rgba(250,248,244,0.07)`
- `user-select: none; pointer-events: none`

**Content column** — `position: relative; z-index: 2; max-width: 58rem`:

| Element | Spec |
|---|---|
| Eyebrow | `HB — Editions of Denim` · mono · 0.75rem · uppercase · `letter-spacing: var(--hb-track-eyebrow)` (0.5em) · `var(--hb-sienna)` · `margin: 0` |
| H1 | display italic 300 · `var(--hb-display-hero)` = `clamp(2.5rem, 7vw, 7rem)` · `line-height: 0.92` · `letter-spacing: -0.01em` · `var(--hb-on-dark)` · `margin: 2.5rem 0` · `text-wrap: balance` |
| Intro | `var(--hb-body-lg)` 1.125rem · `line-height: 1.7` · `var(--hb-dark-muted)` · `max-width: 34rem` |
| CTA row | `display: flex; gap: 1rem; flex-wrap: wrap; padding-top: 2.5rem` |

**H1 copy** — animated per character:

> Archival garments documented like museum pieces.

Uses `SplitText` with `charDelay={35}` (ms stagger per character). Each character animates via `@keyframes hb-split-char-in`: `opacity 0 → 1`, `translateY(0.35em) → 0`, `rotate(1.5deg) → 0`. Ship this as a small client component; it is the one piece of entrance animation on the page.

**Intro copy:**

> Hana-Bi traces Japanese magazine spreads and gothic annotations to tell the story of sustainable denim. Limited drops move swiftly from studio floor to archive shelves.

**CTAs** — both mono, 0.75rem, uppercase, `letter-spacing: var(--hb-track-nav)` (0.4em), `padding: 1rem 2rem`, `transition: opacity 300ms ease, border-color 300ms ease, color 300ms ease`:

- Primary — `Enter Shop` → `/shop`. `background: var(--hb-sienna)`, `color: var(--hb-on-dark)`, `opacity: 0.9` rising to `1` on hover.
- Secondary — `What is Hana-Bi?` → `/about`. `border: 1px solid var(--hb-dark-border)` → `var(--hb-sienna)` on hover; `color: var(--hb-dark-muted)` → `var(--hb-on-dark)` on hover.

---

## Act 2 — Process story

A `ScrollStage` (see `components/scroll-stage.md`) with four steps and a per-step `TurntableObject` centre. Replaces the old kanji-etymology sequence: the etymology explained the name, this explains the work.

`variant="dark"`. The centre for step *i* is:

```jsx
<TurntableObject
  patternUrl="/patterns/AX100-SELF-36.json"
  pieceName={PIECES[i]}
  size={560}
  speed={0.16}
  style={{ opacity: 0.92 }}
/>
```

`PIECES = ["1 FT-2S", "8 BK PKT PTCH-2S", "7 BK YOKE-2S", "5 LT FT BTN FLY-1S"]` — real piece labels from the production marker, so the geometry on screen changes as the story moves.

### The four steps — copy is final

**01 — Draft** · *It starts in pencil.*
Pattern paper, a rule, and a hand-made block. Every project starts with a pattern which outlines the DNA of the garment.
*Caption:* `Piece 1 — front, cut 2 self · 44.24 × 14.05 in`

**02 — Pattern** · *Paper becomes shape.*
Panels are cut, notched and labelled. Ranging from extravagant designs to humble blueprints, there is no end to what Hana-Bi is willing to create.
*Caption:* `Piece 8 — back patch pocket, cut 2 self`

**03 — Fabric** · *Shape becomes cloth.*
The block is laid on the bolt and traced. Fabric is sourced only from the best international mills.
*Caption:* `Piece 7 — back yoke, cut 2 self · 3.44 × 11.01 in`

**04 — Machine** · *Cloth becomes garment.*
Cut panels go under the needle. Manufacturing is taken north to New York, where the Garment District hosts a web of dreams.
*Caption:* `Piece 5 — left front button fly, cut 1`

---

## Act 3 — Current edition

```
<section class="hb-grain">
  padding: 6rem var(--hb-gutter)
  background: rgba(14,12,11,0.72)
  > div: position: relative; z-index: 1; max-width: var(--hb-max-width) (80rem); margin: 0 auto
```

| Element | Spec |
|---|---|
| Eyebrow | `Edition 04 — Available` · mono 0.75rem uppercase · `var(--hb-track-eyebrow)` · `var(--hb-sienna)` |
| H2 | display italic 300 · `clamp(2rem, 4vw, 3.25rem)` · `line-height: 1.05` · `var(--hb-on-dark)` · `margin: 1.5rem 0 3.5rem` |
| Index | `CatalogueIndex` · `variant="dark"` · `columns={["collection", "year"]}` |

**H2 is computed, not static.** It counts available garments and spells the number as a word:

```
COUNT_WORD = ["No","One","Two","Three","Four","Five","Six","Seven","Eight"]
`${COUNT_WORD[n] ?? n} garment${n === 1 ? ", currently open." : "s, currently open."}`
```

At the current data (three available) this renders *"Three garments, currently open."* Keep the word-spelling — a numeral here reads as a dashboard.

Items are `products.filter(p => p.status === "available")` mapped to `{ ...p, image: p.heroImage }`. Row click navigates to `/product/[slug]`.

---

## State

- `hovered: string | null` — which CTA is hovered
- Scroll container passed to `ScrollStage` as `scrollTarget` (optional — falls back to `window`).

No data fetching beyond the existing Stripe-catalog-with-fallback pattern already used elsewhere in the app.

## Responsive

Not yet built; desktop-first. Intended behaviour:

- Hero `min-height` drops to `70svh` on mobile. Use `svh`, not `vh` — mobile browser chrome makes `vh` overshoot.
- `ScrollStage` steps: `font-size` already uses `clamp`, so the headline is fine; reduce `TurntableObject` `size` to ~320 below 640px.
- `CatalogueIndex` needs its own mobile treatment — see that component's spec.
