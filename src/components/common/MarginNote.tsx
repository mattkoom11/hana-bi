/**
 * MarginNote - Small stylized text positioned in corners or edges
 * 
 * Creates handwritten-style annotations that feel like margin notes
 * in a sketchbook or editorial spread.
 */

import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface MarginNoteProps {
  children: ReactNode;
  position?: "top-left" | "top-right" | "bottom-left" | "bottom-right" | "left" | "right";
  className?: string;
  variant?: "script" | "serif" | "sans";
  size?: "xs" | "sm" | "base";
}

const positionClasses = {
  "top-left": "absolute top-4 left-4",
  "top-right": "absolute top-4 right-4",
  "bottom-left": "absolute bottom-4 left-4",
  "bottom-right": "absolute bottom-4 right-4",
  left: "absolute left-4 top-1/2 -translate-y-1/2 -rotate-90 origin-center",
  right: "absolute right-4 top-1/2 -translate-y-1/2 rotate-90 origin-center",
};

const variantClasses = {
  script: "font-script",
  serif: "font-serif italic",
  sans: "font-sans",
};

const sizeClasses = {
  xs: "text-[0.6rem]",
  sm: "text-xs",
  base: "text-sm",
};

export function MarginNote({
  children,
  position = "top-right",
  className,
  variant = "script",
  size = "xs",
}: MarginNoteProps) {
  return (
    <div
      className={cn(
        positionClasses[position],
        variantClasses[variant],
        sizeClasses[size],
        "text-[var(--hb-smoke)] opacity-60 tracking-[0.15em] uppercase z-10 pointer-events-none",
        className
      )}
    >
      {children}
    </div>
  );
}

