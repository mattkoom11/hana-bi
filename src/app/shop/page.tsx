import { PageShell } from "@/components/layout/PageShell";
import { ShopContent } from "@/components/shop/ShopContent";
import { getAllProducts } from "@/lib/shopify";
import { mapShopifyProductToHanaBiProduct } from "@/lib/shopify-mappers";
import { products as fallbackProducts } from "@/data/products";

export default async function ShopPage() {
  let shopifyProducts = fallbackProducts;

  try {
    const shopifyData = await getAllProducts();
    shopifyProducts = shopifyData.map(mapShopifyProductToHanaBiProduct);
  } catch (error) {
    console.warn("Failed to fetch from Shopify, using fallback data:", error);
  }

  return (
    <main className="page-transition">
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
