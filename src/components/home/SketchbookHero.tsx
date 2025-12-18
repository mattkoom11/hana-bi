"use client";

import { cn } from "@/lib/utils";
import { HandDrawnButton } from "@/components/common/HandDrawnButton";
import { ScribbleUnderline } from "./ScribbleUnderline";
import { HandDrawnArrow } from "./HandDrawnArrow";
import Link from "next/link";
import { useEffect, useState } from "react";

export function SketchbookHero() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-[var(--hb-paper)]">
      {/* Subtle paper texture overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='200' height='200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23noise)' opacity='0.5'/%3E%3C/svg%3E")`,
          backgroundSize: "200px 200px",
        }}
      />

      {/* Content */}
      <div className="relative z-10 px-4 sm:px-8 md:px-12 lg:px-20 py-16 w-full max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-[1fr_auto] gap-16 lg:gap-24 items-center">
          {/* Left column - Main content */}
          <div className="space-y-8 lg:space-y-10">
            {/* Eyebrow */}
            <div
              className={cn(
                "transition-all duration-1000 ease-[cubic-bezier(0.19,1,0.22,1)]",
                mounted
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-4"
              )}
            >
              <p className="uppercase text-[0.65rem] sm:text-xs tracking-[0.5em] text-[var(--hb-smoke)] opacity-60 font-sans">
                Spring / Summer 2025
              </p>
            </div>

            {/* Main headline with scribble underlines */}
            <div
              className={cn(
                "space-y-4 transition-all duration-1200 ease-[cubic-bezier(0.19,1,0.22,1)] delay-150",
                mounted
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-6"
              )}
            >
              <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl leading-[1.08] tracking-tight text-[var(--hb-ink)]">
                <span className="inline-block">
                  Timeless
                  <span className="relative inline-block ml-3 sm:ml-4">
                    <span className="relative z-10">denim</span>
                    <ScribbleUnderline
                      className="left-0 bottom-0 w-full"
                      width={160}
                      height={16}
                      variant="loose"
                      opacity={0.5}
                      seed={42}
                    />
                  </span>
                </span>
                <br />
                <span className="inline-block mt-1 sm:mt-2">
                  crafted with
                </span>
                <br />
                <span className="relative inline-block mt-1 sm:mt-2">
                  <span className="relative z-10">intention</span>
                  <ScribbleUnderline
                    className="left-0 bottom-1 w-full"
                    width={240}
                    height={18}
                    variant="chaotic"
                    opacity={0.45}
                    seed={123}
                  />
                </span>
              </h1>
            </div>

            {/* Subheading */}
            <div
              className={cn(
                "transition-all duration-1200 ease-[cubic-bezier(0.19,1,0.22,1)] delay-300",
                mounted
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-6"
              )}
            >
              <p className="text-base sm:text-lg md:text-xl leading-relaxed text-[var(--hb-smoke)] max-w-xl opacity-75">
                Each piece tells a story. Hand-selected fabrics meet Japanese
                craftsmanship in limited editions that resist the seasonal churn.
              </p>
            </div>

            {/* CTA Buttons with mobile arrow */}
            <div
              className={cn(
                "flex flex-col sm:flex-row gap-4 sm:gap-5 pt-4 relative transition-all duration-1200 ease-[cubic-bezier(0.19,1,0.22,1)] delay-450",
                mounted
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-6"
              )}
            >
              {/* Mobile arrow - positioned above button */}
              <div
                className={cn(
                  "lg:hidden absolute -top-16 left-0 transition-all duration-1500 ease-[cubic-bezier(0.19,1,0.22,1)] delay-700",
                  mounted
                    ? "opacity-30 scale-100"
                    : "opacity-0 scale-95"
                )}
              >
                <HandDrawnArrow
                  direction="down"
                  size={60}
                  opacity={0.5}
                />
                <p className="font-script text-xs text-[var(--hb-ink)] opacity-40 -mt-2 ml-8">
                  Start here
                </p>
              </div>

              <Link href="/shop">
                <HandDrawnButton variant="primary" className="w-full sm:w-auto">
                  Explore Collection
                </HandDrawnButton>
              </Link>
              <Link href="/about">
                <HandDrawnButton variant="ghost" className="w-full sm:w-auto">
                  Our Story
                </HandDrawnButton>
              </Link>
            </div>

            {/* Hand-drawn note */}
            <div
              className={cn(
                "pt-6 transition-all duration-1200 ease-[cubic-bezier(0.19,1,0.22,1)] delay-600",
                mounted
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-4"
              )}
            >
              <p className="font-script text-sm text-[var(--hb-smoke)] opacity-50 italic">
                Limited drops, lasting impact
              </p>
            </div>
          </div>

          {/* Right column - Hand-drawn arrow pointing to CTA */}
          <div
            className={cn(
              "hidden lg:block relative transition-all duration-1500 ease-[cubic-bezier(0.19,1,0.22,1)] delay-700",
              mounted
                ? "opacity-100 scale-100 rotate-0"
                : "opacity-0 scale-95 rotate-3"
            )}
          >
            <HandDrawnArrow
              direction="down-left"
              size={120}
              opacity={0.35}
              className="absolute -left-16 top-0"
            />
            <div className="pl-12 pt-8 space-y-3">
              <p className="font-script text-base text-[var(--hb-ink)] opacity-40 rotate-[-2deg]">
                Start here
              </p>
            </div>
          </div>
        </div>

        {/* Bottom decoration - sketch marks */}
        <div
          className={cn(
            "mt-16 lg:mt-24 flex items-center gap-8 transition-all duration-1200 ease-[cubic-bezier(0.19,1,0.22,1)] delay-800",
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          )}
        >
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-[var(--hb-border)] to-transparent opacity-30" />
          <div className="flex gap-6 text-xs uppercase tracking-[0.3em] text-[var(--hb-smoke)] opacity-50">
            <span>Sustainable</span>
            <span className="opacity-30">·</span>
            <span>Limited</span>
            <span className="opacity-30">·</span>
            <span>Archival</span>
          </div>
          <div className="flex-1 h-px bg-gradient-to-r from-[var(--hb-border)] to-transparent opacity-30" />
        </div>
      </div>

      {/* Decorative sketch elements */}
      <div
        className={cn(
          "absolute top-8 right-8 opacity-20 transition-all duration-1500 ease-[cubic-bezier(0.19,1,0.22,1)] delay-900",
          mounted ? "opacity-20 rotate-0" : "opacity-0 rotate-12"
        )}
      >
        <svg
          width="60"
          height="60"
          viewBox="0 0 60 60"
          fill="none"
          className="text-[var(--hb-ink)]"
        >
          <circle
            cx="30"
            cy="30"
            r="25"
            stroke="currentColor"
            strokeWidth="1"
            strokeDasharray="4 4"
            opacity="0.4"
          />
          <path
            d="M 20,30 L 40,30 M 30,20 L 30,40"
            stroke="currentColor"
            strokeWidth="1"
            opacity="0.3"
          />
        </svg>
      </div>

      <div
        className={cn(
          "absolute bottom-8 left-8 opacity-15 transition-all duration-1500 ease-[cubic-bezier(0.19,1,0.22,1)] delay-1000",
          mounted ? "opacity-15 rotate-0" : "opacity-0 rotate-[-12deg]"
        )}
      >
        <svg
          width="80"
          height="40"
          viewBox="0 0 80 40"
          fill="none"
          className="text-[var(--hb-ink)]"
        >
          <path
            d="M 5,20 Q 20,10 40,20 T 75,20"
            stroke="currentColor"
            strokeWidth="1"
            strokeDasharray="3 3"
            opacity="0.5"
          />
        </svg>
      </div>
    </section>
  );
}
