"use client";

import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes, forwardRef, useEffect, useMemo, useRef, useState } from "react";

export interface HandDrawnButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "ghost";
  loading?: boolean;
}

/**
 * HandDrawnButton - Button with imperfect, hand-drawn aesthetic
 * Features uneven borders, subtle wobble on hover, and ink-like outlines
 */
export const HandDrawnButton = forwardRef<HTMLButtonElement, HandDrawnButtonProps>(
  ({ className, variant = "primary", disabled, loading, children, onClick, ...props }, ref) => {
    const [isHovered, setIsHovered] = useState(false);
    const buttonRef = useRef<HTMLButtonElement | null>(null);

    // Generate unique imperfect border path with seeded randomness
    const borderPath = useMemo(() => {
      const width = 100; // percentage
      const height = 100; // percentage
      const seed = variant === "primary" ? 42 : 84;
      
      // Seeded random for consistent borders
      let randomSeed = seed;
      const seededRandom = () => {
        randomSeed = (randomSeed * 9301 + 49297) % 233280;
        return randomSeed / 233280;
      };

      // Create slightly uneven corners
      const jitter = 0.8; // Amount of imperfection
      const corners = [
        { x: 0 + (seededRandom() - 0.5) * jitter, y: 0 + (seededRandom() - 0.5) * jitter },
        { x: width + (seededRandom() - 0.5) * jitter, y: 0 + (seededRandom() - 0.5) * jitter },
        { x: width + (seededRandom() - 0.5) * jitter, y: height + (seededRandom() - 0.5) * jitter },
        { x: 0 + (seededRandom() - 0.5) * jitter, y: height + (seededRandom() - 0.5) * jitter },
      ];

      // Create path with slight curves instead of hard corners
      let path = `M ${corners[0].x},${corners[0].y}`;
      
      for (let i = 1; i <= corners.length; i++) {
        const current = corners[i % corners.length];
        const prev = corners[i - 1];
        
        // Add subtle curve to simulate hand-drawn line
        const midX = (prev.x + current.x) / 2;
        const midY = (prev.y + current.y) / 2;
        const controlX = midX + (seededRandom() - 0.5) * 0.5;
        const controlY = midY + (seededRandom() - 0.5) * 0.5;
        
        path += ` Q ${controlX},${controlY} ${current.x},${current.y}`;
      }
      
      return path + ' Z';
    }, [variant]);

    // Generate inner shadow path for ink effect
    const inkPath = useMemo(() => {
      const width = 100;
      const height = 100;
      const seed = variant === "primary" ? 123 : 167;
      
      let randomSeed = seed;
      const seededRandom = () => {
        randomSeed = (randomSeed * 9301 + 49297) % 233280;
        return randomSeed / 233280;
      };

      const inset = 1.5;
      const jitter = 0.6;
      
      const corners = [
        { x: inset + (seededRandom() - 0.5) * jitter, y: inset + (seededRandom() - 0.5) * jitter },
        { x: width - inset + (seededRandom() - 0.5) * jitter, y: inset + (seededRandom() - 0.5) * jitter },
        { x: width - inset + (seededRandom() - 0.5) * jitter, y: height - inset + (seededRandom() - 0.5) * jitter },
        { x: inset + (seededRandom() - 0.5) * jitter, y: height - inset + (seededRandom() - 0.5) * jitter },
      ];

      let path = `M ${corners[0].x},${corners[0].y}`;
      
      for (let i = 1; i <= corners.length; i++) {
        const current = corners[i % corners.length];
        path += ` L ${current.x},${current.y}`;
      }
      
      return path + ' Z';
    }, [variant]);

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (disabled || loading) return;
      onClick?.(e);
    };

    const isDisabled = disabled || loading;

    const baseStyles = cn(
      "relative",
      "px-8 py-4 uppercase tracking-[0.35em] text-xs font-sans",
      "transition-all duration-700 ease-[cubic-bezier(0.19,1,0.22,1)]",
      "focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[var(--hb-ink)]",
      isDisabled ? "cursor-not-allowed" : "cursor-pointer"
    );

    const variantStyles = {
      primary: cn(
        "bg-[var(--hb-ink)] text-[var(--hb-paper)]",
        !isDisabled && "hover:bg-[var(--hb-ink-light)]",
        isDisabled && "bg-[var(--hb-smoke-light)] text-[var(--hb-paper-muted)] opacity-50"
      ),
      ghost: cn(
        "bg-transparent text-[var(--hb-ink)]",
        !isDisabled && "hover:bg-[var(--hb-paper-muted)]",
        "opacity-80 hover:opacity-100",
        isDisabled && "text-[var(--hb-smoke-light)] opacity-40"
      ),
    };

    return (
      <button
        ref={(node) => {
          buttonRef.current = node;
          if (typeof ref === "function") {
            ref(node);
          } else if (ref) {
            ref.current = node;
          }
        }}
        className={cn(baseStyles, variantStyles[variant], className)}
        disabled={isDisabled}
        onClick={handleClick}
        onMouseEnter={() => !isDisabled && setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{
          transform: isHovered && !isDisabled 
            ? `translateY(-2px) rotate(${variant === "primary" ? "0.5deg" : "-0.3deg"})` 
            : "translateY(0) rotate(0deg)",
        }}
        {...props}
      >
        {/* Hand-drawn border SVG */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          style={{
            opacity: isDisabled ? 0.3 : 1,
          }}
        >
          <defs>
            {/* Roughness filter for hand-drawn effect */}
            <filter id={`roughness-${variant}`}>
              <feTurbulence
                type="fractalNoise"
                baseFrequency="0.5"
                numOctaves="2"
                result="noise"
                seed={variant === "primary" ? 1 : 2}
              />
              <feDisplacementMap
                in="SourceGraphic"
                in2="noise"
                scale="0.4"
                xChannelSelector="R"
                yChannelSelector="G"
              />
            </filter>

            {/* Ink spread effect */}
            <filter id={`ink-${variant}`}>
              <feGaussianBlur in="SourceGraphic" stdDeviation="0.3" />
              <feComponentTransfer>
                <feFuncA type="discrete" tableValues="0 1" />
              </feComponentTransfer>
            </filter>
          </defs>

          {/* Outer border - main outline */}
          <path
            d={borderPath}
            fill="none"
            stroke={variant === "primary" ? "var(--hb-paper)" : "var(--hb-ink)"}
            strokeWidth={isHovered && !isDisabled ? "1.8" : "1.5"}
            strokeLinecap="round"
            strokeLinejoin="round"
            filter={`url(#roughness-${variant})`}
            className="transition-all duration-700 ease-[cubic-bezier(0.19,1,0.22,1)]"
            style={{
              opacity: variant === "primary" ? 0.9 : 0.7,
            }}
          />

          {/* Inner border - ink pooling effect */}
          {variant === "primary" && (
            <path
              d={inkPath}
              fill="none"
              stroke="var(--hb-paper)"
              strokeWidth="0.5"
              opacity={isHovered && !isDisabled ? "0.4" : "0.2"}
              filter={`url(#ink-${variant})`}
              className="transition-all duration-700 ease-[cubic-bezier(0.19,1,0.22,1)]"
            />
          )}

          {/* Double outline for ghost variant */}
          {variant === "ghost" && (
            <path
              d={borderPath}
              fill="none"
              stroke="var(--hb-ink)"
              strokeWidth="0.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              filter={`url(#roughness-${variant})`}
              opacity={isHovered && !isDisabled ? "0.3" : "0.15"}
              className="transition-all duration-700 ease-[cubic-bezier(0.19,1,0.22,1)]"
              style={{
                transform: "translate(1px, 1px)",
              }}
            />
          )}
        </svg>

        {/* Content wrapper */}
        <span
          className={cn(
            "relative z-10 flex items-center justify-center gap-2 transition-opacity duration-300",
            loading && "opacity-60"
          )}
        >
          {loading && (
            <svg
              className="animate-spin h-4 w-4"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="3"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          )}
          {children}
        </span>

        {/* Subtle texture overlay */}
        <div
          className={cn(
            "absolute inset-0 pointer-events-none opacity-[0.02] mix-blend-multiply transition-opacity duration-700",
            isHovered && !isDisabled && "opacity-[0.04]"
          )}
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' /%3E%3C/filter%3E%3Crect width='100' height='100' filter='url(%23noise)' /%3E%3C/svg%3E")`,
            backgroundSize: "100px 100px",
          }}
        />
      </button>
    );
  }
);

HandDrawnButton.displayName = "HandDrawnButton";
