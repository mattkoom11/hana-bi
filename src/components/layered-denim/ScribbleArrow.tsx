'use client';

import { cn } from "@/lib/utils";

interface ScribbleArrowProps {
  className?: string;
  direction?: 'right' | 'down' | 'left' | 'up';
  strokeOpacity?: number;
  size?: number;
}

/**
 * Generate a hand-drawn arrow path
 */
function generateArrowPath(direction: ScribbleArrowProps['direction'] = 'right', size: number = 60): string {
  const jitter = 2;
  
  let path = '';
  
  switch (direction) {
    case 'right':
      // Arrow pointing right
      path = `M 5,${size / 2} 
              Q ${size * 0.3 + jitter},${size / 2 - jitter} ${size * 0.5 - 5},${size / 2 - 8}
              L ${size * 0.6 - 5},${size / 2 - 8}
              Q ${size * 0.55},${size / 2} ${size * 0.6 - 5},${size / 2 + 8}
              L ${size * 0.5 - 5},${size / 2 + 8}
              Q ${size * 0.3 + jitter},${size / 2 + jitter} 5,${size / 2}
              L ${size - 5},${size / 2}`;
      break;
    case 'down':
      // Arrow pointing down
      path = `M ${size / 2},5 
              Q ${size / 2 - jitter},${size * 0.3 + jitter} ${size / 2 - 8},${size * 0.5 - 5}
              L ${size / 2 - 8},${size * 0.6 - 5}
              Q ${size / 2},${size * 0.55} ${size / 2 + 8},${size * 0.6 - 5}
              L ${size / 2 + 8},${size * 0.5 - 5}
              Q ${size / 2 + jitter},${size * 0.3 + jitter} ${size / 2},5
              L ${size / 2},${size - 5}`;
      break;
    default:
      path = `M 5,${size / 2} L ${size - 5},${size / 2}`;
  }

  return path;
}

export function ScribbleArrow({
  className,
  direction = 'right',
  strokeOpacity = 0.5,
  size = 60,
}: ScribbleArrowProps) {
  const path = generateArrowPath(direction, size);

  return (
    <svg
      className={cn("text-[var(--hb-ink)]", className)}
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      fill="none"
      style={{ opacity: strokeOpacity }}
      aria-hidden="true"
    >
      <path
        d={path}
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}

