"use client";

import React, { useEffect, useRef, useState } from "react";

const CLIPS = [
  "/videos/clip-01.mp4",
  "/videos/clip-02.mp4",
  "/videos/clip-03.mp4",
  "/videos/clip-04.mp4",
  "/videos/clip-05.mp4",
  "/videos/clip-06.mp4",
  "/videos/clip-07.mp4",
  "/videos/clip-08.mp4",
  "/videos/clip-09.mp4",
  "/videos/clip-10.mp4",
  "/videos/clip-11.mp4",
  "/videos/clip-12.mp4",
  "/videos/clip-13.mp4",
];

const TRANSITION_MS = 2000;
const MIN_DISPLAY_MS = 8000; // each clip stays on screen at least 8s, looping if needed

export function VideoBackground() {
  const [aIsActive, setAIsActive] = useState(true);

  const videoARef = useRef<HTMLVideoElement>(null);
  const videoBRef = useRef<HTMLVideoElement>(null);

  const aIsActiveRef = useRef(true);
  const nextClipIndexRef = useRef(0);
  const crossfadingRef = useRef(false);
  const clipStartedAtRef = useRef(0); // wall-clock time the current clip first started

  // On mount: load a random starting clip into A, preload next into B
  useEffect(() => {
    const startIndex = Math.floor(Math.random() * CLIPS.length);
    const nextIndex = (startIndex + 1) % CLIPS.length;
    nextClipIndexRef.current = nextIndex;
    clipStartedAtRef.current = Date.now();

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

  useEffect(() => {
    const triggerCrossfade = () => {
      if (crossfadingRef.current) return;
      crossfadingRef.current = true;

      const nextAIsActive = !aIsActiveRef.current;
      const nextActiveVideo = nextAIsActive ? videoARef.current : videoBRef.current;
      nextActiveVideo?.play().catch(() => {});

      aIsActiveRef.current = nextAIsActive;
      setAIsActive(nextAIsActive);
      clipStartedAtRef.current = Date.now();

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

    const onTimeUpdate = () => {
      if (crossfadingRef.current) return;

      const activeVideo = aIsActiveRef.current ? videoARef.current : videoBRef.current;
      if (!activeVideo || isNaN(activeVideo.duration)) return;

      const elapsed = Date.now() - clipStartedAtRef.current;
      const timeLeft = activeVideo.duration - activeVideo.currentTime;

      // Only crossfade on final loop — when we're within 2s of end AND we've
      // been on screen long enough that another loop won't clear the minimum
      const remainingAfterLoop = MIN_DISPLAY_MS - elapsed - timeLeft * 1000;
      if (timeLeft <= TRANSITION_MS / 1000 && remainingAfterLoop <= 0) {
        triggerCrossfade();
      }
    };

    const onEnded = () => {
      if (crossfadingRef.current) return;

      const elapsed = Date.now() - clipStartedAtRef.current;
      if (elapsed < MIN_DISPLAY_MS - TRANSITION_MS) {
        // Not on screen long enough — loop seamlessly
        const activeVideo = aIsActiveRef.current ? videoARef.current : videoBRef.current;
        if (activeVideo) {
          activeVideo.currentTime = 0;
          activeVideo.play().catch(() => {});
        }
      } else {
        // Clip ended right at the boundary — crossfade now
        triggerCrossfade();
      }
    };

    const videoA = videoARef.current;
    const videoB = videoBRef.current;

    videoA?.addEventListener("timeupdate", onTimeUpdate);
    videoB?.addEventListener("timeupdate", onTimeUpdate);
    videoA?.addEventListener("ended", onEnded);
    videoB?.addEventListener("ended", onEnded);

    return () => {
      videoA?.removeEventListener("timeupdate", onTimeUpdate);
      videoB?.removeEventListener("timeupdate", onTimeUpdate);
      videoA?.removeEventListener("ended", onEnded);
      videoB?.removeEventListener("ended", onEnded);
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
