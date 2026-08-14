# CartDrawer

**Source:** `components/cart/CartDrawer.jsx`
**Suggested path:** `src/components/cart/CartDrawer.tsx` — client component
**Companion spec:** `screens/04-cart.md` (the cart page ledger)

Read the cart page spec first. The drawer follows the same vocabulary, and it was rebuilt in the same pass for exactly that reason: before it, opening the drawer and then the cart page showed two different design systems for one feature.

This is also the **mobile commerce surface**, so it is the one place with hard touch-target minimums.

## Props

```ts
{
  open: boolean;
  items?: CartLine[];
  onClose, onUpdateQuantity, onRemove, onClear, onCheckout;
}
```

## Container & panel

Root: `position: absolute; inset: 0; z-index: 50; display: flex`, `pointer-events: {open ? "auto" : "none"}`, `aria-hidden={!open}`.

Scrim: `flex: 1`, `background: var(--overlay-modal)` (`rgba(14,12,11,0.7)`), `opacity` 0→1 over `200ms ease`, click closes.

Panel — `role="dialog"`, `aria-modal="true"`, `aria-label="Shopping cart"`, `class="hb-grain"`:

```css
width: 100%; max-width: 28rem;
background: var(--hb-dark-surface);
border-left: 1px solid var(--hb-dark-border);
display: flex; flex-direction: column;
box-shadow: var(--hb-shadow-drawer);         /* the only shadow in the system */
transform: translateX(100%);                 /* → translateX(0) when open */
transition: transform 420ms var(--hb-ease-expo-out);
```

## Header

`padding: 1.25rem 1.5rem`, `border-bottom: 1px solid var(--hb-dark-border)`, `display: flex; align-items: center; justify-content: space-between`.

- Eyebrow `Cart` — mono 0.75rem uppercase, `letter-spacing: 0.35em`, `var(--hb-sienna)`, `opacity: 0.7`
- H2 — display italic 300, 1.5rem, `var(--hb-on-dark)`, `margin-top: 0.25rem`. Text is `Empty` when the cart is empty, otherwise `{n} item` / `{n} items` where `n` is summed quantity.
- Close — the word `Close` in mono, `min-height: 44px`, `min-width: 44px`. Receives focus when the drawer opens.

## Body

`max-height: 65%`, `overflow-y: auto`, `flex: 1`.

### Empty state

`padding: 3rem 1.5rem`, left-aligned (not centred):

- Display italic 300, 1.5rem, `line-height: 1.45`, `var(--hb-on-dark)`: **Nothing yet.**
- `Browse the shop` link below, `margin-top: 1.5rem`, `min-height: 44px`, mono 0.75rem uppercase `var(--hb-track-meta)`, `var(--hb-sienna)`, `border-bottom: 1px solid currentColor`, `padding-bottom: 0.35rem`.

Same words and same treatment as the cart page's empty state. The old copy — "The drawer is quiet. Add a garment from the shop to begin your Hana-Bi study." — was cut along with its centred bordered button.

### Item rows

Keyed `item.id + "-" + item.size`.

```css
padding: 1.5rem;
border-top: 1px solid var(--hb-dark-border);     /* top, not bottom */
```

No `background`. The row used to be filled with `var(--hb-dark)` against the panel's `var(--hb-dark-surface)`; that per-row fill is gone. Rules only.

**Line 1** — `display: flex; align-items: flex-start; justify-content: space-between; gap: 1rem`:

- Left, `min-width: 0`: name in display italic 300, 1.125rem, `line-height: 1.35`; below it `Size {size}` in mono 0.75rem uppercase, `letter-spacing: 0.25em`, `var(--hb-dark-muted)`, `margin-top: 0.25rem`.
- Right: **`Remove`** — the word, mono, `min-height: 44px`, `min-width: 44px`, `flex-shrink: 0`, `opacity: 0.7`, `aria-label="Remove {name}"`.

`Remove` replaced a `×` glyph. The rest of the system spells its actions out, and a 44px target holding a single multiplication sign reads as a chrome control rather than a catalogue action.

**Line 2** — `display: flex; align-items: center; justify-content: space-between; margin-top: 0.75rem; gap: 1rem`:

- Stepper, unboxed: `display: flex; align-items: center; margin-left: -0.75rem`. The negative margin pulls the 44px `–` button's padding back so the control optically aligns with the name above it. Buttons are 44×44, `background: none`, `border: none`, `var(--hb-on-dark)`, centred. Quantity between them: `width: 40px`, `text-align: center`, mono 0.875rem, `tabular-nums`.
- Line total: mono 0.875rem, `tabular-nums`, **`var(--hb-on-dark)`**, `flex-shrink: 0`.

The line total was sienna. Sienna is reserved for catalogue metadata and the one primary action per view, so a per-row price in sienna was three or four sienna elements competing with the checkout button.

The bordered box around the stepper is gone — same change as the cart page.

## Footer

Rendered only when items exist. `padding: 1.25rem 1.5rem`, `border-top: 1px solid var(--hb-dark-border)`, `display: flex; flex-direction: column; gap: 1rem`.

**Error state** (`role="alert"`), when checkout fails:

```css
border: 1px solid rgba(154,122,90,0.45);
background: rgba(154,122,90,0.08);
padding: 0.75rem 1rem;
font-family: var(--hb-font-mono); font-size: 0.7rem;
text-transform: uppercase; letter-spacing: var(--hb-track-tag);
color: rgba(250,248,244,0.9); line-height: 1.7;
```

Default message: `Checkout couldn't start. Please try again.` The drawer has this and the cart page does not — worth adding there, using this exact treatment.

**Total row** — `space-between`: `Total` in mono 0.75rem uppercase `var(--hb-track-meta)` `var(--hb-dark-muted)`; value in mono **1rem**, `var(--hb-on-dark)`, `tabular-nums`. (The page ledger goes to 1.5rem; the drawer is narrower and 1rem is enough.)

**Checkout button** — identical to the cart page's: full width, `var(--hb-sienna)`, `var(--hb-on-dark)`, mono 0.75rem uppercase, `letter-spacing: var(--hb-track-nav)`, `padding: 1rem 1.5rem`, `border-radius: 0`, `transition: opacity 300ms ease`. `Redirecting…` at `opacity: 0.4` while loading.

**`Clear cart`** below — bare mono, full width.

## Behaviour

- `Escape` closes. Listener bound only while open.
- Close button takes focus on open.
- `error` clears whenever the drawer closes.
- Quantity floors at 1 via `Math.max(1, quantity - 1)`; zero is reached by `Remove`.
- Checkout wraps `onCheckout(items)` in try/catch, setting `error` from `err.message` with the default fallback.

Not implemented in the prototype but expected in production: focus trap while open, and `overflow: hidden` on the body to stop background scroll.

## Touch targets

`44px` minimum on close, remove, and both stepper buttons — `--hb-touch-min`. This is the mobile surface; the cart page's smaller 1.5rem stepper buttons are acceptable there because it is a pointer layout, but if the page ledger ever becomes the primary mobile cart, raise them to 44px too.
