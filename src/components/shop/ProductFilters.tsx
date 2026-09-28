"use client";

/**
 * ProductFilters — visible mono chips, every option on screen. No <select>
 * dropdowns anywhere in this system. See design/components/product-grid.md.
 */

interface ProductFiltersProps {
  tags: string[];
  sizes: string[];
  selectedTag: string | null;
  selectedSize: string | null;
  availability: "available" | "archived" | "all";
  onTagChange: (tag: string | null) => void;
  onSizeChange: (size: string | null) => void;
  onAvailabilityChange: (availability: "available" | "archived" | "all") => void;
  variant?: "dark" | "light";
}

const AVAILABILITY_OPTIONS: Array<{ value: "available" | "archived" | "all"; label: string }> = [
  { value: "available", label: "Available" },
  { value: "archived", label: "Archived" },
  { value: "all", label: "All" },
];

export function ProductFilters({
  tags,
  sizes,
  selectedTag,
  selectedSize,
  availability,
  onTagChange,
  onSizeChange,
  onAvailabilityChange,
  variant = "dark",
}: ProductFiltersProps) {
  const isDark = variant === "dark";
  const dim = isDark ? "var(--hb-dark-muted)" : "var(--hb-smoke)";
  const line = isDark ? "var(--hb-dark-border)" : "var(--hb-border)";
  const on = isDark ? "var(--hb-on-dark)" : "var(--hb-ink)";

  // Bare type: the selected option is marked by colour and a hairline under
  // it, not a box around every option.
  const chipStyle = (selected: boolean): React.CSSProperties => ({
    fontFamily: "var(--hb-font-mono)",
    fontSize: "0.7rem",
    textTransform: "uppercase",
    letterSpacing: "var(--hb-track-meta)",
    minHeight: "44px",
    padding: "0 0.25rem",
    background: "transparent",
    borderRadius: 0,
    border: "none",
    boxShadow: selected ? `inset 0 -1px 0 ${on}` : `inset 0 -1px 0 transparent`,
    color: selected ? on : dim,
    transition: "box-shadow 300ms var(--hb-ease-expo-out), color 300ms var(--hb-ease-expo-out)",
    cursor: "pointer",
  });

  const ruleLabelStyle: React.CSSProperties = {
    fontFamily: "var(--hb-font-mono)",
    fontSize: "0.6rem",
    textTransform: "uppercase",
    letterSpacing: "var(--hb-track-catalog)",
    color: dim,
    opacity: 0.7,
    alignSelf: "center",
    paddingRight: "0.25rem",
  };

  const rowStyle: React.CSSProperties = {
    display: "flex",
    flexWrap: "wrap",
    columnGap: "1.5rem",
    borderBottom: `1px solid ${line}`,
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
      <div style={rowStyle}>
        {AVAILABILITY_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => onAvailabilityChange(opt.value)}
            style={chipStyle(availability === opt.value)}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {tags.length > 0 && (
        <div style={rowStyle}>
          <span style={ruleLabelStyle}>Category</span>
          {tags.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => onTagChange(selectedTag === tag ? null : tag)}
              style={chipStyle(selectedTag === tag)}
            >
              {tag}
            </button>
          ))}
        </div>
      )}

      {sizes.length > 0 && (
        <div style={rowStyle}>
          <span style={ruleLabelStyle}>Size</span>
          {sizes.map((size) => (
            <button
              key={size}
              type="button"
              onClick={() => onSizeChange(selectedSize === size ? null : size)}
              style={chipStyle(selectedSize === size)}
            >
              {size}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
