'use client';

import { ReactNode, useEffect, useRef, useState } from 'react';

interface Panel {
  id: string;
  content: ReactNode;
}

interface StickyScrollSectionProps {
  sectionLabel: string;
  panels: Panel[];
  className?: string;
}

export function StickyScrollSection({
  sectionLabel,
  panels,
  className = '',
}: StickyScrollSectionProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const panelEls = Array.from(
      container.querySelectorAll<HTMLDivElement>('[data-panel]')
    );

    const obs = new IntersectionObserver(
      (entries) => {
        let bestIndex = -1;
        let bestRatio = 0;
        entries.forEach((entry) => {
          const i = panelEls.indexOf(entry.target as HTMLDivElement);
          if (entry.isIntersecting && entry.intersectionRatio > bestRatio) {
            bestRatio = entry.intersectionRatio;
            bestIndex = i;
          }
        });
        if (bestIndex !== -1) setActiveIndex(bestIndex);
      },
      { threshold: [0, 0.5, 1] }
    );

    panelEls.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, [panels]);

  const progress =
    panels.length > 1 ? (activeIndex / (panels.length - 1)) * 100 : 100;

  return (
    <div
      ref={containerRef}
      className={`relative flex ${className}`}
    >
      {/* Sticky sidebar */}
      <aside
        aria-label={`${sectionLabel} progress`}
        className="sticky top-0 h-screen w-40 flex-shrink-0 flex flex-col justify-between py-16 pl-4 pr-6"
      >
        <div className="space-y-4">
          <p
            className="text-[0.6rem] uppercase tracking-[0.45em] text-[var(--hb-sienna)]"
            style={{ fontFamily: 'var(--hb-font-mono)' }}
          >
            {sectionLabel}
          </p>
          {/* Progress bar */}
          <div className="h-px w-full bg-[var(--hb-dark-border)] relative overflow-hidden">
            <div
              className="absolute inset-y-0 left-0 bg-[var(--hb-sienna)] transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Pager */}
        <p
          className="text-xs text-[var(--hb-dark-muted)] tabular-nums"
          style={{ fontFamily: 'var(--hb-font-mono)' }}
          aria-hidden="true"
        >
          {String(activeIndex + 1).padStart(2, '0')} /{' '}
          {String(panels.length).padStart(2, '0')}
        </p>
      </aside>

      {/* Scrollable content panels */}
      <div className="flex-1">
        {panels.map((panel) => (
          <div
            key={panel.id}
            data-panel
            className="min-h-screen flex items-center py-24 pr-8 lg:pr-20"
          >
            {panel.content}
          </div>
        ))}
      </div>
    </div>
  );
}
