/**
 * Centralized environment variable exports.
 *
 * All process.env accesses for external services live here.
 * Routes validate required vars at request time (not module load)
 * because Next.js static generation runs without runtime secrets.
 */

// Stripe
export const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
export const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;

// Site
export const NEXT_PUBLIC_SITE_URL = process.env.NEXT_PUBLIC_SITE_URL;

// Shopify — optional; app falls back to local data when missing
export const SHOPIFY_STORE_DOMAIN = process.env.SHOPIFY_STORE_DOMAIN;
export const SHOPIFY_STOREFRONT_ACCESS_TOKEN =
  process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN;
export const SHOPIFY_API_VERSION =
  process.env.SHOPIFY_API_VERSION ?? "2025-01";
