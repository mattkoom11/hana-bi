# 02 — Shop

**Route:** `src/app/(site)/shop/page.tsx` (+ `ShopContent` client component)
**Surface:** dark, inside `PageShell`

## Purpose

Browse and filter what is currently for sale. This is the one place a grid is correct.

## The index / grid distinction — read this first

Home and Archive list records as a `CatalogueIndex`: numbered rows, type only. Shop uses a **grid** of images. This is deliberate, not an inconsistency.

The reasoning: an index is how you read a record; a grid is how you look at something you are about to spend $640 on. Do not unify the two. If a future task asks to "make Shop consistent with Archive," the answer is that they are consistent — in vocabulary, not in layout.

## Shell

```jsx
<PageShell
  variant="dark"
  eyebrow="Shop"
  title="Limited garments, ready to study."
  intro="All pieces are made to order. Preorder opens soon — join the waitlist and your payment funds the materials and manufacturing. Garments ship in 3–4 months."
>
```

Body is a single column: `display: flex; flex-direction: column; gap: 3rem` — filters, then grid.

## Filters

`ProductFilters` with `variant="dark"`. See `components/product-grid.md` for the chip spec. Three rows, all chips visible:

1. Availability — `Available` / `Archived` / `All`. Default `available`.
2. Category — derived from tags, prefixed by a `Category` rule label.
3. Size — derived from sizes, prefixed by a `Size` rule label, sorted.

### Chip derivation — the important detail

Tag and size chips are derived from **`inScope`**, not from all products:

```ts
const inScope = products.filter(p =>
  availability === "available" ? p.status === "available"
  : availability === "archived" ? p.status !== "available"
  : true
);
const tags = [...new Set(inScope.flatMap(p => p.tags))];
const sizes = [...new Set(inScope.flatMap(p => p.sizes))].sort(sizeOrder);
```

Two problems this solves: no chip that leads to an empty grid, and no wall of thirty chips above four products. Deriving from the full catalogue instead is the obvious implementation and it is wrong.

**Size sort** — alpha sizes first in `["XS","S","M","L","XL","One Size"]` order, then numeric ascending:

```ts
const SIZE_ORDER = ["XS","S","M","L","XL","One Size"];
const ai = SIZE_ORDER.indexOf(a), bi = SIZE_ORDER.indexOf(b);
if (ai !== -1 || bi !== -1) return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
return Number(a) - Number(b);
```

Note the catalogue mixes waist sizes (`24`–`34`), letter sizes and `One Size`, so both branches are exercised by real data.

## Grid

`ProductGrid` with `variant="dark"`:

```css
display: grid;
gap: var(--hb-grid-gap);                                  /* 1.5rem */
grid-template-columns: repeat(auto-fill, minmax(min(100%, 18rem), 1fr));
```

The `min(100%, 18rem)` is what makes this responsive without a media query — the track floor collapses to the container width on narrow viewports instead of forcing overflow. Keep it.

Empty state, mono 0.875rem in `var(--hb-dark-muted)`:

> No garments match these filters yet.

## Filter logic

```ts
const filtered = products.filter(p => {
  if (availability === "available" && p.status !== "available") return false;
  if (availability === "archived" && p.status === "available") return false;
  if (selectedTag && !p.tags.includes(selectedTag)) return false;
  if (selectedSize && !p.sizes.includes(selectedSize)) return false;
  return true;
});
```

Tag and size chips toggle off when re-clicked (`selectedTag === tag ? null : tag`). Availability is a radio, not a toggle.

## State

| Variable | Default | Notes |
|---|---|---|
| `selectedTag` | `null` | single select, toggles off |
| `selectedSize` | `null` | single select, toggles off |
| `availability` | `"available"` | one of `available` / `archived` / `all` |

All client-side (`ShopContent`). Products come from `getStripeCatalog()` with the local fallback, same as today — the filters stay client-side, the page stays a server component with a client child.

## Responsive

Built. The grid handles itself via `min(100%, 18rem)`. Filter chips wrap on `flex-wrap: wrap` with `gap: 0.5rem`. Nothing further needed.

## Asset warning

All six garments currently point at Unsplash URLs. `ProductCard` handles a broken image by rendering `{status} — image missing` as a mono label bottom-left inside the plate, so a missing photo degrades to a legible catalogue state rather than a blank box. Keep that fallback — it will matter while real photography is pending.
