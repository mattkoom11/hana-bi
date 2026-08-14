# VideoBackground

**Source:** `components/layout/VideoBackground.jsx`
**Mounted once** in the site layout — it sits behind every page
**Suggested path:** `src/components/layout/VideoBackground.tsx` — client component

The site's ground floor. Every dark surface is a translucent panel over this; every paper surface is a slightly translucent sheet over it. It is the reason the two-background system reads as two *surfaces* rather than two colours.

One of only two motion systems in the site (the other is `ScrollStage`).

## Props

```ts
{
  clips?: string[];        // video sources; falls back to gradient panels when absent
  scrimOpacity?: number;   // default 0.6
}
```

## Exported constants

```ts
export const TRANSITION_MS = 2000;    // crossfade duration
export const MIN_DISPLAY_MS = 8000;   // minimum time on any one clip
```

These are the cadence. The original site's timing, preserved exactly: **8 seconds minimum per clip, 2 second crossfade.**

## The two-element crossfade

Two stacked `<video muted playsInline>` elements, A and B. One is active, the other holds the *next* clip preloaded. On crossfade, active/inactive swap and — after `TRANSITION_MS` — the newly idle element loads the clip after that.

```css
position: absolute; inset: 0;
width: 100%; height: 100%; object-fit: cover;
opacity: {isActive ? 1 : 0};
transition: opacity 2000ms ease-in-out;
```

Start index is **random** (`Math.floor(Math.random() * sources.length)`), next is `(start + 1) % length`. From the source; it means the site does not open on the same clip every visit.

Wrapper: `position: absolute; inset: 0; overflow: hidden; pointer-events: none; z-index: 0`.

## Crossfade timing — the important logic

A clip crossfades on its **final loop**, once the 8s floor is met, so the transition lands on a natural clip boundary rather than cutting mid-motion:

```ts
const timeLeft = active.duration - active.currentTime;
const elapsed  = Date.now() - clipStartedAt;
if (timeLeft <= TRANSITION_MS / 1000 && MIN_DISPLAY_MS - elapsed - timeLeft * 1000 <= 0) {
  triggerCrossfade();
}
```

And on `ended`, a clip shorter than the floor **loops** rather than advancing early:

```ts
if (elapsed < MIN_DISPLAY_MS - TRANSITION_MS) {
  active.currentTime = 0; active.play();
} else {
  triggerCrossfade();
}
```

A `crossfading` ref guards against re-entry. Both handlers are bound to both video elements.

This is subtle and easy to lose in a rewrite. If clips start cutting mid-motion or advancing after 3 seconds, this block is why.

## Scrim

A single non-interactive layer above the video, below all content:

```css
position: absolute; inset: 0;
background: rgba(14, 12, 11, {scrimOpacity});   /* default 0.6 */
z-index: 1;
```

`--overlay-video-scrim` in the tokens is the same value. Every page surface then adds its own translucency on top — `rgba(14,12,11,0.8)` for dark `PageShell`, `rgba(250,248,244,0.85)` for light. The stack is: video → scrim → page surface → content.

## Placeholder mode

With no `clips` prop, the component falls back to four gradient panels running the same 8s/2s cadence on a timer:

```
linear-gradient(160deg, #17130f 0%, #2a2118 45%, #0e0c0b 100%)
linear-gradient(200deg, #0e0c0b 0%, #241d19 50%, #3b3025 100%)
linear-gradient(140deg, #221c18 0%, #0e0c0b 60%, #1d1712 100%)
linear-gradient(190deg, #2b241c 0%, #14100d 55%, #0e0c0b 100%)
```

The placeholder path skips entirely when `prefers-reduced-motion` is set (no timer at all), whereas the video path keeps playing. Worth aligning: pause video for reduced-motion users and show a single still frame.

Pass the real sources and the two-`<video>` path takes over with no other change. **Keep the fallback** — it is a real degradation path for slow connections and for any environment where the clips are absent, and it is what every screenshot in this handoff was designed against.

Note for this repo specifically: `public/videos/` already holds 23 real clips locally (gitignored, not committed) — the current implementation already wires the two-`<video>` crossfade to them. Confirm it matches this cadence rather than rebuilding from the placeholder path.

## Production notes

Worth having, whether or not already present:

- `preload="auto"` on the idle element only; the active one is already playing.
- A `poster` frame so first paint is not black.
- Total payload — 23 clips is a lot of bytes on the ground floor of every page. Consider a smaller rotation on mobile, or a still image below 640px.
- `playsInline` and `muted` are both required for iOS autoplay. Do not remove either.
- If clips carry audio tracks, strip them at encode. The site has no sound.
