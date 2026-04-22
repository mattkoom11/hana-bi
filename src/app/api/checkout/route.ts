// src/app/api/checkout/route.ts
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { STRIPE_SECRET_KEY, NEXT_PUBLIC_SITE_URL, STRIPE_SHIPPING_RATE_IDS, STRIPE_SHIPPING_COUNTRIES } from '@/lib/env';

export interface CheckoutLineItem {
  priceId?: string;
  name?: string;
  price?: number; // in cents
  quantity: number;
}

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

  let body: CheckoutRequestBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  if (!body.items || body.items.length === 0) {
    return NextResponse.json({ error: 'Cart is empty' }, { status: 400 });
  }

  for (const item of body.items) {
    const hasPriceId = item.priceId && typeof item.priceId === 'string' && item.priceId.startsWith('price_');
    const hasPriceData = item.name && typeof item.name === 'string' && typeof item.price === 'number' && item.price > 0;
    if (!hasPriceId && !hasPriceData) {
      return NextResponse.json({ error: 'Each item needs a valid priceId or name+price' }, { status: 400 });
    }
    if (typeof item.quantity !== 'number' || !Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > 1000) {
      return NextResponse.json({ error: 'Invalid item quantity' }, { status: 400 });
    }
  }

  try {
    const stripe = getStripe();
    const siteUrl = NEXT_PUBLIC_SITE_URL;

    const rawCancelUrl = body.cancelUrl;
    const cancelUrl =
      rawCancelUrl && rawCancelUrl.startsWith(siteUrl)
        ? rawCancelUrl
        : `${siteUrl}/cart`;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: body.items.map((item) =>
        item.priceId
          ? { price: item.priceId, quantity: item.quantity }
          : {
              price_data: {
                currency: 'usd',
                unit_amount: item.price!,
                product_data: { name: item.name! },
              },
              quantity: item.quantity,
            }
      ),
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
    console.error('Stripe checkout error:', error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Failed to create checkout session. Please try again.',
      },
      { status: 500 }
    );
  }
}
