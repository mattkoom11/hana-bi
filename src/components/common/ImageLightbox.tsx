"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";

interface ImageLightboxProps {
  images: string[];
  initialIndex: number;
  alt: string;
  onClose: () => void;
}

export function ImageLightbox({ images, initialIndex, alt, onClose }: ImageLightboxProps) {
  const [current, setCurrent] = useState(initialIndex);

  const prev = useCallback(() => setCurrent((i) => (i - 1 + images.length) % images.length), [images.length]);
  const next = useCallback(() => setCurrent((i) => (i + 1) % images.length), [images.length]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose, prev, next]);

  // Prevent body scroll while open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90"
      onClick={onClose}
    >
      {/* Close */}
      <button
        onClick={onClose}
        className="absolute top-5 right-6 text-white/60 hover:text-white text-xs uppercase tracking-[0.4em] transition-colors"
        style={{ fontFamily: "var(--hb-font-mono)" }}
      >
        Close
      </button>

      {/* Counter */}
      {images.length > 1 && (
        <p
          className="absolute top-5 left-6 text-white/40 text-xs tracking-[0.3em]"
          style={{ fontFamily: "var(--hb-font-mono)" }}
        >
          {current + 1} / {images.length}
        </p>
      )}

      {/* Image */}
      <div
        className="relative w-full h-full max-w-5xl max-h-[90vh] mx-auto px-16"
        onClick={(e) => e.stopPropagation()}
      >
        <Image
          src={images[current]}
          alt={`${alt} ${current + 1}`}
          fill
          className="object-contain"
          sizes="100vw"
          priority
        />
      </div>

      {/* Prev / Next */}
      {images.length > 1 && (
        <>
          <button
            onClick={(e) => { e.stopPropagation(); prev(); }}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50 hover:text-white text-xs uppercase tracking-[0.4em] transition-colors px-2 py-4"
            style={{ fontFamily: "var(--hb-font-mono)" }}
          >
            ←
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); next(); }}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-white/50 hover:text-white text-xs uppercase tracking-[0.4em] transition-colors px-2 py-4"
            style={{ fontFamily: "var(--hb-font-mono)" }}
          >
            →
          </button>
        </>
      )}
    </div>
  );
}
