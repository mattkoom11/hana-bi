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
}

export function PageShell({
  title,
  eyebrow,
  intro,
  className,
  children,
}: PageShellProps) {
  return (
    <section className={cn("px-4 sm:px-8 md:px-12 lg:px-20 py-24 space-airy relative", className)}>
      <PaperBackground intensity="subtle" texture="grain" className="absolute inset-0" />
      
      <header className="max-w-4xl mb-20 relative z-10">
        {eyebrow && (
          <span className="uppercase text-xs tracking-[0.4em] text-[var(--hb-smoke)] font-script opacity-70">
            {eyebrow}
          </span>
        )}
        <div className="mt-8 space-y-4">
          <h1 className="font-serif text-5xl sm:text-6xl lg:text-7xl tracking-tight leading-[1.05]">
            {title}
          </h1>
          <InkUnderline className="mt-4" width={180} variant="wispy" strokeOpacity={0.4} />
        </div>
        {intro && (
          <div className="mt-10 text-lg leading-relaxed text-[var(--hb-smoke)] opacity-85 max-w-2xl">
            {intro}
          </div>
        )}
      </header>
      
      {/* Hand-drawn divider */}
      <div className="absolute top-0 left-0 right-0 flex justify-center z-10">
        <HandDrawnDivider variant="delicate" strokeOpacity={0.25} />
      </div>
      
      <div className="space-wispy relative z-10 mt-8">{children}</div>
    </section>
  );
}

