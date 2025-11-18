import { cn } from "@/lib/utils";
import { PropsWithChildren } from "react";

type Tilt = "left" | "right" | "none";

interface SketchFrameProps extends PropsWithChildren {
  tilt?: Tilt;
  className?: string;
}

export function SketchFrame({
  children,
  tilt = "none",
  className,
}: SketchFrameProps) {
  const rotations: Record<Tilt, string> = {
    none: "rotate-0",
    left: "-rotate-1",
    right: "rotate-1",
  };

  return (
    <div
      className={cn(
        "border border-[var(--hb-border)] bg-[var(--hb-paper-muted)]",
        "shadow-[6px_6px_0_rgba(26,22,20,0.08)] p-4",
        rotations[tilt],
        className
      )}
    >
      {children}
    </div>
  );
}

