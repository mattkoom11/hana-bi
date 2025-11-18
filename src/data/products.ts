/**
 * Legacy local product data
 *
 * This file is kept as a fallback for development when Shopify is unavailable.
 * In production, products are fetched from Shopify Storefront API via:
 * - lib/shopify.ts (API client)
 * - lib/shopify-mappers.ts (data transformation)
 *
 * To use Shopify:
 * 1. Set environment variables in .env.local:
 *    - SHOPIFY_STORE_DOMAIN
 *    - SHOPIFY_STOREFRONT_ACCESS_TOKEN
 *    - SHOPIFY_API_VERSION (optional, defaults to "2025-01")
 * 2. Products will automatically fetch from Shopify on all pages
 * 3. This file will only be used if Shopify fetch fails
 */

export type ProductStatus = "available" | "sold_out" | "archived";

export interface Product {
  id: string;
  slug: string;
  name: string;
  price: number;
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
}

export const products: Product[] = [
  {
    id: "hb-indigo-serenade",
    slug: "indigo-serenade-coat",
    name: "Indigo Serenade Coat",
    price: 640,
    status: "available",
    description:
      "Long-line indigo denim coat with hand-stitched sashiko mapping and a removable belt.",
    story:
      "Sketched from a 1970s Tokyo street photograph, the Serenade Coat revisits the idea of protective denim. Each piece is brushed with a sumi-ink wash before being finished with sashiko constellations by hand.",
    materials: "Japanese organic selvedge denim, plant-dyed sateen lining.",
    care: "Dry clean only or spot clean with cold water. Avoid direct steam on sashiko embroidery.",
    sizes: ["XS", "S", "M", "L"],
    heroImage:
      "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=1000&q=80",
    images: [
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1504593811423-6dd665756598?auto=format&fit=crop&w=900&q=80",
    ],
    collection: "Runway 01",
    tags: ["outerwear", "denim", "unisex", "hand-stitched"],
    year: 2025,
    notes: "Edition of 40. Each sashiko map is unique.",
    featured: true,
  },
  {
    id: "hb-midnight-reed",
    slug: "midnight-reed-denim",
    name: "Midnight Reed Denim",
    price: 320,
    status: "available",
    description:
      "Straight, relaxed denim with raw edge hems and brushstroke piping along the side seams.",
    story:
      "Cut on the bias for fluidity, the Reed Denim borrows its linework from bamboo etchings found in the Hana-Bi archive. A charcoal ink stripe is hand-drawn along each seam to echo reed shadows.",
    materials: "Regenerative cotton denim, recycled brass hardware.",
    care: "Machine wash cold inside out. Line dry to preserve brushwork.",
    sizes: ["24", "26", "28", "30", "32", "34"],
    heroImage:
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=1200&q=80",
    images: [
      "https://images.unsplash.com/photo-1504593811423-6dd665756598?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?auto=format&fit=crop&w=900&q=80",
    ],
    collection: "First Bloom",
    tags: ["denim", "unisex", "essentials"],
    year: 2025,
    notes: "Signature brushstroke may vary; each pair is signed.",
    featured: true,
  },
  {
    id: "hb-paper-lantern",
    slug: "paper-lantern-top",
    name: "Paper Lantern Top",
    price: 280,
    status: "sold_out",
    description:
      "Structured wrap top with elongated cuffs and contrast tacking reminiscent of lantern ribs.",
    story:
      "Developed from vintage pattern clippings, the Lantern Top frames the body like a paper lantern glow. Delicate tack-stitches are left visible, a nod to atelier fittings.",
    materials: "Undyed hemp silk blend, corozo buttons.",
    care: "Hand wash cold with gentle detergent. Lay flat to dry.",
    sizes: ["XS", "S", "M"],
    heroImage:
      "https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1200&q=80",
    images: [
      "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=1000&q=80",
    ],
    collection: "Archive Capsule",
    tags: ["top", "hand-drawn", "limited"],
    year: 2024,
    notes: "Sold out in 36 hours. Awaiting re-issue decision.",
  },
  {
    id: "hb-sea-smoke-kimono",
    slug: "sea-smoke-kimono",
    name: "Sea Smoke Kimono",
    price: 540,
    status: "archived",
    description:
      "Gallery-length kimono coat in double-faced cotton twill with sumi ink gradients.",
    story:
      "Part of the Hana-Bi Museum Series, the Sea Smoke Kimono catalogues coastal fog through layered ink sprays. Only 12 garments were produced, each photographed and catalogued.",
    materials: "Double-faced organic cotton twill, natural indigo pigment.",
    care: "Gallery instructions: keep away from direct sunlight; professional clean only.",
    sizes: ["One Size"],
    heroImage:
      "https://images.unsplash.com/photo-1495121605193-b116b5b09d59?auto=format&fit=crop&w=1200&q=80",
    images: [
      "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=1000&q=80",
    ],
    collection: "Museum Series",
    tags: ["archive", "kimono", "runway"],
    year: 2023,
    notes: "Catalogued in Hana-Bi Archives Vol. II.",
  },
  {
    id: "hb-ink-ripple-skirt",
    slug: "ink-ripple-skirt",
    name: "Ink Ripple Skirt",
    price: 360,
    status: "available",
    description:
      "Midi skirt with modular panels and raw selvedge edges, finished with tonal topstitch ripples.",
    story:
      "The Ripple Skirt originated from contact sheet overlays found in the studio. Panels are basted together, then washed to encourage gentle undulations along the hem.",
    materials: "Deadstock indigo linen, organic cotton binding.",
    care: "Cold hand wash only. Hang to dry in shade.",
    sizes: ["0", "2", "4", "6", "8"],
    heroImage:
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=1000&q=80",
    images: [
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=1200&q=80",
    ],
    collection: "Notebook 02",
    tags: ["skirt", "denim", "limited"],
    year: 2025,
    notes: "Numbered metal tab stitched into interior waistband.",
    featured: true,
  },
  {
    id: "hb-shadow-weave-vest",
    slug: "shadow-weave-vest",
    name: "Shadow Weave Vest",
    price: 290,
    status: "available",
    description:
      "Reversible vest with tonal jacquard weaving and adjustable leather ties.",
    story:
      "Knitted in small batches on vintage looms, the Shadow Weave Vest is a travel piece for stylists. The inside panel is stamped with archival plate numbers for catalog reference.",
    materials: "Organic cotton jacquard, recycled leather ties.",
    care: "Hand wash cold, reshape while damp. Leather ties can be conditioned sparingly.",
    sizes: ["XS", "S", "M", "L", "XL"],
    heroImage:
      "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=1000&q=80",
    images: [
      "https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1200&q=80",
    ],
    collection: "Field Notes",
    tags: ["vest", "layering", "unisex"],
    year: 2025,
    notes: "First delivery ships with hand-numbered archival card.",
  },
];

export const getProductBySlug = (slug: string) =>
  products.find((product) => product.slug === slug);

export const featuredProducts = products.filter((product) => product.featured);

export const availableProducts = products.filter(
  (product) => product.status === "available"
);

export const archivedProducts = products.filter(
  (product) => product.status !== "available"
);

