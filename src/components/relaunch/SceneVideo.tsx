"use client";

import { useEffect, useRef } from "react";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

type Props = {
  /** H.264 MP4: plays everywhere. */
  src: string;
  /** Optional VP9 WebM, usually smaller; offered first, MP4 is the fallback. */
  webm?: string;
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
export function SceneVideo({ src, webm, poster, playing, preload = "auto" }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const reducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    if (playing && !reducedMotion) v.play().catch(() => {}); // refused autoplay (iOS Low Power Mode): poster holds
    else v.pause();
  }, [playing, reducedMotion, src, webm]);

  return (
    <video
      ref={videoRef}
      key={webm ?? src} // <source> changes need a fresh element
      className="light-reveal__video"
      poster={poster}
      muted
      loop
      playsInline
      preload={preload}
    >
      {webm && <source src={webm} type="video/webm" />}
      <source src={src} type="video/mp4" />
    </video>
  );
}
