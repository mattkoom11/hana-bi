'use client';

import { useEffect, useRef, useState, useSyncExternalStore } from 'react';

const noopSubscribe = () => () => {};

function shouldSkipIntro(): boolean {
  try {
    if (sessionStorage.getItem('hb-loaded')) return true;
  } catch {
    // Storage blocked — show the intro rather than failing.
  }
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function LoadingScreen() {
  // The server has no sessionStorage, so it renders nothing (skip = true) and
  // the client decides on hydration — no setState-in-effect needed.
  const skip = useSyncExternalStore(noopSubscribe, shouldSkipIntro, () => true);
  const [dismissed, setDismissed] = useState(false);
  const [fading, setFading] = useState(false);
  const animDone = useRef(false);
  const loadDone = useRef(false);
  const fadeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (skip) return;

    const tryDismiss = () => {
      if (!animDone.current || !loadDone.current) return;
      setFading(true);
      fadeTimer.current = setTimeout(() => {
        // Marked only once fully hidden, so shouldSkipIntro doesn't cut the fade short.
        try {
          sessionStorage.setItem('hb-loaded', '1');
        } catch {}
        setDismissed(true);
      }, 600);
    };

    const animTimer = setTimeout(() => {
      animDone.current = true;
      tryDismiss();
    }, 2100);

    const onLoad = () => {
      loadDone.current = true;
      tryDismiss();
    };

    if (document.readyState === 'complete') {
      loadDone.current = true;
      tryDismiss();
    } else {
      window.addEventListener('load', onLoad);
    }

    return () => {
      clearTimeout(animTimer);
      if (fadeTimer.current) clearTimeout(fadeTimer.current);
      window.removeEventListener('load', onLoad);
    };
  }, [skip]);

  if (skip || dismissed) return null;

  return (
    <div
      className="fixed inset-0 z-[100] bg-[#0e0c0b] flex items-center justify-center transition-opacity duration-[600ms]"
      style={{ opacity: fading ? 0 : 1 }}
    >
      <svg
        viewBox="0 0 260 120"
        className="w-[40vw] max-w-[320px] overflow-visible"
      >
        <text
          x="50%"
          y="50%"
          dominantBaseline="middle"
          textAnchor="middle"
          fontSize="96"
          fontFamily="serif"
          fill="none"
          stroke="#faf8f4"
          strokeWidth="1"
          className="hanabi-draw"
        >
          花火
        </text>
      </svg>
    </div>
  );
}
