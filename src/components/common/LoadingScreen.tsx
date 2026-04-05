'use client';

import { useEffect, useRef, useState } from 'react';

export function LoadingScreen() {
  const [visible, setVisible] = useState<boolean | null>(null);
  const [fading, setFading] = useState(false);
  const animDone = useRef(false);
  const loadDone = useRef(false);
  const fadeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (sessionStorage.getItem('hb-loaded')) {
      setVisible(false);
      return;
    }

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setVisible(false);
      return;
    }

    setVisible(true);

    const tryDismiss = () => {
      if (!animDone.current || !loadDone.current) return;
      sessionStorage.setItem('hb-loaded', '1');
      setFading(true);
      fadeTimer.current = setTimeout(() => setVisible(false), 600);
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
  }, []);

  if (visible === null || !visible) return null;

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
