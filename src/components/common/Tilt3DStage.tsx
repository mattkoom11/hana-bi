"use client";

import {
  useEffect,
  useRef,
  type CSSProperties,
  type MouseEvent,
  type ReactNode,
} from "react";
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
  /**
   * Track the cursor on `window` instead of the element. Use this when the stage
   * is a `pointer-events-none` background layer so it can still tilt toward the
   * cursor without intercepting clicks/hovers from foreground content.
   */
  trackOnWindow?: boolean;
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
  trackOnWindow = false,
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

  const clamp = (v: number) => Math.max(-0.5, Math.min(0.5, v));

  function setFromClient(clientX: number, clientY: number) {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    pointerX.set(clamp((clientX - rect.left) / rect.width - 0.5));
    pointerY.set(clamp((clientY - rect.top) / rect.height - 0.5));
  }

  function handleMouseMove(e: MouseEvent<HTMLDivElement>) {
    setFromClient(e.clientX, e.clientY);
  }

  function handleMouseLeave() {
    pointerX.set(0);
    pointerY.set(0);
  }

  // Background mode: follow the cursor globally so the stage can stay
  // pointer-events-none and never steal interaction from foreground content.
  useEffect(() => {
    if (!trackOnWindow || reduce) return;
    const onMove = (e: globalThis.MouseEvent) =>
      setFromClient(e.clientX, e.clientY);
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMove);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trackOnWindow, reduce]);

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
      onMouseMove={trackOnWindow ? undefined : handleMouseMove}
      onMouseLeave={trackOnWindow ? undefined : handleMouseLeave}
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
