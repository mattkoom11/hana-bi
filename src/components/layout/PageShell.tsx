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
    <section className={cn("px-4 sm:px-8 md:px-12 lg:px-20 py-16", className)}>
      <header className="max-w-3xl mb-12">
        {eyebrow && (
          <span className="uppercase text-xs tracking-[0.35em] text-[var(--hb-smoke)]">
            {eyebrow}
          </span>
        )}
        <div className="mt-4">
          <h1 className="font-serif text-4xl sm:text-5xl tracking-tight">
            {title}
          </h1>
          <InkUnderline className="mt-2" />
        </div>
        {intro && (
          <div className="mt-6 text-base leading-relaxed text-[var(--hb-smoke)]">
            {intro}
          </div>
        )}
      </header>
      <div>{children}</div>
    </section>
  );
}

