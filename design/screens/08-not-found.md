# 08 — 404

**Route:** `src/app/not-found.tsx`
**Surface:** dark, over the video background. No `PageShell`.

## Purpose

Absorb a dead link without breaking register. The joke, such as it is, is that the page has been catalogued and filed somewhere unreachable — consistent with a site that catalogues everything.

## Layout

```css
position: relative;
min-height: 60vh;
display: flex; align-items: center; justify-content: center;
padding: 0 var(--hb-gutter);
overflow: hidden;
```

**Oversized `404`** — the same watermark move as the homepage's `花火`, but using the numeral as the ornament:

```css
position: absolute;
bottom: -0.1em; right: -0.05em;
font-family: var(--hb-font-display);
font-style: italic; font-weight: 300;
font-size: clamp(12rem, 38vw, 26rem);
line-height: 1;
color: var(--hb-dark-kanji);            /* rgba(250,248,244,0.07) */
user-select: none; pointer-events: none;
```

`aria-hidden="true"`. Note it is **display italic**, not mono — the numeral is being used as typography, not as data.

**Content** — `position: relative; z-index: 10; max-width: 32rem`:

| Element | Spec |
|---|---|
| Eyebrow | `HB — Page Not Found` · mono 0.75rem uppercase · `letter-spacing: var(--hb-track-eyebrow)` (0.5em) · `var(--hb-sienna)` · `opacity: 0.6` |
| H1 | display italic 300 · `clamp(2.25rem, 5vw, 4rem)` · `line-height: 1.15` · `var(--hb-on-dark)` · `margin: 2rem 0` |
| Body | `line-height: 1.7` · `var(--hb-dark-muted)` · `margin-bottom: 2rem` |
| Actions | `display: flex; gap: 1rem; flex-wrap: wrap` |

**Copy — final:**

H1:
> Lost to the archive.

Body:
> This page has been catalogued, folded, and filed somewhere unreachable. It may have never existed — or it may have passed through the shop and closed.

**Actions** — both mono 0.75rem uppercase, `letter-spacing: var(--hb-track-nav)`, `padding: 1rem 2rem`:

- `Return Home` → `/` — `background: var(--hb-sienna)`, `color: var(--hb-on-dark)`
- `Browse Shop` → `/shop` — `border: 1px solid var(--hb-dark-border)`, `color: var(--hb-dark-muted)`

Same button pair as the homepage hero, which is intentional: a 404 should offer the site's two front doors and nothing else.

## Notes

- No search box, no suggested links, no illustration. The eyebrow already says what happened.
- `min-height: 60vh` rather than full height — the site header and footer stay visible, so the page reads as part of the site rather than a dead end.
- **Next.js specifics for this repo:** `src/app/not-found.tsx` is a root-level special file, and a route-group layout (`(site)/layout.tsx`) does **not** wrap it automatically — only `src/app/layout.tsx` does. The current implementation already works around this by manually composing `SiteHeader`, `SiteFooter` and the video background on this page; keep that structure (don't assume `(site)` chrome comes for free) and just update the copy/layout to match this spec.

## State

None.
