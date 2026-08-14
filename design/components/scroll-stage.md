# ScrollStage

**Source:** `components/scroll/ScrollStage.jsx`
**Used by:** Home (act 2, the process story)
**Suggested path:** `src/components/scroll/ScrollStage.tsx` — client component

A pinned viewport whose content is driven by scroll progress. Reference-derived from two sites the founder collected (原口沙輔, Kenichi Aikawa) — "it evolves as I scroll," "rotates the center."

This generalises the mechanic the retired `MorphingKanji` used for the 花火 etymology. It replaced that component; the etymology sequence is gone and this tells the production story instead.

One of only **two** motion systems in the site (the other is the video crossfade). Everything else is a plain CSS transition. Do not add a third.

## Props

```ts
{
  steps?: Array<{ id?, eyebrow?, kanji?, title, body?, caption? }>;
  scrollTarget?: HTMLElement | null;    // scroll container; falls back to window
  rotateCenter?: boolean;               // default false
  rotateDegrees?: number;               // default 360
  height?: string;
  center?: ReactNode | ((index, progress) => ReactNode);
  renderStep?: (step, { index, isActive, local, progress }) => ReactNode;
  variant?: "dark" | "light";           // default dark
  showPager?: boolean;                  // default true
  style?: CSSProperties;
}
```

## Structure

Outer: `position: relative; min-height: {steps.length * 100}vh`. Four steps means 400vh of scroll — the pinned stage advances through them.

Inner: `position: sticky; top: 0; height: 100vh; overflow: hidden`, flex-centred.

## Progress

```ts
const rect = el.getBoundingClientRect();
const viewportH = container ? container.clientHeight : window.innerHeight;
const containerTop = container ? container.getBoundingClientRect().top : 0;
const scrollable = rect.height - viewportH;
if (scrollable <= 0) return;
progress = clamp01((containerTop - rect.top) / scrollable);
```

Listener is `{ passive: true }` on the container or window, plus a `resize` listener, and reads once on mount. `activeIndex = min(count - 1, floor(progress * count))`.

Per-step local progress: `local = clamp01(progress * count - i)` — available to `renderStep` for per-step motion.

Prefer this over IntersectionObserver: the design needs continuous progress for the hairline and the object handover, not discrete enter/exit events.

## Centre object

When `center` is a **function**, each step gets its own object and neighbours stay mounted so the handover is a crossfade rather than a cut:

```ts
centerLayers = range(count).filter(i => Math.abs(i - activeIndex) <= 1);
```

Each layer is absolutely positioned, `opacity: i === activeIndex ? 1 : 0`, `transition: opacity 700ms ease-in-out`, `will-change: opacity`.

Keeping ±1 mounted matters when the centre is a `TurntableObject` — a WebGL context that mounts on step entry would show a blank frame during the crossfade.

Wrapper is `aria-hidden`, `pointer-events: none`, `position: absolute; inset: 0`, and when `rotateCenter` is set gets `transform: rotate({progress * rotateDegrees}deg)` with `will-change: transform`. Home does **not** rotate the wrapper — the object turns on its own axis instead.

## Steps

Each step is absolutely positioned, `inset: 0`, column-flex, centred, `padding: 0 var(--hb-gutter)`, `text-align: center`, `aria-hidden={!isActive}`:

```css
opacity: {isActive ? 1 : 0};
pointer-events: {isActive ? "auto" : "none"};
transform: {isActive ? `translateY(${(local - 0.5) * -24}px)` : "translateY(16px)"};
transition: opacity 700ms ease-in-out, transform 700ms var(--hb-ease-expo-out);
will-change: opacity, transform;
```

The active step drifts 24px upward across its own span — from `+12px` to `−12px` as `local` runs 0→1. Subtle, and it is what keeps the pinned viewport from feeling frozen.

### Default step rendering

| Element | Spec |
|---|---|
| Eyebrow | mono · `var(--hb-label-xs)` · uppercase · `letter-spacing: var(--hb-track-eyebrow)` (0.5em) · `var(--hb-sienna)` · `margin-bottom: 1.5rem` |
| Kanji (optional) | `var(--hb-font-kanji)` · `clamp(6rem, 20vw, 16rem)` · `line-height: 1` · `var(--hb-dark-kanji)` on dark, `rgba(26,26,26,0.06)` on light · `aria-hidden` |
| Title | display italic 300 · `clamp(2rem, 5vw, 4rem)` · `line-height: 1.05` · `letter-spacing: -0.01em` · `fg` · `text-wrap: balance` |
| Body | 1.125rem · `line-height: 1.7` · `dim` · `max-width: 34rem` · `margin-top: 1.5rem` |
| Caption | mono · `var(--hb-label-2xs)` (0.6rem) · uppercase · `letter-spacing: var(--hb-track-meta)` · `dim` · `opacity: 0.7` · `margin-top: 2rem` |

Home uses the default rendering; `renderStep` exists for future stages and is unused so far.

## Pager & progress hairline

**Pager** — `position: absolute; bottom: 2rem; right: 2rem`, `aria-hidden`, mono `var(--hb-label-xs)`, `tabular-nums`, `dim`: `01 / 04`, both numbers zero-padded to 2.

**Hairline** — `position: absolute; bottom: 0; left: 0; right: 0; height: 2px`, track in `var(--hb-dark-border)` / `var(--hb-border)`, fill `width: {progress * 100}%` in `var(--hb-sienna)` at `opacity: 0.5`.

2px matches the custom scrollbar's weight — the two read as the same instrument.

## Soft scroll

`tokens/motion.css` documents a *feel*, not a component: lerp the scroll position toward its target rather than jumping (`--hb-scroll-lerp: 0.085`), with a very slight overshoot before settling (`--hb-scroll-overshoot: 1.03`, `--hb-scroll-settle: 700ms`, `--hb-ease-soft-bounce`).

Past `0.12` lerp it reads as lag rather than softness. If a smooth-scroll library is introduced, these are the values to configure it with — and note it will change how `ScrollStage` progress feels, so tune them together.

## Accessibility

`prefers-reduced-motion` is handled globally in `tokens/motion.css` (all animations and transitions collapse to 0.01ms). The scroll-driven position updates are not animations, so the stage still advances — it simply stops easing. That is the correct behaviour; do not disable the stage entirely, or reduced-motion users lose the content.

## Responsive

Type already scales via `clamp`. Below 640px, reduce the centre object's `size` prop (560 → ~320) and consider `min-height: {count * 100}svh` — `vh` overshoots on mobile browsers with dynamic chrome, which leaves dead scroll at the end of the stage.
