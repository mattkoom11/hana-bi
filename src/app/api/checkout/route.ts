// src/app/api/checkout/route.ts
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { STRIPE_SECRET_KEY, NEXT_PUBLIC_SITE_URL, STRIPE_SHIPPING_RATE_IDS, STRIPE_SHIPPING_COUNTRIES } from '@/lib/env';
import { getStripeCatalog } from '@/lib/stripe-catalog';
import { validateCheckoutItems, type CheckoutLineItem } from '@/lib/checkout-validation';
import { getClientIp, isRateLimited } from '@/lib/rate-limit';

export interface CheckoutRequestBody {
  items: CheckoutLineItem[];
  cancelUrl?: string;
}

let _stripe: Stripe | null = null;
function getStripe(): Stripe {
  if (_stripe) return _stripe;
  if (!STRIPE_SECRET_KEY) throw new Error('STRIPE_SECRET_KEY is not set');
  _stripe = new Stripe(STRIPE_SECRET_KEY, { apiVersion: '2025-12-15.clover', typescript: true });
  return _stripe;
}

export async function POST(request: NextRequest) {
  if (!STRIPE_SECRET_KEY) {
    return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
  }
  if (!NEXT_PUBLIC_SITE_URL) {
    return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
  }
  if (isRateLimited(`checkout:${getClientIp(request)}`, 20, 10 * 60 * 1000)) {
    return NextResponse.json({ error: 'Too many checkout attempts. Try again shortly.' }, { status: 429 });
  }

  let body: CheckoutRequestBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  try {
    // Price, availability and size all come from Stripe's live catalog —
    // never from the client, whose cart lives in editable localStorage.
    const validation = validateCheckoutItems(body.items, await getStripeCatalog());
    if (!validation.ok) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const stripe = getStripe();
    const siteUrl = NEXT_PUBLIC_SITE_URL;

    const rawCancelUrl = body.cancelUrl;
    const cancelUrl =
      rawCancelUrl && rawCancelUrl.startsWith(siteUrl)
        ? rawCancelUrl
        : `${siteUrl}/cart`;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: validation.lineItems,
      // Sizes live here: shown on the session and the payment in the Stripe
      // Dashboard, and read back by the webhook for the confirmation email.
      metadata: validation.metadata,
      payment_intent_data: { metadata: validation.metadata },
      mode: 'payment',
      shipping_address_collection: {
        allowed_countries: STRIPE_SHIPPING_COUNTRIES.split(',').map((c) => c.trim()) as Stripe.Checkout.SessionCreateParams.ShippingAddressCollection.AllowedCountry[],
      },
      ...(STRIPE_SHIPPING_RATE_IDS
        ? {
            shipping_options: STRIPE_SHIPPING_RATE_IDS.split(',')
              .map((id) => id.trim())
              .filter(Boolean)
              .map((shipping_rate) => ({ shipping_rate })),
          }
        : {}),
      success_url: `${siteUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    // Stripe's own messages can expose account details; log them, don't return them.
    console.error('Stripe checkout error:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session. Please try again.' },
      { status: 500 }
    );
  }
}
