import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
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
      // Add your custom image hostname here if hosting images externally
      // Example:
      // {
      //   protocol: "https",
      //   hostname: "your-cdn.com",
      // },
    ],
  },
};

export default nextConfig;
