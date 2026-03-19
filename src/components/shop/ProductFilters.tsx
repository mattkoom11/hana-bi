"use client";

interface ProductFiltersProps {
  tags: string[];
  sizes: string[];
  selectedTag: string | null;
  selectedSize: string | null;
  availability: "available" | "archived";
  onTagChange: (tag: string | null) => void;
  onSizeChange: (size: string | null) => void;
  onAvailabilityChange: (availability: "available" | "archived") => void;
  variant?: "dark" | "light";
}

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

  return (
    <div
      className={`flex flex-col gap-4 border p-4 md:flex-row md:items-center md:justify-between ${
        isDark
          ? "border-[var(--hb-dark-border)] bg-[var(--hb-dark-surface)]"
          : "border-[var(--hb-border)]"
      }`}
    >
      <div className="flex flex-wrap gap-2 items-center text-xs uppercase tracking-[0.3em]">
        <button
          onClick={() => onAvailabilityChange("available")}
          className={`px-3 py-1 border transition-colors ${
            availability === "available"
              ? isDark
                ? "border-[var(--hb-sienna)] text-[var(--hb-sienna)]"
                : "border-[var(--hb-ink)] text-[var(--hb-ink)]"
              : isDark
              ? "border-transparent text-[var(--hb-dark-muted)]"
              : "border-transparent text-[var(--hb-smoke)]"
          }`}
        >
          Available
        </button>
        <button
          onClick={() => onAvailabilityChange("archived")}
          className={`px-3 py-1 border transition-colors ${
            availability === "archived"
              ? isDark
                ? "border-[var(--hb-sienna)] text-[var(--hb-sienna)]"
                : "border-[var(--hb-ink)] text-[var(--hb-ink)]"
              : isDark
              ? "border-transparent text-[var(--hb-dark-muted)]"
              : "border-transparent text-[var(--hb-smoke)]"
          }`}
        >
          Archived
        </button>
      </div>
      <div className="flex flex-wrap gap-3 text-sm">
        <label className="flex items-center gap-2">
          <span
            className={`uppercase text-[0.6rem] tracking-[0.3em] ${
              isDark ? "text-[var(--hb-dark-muted)]" : "text-[var(--hb-smoke)]"
            }`}
          >
            Category
          </span>
          <select
            value={selectedTag ?? ""}
            onChange={(event) => onTagChange(event.target.value || null)}
            className={`bg-transparent border px-3 py-1 text-xs uppercase tracking-[0.3em] ${
              isDark
                ? "border-[var(--hb-dark-border)] text-[#faf8f4]"
                : "border-[var(--hb-border)]"
            }`}
          >
            <option value="">All</option>
            {tags.map((tag) => (
              <option key={tag} value={tag}>
                {tag}
              </option>
            ))}
          </select>
        </label>
        <label className="flex items-center gap-2">
          <span
            className={`uppercase text-[0.6rem] tracking-[0.3em] ${
              isDark ? "text-[var(--hb-dark-muted)]" : "text-[var(--hb-smoke)]"
            }`}
          >
            Size
          </span>
          <select
            value={selectedSize ?? ""}
            onChange={(event) => onSizeChange(event.target.value || null)}
            className={`bg-transparent border px-3 py-1 text-xs uppercase tracking-[0.3em] ${
              isDark
                ? "border-[var(--hb-dark-border)] text-[#faf8f4]"
                : "border-[var(--hb-border)]"
            }`}
          >
            <option value="">All</option>
            {sizes.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </label>
      </div>
    </div>
  );
}
