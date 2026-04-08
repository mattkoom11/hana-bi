"use client";

import { InkUnderline } from "@/components/common/InkUnderline";
import { TiltCard } from "@/components/common/TiltCard";

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

export function ChapterCards() {
  return (
    <section className="space-y-6">
      {CHAPTERS.map((chapter) => (
        <TiltCard key={chapter.title} intensity={10}>
          <div className="border border-dashed border-[var(--hb-border)] p-6 space-y-5 bg-[var(--hb-paper-muted)]" style={{ borderWidth: "1px" }}>
            <p className="uppercase text-xs tracking-[0.35em] text-[var(--hb-smoke)] font-script opacity-70">
              {chapter.title}
            </p>
            <p className="font-serif text-2xl leading-tight">{chapter.title}</p>
            <InkUnderline width={90} variant="delicate" strokeOpacity={0.3} />
            <p className="text-sm text-[var(--hb-smoke)] opacity-80 leading-relaxed">{chapter.copy}</p>
          </div>
        </TiltCard>
      ))}
    </section>
  );
}
