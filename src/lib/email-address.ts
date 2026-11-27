/**
 * One plain address: something@domain.tld, no spaces, angle brackets, commas or quotes
 * (which could smuggle extra recipients or display names), within RFC 5321's 254 characters.
 */
export function isPlausibleEmail(value: unknown): value is string {
  if (typeof value !== "string" || value.length > 254) return false;
  return /^[^\s@<>,;:"'()[\]\\]+@[^\s@<>,;:"'()[\]\\]+\.[a-z]{2,}$/i.test(value);
}
