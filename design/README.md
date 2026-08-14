# Handoff: Hana-Bi Subtraction Pass

## Overview

This bundle documents a design system and an eight-screen redesign for **hana-bi** (`mattkoom11/hana-bi`, `main`, read at `32086e5`). It is the result of a *subtraction pass*: the existing site was analysed component by component and reduced — five typefaces to three, five background systems to two, decorative wrappers removed, two competing archive views collapsed into one.

The intent is not new features. It is the same site with less in it, so that what remains reads as deliberate.

## About the design files

The HTML/JSX prototype (`ui_kits/site/*.jsx` in the Claude Design project this bundle came from) is a **design reference**, not production code. It is Babel-in-browser React with inline styles, built to be looked at and clicked through. It was not copied into `src/`.

The job is to **recreate these designs in the existing Next.js + Tailwind codebase**, using its established patterns — App Router pages under `src/app/(site)/`, components under `src/components/`, CSS custom properties in `src/app/globals.css`, `next/font/google` for typefaces, Zustand for cart state.

One exception: `tokens/*.css` **is** real, applyable CSS. It is a diff against `globals.css`, not a description of one. See `tokens/APPLY.md`.

## Fidelity

**High fidelity.** Every value in the screen specs is measured from the working prototype: exact hex codes, rem sizes, letter-spacing in `em`, grid track lists, transition durations and easing curves. Where a spec says `3rem 4rem minmax(7rem, 1fr) 6rem 6rem`, that is the literal `grid-template-columns`. Match it.

Copy is also final — every string in the specs is the string to ship. Do not paraphrase.

## Order of work

| # | Step | Why this order |
|---|---|---|
| 1 | Apply `tokens/` to `globals.css`; remove Cormorant Garamond and Kalam from `layout.tsx` | Everything downstream reads these variables |
| 2 | `components/page-shell.md` | Six of eight screens are built inside it |
| 3 | `components/catalogue-index.md` | Home and Archive both depend on it |
| 4 | Screens 01–08 in any order | Independent once 1–3 land |
| 5 | `components/cart-and-drawer.md` | Touches Zustand store; do last |
| 6 | Delete dead components (list in `CLAUDE.md`) | Only safe once nothing imports them |

## What is in this bundle

```
design/
  README.md                  this file
  CLAUDE.md                  standing design constraints — appended to the root CLAUDE.md
  PROMPTS.md                 one ready prompt per screen
  ASSETS.md                  what imagery exists, what is placeholder, what is missing
  tokens/
    APPLY.md                 how to merge these into globals.css
    colors.css  fonts.css  typography.css  spacing.css  motion.css  effects.css  base.css
  screens/
    01-home.md  02-shop.md  03-product.md  04-cart.md
    05-archive.md  06-projects.md  07-about.md  08-not-found.md
  components/
    page-shell.md  catalogue-index.md  product-grid.md  cart-and-drawer.md
    scroll-stage.md  video-background.md  construction-gallery.md
```

The clickable prototype (`ui_kits/site/index.html` in the source Claude Design project) is the reference of record when a spec and a reading of it disagree.

## Known gaps

Read `ASSETS.md` before starting. In short: the six shop garments are Unsplash placeholders, the 23 video clips are gitignored (present locally, not in the repo), and only the two Projects pieces have real photography. Three of the eight screens will not look finished until real assets land, and that is an asset problem, not an implementation one.

Also unresolved: the hand-drawn SVG ornaments (`InkUnderline`, `SketchFrame`, `HandDrawnDivider`, `ScribbleArrow`, `RoughBorderCard`) survive on paper surfaces and were never subtraction-tested. They are specced as-is. If you want them cut, that is a design decision still open.
