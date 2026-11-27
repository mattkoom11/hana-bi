// Redirect targets that come from the client must resolve to our own origin.
// Prefix checks are not enough: "/\evil.com" passes startsWith("/") and the URL parser
// reads it as "//evil.com"; "https://site.com.evil.com" passes startsWith("https://site.com").
// So: parse first, then compare origins.

/**
 * An absolute same-origin URL for `raw` (resolved against `base`), or `fallbackPath` on that
 * origin. Returns the full href on purpose: returning only the path and resolving it again
 * later is unsafe, because normalisation can turn "/.//evil.com" into the path "//evil.com",
 * which a second resolution reads as protocol-relative. Redirect to the returned value as is.
 */
export function sameOriginHref(raw: string | null | undefined, base: string, fallbackPath = "/"): string {
  const origin = new URL(base).origin;
  const fallback = new URL(fallbackPath, origin).href;
  if (!raw) return fallback;
  try {
    const url = new URL(raw, origin);
    return url.origin === origin ? url.href : fallback;
  } catch {
    return fallback;
  }
}

/** An absolute URL on `siteUrl`'s origin for `raw`, or `fallback`. */
export function sameOriginUrl(raw: string | null | undefined, siteUrl: string, fallback: string): string {
  if (!raw) return fallback;
  try {
    const origin = new URL(siteUrl).origin;
    const url = new URL(raw);
    return url.origin === origin ? url.href : fallback;
  } catch {
    return fallback;
  }
}
