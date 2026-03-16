import { headers } from "next/headers";
import { NextResponse } from "next/server";
import Stripe from "stripe";

// In-memory store for verified session IDs.
// In production, replace with a database write (Redis, Postgres, etc.)
export const verifiedSessions = new Set<string>();

function getStripe() {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) throw new Error("STRIPE_SECRET_KEY is not set");
  return new Stripe(secretKey, {
    apiVersion: "2025-12-15.clover",
    typescript: true,
  });
}

// Note: In Next.js App Router, raw body access is done via request.text() directly.
// The Pages Router `export const config = { api: { bodyParser: false } }` pattern
// has no effect here and is NOT used.

export async function POST(request: Request) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error("STRIPE_WEBHOOK_SECRET is not set");
    return NextResponse.json(
      { error: "Webhook secret not configured" },
      { status: 500 }
    );
  }

  const body = await request.text();
  const headersList = await headers();
  const signature = headersList.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    const stripe = getStripe();
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    if (session.payment_status === "paid" && session.id) {
      verifiedSessions.add(session.id);
      console.log(`Payment verified for session: ${session.id}`);
    }
  }

  return NextResponse.json({ received: true });
}
