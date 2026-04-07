// src/app/api/checkout/route.ts
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { STRIPE_SECRET_KEY, NEXT_PUBLIC_SITE_URL } from '@/lib/env';

export interface CheckoutLineItem {
  priceId: string;
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
    if (!item.priceId || typeof item.priceId !== 'string' || !item.priceId.startsWith('price_')) {
      return NextResponse.json({ error: 'Invalid price ID' }, { status: 400 });
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
      line_items: body.items.map((item) => ({
        price: item.priceId,
        quantity: item.quantity,
      })),
      mode: 'payment',
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
