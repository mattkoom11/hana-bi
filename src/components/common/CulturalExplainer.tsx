'use client';

import { useEffect, useRef, useState } from 'react';

interface Term {
  kanji: string;
  reading: string;
  meaning: string;
}

interface CulturalExplainerProps {
  term: Term;
  trigger?: 'scroll' | 'hover';
  className?: string;
}

export function CulturalExplainer({
  term,
  trigger = 'scroll',
  className = '',
}: CulturalExplainerProps) {
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (trigger !== 'scroll') return;
    const el = ref.current;
    if (!el) return;

    // Immediately show for reduced-motion users
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.4 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [trigger]);

  return (
    <div
      ref={ref}
      className={`cultural-explainer ${visible ? 'cultural-explainer--visible' : ''} ${className}`}
      onMouseEnter={trigger === 'hover' ? () => setVisible(true) : undefined}
      onMouseLeave={trigger === 'hover' ? () => setVisible(false) : undefined}
    >
      <div className="cultural-explainer__panel">
        <p
          className="cultural-explainer__kanji"
          style={{ fontFamily: 'var(--hb-font-display)' }}
        >
          {term.kanji}
        </p>
        <div className="cultural-explainer__text">
          <p
            className="cultural-explainer__reading"
            style={{ fontFamily: 'var(--hb-font-mono)' }}
          >
            {term.reading}
          </p>
          <p className="cultural-explainer__meaning">{term.meaning}</p>
        </div>
      </div>
    </div>
  );
}
