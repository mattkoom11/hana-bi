"use client";

import { useRef, type CSSProperties, type ReactNode } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useReducedMotion,
} from "framer-motion";

type ScrollOffset = Parameters<typeof useScroll>[0] extends infer T
  ? T extends { offset?: infer O }
    ? O
    : never
  : never;

interface ParallaxLayerProps {
  children: ReactNode;
  /**
   * Vertical travel in pixels across the scroll range.
   * Positive = lags behind / drifts down (reads as a deeper background layer).
   * Negative = moves up faster than the page (reads as a closer foreground layer).
   */
  speed?: number;
  /** Scroll range to map over. Defaults to the element travelling through the viewport. */
  offset?: ScrollOffset;
  className?: string;
  style?: CSSProperties;
  "aria-hidden"?: boolean;
}

export function ParallaxLayer({
  children,
  speed = -60,
  offset = ["start end", "end start"],
  className = "",
  style,
  "aria-hidden": ariaHidden,
}: ParallaxLayerProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();

  const { scrollYProgress } = useScroll({ target: ref, offset });
  const y = useTransform(scrollYProgress, [0, 1], [0, speed]);

  return (
    <div ref={ref} className={className} style={style} aria-hidden={ariaHidden}>
      <motion.div style={{ y: reduce ? 0 : y, willChange: "transform" }}>
        {children}
      </motion.div>
    </div>
  );
}
