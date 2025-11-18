import { InkUnderline } from "@/components/common/InkUnderline";
import { SketchFrame } from "@/components/common/SketchFrame";
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
        <div className="grid gap-16 lg:grid-cols-[1.1fr_0.9fr]">
          <article className="space-y-8">
            <InkUnderline width={140} variant="wispy" strokeOpacity={0.4} />
            <p className="text-base leading-relaxed text-[var(--hb-smoke)] opacity-80 max-w-lg">
              Every garment is treated like an artifact. We shoot them on matte
              backgrounds, annotate with gothic typography, and log them into a
              living archive. Sustainability is not a tagline; it&rsquo;s recorded in
              our care notes and fabric provenance.
            </p>
            <div className="grid gap-6 md:grid-cols-2">
              <SketchFrame tilt="left" strokeOpacity={0.25} className="p-5">
                <div className="space-y-3">
                  <p className="uppercase text-xs tracking-[0.35em] text-[var(--hb-smoke)] font-script opacity-70">
                    Studios
                  </p>
                  <p className="font-serif text-2xl leading-tight">
                    Osaka / Brooklyn / Digital
                  </p>
                </div>
              </SketchFrame>
              <SketchFrame tilt="right" strokeOpacity={0.25} className="p-5">
                <div className="space-y-3">
                  <p className="uppercase text-xs tracking-[0.35em] text-[var(--hb-smoke)] font-script opacity-70">
                    Techniques
                  </p>
                  <p className="font-serif text-2xl leading-tight">Sashiko · Indigo · Photo copy</p>
                </div>
              </SketchFrame>
            </div>
          </article>
          <section className="space-y-8">
            {CHAPTERS.map((chapter, index) => (
              <SketchFrame key={chapter.title} tilt={index % 2 === 0 ? "left" : "right"} strokeOpacity={0.3} className="p-6">
                <div className="space-y-4">
                  <p className="uppercase text-xs tracking-[0.35em] text-[var(--hb-smoke)] font-script opacity-70">
                    {chapter.title}
                  </p>
                  <p className="font-serif text-2xl leading-tight">{chapter.title}</p>
                  <InkUnderline width={80} variant="delicate" strokeOpacity={0.3} />
                  <p className="text-sm text-[var(--hb-smoke)] opacity-80 leading-relaxed">{chapter.copy}</p>
                </div>
              </SketchFrame>
            ))}
          </section>
        </div>
      </PageShell>
    </main>
  );
}

