import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { STRIPE_SECRET_KEY } from '@/lib/env';

let _stripe: Stripe | null = null;
function getStripe(): Stripe {
  if (_stripe) return _stripe;
  if (!STRIPE_SECRET_KEY) throw new Error('STRIPE_SECRET_KEY is not set');
  _stripe = new Stripe(STRIPE_SECRET_KEY, { apiVersion: '2025-12-15.clover', typescript: true });
  return _stripe;
}

export async function GET(request: NextRequest) {
  const sessionId = request.nextUrl.searchParams.get('session_id');

  if (!sessionId || !sessionId.startsWith('cs_')) {
    return NextResponse.json({ verified: false, error: 'Invalid session_id' }, { status: 400 });
  }

  if (!STRIPE_SECRET_KEY) {
    return NextResponse.json({ verified: false, error: 'Server configuration error' }, { status: 500 });
  }

  try {
    const stripe = getStripe();
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    const verified = session.payment_status === 'paid';
    return NextResponse.json({ verified });
  } catch (error) {
    console.error('Session verification error:', error);
    return NextResponse.json({ verified: false }, { status: 200 });
  }
}
