import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { InkUnderline } from "@/components/common/InkUnderline";
import { PageShell } from "@/components/layout/PageShell";
import { ProjectCard } from "@/components/projects/ProjectCard";
import { ProjectGallery } from "@/components/projects/ProjectGallery";
import { getProjectBySlug, projects, type Project } from "@/data/projects";

interface ProjectPageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return projects.map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({ params }: ProjectPageProps): Promise<Metadata> {
  const { slug } = await params;
  const project = getProjectBySlug(slug);

  if (!project) return { title: "Project not found — Hana-Bi" };

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

function getRelatedProjects(currentSlug: string, project: Project): Project[] {
  return projects
    .filter((p) => p.slug !== currentSlug && (p.status === project.status || p.year === project.year))
    .slice(0, 3);
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { slug } = await params;
  const project = getProjectBySlug(slug);

  if (!project) notFound();

  const related = getRelatedProjects(project.slug, project);

  return (
    <main className="page-transition">
      <PageShell eyebrow="Projects" title={project.name} intro={project.description}>
        <Link
          href="/projects"
          style={{
            display: "inline-block",
            background: "none",
            border: "none",
            borderBottom: "1px dashed var(--hb-border)",
            padding: "0 0 0.25rem",
            fontFamily: "var(--hb-font-mono)",
            fontSize: "0.75rem",
            textTransform: "uppercase",
            letterSpacing: "var(--hb-track-meta)",
            color: "var(--hb-smoke)",
            marginBottom: "2.5rem",
          }}
        >
          ← All projects
        </Link>

        <div
          style={{
            display: "grid",
            gap: "3rem",
            gridTemplateColumns: "1.1fr 0.9fr",
            alignItems: "start",
            marginTop: "2.5rem",
          }}
        >
          <ProjectGallery project={project} />

          <div>
            <p
              style={{
                textTransform: "uppercase",
                fontSize: "0.65rem",
                letterSpacing: "var(--hb-track-nav)",
                fontFamily: "var(--hb-font-mono)",
                color: "var(--hb-smoke)",
                opacity: 0.7,
                margin: 0,
              }}
            >
              Fabric
            </p>
            <p style={{ fontSize: "0.9375rem", lineHeight: 1.7, color: "var(--hb-smoke)", margin: "0.75rem 0 2rem" }}>
              {project.fabric}
            </p>
            <InkUnderline width={140} variant="wispy" strokeOpacity={0.4} />
            <p style={{ fontSize: "1rem", lineHeight: 1.8, color: "var(--hb-smoke)", opacity: 0.9, margin: "1.5rem 0 0" }}>
              {project.story}
            </p>
          </div>
        </div>
      </PageShell>

      {related.length > 0 && (
        <PageShell
          eyebrow="Related Projects"
          title="You might also like"
          intro="Other projects with similar techniques or status."
        >
          <div
            style={{
              display: "grid",
              gap: "var(--hb-grid-gap-airy)",
              gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 20rem), 1fr))",
            }}
          >
            {related.map((p) => (
              <ProjectCard key={p.id} project={p} />
            ))}
          </div>
        </PageShell>
      )}
    </main>
  );
}
