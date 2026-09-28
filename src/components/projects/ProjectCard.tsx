"use client";

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

export function ProjectCard({ project }: ProjectCardProps) {
  const statusLabel = STATUS_LABELS[project.status];

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
      </div>
      <div className="space-y-3 relative z-10">
        <p className="font-display italic font-light text-xl leading-tight">{project.name}</p>
        <p
          className="uppercase text-[var(--hb-smoke)]"
          style={{ fontFamily: "var(--hb-font-mono)", fontSize: "0.65rem", letterSpacing: "var(--hb-track-meta)" }}
        >
          {project.year} · {statusLabel}
        </p>
      </div>
    </Link>
  );
}
