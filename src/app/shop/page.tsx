import type { Metadata } from "next";
import { PageShell } from "@/components/layout/PageShell";
import { ShopContent } from "@/components/shop/ShopContent";
import { GarmentStage } from "@/components/shop/GarmentStage";
import { getAllProducts } from "@/lib/shopify";
import { mapShopifyProductToHanaBiProduct } from "@/lib/shopify-mappers";
import { products as fallbackProducts } from "@/data/products";

export const metadata: Metadata = {
  title: "Shop — Hana-Bi",
  description:
    "Browse limited denim garments from the Hana-Bi archive. Each piece is documented like an artifact.",
  openGraph: {
    title: "Shop — Hana-Bi",
    description:
      "Browse limited denim garments from the Hana-Bi archive. Each piece is documented like an artifact.",
  },
};

export default async function ShopPage() {
  let shopifyProducts = fallbackProducts;

  try {
    const shopifyData = await getAllProducts();
    shopifyProducts = shopifyData.map(mapShopifyProductToHanaBiProduct);
  } catch (error) {
    console.warn("Failed to fetch from Shopify, using fallback data:", error);
  }

  const featuredProduct =
    shopifyProducts.find((p) => p.status === "available") ?? shopifyProducts[0];

  const catalogIndex = fallbackProducts.findIndex(
    (p) => p.slug === featuredProduct.slug
  );
  const catalogNumber =
    catalogIndex >= 0
      ? `HB-${String(catalogIndex + 1).padStart(3, "0")}`
      : "HB-001";

  return (
    <main className="page-transition">
      <GarmentStage product={featuredProduct} catalogNumber={catalogNumber} />
      <PageShell
        variant="dark"
        eyebrow="Shop"
        title="Limited garments, ready to study."
        intro={<>Filter by size, category, or availability.</>}
      >
        <ShopContent products={shopifyProducts} variant="dark" />
      </PageShell>
    </main>
  );
}
