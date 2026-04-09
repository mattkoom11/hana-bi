import { headers } from "next/headers";
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { Resend } from "resend";
import { STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, RESEND_API_KEY } from "@/lib/env";

function getStripe() {
  const secretKey = STRIPE_SECRET_KEY;
  if (!secretKey) throw new Error("STRIPE_SECRET_KEY is not set");
  return new Stripe(secretKey, {
    apiVersion: "2025-12-15.clover",
    typescript: true,
  });
}

function getResend() {
  if (!RESEND_API_KEY) throw new Error("RESEND_API_KEY is not set");
  return new Resend(RESEND_API_KEY);
}

async function sendOrderConfirmation(session: Stripe.Checkout.Session) {
  if (!RESEND_API_KEY) return;

  const email = session.customer_details?.email;
  const name = session.customer_details?.name;
  if (!email) return;

  const greeting = name ? `Hi ${name},` : "Hi,";
  const amountFormatted = session.amount_total
    ? `$${(session.amount_total / 100).toFixed(2)}`
    : "—";

  const resend = getResend();
  await resend.emails.send({
    from: "Hana-Bi <hello@hana-bi.com>",
    to: email,
    subject: "Your Hana-Bi order is confirmed",
    html: `
      <div style="font-family: monospace; max-width: 520px; margin: 0 auto; color: #1a1714;">
        <p style="font-size: 11px; letter-spacing: 0.4em; text-transform: uppercase; color: #8b5e3c;">Hana-Bi Atelier</p>
        <h1 style="font-family: serif; font-weight: 300; font-style: italic; font-size: 2rem; margin: 8px 0 24px;">Order Confirmed</h1>
        <p>${greeting}</p>
        <p>Thank you for your order. We've received your payment and will begin processing your garment.</p>
        <div style="border: 1px dashed #c9c4bb; padding: 16px; margin: 24px 0;">
          <p style="font-size: 11px; letter-spacing: 0.3em; text-transform: uppercase; color: #8b5e3c; margin: 0 0 8px;">Order Total</p>
          <p style="font-size: 1.1rem; margin: 0;">${amountFormatted}</p>
        </div>
        <p style="font-size: 0.875rem; color: #6b6560;">We'll notify you when your order ships. First drops take 6–8 weeks.</p>
        <p style="font-size: 0.875rem; color: #6b6560;">Questions? Reply to this email or write to <a href="mailto:hello@hana-bi.com" style="color: #8b5e3c;">hello@hana-bi.com</a></p>
        <p style="margin-top: 32px; font-family: serif; font-style: italic; color: #6b6560;">— Hana-Bi Studio</p>
      </div>
    `,
  });
}

export async function POST(request: Request) {
  const webhookSecret = STRIPE_WEBHOOK_SECRET;
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
      console.log(`Payment verified for session: ${session.id}`);
      try {
        await sendOrderConfirmation(session);
      } catch (err) {
        console.error("Failed to send order confirmation email:", err);
      }
    }
  }

  return NextResponse.json({ received: true });
}
