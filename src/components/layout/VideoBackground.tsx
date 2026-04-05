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
  // Which physical video element is currently showing
  const [aIsActive, setAIsActive] = useState(true);

  // Refs to the two video elements
  const videoARef = useRef<HTMLVideoElement>(null);
  const videoBRef = useRef<HTMLVideoElement>(null);

  // Track clip index for next load — use ref to avoid stale closures in interval
  const nextClipIndexRef = useRef<number>(
    (Math.floor(Math.random() * CLIPS.length) + 1) % CLIPS.length
  );

  // On mount: set video A to a random starting clip and start playing
  useEffect(() => {
    const startIndex = Math.floor(Math.random() * CLIPS.length);
    if (videoARef.current) {
      videoARef.current.src = CLIPS[startIndex];
      videoARef.current.load();
      videoARef.current.play().catch(() => {});
    }
    // Preload first "next" clip into video B
    const nextIndex = (startIndex + 1) % CLIPS.length;
    nextClipIndexRef.current = nextIndex;
    if (videoBRef.current) {
      videoBRef.current.src = CLIPS[nextIndex];
      videoBRef.current.load();
    }
  }, []);

  // Crossfade timer
  useEffect(() => {
    const timer = setInterval(() => {
      setAIsActive((prev) => {
        const nowAIsActive = !prev;
        // The video that just became active is already loaded and ready
        // Start it playing
        const activeVideo = nowAIsActive ? videoARef.current : videoBRef.current;
        activeVideo?.play().catch(() => {});

        // Preload the NEXT clip into the video that just became inactive
        const inactiveVideo = nowAIsActive ? videoBRef.current : videoARef.current;
        const nextIndex = (nextClipIndexRef.current + 1) % CLIPS.length;
        nextClipIndexRef.current = nextIndex;
        if (inactiveVideo) {
          inactiveVideo.src = CLIPS[nextIndex];
          inactiveVideo.load();
        }

        return nowAIsActive;
      });
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
