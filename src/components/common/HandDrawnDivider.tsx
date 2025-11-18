/**
 * HandDrawnDivider - A delicate pencil-line divider for section transitions
 * 
 * Creates organic, hand-drawn dividers that feel like faint pencil strokes
 * on paper, perfect for separating editorial sections.
 */

import { cn } from "@/lib/utils";

interface HandDrawnDividerProps {
  className?: string;
  variant?: "wispy" | "delicate" | "bold";
  orientation?: "horizontal" | "vertical";
  strokeOpacity?: number;
}

/**
 * Generate a wispy divider path with organic imperfections
 */
function generateDividerPath(
  length: number,
  variant: HandDrawnDividerProps["variant"] = "wispy",
  seed: number = 100
): string {
  const amplitude = variant === "bold" ? 2.5 : variant === "delicate" ? 1 : 1.8;
  const frequency = variant === "bold" ? 0.6 : variant === "delicate" ? 1.5 : 1;

  // Simple seeded random for consistent paths
  let seedValue = seed;
  const seededRandom = () => {
    seedValue = (seedValue * 9301 + 49297) % 233280;
    return seedValue / 233280;
  };

  const segments = 12;
  const points: Array<[number, number]> = [];

  for (let i = 0; i <= segments; i++) {
    const x = (length / segments) * i;
    const wave = Math.sin((i / segments) * Math.PI * frequency) * amplitude;
    const jitter = (seededRandom() - 0.5) * 0.6;
    points.push([x, wave + jitter]);
  }

  // Convert to smooth curve
  let path = `M ${points[0][0]},${points[0][1]}`;
  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1];
    const curr = points[i];
    const next = points[i + 1] || curr;
    const cp1x = prev[0] + (curr[0] - prev[0]) * 0.4;
    const cp1y = prev[1];
    const cp2x = curr[0] - (next[0] - curr[0]) * 0.2;
    const cp2y = curr[1];
    if (i === 1) {
      path += ` Q ${cp1x},${cp1y} ${curr[0]},${curr[1]}`;
    } else {
      path += ` T ${curr[0]},${curr[1]}`;
    }
  }

  return path;
}

export function HandDrawnDivider({
  className,
  variant = "wispy",
  orientation = "horizontal",
  strokeOpacity = 0.25,
}: HandDrawnDividerProps) {
  const seed = variant === "bold" ? 200 : variant === "delicate" ? 300 : 100;
  const length = 400;
  const path = generateDividerPath(length, variant, seed);
  const strokeWidth = variant === "bold" ? 1 : variant === "delicate" ? 0.6 : 0.8;

  const isVertical = orientation === "vertical";

  return (
    <div
      className={cn(
        "flex items-center justify-center",
        isVertical ? "h-full w-auto" : "w-full h-auto",
        className
      )}
    >
      <svg
        width={isVertical ? 16 : length}
        height={isVertical ? length : 16}
        viewBox={isVertical ? `0 0 16 ${length}` : `0 0 ${length} 16`}
        fill="none"
        style={{ opacity: strokeOpacity }}
        className={isVertical ? "rotate-90" : ""}
      >
        <defs>
          <linearGradient
            id={`divider-gradient-${variant}-${seed}`}
            x1="0%"
            y1="0%"
            x2={isVertical ? "0%" : "100%"}
            y2={isVertical ? "100%" : "0%"}
          >
            <stop offset="0%" stopColor="var(--hb-ink)" stopOpacity="0.4" />
            <stop offset="50%" stopColor="var(--hb-ink)" stopOpacity="0.15" />
            <stop offset="100%" stopColor="var(--hb-ink)" stopOpacity="0.35" />
          </linearGradient>
        </defs>
        <path
          d={path}
          stroke={`url(#divider-gradient-${variant}-${seed})`}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          fill="none"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
    </div>
  );
}

