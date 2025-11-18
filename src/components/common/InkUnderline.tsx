/**
 * InkUnderline - A wispy, hand-drawn underline component
 * 
 * Creates delicate, imperfect underlines that feel like pen strokes
 * with variable pressure, subtle curves, and organic flow.
 */

import { cn } from "@/lib/utils";

interface InkUnderlineProps {
  className?: string;
  width?: number;
  strokeOpacity?: number;
  variant?: "wispy" | "bold" | "delicate";
}

/**
 * Generate a wispy underline path with organic curves
 * Uses consistent seed for stable rendering
 */
function generateUnderlinePath(
  width: number,
  variant: InkUnderlineProps["variant"] = "wispy",
  seed: number = 42
): string {
  const baseY = 12;
  const amplitude = variant === "bold" ? 3 : variant === "delicate" ? 1.5 : 2.5;
  const frequency = variant === "bold" ? 0.8 : variant === "delicate" ? 1.2 : 1;

  // Simple seeded random for consistent paths
  let seedValue = seed;
  const seededRandom = () => {
    seedValue = (seedValue * 9301 + 49297) % 233280;
    return seedValue / 233280;
  };

  // Create organic wave with slight jitter
  const points: Array<[number, number]> = [];
  const segments = 8;

  for (let i = 0; i <= segments; i++) {
    const x = (width / segments) * i;
    const wave = Math.sin((i / segments) * Math.PI * frequency) * amplitude;
    const jitter = (seededRandom() - 0.5) * 0.8;
    points.push([x, baseY + wave + jitter]);
  }

  // Convert to smooth curve with bezier
  let path = `M ${points[0][0]},${points[0][1]}`;

  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1];
    const curr = points[i];
    const next = points[i + 1] || curr;

    // Control points for smooth curve
    const cp1x = prev[0] + (curr[0] - prev[0]) * 0.5;
    const cp1y = prev[1];
    const cp2x = curr[0] - (next[0] - curr[0]) * 0.3;
    const cp2y = curr[1];

    if (i === 1) {
      path += ` Q ${cp1x},${cp1y} ${curr[0]},${curr[1]}`;
    } else {
      path += ` T ${curr[0]},${curr[1]}`;
    }
  }

  return path;
}

export function InkUnderline({
  className,
  width = 120,
  strokeOpacity = 0.5,
  variant = "wispy",
}: InkUnderlineProps) {
  // Use variant-based seed for consistency
  const seed = variant === "bold" ? 100 : variant === "delicate" ? 200 : 42;
  const path = generateUnderlinePath(width, variant, seed);
  const strokeWidth = variant === "bold" ? 1.2 : variant === "delicate" ? 0.8 : 1;

  return (
    <svg
      className={cn("text-[var(--hb-ink)]", className)}
      width={width}
      height={16}
      viewBox={`0 0 ${width} 16`}
      fill="none"
      style={{ opacity: strokeOpacity }}
    >
      <defs>
        <linearGradient id="underline-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0.7" />
          <stop offset="30%" stopColor="currentColor" stopOpacity="0.4" />
          <stop offset="70%" stopColor="currentColor" stopOpacity="0.3" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0.6" />
        </linearGradient>
      </defs>
      <path
        d={path}
        stroke="url(#underline-gradient)"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}
