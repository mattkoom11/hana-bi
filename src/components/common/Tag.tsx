import { cn } from "@/lib/utils";
import { PropsWithChildren } from "react";

interface TagProps extends PropsWithChildren {
  variant?: "solid" | "outline";
}

export function Tag({ children, variant = "solid" }: TagProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center uppercase tracking-[0.12em] text-[0.65rem]",
        "px-3 py-1 rounded-full border",
        variant === "solid"
          ? "bg-[var(--hb-tag)] border-[var(--hb-border)] text-[var(--hb-ink)]"
          : "border-dashed border-[var(--hb-border)] text-[var(--hb-smoke)]"
      )}
    >
      {children}
    </span>
  );
}

