import type { Metadata } from "next";
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

// Facts, not adjectives — one line each. See the Copy rules in CLAUDE.md.
const RECORD = [
  {
    title: "Origin",
    copy: "Started in a basement in Northern Virginia — no drafting table, no industrial machine.",
  },
  {
    title: "Pattern",
    copy: "Every garment begins as a hand-drafted paper pattern.",
  },
  {
    title: "Fabric",
    copy: "Sourced from international mills. The focus on sustainability began in Professor Marcy Linton’s sustainable fashion class at the University of Virginia.",
  },
  {
    title: "Making",
    copy: "Cut and sewn in New York’s Garment District, to order and in small runs. Nothing is produced speculatively.",
  },
];

export default function AboutPage() {
  return (
    <main className="page-transition">
      <PageShell
        eyebrow="About"
        title="The Hana-Bi study."
        intro="A denim atelier. Patterns drafted by hand, garments made to order in New York."
      >
        <ol style={{ listStyle: "none", margin: 0, padding: 0, maxWidth: "48rem" }}>
          {RECORD.map((row, i) => (
            <li
              key={row.title}
              style={{
                borderTop: "1px solid var(--hb-border)",
                padding: "1.75rem 0",
                display: "grid",
                gridTemplateColumns: "3rem minmax(0, 1fr)",
                columnGap: "1rem",
                rowGap: "0.5rem",
              }}
            >
              <span
                style={{
                  fontFamily: "var(--hb-font-mono)",
                  fontSize: "0.65rem",
                  letterSpacing: "var(--hb-track-catalog)",
                  color: "var(--hb-sienna)",
                  paddingTop: "0.6rem",
                }}
              >
                {String(i + 1).padStart(2, "0")}
              </span>
              <div>
                <h2
                  style={{
                    fontFamily: "var(--hb-font-display)",
                    fontStyle: "italic",
                    fontWeight: 300,
                    fontSize: "1.75rem",
                    lineHeight: 1.15,
                    margin: "0 0 0.5rem",
                    color: "var(--hb-ink)",
                  }}
                >
                  {row.title}
                </h2>
                <p style={{ margin: 0, fontSize: "1rem", lineHeight: 1.7, color: "var(--hb-smoke)" }}>
                  {row.copy}
                </p>
              </div>
            </li>
          ))}
          <li aria-hidden="true" style={{ borderTop: "1px solid var(--hb-border)" }} />
        </ol>
      </PageShell>
    </main>
  );
}
