import type { NextConfig } from "next";

// Everything the app actually loads is same-origin: fonts are self-hosted via
// next/font, product/carousel images are proxied server-side through
// /_next/image (the browser never fetches images.unsplash.com/cdn.shopify.com/
// files.stripe.com directly), checkout is a full-page redirect to Stripe
// rather than an embedded frame, and Spline/@stripe/stripe-js are installed
// but currently unused anywhere in the app. So the policy below only needs
// 'self' plus the couple of narrow exceptions noted inline.
const isDev = process.env.NODE_ENV !== "production";

const csp = [
  "default-src 'self'",
  // Next.js dev (Fast Refresh) needs 'unsafe-eval'; production does not.
  `script-src 'self'${isDev ? " 'unsafe-eval'" : ""}`,
  // Framer Motion and this codebase's own inline `style={{}}` usage rely on
  // inline styles — a nonce-based style-src would require plumbing a nonce
  // through every component, which is out of scope here.
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data:",
  "font-src 'self' data:",
  "connect-src 'self'",
  "media-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-src 'none'",
  "frame-ancestors 'self'",
  "upgrade-insecure-requests",
].join("; ");

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
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "Content-Security-Policy", value: csp },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ];
  },
};

export default nextConfig;
