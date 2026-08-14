# CatalogueIndex

**Source:** `components/catalogue/CatalogueIndex.jsx`
**Used by:** Home (act 3), Archive (entire screen)
**Suggested path:** `src/components/catalogue/CatalogueIndex.tsx` — client component (hover state)

An archive read as a tracklist rather than a card grid. Numbered rows, type only, imagery revealed on hover in one fixed plate. Reference-derived from a site the founder collected (Tomoya Okada).

This is the most reused pattern in the system. The cart ledger and the construction gallery are both variations on it, so get this one right first.

## Props

```ts
{
  items: Array<{
    id?: string; slug?: string;
    name: string;
    number?: string; catalogNumber?: string;
    image?: string;
    href?: string;
    [column: string]: unknown;      // whatever `columns` names
  }>;
  variant?: "dark" | "light";       // default "dark"
  showPreview?: boolean;            // default true
  onSelect?: (item, index) => void;
  columns?: string[];               // default ["collection", "year"]
}
```

## Colour resolution

```ts
const fg   = isDark ? "var(--hb-on-dark)"     : "var(--hb-ink)";
const dim  = isDark ? "var(--hb-dark-muted)"  : "var(--hb-smoke)";
const line = isDark ? "var(--hb-dark-border)" : "var(--hb-border)";
```

## Hover preview plate

One plate for the whole list, absolutely positioned, `aria-hidden`, `pointer-events: none`:

```css
position: absolute; top: 0; right: 0;
width: 22rem; aspect-ratio: 4 / 5;
overflow: hidden; z-index: 0;
opacity: 0;                                   /* 1 when a row with an image is hovered */
transform: translateY(12px);                  /* translateY(0) when hovered */
transition: opacity 500ms var(--hb-ease-expo-out),
            transform 600ms var(--hb-ease-expo-out);
```

Image fills it with `object-fit: cover`. The plate sits *behind* the rows (`z-index: 0` vs the list's `z-index: 1`) so type overlaps imagery — that overlap is the whole effect. Do not raise it above the list.

Only rows with an `image` raise opacity; a row without one leaves the plate hidden rather than showing an empty box.

## Rows

`<ol>` with `list-style: none`, `margin: 0`, `padding: 0`, `position: relative`, `z-index: 1`.

Each `<li>`: `border-top: 1px solid {line}`. **After the last item, one empty `<li style="border-top: 1px solid {line}" />`** so the list closes with a rule. This closing rule recurs across the system — the ledger and the construction list both have it.

Each row is an `<a href={item.href ?? "#"}>` with `preventDefault` + `onSelect`. Hover, focus and blur all drive the same active index, so keyboard traversal shows the preview too:

```css
display: grid;
grid-template-columns: 4rem minmax(0, 1fr) repeat(n, 9rem);   /* n = columns.length */
align-items: baseline;
gap: 1.5rem;
padding: 1.5rem 0;
padding-left: 0;                        /* → 1rem when active */
opacity: 1;                             /* → 0.45 when another row is active */
transition: padding-left 450ms var(--hb-ease-expo-out), opacity 300ms ease;
```

The dimming rule is: `active === null || isActive ? 1 : 0.45`. With nothing hovered, every row is at full opacity — the list does not start dimmed.

### Cells

**1 — Catalogue number.** `item.number ?? item.catalogNumber ?? "HB-" + String(i+1).padStart(3,"0")`. Mono, `var(--hb-label-3xs)` (0.55rem), uppercase, `letter-spacing: var(--hb-track-catalog)` (0.55em). Colour: `var(--hb-sienna)` on dark, `dim` on light.

Prefer the record's own number. The index fallback exists only for data without one, and a number derived from row position will change when a filter does — which makes it not an identity.

**2 — Name.** Display italic 300, `clamp(1.5rem, 3vw, 2.5rem)`, `color: fg`.

```css
line-height: 1.45;                /* NOT 1.1 — see below */
min-width: 0;
overflow: hidden;
text-overflow: ellipsis;
white-space: nowrap;
```

**The 1.45 line-height is load-bearing.** Italic Spectral needs roughly 39px of ink at 27.7px type; the `overflow: hidden` that powers the ellipsis shears descenders and the italic's overshoot at tighter leading. Verified by `scrollHeight === clientHeight`. A tighter value looks correct in a static mockup and clips in the browser.

**3…n — Meta columns.** One per `columns` entry, `9rem` fixed, `text-align: right`. Mono, `var(--hb-label-xs)` (0.65rem), uppercase, `letter-spacing: var(--hb-track-meta)`, `color: dim`. Values read straight off `item[key]` — so `columns={["collection","year"]}` prints `First Bloom` / `2025`.

## State

`active: number | null`. Nothing else. No data fetching, no effects.

## Responsive — not built

The `4rem minmax(0, 1fr) repeat(n, 9rem)` grid does not survive mobile: two 9rem columns plus 1.5rem gaps leave nothing for the name.

Recommended treatment below ~720px, consistent with how the cart ledger collapses:

- Drop the preview plate entirely (`showPreview={false}` on touch) — there is no hover.
- Two rows per record: name on the first line, then catalogue number and meta values as one mono line below, `gap: 0.75rem`.
- Keep the hairline rules and the closing rule.

Do not shrink the meta columns to fit. The failure mode is the same one that bit the cart: a `minmax(0, 1fr)` name track silently flooring at 0px while the layout still looks plausible. If you keep a flexible name track at any width, give it a floor.
