# Image Replacement Guide

This guide explains how to replace the placeholder Unsplash images with your own product photos.

## Overview

The Hana-Bi project uses images in two ways:
1. **Shopify Storefront API** (production) - Images come from Shopify's CDN
2. **Fallback data** (`src/data/products.ts`) - Uses local data with image URLs

---

## Option 1: Using Shopify (Recommended for Production)

### How It Works
When Shopify is configured, product images automatically come from your Shopify store's media library. No code changes needed!

### Steps to Upload Images in Shopify

1. **Go to Shopify Admin**
   - Navigate to Products → Select a product
   
2. **Upload Images**
   - Click "Add media" or drag images into the media section
   - Set the first image as the featured image (this becomes `heroImage`)
   - Add additional images (these become the `images` array)

3. **Image Requirements**
   - Recommended: 1200px width minimum for hero images
   - Format: JPG, PNG, or WebP
   - Multiple images per product are supported

4. **That's It!**
   - The site automatically fetches images from Shopify
   - No code changes required

### If Your Images Are on a Different CDN

If you're using Shopify but images are hosted elsewhere (e.g., Cloudinary, Imgix), update `next.config.ts`:

```typescript
images: {
  remotePatterns: [
    {
      protocol: "https",
      hostname: "cdn.shopify.com", // Shopify CDN
    },
    {
      protocol: "https",
      hostname: "res.cloudinary.com", // Example: Cloudinary
    },
    // Add your image hostname here
  ],
}
```

---

## Option 2: Replacing Fallback Data Images

If you're using fallback data (no Shopify configured), replace URLs in `src/data/products.ts`.

### Method A: Using External Image URLs

1. **Host your images** on:
   - Your own server
   - Cloud storage (AWS S3, Google Cloud Storage)
   - CDN (Cloudinary, Imgix)
   - Image hosting service

2. **Update `src/data/products.ts`**

Replace the Unsplash URLs with your image URLs:

```typescript
{
  id: "hb-indigo-serenade",
  slug: "indigo-serenade-coat",
  // ... other fields
  heroImage: "https://your-cdn.com/images/indigo-coat-hero.jpg",
  images: [
    "https://your-cdn.com/images/indigo-coat-1.jpg",
    "https://your-cdn.com/images/indigo-coat-2.jpg",
    "https://your-cdn.com/images/indigo-coat-3.jpg",
  ],
}
```

3. **Update `next.config.ts`** to allow your image domain:

```typescript
images: {
  remotePatterns: [
    {
      protocol: "https",
      hostname: "your-cdn.com", // Your image hostname
    },
  ],
}
```

### Method B: Using Local Images (Next.js Public Folder)

1. **Add images to `public/images/products/`**

Create the folder structure:
```
public/
  images/
    products/
      indigo-coat-hero.jpg
      indigo-coat-1.jpg
      indigo-coat-2.jpg
      midnight-reed-hero.jpg
      ...
```

2. **Update `src/data/products.ts`**

Use relative paths starting with `/`:

```typescript
{
  id: "hb-indigo-serenade",
  slug: "indigo-serenade-coat",
  // ... other fields
  heroImage: "/images/products/indigo-coat-hero.jpg",
  images: [
    "/images/products/indigo-coat-1.jpg",
    "/images/products/indigo-coat-2.jpg",
    "/images/products/indigo-coat-3.jpg",
  ],
}
```

**Note:** Local images don't require `next.config.ts` changes - Next.js automatically serves files from the `public` folder.

---

## Image Specifications

### Recommended Dimensions

- **Hero Image:** 1200px × 1600px (3:4 aspect ratio) or larger
- **Product Card Images:** 800px × 1000px minimum
- **Thumbnail Images:** 400px × 500px minimum

### File Formats

- **Best:** WebP (smaller file size, good quality)
- **Also supported:** JPG, PNG
- **File naming:** Use descriptive names (e.g., `product-name-hero.jpg`)

### Optimization Tips

- Compress images before uploading (TinyPNG, ImageOptim)
- Use responsive images (Next.js Image component handles this)
- Hero images: ~200-300KB file size
- Thumbnails: ~50-100KB file size

---

## Quick Reference

### Current Image Locations

Images are used in these files:
- `src/data/products.ts` - Fallback data (replace URLs here)
- `src/lib/shopify-mappers.ts` - Maps Shopify images (no changes needed if using Shopify)

Images are displayed in:
- `src/components/shop/ProductCard.tsx` - Product cards
- `src/app/product/[slug]/page.tsx` - Product detail pages
- `src/app/page.tsx` - Home page hero

### Image Field Names

- `heroImage` - Main product image (used in cards and hero sections)
- `images[]` - Array of additional product images (used in product detail galleries)

---

## Troubleshooting

### Images Not Loading

1. **Check `next.config.ts`** - Ensure your image domain is in `remotePatterns`
2. **Check image URLs** - Verify URLs are accessible and use `https://`
3. **Check browser console** - Look for 404 errors or CORS issues
4. **Restart dev server** - After changing `next.config.ts`, restart with `npm run dev`

### Shopify Images Not Showing

1. **Check environment variables** - Ensure `SHOPIFY_STORE_DOMAIN` is set
2. **Verify products have images** - Check Shopify Admin → Products
3. **Check featured image** - Make sure at least one image is set as featured
4. **Check GraphQL query** - Verify `featuredImage` and `images` are requested (already done in `lib/shopify.ts`)

### Image Optimization Issues

- Next.js Image component automatically optimizes images
- For external images, ensure the source supports image resizing/optimization
- Consider using a CDN with image transformation (Cloudinary, Imgix) for best performance

---

## Next Steps

1. Choose your approach (Shopify or fallback data)
2. Upload/prepare your images
3. Update URLs in `src/data/products.ts` (if using fallback) OR upload to Shopify
4. Update `next.config.ts` if using external image domains
5. Test locally with `npm run dev`

For production, **Shopify integration is recommended** as it handles image hosting, optimization, and CDN delivery automatically.
