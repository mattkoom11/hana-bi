"use client";

import { usePathname } from "next/navigation";

export type HeaderTheme = "dark" | "light";

export function useHeaderTheme(): HeaderTheme {
  const pathname = usePathname();
  const lightPaths = ["/about", "/projects", "/archive"];
  const isLight = lightPaths.some(
    (p) => pathname === p || pathname.startsWith(p + "/")
  );
  return isLight ? "light" : "dark";
}
