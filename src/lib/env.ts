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
