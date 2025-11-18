/**
 * SketchFrame - A hand-drawn frame component with wispy borders
 * 
 * Creates organic, sketch-like frames with subtle tilt, imperfect lines,
 * and a delicate, airy feeling reminiscent of pinned sketches or notes.
 */

import { cn } from "@/lib/utils";
import { PropsWithChildren } from "react";

type Tilt = "left" | "right" | "none";

interface SketchFrameProps extends PropsWithChildren {
  tilt?: Tilt;
  className?: string;
  strokeOpacity?: number;
}

/**
 * Generate a hand-drawn frame path with organic imperfections
 * Uses seed for consistent rendering
 */
function generateFramePath(width: number, height: number, seed: number = 500): string {
  const padding = 8;
  const cornerJitter = 2;

  // Simple seeded random for consistent paths
  let seedValue = seed;
  const seededRandom = () => {
    seedValue = (seedValue * 9301 + 49297) % 233280;
    return seedValue / 233280;
  };

  // Create wispy corners with slight imperfections
  const topLeft = [padding + (seededRandom() - 0.5) * cornerJitter, padding + (seededRandom() - 0.5) * cornerJitter];
  const topRight = [width - padding + (seededRandom() - 0.5) * cornerJitter, padding + (seededRandom() - 0.5) * cornerJitter];
  const bottomRight = [width - padding + (seededRandom() - 0.5) * cornerJitter, height - padding + (seededRandom() - 0.5) * cornerJitter];
  const bottomLeft = [padding + (seededRandom() - 0.5) * cornerJitter, height - padding + (seededRandom() - 0.5) * cornerJitter];

  // Create organic curves for each side
  const midTopX = width / 2 + (seededRandom() - 0.5) * 3;
  const midTopY = padding + (seededRandom() - 0.5) * 2;
  
  const midRightX = width - padding + (seededRandom() - 0.5) * 2;
  const midRightY = height / 2 + (seededRandom() - 0.5) * 3;
  
  const midBottomX = width / 2 + (seededRandom() - 0.5) * 3;
  const midBottomY = height - padding + (seededRandom() - 0.5) * 2;
  
  const midLeftX = padding + (seededRandom() - 0.5) * 2;
  const midLeftY = height / 2 + (seededRandom() - 0.5) * 3;

  return `M ${topLeft[0]},${topLeft[1]}
    Q ${midTopX},${midTopY} ${topRight[0]},${topRight[1]}
    Q ${midRightX},${midRightY} ${bottomRight[0]},${bottomRight[1]}
    Q ${midBottomX},${midBottomY} ${bottomLeft[0]},${bottomLeft[1]}
    Q ${midLeftX},${midLeftY} ${topLeft[0]},${topLeft[1]}
    Z`;
}

export function SketchFrame({
  children,
  tilt = "none",
  className,
  strokeOpacity = 0.35,
}: SketchFrameProps) {
  const rotations: Record<Tilt, string> = {
    none: "rotate-0",
    left: "-rotate-[0.8deg]",
    right: "rotate-[0.8deg]",
  };

  // Use tilt-based seed for consistency
  const seed = tilt === "left" ? 600 : tilt === "right" ? 700 : 500;
  const width = 400;
  const height = 300;
  const framePath = generateFramePath(width, height, seed);

  return (
    <div
      className={cn(
        "relative bg-[var(--hb-paper)]",
        "transition-transform duration-300 ease-out",
        rotations[tilt],
        className
      )}
    >
      {/* Hand-drawn frame SVG */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="none"
        style={{ opacity: strokeOpacity }}
      >
        <defs>
          <linearGradient id="frame-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="var(--hb-ink)" stopOpacity="0.5" />
            <stop offset="50%" stopColor="var(--hb-ink)" stopOpacity="0.25" />
            <stop offset="100%" stopColor="var(--hb-ink)" stopOpacity="0.4" />
          </linearGradient>
          <filter id="wispy-blur">
            <feGaussianBlur stdDeviation="0.3" />
          </filter>
        </defs>
        <path
          d={framePath}
          fill="none"
          stroke="url(#frame-gradient)"
          strokeWidth="1.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          filter="url(#wispy-blur)"
          vectorEffect="non-scaling-stroke"
        />
      </svg>

      {/* Content */}
      <div className="relative z-10 p-6 md:p-8">{children}</div>

      {/* Subtle shadow for depth */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          boxShadow: "inset 0 0 20px rgba(26, 26, 26, 0.02)",
        }}
      />
    </div>
  );
}
