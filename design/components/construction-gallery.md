# Construction gallery

**Source:** `ConstructionSection` (product screen), plus `TurntableObject`
**Rendered by:** Product detail, **only** when `product.marker` is set
**Suggested paths:** `src/components/product/ConstructionSection.tsx`, `src/components/media/TurntableObject.tsx` — both client

The most distinctive thing on the site. It reads a real production marker and lets you page through every pattern piece the garment is cut from.

## Why this exists, and the one rule

The data is real: `AX100-SELF-36.PLT`, a 2006 marker from **CREATE A MARKER, INC — NYC**, size 36, 30-inch bolt, 3yd 6.204in long, 86.252% utilisation, 25 placements across 13 distinct pieces after dedupe.

**Never fabricate this section.** A construction gallery built from invented piece names would be the single most damaging thing that could be added to this site — the whole register depends on the numbers being real. Garments without a marker simply do not get the section. Currently that means only Midnight Reed Denim has one.

## The marker JSON

`assets/patterns/AX100-SELF-36.json` → ship to `public/patterns/`.

```ts
{
  source: "AX100-SELF-36.PLT",
  producer: "CREATE A MARKER, INC — NYC",
  model: "AX100", size: "36",
  markerWidthIn: 30, markerLength: "3yd 6.204in",
  utilisation: "86.252%", piecesPlaced: 25,
  unitsPerInch: 1000,
  note: string,                  // provenance of the geometry processing
  pieceLabelsFound: string[],
  pieces: Array<{
    name: string;                // "16 BK PKT FLP-2S-2C"
    widthIn: number; heightIn: number; aspect: number;
    labelDistIn: number;
    labelTrusted: boolean;       // false = nearest label too far to attribute confidently
    selfIntersections: number;   // 0 on all pieces
    outline: [number, number][]; // normalised: longest edge 1.0, centred on origin, Y plotter-up
  }>;
}
```

Outlines are despurred (retraced notch marks removed), verified free of self-intersections, deduped by label, normalised. Do not re-normalise or simplify them further.

`labelTrusted: false` surfaces in the UI as ` · label unverified` appended to the meta line. Keep that. Admitting which labels are uncertain is exactly the tone the section depends on.

## Label parsing

The marker writes cutting-room shorthand. Expand it for display while keeping the raw label visible.

```ts
const WORDS = {
  BK: "back", FT: "front", SD: "side", RT: "right", LT: "left",
  PKT: "pocket", PK: "pocket", PTCH: "patch", FLP: "flap", BG: "bag",
  FAC: "facing", HEM: "hem", YOKE: "yoke", WB: "waistband", TAB: "tab",
  FLY: "fly", BTN: "button", EXT: "extension", COIN: "coin",
};
```

`"16 BK PKT FLP-2S-2C"` parses to number `16`, title `back pocket flap`, cut `Cut 2 self · 2 contrast`:

- Leading digits → piece number.
- Remainder splits on `-`. Segment 0 is words → mapped through `WORDS`, lowercased, joined by spaces (unmapped words pass through lowercased).
- Later segments matching `/^(\d+)([SC])$/i` → `"{n} self"` / `"{n} contrast"`, joined with ` · `, prefixed `Cut `.
- No cut segments → `Cut count not marked`. No words → `unlabelled piece`.

Both fallbacks fire on real data. Do not throw.

## Section layout

```css
background: rgba(14,12,11,0.9);
padding: 5rem var(--hb-gutter);
```

`id="construction"`, `class="hb-grain"`. Inner wrapper `max-width: var(--hb-max-width)`, `margin: 0 auto`, `position: relative; z-index: 1`.

| Element | Spec |
|---|---|
| Eyebrow | `Construction — {marker.source}` · mono 0.7rem uppercase · `letter-spacing: var(--hb-track-eyebrow)` · `var(--hb-sienna)` |
| H2 | `Every piece this garment is cut from.` · display italic 300 · `clamp(2rem, 4vw, 3.25rem)` · `line-height: 1.05` · `margin: 1.5rem 0 1rem` |
| Intro | 1.125rem/1.7 · `var(--hb-dark-muted)` · `max-width: 38rem` · `margin-bottom: 3.5rem` |

**Intro is generated from the marker**, not written:

> Read straight off the production marker — {piecesPlaced} placements, {pieces.length} distinct pieces, nested at {utilisation} on a {markerWidthIn}-inch bolt. Drag the piece to turn it.

At current data: *"…25 placements, 13 distinct pieces, nested at 86.252% on a 30-inch bolt."*

**Meta label style** used throughout this section: mono, 0.7rem, uppercase, `letter-spacing: var(--hb-track-meta)`, `var(--hb-dark-muted)`.

## Body grid

`class="hb-construction"`, `display: grid; gap: 3rem; align-items: start`. Column definition comes from a CSS rule (a media query lives here) — index left, stage right on wide viewports, stacked on narrow.

### Left — piece index

`<ol>`, each `<li>` with `border-top: 1px solid var(--hb-dark-border)`, plus the usual empty closing `<li>` with a rule.

Each row is a full-width `<button>`:

```css
display: grid;
grid-template-columns: 3.5rem minmax(0, 1fr);
column-gap: 1.25rem; row-gap: 0.5rem;
align-items: baseline; text-align: left;
padding: 1.125rem 0;
background: transparent; border: 0;
transform: translateX(0);            /* → translateX(1rem) when selected */
opacity: 0.5;                        /* → 1 when selected */
transition: transform 450ms var(--hb-ease-expo-out), opacity 300ms ease;
```

Same shift-and-dim as `CatalogueIndex`, but driven by **selection** rather than hover — this is a picker, not a preview.

- **Number** — `String(number).padStart(2, "0")` or `—`. Meta style + `var(--hb-sienna)` + `letter-spacing: var(--hb-track-catalog)`.
- **Title** — parsed piece name, display italic 300, 1.375rem, `line-height: 1.3`, `min-width: 0`.
- **Second line** — `grid-column: 2`, meta style, `tabular-nums`, a column flex with `row-gap: 0.25rem` holding two spans: the cut spec, then `{widthIn} × {heightIn} in`.

Two separate spans, each on its own line at every width. They were one line: long labels wrapped unpredictably and the rows around them jumped as selection moved. Fixing the rhythm mattered more than the compactness.

### Right — stage

`class="hb-construction-stage"`, `display: flex; flex-direction: column; gap: 1.25rem`.

**Turntable frame** — `border: 1px solid var(--hb-dark-border)`, flex-centred, `padding: 1rem`, `touch-action: none`, `cursor: grab` → `grabbing` while dragging:

```jsx
<TurntableObject
  key={markerUrl + piece.name}
  patternUrl={markerUrl}
  pieceName={piece.name}
  rotation={rotation ?? undefined}     // undefined = auto-rotate
  size={380}
  speed={0.16}
/>
```

**One WebGL context, not thirteen.** The index does the browsing; the stage renders one piece. This is the architectural point of the section — a grid of thirteen turntables was the obvious design and would not survive on a phone.

**Drag to turn** — pointer events with `setPointerCapture`:

```ts
onPointerDown: drag = { x: e.clientX, from: rotation ?? 0 }; setRotation(rotation ?? 0);
onPointerMove: if (drag) setRotation(drag.from + (e.clientX - drag.x) * 0.01);
onPointerUp / onPointerCancel: drag = null;
```

`0.01` radians per pixel. Setting `rotation` to a number takes over from auto-rotation; selecting another piece resets it to `null`, resuming auto-rotation.

**Caption block** — `gap: 0.5rem`:

- Raw label (`piece.name`) — meta style, `var(--hb-sienna)`. The shorthand verbatim.
- Parsed title — display italic 300, 1.75rem, `line-height: 1.1`.
- Meta line — `{cut} · {widthIn} × {heightIn} in`, plus ` · label unverified` when `labelTrusted === false`.
- **`Resume rotation`** button, only while `rotation !== null` — meta style, `align-self: flex-start`, `margin-top: 0.5rem`, `border: 1px solid var(--hb-dark-border)`, `padding: 0.5rem 0.875rem`, transparent background. Sets `rotation` back to `null`.

**Marker footer** — meta style at `opacity: 0.6`, `line-height: 1.8`, `border-top: 1px solid var(--hb-dark-border)`, `padding-top: 1rem`:

```
{marker.producer}
Size {marker.size} · {marker.markerLength} · {marker.utilisation}
```

## State

| Variable | Notes |
|---|---|
| `marker` | fetched JSON, `null` until loaded |
| `index` | selected piece, default 0 |
| `rotation` | `null` = auto-rotate, number = user-driven |
| `drag` (ref) | `{ x, from }` while dragging |

In Next.js, import the JSON or read it server-side and pass it as a prop — the marker is static, and the section is well worth having in the initial HTML rather than fetched client-side.

## Responsive

The `.hb-construction` class exists specifically to carry a media query: two columns wide, stacked narrow, and `TurntableObject` `size` reduced below ~640px. Keep the class-based approach here rather than inlining — the breakpoint is genuinely a layout concern, not a style token.

## TurntableObject

Takes `patternUrl`, `pieceName`, `size`, `speed`, optional `rotation`, `style`. It loads the marker, finds the named piece, and renders its outline as a slowly turning object. `speed: 0.16` throughout. When `rotation` is a number it is authoritative; when `undefined` the object rotates on its own.

The `key={markerUrl + piece.name}` on the element forces a clean remount per piece — the geometry is per-piece and there is no cross-piece interpolation to preserve.

Home also uses it directly, one piece per `ScrollStage` step at `size={560}`, so the implementation must work both inside a scroll stage and inside a drag frame.
