"use server";

/**
 * Server Action for creating Shopify checkout
 *
 * This action receives cart items from the client and creates a Shopify checkout
 * using the Storefront API. It returns the checkout URL for redirect.
 *
 * Why Server Actions over API Routes?
 * - Simpler to call from client components (no fetch boilerplate)
 * - Type-safe with TypeScript
 * - Automatic error handling and serialization
 * - Better integration with Next.js App Router
 *
 * Alternative: If you prefer API routes, see app/api/shopify/checkout/route.ts
 */

import { createCheckout } from "@/lib/shopify";

export interface CheckoutLineItem {
  variantId: string;
  quantity: number;
}

export interface CreateCheckoutResult {
  success: boolean;
  checkoutUrl?: string;
  error?: string;
}

/**
 * Create a Shopify checkout from cart line items
 *
 * @param lineItems - Array of { variantId, quantity }
 * @returns Checkout URL or error message
 */
export async function createCheckoutAction(
  lineItems: CheckoutLineItem[]
): Promise<CreateCheckoutResult> {
  // Validate input
  if (!lineItems || lineItems.length === 0) {
    return {
      success: false,
      error: "Cart is empty",
    };
  }

  // Validate each line item
  for (const item of lineItems) {
    if (!item.variantId || typeof item.variantId !== "string") {
      return {
        success: false,
        error: "Invalid variant ID in cart item",
      };
    }
    if (!item.quantity || item.quantity < 1) {
      return {
        success: false,
        error: "Invalid quantity in cart item",
      };
    }
  }

  try {
    const checkoutUrl = await createCheckout(lineItems);

    return {
      success: true,
      checkoutUrl,
    };
  } catch (error) {
    console.error("Failed to create Shopify checkout:", error);

    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to create checkout. Please try again.",
    };
  }
}

