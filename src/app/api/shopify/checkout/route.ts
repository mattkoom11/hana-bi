/**
 * API Route alternative for Shopify checkout
 *
 * This is an alternative to server actions. Use this if you prefer REST-style
 * API routes over server actions.
 *
 * Usage from client:
 *   const res = await fetch('/api/shopify/checkout', {
 *     method: 'POST',
 *     headers: { 'Content-Type': 'application/json' },
 *     body: JSON.stringify({ lineItems })
 *   });
 */

import { createCheckout } from "@/lib/shopify";
import { NextResponse } from "next/server";

export interface CheckoutRequest {
  lineItems: Array<{
    variantId: string;
    quantity: number;
  }>;
}

export async function POST(request: Request) {
  try {
    const body: CheckoutRequest = await request.json();

    // Validate input
    if (!body.lineItems || body.lineItems.length === 0) {
      return NextResponse.json(
        { error: "Cart is empty" },
        { status: 400 }
      );
    }

    // Validate each line item
    for (const item of body.lineItems) {
      if (!item.variantId || typeof item.variantId !== "string") {
        return NextResponse.json(
          { error: "Invalid variant ID in cart item" },
          { status: 400 }
        );
      }
      if (!item.quantity || item.quantity < 1) {
        return NextResponse.json(
          { error: "Invalid quantity in cart item" },
          { status: 400 }
        );
      }
    }

    const checkoutUrl = await createCheckout(body.lineItems);

    return NextResponse.json({ checkoutUrl });
  } catch (error) {
    console.error("Failed to create Shopify checkout:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to create checkout. Please try again.",
      },
      { status: 500 }
    );
  }
}
