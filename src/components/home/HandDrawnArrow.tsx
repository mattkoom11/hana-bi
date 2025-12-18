"use client";

import { cn } from "@/lib/utils";

interface HandDrawnArrowProps {
  className?: string;
  direction?: "down-right" | "down-left" | "right" | "down";
  size?: number;
  strokeWidth?: number;
  opacity?: number;
}

/**
 * HandDrawnArrow - Sketchy, imperfect arrow pointing to CTA
 * Looks like it was quickly drawn in a designer's sketchbook
 */
export function HandDrawnArrow({
  className,
  direction = "down-right",
  size = 80,
  strokeWidth = 1.5,
  opacity = 0.5,
}: HandDrawnArrowProps) {
  // Different arrow paths for each direction
  const arrowPaths = {
    "down-right": {
      stem: "M 10,8 Q 25,18 35,35 Q 42,48 48,62",
      head1: "M 48,62 Q 42,52 38,48",
      head2: "M 48,62 Q 52,56 58,54",
      curve: "M 15,12 Q 20,14 22,18",
      viewBox: "0 0 70 70",
    },
    "down-left": {
      stem: "M 60,8 Q 45,18 35,35 Q 28,48 22,62",
      head1: "M 22,62 Q 28,52 32,48",
      head2: "M 22,62 Q 18,56 12,54",
      curve: "M 55,12 Q 50,14 48,18",
      viewBox: "0 0 70 70",
    },
    right: {
      stem: "M 5,35 Q 25,32 45,35 Q 58,36 68,35",
      head1: "M 68,35 Q 58,30 54,28",
      head2: "M 68,35 Q 58,40 54,42",
      curve: "M 10,30 Q 15,28 18,28",
      viewBox: "0 0 75 70",
    },
    down: {
      stem: "M 35,5 Q 33,25 35,45 Q 36,58 35,68",
      head1: "M 35,68 Q 30,58 28,54",
      head2: "M 35,68 Q 40,58 42,54",
      curve: "M 30,10 Q 28,15 28,18",
      viewBox: "0 0 70 75",
    },
  };

  const arrow = arrowPaths[direction];

  return (
    <svg
      className={cn("text-[var(--hb-ink)] pointer-events-none", className)}
      width={size}
      height={size}
      viewBox={arrow.viewBox}
      fill="none"
      style={{ opacity }}
    >
      <defs>
        <filter id="arrow-roughness">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="1.2"
            numOctaves="3"
            result="noise"
          />
          <feDisplacementMap
            in="SourceGraphic"
            in2="noise"
            scale="1"
            xChannelSelector="R"
            yChannelSelector="G"
          />
        </filter>
      </defs>

      {/* Main arrow stem */}
      <path
        d={arrow.stem}
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        fill="none"
        filter="url(#arrow-roughness)"
      />

      {/* Arrow head */}
      <path
        d={arrow.head1}
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        fill="none"
        filter="url(#arrow-roughness)"
      />
      <path
        d={arrow.head2}
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        fill="none"
        filter="url(#arrow-roughness)"
      />

      {/* Decorative curve */}
      <path
        d={arrow.curve}
        stroke="currentColor"
        strokeWidth={strokeWidth * 0.8}
        strokeLinecap="round"
        fill="none"
        opacity="0.4"
        filter="url(#arrow-roughness)"
      />
    </svg>
  );
}
