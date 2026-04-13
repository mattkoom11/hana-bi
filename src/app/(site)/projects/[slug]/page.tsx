import { InkUnderline } from "@/components/common/InkUnderline";
import { PaperBackground } from "@/components/common/PaperBackground";
import { SketchFrame } from "@/components/common/SketchFrame";
import { PageShell } from "@/components/layout/PageShell";
import { ProjectCard } from "@/components/projects/ProjectCard";
import { ProjectGallery } from "@/components/projects/ProjectGallery";
import {
  getProjectBySlug,
  projects,
  type Project,
  type ProjectStatus,
} from "@/data/projects";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

interface ProjectPageProps {
  params: Promise<{ slug: string }>;
}

const STATUS_LABELS: Record<ProjectStatus, string> = {
  completed: "Completed",
  in_progress: "In Progress",
  on_hold: "On Hold",
  planning: "Planning",
};

const STATUS_TONES: Record<ProjectStatus, "sienna" | "smoke" | "ink"> = {
  completed: "sienna",
  in_progress: "ink",
  on_hold: "smoke",
  planning: "smoke",
};

/**
 * Generate static params for project pages
 */
export function generateStaticParams() {
  return projects.map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({
  params,
}: ProjectPageProps): Promise<Metadata> {
  const { slug } = await params;
  const project = getProjectBySlug(slug);

  if (!project) {
    return {
      title: "Project not found — Hana-Bi",
    };
  }

  return {
    title: `${project.name} — Hana-Bi Projects`,
    description: project.description,
    openGraph: {
      title: `${project.name} — Hana-Bi Projects`,
      description: project.description,
      images: [project.heroImage],
    },
  };
}

/**
 * Get related projects (same status or same year)
 */
function getRelatedProjects(currentSlug: string, project: Project): Project[] {
  return projects
    .filter(
      (p) =>
        p.slug !== currentSlug &&
        (p.status === project.status || p.year === project.year)
    )
    .slice(0, 3);
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { slug } = await params;
  const project = getProjectBySlug(slug);

  if (!project) {
    notFound();
  }

  const related = getRelatedProjects(project.slug, project);
  const statusLabel = STATUS_LABELS[project.status];

  return (
    <main className="page-transition">
      {/* Editorial hero section with large image */}
      <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden mb-20">
        <PaperBackground intensity="subtle" texture="both" className="absolute inset-0" />

        <div className="relative z-10 w-full px-4 sm:px-8 md:px-12 lg:px-20 py-16">
          <div className="max-w-7xl mx-auto">
            <div className="grid gap-12 lg:grid-cols-[1.3fr_0.7fr] items-start">
              {/* Gallery with lightbox */}
              <ProjectGallery project={project} />

              {/* Project details panel */}
              <div className="sticky top-24">
                <SketchFrame tilt="none" strokeOpacity={0.25} className="w-full">
                  <PaperBackground intensity="subtle" texture="grain">
                    <div className="space-y-6">
                      <div className="space-y-4">
                        <p className="uppercase text-xs tracking-[0.4em] text-[var(--hb-smoke)] font-script opacity-70">
                          Project Details
                        </p>
                        <h1 className="font-serif text-4xl lg:text-5xl leading-tight">
                          {project.name}
                        </h1>
                        <InkUnderline
                          width={180}
                          variant="wispy"
                          strokeOpacity={0.35}
                          className="mt-2"
                        />
                      </div>

                      <div className="space-y-4 pt-2">
                        <div>
                          <p className="text-sm uppercase tracking-[0.3em] text-[var(--hb-smoke)] opacity-70 mb-2">
                            Status
                          </p>
                          <p className="font-serif text-lg">{statusLabel}</p>
                        </div>

                        <div>
                          <p className="text-sm uppercase tracking-[0.3em] text-[var(--hb-smoke)] opacity-70 mb-2">
                            Story
                          </p>
                          <p className="text-sm leading-relaxed text-[var(--hb-smoke)] opacity-80">
                            {project.story}
                          </p>
                        </div>

                        {project.fabric && (
                          <div>
                            <p className="text-sm uppercase tracking-[0.3em] text-[var(--hb-smoke)] opacity-70 mb-2">
                              Fabric
                            </p>
                            <p className="text-sm leading-relaxed text-[var(--hb-smoke)] opacity-80">
                              {project.fabric}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </PaperBackground>
                </SketchFrame>
              </div>
            </div>
          </div>
        </div>
      </section>

      {related.length > 0 && (
        <PageShell
          eyebrow="Related Projects"
          title="You might also like"
          intro="Other projects with similar techniques or status."
          className="pt-0"
        >
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {related.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        </PageShell>
      )}
    </main>
  );
}
