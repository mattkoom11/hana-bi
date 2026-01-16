import { ProjectCard } from "./ProjectCard";
import type { Project } from "@/data/projects";

interface ProjectGridProps {
  projects: Project[];
}

export function ProjectGrid({ projects }: ProjectGridProps) {
  if (projects.length === 0) {
    return (
      <p className="text-center text-[var(--hb-smoke)] opacity-80 py-12">
        No projects to display.
      </p>
    );
  }

  return (
    <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
      {projects.map((project) => (
        <ProjectCard key={project.id} project={project} />
      ))}
    </div>
  );
}
