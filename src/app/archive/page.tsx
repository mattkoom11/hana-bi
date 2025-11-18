import { SketchFrame } from "@/components/common/SketchFrame";
import { PageShell } from "@/components/layout/PageShell";
import { getAllProducts, getCollectionProducts } from "@/lib/shopify";
import { mapShopifyProductToHanaBiProduct } from "@/lib/shopify-mappers";
import { archivedProducts as fallbackArchived } from "@/data/products";
import type { Product } from "@/data/products";

/**
 * Archive page - fetches archived products from Shopify
 *
 * Filters products by:
 * - Status: "archived" or "sold_out"
 * - Tags: "ARCHIVE" or "ARCHIVED"
 * - Or from a collection handle "archive" (customize as needed)
 */
export default async function ArchivePage() {
  let archivedProducts: Product[] = fallbackArchived;

  try {
    // Try to fetch from an "archive" collection first
    // Customize the collection handle: getCollectionProducts("your-archive-handle")
    try {
      const archiveCollection = await getCollectionProducts("archive");
      archivedProducts = archiveCollection.map(mapShopifyProductToHanaBiProduct);
    } catch {
      // If "archive" collection doesn't exist, fetch all and filter
      const allProducts = await getAllProducts();
      const mapped = allProducts.map(mapShopifyProductToHanaBiProduct);
      archivedProducts = mapped.filter(
        (p) =>
          p.status === "archived" ||
          p.status === "sold_out" ||
          p.tags.some((t) => t.toUpperCase().includes("ARCHIVE"))
      );
    }
  } catch (error) {
    console.warn(
      "Failed to fetch archived products from Shopify, using fallback data:",
      error
    );
    // Continue with fallback data
  }

  const groupedByYear = archivedProducts.reduce<
    Record<number, Product[]>
  >((acc, product) => {
    if (!acc[product.year]) {
      acc[product.year] = [];
    }
    acc[product.year].push(product);
    return acc;
  }, {});

  const years = Object.keys(groupedByYear)
    .map(Number)
    .sort((a, b) => b - a);

  return (
    <main className="page-transition">
      <PageShell
        eyebrow="Archive"
        title="A museum wall of Hana-Bi silhouettes."
        intro="Sold out and archived garments live here with editorial annotations. Use this spread as inspiration for future drops or to document provenance."
      >
        <div className="space-y-16">
          {years.map((year) => (
            <section key={year} className="space-y-8">
              <p className="uppercase text-xs tracking-[0.4em] text-[var(--hb-smoke)] font-script opacity-70">
                {year}
              </p>
              <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-3">
                {groupedByYear[year].map((product, index) => (
                  <SketchFrame
                    key={product.id}
                    tilt={index % 3 === 0 ? "left" : index % 3 === 1 ? "right" : "none"}
                    strokeOpacity={0.3}
                  >
                    <div className="space-y-4">
                      <p className="uppercase text-[0.65rem] tracking-[0.4em] text-[var(--hb-smoke)] font-script opacity-70">
                        {product.collection}
                      </p>
                      <h3 className="font-serif text-2xl leading-tight">{product.name}</h3>
                      <p className="text-sm text-[var(--hb-smoke)] opacity-80 leading-relaxed">
                        {product.description}
                      </p>
                      <p className="text-xs uppercase tracking-[0.3em] font-script opacity-60 pt-2 border-t border-dashed border-[var(--hb-border)]" style={{ borderWidth: "1px" }}>
                        {product.status === "sold_out" ? "Sold Out" : "Archived"}
                      </p>
                    </div>
                  </SketchFrame>
                ))}
              </div>
            </section>
          ))}
        </div>
      </PageShell>
    </main>
  );
}

