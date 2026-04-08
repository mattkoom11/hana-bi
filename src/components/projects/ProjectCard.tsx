"use client";

import { Badge } from "@/components/common/Badge";
import { MarginNote } from "@/components/common/MarginNote";
import type { Project } from "@/data/projects";
import Image from "next/image";
import Link from "next/link";

interface ProjectCardProps {
  project: Project;
}

const STATUS_LABELS: Record<Project["status"], string> = {
  completed: "Completed",
  in_progress: "In Progress",
  on_hold: "On Hold",
  planning: "Planning",
};

const STATUS_TONES: Record<Project["status"], "sienna" | "smoke" | "ink"> = {
  completed: "sienna",
  in_progress: "ink",
  on_hold: "smoke",
  planning: "smoke",
};

export function ProjectCard({ project }: ProjectCardProps) {
  const statusLabel = STATUS_LABELS[project.status];
  const statusTone = STATUS_TONES[project.status];

  // Generate a simple annotation from status or first technique
  const annotation =
    project.status === "completed"
      ? "✓ done"
      : project.status === "in_progress"
        ? "in progress"
        : project.status === "on_hold"
          ? "paused"
          : "drafting";

  return (
    <Link
      href={`/projects/${project.slug}`}
      className="group block space-y-4 hover-wispy transition-all duration-500"
    >
      <div className="relative aspect-[3/4] overflow-hidden bg-[var(--hb-tag)]">
        <Image
          src={project.heroImage}
          alt={project.name}
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          className="object-cover transition duration-700 group-hover:scale-[1.02]"
          unoptimized
        />
        <div className="absolute top-5 right-5 z-10">
          <Badge tone={statusTone}>{statusLabel}</Badge>
        </div>

        {/* Hover-revealed pencil annotation */}
        <div className="absolute bottom-4 left-4 opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10">
          <MarginNote
            position="bottom-left"
            variant="script"
            size="xs"
            className="!opacity-80 !relative !top-0 !left-0 !transform-none"
          >
            {annotation}
          </MarginNote>
        </div>
      </div>
      <div className="space-y-3 relative z-10">
        <p className="font-serif text-xl leading-tight">{project.name}</p>
        <p className="text-sm text-[var(--hb-smoke)] font-script opacity-70">
          {project.year}
        </p>
      </div>
    </Link>
  );
}
