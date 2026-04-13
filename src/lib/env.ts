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

// Shipping
// Comma-separated Stripe shipping rate IDs, e.g. shr_xxx,shr_yyy
// Leave unset to collect address only with no shipping rate applied.
export const STRIPE_SHIPPING_RATE_IDS = process.env.STRIPE_SHIPPING_RATE_IDS;
// Comma-separated ISO 3166-1 alpha-2 country codes allowed for shipping
export const STRIPE_SHIPPING_COUNTRIES = process.env.STRIPE_SHIPPING_COUNTRIES ?? 'US,CA,GB,JP,AU';

// Email (Resend)
export const RESEND_API_KEY = process.env.RESEND_API_KEY;
// Address that receives waitlist notification emails
export const WAITLIST_NOTIFY_EMAIL = process.env.WAITLIST_NOTIFY_EMAIL;
// Resend audience ID for tracking waitlist signups
export const RESEND_AUDIENCE_ID = process.env.RESEND_AUDIENCE_ID;

// Site lock — set to enable password gate
export const SITE_PASSWORD = process.env.SITE_PASSWORD;
