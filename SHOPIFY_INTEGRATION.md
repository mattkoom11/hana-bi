# Shopify Storefront API Integration

This document explains how the Hana-Bi storefront integrates with Shopify Storefront API.

## Overview

The app uses Shopify Storefront API as the source of truth for:
- Product data (titles, descriptions, images, variants, pricing)
- Product availability and status
- Checkout creation and redirect

The frontend maintains a local cart (Zustand) for UX, then redirects to Shopify-hosted checkout for payment.

## Setup

### 1. Environment Variables

Create a `.env.local` file in the project root with:

```env
SHOPIFY_STORE_DOMAIN=your-store.myshopify.com
SHOPIFY_STOREFRONT_ACCESS_TOKEN=your_token_here
SHOPIFY_API_VERSION=2025-01
```

**Getting your Storefront API token:**
1. Go to Shopify Admin → Settings → Apps and sales channels
2. Click "Develop apps" → Create an app (or use existing)
3. Configure Storefront API scopes (read products, write checkouts)
4. Install the app and copy the Storefront API access token

### 2. Shopify Metafields (Recommended)

To fully support Hana-Bi's editorial fields, set up these metafields in Shopify:

**Namespace:** `hana_bi`

- `story` (single_line_text_field) - Editorial product story
- `materials` (single_line_text_field) - Fabric and materials description
- `care` (single_line_text_field) - Care instructions
- `year` (number_integer) - Production year
- `notes` (single_line_text_field) - Internal notes or edition info
- `collection` (single_line_text_field) - Collection name (e.g., "Runway 01")
- `status` (single_line_text_field) - "available", "sold_out", or "archived"

**To set up metafields:**
1. Shopify Admin → Settings → Custom data → Products
2. Add metafield definitions with namespace `hana_bi` and keys above
3. Fill in metafields for each product

**Alternative:** If metafields aren't set up, the mapper will:
- Use product tags for status detection (`ARCHIVE`, `SOLD_OUT`, `FEATURED`)
- Use product description for story
- Use collection titles for collection names
- Default year to current year

## Architecture

### Core Files

- **`lib/shopify.ts`** - GraphQL client and query functions
  - `shopifyFetch<T>()` - Generic GraphQL fetcher
  - `getAllProducts()` - Fetch all products
  - `getProductByHandle()` - Fetch single product
  - `getCollectionProducts()` - Fetch products from collection
  - `createCheckout()` - Create checkout with line items

- **`lib/shopify-mappers.ts`** - Data transformation
  - `mapShopifyProductToHanaBiProduct()` - Convert Shopify → Hana-Bi format
  - `findVariantIdBySize()` - Match size selection to variant ID
  - Status detection from metafields/tags/availability

### Pages

All pages are **async server components** that fetch from Shopify:

- **`app/shop/page.tsx`** - Fetches all products, filters by availability
- **`app/product/[slug]/page.tsx`** - Fetches single product by handle
- **`app/archive/page.tsx`** - Fetches archived/sold-out products
- **`app/page.tsx`** - Fetches featured products and archive preview

**Fallback behavior:** If Shopify fetch fails, pages fall back to local data in `/data/products.ts` (useful for development).

### Cart & Checkout

- **Cart Store** (`store/cart.ts`) - Zustand store with:
  - `variantId` and `productId` stored per item
  - Local cart management (add, remove, update quantity)

- **Checkout Flow:**
  1. User clicks "Checkout" in cart drawer or cart page
  2. Client calls `/api/shopify/checkout` (or server action)
  3. Server creates Shopify checkout via `createCheckout()`
  4. Returns checkout URL
  5. Client redirects to Shopify-hosted checkout

**Checkout Implementation:**
- **Server Action:** `app/actions/checkout.ts` (preferred)
- **API Route:** `app/api/shopify/checkout/route.ts` (alternative)

Both implementations are provided. The cart components currently use the API route, but you can switch to server actions if preferred.

## Customization

### Collections

The app looks for these collection handles:
- `"featured"` - Featured products on home page
- `"archive"` - Archived products

**To customize:**
- Edit `getCollectionProducts()` calls in:
  - `app/page.tsx` (line 29)
  - `app/archive/page.tsx` (line 23)

### Status Detection

Product status is determined by:
1. Metafield `hana_bi.status` (if set)
2. Tags: `ARCHIVE` → archived, `SOLD_OUT` → sold_out
3. `availableForSale` field from Shopify

**To customize:** Edit `determineStatus()` in `lib/shopify-mappers.ts`

### Variant Size Matching

The mapper extracts sizes from variant `selectedOptions` where `name === "Size"`.

**If your variants use different option names:**
- Edit `extractSizes()` and `findVariantIdBySize()` in `lib/shopify-mappers.ts`

## Testing

### Without Shopify

The app will fall back to local data if:
- Environment variables are missing
- Shopify API returns errors
- Network requests fail

Check console warnings to see when fallback is used.

### With Shopify

1. Set up `.env.local` with your credentials
2. Ensure products exist in Shopify
3. (Optional) Set up metafields for full editorial content
4. Test checkout flow (creates real Shopify checkout)

## Future Enhancements

- **Checkout persistence:** Store `checkoutId` in cookies/localStorage to allow updating existing checkouts
- **Product pagination:** Extend `getAllProducts()` with cursor-based pagination
- **Collection filtering:** Add collection filter to shop page
- **Inventory sync:** Show real-time inventory counts from Shopify
- **Webhooks:** Handle order updates from Shopify

## Troubleshooting

**"Shopify credentials not configured"**
- Check `.env.local` exists and has correct variable names
- Restart dev server after adding env vars

**"Could not find variant ID for size"**
- Verify variant option names match expected format
- Check `findVariantIdBySize()` logic in mapper

**Checkout fails**
- Ensure Storefront API token has `write_checkouts` scope
- Verify variant IDs are valid Shopify variant IDs
- Check browser console for error details

**Products not showing**
- Check Shopify store has products published
- Verify collection handles match (if using collections)
- Check browser console for GraphQL errors
