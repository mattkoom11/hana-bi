import { CatalogueIndex } from "@/components/catalogue/CatalogueIndex";
import { HomeHero } from "@/components/home/HomeHero";
import { HomeProcessStage } from "@/components/home/HomeProcessStage";
import { getStripeCatalog } from "@/lib/stripe-catalog";
import { products as fallbackProducts } from "@/data/products";

export const revalidate = 3600; // re-fetch Stripe catalog at most once per hour

const COUNT_WORD = ["No", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight"];

export default async function Home() {
  let allProducts = fallbackProducts;
  try {
    const catalog = await getStripeCatalog();
    if (catalog.length > 0) allProducts = catalog;
  } catch (error) {
    console.warn("Failed to fetch from Stripe, using fallback data:", error);
  }

  const available = allProducts.filter((p) => p.status === "available");
  const countLabel =
    (COUNT_WORD[available.length] ?? String(available.length)) +
    (available.length === 1 ? " garment, currently open." : " garments, currently open.");

  return (
    <main className="page-transition">
      {/* ── Act 1 — Hero ── */}
      <HomeHero />

      {/* ── Act 2 — Process story ── */}
      <HomeProcessStage />

      {/* ── Act 3 — Current edition ── */}
      <section
        className="hb-grain"
        style={{ padding: "6rem var(--hb-gutter)", background: "rgba(14,12,11,0.72)" }}
      >
        <div style={{ position: "relative", zIndex: 1, maxWidth: "var(--hb-max-width)", margin: "0 auto" }}>
          <p
            style={{
              fontFamily: "var(--hb-font-mono)",
              fontSize: "0.75rem",
              textTransform: "uppercase",
              letterSpacing: "var(--hb-track-eyebrow)",
              color: "var(--hb-sienna)",
              margin: 0,
            }}
          >
            Edition 04 — Available
          </p>
          <h2
            style={{
              fontFamily: "var(--hb-font-display)",
              fontStyle: "italic",
              fontWeight: 300,
              fontSize: "clamp(2rem, 4vw, 3.25rem)",
              lineHeight: 1.05,
              color: "var(--hb-on-dark)",
              margin: "1.5rem 0 3.5rem",
            }}
          >
            {countLabel}
          </h2>
          <CatalogueIndex
            variant="dark"
            columns={["collection", "year"]}
            items={available.map((p) => ({
              ...p,
              image: p.heroImage,
              href: `/product/${p.slug}`,
            }))}
          />
        </div>
      </section>
    </main>
  );
}
