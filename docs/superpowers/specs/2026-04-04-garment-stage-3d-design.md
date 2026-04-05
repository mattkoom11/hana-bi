# GarmentStage 3D Shop Experience — Design Spec
**Date:** 2026-04-04
**Status:** Approved by user

---

## Overview

The shop page gains a `GarmentStage` component: a Three.js canvas that renders a single garment image as a lit 3D plane, floating in atmospheric space above the existing product grid. The canvas is transparent so the ambient video background shows through beneath it. Clicking the garment triggers a camera fly-in and reveals a minimal overlay with product details. The existing `ShopContent` grid remains below — users can still browse normally.

---

## Architecture

```
src/app/shop/page.tsx           — server component, passes first product to GarmentStage
src/components/shop/GarmentStage.tsx  — 'use client', owns Three.js scene + overlay state
```

Two responsibilities, two files. `GarmentStage` is self-contained — it sets up the scene, runs the animation loop, handles interaction, and renders its own overlay. The shop page just passes a `product: Product` prop.

---

## Dependencies

- `three` + `@types/three` — install via `npm install three @types/three`
- No additional animation library — camera movement uses a simple lerp approach inside the existing Three.js `requestAnimationFrame` loop (target position + `lerp(current, target, 0.05)` each frame)

---

## GarmentStage Component

**File:** `src/components/shop/GarmentStage.tsx`

### Props
```ts
interface GarmentStageProps {
  product: Product; // from @/data/products
}
```

### Canvas
- `'use client'` component
- A `<div>` wrapper: `w-full h-[60vh] relative cursor-pointer`
- Three.js canvas mounted via `useEffect` into a `ref` — fills the wrapper exactly
- Renderer: `WebGLRenderer({ alpha: true, antialias: true })` — transparent background so video shows through
- `renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))`
- `renderer.toneMapping = THREE.ACESFilmicToneMapping`, `renderer.toneMappingExposure = 1.2`
- Resize observer keeps canvas size in sync with wrapper

### Camera
- `PerspectiveCamera(45, aspect, 0.1, 100)`
- Resting position: `z = 4.0`
- Focused position (after click): `z = 1.4`
- Camera movement: each frame, `camera.position.z = lerp(camera.position.z, targetZ, 0.05)` — smooth easing, no external library needed

### Garment Plane
- `PlaneGeometry(1.6, 2.1)` — portrait aspect ratio matching typical garment photography
- `MeshStandardMaterial({ map: texture, transparent: true })`
- Texture loaded via `TextureLoader` from `product.heroImage`
- Position: `(0, 0, 0)`
- Idle animation each frame:
  - `mesh.position.y = Math.sin(clock.elapsedTime * 0.6) * 0.04` — slow float
  - `mesh.rotation.y = Math.sin(clock.elapsedTime * 0.3) * 0.02` — subtle wobble

### Lighting
- `AmbientLight(0xfaf8f4, 0.3)` — cool fill
- `SpotLight(0xd4956a, 2.5)` at position `(1.5, 2.5, 3)`, aimed at origin — warm sienna-toned spotlight matching `--hb-sienna`
- `spotLight.penumbra = 0.4`, `spotLight.angle = Math.PI / 8`
- On hover: `spotLight.intensity` lerps to `3.5`
- On click (focused): `spotLight.intensity` lerps to `4.5`
- On dismiss: lerps back to `2.5`

### Particles
- `120` particles in a `BufferGeometry`, positions randomized in a box `(-2.5 to 2.5, -2 to 2, -1 to 1)`
- `PointsMaterial({ color: 0xc8843a, size: 0.012, transparent: true, opacity: 0.6 })`
- Each frame: each particle's Y position increments by `0.003 + random_offset * 0.001`, wraps back to `-2` when it exceeds `2`
- X drifts with `Math.sin(time + particle_index) * 0.001` — gentle lateral wobble

### Interaction
- `Raycaster` + `mouse` vector updated on `mousemove`
- Each frame: raycast against the garment plane
  - Hit: set `isHovered = true`, `document.body.style.cursor = 'pointer'`
  - No hit: `isHovered = false`, cursor resets
- On `click`: if `isHovered && !isFocused` → set `isFocused = true`, `targetZ = 1.4`
- Overlay fades in via React state after camera is close enough (check `Math.abs(camera.position.z - 1.4) < 0.05` each frame)

### Overlay
- React state: `overlayVisible: boolean`
- Positioned absolutely over the canvas, centered bottom third
- Content:
  - Catalog number (e.g. `HB-001`) — `text-xs uppercase tracking-[0.4em]`, sienna color, DM Mono
  - Garment name — Cormorant, `text-3xl italic font-light`, `text-[#faf8f4]`
  - Price — DM Mono, `text-sm`, muted
  - `"View Piece"` link → `/product/${product.slug}` — sienna bg button, DM Mono
  - `"×"` dismiss button — top-right corner, clicking sets `isFocused = false`, `targetZ = 4.0`, `overlayVisible = false`
- Transition: `opacity-0 → opacity-100` over 500ms using Tailwind `transition-opacity duration-500`

---

## Shop Page Integration

`src/app/shop/page.tsx` passes the first available product to `GarmentStage`:

```tsx
const featuredProduct = shopifyProducts.find(p => p.status === "available") ?? shopifyProducts[0];

// In JSX, above PageShell:
<GarmentStage product={featuredProduct} />
```

`GarmentStage` renders above the `PageShell` (outside it), so it's full-width with no padding constraints. The video background shows through the transparent canvas. The dark overlay from `layout.tsx` sits between the video and the canvas, providing ambient suppression.

---

## Cleanup

On component unmount:
- `cancelAnimationFrame(animFrameId)`
- `renderer.dispose()`
- `texture.dispose()`
- Remove resize observer and event listeners

---

## Files Changed

| File | Action |
|------|--------|
| `src/components/shop/GarmentStage.tsx` | Create |
| `src/app/shop/page.tsx` | Modify — add `<GarmentStage>` above `<PageShell>` |
| `package.json` | Add `three` + `@types/three` |
