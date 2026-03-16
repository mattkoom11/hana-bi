'use client';

import { cn } from "@/lib/utils";

interface ScribbleUnderlineProps {
  className?: string;
  width?: number;
  strokeOpacity?: number;
}

/**
 * Generate a hand-drawn underline path with organic imperfections
 */
function generateScribblePath(width: number, seed: number = 123): string {
  const baseY = 8;
  const amplitude = 2.5;
  
  let seedValue = seed;
  const seededRandom = () => {
    seedValue = (seedValue * 9301 + 49297) % 233280;
    return seedValue / 233280;
  };

  const points: Array<[number, number]> = [];
  const segments = 12;

  for (let i = 0; i <= segments; i++) {
    const x = (width / segments) * i;
    const wave = Math.sin((i / segments) * Math.PI * 0.8) * amplitude;
    const jitter = (seededRandom() - 0.5) * 1.2;
    points.push([x, baseY + wave + jitter]);
  }

  let path = `M ${points[0][0]},${points[0][1]}`;
  
  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1];
    const curr = points[i];
    const next = points[i + 1] || curr;

    const cp1x = prev[0] + (curr[0] - prev[0]) * 0.6;
    const cp1y = prev[1] + (seededRandom() - 0.5) * 0.5;
    const cp2x = curr[0] - (next[0] - curr[0]) * 0.4;
    const cp2y = curr[1];

    if (i === 1) {
      path += ` Q ${cp1x},${cp1y} ${curr[0]},${curr[1]}`;
    } else {
      path += ` C ${prev[0] + (curr[0] - prev[0]) * 0.3},${prev[1]} ${cp2x},${cp2y} ${curr[0]},${curr[1]}`;
    }
  }

  return path;
}

export function ScribbleUnderline({
  className,
  width = 200,
  strokeOpacity = 0.6,
}: ScribbleUnderlineProps) {
  const path = generateScribblePath(width, 123);

  return (
    <svg
      className={cn("text-[var(--hb-ink)]", className)}
      width={width}
      height={20}
      viewBox={`0 0 ${width} 20`}
      fill="none"
      style={{ opacity: strokeOpacity }}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="scribble-underline-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0.8" />
          <stop offset="50%" stopColor="currentColor" stopOpacity="0.4" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0.7" />
        </linearGradient>
      </defs>
      <path
        d={path}
        stroke="url(#scribble-underline-gradient)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}

