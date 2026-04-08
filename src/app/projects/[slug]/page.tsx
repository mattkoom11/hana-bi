import { Badge } from "@/components/common/Badge";
import { InkUnderline } from "@/components/common/InkUnderline";
import { MarginNote } from "@/components/common/MarginNote";
import { PaperBackground } from "@/components/common/PaperBackground";
import { SketchFrame } from "@/components/common/SketchFrame";
import { Tag } from "@/components/common/Tag";
import { PageShell } from "@/components/layout/PageShell";
import { ProjectCard } from "@/components/projects/ProjectCard";
import {
  getProjectBySlug,
  projects,
  type Project,
  type ProjectStatus,
} from "@/data/projects";
import type { Metadata } from "next";
import Image from "next/image";
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
  const statusTone = STATUS_TONES[project.status];

  return (
    <main className="page-transition">
      {/* Editorial hero section with large image */}
      <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden mb-20">
        <PaperBackground intensity="subtle" texture="both" className="absolute inset-0" />

        <div className="relative z-10 w-full px-4 sm:px-8 md:px-12 lg:px-20 py-16">
          <div className="max-w-7xl mx-auto">
            <div className="grid gap-12 lg:grid-cols-[1.3fr_0.7fr] items-start">
              {/* Large editorial hero image */}
              <div className="relative space-y-6">
                <div className="relative w-full aspect-[3/4] overflow-hidden -rotate-[0.5deg]">
                  {/* Hand-drawn border overlay */}
                  <svg
                    className="absolute inset-0 w-full h-full pointer-events-none z-20"
                    viewBox="0 0 400 533"
                    preserveAspectRatio="none"
                    style={{ opacity: 0.25 }}
                  >
                    <defs>
                      <linearGradient
                        id="hero-frame-gradient"
                        x1="0%"
                        y1="0%"
                        x2="100%"
                        y2="100%"
                      >
                        <stop
                          offset="0%"
                          stopColor="var(--hb-ink)"
                          stopOpacity="0.4"
                        />
                        <stop
                          offset="50%"
                          stopColor="var(--hb-ink)"
                          stopOpacity="0.2"
                        />
                        <stop
                          offset="100%"
                          stopColor="var(--hb-ink)"
                          stopOpacity="0.35"
                        />
                      </linearGradient>
                    </defs>
                    <path
                      d="M 10,10 Q 14,8 18,10 Q 200,6 382,10 Q 386,8 390,10 Q 390,14 390,18 Q 394,266 390,515 Q 390,519 390,523 Q 386,525 382,523 Q 200,527 18,523 Q 14,525 10,523 Q 10,519 10,515 Q 6,266 10,18 Q 10,14 10,10 Z"
                      fill="none"
                      stroke="url(#hero-frame-gradient)"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      vectorEffect="non-scaling-stroke"
                    />
                  </svg>
                  <div className="relative w-full h-full">
                    <Image
                      src={project.heroImage}
                      alt={project.name}
                      fill
                      className="object-cover"
                      sizes="(max-width: 1024px) 100vw, 65vw"
                      priority
                    />
                    <div className="absolute top-6 left-6 z-10">
                      <Badge tone={statusTone}>{statusLabel}</Badge>
                    </div>

                    {/* Margin notes */}
                    {project.year && (
                      <MarginNote position="top-right" variant="script" size="xs">
                        {project.year}
                      </MarginNote>
                    )}
                  </div>
                </div>

                {/* Thumbnail grid with hand-drawn frames */}
                {project.images.length > 0 && (
                  <div className="grid grid-cols-3 gap-4">
                    {project.images.map((image, idx) => (
                      <div
                        key={image}
                        className="relative aspect-[4/5] overflow-hidden"
                        style={{
                          transform: `rotate(${idx % 2 === 0 ? "0.8deg" : "-0.8deg"})`,
                        }}
                      >
                        {/* Hand-drawn border */}
                        <svg
                          className="absolute inset-0 w-full h-full pointer-events-none z-10"
                          viewBox="0 0 200 250"
                          preserveAspectRatio="none"
                          style={{ opacity: 0.2 }}
                        >
                          <defs>
                            <linearGradient
                              id={`thumb-frame-${idx}`}
                              x1="0%"
                              y1="0%"
                              x2="100%"
                              y2="100%"
                            >
                              <stop
                                offset="0%"
                                stopColor="var(--hb-ink)"
                                stopOpacity="0.3"
                              />
                              <stop
                                offset="100%"
                                stopColor="var(--hb-ink)"
                                stopOpacity="0.2"
                              />
                            </linearGradient>
                          </defs>
                          <path
                            d="M 5,5 Q 7,4 9,5 Q 100,3 191,5 Q 193,4 195,5 Q 195,7 195,9 Q 197,125 195,241 Q 195,243 195,245 Q 193,246 191,245 Q 100,247 9,245 Q 7,246 5,245 Q 5,243 5,241 Q 3,125 5,9 Q 5,7 5,5 Z"
                            fill="none"
                            stroke={`url(#thumb-frame-${idx})`}
                            strokeWidth="1"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            vectorEffect="non-scaling-stroke"
                          />
                        </svg>
                        <Image
                          src={image}
                          alt={`${project.name} alternate view ${idx + 1}`}
                          fill
                          sizes="(max-width: 768px) 33vw, 200px"
                          className="object-cover relative z-0"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>

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
