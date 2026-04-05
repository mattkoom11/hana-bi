"use client";

import React, { useEffect, useRef, useState } from "react";

const CLIPS = [
  "/videos/clip-01.mp4",
  "/videos/clip-02.mp4",
  "/videos/clip-03.MP4",
  "/videos/clip-04.mp4",
  "/videos/clip-05.mp4",
  "/videos/clip-06.mp4",
  "/videos/clip-07.mp4",
  "/videos/clip-08.mp4",
  "/videos/clip-09.mp4",
  "/videos/clip-10.mp4",
  "/videos/clip-11.mp4",
];

const TRANSITION_MS = 2000;

export function VideoBackground() {
  const [aIsActive, setAIsActive] = useState(true);

  const videoARef = useRef<HTMLVideoElement>(null);
  const videoBRef = useRef<HTMLVideoElement>(null);

  const aIsActiveRef = useRef(true);
  const nextClipIndexRef = useRef(0);
  const crossfadingRef = useRef(false); // prevent double-trigger per clip

  // On mount: load a random starting clip into A, preload next into B
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

  // Crossfade trigger — fires when the active clip is ~2s from its end
  useEffect(() => {
    const triggerCrossfade = () => {
      if (crossfadingRef.current) return;

      const activeVideo = aIsActiveRef.current ? videoARef.current : videoBRef.current;
      if (!activeVideo || isNaN(activeVideo.duration)) return;

      const timeLeft = activeVideo.duration - activeVideo.currentTime;
      if (timeLeft > TRANSITION_MS / 1000) return;

      crossfadingRef.current = true;

      const nextAIsActive = !aIsActiveRef.current;
      const nextActiveVideo = nextAIsActive ? videoARef.current : videoBRef.current;
      nextActiveVideo?.play().catch(() => {});

      aIsActiveRef.current = nextAIsActive;
      setAIsActive(nextAIsActive);

      // After transition, preload the clip after next into the now-inactive video
      setTimeout(() => {
        const clipToPreload = (nextClipIndexRef.current + 1) % CLIPS.length;
        nextClipIndexRef.current = clipToPreload;

        const nowInactive = nextAIsActive ? videoBRef.current : videoARef.current;
        if (nowInactive) {
          nowInactive.src = CLIPS[clipToPreload];
          nowInactive.load();
        }

        crossfadingRef.current = false;
      }, TRANSITION_MS);
    };

    const videoA = videoARef.current;
    const videoB = videoBRef.current;

    videoA?.addEventListener("timeupdate", triggerCrossfade);
    videoB?.addEventListener("timeupdate", triggerCrossfade);

    return () => {
      videoA?.removeEventListener("timeupdate", triggerCrossfade);
      videoB?.removeEventListener("timeupdate", triggerCrossfade);
    };
  }, []);

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      <video
        ref={videoARef}
        muted
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
