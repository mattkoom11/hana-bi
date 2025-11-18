/**
 * PaperBackground - Wrapper that adds subtle paper textures and depth
 * 
 * Creates a layered canvas background with paper grain, subtle gradients,
 * and vignette effects reminiscent of scanned sketchbooks.
 */

import { cn } from "@/lib/utils";
import { PropsWithChildren } from "react";

interface PaperBackgroundProps extends PropsWithChildren {
  className?: string;
  intensity?: "subtle" | "medium" | "strong";
  texture?: "grain" | "canvas" | "both";
}

export function PaperBackground({
  children,
  className,
  intensity = "subtle",
  texture = "both",
}: PaperBackgroundProps) {
  const intensityClasses = {
    subtle: "opacity-[0.02]",
    medium: "opacity-[0.04]",
    strong: "opacity-[0.06]",
  };

  const hasGrain = texture === "grain" || texture === "both";
  const hasCanvas = texture === "canvas" || texture === "both";

  return (
    <div
      className={cn(
        "relative",
        className
      )}
    >
      {/* Paper grain texture */}
      {hasGrain && (
        <div
          className={cn(
            "absolute inset-0 pointer-events-none",
            intensityClasses[intensity]
          )}
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100' height='100' filter='url(%23noise)'/%3E%3C/svg%3E")`,
            backgroundSize: "200px 200px",
            mixBlendMode: "multiply",
          }}
        />
      )}

      {/* Canvas texture */}
      {hasCanvas && (
        <div
          className={cn(
            "absolute inset-0 pointer-events-none",
            intensityClasses[intensity]
          )}
          style={{
            backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(26, 26, 26, 0.03) 2px, rgba(26, 26, 26, 0.03) 4px)`,
          }}
        />
      )}

      {/* Subtle vignette effect */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse at center, transparent 0%, rgba(26, 26, 26, 0.015) 100%)`,
        }}
      />

      {/* Content */}
      <div className="relative z-10">{children}</div>
    </div>
  );
}

