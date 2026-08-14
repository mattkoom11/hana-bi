"use client";

/**
 * ScrollStage — a pinned viewport whose content is driven by scroll
 * progress. One of only two motion systems in the site (the other is the
 * video crossfade) — see design/components/scroll-stage.md.
 */

import { useEffect, useRef, useState, type ReactNode, type CSSProperties } from "react";

export interface ScrollStageStep {
  id?: string;
  eyebrow?: string;
  kanji?: string;
  title: string;
  body?: string;
  caption?: string;
}

interface ScrollStageProps {
  steps: ScrollStageStep[];
  scrollTarget?: HTMLElement | null;
  rotateCenter?: boolean;
  rotateDegrees?: number;
  height?: string;
  center?: ReactNode | ((index: number, progress: number) => ReactNode);
  renderStep?: (
    step: ScrollStageStep,
    ctx: { index: number; isActive: boolean; local: number; progress: number }
  ) => ReactNode;
  variant?: "dark" | "light";
  showPager?: boolean;
  style?: CSSProperties;
}

const clamp01 = (n: number) => Math.min(1, Math.max(0, n));

export function ScrollStage({
  steps,
  scrollTarget,
  rotateCenter = false,
  rotateDegrees = 360,
  center,
  renderStep,
  variant = "dark",
  showPager = true,
  style,
}: ScrollStageProps) {
  const outerRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);
  const count = steps.length;
  const isDark = variant === "dark";

  useEffect(() => {
    const el = outerRef.current;
    if (!el) return;
    const container = scrollTarget ?? null;

    const measure = () => {
      const rect = el.getBoundingClientRect();
      const viewportH = container ? container.clientHeight : window.innerHeight;
      const containerTop = container ? container.getBoundingClientRect().top : 0;
      const scrollable = rect.height - viewportH;
      if (scrollable <= 0) return;
      setProgress(clamp01((containerTop - rect.top) / scrollable));
    };

    measure();
    const target: EventTarget = container ?? window;
    target.addEventListener("scroll", measure, { passive: true });
    window.addEventListener("resize", measure);
    return () => {
      target.removeEventListener("scroll", measure);
      window.removeEventListener("resize", measure);
    };
  }, [scrollTarget]);

  const activeIndex = Math.min(count - 1, Math.floor(progress * count));
  const fg = isDark ? "var(--hb-on-dark)" : "var(--hb-ink)";
  const dim = isDark ? "var(--hb-dark-muted)" : "var(--hb-smoke)";
  const line = isDark ? "var(--hb-dark-border)" : "var(--hb-border)";
  const kanjiColor = isDark ? "var(--hb-dark-kanji)" : "rgba(26,26,26,0.06)";

  const centerLayers =
    typeof center === "function"
      ? Array.from({ length: count }, (_, i) => i).filter(
          (i) => Math.abs(i - activeIndex) <= 1
        )
      : null;

  return (
    <div
      ref={outerRef}
      style={{ position: "relative", minHeight: `${count * 100}vh`, ...style }}
    >
      <div
        style={{
          position: "sticky",
          top: 0,
          height: "100vh",
          overflow: "hidden",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {center && (
          <div
            aria-hidden="true"
            style={{
              position: "absolute",
              inset: 0,
              pointerEvents: "none",
              transform: rotateCenter ? `rotate(${progress * rotateDegrees}deg)` : undefined,
              willChange: rotateCenter ? "transform" : undefined,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {typeof center === "function"
              ? centerLayers!.map((i) => (
                  <div
                    key={i}
                    style={{
                      position: "absolute",
                      opacity: i === activeIndex ? 1 : 0,
                      transition: "opacity 700ms ease-in-out",
                      willChange: "opacity",
                    }}
                  >
                    {center(i, progress)}
                  </div>
                ))
              : center}
          </div>
        )}

        {steps.map((step, i) => {
          const isActive = i === activeIndex;
          const local = clamp01(progress * count - i);
          return (
            <div
              key={step.id ?? i}
              aria-hidden={!isActive}
              style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                padding: "0 var(--hb-gutter)",
                textAlign: "center",
                opacity: isActive ? 1 : 0,
                pointerEvents: isActive ? "auto" : "none",
                transform: isActive
                  ? `translateY(${(local - 0.5) * -24}px)`
                  : "translateY(16px)",
                transition: "opacity 700ms ease-in-out, transform 700ms var(--hb-ease-expo-out)",
                willChange: "opacity, transform",
              }}
            >
              {renderStep ? (
                renderStep(step, { index: i, isActive, local, progress })
              ) : (
                <>
                  {step.eyebrow && (
                    <p
                      style={{
                        fontFamily: "var(--hb-font-mono)",
                        fontSize: "var(--hb-label-xs)",
                        textTransform: "uppercase",
                        letterSpacing: "var(--hb-track-eyebrow)",
                        color: "var(--hb-sienna)",
                        marginBottom: "1.5rem",
                      }}
                    >
                      {step.eyebrow}
                    </p>
                  )}
                  {step.kanji && (
                    <span
                      aria-hidden="true"
                      style={{
                        fontFamily: "var(--hb-font-kanji)",
                        fontSize: "clamp(6rem, 20vw, 16rem)",
                        lineHeight: 1,
                        color: kanjiColor,
                      }}
                    >
                      {step.kanji}
                    </span>
                  )}
                  <h3
                    style={{
                      fontFamily: "var(--hb-font-display)",
                      fontStyle: "italic",
                      fontWeight: 300,
                      fontSize: "clamp(2rem, 5vw, 4rem)",
                      lineHeight: 1.05,
                      letterSpacing: "-0.01em",
                      color: fg,
                      textWrap: "balance",
                      margin: 0,
                    }}
                  >
                    {step.title}
                  </h3>
                  {step.body && (
                    <p
                      style={{
                        fontSize: "1.125rem",
                        lineHeight: 1.7,
                        color: dim,
                        maxWidth: "34rem",
                        marginTop: "1.5rem",
                      }}
                    >
                      {step.body}
                    </p>
                  )}
                  {step.caption && (
                    <p
                      style={{
                        fontFamily: "var(--hb-font-mono)",
                        fontSize: "var(--hb-label-2xs)",
                        textTransform: "uppercase",
                        letterSpacing: "var(--hb-track-meta)",
                        color: dim,
                        opacity: 0.7,
                        marginTop: "2rem",
                      }}
                    >
                      {step.caption}
                    </p>
                  )}
                </>
              )}
            </div>
          );
        })}

        {showPager && (
          <div
            aria-hidden="true"
            style={{
              position: "absolute",
              bottom: "2rem",
              right: "2rem",
              fontFamily: "var(--hb-font-mono)",
              fontSize: "var(--hb-label-xs)",
              fontVariantNumeric: "tabular-nums",
              color: dim,
            }}
          >
            {String(activeIndex + 1).padStart(2, "0")} / {String(count).padStart(2, "0")}
          </div>
        )}

        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: "2px",
            background: line,
          }}
        >
          <div
            style={{
              width: `${progress * 100}%`,
              height: "100%",
              background: "var(--hb-sienna)",
              opacity: 0.5,
            }}
          />
        </div>
      </div>
    </div>
  );
}
