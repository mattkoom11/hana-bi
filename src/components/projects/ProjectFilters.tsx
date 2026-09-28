"use client";

import type { ProjectStatus } from "@/data/projects";

const STATUS_OPTIONS: Array<{ value: ProjectStatus | "all"; label: string }> = [
  { value: "all", label: "All" },
  { value: "in_progress", label: "In Progress" },
  { value: "completed", label: "Completed" },
  { value: "on_hold", label: "On Hold" },
  { value: "planning", label: "Planning" },
];

interface ProjectFiltersProps {
  selectedStatus: ProjectStatus | "all";
  onStatusChange: (status: ProjectStatus | "all") => void;
  /** Statuses that actually occur — an option that leads to an empty grid isn't offered. */
  statuses?: ProjectStatus[];
}

// Bare type on a hairline, same as the shop filters: the selected option is
// marked by colour and a rule under it, never a box around every option.
export function ProjectFilters({ selectedStatus, onStatusChange, statuses }: ProjectFiltersProps) {
  const options = STATUS_OPTIONS.filter(
    (o) => o.value === "all" || !statuses || statuses.includes(o.value)
  );

  return (
    <div className="flex flex-wrap gap-x-6 border-b border-[var(--hb-border)]">
      {options.map((option) => {
        const isSelected = selectedStatus === option.value;
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onStatusChange(option.value)}
            aria-pressed={isSelected}
            className={`min-h-[44px] px-1 uppercase transition-colors duration-300 ${
              isSelected ? "text-[var(--hb-ink)]" : "text-[var(--hb-smoke)] hover:text-[var(--hb-ink)]"
            }`}
            style={{
              fontFamily: "var(--hb-font-mono)",
              fontSize: "0.7rem",
              letterSpacing: "var(--hb-track-meta)",
              boxShadow: isSelected ? "inset 0 -1px 0 var(--hb-ink)" : "none",
            }}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
