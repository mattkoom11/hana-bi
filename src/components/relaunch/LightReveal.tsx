"use client";

// Relaunch prototype: a scene in darkness, revealed by a single warm light the visitor carries.
// The light follows the pointer with a lag; with no input it drifts slowly on its own (phones,
// idle visitors). Position is written to CSS variables every frame — React does not re-render
// while the light moves.
//
// NOTE: the subtraction-pass rules in CLAUDE.md ban "spotlight cursors". This lives on the
// `relaunch` branch at /lab/light-reveal as an experiment; adopting it means amending that rule.

import { useEffect, useRef, type ReactNode } from "react";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { approach, approachPoint, driftPoint, normalise, smoothingAlpha, type Point } from "@/lib/light-reveal";
import "./light-reveal.css";

export type LightTuning = {
  /** Light radius in vmin. */
  radius: number;
  /** 0–1: fraction of the radius that is fully lit before falloff begins. */
  core: number;
  /** Lag time constant in ms (0 = glued to the pointer). */
  lagMs: number;
  /** 0–1: strength of the tungsten tint inside the light. */
  warmth: number;
  /** 0–1: how much of the scene shows outside the light. 0 = crushed black. */
  ambient: number;
};

// Tuned by Matthew in /lab/light-reveal on 2026-11-26.
export const DEFAULT_TUNING: LightTuning = {
  radius: 31,
  core: 0.56,
  lagMs: 160,
  warmth: 0.3,
  ambient: 0.05,
};

const IDLE_AFTER_MS = 2500;
const DRIFT_LAG_MS = 1400; // the hand-off from pointer to drift is always slow
const DIM_RADIUS_FACTOR = 0.55; // light shrinks when the pointer leaves

type Props = {
  /** What sits in the dark: one SceneVideo, or a stack of them. */
  media: ReactNode;
  tuning?: LightTuning;
  /** Copy and controls, drawn above the darkness (never masked). */
  children?: ReactNode;
};

export function LightReveal({ media, tuning = DEFAULT_TUNING, children }: Props) {
  const rootRef = useRef<HTMLDivElement>(null);
  // The rAF loop reads tuning through a ref so slider changes don't restart it.
  const tuningRef = useRef(tuning);
  useEffect(() => {
    tuningRef.current = tuning;
  }, [tuning]);

  const reducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    let pos: Point = { x: 0.5, y: 0.5 };
    let target: Point = { x: 0.5, y: 0.5 };
    let radius = 0; // fades up from nothing on load
    let lastInput = -Infinity;
    let pointerInside = false;
    let last = performance.now();
    const start = last;
    let frame = 0;

    const onMove = (e: PointerEvent) => {
      target = normalise(e.clientX, e.clientY, root.getBoundingClientRect());
      lastInput = performance.now();
      pointerInside = true;
    };
    const onLeave = () => {
      pointerInside = false;
      lastInput = performance.now() - IDLE_AFTER_MS + 600; // drift takes over shortly after leaving
    };

    root.addEventListener("pointermove", onMove);
    root.addEventListener("pointerdown", onMove);
    root.addEventListener("pointerleave", onLeave);

    const tick = (now: number) => {
      const dt = Math.min(now - last, 100); // a backgrounded tab should not cause a jump
      last = now;
      const t = tuningRef.current;
      // A resting mouse keeps the light where it is; drift only takes over once the pointer
      // has left (or a touch has lifted — touch pointers fire pointerleave on lift).
      const idle = !pointerInside && now - lastInput > IDLE_AFTER_MS;

      let lag = t.lagMs;
      if (idle) {
        target = reducedMotion ? { x: 0.5, y: 0.5 } : driftPoint((now - start) / 1000);
        lag = Math.max(t.lagMs, DRIFT_LAG_MS);
      }
      pos = approachPoint(pos, target, smoothingAlpha(dt, lag));

      const radiusTarget = pointerInside || idle ? t.radius : t.radius * DIM_RADIUS_FACTOR;
      radius = approach(radius, radiusTarget, smoothingAlpha(dt, 900));

      root.style.setProperty("--lx", `${(pos.x * 100).toFixed(3)}%`);
      root.style.setProperty("--ly", `${(pos.y * 100).toFixed(3)}%`);
      root.style.setProperty("--lr", radius.toFixed(3));

      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(frame);
      root.removeEventListener("pointermove", onMove);
      root.removeEventListener("pointerdown", onMove);
      root.removeEventListener("pointerleave", onLeave);
    };
  }, [reducedMotion]);

  // Slow-changing values go through React; position goes through the rAF loop above.
  const style = {
    "--lcore": tuning.core,
    "--lwarm": tuning.warmth,
    "--lambient": tuning.ambient,
  } as React.CSSProperties;

  return (
    <div ref={rootRef} className="light-reveal" style={style}>
      <div className="light-reveal__media" aria-hidden="true">
        {media}
      </div>
      <div className="light-reveal__warmth" aria-hidden="true" />
      <div className="light-reveal__dark" aria-hidden="true" />
      <div className="light-reveal__content">{children}</div>
    </div>
  );
}
