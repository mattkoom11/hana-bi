/**
 * Best-effort in-memory rate limiter for API routes.
 *
 * Serverless functions don't share memory across instances/regions, so this
 * is a deterrent, not a hard guarantee under scale-out — the same caveat
 * this codebase already hit once with the old in-memory checkout-verify
 * Set. Good enough to blunt casual brute-forcing/spam on a low-traffic
 * site; swap for a shared store (Vercel KV/Upstash) if traffic grows.
 */
const hits = new Map<string, number[]>();

export function isRateLimited(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const recent = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
  recent.push(now);
  hits.set(key, recent);
  return recent.length > limit;
}

export function getClientIp(request: Request): string {
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) return forwardedFor.split(',')[0].trim();
  return request.headers.get('x-real-ip') ?? 'unknown';
}
