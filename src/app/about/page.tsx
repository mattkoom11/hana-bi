import { InkUnderline } from "@/components/common/InkUnderline";
import { PageShell } from "@/components/layout/PageShell";

const CHAPTERS = [
  {
    title: "Origin",
    copy:
      "Hana-Bi began inside a Kyoto bookstore collecting Japanese fashion magazines from the '80s and '90s. Each lookbook spread influenced how we present garments: generous margins, serif headlines, and hand-drawn arrows.",
  },
  {
    title: "Process",
    copy:
      "We draft silhouettes in pencil, then digitize the sketches while preserving smudges. Fabrics are sourced from regenerative mills and all trims are catalogued for future reference.",
  },
  {
    title: "Future Drops",
    copy:
      "Expect limited runways documented like museum catalogues. Upcoming capsules blend denim tailoring with archival leather findings.",
  },
];

export default function AboutPage() {
  return (
    <main>
      <PageShell
        eyebrow="About"
        title="The Hana-Bi study."
        intro="A sustainable denim house with an editorial mindset. Use this page to tell the brand story, update process notes, and add future chapters."
      >
        <div className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr]">
          <article className="space-y-6">
            <InkUnderline />
            <p className="text-base leading-relaxed text-[var(--hb-smoke)]">
              Every garment is treated like an artifact. We shoot them on matte
              backgrounds, annotate with gothic typography, and log them into a
              living archive. Sustainability is not a tagline; it&rsquo;s recorded in
              our care notes and fabric provenance.
            </p>
            <div className="grid gap-6 md:grid-cols-2">
              <div className="border border-[var(--hb-border)] p-4">
                <p className="uppercase text-xs tracking-[0.35em] text-[var(--hb-smoke)]">
                  Studios
                </p>
                <p className="font-serif text-2xl mt-2">
                  Osaka / Brooklyn / Digital
                </p>
              </div>
              <div className="border border-[var(--hb-border)] p-4">
                <p className="uppercase text-xs tracking-[0.35em] text-[var(--hb-smoke)]">
                  Techniques
                </p>
                <p className="font-serif text-2xl mt-2">Sashiko · Indigo · Photo copy</p>
              </div>
            </div>
          </article>
          <section className="space-y-6 border border-[var(--hb-border)] p-6">
            {CHAPTERS.map((chapter) => (
              <div key={chapter.title} className="space-y-2">
                <p className="uppercase text-xs tracking-[0.35em] text-[var(--hb-smoke)]">
                  {chapter.title}
                </p>
                <p className="font-serif text-2xl">{chapter.title}</p>
                <p className="text-sm text-[var(--hb-smoke)]">{chapter.copy}</p>
              </div>
            ))}
          </section>
        </div>
      </PageShell>
    </main>
  );
}

