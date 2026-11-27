import { describe, expect, it } from "vitest";
import { sameOriginHref, sameOriginUrl } from "./safe-url";

const BASE = "https://site.test/api/unlock?from=x";

describe("sameOriginHref", () => {
  const ORIGIN = "https://site.test";

  it("keeps ordinary paths, with query and hash, as absolute URLs", () => {
    expect(sameOriginHref("/atelier?size=30#fit", BASE)).toBe("https://site.test/atelier?size=30#fit");
  });

  const ATTACKS = [
    "//evil.com",
    "/\\evil.com",
    "/\\/evil.com",
    "https://evil.com/",
    "javascript:alert(1)",
    "https://site.test.evil.com/",
    "https://site.test@evil.com/",
    // Dot segments normalise to a "//evil.com" path: safe only if never re-resolved.
    "/.//evil.com",
    "/./\\evil.com",
    "/a/..//evil.com",
    "/%2e//evil.com",
    "/..//evil.com",
    "/\tevil.com",
    "/%2F%2Fevil.com",
  ];

  it.each(ATTACKS)("never leaves the origin for %s, even when resolved again", (raw) => {
    const href = sameOriginHref(raw, BASE);
    expect(new URL(href).origin).toBe(ORIGIN);
    // A redirect layer that resolves the value once more must land on our origin too.
    expect(new URL(href, BASE).origin).toBe(ORIGIN);
  });

  it("falls back for foreign targets", () => {
    expect(sameOriginHref("//evil.com", BASE)).toBe("https://site.test/");
    expect(sameOriginHref("https://evil.com", BASE, "/home")).toBe("https://site.test/home");
  });

  it("falls back when empty", () => {
    expect(sameOriginHref(null, BASE)).toBe("https://site.test/");
  });
});

describe("sameOriginUrl", () => {
  const SITE = "https://site.test";
  const FALLBACK = "https://site.test/atelier";

  it("keeps URLs on the site", () => {
    expect(sameOriginUrl("https://site.test/atelier/night-trouser", SITE, FALLBACK)).toBe("https://site.test/atelier/night-trouser");
  });

  it.each([
    "https://site.test.evil.com/cart",
    "https://site.test@evil.com/cart",
    "http://site.test/cart", // scheme is part of the origin
    "https://evil.com/?https://site.test",
    "/cart", // relative: not an absolute URL
    "not a url",
  ])("rejects %s", (raw) => {
    expect(sameOriginUrl(raw, SITE, FALLBACK)).toBe(FALLBACK);
  });
});
