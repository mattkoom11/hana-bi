import { cn } from "@/lib/utils";
import { PropsWithChildren } from "react";

interface BadgeProps extends PropsWithChildren {
  tone?: "ink" | "smoke" | "sienna";
}

export function Badge({ children, tone = "ink" }: BadgeProps) {
  const tones: Record<typeof tone, string> = {
    ink: "bg-[var(--hb-ink)] text-[var(--hb-paper)]",
    smoke: "bg-[var(--hb-smoke)] text-white",
    sienna: "bg-[var(--hb-sienna)] text-white",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center px-3 py-0.5 text-xs uppercase tracking-[0.18em]",
        "rounded-sm font-semibold",
        tones[tone]
      )}
    >
      {children}
    </span>
  );
}

