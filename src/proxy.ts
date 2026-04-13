import { NextRequest, NextResponse } from 'next/server';

const COOKIE = 'hb-access';

// Paths that bypass the lock
const PUBLIC_PATHS = [
  '/locked',
  '/api/unlock',
  '/api/waitlist',
  '/_next',
  '/favicon.ico',
  '/robots.txt',
  '/sitemap.xml',
];

export function proxy(request: NextRequest) {
  const password = process.env.SITE_PASSWORD;

  // No password set — site is open
  if (!password) return NextResponse.next();

  const { pathname } = request.nextUrl;

  // Allow public paths through
  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  // Allow through if valid access cookie is present
  const cookie = request.cookies.get(COOKIE);
  if (cookie?.value === password) return NextResponse.next();

  // Otherwise redirect to locked page
  const url = request.nextUrl.clone();
  url.pathname = '/locked';
  url.searchParams.set('from', pathname);
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
