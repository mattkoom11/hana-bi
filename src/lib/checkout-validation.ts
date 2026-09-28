import type { Product } from '@/data/products';

export interface CheckoutLineItem {
  priceId: string;
  size: string;
  quantity: number;
}

/** Stripe allows 50 metadata keys; one per cart line keeps each under 500 chars. */
export const MAX_CART_LINES = 40;
export const MAX_LINE_QUANTITY = 10;

export type CheckoutValidation =
  | {
      ok: true;
      /** One Stripe line item per price — sizes of the same garment share a price. */
      lineItems: { price: string; quantity: number }[];
      /** Session metadata recording which size each unit was bought in. */
      metadata: Record<string, string>;
    }
  | { ok: false; error: string };

/**
 * Checks a client-supplied cart against the live catalog. The client's own
 * sold-out / non-purchasable checks are UI only; this is the enforcement.
 */
export function validateCheckoutItems(
  items: unknown,
  catalog: Pick<Product, 'slug' | 'name' | 'status' | 'sizes' | 'soldSizes' | 'stripePriceId' | 'catalogNumber'>[]
): CheckoutValidation {
  if (!Array.isArray(items) || items.length === 0) return { ok: false, error: 'Cart is empty' };
  if (items.length > MAX_CART_LINES) return { ok: false, error: 'Too many items in cart' };

  const byPrice = new Map(catalog.filter((p) => p.stripePriceId).map((p) => [p.stripePriceId!, p]));
  const quantities = new Map<string, number>();
  const metadata: Record<string, string> = {};

  for (const [i, raw] of items.entries()) {
    const item = raw as Partial<CheckoutLineItem>;
    if (typeof item.priceId !== 'string' || typeof item.size !== 'string') {
      return { ok: false, error: 'Each item needs a garment and a size' };
    }
    if (!Number.isInteger(item.quantity) || item.quantity! < 1 || item.quantity! > MAX_LINE_QUANTITY) {
      return { ok: false, error: 'Invalid item quantity' };
    }

    const product = byPrice.get(item.priceId);
    if (!product) return { ok: false, error: 'An item in your cart is no longer available' };
    if (product.status !== 'available') return { ok: false, error: `${product.name} is not available` };
    if (!product.sizes.includes(item.size)) return { ok: false, error: `${product.name} does not come in ${item.size}` };
    if (product.soldSizes?.includes(item.size)) return { ok: false, error: `${product.name} in ${item.size} is sold out` };

    quantities.set(item.priceId, (quantities.get(item.priceId) ?? 0) + item.quantity!);
    const label = product.catalogNumber ? `${product.catalogNumber} ${product.name}` : product.name;
    metadata[`item_${String(i + 1).padStart(2, '0')}`] = `${label} · size ${item.size} · qty ${item.quantity}`.slice(0, 500);
  }

  return {
    ok: true,
    lineItems: [...quantities].map(([price, quantity]) => ({ price, quantity })),
    metadata,
  };
}

/** Reads the size breakdown back out of session metadata, in cart order. */
export function orderLinesFromMetadata(metadata: Record<string, string> | null | undefined): string[] {
  return Object.entries(metadata ?? {})
    .filter(([key]) => /^item_\d+$/.test(key))
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([, value]) => value);
}
