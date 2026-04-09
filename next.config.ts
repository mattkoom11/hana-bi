import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@splinetool/react-spline", "@splinetool/runtime"],
  experimental: {
    serverSourceMaps: false,
  },
  images: {
    dangerouslyAllowSVG: false,
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      // Shopify CDN - automatically includes when using Shopify products
      {
        protocol: "https",
        hostname: "cdn.shopify.com",
      },
      {
        protocol: "https",
        hostname: "files.stripe.com",
      },
    ],
  },
};

export default nextConfig;
