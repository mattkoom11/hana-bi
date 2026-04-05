"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function ProjectError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Project error:", error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-md text-center space-y-6">
        <p
          className="text-xs uppercase tracking-[0.4em] opacity-60 font-script"
          style={{ color: "var(--hb-smoke)" }}
        >
          Projects
        </p>
        <h1 className="font-serif text-4xl leading-tight">
          Project not found
        </h1>
        <p
          className="text-sm"
          style={{ color: "var(--hb-smoke)" }}
        >
          This project couldn&apos;t be loaded. Return to the projects index to browse documentation.
        </p>
        <div className="flex gap-4 justify-center pt-2">
          <button
            onClick={reset}
            className="px-6 py-3 border border-dashed border-[var(--hb-border)] text-[var(--hb-smoke)] uppercase tracking-[0.3em] text-xs hover:border-[var(--hb-ink)] transition-all duration-300"
            style={{ fontFamily: "var(--hb-font-mono)" }}
          >
            Try again
          </button>
          <Link
            href="/projects"
            className="px-6 py-3 border border-[var(--hb-ink)] text-[var(--hb-ink)] uppercase tracking-[0.3em] text-xs hover:bg-[var(--hb-ink)] hover:text-[var(--hb-paper)] transition-all duration-300"
            style={{ fontFamily: "var(--hb-font-mono)" }}
          >
            All projects
          </Link>
        </div>
      </div>
    </div>
  );
}
