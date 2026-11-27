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

/**
 * The caller's IP, from headers the hosting platform sets rather than ones the client can.
 * The first X-Forwarded-For entry is whatever the client sent, so it is never used: prefer
 * x-real-ip (set by Vercel), else the last X-Forwarded-For hop (appended by the nearest proxy).
 */
export function getClientIp(request: Request): string {
  const realIp = request.headers.get('x-real-ip');
  if (realIp) return realIp.trim();
  const hops = request.headers.get('x-forwarded-for')?.split(',').map((h) => h.trim()).filter(Boolean);
  return hops?.at(-1) ?? 'unknown';
}
