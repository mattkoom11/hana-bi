/**
 * Shopify to Hana-Bi Product Mapper
 *
 * This module transforms Shopify Storefront API responses into the Hana-Bi product format
 * used throughout the UI components.
 *
 * Metafield Mapping:
 * - Customize the metafield namespace/key below based on your Shopify setup.
 * - Recommended metafields in Shopify:
 *   - hana_bi.story (single_line_text_field)
 *   - hana_bi.materials (single_line_text_field)
 *   - hana_bi.care (single_line_text_field)
 *   - hana_bi.year (number_integer)
 *   - hana_bi.notes (single_line_text_field)
 *   - hana_bi.collection (single_line_text_field)
 *   - hana_bi.status (single_line_text_field) - "available", "sold_out", "archived"
 *
 * To set up metafields in Shopify:
 * 1. Go to Settings → Custom data → Products
 * 2. Add metafield definitions with namespace "hana_bi" and keys above
 * 3. Fill in metafields for each product in Shopify Admin
 */

import type { Product, ProductStatus } from "@/data/products";
import type { ShopifyProductNode } from "./shopify";

/**
 * Get a metafield value by namespace and key
 */
function getMetafield(
  product: ShopifyProductNode,
  namespace: string,
  key: string
): string | null {
  if (!product.metafields?.edges) {
    return null;
  }

  const metafield = product.metafields.edges.find(
    (edge) => edge.node.namespace === namespace && edge.node.key === key
  );

  return metafield?.node.value ?? null;
}

/**
 * Determine product status from Shopify data
 *
 * Priority:
 * 1. Metafield hana_bi.status if set
 * 2. Tag "ARCHIVE" → archived
 * 3. Tag "SOLD_OUT" → sold_out
 * 4. availableForSale === false → sold_out
 * 5. Default → available
 */
function determineStatus(product: ShopifyProductNode): ProductStatus {
  const statusMetafield = getMetafield(product, "hana_bi", "status");
  if (statusMetafield) {
    const normalized = statusMetafield.toLowerCase().trim();
    if (normalized === "archived") return "archived";
    if (normalized === "sold_out" || normalized === "sold-out") return "sold_out";
    if (normalized === "available") return "available";
  }

  // Check tags
  const tags = product.tags.map((t) => t.toUpperCase());
  if (tags.includes("ARCHIVE")) return "archived";
  if (tags.includes("SOLD_OUT") || tags.includes("SOLD-OUT")) return "sold_out";

  // Check availability
  if (!product.availableForSale) return "sold_out";

  return "available";
}

/**
 * Extract sizes from product variants
 *
 * Assumes size is stored in a selectedOption named "Size", "Title", or similar.
 * Adjust the logic below if your variant naming differs.
 */
function extractSizes(product: ShopifyProductNode): string[] {
  const sizes = new Set<string>();

  for (const variantEdge of product.variants.edges) {
    const variant = variantEdge.node;

    // Try to find a "Size" option first
    const sizeOption = variant.selectedOptions.find(
      (opt) => opt.name.toLowerCase() === "size"
    );

    if (sizeOption) {
      sizes.add(sizeOption.value);
    } else if (variant.selectedOptions.length > 0) {
      // Fallback: use the first option value (common for single-option products)
      sizes.add(variant.selectedOptions[0].value);
    } else {
      // No options, might be a one-size product
      sizes.add("One Size");
    }
  }

  return Array.from(sizes).sort();
}

/**
 * Get the primary price from the first available variant, or the price range
 */
function getPrice(product: ShopifyProductNode): number {
  // Try to get the first available variant's price
  const availableVariant = product.variants.edges.find(
    (edge) => edge.node.availableForSale
  );

  if (availableVariant) {
    return parseFloat(availableVariant.node.price.amount);
  }

  // Fallback to min variant price
  return parseFloat(product.priceRange.minVariantPrice.amount);
}

/**
 * Get primary collection name
 *
 * Uses metafield if available, otherwise uses the first collection's title.
 */
function getCollection(product: ShopifyProductNode): string {
  const collectionMetafield = getMetafield(product, "hana_bi", "collection");
  if (collectionMetafield) {
    return collectionMetafield;
  }

  if (product.collections?.edges && product.collections.edges.length > 0) {
    return product.collections.edges[0].node.title;
  }

  return "Uncategorized";
}

/**
 * Check if product is featured
 *
 * Uses tag "FEATURED" or metafield hana_bi.featured
 */
function isFeatured(product: ShopifyProductNode): boolean {
  const featuredMetafield = getMetafield(product, "hana_bi", "featured");
  if (featuredMetafield === "true" || featuredMetafield === "1") {
    return true;
  }

  return product.tags.some((tag) => tag.toUpperCase() === "FEATURED");
}

/**
 * Map Shopify product node to Hana-Bi Product format
 */
export function mapShopifyProductToHanaBiProduct(
  shopifyProduct: ShopifyProductNode
): Product {
  const heroImage =
    shopifyProduct.featuredImage?.url ||
    shopifyProduct.images.edges[0]?.node.url ||
    "";

  const images = shopifyProduct.images.edges.map((edge) => edge.node.url);

  // If no images, use hero image as fallback
  if (images.length === 0 && heroImage) {
    images.push(heroImage);
  }

  const yearMetafield = getMetafield(shopifyProduct, "hana_bi", "year");
  const year = yearMetafield ? parseInt(yearMetafield, 10) : new Date().getFullYear();

  return {
    id: shopifyProduct.id,
    slug: shopifyProduct.handle,
    name: shopifyProduct.title,
    price: getPrice(shopifyProduct),
    status: determineStatus(shopifyProduct),
    description: shopifyProduct.description || "",
    story:
      getMetafield(shopifyProduct, "hana_bi", "story") ||
      shopifyProduct.description ||
      "",
    materials: getMetafield(shopifyProduct, "hana_bi", "materials") || "",
    care: getMetafield(shopifyProduct, "hana_bi", "care") || "",
    sizes: extractSizes(shopifyProduct),
    heroImage,
    images,
    collection: getCollection(shopifyProduct),
    tags: shopifyProduct.tags,
    year: isNaN(year) ? new Date().getFullYear() : year,
    notes: getMetafield(shopifyProduct, "hana_bi", "notes") || "",
    featured: isFeatured(shopifyProduct),
  };
}

/**
 * Find a variant ID by size option
 *
 * Used when adding items to cart to match the selected size with the correct Shopify variant.
 */
export function findVariantIdBySize(
  product: ShopifyProductNode,
  size: string
): string | null {
  for (const variantEdge of product.variants.edges) {
    const variant = variantEdge.node;

    // Check if any selectedOption matches the size
    const matchesSize = variant.selectedOptions.some(
      (opt) =>
        opt.name.toLowerCase() === "size" && opt.value.toLowerCase() === size.toLowerCase()
    );

    // Also check if the variant title matches (common for single-option products)
    if (!matchesSize && variant.title.toLowerCase() === size.toLowerCase()) {
      return variant.id;
    }

    if (matchesSize) {
      return variant.id;
    }
  }

  return null;
}

/**
 * Get variant by ID
 */
export function getVariantById(
  product: ShopifyProductNode,
  variantId: string
): ShopifyProductNode["variants"]["edges"][0]["node"] | null {
  const variantEdge = product.variants.edges.find(
    (edge) => edge.node.id === variantId
  );

  return variantEdge?.node ?? null;
}
