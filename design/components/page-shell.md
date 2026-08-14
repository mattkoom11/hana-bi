# PageShell

**Source:** `components/layout/PageShell.jsx`
**Used by:** Shop, Cart, Archive, Projects, About, and Product's related band — six of eight screens
**Suggested path:** `src/components/layout/PageShell.tsx` — server component (the light variant's children are static)

The standard page frame: eyebrow, title, intro, then content. Build this second, right after the tokens, because most screens are just this shell plus one component.

## Props

```ts
{
  title: string;
  eyebrow?: string;
  intro?: ReactNode;
  variant?: "light" | "dark";     // default "light"
  children: ReactNode;
  style?: CSSProperties;
}
```

## Section

```css
padding: var(--hb-section-y) var(--hb-gutter);      /* 6rem, clamp(1rem,5vw,5rem) */
position: relative;
background: rgba(14,12,11,0.8)      /* dark  */
         | rgba(250,248,244,0.85);  /* light */
```

Dark also carries `class="hb-grain"`. Both backgrounds are **translucent** — the site-wide video sits behind every page, and the paper surfaces are deliberately slightly transparent over it. Do not make them opaque; that flattening is visible.

## Header

`max-width: 56rem`, `margin-bottom: var(--hb-header-mb)` (5rem), `position: relative`, `z-index: 10`.

| Element | Dark | Light |
|---|---|---|
| Eyebrow | mono · `var(--hb-sienna)` | `--hb-font-script` (Spectral) · `var(--hb-smoke)` |
| | both: 0.75rem · uppercase · `letter-spacing: var(--hb-track-nav)` (0.4em) · `opacity: 0.7` | |
| Title | display italic 300 · `var(--hb-display-page)` = `clamp(3rem, 5vw, 4.5rem)` · `letter-spacing: -0.01em` · `line-height: 1.05` · `var(--hb-on-dark)` | same, `var(--hb-ink)` |
| Intro | `margin-top: 2.5rem` · 1.125rem · `line-height: 1.7` · `max-width: 42rem` · `var(--hb-dark-muted)` | `var(--hb-smoke)` at `opacity: 0.85` |

Title block sits in a wrapper with `margin-top: 2rem` below the eyebrow.

## Light-variant extras

Three things the light variant adds, all absent on dark:

1. **`PaperBackground`** — `intensity="subtle"`, `texture="grain"`, `position: absolute; inset: 0`. Paper noise.
2. **`InkUnderline`** beneath the title — `width={180}`, `variant="wispy"`, `strokeOpacity={0.4}`, `margin-top: 1rem`.
3. **`HandDrawnDivider`** — `variant="delicate"`, `strokeOpacity={0.25}`, pinned across the top edge of the section, centred, `z-index: 10`.

These are the hand-drawn ornaments referenced in `CLAUDE.md` as the one untested part of the system. They are why light pages feel like paper and dark pages feel like a vitrine. Implement as-is; if a decision comes later to cut them, this is the file where two of the three live.

## Content

```css
position: relative;
z-index: 10;
margin-top: 2rem;
```

No max-width on the content wrapper — each screen sets its own. Shop and Projects go full width; Product's paper bands set `42rem` or `56rem` internally.

## Usage patterns

```jsx
/* dark, commerce */
<PageShell variant="dark" eyebrow="Shop" title="Limited garments, ready to study." intro="…" />

/* light, archival */
<PageShell eyebrow="Archive" title="Past retail drops, preserved." intro="…" />
```

Which variant a screen uses is not arbitrary — dark is the lit vitrine (shop, cart, product hero), light is the printed record (archive, projects, about). See `screens/05-archive.md`.

## Responsive

The header's `max-width: 56rem` and the `clamp()` title scale handle most of it. `--hb-header-mb` at 5rem is heavy on mobile; reduce to ~2.5rem below 640px.
