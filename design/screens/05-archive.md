# 05 — Archive

**Route:** `src/app/(site)/archive/page.tsx`
**Surface:** paper (light), inside `PageShell`

## Purpose

Every garment that has passed through the shop and closed. Read, not browse.

## The whole screen

```jsx
<PageShell
  eyebrow="Archive"
  title="Past retail drops, preserved."
  intro="Every garment that has passed through the shop lives here — sold-out and closed editions catalogued with fabric provenance and editorial notes."
>
  <CatalogueIndex
    variant="light"
    columns={["collection", "year"]}
    items={archived.map(p => ({ ...p, image: p.heroImage }))}
    onSelect={openProduct}
  />
</PageShell>
```

`archived = products.filter(p => p.status !== "available")` — both `sold_out` and `archived` statuses.

`variant="light"` (no `variant` prop on `PageShell` defaults to light, which is why it is absent above). Note the light variant of `PageShell` brings `PaperBackground`, a `HandDrawnDivider` pinned to the top edge, and an `InkUnderline` beneath the title — see `components/page-shell.md`.

That is the entire screen. It should be about twelve lines of JSX.

## What was cut

The old Archive had an **Index / Wall toggle**: the same twelve records available as either a list or a grid of `SketchFrame` cards with rotation tilts and dashed borders.

The toggle went, and the wall with it. Two ways to read the same twelve rows was a decision the page was making on the reader's behalf — and it doubled the maintenance for one screen. `CatalogueIndex` owns archival listing now.

Consequences to be aware of:

- `SketchFrame` is no longer imported here. It survives elsewhere; check imports before deleting it.
- No view-mode state, no `localStorage` persistence of a view preference, no toggle control.
- If someone asks for the wall back, the answer is Shop — that is what a grid is for, and it is the grid the system already has.

## Why Archive is paper and Shop is dark

The archive is the printed record; the shop is the lit vitrine. This is the clearest expression of the two-surface system, and the reason there are exactly two background modes rather than five.

## State

None. Static filter over static data. This can be a pure server component — the only interactivity lives inside `CatalogueIndex` (hover preview), which is a client component.

## Responsive

Inherits whatever `CatalogueIndex` does. See that spec — the row grid is `4rem minmax(0, 1fr) repeat(n, 9rem)` and needs a mobile treatment, which is the same open item as on Home.
