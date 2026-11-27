import { NextRequest, NextResponse } from 'next/server';
import { SITE_PASSWORD } from '@/lib/env';
import { deriveAccessToken, SITE_LOCK_COOKIE } from '@/lib/site-lock';
import { getClientIp, isRateLimited } from '@/lib/rate-limit';
import { sameOriginHref } from '@/lib/safe-url';

const MIN_PASSWORD_LENGTH = 20;
let warnedWeak = false;

export async function POST(request: NextRequest) {
  if (isRateLimited(`unlock:${getClientIp(request)}`, 5, 10 * 60 * 1000)) {
    return NextResponse.json({ error: 'Too many attempts. Try again later.' }, { status: 429 });
  }

  const { password } = await request.json();
  const correct = SITE_PASSWORD;
  // Strength is the real brute-force defence (the limiter is per instance). Warn only: failing
  // closed here would lock everyone out of the live site if the current password is short.
  if (correct && correct.length < MIN_PASSWORD_LENGTH && !warnedWeak) {
    warnedWeak = true;
    console.warn(`[unlock] SITE_PASSWORD is shorter than ${MIN_PASSWORD_LENGTH} characters; use a long random one.`);
  }

  if (!correct || password !== correct) {
    return NextResponse.json({ error: 'Incorrect password' }, { status: 401 });
  }

  // `from` rides in the lock-screen link, so it is attacker-controllable. A prefix check let
  // "/\evil.com" through (parsed as //evil.com), and the 307 then re-POSTed the password there.
  // Now: resolved once, kept only on this origin, redirected to exactly as returned, with a 303
  // so the browser follows with a GET and never re-sends the password.
  const target = sameOriginHref(request.nextUrl.searchParams.get('from'), request.url);
  const response = NextResponse.redirect(target, 303);

  response.cookies.set(SITE_LOCK_COOKIE, await deriveAccessToken(correct), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });

  return response;
}
