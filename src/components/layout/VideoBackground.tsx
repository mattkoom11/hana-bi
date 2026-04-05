"use client";

import { useEffect, useRef, useState } from "react";

const CLIPS = [
  "/videos/clip-01.mp4",
  "/videos/clip-02.mp4",
  "/videos/clip-03.mp4",
];

const INTERVAL_MS = 20000;
const TRANSITION_MS = 2000;

export function VideoBackground() {
  const [aIsActive, setAIsActive] = useState(true);

  const videoARef = useRef<HTMLVideoElement>(null);
  const videoBRef = useRef<HTMLVideoElement>(null);

  // Ref mirror of aIsActive — lets the interval read current value without stale closure
  const aIsActiveRef = useRef(true);

  // Index of the clip currently preloaded and ready to play in the inactive video
  const nextClipIndexRef = useRef<number>(
    (Math.floor(Math.random() * CLIPS.length) + 1) % CLIPS.length
  );

  // On mount: load a random starting clip into video A, preload next into video B
  useEffect(() => {
    const startIndex = Math.floor(Math.random() * CLIPS.length);
    const nextIndex = (startIndex + 1) % CLIPS.length;
    nextClipIndexRef.current = nextIndex;

    if (videoARef.current) {
      videoARef.current.src = CLIPS[startIndex];
      videoARef.current.load();
      videoARef.current.play().catch(() => {});
    }
    if (videoBRef.current) {
      videoBRef.current.src = CLIPS[nextIndex];
      videoBRef.current.load();
    }
  }, []);

  // Crossfade timer — all side effects happen here, NOT inside the state updater
  useEffect(() => {
    const timer = setInterval(() => {
      const currentAIsActive = aIsActiveRef.current;
      const nextAIsActive = !currentAIsActive;

      // The inactive video is already preloaded — start playing it
      const nextActiveVideo = nextAIsActive ? videoARef.current : videoBRef.current;
      nextActiveVideo?.play().catch(() => {});

      // Swap visibility
      aIsActiveRef.current = nextAIsActive;
      setAIsActive(nextAIsActive);

      // Preload the NEXT clip into the video that just became inactive
      // Consume current nextClipIndexRef, then advance it
      const clipToPreloadNext = (nextClipIndexRef.current + 1) % CLIPS.length;
      nextClipIndexRef.current = clipToPreloadNext;
      const nowInactiveVideo = nextAIsActive ? videoBRef.current : videoARef.current;
      if (nowInactiveVideo) {
        nowInactiveVideo.src = CLIPS[clipToPreloadNext];
        nowInactiveVideo.load();
      }
    }, INTERVAL_MS);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      <video
        ref={videoARef}
        muted
        loop
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
        style={{
          opacity: aIsActive ? 1 : 0,
          transition: `opacity ${TRANSITION_MS}ms ease-in-out`,
        }}
      />
      <video
        ref={videoBRef}
        muted
        loop
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
        style={{
          opacity: !aIsActive ? 1 : 0,
          transition: `opacity ${TRANSITION_MS}ms ease-in-out`,
        }}
      />
    </div>
  );
}
