import { PageShell } from "@/components/layout/PageShell";
import { ShopContent } from "@/components/shop/ShopContent";
import { getAllProducts } from "@/lib/shopify";
import { mapShopifyProductToHanaBiProduct } from "@/lib/shopify-mappers";
import { products as fallbackProducts } from "@/data/products";

/**
 * Shop page - fetches products from Shopify Storefront API
 *
 * Falls back to local data if Shopify is unavailable (for development).
 * In production, ensure SHOPIFY_STORE_DOMAIN and SHOPIFY_STOREFRONT_ACCESS_TOKEN
 * are set in environment variables.
 */
export default async function ShopPage() {
  let shopifyProducts = fallbackProducts;

  try {
    const shopifyData = await getAllProducts();
    shopifyProducts = shopifyData.map(mapShopifyProductToHanaBiProduct);
  } catch (error) {
    console.warn(
      "Failed to fetch products from Shopify, using fallback data:",
      error
    );
    // Continue with fallback products
  }

  return (
    <PageShell
      eyebrow="Shop"
      title="Limited garments, ready to study."
      intro={
        <>
          Non-archived pieces live here first. Adjust filters to find specific
          silhouettes or sizes. Products are fetched from Shopify Storefront API.
        </>
      }
    >
      <ShopContent products={shopifyProducts} />
    </PageShell>
  );
}

