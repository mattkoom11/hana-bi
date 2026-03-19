import { HandDrawnDivider } from "@/components/common/HandDrawnDivider";
import { InkUnderline } from "@/components/common/InkUnderline";
import { PaperBackground } from "@/components/common/PaperBackground";
import { cn } from "@/lib/utils";
import { PropsWithChildren, ReactNode } from "react";

interface PageShellProps extends PropsWithChildren {
  title: string;
  eyebrow?: string;
  intro?: ReactNode;
  className?: string;
  variant?: "light" | "dark";
}

export function PageShell({
  title,
  eyebrow,
  intro,
  className,
  children,
  variant = "light",
}: PageShellProps) {
  const isDark = variant === "dark";

  return (
    <section
      className={cn(
        "px-4 sm:px-8 md:px-12 lg:px-20 py-24 space-airy relative",
        isDark ? "bg-[var(--hb-dark)]" : "",
        className
      )}
    >
      {!isDark && (
        <PaperBackground intensity="subtle" texture="grain" className="absolute inset-0" />
      )}

      <header className="max-w-4xl mb-20 relative z-10">
        {eyebrow && (
          <span
            className={`uppercase text-xs tracking-[0.4em] font-script opacity-70 ${
              isDark ? "text-[var(--hb-sienna)]" : "text-[var(--hb-smoke)]"
            }`}
          >
            {eyebrow}
          </span>
        )}
        <div className="mt-8 space-y-4">
          <h1
            className={`font-serif text-5xl sm:text-6xl lg:text-7xl tracking-tight leading-[1.05] ${
              isDark ? "text-[#faf8f4]" : ""
            }`}
          >
            {title}
          </h1>
          {!isDark && (
            <InkUnderline className="mt-4" width={180} variant="wispy" strokeOpacity={0.4} />
          )}
        </div>
        {intro && (
          <div
            className={`mt-10 text-lg leading-relaxed max-w-2xl ${
              isDark ? "text-[var(--hb-dark-muted)]" : "text-[var(--hb-smoke)] opacity-85"
            }`}
          >
            {intro}
          </div>
        )}
      </header>

      {!isDark && (
        <div className="absolute top-0 left-0 right-0 flex justify-center z-10">
          <HandDrawnDivider variant="delicate" strokeOpacity={0.25} />
        </div>
      )}

      <div className="space-wispy relative z-10 mt-8">{children}</div>
    </section>
  );
}

