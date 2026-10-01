/**
 * Shared product type, plus the local fallback used when Stripe returns
 * nothing. The fallback is deliberately empty: Stripe is the only source of
 * garments, so a Stripe outage shows an empty shop rather than placeholders.
 */

export type ProductStatus = "available" | "sold_out" | "archived";

export interface Product {
  id: string;
  slug: string;
  name: string;
  price: number;
  stripePriceId?: string;
  status: ProductStatus;
  description: string;
  story: string;
  materials: string;
  care: string;
  sizes: string[];
  heroImage: string;
  images: string[];
  collection: string;
  tags: string[];
  year: number;
  notes: string;
  featured?: boolean;
  soldSizes?: string[];
  /** Record identity for CatalogueIndex/ProductCard — never derived from array position. */
  catalogNumber?: string;
  /**
   * Path to a real production-marker JSON (public/patterns/*.json), read by
   * ConstructionSection/TurntableObject. Only set this on a garment whose
   * marker data is real — never fabricate one. See design/ASSETS.md.
   */
  marker?: string;
}

export const products: Product[] = [];

export const getProductBySlug = (slug: string) =>
  products.find((product) => product.slug === slug);

export const featuredProducts = products.filter((product) => product.featured);

export const availableProducts = products.filter(
  (product) => product.status === "available"
);

export const archivedProducts = products.filter(
  (product) => product.status !== "available"
);

