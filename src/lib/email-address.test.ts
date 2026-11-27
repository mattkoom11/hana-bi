import { describe, expect, it } from "vitest";
import { isPlausibleEmail } from "./email-address";

describe("isPlausibleEmail", () => {
  it.each(["a@b.co", "first.last+tag@sub.example.com"])("accepts %s", (v) => {
    expect(isPlausibleEmail(v)).toBe(true);
  });

  it.each([
    "no-at-sign",
    "a@b",
    "a b@c.com",
    "a@b.com, c@d.com",
    "Name <a@b.com>",
    'a"@b.com',
    "a@b.com\nBcc: c@d.com",
    `${"a".repeat(250)}@b.com`,
    42,
    undefined,
  ])("rejects %s", (v) => {
    expect(isPlausibleEmail(v)).toBe(false);
  });
});
