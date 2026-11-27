// Pure maths for the relaunch light-reveal prototype (src/components/relaunch/LightReveal.tsx).
// Kept free of DOM so it can be unit-tested.

export type Point = { x: number; y: number };

/**
 * Frame-rate-independent exponential smoothing factor.
 * `tauMs` is the time constant: after tauMs the value has covered ~63% of the gap.
 * Exponential (not spring) on purpose: it eases in and never overshoots — the brand's
 * motion rule is "nothing bounces".
 */
export function smoothingAlpha(dtMs: number, tauMs: number): number {
  if (tauMs <= 0) return 1;
  if (dtMs <= 0) return 0;
  return 1 - Math.exp(-dtMs / tauMs);
}

export function approach(current: number, target: number, alpha: number): number {
  return current + (target - current) * alpha;
}

export function approachPoint(current: Point, target: Point, alpha: number): Point {
  return { x: approach(current.x, target.x, alpha), y: approach(current.y, target.y, alpha) };
}

/**
 * Idle drift path in normalised (0–1) coordinates: a slow Lissajous figure that keeps
 * the light inside the middle of the frame. Two incommensurate frequencies so the path
 * does not visibly repeat.
 */
export function driftPoint(tSeconds: number): Point {
  return {
    x: 0.5 + 0.28 * Math.sin(tSeconds * 0.13),
    y: 0.5 + 0.18 * Math.sin(tSeconds * 0.21 + 1.1),
  };
}

/** Pointer position → normalised coordinates within a rect, clamped to 0–1. */
export function normalise(clientX: number, clientY: number, rect: { left: number; top: number; width: number; height: number }): Point {
  const clamp = (v: number) => Math.min(1, Math.max(0, v));
  return {
    x: rect.width > 0 ? clamp((clientX - rect.left) / rect.width) : 0.5,
    y: rect.height > 0 ? clamp((clientY - rect.top) / rect.height) : 0.5,
  };
}
