/**
 * Site-lock access token.
 *
 * The unlock cookie used to store the raw site password itself, so anyone
 * with access to the cookie jar (devtools, a shared machine, a logging
 * proxy) could read the actual secret. This derives an opaque HMAC-SHA256
 * token from the password instead — verifiable by recomputing it from the
 * current SITE_PASSWORD, but never itself a usable credential.
 *
 * Uses Web Crypto (not Node's `crypto` module) so the same function works
 * whether it runs in the Node.js unlock API route or an Edge-capable proxy.
 */
const TOKEN_CONTEXT = 'hana-bi-site-lock-v1';

export const SITE_LOCK_COOKIE = 'hb-access';

function toHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export async function deriveAccessToken(password: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(password),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const signature = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(TOKEN_CONTEXT));
  return toHex(signature);
}
