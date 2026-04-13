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

export default function AboutPage() {
  return (
    <main className="page-transition">
      <PageShell
        eyebrow="About"
        title="The Hana-Bi study."
        intro="A sustainable atelier with a focus on denim construction and design."
      >
        <article className="space-y-10 max-w-xl">
          <InkUnderline width={160} variant="wispy" strokeOpacity={0.4} />
          <div className="space-y-6 text-lg leading-relaxed text-[var(--hb-smoke)] opacity-85">
            <p>
              Hana-Bi began in the small basement of a Northern Virginia home. There was no drafting table and no fancy sewing machine, but there was a hive of ideas. Each project starts with a hand-made pattern which outlines the DNA of the garment. Ranging from extravagant designs to humble blueprints, there is no end to what Hana-Bi is willing to create.
            </p>
            <p>
              Hana-Bi only sources fabric from the best international mills and keeps a focus on domestic manufacturing. Hana-Bi&apos;s concept of sustainability sprouted from Professor Marcy Linton&apos;s class on sustainable fashion, taught at the University of Virginia. Manufacturing is taken north to New York, where the Garment District hosts a web of dreams.
            </p>
            <p>
              Hana-Bi wants to capture the innovative spirit of New York while also maintaining the wearability of timeless fashion. When it comes to future projects, Hana-Bi hopes to adopt what breaks down the limits of human creativity, and to always pioneer in the fields of elegance and beauty.
            </p>
          </div>
        </article>
      </PageShell>
    </main>
  );
}

