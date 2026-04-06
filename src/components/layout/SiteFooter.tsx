// src/components/layout/SiteFooter.tsx
'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';

const FOOTER_LINKS = [
  { label: 'Careers', href: '#' },
  { label: 'Stockists', href: '#' },
  { label: 'Press', href: '#' },
  { label: 'Contact', href: '#' },
];

const KANJI_CHARS = ['花', '火'];

export function SiteFooter() {
  const [revealed, setRevealed] = useState(false);
  const footerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = footerRef.current;
    if (!el) return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setRevealed(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setRevealed(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <footer ref={footerRef} className="bg-[var(--hb-dark)] px-4 sm:px-8 md:px-12 lg:px-20 py-12 relative mt-20 grain overflow-hidden">
      {/* Top border */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[var(--hb-dark-border)] to-transparent" />

      <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between relative z-10">
        <div className="space-y-3">
          <p
            className="uppercase text-xs tracking-[0.35em] opacity-70"
            style={{ fontFamily: 'var(--hb-font-mono)', color: 'var(--hb-sienna)' }}
          >
            Hana-Bi
          </p>
          <h3
            className="text-3xl tracking-tight text-[#faf8f4] italic font-light"
            style={{ fontFamily: 'var(--hb-font-display)' }}
          >
            Study the Archive.
          </h3>
          <p className="text-sm text-[var(--hb-dark-muted)] leading-relaxed">
            Sustainable denim and garments captured like museum pieces.
          </p>
        </div>
        <div
          className="flex flex-wrap gap-6 text-xs uppercase tracking-[0.3em] text-[var(--hb-dark-muted)]"
          style={{ fontFamily: 'var(--hb-font-mono)' }}
        >
          {FOOTER_LINKS.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="pb-1 border-b border-transparent hover:border-[var(--hb-sienna)] hover:text-[#faf8f4] hover-wispy opacity-70 hover:opacity-100 transition-all duration-300"
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>

      {/* Oversized kanji reveal */}
      <div
        className="absolute bottom-0 right-0 select-none pointer-events-none overflow-hidden"
        aria-hidden="true"
      >
        {KANJI_CHARS.map((char, i) => (
          <span
            key={char}
            className="footer-kanji__char"
            style={{
              fontFamily: 'var(--hb-font-display)',
              fontSize: 'clamp(6rem, 20vw, 16rem)',
              lineHeight: 0.9,
              color: 'var(--hb-dark-kanji)',
              animationDelay: `${i * 180}ms`,
              animationPlayState: revealed ? 'running' : 'paused',
            }}
          >
            {char}
          </span>
        ))}
      </div>

      <div
        className="mt-10 text-[0.65rem] uppercase tracking-[0.4em] text-[var(--hb-dark-muted)] opacity-50 relative z-10"
        style={{ fontFamily: 'var(--hb-font-mono)' }}
      >
        © {new Date().getFullYear()} Hana-Bi Atelier — Crafted in limited runs.
      </div>
    </footer>
  );
}
