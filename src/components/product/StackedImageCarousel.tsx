"use client";

import { useRef, useState } from "react";
import { motion, useMotionValue, useTransform, AnimatePresence, animate } from "framer-motion";
import Image from "next/image";

const DRAG_THRESHOLD = 80;

const STACK = [
  { rotate: -2.5, y: 10, scale: 0.97, z: 2 },
  { rotate: 1.8,  y: 20, scale: 0.94, z: 1 },
];

function TopCard({
  image,
  alt,
  getExitX,
  onDismiss,
  onClick,
  onFirstDrag,
}: {
  image: string;
  alt: string;
  getExitX: () => number;
  onDismiss: (dir: number) => void;
  onClick: () => void;
  onFirstDrag: () => void;
}) {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-300, 300], [-12, 12]);
  const cardOpacity = useTransform(x, [-200, -80, 0, 80, 200], [0, 1, 1, 1, 0]);
  const pointerStartX = useRef(0);

  return (
    <motion.div
      className="absolute inset-0 z-20 overflow-hidden cursor-grab active:cursor-grabbing"
      drag="x"
      dragMomentum={false}
      style={{ x, rotate, opacity: cardOpacity }}
      initial={{ scale: 0.95 }}
      animate={{ scale: 1 }}
      exit={{
        x: getExitX(),
        opacity: 0,
        rotate: getExitX() > 0 ? 15 : -15,
        transition: { duration: 0.3, ease: "easeIn" },
      }}
      transition={{ duration: 0.2 }}
      onPointerDown={(e) => { pointerStartX.current = e.clientX; }}
      onPointerUp={(e) => {
        if (Math.abs(e.clientX - pointerStartX.current) < 5) onClick();
      }}
      onDragStart={() => onFirstDrag()}
      onDragEnd={(_, info) => {
        if (Math.abs(info.offset.x) > DRAG_THRESHOLD || Math.abs(info.velocity.x) > 500) {
          onDismiss(info.offset.x > 0 ? 1 : -1);
        } else {
          animate(x, 0, { type: "spring", stiffness: 400, damping: 30 });
        }
      }}
    >
      <Image
        src={image}
        alt={alt}
        fill
        draggable={false}
        className="object-cover pointer-events-none"
        sizes="(max-width: 1024px) 100vw, 65vw"
        priority
      />
    </motion.div>
  );
}

interface StackedImageCarouselProps {
  images: string[];
  alt: string;
  onImageClick?: (index: number) => void;
}

export function StackedImageCarousel({ images, alt, onImageClick }: StackedImageCarouselProps) {
  const [topIndex, setTopIndex] = useState(0);
  const [showHint, setShowHint] = useState(true);
  const exitXRef = useRef(600);

  if (images.length === 0) {
    return <div className="relative w-full aspect-[3/4] bg-[var(--hb-dark-surface)] grain" />;
  }

  const dismiss = () => setShowHint(false);

  const advance = (dir: number) => {
    exitXRef.current = dir * 600;
    setTopIndex((p) => (p + 1) % images.length);
    dismiss();
  };

  const back = () => {
    exitXRef.current = -600;
    setTopIndex((p) => (p - 1 + images.length) % images.length);
    dismiss();
  };

  return (
    <>
      <div className="relative w-full aspect-[3/4] select-none">
        {/* Background stack cards */}
        {STACK.map((style, i) => {
          const imgIdx = (topIndex + i + 1) % images.length;
          return (
            <div
              key={`bg-${i}`}
              className="absolute inset-0 overflow-hidden pointer-events-none"
              style={{
                transform: `rotate(${style.rotate}deg) translateY(${style.y}px) scale(${style.scale})`,
                zIndex: style.z,
              }}
            >
              <Image
                src={images[imgIdx]}
                alt=""
                fill
                loading="eager"
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 65vw"
              />
            </div>
          );
        })}

        {/* Draggable top card */}
        <AnimatePresence>
          <TopCard
            key={topIndex}
            image={images[topIndex]}
            alt={`${alt} — ${topIndex + 1} of ${images.length}`}
            getExitX={() => exitXRef.current}
            onDismiss={advance}
            onClick={() => onImageClick?.(topIndex)}
            onFirstDrag={dismiss}
          />
        </AnimatePresence>

        {/* Counter */}
        <div
          className="absolute bottom-4 right-4 z-30 text-[0.6rem] tracking-[0.4em] uppercase"
          style={{ fontFamily: "var(--hb-font-mono)", color: "var(--hb-sienna)" }}
        >
          {String(topIndex + 1).padStart(2, "0")} / {String(images.length).padStart(2, "0")}
        </div>

        {/* Nav */}
        <button
          onClick={back}
          aria-label="Previous image"
          className="absolute left-4 top-1/2 -translate-y-1/2 z-30 w-8 h-8 flex items-center justify-center text-[#faf8f4] opacity-50 hover:opacity-100 transition-opacity"
          style={{ fontFamily: "var(--hb-font-mono)" }}
        >
          ←
        </button>
        <button
          onClick={() => advance(1)}
          aria-label="Next image"
          className="absolute right-4 top-1/2 -translate-y-1/2 z-30 w-8 h-8 flex items-center justify-center text-[#faf8f4] opacity-50 hover:opacity-100 transition-opacity"
          style={{ fontFamily: "var(--hb-font-mono)" }}
        >
          →
        </button>
      </div>

      {/* Drag hint — sits below the carousel, visible by default */}
      <AnimatePresence>
        {showHint && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4, transition: { duration: 0.3 } }}
            transition={{ duration: 0.4 }}
            className="flex items-center justify-center gap-4 pt-5 pb-1 pointer-events-none select-none"
          >
            <motion.span
              animate={{ x: [0, -6, 0] }}
              transition={{ duration: 0.9, repeat: Infinity, repeatDelay: 0.8, ease: "easeInOut" }}
              style={{ fontFamily: "var(--hb-font-mono)", color: "var(--hb-sienna)" }}
              className="text-base opacity-80"
            >
              ←
            </motion.span>

            <span
              className="text-[0.6rem] uppercase tracking-[0.5em]"
              style={{ fontFamily: "var(--hb-font-mono)", color: "var(--hb-dark-muted)" }}
            >
              drag to explore
            </span>

            <motion.span
              animate={{ x: [0, 6, 0] }}
              transition={{ duration: 0.9, repeat: Infinity, repeatDelay: 0.8, ease: "easeInOut" }}
              style={{ fontFamily: "var(--hb-font-mono)", color: "var(--hb-sienna)" }}
              className="text-base opacity-80"
            >
              →
            </motion.span>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
