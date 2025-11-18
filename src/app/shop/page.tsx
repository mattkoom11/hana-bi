import { PageShell } from "@/components/layout/PageShell";
import { ShopContent } from "@/components/shop/ShopContent";
import { products } from "@/data/products";

export default function ShopPage() {
  return (
    <PageShell
      eyebrow="Shop"
      title="Limited garments, ready to study."
      intro={
        <>
          Non-archived pieces live here first. Adjust filters to find specific
          silhouettes or sizes. All data comes from `/data/products.ts` so a CMS
          can replace it later.
        </>
      }
    >
      <ShopContent products={products} />
    </PageShell>
  );
}

