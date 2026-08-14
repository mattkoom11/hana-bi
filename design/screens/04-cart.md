# 04 — Cart & order confirmation

**Routes:** `src/app/(site)/cart/page.tsx`, `src/app/(site)/success/page.tsx`
**Surface:** dark, inside `PageShell`

This screen was rebuilt last and most heavily. It was the only screen still made of boxes: a bordered card list, a filled surface per row, a floating total. It is now a **ledger** in the same vocabulary as Home and Archive.

The drawer (`components/cart-and-drawer.md`) was brought along in the same pass — before that, opening the drawer and then the cart page showed two different design systems for one feature.

## Shell

```jsx
<PageShell
  variant="dark"
  eyebrow={count > 0 ? `Cart — ${count} piece${count === 1 ? "" : "s"}` : "Cart"}
  title="Your current study."
  intro="Cart items are stored locally. Checkout is handled securely by Stripe."
/>
```

`count` is the sum of quantities, not the number of lines. The eyebrow carrying the count is what lets the rows stay free of badges.

## Shared style objects

Define once; they recur throughout:

```ts
const meta = {                                    // every micro-label
  fontFamily: "var(--hb-font-mono)",
  fontSize: "var(--hb-label-xs)",                 // 0.65rem
  textTransform: "uppercase",
  letterSpacing: "var(--hb-track-meta)",          // 0.3em
  color: "var(--hb-dark-muted)",
};
const num  = { fontFamily: "var(--hb-font-mono)", fontVariantNumeric: "tabular-nums", color: "var(--hb-on-dark)" };
const bare = { background: "none", border: "none", padding: 0, cursor: "pointer" };
const line = "1px solid var(--hb-dark-border)";
```

`font-variant-numeric: tabular-nums` on every figure. Prices that shift horizontally as quantity changes are the fastest way to make a ledger look like a form.

---

## Empty state

No box, no icon.

```
borderTop: line; paddingTop: 3rem; maxWidth: 34rem
```

- Display italic 300, `clamp(1.5rem, 3vw, 2.25rem)`, `line-height: 1.45`, `var(--hb-on-dark)`: **Nothing yet.**
- Below, `display: flex; gap: 2rem; margin-top: 2rem` — two links in `meta` style, `color: var(--hb-sienna)`, `border-bottom: 1px solid currentColor`, `padding-bottom: 0.35rem`:
  - `Browse the shop` → `/shop`
  - `Revisit the archive` → `/archive`

---

## Populated layout

```css
display: grid;
grid-template-columns: minmax(0, 1fr) minmax(15rem, 18rem);  /* wide */
gap: 4rem;
align-items: start;
```

Below 1180px: single column, `grid-template-columns: minmax(0, 1fr)`, same 4rem gap.

### Why 1180px, and why the summary column is not fixed

This is the one place the implementation is easy to get subtly wrong, and it was a real bug during design.

The collapse threshold is **not** about the viewport being narrow. It is about the *items column* being too narrow for five tracks. At a 924px viewport the items column measured 431.6px while the row's fixed tracks plus gaps needed 448px — so the `minmax(0, 1fr)` name track floored at **0px** and the garment name vanished entirely while the layout still looked plausible.

Three defences, all of which should survive into production:

1. Collapse at **1180px**, not ~880px.
2. Summary column is `minmax(15rem, 18rem)`, not a fixed `20rem`, so it yields before the items column starves.
3. The name track has a floor: `minmax(7rem, 1fr)`, never `minmax(0, 1fr)`. If something upstream shrinks the container, the name overflows visibly instead of disappearing silently.

A container query is strictly better than a viewport breakpoint here if it can be managed — the constraint genuinely is the container. Keep the 7rem floor either way.

### Item rows — `<ol>`, no list styling

Each `<li>` gets `border-top: line`. **One closing `<li style={{ borderTop: line }} />`** after the last item so the ledger is ruled top and bottom. That empty closing row is part of the vocabulary; it appears in `CatalogueIndex` and the construction list too.

Row grid, `padding: 1.75rem 0`, `align-items: start`:

| Width | `grid-template-columns` | `gap` |
|---|---|---|
| ≥1180px | `3rem 4rem minmax(7rem, 1fr) 6rem 6rem` | `1.25rem` |
| <1180px | `4.5rem minmax(0, 1fr)` | `1.25rem` |

**Wide columns, left to right:**

1. **Catalogue number** — mono, `var(--hb-label-3xs)` (0.55rem), uppercase, `letter-spacing: var(--hb-track-catalog)` (0.55em), `var(--hb-sienna)`, `padding-top: 0.35rem`. Falls back to `HB-—` if the product record is missing.
2. **Plate** — `aspect-ratio: 4/5`, `overflow: hidden`, `background: var(--hb-dark-surface)`, image `object-fit: cover`.
3. **Name + meta** — `min-width: 0` (required, or the ellipsis machinery fails). Name is a link to `/product/[slug]`: display italic 300, `clamp(1.25rem, 2vw, 1.75rem)`, `line-height: 1.45`, no underline. Meta line below in `meta` style, `margin-top: 0.5rem`: `Size {size}` + ` · {collection}` when a collection exists. `Remove` button below in `meta` + `bare`, `margin-top: 1.25rem`, `opacity: 0.7`.
4. **Stepper** — `padding-top: 0.25rem`.
5. **Line total** — `num`, 0.875rem, `text-align: right`, `padding-top: 0.35rem`.

**Narrow layout** drops the catalogue number column and moves stepper + line total into the name cell as a `space-between` row with `margin-top: 1.25rem`, `Remove` still beneath.

### Stepper — unboxed

`display: flex; align-items: center; gap: 0.25rem`. No border, no surrounding box.

- `–` and `+` buttons: `bare` + `meta`, `width: 1.5rem`, `text-align: center`, `font-size: 0.875rem`. The `–` sits at `opacity: 0.3` when quantity is 1.
- Quantity: `num`, `width: 2rem`, `text-align: center`, `font-size: 0.875rem`.
- `aria-label` on both: `Decrease quantity of {name}` / `Increase quantity of {name}`.

Quantity floors at 1: `Math.max(1, quantity + delta)`. Removal is the `Remove` button, not decrementing to zero.

### Summary column

`position: sticky; top: 6rem` (static when collapsed), `display: flex; flex-direction: column; gap: 2rem`.

A `<dl>` with `gap: 0.875rem`, each row `display: flex; justify-content: space-between; gap: 1rem`, `<dt>` in `meta`, `<dd>` in `meta` + `color: var(--hb-on-dark)` + `tabular-nums`:

| Term | Value |
|---|---|
| Subtotal | formatted total |
| Shipping | `At checkout` |
| Lead time | `3–4 months` |

Then the total row: `border-top: line`, `padding-top: 1.25rem`, `align-items: baseline` — `<dt>` `Total` in `meta`, `<dd>` in `num` at **1.5rem**. The size jump is the only hierarchy signal; no bold, no colour change.

Shipping and lead time are new. Both facts were only stated on the product page before, which is the wrong moment — lead time matters most immediately before payment.

**Checkout button** — the only filled element on the page:

```css
width: 100%; background: var(--hb-sienna); color: var(--hb-on-dark);
font-family: var(--hb-font-mono); font-size: 0.75rem;
text-transform: uppercase; letter-spacing: var(--hb-track-nav);
padding: 1.125rem 1.5rem; border: none; border-radius: 0;
```

Label `Checkout`, or `Redirecting…` while loading, with `opacity: 0.4` and `cursor: not-allowed` when disabled.

**Below it**, a `space-between` row: `Keep looking` → `/shop` in `meta` + `var(--hb-sienna)`; `Clear cart` as `bare` + `meta` at `opacity: 0.7`.

---

## Success page — `/success`

Rebuilt in the same pass. The circled 96px checkmark in a sienna-tinted disc is **gone** — it was the last rounded, filled, iconographic element in the system.

Now a `PageShell variant="dark"`:

- eyebrow `Order confirmed`
- title `Received. We begin cutting.`
- intro `Payment has cleared and your garment enters the production queue. A confirmation email is on its way.`

Body is a two-column auto-fit grid, `repeat(auto-fit, minmax(18rem, 1fr))`, `gap: 4rem`, `max-width: 62rem`.

**Left — receipt `<dl>`**, `gap: 1.25rem`. Each entry `border-top: line`, `padding-top: 1rem`; `<dt>` in `meta` + `var(--hb-sienna)`; `<dd>` mono 0.875rem `var(--hb-on-dark)`, `margin-top: 0.5rem`, `word-break: break-all`:

- `Order` → the real Stripe session id
- `Ships` → `6–8 weeks (first drop)`
- `Contact` → `hello@hanabiny.com`

**Right — numbered `<ol>`**, `gap: 1.25rem`, each row `grid-template-columns: 2.5rem minmax(0, 1fr)`, `align-items: baseline`. Number is `01`/`02`/`03` — mono, `var(--hb-label-3xs)`, `letter-spacing: var(--hb-track-catalog)`, `var(--hb-sienna)`. Body mono 0.875rem/1.7 in `var(--hb-dark-muted)`:

1. An email confirmation follows with your order details.
2. We notify you when the piece ships.
3. It arrives ready to break in and age with you.

**Footer links**, `display: flex; gap: 2rem; margin-top: 4rem` — `Back to shop` (sienna, `border-bottom: 1px solid currentColor`) and `Return home` (`var(--hb-dark-border)` underline).

Note the copy was tightened: the old page said "Thank you for your order. We've received your payment and will begin processing your garment." across a headline and paragraph. The shell's title and intro now carry it in fewer words.

---

## State & integration

Cart page: `loading` boolean around the `onCheckout()` call. Items come from the Zustand store (`src/store/cart.ts`), persisted to `localStorage`.

Line identity: cart lines are keyed per garment **and size**, so the same garment in two sizes is two lines. Store `productId` on the line and look up the product record directly (the real store already does this) — the catalogue number and hero image both depend on that resolution, and a fuzzy string match would eventually collide.

Checkout errors: the page currently has no error state (the drawer does — a bordered mono alert). Add one to match, using the drawer's exact treatment.
