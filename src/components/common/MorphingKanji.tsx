'use client';

import { useEffect, useRef, useState } from 'react';

interface KanjiStep {
  kanji: string;
  label: string;
  reading: string;
}

const STEPS: KanjiStep[] = [
  { kanji: '花', label: 'Hana', reading: 'flower' },
  { kanji: '火', label: 'Bi', reading: 'fire · spark' },
  { kanji: '花火', label: 'Hana-Bi', reading: 'fireworks · the brand' },
];

interface MorphingKanjiProps {
  className?: string;
}

export function MorphingKanji({ className = '' }: MorphingKanjiProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const onScroll = () => {
      const rect = el.getBoundingClientRect();
      const scrollable = rect.height - window.innerHeight;
      if (scrollable <= 0) return;
      const progress = Math.max(0, Math.min(1, -rect.top / scrollable));
      const idx = Math.min(STEPS.length - 1, Math.floor(progress * STEPS.length));
      setActiveIndex(idx);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll(); // run once on mount
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div
      ref={sectionRef}
      role="region"
      aria-label="Hana-Bi name etymology"
      className={`relative ${className}`}
      style={{ height: `${STEPS.length * 100}vh` }}
    >
      <div className="sticky top-0 h-screen flex items-center justify-center overflow-hidden">
        {STEPS.map((step, i) => (
          <div
            key={step.kanji}
            className="absolute inset-0 flex flex-col items-center justify-center transition-opacity duration-700 ease-in-out"
            style={{ opacity: i === activeIndex ? 1 : 0, pointerEvents: i === activeIndex ? 'auto' : 'none', willChange: 'opacity' }}
            aria-hidden={i !== activeIndex}
          >
            <span
              aria-hidden="true"
              className="select-none block"
              style={{
                fontSize: 'clamp(9rem, 28vw, 22rem)',
                lineHeight: 1,
                fontFamily: 'var(--hb-font-display)',
                color: 'var(--hb-dark-kanji)',
                letterSpacing: '-0.02em',
              }}
            >
              {step.kanji}
            </span>
            <div className="mt-6 space-y-1 text-center">
              <p
                className="text-xs uppercase tracking-[0.55em] text-[var(--hb-sienna)]"
                style={{ fontFamily: 'var(--hb-font-mono)' }}
              >
                {step.label}
              </p>
              <p className="text-sm text-[var(--hb-dark-muted)]">{step.reading}</p>
            </div>
          </div>
        ))}

        {/* Pager */}
        <div
          className="absolute bottom-8 right-8 text-xs text-[var(--hb-dark-muted)] tabular-nums"
          style={{ fontFamily: 'var(--hb-font-mono)' }}
          aria-hidden="true"
        >
          {String(activeIndex + 1).padStart(2, '0')} / {String(STEPS.length).padStart(2, '0')}
        </div>
      </div>
    </div>
  );
}
