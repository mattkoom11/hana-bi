// Password gate — controlled entirely by the SITE_PASSWORD environment variable.
// To open the site to the public: remove SITE_PASSWORD from Vercel env vars.
// To re-enable: add SITE_PASSWORD back to Vercel env vars (no code change needed).
export { proxy as middleware, config } from '@/proxy';
