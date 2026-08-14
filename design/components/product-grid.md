# ProductGrid, ProductCard, ProductFilters

**Sources:** `components/shop/{ProductGrid,ProductCard,ProductFilters}.jsx`
**Used by:** Shop (all three), Product related band (`ProductCard` only)
**Suggested paths:** `src/components/shop/` — `ProductCard` and `ProductFilters` are client components

All three were rebuilt in the subtraction pass. `ProductCard` lost the most of any component on the site.

---

## ProductCard

### What was removed

The old card lifted on hover, rotated 0.3°, dropped a wispy shadow, drew a hand-sketched SVG frame on paper surfaces, printed a script margin note, and stacked two badges over the image.

All of it. What remains: one image, one name, one price, one line.

The reasoning, worth keeping in the file as a comment: a garment you are about to spend $640 on should be **shown**, not decorated. Every removed element was competing with the photograph for attention.

### Props

```ts
{
  product: Product;
  variant?: "dark" | "light";   // default "dark"
  catalogIndex?: number;        // fallback only
  onOpen?: (product) => void;
}
```

### Anatomy

Root is an `<a href={"/product/" + product.slug}>`:

```css
display: flex; flex-direction: column; gap: 1rem;
opacity: 0.86;                        /* → 1 on hover */
transition: opacity 400ms ease;
```

The whole card lifts from 0.86 to 1 on hover. That is the entire hover treatment — no transform on the card itself.

**Image plate** — `class="hb-grain"` on dark:

```css
position: relative; width: 100%; aspect-ratio: 4 / 5; overflow: hidden;
background: var(--hb-dark-surface) | var(--hb-paper-muted);
```

Image inside, `position: absolute; inset: 0`, `object-fit: cover`:

```css
filter: grayscale(1);                 /* when status !== "available" */
transform: scale(1);                  /* → scale(1.03) on hover */
transition: transform 900ms var(--hb-ease-expo-out);
```

**Status is desaturation, not a badge.** Sold-out and archived pieces go greyscale, so status is read from the image itself rather than from a chip pinned over it. This is a system-wide rule — see `CLAUDE.md`.

**Broken-image fallback.** On `onError`, set a `broken` flag and render, inside the plate at `align-items: flex-end; padding: 1rem`, a mono `var(--hb-label-2xs)` uppercase label in `dim`:

```
{statusLabel} — image missing
```

Keep this. Six of six garments are currently Unsplash placeholders, and a failed load degrades to a legible catalogue state instead of a blank box.

**Meta block** — `display: flex; flex-direction: column; gap: 0.5rem`:

| Element | Spec |
|---|---|
| Catalogue number | mono · `var(--hb-label-3xs)` (0.55rem) · uppercase · `letter-spacing: var(--hb-track-catalog)` · `var(--hb-sienna)` on dark, `dim` on light |
| Name | display italic 300 · 1.5rem · `line-height: 1.2` · `fg` |
| Meta line | see below |

Meta line — `display: flex; justify-content: space-between; gap: 1rem`, mono 0.75rem uppercase, `letter-spacing: var(--hb-track-meta)`, `color: dim`, `border-top: 1px solid {line}`, `padding-top: 0.75rem`:

- left: `product.sizes.join(" · ")`
- right: formatted price in `fg`, or `Sold out` / `Archived` in `dim` when unavailable

Price switching to a status word in the same slot is why no badge is needed.

### Catalogue number

```ts
const number = product.catalogNumber
  ?? (catalogIndex !== undefined ? "HB-" + String(catalogIndex + 1).padStart(3, "0") : null);
```

Record first, position second. A catalogue number is an identity and must not change when a filter does — `catalogIndex` is a fallback for data without one, not the primary path.

---

## ProductGrid

```css
display: grid;
gap: var(--hb-grid-gap);                                      /* 1.5rem */
grid-template-columns: repeat(auto-fill, minmax(min(100%, 18rem), 1fr));
```

`min(100%, 18rem)` is what makes this responsive with no media query — the track floor collapses to container width on narrow viewports instead of forcing horizontal overflow.

Empty state, mono 0.875rem in `dim`:

> No garments match these filters yet.

Passes `catalogIndex={index}` down, which only matters for data without a `catalogNumber`.

---

## ProductFilters

### What was removed

A bordered surface panel wrapping two native `<select>` menus. A filter row that looks like a form control reads as software, not as a catalogue.

Now: one row of mono chips per facet, **every option visible**. No dropdowns anywhere in this system.

### Props

```ts
{
  tags?: string[]; sizes?: string[];
  selectedTag?: string | null;
  selectedSize?: string | null;
  availability?: "available" | "archived" | "all";
  onTagChange, onSizeChange, onAvailabilityChange;
  variant?: "dark" | "light";
}
```

### Chip

```css
font-family: var(--hb-font-mono);
font-size: 0.7rem;
text-transform: uppercase;
letter-spacing: var(--hb-track-meta);      /* 0.3em */
padding: 0.5rem 0.875rem;
background: transparent;
border-radius: 0;
border: 1px solid var(--hb-sienna) | {line};        /* on | off */
color: var(--hb-on-dark) / var(--hb-ink) | {dim};   /* on | off */
transition: border-color 300ms ease, color 300ms ease;
```

Selected state is a sienna border and brightened text. No fill — a filled chip would compete with the checkout button for "the one filled element."

### Rows

Container `display: flex; flex-direction: column; gap: 0.75rem`. Each row `display: flex; flex-wrap: wrap; gap: 0.5rem`.

1. **Availability** — `Available` / `Archived` / `All`. Radio behaviour, no label.
2. **Category** — `Category` rule label + tag chips. Rendered only when `tags.length > 0`.
3. **Size** — `Size` rule label + size chips. Rendered only when `sizes.length > 0`.

**Rule label** style: mono, 0.6rem, uppercase, `letter-spacing: var(--hb-track-catalog)` (0.55em), `color: dim`, `opacity: 0.7`, `align-self: center`, `padding-right: 0.25rem`.

Tag and size chips toggle off when re-clicked; availability does not.

### Chip derivation — do not skip

Tag and size chips must be derived from the products the availability filter currently shows, not from the whole catalogue. Full code in `screens/02-shop.md`. Two problems it solves: no chip that leads to an empty grid, and no thirty-chip wall above four products.
