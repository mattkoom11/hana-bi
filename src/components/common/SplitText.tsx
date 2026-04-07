'use client';

import { Fragment, useEffect, useRef } from 'react';

type Tag = 'h1' | 'h2' | 'h3' | 'h4' | 'p' | 'span' | 'div';

interface SplitTextProps {
  children: string;
  className?: string;
  tag?: Tag;
  charDelay?: number; // ms between each character
}

export function SplitText({
  children,
  className = '',
  tag: Tag = 'span',
  charDelay = 40,
}: SplitTextProps) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const spans = el.querySelectorAll<HTMLSpanElement>('.split-char');

    // Immediately reveal all characters for reduced-motion users
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      spans.forEach((span) => {
        span.style.animationPlayState = 'running';
      });
      return;
    }

    const run = () => spans.forEach((span) => { span.style.animationPlayState = 'running'; });

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          run();
          observer.disconnect();
        }
      },
      { threshold: 0 }
    );
    observer.observe(el);

    // Fallback: if already in viewport on mount the observer may not re-fire
    const raf = requestAnimationFrame(() => {
      const rect = el.getBoundingClientRect();
      const inView = rect.top < window.innerHeight && rect.bottom > 0;
      if (inView) { run(); observer.disconnect(); }
    });

    return () => { observer.disconnect(); cancelAnimationFrame(raf); };
  }, []);

  // Pre-compute per-word char offsets so render has no side-effects
  const words = children.split(' ');
  const wordOffsets = words.reduce<number[]>((acc, word, i) => {
    acc.push(i === 0 ? 0 : acc[i - 1] + words[i - 1].length + 1);
    return acc;
  }, []);

  return (
    // @ts-expect-error polymorphic ref on generic tag
    <Tag ref={ref} className={`inline ${className}`} aria-label={children}>
      {words.map((word, wi) => (
        <Fragment key={wi}>
          <span style={{ display: 'inline-block', whiteSpace: 'nowrap' }}>
            {[...word].map((char, ci) => {
              const i = wordOffsets[wi] + ci;
              return (
                <span
                  key={i}
                  className="split-char"
                  style={{
                    animationDelay: `${i * charDelay}ms`,
                    animationPlayState: 'paused',
                  }}
                  aria-hidden="true"
                >
                  {char}
                </span>
              );
            })}
          </span>
          {wi < words.length - 1 && ' '}
        </Fragment>
      ))}
    </Tag>
  );
}
