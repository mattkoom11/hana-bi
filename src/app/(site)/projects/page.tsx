"use client";

import { PageShell } from "@/components/layout/PageShell";
import { ProjectFilters } from "@/components/projects/ProjectFilters";
import { ProjectGrid } from "@/components/projects/ProjectGrid";
import {
  getProjectsByStatus,
  projects,
  type ProjectStatus,
} from "@/data/projects";
import { useState } from "react";

const FILTER_THRESHOLD = 8;

/**
 * Projects page - displays personal sewing projects
 *
 * Projects are separate from shop products and are for documentation purposes only.
 * They can be filtered by status (in progress, completed, on hold, planning).
 */
export default function ProjectsPage() {
  const [selectedStatus, setSelectedStatus] = useState<ProjectStatus | "all">(
    "all"
  );

  const filteredProjects =
    selectedStatus === "all"
      ? projects
      : getProjectsByStatus(selectedStatus);

  return (
    <main className="page-transition">
      <PageShell
        eyebrow="Projects"
        title="Work in progress."
        intro={
          <>
            Personal builds, experiments, and pre-retail development — garments
            that haven&rsquo;t reached the shop yet. Documented here for reference
            and study.
          </>
        }
      >
        {/* A handful of projects is read, not filtered. */}
        {projects.length > FILTER_THRESHOLD && (
          <ProjectFilters
            selectedStatus={selectedStatus}
            onStatusChange={setSelectedStatus}
            statuses={Array.from(new Set(projects.map((p) => p.status)))}
          />
        )}
        <div className="mt-8">
          <ProjectGrid projects={filteredProjects} />
        </div>
      </PageShell>
    </main>
  );
}
