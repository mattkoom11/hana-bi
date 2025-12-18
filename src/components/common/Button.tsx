"use client";

import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes, forwardRef, useEffect, useRef, useState } from "react";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost";
  loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", disabled, loading, children, onClick, ...props }, ref) => {
    const [ripples, setRipples] = useState<Array<{ x: number; y: number; id: number }>>([]);
    const buttonRef = useRef<HTMLButtonElement | null>(null);
    const rippleIdRef = useRef(0);

    useEffect(() => {
      if (ripples.length > 0) {
        const timer = setTimeout(() => {
          setRipples((prev) => prev.slice(1));
        }, 800);
        return () => clearTimeout(timer);
      }
    }, [ripples]);

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (disabled || loading) return;

      const button = buttonRef.current || e.currentTarget;
      const rect = button.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      setRipples((prev) => [...prev, { x, y, id: rippleIdRef.current++ }]);

      onClick?.(e);
    };

    const isDisabled = disabled || loading;

    const baseStyles = cn(
      "relative overflow-hidden",
      "px-8 py-4 uppercase tracking-[0.35em] text-xs font-sans",
      "transition-all duration-500 ease-[cubic-bezier(0.19,1,0.22,1)]",
      "focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[var(--hb-ink)]",
      "active:scale-[0.98]",
      isDisabled ? "cursor-not-allowed" : "cursor-pointer"
    );

    const variantStyles = {
      primary: cn(
        "border border-[var(--hb-ink)] bg-[var(--hb-ink)] text-[var(--hb-paper)]",
        !isDisabled && "hover:bg-[var(--hb-ink-light)] hover:-translate-y-[2px] hover:shadow-[0_6px_20px_rgba(26,26,26,0.15)]",
        isDisabled && "bg-[var(--hb-smoke-light)] border-[var(--hb-smoke-light)] text-[var(--hb-paper-muted)] opacity-50"
      ),
      secondary: cn(
        "border border-[var(--hb-ink)] bg-transparent text-[var(--hb-ink)]",
        !isDisabled && "hover:bg-[var(--hb-ink)] hover:text-[var(--hb-paper)] hover:-translate-y-[2px] hover:shadow-[0_6px_20px_rgba(26,26,26,0.12)]",
        isDisabled && "border-[var(--hb-smoke-light)] text-[var(--hb-smoke-light)] opacity-50"
      ),
      ghost: cn(
        "border border-transparent bg-transparent text-[var(--hb-ink)]",
        !isDisabled && "hover:border-[var(--hb-border)] hover:bg-[var(--hb-paper-muted)] hover:opacity-100",
        "opacity-70",
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
        {...props}
      >
        {/* Ripple effect */}
        {ripples.map((ripple) => (
          <span
            key={ripple.id}
            className="absolute rounded-full pointer-events-none animate-ripple"
            style={{
              left: ripple.x,
              top: ripple.y,
              width: "0px",
              height: "0px",
              background:
                variant === "primary"
                  ? "rgba(250, 248, 244, 0.3)"
                  : "rgba(26, 26, 26, 0.15)",
            }}
          />
        ))}

        {/* Content wrapper for opacity control */}
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

        {/* Subtle overlay for depth */}
        <span
          className={cn(
            "absolute inset-0 pointer-events-none transition-opacity duration-500",
            "bg-gradient-to-b from-transparent via-transparent to-black/[0.03]",
            !isDisabled && variant === "primary" && "group-hover:opacity-0"
          )}
        />
      </button>
    );
  }
);

Button.displayName = "Button";
