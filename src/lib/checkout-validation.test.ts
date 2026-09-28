import { describe, expect, it } from "vitest";
import {
  MAX_CART_LINES,
  orderLinesFromMetadata,
  validateCheckoutItems,
} from "./checkout-validation";

const jean = {
  slug: "test-jean",
  name: "Test Jean",
  catalogNumber: "HB-900",
  status: "available" as const,
  sizes: ["28", "30", "32"],
  soldSizes: ["32"],
  stripePriceId: "price_jean",
};
const archived = { ...jean, slug: "old", name: "Old Coat", status: "archived" as const, stripePriceId: "price_old", soldSizes: [] };
const catalog = [jean, archived];

describe("validateCheckoutItems", () => {
  it("accepts an in-stock size and records it in metadata", () => {
    const result = validateCheckoutItems([{ priceId: "price_jean", size: "30", quantity: 2 }], catalog);
    expect(result).toEqual({
      ok: true,
      lineItems: [{ price: "price_jean", quantity: 2 }],
      metadata: { item_01: "HB-900 Test Jean · size 30 · qty 2" },
    });
  });

  it("merges sizes of the same garment into one Stripe line but keeps each size", () => {
    const result = validateCheckoutItems(
      [
        { priceId: "price_jean", size: "28", quantity: 1 },
        { priceId: "price_jean", size: "30", quantity: 1 },
      ],
      catalog
    );
    if (!result.ok) throw new Error(result.error);
    expect(result.lineItems).toEqual([{ price: "price_jean", quantity: 2 }]);
    expect(Object.values(result.metadata)).toEqual([
      "HB-900 Test Jean · size 28 · qty 1",
      "HB-900 Test Jean · size 30 · qty 1",
    ]);
  });

  it.each([
    ["a sold-out size", { priceId: "price_jean", size: "32", quantity: 1 }, /sold out/],
    ["a size the garment doesn't come in", { priceId: "price_jean", size: "40", quantity: 1 }, /does not come in/],
    ["an archived garment", { priceId: "price_old", size: "30", quantity: 1 }, /not available/],
    ["a price outside the catalog", { priceId: "price_other", size: "30", quantity: 1 }, /no longer available/],
    ["a missing size", { priceId: "price_jean", quantity: 1 }, /garment and a size/],
    ["a zero quantity", { priceId: "price_jean", size: "30", quantity: 0 }, /quantity/],
    ["a fractional quantity", { priceId: "price_jean", size: "30", quantity: 1.5 }, /quantity/],
  ])("rejects %s", (_label, item, message) => {
    const result = validateCheckoutItems([item], catalog);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toMatch(message);
  });

  it("rejects an empty, malformed or oversized cart", () => {
    expect(validateCheckoutItems([], catalog).ok).toBe(false);
    expect(validateCheckoutItems("nope", catalog).ok).toBe(false);
    const tooMany = Array.from({ length: MAX_CART_LINES + 1 }, () => ({ priceId: "price_jean", size: "30", quantity: 1 }));
    expect(validateCheckoutItems(tooMany, catalog).ok).toBe(false);
  });
});

describe("orderLinesFromMetadata", () => {
  it("returns item lines in cart order and ignores other keys", () => {
    expect(
      orderLinesFromMetadata({ item_02: "second", other: "x", item_01: "first" })
    ).toEqual(["first", "second"]);
    expect(orderLinesFromMetadata(null)).toEqual([]);
  });
});
