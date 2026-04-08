import type { Metadata } from "next";
import { InkUnderline } from "@/components/common/InkUnderline";
import { PageShell } from "@/components/layout/PageShell";
import { ChapterCards } from "@/components/about/ChapterCards";

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

export default function AboutPage() {
  return (
    <main className="page-transition">
      <PageShell
        eyebrow="About"
        title="The Hana-Bi study."
        intro="A sustainable atelier with a focus on denim construction and design."
      >
        <div className="grid gap-20 lg:grid-cols-[1.1fr_0.9fr]">
          <article className="space-y-10">
            <InkUnderline width={160} variant="wispy" strokeOpacity={0.4} />
            <p className="text-lg leading-relaxed text-[var(--hb-smoke)] opacity-85 max-w-lg">
              With a focus on sustainability and domestic production, Hana-Bi puts its efforts towards conserving the art of Japanese denim construction.
            </p>
          </article>
          <ChapterCards />
        </div>
      </PageShell>
    </main>
  );
}

