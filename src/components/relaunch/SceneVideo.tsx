"use client";

import { useEffect, useRef } from "react";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

type Props = {
  src: string;
  poster?: string;
  /** Only scenes on or next to screen should decode video. */
  playing: boolean;
  /** Far-off scenes fetch nothing until they come near (play() starts the fetch). */
  preload?: "auto" | "metadata" | "none";
};

/**
 * One muted, looping background clip for the relaunch scenes. Plays only when asked and
 * never under reduced motion (the first frame, or the poster, holds instead).
 */
export function SceneVideo({ src, poster, playing, preload = "auto" }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const reducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    if (playing && !reducedMotion) v.play().catch(() => {}); // refused autoplay (iOS Low Power Mode): poster holds
    else v.pause();
  }, [playing, reducedMotion, src]);

  return (
    <video
      ref={videoRef}
      className="light-reveal__video"
      src={src}
      poster={poster}
      muted
      loop
      playsInline
      preload={preload}
    />
  );
}
