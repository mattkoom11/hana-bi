# 03 — Product detail

**Route:** `src/app/(site)/product/[slug]/page.tsx`
**Surface:** dark hero, then paper for the terms half

This is the longest screen. It has six bands, in order: hero, construction (conditional), preorder terms, materials, FAQ, drop list, related.

## Sticky nav

`ProductStickyNav` with items built from **sections that actually exist on this page**:

```ts
const navItems = [
  { label: "Materials", href: "#materials" },
  product.marker ? { label: "Construction", href: "#construction" } : null,
  { label: "FAQ", href: "#faq" },
  { label: "Drop list", href: "#drop-list" },
].filter(Boolean);
```

The source had `#story` and `#fit` anchors that were never built — links to nowhere. Do not restore them.

---

## Band 1 — Hero

```
<section class="hb-grain">
  background: rgba(14,12,11,0.85); position: relative; overflow: hidden
  > inner: padding 4rem var(--hb-gutter); max-width var(--hb-max-width); margin 0 auto
  > grid: display grid; gap 3rem; grid-template-columns 1.3fr 0.7fr; align-items start
```

### Left — imagery

`StackedImageCarousel` with `images` (falls back to `[heroImage]` when `images` is empty), click opens `ImageLightbox` at that index.

Two overlays pinned inside the image column:

- **Kanji watermark** — `花火`, `top: 1.5rem; right: 1.5rem`, `z-index: 50`, `font-size: 8rem`, `line-height: 1`, `color: var(--hb-dark-kanji)`, `aria-hidden`, non-interactive.
- **Status badge** — `top: 1.5rem; left: 1.5rem`, `z-index: 50`. `<Badge tone="sienna">` reading `Available` / `Sold Out` / `Archived`.

The badge is the one place a status badge survives, because there is only one garment on screen and no image to compare it against. In lists, status is desaturation instead.

### Right — buy panel

`position: sticky; top: 5rem`, `class="hb-grain"`, `background: var(--hb-dark-surface)`, `padding: 1.5rem`, `border: 1px solid var(--hb-dark-border)`. Inner wrapper `position: relative; z-index: 10` so the grain sits behind.

Contents, in order:

| Element | Spec |
|---|---|
| Catalogue number | mono 0.75rem uppercase · `letter-spacing: var(--hb-track-catalog)` (0.55em) · `var(--hb-sienna)` · `opacity: 0.6` |
| H1 name | display italic 300 · 2.25rem · `line-height: 1.15` · `var(--hb-on-dark)` · `margin: 1rem 0 1.5rem` |
| `Collection` label + value | label style below; value display italic 300 · 1.125rem · `margin-bottom: 1.25rem` |
| `Year` label + value | value mono 0.875rem `var(--hb-dark-muted)` |
| `Size` label + size buttons | see below |
| Size guide | `SizeGuideModal` trigger on a `var(--hb-paper)` block, `padding: 0.75rem 1rem`, `display: inline-block` |
| `AddToCartButton` | disabled until a size is picked |
| `Tags` label + tag chips | `border: 1px dashed var(--hb-dark-border)`, `padding: 0.375rem 0.75rem`, mono 0.75rem, `letter-spacing: var(--hb-track-tag)` |
| Materials cards | three `RoughBorderCard`, `padding: 1rem`, `background: var(--hb-dark-surface)`, `gap: 0.75rem` |

**Meta label style** (`Collection`, `Year`, `Size`, `Tags`) — mono · 0.75rem · uppercase · `letter-spacing: var(--hb-track-meta)` · `var(--hb-dark-muted)` · `margin: 0 0 0.5rem`.

**Size buttons** — `padding: 0.5rem 1rem`, mono 0.875rem, `border-radius: 0`, `transition: all 300ms ease`, wrap with `gap: 0.5rem`:

- unselected: `background: transparent`, `color: var(--hb-on-dark)`, `border: 1px solid rgba(250,248,244,0.5)`
- selected: `background: var(--hb-on-dark)`, `color: var(--hb-ink)`, `border: 1px solid var(--hb-on-dark)`

The materials cards use `MATERIALS_INFO` (three fixed entries: Japanese Selvedge Denim, Indigo Character, Hand Feel & Weight) — the same three on every product. Card title `--hb-font-serif` 1rem; body 0.75rem `line-height: 1.7` in `var(--hb-dark-muted)`.

---

## Band 2 — Construction (conditional)

Renders **only** when `product.marker` is set. Currently that is Midnight Reed Denim alone. Full spec in `components/construction-gallery.md`.

Do not fake this section for garments without a marker. A construction gallery built from invented piece names would be the single most damaging thing you could add to this site — the whole register depends on the numbers being real.

---

## Band 3 — Preorder terms

`background: rgba(245,242,237,0.94)`, `padding: 4rem var(--hb-gutter) 1.5rem`, inner `max-width: 42rem; margin: 0 auto`.

Eyebrow `Preorder` — mono 0.75rem uppercase `var(--hb-track-nav)` `var(--hb-smoke)`.
H2 — `--hb-font-serif` 1.875rem, `var(--hb-ink)`, `margin: 0.75rem 0 2rem`:

> Made to order — no excess, no waste.

Three paragraphs, `gap: 1.25rem`, 1rem/1.7 in `var(--hb-ink)` — copy final:

1. Every piece on this site is a preorder. When you purchase, your payment goes directly toward sourcing materials and manufacturing your garment. Nothing is produced speculatively.
2. Production only begins once we reach a minimum number of orders. If that threshold isn't met, you will be fully refunded — no questions asked.
3. Once production begins, your garment is cut, sewn, and shipped to you in **3–4 months**. *(bold on the duration)*

## Band 4 — Materials tags

`#materials` · same paper background · `padding: 0.75rem var(--hb-gutter)` · inner `max-width: 56rem`, `flex-wrap: wrap`, `gap: 0.75rem` · `product.tags` rendered as `<Tag>` (pill).

## Band 5 — FAQ

`#faq` · paper · `padding: 2.5rem var(--hb-gutter)` · inner `max-width: 42rem` · `FAQAccordion` with three items:

- **When does my order ship?** — Your garment is cut, sewn and shipped 3–4 months after production begins.
- **What if the minimum isn't met?** — You are fully refunded — no questions asked.
- **How should I care for it?** — `product.care` (per-garment, from the data).

## Band 6 — Drop list

`#drop-list` · paper · `padding: 1.5rem var(--hb-gutter) 4rem` · inner `max-width: 42rem`, centred.

Eyebrow `Stay in the Loop` (mono, `opacity: 0.7`) → `InkUnderline width={80} variant="delicate" strokeOpacity={0.3}` → H2 `Join the Drop List` (`--hb-font-serif`, italic, 300, 2rem) → line `Be the first to know about future releases and updates.` → `ScribbleArrow direction="down" size={28} strokeOpacity={0.4}` → `EmailCaptureForm`.

This band carries three hand-drawn ornaments. They are the untested part of the system (see `CLAUDE.md`, Open question). Implement as-is; flag rather than silently drop.

## Band 7 — Related

Only when related items exist. `PageShell` with `eyebrow="From the archive"`, `title="You may also like"`, intro *"Pieces that share fabrication notes or silhouettes with this garment."*

Grid: `gap: var(--hb-grid-gap)`, `repeat(auto-fill, minmax(min(100%, 18rem), 1fr))`, `ProductCard variant="light"`.

Related = `products.filter(p => p.slug !== product.slug && p.status === "available").slice(0, 3)`. Note it is not actually matched on fabrication despite the copy — a real similarity match would be an improvement, and would make the intro line true.

---

## State

| Variable | Notes |
|---|---|
| `size` | `null` until picked; gates `AddToCartButton` |
| `lightboxIndex` | `number \| null` |

`product` resolves from `slug`. Use `notFound()` on a missing slug rather than falling back to the first product.

## Responsive

The hero grid `1.3fr 0.7fr` needs to collapse to one column below ~900px, with the buy panel losing `position: sticky` (a sticky panel in a single column pins over the images as you scroll). Construction grid has its own breakpoint via the `.hb-construction` class — see that spec.
