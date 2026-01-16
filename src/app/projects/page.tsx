"use client";

import { PageShell } from "@/components/layout/PageShell";
import { ProjectFilters } from "@/components/projects/ProjectFilters";
import { ProjectGrid } from "@/components/projects/ProjectGrid";
import {
  getActiveProjects,
  getCompletedProjects,
  getProjectsByStatus,
  projects,
  type ProjectStatus,
} from "@/data/projects";
import { useState } from "react";

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
        title="Personal sewing documentation."
        intro={
          <>
            Personal projects and experiments in garment construction, pattern
            drafting, and textile techniques. These pieces are documented for
            study and reference, not for sale.
          </>
        }
      >
        <ProjectFilters
          selectedStatus={selectedStatus}
          onStatusChange={setSelectedStatus}
        />
        <div className="mt-8">
          <ProjectGrid projects={filteredProjects} />
        </div>
      </PageShell>
    </main>
  );
}
