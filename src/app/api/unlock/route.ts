import { NextRequest, NextResponse } from 'next/server';

const COOKIE = 'hb-access';

export async function POST(request: NextRequest) {
  const { password } = await request.json();
  const correct = process.env.SITE_PASSWORD;

  if (!correct || password !== correct) {
    return NextResponse.json({ error: 'Incorrect password' }, { status: 401 });
  }

  const from = request.nextUrl.searchParams.get('from') ?? '/';
  const response = NextResponse.redirect(new URL(from, request.url));

  response.cookies.set(COOKIE, correct, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });

  return response;
}
