import { describe, expect, it } from "vitest";
import { approach, approachPoint, driftPoint, normalise, smoothingAlpha } from "./light-reveal";

describe("smoothingAlpha", () => {
  it("snaps when lag is zero", () => {
    expect(smoothingAlpha(16, 0)).toBe(1);
  });

  it("does not move when no time has passed", () => {
    expect(smoothingAlpha(0, 300)).toBe(0);
  });

  it("covers ~63% of the gap after one time constant", () => {
    expect(smoothingAlpha(300, 300)).toBeCloseTo(1 - Math.exp(-1), 10);
  });

  it("is frame-rate independent: two 8ms steps equal one 16ms step", () => {
    const a8 = smoothingAlpha(8, 200);
    let v = 0;
    v = approach(v, 1, a8);
    v = approach(v, 1, a8);
    expect(v).toBeCloseTo(approach(0, 1, smoothingAlpha(16, 200)), 10);
  });

  it("never overshoots the target", () => {
    let v = 0;
    for (let i = 0; i < 500; i++) {
      v = approach(v, 1, smoothingAlpha(16, 120));
      expect(v).toBeLessThanOrEqual(1);
    }
  });
});

describe("approachPoint", () => {
  it("moves both axes by the same fraction", () => {
    expect(approachPoint({ x: 0, y: 0 }, { x: 1, y: 0.5 }, 0.5)).toEqual({ x: 0.5, y: 0.25 });
  });
});

describe("driftPoint", () => {
  it("stays inside the middle of the frame", () => {
    for (let t = 0; t < 600; t += 0.5) {
      const p = driftPoint(t);
      expect(p.x).toBeGreaterThanOrEqual(0.2);
      expect(p.x).toBeLessThanOrEqual(0.8);
      expect(p.y).toBeGreaterThanOrEqual(0.3);
      expect(p.y).toBeLessThanOrEqual(0.7);
    }
  });
});

describe("normalise", () => {
  const rect = { left: 100, top: 50, width: 400, height: 200 };

  it("maps the rect to 0–1", () => {
    expect(normalise(300, 150, rect)).toEqual({ x: 0.5, y: 0.5 });
  });

  it("clamps points outside the rect", () => {
    expect(normalise(0, 1000, rect)).toEqual({ x: 0, y: 1 });
  });

  it("centres when the rect has no size", () => {
    expect(normalise(10, 10, { left: 0, top: 0, width: 0, height: 0 })).toEqual({ x: 0.5, y: 0.5 });
  });
});
