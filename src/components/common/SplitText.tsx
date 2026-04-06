'use client';

import { useEffect, useRef } from 'react';

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

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          spans.forEach((span) => {
            span.style.animationPlayState = 'running';
          });
          observer.disconnect();
        }
      },
      { threshold: 0.15 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    // @ts-expect-error polymorphic ref on generic tag
    <Tag ref={ref} className={`inline ${className}`} aria-label={children}>
      {[...children].map((char, i) => (
        <span
          key={i}
          className="split-char"
          style={{
            animationDelay: `${i * charDelay}ms`,
            animationPlayState: 'paused',
          }}
          aria-hidden="true"
        >
          {char === ' ' ? '\u00A0' : char}
        </span>
      ))}
    </Tag>
  );
}
