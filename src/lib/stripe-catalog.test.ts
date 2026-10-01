import type Stripe from "stripe";
import { describe, expect, it, vi } from "vitest";
import { getStripeCatalog, mapStripeProduct } from "./stripe-catalog";

const listed = vi.hoisted(() => ({ products: [] as unknown[] }));

vi.mock("@/lib/env", () => ({ STRIPE_SECRET_KEY: "sk_test_mock" }));
vi.mock("stripe", () => ({
  default: class {
    products = {
      list: async function* () {
        yield* listed.products;
      },
    };
  },
}));

function product(metadata: Record<string, string>, overrides: Partial<Stripe.Product> = {}) {
  return {
    id: "prod_123",
    name: "Test Jean",
    description: "A jean.",
    images: ["https://files.stripe.com/a.jpg"],
    metadata,
    ...overrides,
  } as Stripe.Product;
}
const price = { id: "price_123", unit_amount: 32000 } as Stripe.Price;

describe("mapStripeProduct", () => {
  it("maps metadata fields onto the Product shape", () => {
    const p = mapStripeProduct(
      product({
        slug: "test-jean",
        status: "sold_out",
        sizes: "28, 30 ,32",
        sold_sizes: "32",
        year: "2025",
        catalog_number: "HB-900",
        images: "/a.jpg,/b.jpg",
        featured: "true",
      }),
      price
    );
    expect(p).toMatchObject({
      slug: "test-jean",
      price: 320,
      stripePriceId: "price_123",
      status: "sold_out",
      sizes: ["28", "30", "32"],
      soldSizes: ["32"],
      year: 2025,
      catalogNumber: "HB-900",
      heroImage: "/a.jpg",
      images: ["/a.jpg", "/b.jpg"],
      featured: true,
    });
  });

  it("falls back to sensible defaults when metadata is missing", () => {
    const p = mapStripeProduct(product({}), price);
    expect(p.slug).toBe("prod_123");
    expect(p.status).toBe("available");
    expect(p.sizes).toEqual(["One Size"]);
    expect(p.images).toEqual(["https://files.stripe.com/a.jpg"]);
    expect(p.catalogNumber).toBeUndefined();
    expect(p.marker).toBeUndefined();
  });

  it("forces every size sold out for non-purchasable garments", () => {
    const p = mapStripeProduct(product({ slug: "layered-denim", sizes: "S,M,L" }), price);
    expect(p.soldSizes).toEqual(["S", "M", "L"]);
  });
});

describe("getStripeCatalog", () => {
  it("drops every Stripe product except the displayed garments", async () => {
    listed.products = [
      product({ slug: "layered-denim" }, { id: "prod_ld", default_price: price }),
      product({ slug: "test-jean" }, { id: "prod_test", default_price: price }),
      product({}, { id: "prod_no_slug", default_price: price }),
    ];
    const catalog = await getStripeCatalog();
    expect(catalog.map((p) => p.slug)).toEqual(["layered-denim"]);
  });
});
