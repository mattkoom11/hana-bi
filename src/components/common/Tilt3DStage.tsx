"use client";

import { useRef, type CSSProperties, type MouseEvent, type ReactNode } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  useScroll,
  useMotionTemplate,
  useReducedMotion,
} from "framer-motion";

interface Tilt3DStageProps {
  children: ReactNode;
  /** Perspective depth in px. Larger = subtler, flatter perspective. */
  perspective?: number;
  /** Max stage rotation toward the cursor, in degrees. */
  intensity?: number;
  /** How far (px) the whole stage dollies back along Z across the scroll range. */
  scrollDepth?: number;
  className?: string;
  style?: CSSProperties;
}

/**
 * A shared 3D perspective container. Children wrapped in <DepthLayer> sit on
 * distinct Z-planes, so tilting the stage toward the cursor produces genuine
 * inter-layer parallax (near layers shift more than far ones). A gentle
 * scroll-linked Z dolly makes the scene recede as the page scrolls.
 */
export function Tilt3DStage({
  children,
  perspective = 1200,
  intensity = 6,
  scrollDepth = 180,
  className = "",
  style,
}: Tilt3DStageProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();

  const pointerX = useMotionValue(0); // -0.5 .. 0.5
  const pointerY = useMotionValue(0);
  const springX = useSpring(pointerX, { stiffness: 120, damping: 18, mass: 0.4 });
  const springY = useSpring(pointerY, { stiffness: 120, damping: 18, mass: 0.4 });

  const rotateX = useTransform(springY, [-0.5, 0.5], [intensity, -intensity]);
  const rotateY = useTransform(springX, [-0.5, 0.5], [-intensity, intensity]);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const translateZ = useTransform(scrollYProgress, [0, 1], [0, -scrollDepth]);

  const transform = useMotionTemplate`perspective(${perspective}px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(${translateZ}px)`;

  function handleMouseMove(e: MouseEvent<HTMLDivElement>) {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    pointerX.set((e.clientX - rect.left) / rect.width - 0.5);
    pointerY.set((e.clientY - rect.top) / rect.height - 0.5);
  }

  function handleMouseLeave() {
    pointerX.set(0);
    pointerY.set(0);
  }

  if (reduce) {
    return (
      <div ref={ref} className={className} style={style}>
        {children}
      </div>
    );
  }

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={className}
      style={{
        transform,
        transformStyle: "preserve-3d",
        willChange: "transform",
        ...style,
      }}
    >
      {children}
    </motion.div>
  );
}
