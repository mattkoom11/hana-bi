import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

export interface CheckoutLineItem {
  name: string;
  price: number; // in cents (e.g. 19800 = $198.00)
  quantity: number;
  image?: string;
}

export interface CheckoutRequestBody {
  items: CheckoutLineItem[];
  cancelUrl?: string;
}

function getStripe() {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    throw new Error("STRIPE_SECRET_KEY is not set");
  }
  return new Stripe(secretKey, {
    apiVersion: "2025-12-15.clover",
    typescript: true,
  });
}

export async function POST(request: NextRequest) {
  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json(
      { error: "Server configuration error" },
      { status: 500 }
    );
  }

  if (!process.env.NEXT_PUBLIC_SITE_URL) {
    return NextResponse.json(
      { error: "Server configuration error" },
      { status: 500 }
    );
  }

  let body: CheckoutRequestBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  if (!body.items || body.items.length === 0) {
    return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
  }

  for (const item of body.items) {
    if (!item.name || typeof item.name !== "string" || item.name.length > 500) {
      return NextResponse.json({ error: "Invalid item name" }, { status: 400 });
    }
    if (typeof item.price !== "number" || item.price <= 0) {
      return NextResponse.json({ error: "Invalid item price" }, { status: 400 });
    }
    if (typeof item.quantity !== "number" || !Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > 1000) {
      return NextResponse.json({ error: "Invalid item quantity" }, { status: 400 });
    }
  }

  try {
    const stripe = getStripe();
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
    // Validate cancelUrl is internal to prevent open redirect via Stripe cancel
    const rawCancelUrl = body.cancelUrl;
    const cancelUrl =
      rawCancelUrl && rawCancelUrl.startsWith(siteUrl)
        ? rawCancelUrl
        : `${siteUrl}/cart`;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: body.items.map((item) => ({
        price_data: {
          currency: "usd",
          product_data: {
            name: item.name,
            ...(item.image ? { images: [item.image] } : {}),
          },
          // TODO: Before launch, validate price server-side against Shopify product prices.
          // Client-supplied prices are a security risk in production.
          unit_amount: Math.round(item.price), // price is already in cents
        },
        quantity: item.quantity,
      })),
      mode: "payment",
      success_url: `${siteUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Stripe checkout error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to create checkout session. Please try again.",
      },
      { status: 500 }
    );
  }
}
