# Hana-Bi design constraints

These are standing rules, not one task's instructions — they apply to every future change to the site's UI. Appended into the root `CLAUDE.md`.

## The register

Hana-Bi documents garments the way a museum catalogues objects. The site should read as a printed archive: hairline rules, generous whitespace, numbered records, tabular figures. It should not read as an e-commerce template.

When in doubt, remove. This system was arrived at by subtraction, and the most likely way to damage it is to add.

## Typography — three families, no more

| Variable | Family | Used for |
|---|---|---|
| `--hb-font-display` | Spectral, italic, weight 300 | Every headline, every garment name |
| `--hb-font-sans` | Inter | Body copy only |
| `--hb-font-mono` | DM Mono, weight 300 | All-caps micro-labels, prices, catalogue numbers, buttons, nav |

Cormorant Garamond and Kalam were cut. `--hb-font-script`, `--hb-font-serif` and `--hb-font-kanji` are aliases onto Spectral and exist only so older components resolve; do not introduce new uses. Never add a fourth family.

Display type is **always** italic at weight 300. There is no upright display style in this system.

Mono labels are **always** uppercase, and tracking grows as the label shrinks — `--hb-track-catalog` (0.55em) at 0.55rem, `--hb-track-meta` (0.3em) at 0.65rem, `--hb-track-nav` (0.4em) at 0.75rem. A mono label without letter-spacing is a bug.

## Colour

- Dark is the site's default mode: `--hb-dark` #0e0c0b over video, `--hb-dark-surface` #171310 for raised panels.
- Paper is the second mode: `--hb-paper` #faf8f4, `--hb-paper-muted` #f5f2ed.
- Two background systems total. Do not add a third.
- `--hb-sienna` #9a7a5a is reserved for catalogue metadata, eyebrows, and the single primary action per view. It is not a general accent — if sienna appears three times on a screen, two of them are wrong.
- Hairlines only: `--hb-dark-border` is `rgba(250,248,244,0.08)`, `--hb-border` is #d4ccc0. Never a heavier rule.
- Status is communicated by desaturating the garment image (`filter: grayscale(1)`), not by a coloured badge.

## Geometry

Square. `border-radius: 0` everywhere except `Badge` (2px) and `Tag` (pill). No rounded cards.

Shadows are essentially absent — only `--hb-shadow-drawer` on the cart drawer's left edge. Do not add elevation to convey hierarchy; use rules and space.

## Motion — two systems

1. **Video crossfade.** 8s minimum per clip, 2s crossfade, two stacked `<video>` elements, next clip preloaded into the idle one.
2. **Scroll-driven objects.** `ScrollStage` pins a viewport and drives content from scroll progress; `TurntableObject` turns a pattern piece.

Everything else is a plain CSS transition on `opacity` / `transform` / `border-color`, 300–700ms, `--hb-ease-expo-out` (`cubic-bezier(0.23, 1, 0.32, 1)`). Cut in the subtraction pass and not to be reintroduced: 3D tilt, parallax layers, depth layers, particle canvases, spotlight cursors, character-morphing headlines.

Respect `prefers-reduced-motion` — the token file already ships the media query.

## Component rules

- **Lists of records** (archive, catalogue, construction pieces) are `CatalogueIndex`-style: numbered rows, type only, hairline `border-top` per row and one closing rule, imagery revealed on hover in a fixed plate. Non-hovered rows drop to `opacity: 0.45`; the hovered row shifts `padding-left: 1rem` over 450ms.
- **Things you can buy** are a grid: 4:5 image, catalogue number, name, one meta line. This distinction between index and grid is deliberate — do not unify them.
- **No per-row fills.** Rows are separated by rules, never by alternating or filled backgrounds.
- **Filters are visible chips**, never `<select>` dropdowns. Every option on screen.
- **One filled element per view** — the primary action. Everything else is a rule, a hairline border, or bare text.
- Catalogue numbers come from the product record (`product.catalogNumber`), never from array position. A number is an identity; it must not change when a filter does.
- Minimum hit target 44px on any touch surface (`--hb-touch-min`).

## Copy

Matter-of-fact, specific, no marketing voice. Garment facts over adjectives — "Cut 2 self · 44.24 × 14.05 in" is the house style. Sentence case in prose; uppercase only in mono labels. Never exclamation marks, never emoji.

Empty states are a display-italic line, not a boxed panel with an icon: "Nothing yet." followed by two text links.

## Dead components — do not reference, and delete when nothing imports them

Cut in this pass, still present in the repo:

`KanjiCanvas`, `Tilt3DStage`, `DepthLayer`, `ParallaxLayer`, `CulturalExplainer`, `MorphingKanji`, `TiltCard`, `RollText`, and the Archive `Index`/`Wall` toggle.

`SketchFrame` is no longer used by Archive but survives elsewhere; check imports before deleting.

## Open question

The hand-drawn SVG ornaments — `InkUnderline`, `HandDrawnDivider`, `HandDrawnBorder`, `ScribbleArrow`, `ScribbleUnderline`, `RoughBorderCard` — still run on paper surfaces and were never subtraction-tested. They are currently kept. If they are ever cut, cut them all at once: a system with one surviving hand-drawn flourish reads as an accident.
