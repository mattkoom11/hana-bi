'use client';

import { useEffect, useRef, useState } from 'react';

export function CustomScrollbar() {
  const [thumbStyle, setThumbStyle] = useState({ height: 0, top: 0 });
  const [active, setActive] = useState(false);
  const idleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const computeGeometry = () => {
      const viewportH = window.innerHeight;
      const scrollH = document.body.scrollHeight;
      const scrollY = window.scrollY;
      const thumbH = Math.max(30, (viewportH / scrollH) * viewportH);
      const maxScroll = scrollH - viewportH;
      const thumbTop = maxScroll > 0 ? (scrollY / maxScroll) * (viewportH - thumbH) : 0;
      setThumbStyle({ height: thumbH, top: thumbTop });
    };

    const update = () => {
      computeGeometry();
      setActive(true);
      if (idleTimer.current) clearTimeout(idleTimer.current);
      idleTimer.current = setTimeout(() => setActive(false), 1000);
    };

    computeGeometry();
    window.addEventListener('scroll', update, { passive: true });
    return () => {
      window.removeEventListener('scroll', update);
      if (idleTimer.current) clearTimeout(idleTimer.current);
    };
  }, []);

  return (
    <div className="fixed top-0 right-[6px] h-screen w-[2px] pointer-events-none z-50">
      <div
        className="absolute w-[2px] rounded-[1px] transition-opacity duration-300"
        style={{
          background: 'var(--hb-sienna)',
          height: thumbStyle.height,
          top: thumbStyle.top,
          opacity: active ? 0.5 : 0,
        }}
      />
    </div>
  );
}
