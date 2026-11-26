import { describe, expect, it } from "vitest";
import { activeScene, pinnedProgress, sceneOpacities } from "./night-story";

describe("sceneOpacities", () => {
  it("opens on the first scene fully lit", () => {
    expect(sceneOpacities(0, 5)).toEqual([1, 0, 0, 0, 0]);
  });

  it("ends on the last scene fully lit", () => {
    expect(sceneOpacities(1, 5)).toEqual([0, 0, 0, 0, 1]);
  });

  it("shows exactly one scene, fully, mid-slice", () => {
    expect(sceneOpacities(0.5, 5)).toEqual([0, 0, 1, 0, 0]);
  });

  it("passes through black at every boundary", () => {
    for (let b = 1; b < 5; b++) {
      const ops = sceneOpacities(b / 5, 5);
      expect(Math.max(...ops)).toBe(0);
    }
  });

  it("never lights two scenes at once", () => {
    for (let p = 0; p <= 1; p += 0.001) {
      const lit = sceneOpacities(p, 5).filter((o) => o > 0);
      expect(lit.length).toBeLessThanOrEqual(1);
    }
  });

  it("fades over the given fraction of a slice", () => {
    // scene 1 spans 0.2–0.4; with fade 0.25 it is half in at local 0.125 → progress 0.225
    expect(sceneOpacities(0.225, 5, 0.25)[1]).toBeCloseTo(0.5, 10);
  });

  it("clamps progress outside 0–1", () => {
    expect(sceneOpacities(-1, 3)).toEqual([1, 0, 0]);
    expect(sceneOpacities(2, 3)).toEqual([0, 0, 1]);
  });
});

describe("activeScene", () => {
  it("maps progress to slices and keeps the end on the last scene", () => {
    expect(activeScene(0, 5)).toBe(0);
    expect(activeScene(0.39, 5)).toBe(1);
    expect(activeScene(1, 5)).toBe(4);
  });
});

describe("pinnedProgress", () => {
  it("is 0 before the section reaches the top", () => {
    expect(pinnedProgress(200, 5000, 1000)).toBe(0);
  });

  it("is 1 once the section bottom reaches the viewport bottom", () => {
    expect(pinnedProgress(-4000, 5000, 1000)).toBe(1);
  });

  it("is linear in between", () => {
    expect(pinnedProgress(-2000, 5000, 1000)).toBe(0.5);
  });

  it("is 0 when the section is no taller than the viewport", () => {
    expect(pinnedProgress(-10, 800, 1000)).toBe(0);
  });
});
