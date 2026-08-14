# Applying the tokens

These seven files are real CSS, derived from the repo's own `src/app/globals.css`. They are the only part of this bundle that gets applied rather than reinterpreted.

## Merge order

Into `src/app/globals.css`, in this order (later files reference earlier variables):

1. `fonts.css` — `@import` for Spectral, Inter, DM Mono
2. `colors.css`
3. `typography.css`
4. `spacing.css`
5. `motion.css` — includes `@keyframes` and the `prefers-reduced-motion` block
6. `effects.css` — includes the `.hb-grain` utility class
7. `base.css` — resets and body defaults

Keep them as one `:root` block per concern rather than flattening; the grouping is how the system stays legible.

## Font loading

`fonts.css` uses the Google Fonts CSS API so the bundle is portable. **In the Next.js app, do not use the `@import`.** Load via `next/font/google` in `src/app/layout.tsx` and keep the variable names:

```ts
import { Spectral, Inter, DM_Mono } from "next/font/google";

const spectral = Spectral({
  subsets: ["latin"],
  style: ["normal", "italic"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-spectral",
});
const inter = Inter({ subsets: ["latin"], weight: ["300","400","500","600"], variable: "--font-inter" });
const dmMono = DM_Mono({ subsets: ["latin"], weight: ["300"], variable: "--font-dm-mono" });
```

Then point the design variables at them in `globals.css`:

```css
--hb-font-display: var(--font-spectral), Georgia, serif;
--hb-font-sans: var(--font-inter), "Helvetica Neue", Arial, sans-serif;
--hb-font-mono: var(--font-dm-mono), "Courier New", monospace;
```

Spectral must load italic weight 300 — the entire display voice is italic 300. If italic is missing the browser synthesises a slant and the whole site looks subtly wrong.

## What to remove from `layout.tsx`

Delete the `Cormorant_Garamond` and `Kalam` imports and their `variable` declarations. This is the subtraction pass's largest single win: two fewer font payloads.

`--hb-font-script`, `--hb-font-serif` and `--hb-font-kanji` stay as **aliases onto Spectral** so components that still reference them keep rendering. Do not delete the variables; delete the fonts.

Rationale, in case it comes up: Cormorant carried only 花火 at 7% opacity as a background watermark, where the difference from Spectral is not perceptible. Kalam carried a handful of micro-labels that mono now holds.

## Tailwind

If the config maps colours or fonts, point them at the variables rather than duplicating hex codes:

```js
theme: {
  extend: {
    colors: {
      paper: "var(--hb-paper)",
      ink: "var(--hb-ink)",
      sienna: "var(--hb-sienna)",
      "dark-surface": "var(--hb-dark-surface)",
    },
    fontFamily: {
      display: "var(--hb-font-display)",
      body: "var(--hb-font-sans)",
      mono: "var(--hb-font-mono)",
    },
  },
}
```

Single source of truth matters here more than usual — the specs are written entirely in `var(--hb-*)` terms, so a divergent Tailwind palette produces screens that are almost right and hard to debug.

(This repo has no `tailwind.config.*` — Tailwind v4, CSS-first via `@theme inline` in `globals.css`. Nothing to update here; the `--hb-*` variables are consumed directly.)

## Verifying the merge

Four checks, fastest first:

1. `getComputedStyle(document.body).getPropertyValue('--hb-sienna').trim() === '#9a7a5a'`
2. A display headline renders italic at weight 300, not synthesised oblique
3. `.hb-grain::after` paints the noise overlay on a dark section
4. Network panel shows three font families, not five
