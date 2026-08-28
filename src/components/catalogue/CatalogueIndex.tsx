"use client";

/**
 * CatalogueIndex — an archive read as a tracklist rather than a card grid.
 * Numbered rows, type only, imagery revealed on hover in one fixed plate.
 * See design/components/catalogue-index.md.
 *
 * Two details are load-bearing — do not "clean them up":
 * the name cell's line-height is 1.45 (not 1.1, or italic Spectral clips
 * under the ellipsis's overflow:hidden), and the preview plate sits behind
 * the rows at z-index 0 so type overlaps imagery on purpose.
 */

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export interface CatalogueIndexItem {
  id?: string;
  slug?: string;
  name: string;
  number?: string;
  catalogNumber?: string;
  image?: string;
  href?: string;
  [column: string]: unknown;
}

interface CatalogueIndexProps {
  items: CatalogueIndexItem[];
  variant?: "dark" | "light";
  showPreview?: boolean;
  onSelect?: (item: CatalogueIndexItem, index: number) => void;
  columns?: string[];
}

export function CatalogueIndex({
  items,
  variant = "dark",
  showPreview = true,
  onSelect,
  columns = ["collection", "year"],
}: CatalogueIndexProps) {
  const [active, setActive] = useState<number | null>(null);
  const router = useRouter();
  const isDark = variant === "dark";

  const fg = isDark ? "var(--hb-on-dark)" : "var(--hb-ink)";
  const dim = isDark ? "var(--hb-dark-muted)" : "var(--hb-smoke)";
  const line = isDark ? "var(--hb-dark-border)" : "var(--hb-border)";

  const activeItem = active !== null ? items[active] : null;
  const previewVisible = showPreview && !!activeItem?.image;

  const metaStyle: React.CSSProperties = {
    fontFamily: "var(--hb-font-mono)",
    fontSize: "var(--hb-label-xs)",
    textTransform: "uppercase",
    letterSpacing: "var(--hb-track-meta)",
    color: dim,
  };

  return (
    <div style={{ position: "relative" }}>
      {showPreview && (
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            width: "22rem",
            aspectRatio: "4 / 5",
            overflow: "hidden",
            zIndex: 0,
            pointerEvents: "none",
            willChange: "opacity, transform",
            // Feather the plate into the background so it reads as ambient
            // imagery behind the type rather than a hard-edged photograph.
            WebkitMaskImage:
              "radial-gradient(125% 115% at 78% 28%, #000 42%, transparent 100%)",
            maskImage:
              "radial-gradient(125% 115% at 78% 28%, #000 42%, transparent 100%)",
            opacity: previewVisible ? 0.62 : 0,
            transform: previewVisible
              ? "translateY(0) scale(1)"
              : "translateY(10px) scale(1.03)",
            transition:
              "opacity 650ms var(--hb-ease-expo-out), transform 700ms var(--hb-ease-expo-out)",
          }}
        >
          {activeItem?.image && (
            <Image
              src={activeItem.image}
              alt=""
              fill
              sizes="352px"
              style={{ objectFit: "cover" }}
            />
          )}
        </div>
      )}

      <ol
        style={{
          listStyle: "none",
          margin: 0,
          padding: 0,
          position: "relative",
          zIndex: 1,
        }}
      >
        {items.map((item, i) => {
          const isActive = active === i;
          const dimmed = active !== null && !isActive;
          const number =
            item.number ??
            item.catalogNumber ??
            "HB-" + String(i + 1).padStart(3, "0");

          return (
            <li key={item.id ?? item.slug ?? i} style={{ borderTop: `1px solid ${line}` }}>
              <a
                href={item.href ?? "#"}
                onMouseEnter={() => setActive(i)}
                onMouseLeave={() => setActive(null)}
                onFocus={() => setActive(i)}
                onBlur={() => setActive(null)}
                onClick={(e) => {
                  e.preventDefault();
                  if (onSelect) onSelect(item, i);
                  else if (item.href) router.push(item.href);
                }}
                style={{
                  display: "grid",
                  gridTemplateColumns: `4rem minmax(0, 1fr) repeat(${columns.length}, 9rem)`,
                  alignItems: "baseline",
                  gap: "1.5rem",
                  padding: "1.5rem 0",
                  paddingLeft: isActive ? "1rem" : 0,
                  opacity: dimmed ? 0.45 : 1,
                  transition:
                    "padding-left 450ms var(--hb-ease-expo-out), opacity 300ms ease",
                }}
              >
                <span
                  style={{
                    fontFamily: "var(--hb-font-mono)",
                    fontSize: "var(--hb-label-3xs)",
                    textTransform: "uppercase",
                    letterSpacing: "var(--hb-track-catalog)",
                    color: isDark ? "var(--hb-sienna)" : dim,
                  }}
                >
                  {number}
                </span>

                <span
                  style={{
                    fontFamily: "var(--hb-font-display)",
                    fontStyle: "italic",
                    fontWeight: 300,
                    fontSize: "clamp(1.5rem, 3vw, 2.5rem)",
                    color: fg,
                    lineHeight: 1.45,
                    minWidth: 0,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {item.name}
                </span>

                {columns.map((col) => (
                  <span
                    key={col}
                    style={{ ...metaStyle, width: "9rem", textAlign: "right" }}
                  >
                    {String(item[col] ?? "")}
                  </span>
                ))}
              </a>
            </li>
          );
        })}
        <li style={{ borderTop: `1px solid ${line}` }} />
      </ol>
    </div>
  );
}
