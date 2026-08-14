# Prompts

One ready prompt per screen, in the order they should run. Each assumes `design/` is at the repo root and `design/CLAUDE.md` has been appended to the root `CLAUDE.md`.

Do step 0 first. Every prompt after it assumes the variables exist.

---

## 0 — Tokens

```
Read design/tokens/APPLY.md and the seven CSS files beside it.

Merge them into src/app/globals.css in the documented order. Then update
src/app/layout.tsx: remove the Cormorant_Garamond and Kalam imports and their
variable declarations, keep Spectral (with italic, weight 300), Inter and DM Mono
via next/font/google, and point --hb-font-display/-sans/-mono at those variables.

Keep --hb-font-script, --hb-font-serif and --hb-font-kanji as aliases onto Spectral
so existing components still resolve. Do not delete those variables.

If tailwind.config maps colours or fonts, point them at the CSS variables rather
than duplicating hex codes.

Then run the four verification checks at the end of APPLY.md and report the results.
```

## 1 — PageShell

```
Read design/components/page-shell.md.

Rebuild src/components/layout/PageShell.tsx to match it exactly — both variants,
the light variant's PaperBackground / InkUnderline / HandDrawnDivider, and the
translucent backgrounds (they must stay translucent; the video sits behind).

Keep the existing prop names if the current component already has compatible ones.
List every file that imports it and whether the change breaks any of them.
```

## 2 — CatalogueIndex

```
Read design/components/catalogue-index.md.

Implement src/components/catalogue/CatalogueIndex.tsx as a client component.

Two details are load-bearing and were bugs during design — do not "clean them up":
the name cell's line-height is 1.45 (not 1.1), and the preview plate sits behind
the rows at z-index 0 so type overlaps imagery.

Skip the responsive treatment for now; desktop only. Do mobile in a later pass.
```

## 3 — Home

```
Read design/screens/01-home.md, plus design/components/scroll-stage.md and
design/components/catalogue-index.md.

Implement src/app/(site)/page.tsx and the components it needs: the hero, the
four-step ScrollStage process story with a TurntableObject centre per step, and the
CatalogueIndex of available garments.

All copy in the spec is final — use it verbatim, including the four step captions
with their piece dimensions.

The construction marker JSON goes in public/patterns/. Read
design/components/construction-gallery.md for its schema before wiring
TurntableObject.
```

## 4 — Shop

```
Read design/screens/02-shop.md and design/components/product-grid.md.

Rebuild the shop page and its three components: ProductGrid, ProductCard,
ProductFilters.

ProductCard loses a lot here — no tilt, no shadow, no sketch frame, no margin note,
no badges over the image. Status is communicated by desaturating the image.

The filter chip derivation in the spec (derive tags and sizes from the products the
availability filter currently shows, not from the whole catalogue) is the part most
likely to get implemented the obvious wrong way. Follow the spec's code.

Keep ProductCard's broken-image fallback — all six garments are placeholder URLs
right now.
```

## 5 — Product detail

```
Read design/screens/03-product.md and design/components/construction-gallery.md.

Implement src/app/(site)/product/[slug]/page.tsx with all six bands in order.
Use notFound() rather than falling back to products[0].

The construction gallery renders only when product.marker is set — currently
Midnight Reed Denim alone. Never fabricate marker data for garments without one.

Use one WebGL context for the turntable, driven by the piece index. Not one per
piece.

Sticky nav items must be built from sections that actually exist on the page; the
old #story and #fit anchors were never built and should not come back.
```

## 6 — Cart & drawer

```
Read design/screens/04-cart.md and design/components/cart-and-drawer.md.

Rebuild the cart page, the success page, and CartDrawer. All three share one
vocabulary — hairline rules, no per-row fills, unboxed steppers, tabular figures,
one filled element per view (checkout).

Read the "Why 1180px" section carefully before writing the grid. Three defences
must all survive: collapse at 1180px, summary column minmax(15rem, 18rem) not fixed
20rem, and the name track floored at minmax(7rem, 1fr) not minmax(0, 1fr). A
container query would be better than the viewport breakpoint if you can manage it —
keep the 7rem floor either way.

Cart lines should store productId and look up the product record directly. Do not
port the prototype's startsWith() matching.

Keep 44px touch targets in the drawer. Add the drawer's error-alert treatment to the
cart page too — the page currently has no error state.
```

## 7 — Archive, About, 404

```
Read design/screens/05-archive.md, 07-about.md and 08-not-found.md.

Implement all three. They are short — Archive is PageShell plus CatalogueIndex, and
all three can be server components.

The About prose is the founder's own writing, in ABOUT_PARAGRAPHS. Ship it verbatim;
do not edit for length or tone.

Archive drops the Index/Wall toggle entirely. Check whether SketchFrame still has
other importers before deleting it.
```

## 8 — Projects

```
Read design/screens/06-projects.md.

Implement the projects gallery and detail view. Make the detail view a real route at
src/app/(site)/projects/[slug]/page.tsx rather than local state, so projects are
linkable and can carry their own metadata.

Wire up all 16 real photos — 6 for the wool trousers, 10 for the pleated jorts. The
prototype only used hero + 2 each. Use next/image with explicit dimensions; the
files are large and unoptimised.

Keep the fabric notation verbatim, including the composition percentages.
```

## 9 — Cleanup

```
Read the "Dead components" section of CLAUDE.md.

Find every import of KanjiCanvas, Tilt3DStage, DepthLayer, ParallaxLayer,
CulturalExplainer, MorphingKanji, TiltCard and RollText. Report what still
references each one, then delete the components that are now unreferenced.

Do not delete SketchFrame without checking its importers first.

Then list any dependency in package.json that only these components used.
```

---

## Prompts to avoid

Three that will produce work you have to undo:

- *"Make the cart look better"* — the cart is specced to the pixel. Point at `screens/04-cart.md` instead.
- *"Add hover effects / polish the animations"* — the system has exactly two motion systems, and the tilt/parallax/particle layer was removed on purpose.
- *"Make Shop consistent with Archive"* — they are consistent, in vocabulary. The grid/index split is deliberate; `screens/02-shop.md` explains why.

## When a spec and the prototype disagree

The prototype wins — it is the measured artifact. Then the spec should get fixed.
