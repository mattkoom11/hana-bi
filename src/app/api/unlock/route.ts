import { NextRequest, NextResponse } from 'next/server';
import { SITE_PASSWORD } from '@/lib/env';
import { deriveAccessToken, SITE_LOCK_COOKIE } from '@/lib/site-lock';
import { getClientIp, isRateLimited } from '@/lib/rate-limit';

export async function POST(request: NextRequest) {
  if (isRateLimited(`unlock:${getClientIp(request)}`, 5, 10 * 60 * 1000)) {
    return NextResponse.json({ error: 'Too many attempts. Try again later.' }, { status: 429 });
  }

  const { password } = await request.json();
  const correct = SITE_PASSWORD;

  if (!correct || password !== correct) {
    return NextResponse.json({ error: 'Incorrect password' }, { status: 401 });
  }

  const raw = request.nextUrl.searchParams.get('from') ?? '/';
  const from = raw.startsWith('/') && !raw.startsWith('//') ? raw : '/';
  const response = NextResponse.redirect(new URL(from, request.url));

  response.cookies.set(SITE_LOCK_COOKIE, await deriveAccessToken(correct), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });

  return response;
}
