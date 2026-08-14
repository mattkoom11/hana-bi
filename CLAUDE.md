![1775685678005](image/CLAUDE/1775685678005.png)# Hana-Bi — Claude Project Context

## What This Is

Hana-Bi is a sustainable denim brand website built with Next.js 15 App Router. It functions as both a storefront and a personal project portfolio. The aesthetic is editorial — Japanese fashion magazine-inspired, with hand-drawn SVG borders, ink underlines, paper textures, and archival typography.

## Tech Stack

- **Framework:** Next.js 15 App Router (TypeScript)
- **Styling:** Tailwind CSS with custom CSS variables (see `globals.css`)
- **Payments:** Stripe (Checkout Sessions, webhooks)
- **Email:** Resend
- **Cart:** Zustand (client-side, persisted locally)
- **Animations:** Framer Motion
- **Package manager:** npm

## Key Architecture Decisions

### Stripe as Product Source of Truth
- All shop products come from Stripe Dashboard via `src/lib/stripe-catalog.ts`
- `getStripeCatalog()` uses `for await` autopaging — fetches all products regardless of catalog size
- Falls back to `src/data/products.ts` local data if `STRIPE_SECRET_KEY` is missing
- Product metadata keys in Stripe: `slug`, `status`, `sizes`, `collection`, `year`, `story`, `materials`, `care`, `notes`, `featured`, `tags`, `sold_sizes`
- `sold_sizes` = comma-separated sizes that are sold out per product (e.g. `XS,S`)

### Checkout Flow
- Client POSTs `{ items: [{ priceId, quantity }] }` to `/api/checkout`
- Server creates Stripe Checkout Session with `shipping_address_collection`
- Success page polls `/api/checkout/verify` which calls `stripe.checkout.sessions.retrieve()` directly — no in-memory state
- Webhook at `/api/webhooks/stripe` sends branded order confirmation email via Resend on `checkout.session.completed`

### Session Verification
- Previously used an in-memory `Set` (broken in serverless) — now calls Stripe API directly in `/api/checkout/verify/route.ts`

### Waitlist / Email Capture
- `/api/waitlist` route handles the Layered Denim email capture form
- Sends confirmation to subscriber + notification to `WAITLIST_NOTIFY_EMAIL` via Resend
- `EmailCaptureForm` component in `src/components/layered-denim/`

## Environment Variables

```env
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
NEXT_PUBLIC_SITE_URL=http://localhost:3000        # must be real domain in production
STRIPE_WEBHOOK_SECRET=whsec_...                  # from stripe listen or Dashboard
STRIPE_SHIPPING_COUNTRIES=US,CA,GB,JP,AU         # optional, comma-separated ISO codes
STRIPE_SHIPPING_RATE_IDS=shr_...                 # optional, comma-separated Stripe rate IDs
RESEND_API_KEY=re_...
WAITLIST_NOTIFY_EMAIL=hello@hana-bi.com
```

## Routes

| Route | Type | Purpose |
|-------|------|---------|
| `/` | Static | Homepage — hero, philosophy panels, featured products, archive strip |
| `/shop` | Static | Full product grid with filters |
| `/product/[slug]` | SSG | Product detail — images, story, materials, purchase panel |
| `/archive` | Static | Sold-out/archived Stripe products grouped by year |
| `/projects` | Static | Personal sewing projects (not for sale) |
| `/projects/[slug]` | SSG | Project detail — gallery with lightbox, story, fabric |
| `/about` | Static | Brand story with tilt-card chapters |
| `/cart` | Client | Cart page |
| `/success` | Client | Post-checkout confirmation, polls verify endpoint |
| `/layered-denim` | Static | Upcoming drop landing page with waitlist form |
| `/api/checkout` | Dynamic | Creates Stripe Checkout Session |
| `/api/checkout/verify` | Dynamic | Verifies payment via Stripe API |
| `/api/webhooks/stripe` | Dynamic | Handles Stripe webhook events |
| `/api/waitlist` | Dynamic | Handles waitlist form submissions |

## Data Files

### `src/data/products.ts`
Local fallback product data. Only used when Stripe is not configured. `Product` type is the shared interface for both Stripe and fallback products.

### `src/data/projects.ts`
Personal sewing projects data — separate from shop products. Fields: `id`, `slug`, `name`, `status`, `description`, `story`, `fabric?`, `heroImage`, `images[]`, `year`. No Stripe integration — fully local.

**Project statuses:** `in_progress` | `completed` | `on_hold` | `planning`

**Media:** Stored in `public/projects/<project-name>-media/` as `.jpg` files. Use root-relative paths (e.g. `/projects/wool-trousers-media/wool-trousers-hero.jpg`).

**Note:** `.avif` files exported from iPhone/Mac are actually HEIF encoded and won't display in browsers. Convert with ImageMagick: `magick input.avif output.jpg`

## Navigation Order

Home → Shop → Archive → Projects → About

## Page Purposes (important distinction)
- **Shop** — current available products for purchase (from Stripe)
- **Archive** — past retail drops that are sold out or archived (from Stripe, filtered by status)
- **Projects** — personal pre-retail builds and experiments (local data, not for sale)

## Key Components

| Component | Purpose |
|-----------|---------|
| `src/components/common/TiltCard.tsx` | Mouse-tracking 3D perspective tilt — used on About page chapter cards |
| `src/components/common/ImageLightbox.tsx` | Full-screen image viewer with keyboard nav (Esc, ←, →) |
| `src/components/projects/ProjectGallery.tsx` | Client component — hero + thumbnails with lightbox integration |
| `src/components/about/ChapterCards.tsx` | Origin/Process/Future Drops cards with tilt effect |
| `src/components/cart/CartDrawer.tsx` | Slide-in cart drawer |
| `src/components/shop/AddToCartButton.tsx` | Checks `status === 'available'` AND `soldSizes` before allowing add |
| `src/lib/stripe-catalog.ts` | Fetches + maps Stripe products to `Product` type |
| `src/lib/env.ts` | Centralised env var exports |

## Deployment Checklist (before going live)

- [ ] Update `NEXT_PUBLIC_SITE_URL` to real domain
- [ ] Set `STRIPE_WEBHOOK_SECRET` to production webhook secret (not CLI)
- [ ] Update Resend `from:` address from `onboarding@resend.dev` to verified domain sender in:
  - `src/app/api/waitlist/route.ts`
  - `src/app/api/webhooks/stripe/route.ts`
- [ ] Add `public/og-default.jpg` (1200×630px) for social sharing previews
- [ ] Switch Stripe from test mode (`sk_test_`) to live (`sk_live_`)

## Known Limitations / Future Work

- Webhook handler sends order confirmation email but has no order tracking/fulfillment system
- Per-size inventory is managed manually via `sold_sizes` Stripe metadata — no automatic decrement
- Catalog pagination is handled but >100 products have never been tested
- Projects data is hardcoded — no CMS

## Design constraints (Hana-Bi "subtraction pass")

Standing rules from a completed redesign, being implemented screen-by-screen per `design/README.md`. These apply to every future change to the site's UI, not just that implementation pass.

### The register

Hana-Bi documents garments the way a museum catalogues objects. The site should read as a printed archive: hairline rules, generous whitespace, numbered records, tabular figures. It should not read as an e-commerce template.

When in doubt, remove. This system was arrived at by subtraction, and the most likely way to damage it is to add.

### Typography — three families, no more

| Variable | Family | Used for |
|---|---|---|
| `--hb-font-display` | Spectral, italic, weight 300 | Every headline, every garment name |
| `--hb-font-sans` | Inter | Body copy only |
| `--hb-font-mono` | DM Mono, weight 300 | All-caps micro-labels, prices, catalogue numbers, buttons, nav |

Cormorant Garamond and Kalam were cut. `--hb-font-script`, `--hb-font-serif` and `--hb-font-kanji` are aliases onto Spectral and exist only so older components resolve; do not introduce new uses. Never add a fourth family.

Display type is **always** italic at weight 300. There is no upright display style in this system.

Mono labels are **always** uppercase, and tracking grows as the label shrinks — `--hb-track-catalog` (0.55em) at 0.55rem, `--hb-track-meta` (0.3em) at 0.65rem, `--hb-track-nav` (0.4em) at 0.75rem. A mono label without letter-spacing is a bug.

### Colour

- Dark is the site's default mode: `--hb-dark` #0e0c0b over video, `--hb-dark-surface` #171310 for raised panels.
- Paper is the second mode: `--hb-paper` #faf8f4, `--hb-paper-muted` #f5f2ed.
- Two background systems total. Do not add a third.
- `--hb-sienna` #9a7a5a is reserved for catalogue metadata, eyebrows, and the single primary action per view. It is not a general accent — if sienna appears three times on a screen, two of them are wrong.
- Hairlines only: `--hb-dark-border` is `rgba(250,248,244,0.08)`, `--hb-border` is #d4ccc0. Never a heavier rule.
- Status is communicated by desaturating the garment image (`filter: grayscale(1)`), not by a coloured badge.

### Geometry

Square. `border-radius: 0` everywhere except `Badge` (2px) and `Tag` (pill). No rounded cards.

Shadows are essentially absent — only `--hb-shadow-drawer` on the cart drawer's left edge. Do not add elevation to convey hierarchy; use rules and space.

### Motion — two systems

1. **Video crossfade.** 8s minimum per clip, 2s crossfade, two stacked `<video>` elements, next clip preloaded into the idle one.
2. **Scroll-driven objects.** `ScrollStage` pins a viewport and drives content from scroll progress; `TurntableObject` turns a pattern piece.

Everything else is a plain CSS transition on `opacity` / `transform` / `border-color`, 300–700ms, `--hb-ease-expo-out` (`cubic-bezier(0.23, 1, 0.32, 1)`). Not to be reintroduced: 3D tilt, parallax layers, depth layers, particle canvases, spotlight cursors, character-morphing headlines.

Respect `prefers-reduced-motion` — the token file already ships the media query.

### Component rules

- **Lists of records** (archive, catalogue, construction pieces) are `CatalogueIndex`-style: numbered rows, type only, hairline `border-top` per row and one closing rule, imagery revealed on hover in a fixed plate. Non-hovered rows drop to `opacity: 0.45`; the hovered row shifts `padding-left: 1rem` over 450ms.
- **Things you can buy** are a grid: 4:5 image, catalogue number, name, one meta line. This distinction between index and grid is deliberate — do not unify them.
- **No per-row fills.** Rows are separated by rules, never by alternating or filled backgrounds.
- **Filters are visible chips**, never `<select>` dropdowns. Every option on screen.
- **One filled element per view** — the primary action. Everything else is a rule, a hairline border, or bare text.
- Catalogue numbers come from the product record (`product.catalogNumber`), never from array position. A number is an identity; it must not change when a filter does.
- Minimum hit target 44px on any touch surface (`--hb-touch-min`).

### Copy

Matter-of-fact, specific, no marketing voice. Garment facts over adjectives — "Cut 2 self · 44.24 × 14.05 in" is the house style. Sentence case in prose; uppercase only in mono labels. Never exclamation marks, never emoji.

Empty states are a display-italic line, not a boxed panel with an icon: "Nothing yet." followed by two text links.

### Dead components

Cut in this pass — delete once nothing imports them: `KanjiCanvas`, `Tilt3DStage`, `DepthLayer`, `ParallaxLayer`, `CulturalExplainer`, `MorphingKanji`, `TiltCard`, and the Archive `Index`/`Wall` toggle. `RollText` stays (still used by `SiteHeader` nav). `SketchFrame` is no longer used by Archive but survives elsewhere; check imports before deleting.

### Open question

The hand-drawn SVG ornaments — `InkUnderline`, `HandDrawnDivider`, `HandDrawnBorder`, `ScribbleArrow`, `ScribbleUnderline`, `RoughBorderCard` — still run on paper surfaces and were never subtraction-tested. They are currently kept. If they are ever cut, cut them all at once: a system with one surviving hand-drawn flourish reads as an accident.

Full specs, tokens and per-screen implementation notes: `design/`.
