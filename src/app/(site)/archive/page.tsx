import type { Metadata } from "next";
import { PageShell } from "@/components/layout/PageShell";
import { CatalogueIndex } from "@/components/catalogue/CatalogueIndex";
import { getStripeCatalog } from "@/lib/stripe-catalog";
import { archivedProducts as fallbackArchived } from "@/data/products";
import type { Product } from "@/data/products";

export const metadata: Metadata = {
  title: "Archive — Hana-Bi",
  description:
    "Past retail drops from Hana-Bi — sold-out garments preserved with editorial annotations and fabric provenance.",
  openGraph: {
    title: "Archive — Hana-Bi",
    description:
      "Past retail drops from Hana-Bi — sold-out garments preserved with editorial annotations and fabric provenance.",
  },
};

export const revalidate = 3600; // re-fetch Stripe catalog at most once per hour

export default async function ArchivePage() {
  let archived: Product[] = fallbackArchived;

  try {
    const catalog = await getStripeCatalog();
    if (catalog.length > 0) {
      archived = catalog.filter((p) => p.status !== "available");
    }
  } catch (error) {
    console.warn("Failed to fetch archived products from Stripe, using fallback:", error);
  }

  return (
    <main className="page-transition">
      <PageShell
        eyebrow="Archive"
        title="Past retail drops, preserved."
        intro="Every garment that has passed through the shop lives here — sold-out and closed editions catalogued with fabric provenance and editorial notes."
      >
        <CatalogueIndex
          variant="light"
          columns={["collection", "year"]}
          items={archived.map((p) => ({
            ...p,
            image: p.heroImage,
            href: `/product/${p.slug}`,
          }))}
        />
      </PageShell>
    </main>
  );
}
