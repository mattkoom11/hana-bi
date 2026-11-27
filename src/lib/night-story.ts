// Scroll maths for the relaunch "one night" story (src/components/relaunch/NightStory.tsx).

const clamp01 = (n: number) => Math.min(1, Math.max(0, n));

/**
 * Opacity of every scene at a given story progress (0–1).
 *
 * Each scene owns an equal slice of the scroll. Scenes cross through black rather than
 * dissolving into each other: a scene fades out over the last `fade` of its slice and the
 * next fades in over the first `fade` of its own, so there is a dark beat between them
 * ("cuts one beat late"). The first scene is lit from the top; the last stays lit at the end.
 */
export function sceneOpacities(progress: number, count: number, fade = 0.12): number[] {
  const p = clamp01(progress) * count;
  return Array.from({ length: count }, (_, i) => {
    const local = p - i;
    if (local < 0 || local > 1) return 0;
    const fadeIn = i === 0 ? 1 : clamp01(local / fade);
    const fadeOut = i === count - 1 ? 1 : clamp01((1 - local) / fade);
    return Math.min(fadeIn, fadeOut);
  });
}

/** Index of the scene whose slice contains `progress`. */
export function activeScene(progress: number, count: number): number {
  return Math.min(count - 1, Math.floor(clamp01(progress) * count));
}

/**
 * Progress through a pinned section: 0 when its top reaches the viewport top,
 * 1 when its bottom reaches the viewport bottom.
 */
export function pinnedProgress(sectionTop: number, sectionHeight: number, viewportHeight: number): number {
  const scrollable = sectionHeight - viewportHeight;
  if (scrollable <= 0) return 0;
  return clamp01(-sectionTop / scrollable);
}
