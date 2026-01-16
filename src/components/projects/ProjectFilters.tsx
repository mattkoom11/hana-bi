"use client";

import type { ProjectStatus } from "@/data/projects";
import { useState } from "react";

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
}

export function ProjectFilters({
  selectedStatus,
  onStatusChange,
}: ProjectFiltersProps) {
  return (
    <div className="flex flex-wrap gap-3 pb-6 border-b border-[var(--hb-border)] border-dashed" style={{ borderWidth: "1px" }}>
      {STATUS_OPTIONS.map((option) => {
        const isSelected = selectedStatus === option.value;
        return (
          <button
            key={option.value}
            onClick={() => onStatusChange(option.value)}
            className={`text-xs uppercase tracking-[0.3em] px-4 py-2 border transition-all duration-300 ${
              isSelected
                ? "border-[var(--hb-ink)] text-[var(--hb-ink)] bg-[var(--hb-paper)]"
                : "border-[var(--hb-border)] text-[var(--hb-smoke)] opacity-70 hover:opacity-100 hover-wispy"
            }`}
            style={{ borderStyle: "dashed", borderWidth: "1px" }}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
