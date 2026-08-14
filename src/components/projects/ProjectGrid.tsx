import { ProjectCard } from "./ProjectCard";
import type { Project } from "@/data/projects";

interface ProjectGridProps {
  projects: Project[];
}

export function ProjectGrid({ projects }: ProjectGridProps) {
  if (projects.length === 0) {
    return (
      <p style={{ color: "var(--hb-smoke)", opacity: 0.8, padding: "3rem 0" }}>
        No projects to display.
      </p>
    );
  }

  return (
    <div
      style={{
        display: "grid",
        gap: "var(--hb-grid-gap-airy)",
        gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 20rem), 1fr))",
      }}
    >
      {projects.map((project) => (
        <ProjectCard key={project.id} project={project} />
      ))}
    </div>
  );
}
