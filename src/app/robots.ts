import type { MetadataRoute } from "next";
import { NEXT_PUBLIC_SITE_URL } from "@/lib/env";

const BASE_URL = NEXT_PUBLIC_SITE_URL ?? "https://hanabiny.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/"],
    },
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
