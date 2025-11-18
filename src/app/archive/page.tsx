import { SketchFrame } from "@/components/common/SketchFrame";
import { PageShell } from "@/components/layout/PageShell";
import { archivedProducts } from "@/data/products";

const groupedByYear = archivedProducts.reduce<Record<number, typeof archivedProducts>>(
  (acc, product) => {
    if (!acc[product.year]) {
      acc[product.year] = [];
    }
    acc[product.year].push(product);
    return acc;
  },
  {}
);

export default function ArchivePage() {
  const years = Object.keys(groupedByYear)
    .map(Number)
    .sort((a, b) => b - a);

  return (
    <PageShell
      eyebrow="Archive"
      title="A museum wall of Hana-Bi silhouettes."
      intro="Sold out and archived garments live here with editorial annotations. Use this spread as inspiration for future drops or to document provenance."
    >
      <div className="space-y-12">
        {years.map((year) => (
          <section key={year} className="space-y-6">
            <p className="uppercase text-xs tracking-[0.4em] text-[var(--hb-smoke)]">
              {year}
            </p>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {groupedByYear[year].map((product, index) => (
                <SketchFrame
                  key={product.id}
                  tilt={index % 3 === 0 ? "left" : index % 3 === 1 ? "right" : "none"}
                >
                  <p className="uppercase text-[0.65rem] tracking-[0.4em] text-[var(--hb-smoke)]">
                    {product.collection}
                  </p>
                  <h3 className="font-serif text-2xl mt-2">{product.name}</h3>
                  <p className="text-sm text-[var(--hb-smoke)] mt-2">
                    {product.description}
                  </p>
                  <p className="text-xs uppercase tracking-[0.3em] mt-4">
                    {product.status === "sold_out" ? "Sold Out" : "Archived"}
                  </p>
                </SketchFrame>
              ))}
            </div>
          </section>
        ))}
      </div>
    </PageShell>
  );
}

