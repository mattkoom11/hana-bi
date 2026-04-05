import type { MetadataRoute } from "next";
import { getAllProducts } from "@/lib/shopify";
import { mapShopifyProductToHanaBiProduct } from "@/lib/shopify-mappers";
import { products as fallbackProducts } from "@/data/products";
import { projects } from "@/data/projects";
import { NEXT_PUBLIC_SITE_URL } from "@/lib/env";

const BASE_URL = NEXT_PUBLIC_SITE_URL ?? "https://hana-bi.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Static pages
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: BASE_URL, lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    { url: `${BASE_URL}/shop`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${BASE_URL}/about`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE_URL}/archive`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE_URL}/projects`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.7 },
  ];

  // Product pages
  let productSlugs: string[] = fallbackProducts.map((p) => p.slug);
  try {
    const shopifyProducts = await getAllProducts();
    productSlugs = shopifyProducts.map((p) => p.handle);
  } catch {
    // fall back to local slugs
  }

  const productRoutes: MetadataRoute.Sitemap = productSlugs.map((slug) => ({
    url: `${BASE_URL}/product/${slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  // Project pages (local data only — no API)
  const projectRoutes: MetadataRoute.Sitemap = projects.map((project) => ({
    url: `${BASE_URL}/projects/${project.slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  return [...staticRoutes, ...productRoutes, ...projectRoutes];
}
