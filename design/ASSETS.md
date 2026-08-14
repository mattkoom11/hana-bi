# Assets

State of the imagery and video as of 2026-08-14, read from `mattkoom11/hana-bi@32086e5`.

Read this before implementing. Three of the eight screens cannot look finished until real assets land, and that is an asset problem rather than an implementation one — worth knowing which is which before debugging a screen that looks thin.

## Summary

| Category | State |
|---|---|
| Project photography | **Real** — 16 files in the repo |
| Shop garment photography | **Placeholder** — 6 garments, all Unsplash URLs |
| Background video | **Present locally, gitignored** — 23 clips, not in the repo |
| Production marker | **Real** — `AX100-SELF-36.json`, in this bundle |
| Logo | **Does not exist** — the mark is typographic |
| OG image | **Real** — `public/og-default.jpg` |

---

## Real: project photography

In the repo, and all 16 are worth wiring up:

```
public/projects/wool-trousers-media/
  wool-trousers-hero.jpg  wool-trousers-1..5.jpg          (6 files)
public/projects/pleated-jorts-media/
  pleated-jorts-hero.jpg  pleated-jorts-1..9.jpg          (10 files)
```

The prototype only wired hero + 2 per project. Wire the full sets — `ProjectGallery` and `ImageLightbox` both scale, and Projects is the one screen with enough real material to show the system properly.

Files are unoptimised, up to 600KB. Use `next/image` with explicit dimensions.

## Real: production marker

`assets/patterns/AX100-SELF-36.json` → ship to `public/patterns/`.

A 2006 marker from CREATE A MARKER, INC — NYC. 13 distinct pieces, 25 placements, 86.252% utilisation on a 30-inch bolt. Drives the Product construction gallery and the Home process story. Full schema in `components/construction-gallery.md`.

Scoped to **Midnight Reed Denim** only, via `product.marker`. Do not point other garments at it — the marker describes one specific pattern, and reusing it across garments would make the section decorative rather than documentary.

---

## Placeholder: shop garments

All six point at Unsplash. They must be replaced before launch:

| # | Garment | Status | Sizes |
|---|---|---|---|
| HB-001 | Indigo Serenade Coat | available | XS–L |
| HB-002 | Midnight Reed Denim | available | 24–34 |
| HB-003 | Paper Lantern Top | sold_out | XS–M |
| HB-004 | Sea Smoke Kimono | archived | One Size |
| HB-005 | Ink Ripple Skirt | available | 0–8 |
| HB-006 | Shadow Weave Vest | available | XS–XL |

Each record wants a `heroImage` plus an `images[]` array. Note the design uses **4:5 portrait** plates everywhere — grid cards, cart plates, catalogue hover previews. Shoot or crop to 4:5; a 3:2 photograph will centre-crop and lose the hem.

Two things already handle the gap gracefully, and both should survive into production:

- `ProductCard` renders `{status} — image missing` as a mono label inside the plate on image error, so a failed load degrades to a legible catalogue state.
- `CatalogueIndex` leaves its hover plate hidden for records without an image rather than showing an empty box.

**Open question worth resolving before build:** do all six garments exist? If some are concepts, the honest design is fewer records rather than placeholder photography — and this system is well suited to a shop with three real garments in it.

## Background video

`public/videos/` holds 23 clips in the working tree and is **gitignored** — present locally, not committed. `VideoBackground` runs a four-panel gradient fallback on the real 8s/2s cadence in their absence; passing real sources via the `clips` prop switches to the two-`<video>` crossfade with no other change.

Every spec in this handoff was designed against the gradient fallback. When real clips are in play, re-check `scrimOpacity` (default 0.6): footage with bright frames may need more scrim for text contrast, and that is the one value likely to need retuning per route.

Production notes for the clips are in `components/video-background.md`: poster frames, mobile payload, audio stripping, `preload` on the idle element only.

## Missing: logo

There is no logo file in the repo. The mark is **typographic** — "Hana-Bi" set in Spectral italic 300, with 花火 used as an oversized low-opacity watermark (`--hb-dark-kanji`, `rgba(250,248,244,0.07)`).

No logo was invented for this handoff. If one is ever commissioned, note the watermark treatment gives the brand its presence at the moment, and a conventional wordmark in the header would compete with it.

---

## If assets are added later

Drop them in and the specs mostly hold. Two things to check:

1. **Aspect ratios.** 4:5 for garment plates. The `CatalogueIndex` hover preview is `22rem` wide at 4:5; the cart plate is `4.5rem` wide at 4:5.
2. **Scrim contrast.** With real footage behind them, verify white text on `rgba(14,12,11,0.8)` `PageShell` surfaces still clears contrast on the brightest frame of every clip, not just the average one.
