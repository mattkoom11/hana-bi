import { InkUnderline } from "@/components/common/InkUnderline";
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
    <section className={cn("px-4 sm:px-8 md:px-12 lg:px-20 py-20 space-airy", className)}>
      <header className="max-w-3xl mb-16">
        {eyebrow && (
          <span className="uppercase text-xs tracking-[0.4em] text-[var(--hb-smoke)] font-script opacity-70">
            {eyebrow}
          </span>
        )}
        <div className="mt-6 space-y-3">
          <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl tracking-tight leading-[1.1]">
            {title}
          </h1>
          <InkUnderline className="mt-3" width={140} variant="wispy" strokeOpacity={0.4} />
        </div>
        {intro && (
          <div className="mt-8 text-base leading-relaxed text-[var(--hb-smoke)] opacity-80 max-w-2xl">
            {intro}
          </div>
        )}
      </header>
      <div className="space-wispy">{children}</div>
    </section>
  );
}

