"use client";

import { cn } from "@/lib/utils";
import { useMemo } from "react";

interface ScribbleUnderlineProps {
  className?: string;
  width?: number;
  height?: number;
  strokeWidth?: number;
  opacity?: number;
  variant?: "loose" | "tight" | "chaotic";
  seed?: number;
}

/**
 * ScribbleUnderline - Hand-drawn scribble underline effect
 * Creates an imperfect, sketchy underline like from a designer's sketchbook
 */
export function ScribbleUnderline({
  className,
  width = 200,
  height = 20,
  strokeWidth = 1.5,
  opacity = 0.6,
  variant = "loose",
  seed = 42,
}: ScribbleUnderlineProps) {
  // Generate organic scribble path with seeded randomness for consistency
  const paths = useMemo(() => {
    const lines = variant === "chaotic" ? 3 : variant === "tight" ? 2 : 2;
    const generatedPaths: string[] = [];
    
    // Simple seeded random for consistent generation
    let randomSeed = seed;
    const seededRandom = () => {
      randomSeed = (randomSeed * 9301 + 49297) % 233280;
      return randomSeed / 233280;
    };

    for (let line = 0; line < lines; line++) {
      const yOffset = height / 2 + (line - lines / 2) * 3;
      let path = `M 0,${yOffset}`;

      const segments = 12 + Math.floor(seededRandom() * 4);
      for (let i = 1; i <= segments; i++) {
        const x = (width / segments) * i;
        const y = yOffset + (seededRandom() - 0.5) * 4;
        const tension = seededRandom() * 0.3 + 0.2;

        if (i === 1) {
          path += ` L ${x},${y}`;
        } else {
          const prevX = (width / segments) * (i - 1);
          const cpX = prevX + (x - prevX) * tension;
          path += ` Q ${cpX},${y} ${x},${y}`;
        }
      }
      generatedPaths.push(path);
    }

    return generatedPaths;
  }, [width, height, variant, seed]);

  return (
    <svg
      className={cn("absolute pointer-events-none", className)}
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      fill="none"
      style={{ opacity }}
    >
      <defs>
        <filter id={`roughness-${variant}`}>
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.8"
            numOctaves="2"
            result="noise"
          />
          <feDisplacementMap
            in="SourceGraphic"
            in2="noise"
            scale="0.8"
            xChannelSelector="R"
            yChannelSelector="G"
          />
        </filter>
      </defs>
      {paths.map((path, index) => (
        <path
          key={index}
          d={path}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          filter={`url(#roughness-${variant})`}
          className="text-[var(--hb-ink)]"
        />
      ))}
    </svg>
  );
}
