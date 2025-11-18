/**
 * HandDrawnBorder - A wispy, imperfect border component
 * 
 * Creates organic, hand-drawn borders with variable stroke width,
 * subtle jitter, and tapering effects reminiscent of pen on paper.
 */

import { cn } from "@/lib/utils";
import { PropsWithChildren } from "react";

interface HandDrawnBorderProps extends PropsWithChildren {
  className?: string;
  variant?: "full" | "top" | "bottom" | "sides";
  strokeOpacity?: number;
}

/**
 * Generate a wispy, hand-drawn path with organic curves and imperfections
 * Uses a seed for consistent rendering
 */
function generateWispyPath(
  width: number,
  height: number,
  variant: HandDrawnBorderProps["variant"] = "full",
  seed: number = 0
): string {
  // Simple seeded random for consistent paths
  let seedValue = seed;
  const seededRandom = () => {
    seedValue = (seedValue * 9301 + 49297) % 233280;
    return seedValue / 233280;
  };
  
  const jitter = (base: number, amount: number) =>
    base + (seededRandom() - 0.5) * amount;

  if (variant === "top") {
    const points = [
      [jitter(0, 3), jitter(0, 2)],
      [jitter(width * 0.2, 4), jitter(2, 3)],
      [jitter(width * 0.4, 5), jitter(-1, 2)],
      [jitter(width * 0.6, 4), jitter(1, 3)],
      [jitter(width * 0.8, 5), jitter(-2, 2)],
      [jitter(width, 3), jitter(0, 2)],
    ];
    return `M ${points[0][0]},${points[0][1]} ${points
      .slice(1)
      .map((p, i) => {
        const prev = points[i];
        const cp1x = prev[0] + (p[0] - prev[0]) * 0.3;
        const cp1y = prev[1];
        const cp2x = prev[0] + (p[0] - prev[0]) * 0.7;
        const cp2y = p[1];
        return `C ${cp1x},${cp1y} ${cp2x},${cp2y} ${p[0]},${p[1]}`;
      })
      .join(" ")}`;
  }

  if (variant === "bottom") {
    const points = [
      [jitter(0, 3), jitter(height, 2)],
      [jitter(width * 0.2, 4), jitter(height - 2, 3)],
      [jitter(width * 0.4, 5), jitter(height + 1, 2)],
      [jitter(width * 0.6, 4), jitter(height - 1, 3)],
      [jitter(width * 0.8, 5), jitter(height + 2, 2)],
      [jitter(width, 3), jitter(height, 2)],
    ];
    return `M ${points[0][0]},${points[0][1]} ${points
      .slice(1)
      .map((p, i) => {
        const prev = points[i];
        const cp1x = prev[0] + (p[0] - prev[0]) * 0.3;
        const cp1y = prev[1];
        const cp2x = prev[0] + (p[0] - prev[0]) * 0.7;
        const cp2y = p[1];
        return `C ${cp1x},${cp1y} ${cp2x},${cp2y} ${p[0]},${p[1]}`;
      })
      .join(" ")}`;
  }

  // Full border - create organic rectangle with wispy corners
  const cornerRadius = 8;
  const topLeft = [jitter(cornerRadius, 2), jitter(cornerRadius, 2)];
  const topRight = [jitter(width - cornerRadius, 2), jitter(cornerRadius, 2)];
  const bottomRight = [
    jitter(width - cornerRadius, 2),
    jitter(height - cornerRadius, 2),
  ];
  const bottomLeft = [
    jitter(cornerRadius, 2),
    jitter(height - cornerRadius, 2),
  ];

  return `M ${topLeft[0]},${topLeft[1]}
    Q ${jitter(width * 0.25, 3)},${jitter(0, 2)} ${topRight[0]},${topRight[1]}
    Q ${jitter(width, 2)},${jitter(height * 0.25, 3)} ${bottomRight[0]},${bottomRight[1]}
    Q ${jitter(width * 0.75, 3)},${jitter(height, 2)} ${bottomLeft[0]},${bottomLeft[1]}
    Q ${jitter(0, 2)},${jitter(height * 0.75, 3)} ${topLeft[0]},${topLeft[1]}
    Z`;
}

export function HandDrawnBorder({
  children,
  className,
  variant = "full",
  strokeOpacity = 0.4,
}: HandDrawnBorderProps) {
  // Use a stable seed based on variant for consistent rendering
  const seed = variant === "full" ? 123 : variant === "top" ? 456 : variant === "bottom" ? 789 : 321;
  const width = 300;
  const height = 200;

  return (
    <div className={cn("relative", className)}>
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="none"
        style={{ opacity: strokeOpacity }}
      >
        <defs>
          <linearGradient id={`border-gradient-${variant}-${seed}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="currentColor" stopOpacity="0.6" />
            <stop offset="50%" stopColor="currentColor" stopOpacity="0.3" />
            <stop offset="100%" stopColor="currentColor" stopOpacity="0.5" />
          </linearGradient>
        </defs>
        <path
          d={generateWispyPath(width, height, variant, seed)}
          fill="none"
          stroke={`url(#border-gradient-${variant}-${seed})`}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
      <div className="relative z-10">{children}</div>
    </div>
  );
}

