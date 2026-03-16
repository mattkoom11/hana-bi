'use client';

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { ReactNode } from "react";

interface RoughBorderCardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
}

/**
 * Generate a rough, hand-drawn border path
 */
function generateRoughBorder(width: number, height: number, seed: number = 456): string {
  let seedValue = seed;
  const seededRandom = () => {
    seedValue = (seedValue * 9301 + 49297) % 233280;
    return seedValue / 233280;
  };

  const jitter = 3;
  const corners = [
    [jitter, jitter],
    [width - jitter, jitter + (seededRandom() - 0.5) * jitter],
    [width - jitter, height - jitter + (seededRandom() - 0.5) * jitter],
    [jitter + (seededRandom() - 0.5) * jitter, height - jitter],
  ];

  // Generate wavy segments between corners
  const segments: Array<[number, number]> = [];
  
  // Top edge
  for (let i = 0; i <= 8; i++) {
    const x = corners[0][0] + (corners[1][0] - corners[0][0]) * (i / 8);
    const y = corners[0][1] + Math.sin(i * 0.5) * 1 + (seededRandom() - 0.5) * 1.5;
    segments.push([x, y]);
  }

  // Right edge
  for (let i = 0; i <= 8; i++) {
    const y = corners[1][1] + (corners[2][1] - corners[1][1]) * (i / 8);
    const x = corners[1][0] + Math.sin(i * 0.5) * 1 + (seededRandom() - 0.5) * 1.5;
    segments.push([x, y]);
  }

  // Bottom edge
  for (let i = 0; i <= 8; i++) {
    const x = corners[2][0] - (corners[2][0] - corners[3][0]) * (i / 8);
    const y = corners[2][1] + Math.sin(i * 0.5) * 1 + (seededRandom() - 0.5) * 1.5;
    segments.push([x, y]);
  }

  // Left edge
  for (let i = 0; i <= 8; i++) {
    const y = corners[3][1] - (corners[3][1] - corners[0][1]) * (i / 8);
    const x = corners[3][0] + Math.sin(i * 0.5) * 1 + (seededRandom() - 0.5) * 1.5;
    segments.push([x, y]);
  }

  let path = `M ${segments[0][0]},${segments[0][1]}`;
  for (let i = 1; i < segments.length; i++) {
    const prev = segments[i - 1];
    const curr = segments[i];
    path += ` L ${curr[0]},${curr[1]}`;
  }
  path += ' Z';

  return path;
}

export function RoughBorderCard({
  children,
  className,
  hover = true,
}: RoughBorderCardProps) {
  const width = 300;
  const height = 200;
  const borderPath = generateRoughBorder(width, height);

  return (
    <motion.div
      className={cn("relative", className)}
      whileHover={hover ? { y: -4, rotate: 0.5 } : {}}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="none"
        style={{ opacity: 0.3 }}
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="rough-border-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="var(--hb-ink)" stopOpacity="0.5" />
            <stop offset="50%" stopColor="var(--hb-ink)" stopOpacity="0.2" />
            <stop offset="100%" stopColor="var(--hb-ink)" stopOpacity="0.4" />
          </linearGradient>
        </defs>
        <path
          d={borderPath}
          fill="none"
          stroke="url(#rough-border-gradient)"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
      <div className="relative z-10">{children}</div>
    </motion.div>
  );
}

