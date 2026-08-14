import type { Metadata } from "next";
import { InkUnderline } from "@/components/common/InkUnderline";
import { PageShell } from "@/components/layout/PageShell";

export const metadata: Metadata = {
  title: "About — Hana-Bi",
  description:
    "Hana-Bi is a sustainable denim house with an editorial mindset. Each garment is treated like an artifact.",
  openGraph: {
    title: "About — Hana-Bi",
    description:
      "Hana-Bi is a sustainable denim house with an editorial mindset. Each garment is treated like an artifact.",
  },
};

const ABOUT_PARAGRAPHS = [
  "Hana-Bi began in the small basement of a Northern Virginia home. There was no drafting table and no fancy sewing machine, but there was a hive of ideas. Each project starts with a hand-made pattern which outlines the DNA of the garment. Ranging from extravagant designs to humble blueprints, there is no end to what Hana-Bi is willing to create.",
  "Hana-Bi only sources fabric from the best international mills and keeps a focus on domestic manufacturing. Hana-Bi's concept of sustainability sprouted from Professor Marcy Linton's class on sustainable fashion, taught at the University of Virginia. Manufacturing is taken north to New York, where the Garment District hosts a web of dreams.",
  "Hana-Bi wants to capture the innovative spirit of New York while also maintaining the wearability of timeless fashion. When it comes to future projects, Hana-Bi hopes to adopt what breaks down the limits of human creativity, and to always pioneer in the fields of elegance and beauty.",
];

const CHAPTERS = [
  {
    title: "Origin",
    copy: "Hana-Bi began in the small basement of a Northern Virginia home. There was no drafting table and no fancy sewing machine, but there was a hive of ideas.",
  },
  {
    title: "Process",
    copy: "We draft silhouettes in pencil, then digitize the sketches while preserving smudges. Fabrics are sourced from regenerative mills and all trims are catalogued for future reference.",
  },
  {
    title: "Future Drops",
    copy: "Expect limited runways documented like museum catalogues. Upcoming capsules blend denim tailoring with archival leather findings.",
  },
];

export default function AboutPage() {
  return (
    <main className="page-transition">
      <PageShell
        eyebrow="About"
        title="The Hana-Bi study."
        intro="A sustainable atelier with a focus on denim construction and design."
      >
        <div
          style={{
            display: "grid",
            gap: "4rem",
            gridTemplateColumns: "1.2fr 0.8fr",
            alignItems: "start",
          }}
        >
          <article style={{ maxWidth: "var(--hb-max-width-prose)" }}>
            <InkUnderline width={160} variant="wispy" strokeOpacity={0.4} />
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "1.5rem",
                marginTop: "2.5rem",
                fontSize: "var(--hb-body-lg)",
                lineHeight: 1.8,
                color: "var(--hb-smoke)",
                opacity: 0.85,
              }}
            >
              {ABOUT_PARAGRAPHS.map((p, i) => (
                <p key={i} style={{ margin: 0 }}>
                  {p}
                </p>
              ))}
            </div>
          </article>

          <section style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            {CHAPTERS.map((chapter, i) => (
              <div
                key={chapter.title}
                style={{
                  borderTop: "1px solid var(--hb-border)",
                  paddingTop: "1.25rem",
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.75rem",
                }}
              >
                <p
                  style={{
                    fontFamily: "var(--hb-font-mono)",
                    fontSize: "0.7rem",
                    textTransform: "uppercase",
                    letterSpacing: "var(--hb-track-catalog)",
                    color: "var(--hb-sienna)",
                    margin: 0,
                  }}
                >
                  {"0" + (i + 1)}
                </p>
                <h3
                  style={{
                    fontFamily: "var(--hb-font-display)",
                    fontStyle: "italic",
                    fontWeight: 300,
                    fontSize: "1.75rem",
                    lineHeight: 1.1,
                    margin: 0,
                    color: "var(--hb-ink)",
                  }}
                >
                  {chapter.title}
                </h3>
                <p
                  style={{
                    fontSize: "0.9375rem",
                    color: "var(--hb-smoke)",
                    opacity: 0.85,
                    lineHeight: 1.7,
                    margin: 0,
                  }}
                >
                  {chapter.copy}
                </p>
              </div>
            ))}
          </section>
        </div>
      </PageShell>
    </main>
  );
}
