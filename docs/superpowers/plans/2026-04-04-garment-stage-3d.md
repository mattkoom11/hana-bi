# GarmentStage 3D Shop Experience Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a Three.js 3D garment display to the shop page — a single garment plane floating in atmospheric space with particles and a spotlight, camera flies in on click revealing a product overlay.

**Architecture:** `GarmentStage` is a self-contained `'use client'` component that owns the Three.js scene, animation loop, and overlay state. The shop page (server component) passes the first available product as a prop and renders `GarmentStage` above the existing `PageShell`. Canvas uses `alpha: true` so the ambient video background shows through.

**Tech Stack:** Three.js (`three` + `@types/three`), React `useEffect`/`useRef`/`useState`, Tailwind CSS for overlay, Next.js App Router.

---

## File Map

**Install:** `three`, `@types/three`

**Create:** `src/components/shop/GarmentStage.tsx`

**Modify:** `src/app/shop/page.tsx` — add `<GarmentStage>` above `<PageShell>`, pass featured product + catalog number

---

## Task 1: Install Three.js

**Files:** `package.json`

- [ ] **Step 1: Install dependencies**

```bash
cd c:\hana-bi && npm install three && npm install --save-dev @types/three
```

Expected output: both packages added with no peer dependency errors.

- [ ] **Step 2: Verify TypeScript sees the types**

```bash
cd c:\hana-bi && npx tsc --noEmit
```

Expected: no errors (project was clean before, should stay clean).

- [ ] **Step 3: Commit**

```bash
cd c:\hana-bi && git add package.json package-lock.json && git commit -m "chore: install three.js and @types/three"
```

---

## Task 2: GarmentStage — Canvas, Scene, Garment Plane

**Files:**
- Create: `src/components/shop/GarmentStage.tsx`

**Context:** Build the component foundation — renderer, camera, garment plane with texture, lighting, idle animation, resize handling, and cleanup. No particles or interaction yet. After this task the component renders a floating lit garment plane over the transparent canvas.

- [ ] **Step 1: Create `src/components/shop/GarmentStage.tsx`**

```tsx
"use client";

import { useEffect, useRef, useState } from "react";
import type { Product } from "@/data/products";
import * as THREE from "three";

interface GarmentStageProps {
  product: Product;
  catalogNumber: string;
}

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

export function GarmentStage({ product, catalogNumber }: GarmentStageProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;

    // ── Renderer ──────────────────────────────────────────────────
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    renderer.setSize(wrapper.clientWidth, wrapper.clientHeight);
    wrapper.appendChild(renderer.domElement);

    // ── Scene ──────────────────────────────────────────────────────
    const scene = new THREE.Scene();

    // ── Camera ─────────────────────────────────────────────────────
    const camera = new THREE.PerspectiveCamera(
      45,
      wrapper.clientWidth / wrapper.clientHeight,
      0.1,
      100
    );
    camera.position.z = 4.0;

    // ── Lights ─────────────────────────────────────────────────────
    const ambientLight = new THREE.AmbientLight(0xfaf8f4, 0.3);
    scene.add(ambientLight);

    const spotLight = new THREE.SpotLight(0xd4956a, 2.5);
    spotLight.position.set(1.5, 2.5, 3);
    spotLight.penumbra = 0.4;
    spotLight.angle = Math.PI / 8;
    spotLight.target.position.set(0, 0, 0);
    scene.add(spotLight);
    scene.add(spotLight.target);

    // ── Garment Plane ──────────────────────────────────────────────
    const textureLoader = new THREE.TextureLoader();
    const texture = textureLoader.load(product.heroImage);
    texture.colorSpace = THREE.SRGBColorSpace;

    const geometry = new THREE.PlaneGeometry(1.6, 2.1);
    const material = new THREE.MeshStandardMaterial({ map: texture, transparent: true });
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    // ── Clock ──────────────────────────────────────────────────────
    const clock = new THREE.Clock();

    // ── Animation Loop ─────────────────────────────────────────────
    let animId: number;
    const animate = () => {
      animId = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();

      // Idle float + wobble
      mesh.position.y = Math.sin(t * 0.6) * 0.04;
      mesh.rotation.y = Math.sin(t * 0.3) * 0.02;

      renderer.render(scene, camera);
    };
    animate();

    // ── Resize ─────────────────────────────────────────────────────
    const resizeObserver = new ResizeObserver(() => {
      if (!wrapper) return;
      const w = wrapper.clientWidth;
      const h = wrapper.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    });
    resizeObserver.observe(wrapper);

    // ── Cleanup ────────────────────────────────────────────────────
    return () => {
      cancelAnimationFrame(animId);
      resizeObserver.disconnect();
      renderer.dispose();
      texture.dispose();
      geometry.dispose();
      material.dispose();
      if (wrapper.contains(renderer.domElement)) {
        wrapper.removeChild(renderer.domElement);
      }
    };
  }, [product.heroImage]);

  return (
    <div
      ref={wrapperRef}
      className="w-full h-[60vh] relative"
      style={{ cursor: "default" }}
    />
  );
}
```

- [ ] **Step 2: Verify TypeScript**

```bash
cd c:\hana-bi && npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
cd c:\hana-bi && git add src/components/shop/GarmentStage.tsx && git commit -m "feat: GarmentStage — canvas, scene, garment plane with lighting"
```

---

## Task 3: GarmentStage — Particles

**Files:**
- Modify: `src/components/shop/GarmentStage.tsx`

**Context:** Add 120 amber floating particles to the scene. Each particle drifts upward slowly with sinusoidal X wobble and wraps back to the bottom when it exits the top boundary. Add this inside the `useEffect`, after the garment mesh setup and before the animation loop.

- [ ] **Step 1: Add particle setup after the garment mesh block**

After the line `scene.add(mesh);` and before `// ── Clock ──`, insert:

```tsx
    // ── Particles ──────────────────────────────────────────────────
    const PARTICLE_COUNT = 120;
    const positions = new Float32Array(PARTICLE_COUNT * 3);
    const velocities = new Float32Array(PARTICLE_COUNT); // per-particle speed offset

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      positions[i * 3]     = (Math.random() - 0.5) * 5;   // x: -2.5 to 2.5
      positions[i * 3 + 1] = (Math.random() - 0.5) * 4;   // y: -2 to 2
      positions[i * 3 + 2] = (Math.random() - 0.5) * 2;   // z: -1 to 1
      velocities[i] = Math.random() * 0.001;
    }

    const particleGeo = new THREE.BufferGeometry();
    particleGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));

    const particleMat = new THREE.PointsMaterial({
      color: 0xc8843a,
      size: 0.012,
      transparent: true,
      opacity: 0.6,
    });

    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);
```

- [ ] **Step 2: Update the animation loop to drift particles**

Inside the `animate` function, after the idle float/wobble lines and before `renderer.render(...)`, insert:

```tsx
      // Drift particles upward
      const posAttr = particleGeo.getAttribute("position") as THREE.BufferAttribute;
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        posAttr.setY(i, posAttr.getY(i) + 0.003 + velocities[i]);
        posAttr.setX(i, posAttr.getX(i) + Math.sin(t + i) * 0.001);
        if (posAttr.getY(i) > 2) posAttr.setY(i, -2);
      }
      posAttr.needsUpdate = true;
```

- [ ] **Step 3: Add particle cleanup in the return block**

Inside the `return () => { ... }` cleanup, after `material.dispose();`, add:

```tsx
      particleGeo.dispose();
      particleMat.dispose();
```

- [ ] **Step 4: Verify TypeScript**

```bash
cd c:\hana-bi && npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 5: Commit**

```bash
cd c:\hana-bi && git add src/components/shop/GarmentStage.tsx && git commit -m "feat: GarmentStage — add ambient particle system"
```

---

## Task 4: GarmentStage — Interaction, Camera Lerp, and Overlay

**Files:**
- Modify: `src/components/shop/GarmentStage.tsx`

**Context:** Add raycaster hover detection, click-to-focus camera lerp, spotlight intensity lerp, and the product overlay UI. This task touches both the `useEffect` (for Three.js interaction) and the JSX (for the overlay).

- [ ] **Step 1: Add React state at the top of the component, before `useEffect`**

After `const wrapperRef = useRef<HTMLDivElement>(null);`, add:

```tsx
  const [overlayVisible, setOverlayVisible] = useState(false);
  const [cursorPointer, setCursorPointer] = useState(false);

  // Mutable refs for values shared between React and the animation loop
  const targetZRef = useRef(4.0);
  const isFocusedRef = useRef(false);
  const setOverlayVisibleRef = useRef(setOverlayVisible);
  setOverlayVisibleRef.current = setOverlayVisible;
```

- [ ] **Step 2: Add raycaster setup inside `useEffect`, after the particles block and before `// ── Clock ──`**

```tsx
    // ── Raycaster ──────────────────────────────────────────────────
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const onMouseMove = (e: MouseEvent) => {
      const rect = wrapper.getBoundingClientRect();
      mouse.x =  ((e.clientX - rect.left) / rect.width)  * 2 - 1;
      mouse.y = -((e.clientY - rect.top)  / rect.height) * 2 + 1;
    };

    const onClick = () => {
      raycaster.setFromCamera(mouse, camera);
      const hits = raycaster.intersectObject(mesh);
      if (hits.length > 0 && !isFocusedRef.current) {
        isFocusedRef.current = true;
        targetZRef.current = 1.4;
      }
    };

    const onDismiss = () => {
      isFocusedRef.current = false;
      targetZRef.current = 4.0;
      setOverlayVisibleRef.current(false);
    };

    wrapper.addEventListener("mousemove", onMouseMove);
    wrapper.addEventListener("click", onClick);
```

- [ ] **Step 3: Replace the animation loop with the full interactive version**

Replace the entire `const animate = () => { ... }; animate();` block with:

```tsx
    // ── Animation Loop ─────────────────────────────────────────────
    let animId: number;
    const animate = () => {
      animId = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();

      // Idle float + wobble
      mesh.position.y = Math.sin(t * 0.6) * 0.04;
      mesh.rotation.y = Math.sin(t * 0.3) * 0.02;

      // Drift particles upward
      const posAttr = particleGeo.getAttribute("position") as THREE.BufferAttribute;
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        posAttr.setY(i, posAttr.getY(i) + 0.003 + velocities[i]);
        posAttr.setX(i, posAttr.getX(i) + Math.sin(t + i) * 0.001);
        if (posAttr.getY(i) > 2) posAttr.setY(i, -2);
      }
      posAttr.needsUpdate = true;

      // Camera lerp toward target Z
      camera.position.z = lerp(camera.position.z, targetZRef.current, 0.05);

      // Show overlay once camera is close enough
      if (isFocusedRef.current && Math.abs(camera.position.z - 1.4) < 0.05) {
        setOverlayVisibleRef.current(true);
      }

      // Hover detection
      raycaster.setFromCamera(mouse, camera);
      const hits = raycaster.intersectObject(mesh);
      const hovered = hits.length > 0 && !isFocusedRef.current;
      setCursorPointer(hovered);

      // Spotlight intensity lerp
      const targetIntensity = isFocusedRef.current ? 4.5 : hovered ? 3.5 : 2.5;
      spotLight.intensity = lerp(spotLight.intensity, targetIntensity, 0.05);

      renderer.render(scene, camera);
    };
    animate();
```

- [ ] **Step 4: Add event listener cleanup to the return block**

Inside the `return () => { ... }` block, after `resizeObserver.disconnect();`, add:

```tsx
      wrapper.removeEventListener("mousemove", onMouseMove);
      wrapper.removeEventListener("click", onClick);
```

- [ ] **Step 5: Replace the JSX return with the full overlay version**

Replace the final `return (...)` with:

```tsx
  return (
    <div
      ref={wrapperRef}
      className="w-full h-[60vh] relative"
      style={{ cursor: cursorPointer ? "pointer" : "default" }}
    >
      {/* Product overlay — fades in after camera fly-in */}
      <div
        className={`absolute inset-0 flex flex-col items-center justify-end pb-12 pointer-events-none transition-opacity duration-500 ${
          overlayVisible ? "opacity-100" : "opacity-0"
        }`}
      >
        <div className="pointer-events-auto text-center space-y-3 px-6 py-8 bg-[var(--hb-dark)]/70 backdrop-blur-sm border border-[var(--hb-dark-border)] max-w-sm w-full mx-4">
          {/* Dismiss */}
          <button
            onClick={() => {
              isFocusedRef.current = false;
              targetZRef.current = 4.0;
              setOverlayVisible(false);
            }}
            className="absolute top-3 right-4 text-[var(--hb-dark-muted)] hover:text-[#faf8f4] transition-colors text-lg leading-none"
            style={{ fontFamily: "var(--hb-font-mono)" }}
            aria-label="Dismiss"
          >
            ×
          </button>

          {/* Catalog number */}
          <p
            className="text-xs uppercase tracking-[0.4em]"
            style={{ fontFamily: "var(--hb-font-mono)", color: "var(--hb-sienna)" }}
          >
            {catalogNumber}
          </p>

          {/* Name */}
          <p
            className="text-3xl text-[#faf8f4] italic font-light"
            style={{ fontFamily: "var(--hb-font-display)" }}
          >
            {product.name}
          </p>

          {/* Price */}
          <p
            className="text-sm"
            style={{ fontFamily: "var(--hb-font-mono)", color: "var(--hb-dark-muted)" }}
          >
            ${product.price.toLocaleString()}
          </p>

          {/* CTA */}
          <a
            href={`/product/${product.slug}`}
            className="inline-block mt-2 px-8 py-3 bg-[var(--hb-sienna)] text-[#faf8f4] uppercase tracking-[0.4em] text-xs hover:opacity-90 transition-opacity"
            style={{ fontFamily: "var(--hb-font-mono)" }}
          >
            View Piece
          </a>
        </div>
      </div>
    </div>
  );
```

- [ ] **Step 6: Verify TypeScript**

```bash
cd c:\hana-bi && npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 7: Commit**

```bash
cd c:\hana-bi && git add src/components/shop/GarmentStage.tsx && git commit -m "feat: GarmentStage — hover, click-to-focus camera lerp, product overlay"
```

---

## Task 5: Wire GarmentStage into the Shop Page

**Files:**
- Modify: `src/app/shop/page.tsx`

**Context:** The shop page is a server component. It fetches products and currently renders a `PageShell` with `ShopContent` inside. Add `GarmentStage` above the `PageShell` — it renders full-width with no padding constraints. Compute the catalog number here (same logic as the product detail page).

- [ ] **Step 1: Update `src/app/shop/page.tsx`**

Replace the entire file with:

```tsx
import type { Metadata } from "next";
import { PageShell } from "@/components/layout/PageShell";
import { ShopContent } from "@/components/shop/ShopContent";
import { GarmentStage } from "@/components/shop/GarmentStage";
import { getAllProducts } from "@/lib/shopify";
import { mapShopifyProductToHanaBiProduct } from "@/lib/shopify-mappers";
import { products as fallbackProducts } from "@/data/products";

export const metadata: Metadata = {
  title: "Shop — Hana-Bi",
  description:
    "Browse limited denim garments from the Hana-Bi archive. Each piece is documented like an artifact.",
  openGraph: {
    title: "Shop — Hana-Bi",
    description:
      "Browse limited denim garments from the Hana-Bi archive. Each piece is documented like an artifact.",
  },
};

export default async function ShopPage() {
  let shopifyProducts = fallbackProducts;

  try {
    const shopifyData = await getAllProducts();
    shopifyProducts = shopifyData.map(mapShopifyProductToHanaBiProduct);
  } catch (error) {
    console.warn("Failed to fetch from Shopify, using fallback data:", error);
  }

  const featuredProduct =
    shopifyProducts.find((p) => p.status === "available") ?? shopifyProducts[0];

  const catalogIndex = fallbackProducts.findIndex(
    (p) => p.slug === featuredProduct.slug
  );
  const catalogNumber =
    catalogIndex >= 0
      ? `HB-${String(catalogIndex + 1).padStart(3, "0")}`
      : "HB-001";

  return (
    <main className="page-transition">
      <GarmentStage product={featuredProduct} catalogNumber={catalogNumber} />
      <PageShell
        variant="dark"
        eyebrow="Shop"
        title="Limited garments, ready to study."
        intro={<>Filter by size, category, or availability.</>}
      >
        <ShopContent products={shopifyProducts} variant="dark" />
      </PageShell>
    </main>
  );
}
```

- [ ] **Step 2: Verify TypeScript**

```bash
cd c:\hana-bi && npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Visual check**

```bash
cd c:\hana-bi && npm run dev
```

Open `http://localhost:3000/shop`. You should see:
- A `60vh` stage at the top with the garment floating over the video background
- Amber particles drifting upward
- Warm spotlight on the garment
- Hovering the garment changes cursor to pointer
- Clicking flies camera in and fades in the overlay with catalog number, name, price, and "View Piece" link
- Clicking `×` eases camera back out

- [ ] **Step 4: Commit**

```bash
cd c:\hana-bi && git add src/app/shop/page.tsx && git commit -m "feat: wire GarmentStage into shop page"
```

---

## Self-Review

**Spec coverage:**
- ✅ Canvas `alpha: true`, transparent — Task 2
- ✅ `PerspectiveCamera` FOV 45, starts `z = 4.0` — Task 2
- ✅ `PlaneGeometry(1.6, 2.1)`, `MeshStandardMaterial` with texture — Task 2
- ✅ Idle float + rotation wobble — Task 2
- ✅ `SpotLight` warm `0xd4956a`, penumbra, angle — Task 2
- ✅ `AmbientLight` cool fill — Task 2
- ✅ Resize observer — Task 2
- ✅ Cleanup: `cancelAnimationFrame`, `renderer.dispose()`, `texture.dispose()` — Task 2
- ✅ 120 particles, `0xc8843a`, upward drift, sinusoidal wobble, Y wrap — Task 3
- ✅ Raycaster hover: cursor change, spotlight intensity lerp — Task 4
- ✅ Click: camera lerp to `z = 1.4` — Task 4
- ✅ Overlay appears when `camera.z` within 0.05 of 1.4 — Task 4
- ✅ Overlay: catalog number, name, price, "View Piece" link — Task 4
- ✅ Dismiss `×` resets camera to `z = 4.0`, hides overlay — Task 4
- ✅ Shop page passes `featuredProduct` + `catalogNumber` — Task 5
- ✅ `GarmentStage` renders above `PageShell` — Task 5

**Placeholder scan:** None found. All code blocks are complete.

**Type consistency:** `GarmentStageProps` defined in Task 2 with `product: Product` and `catalogNumber: string` — both props passed correctly in Task 5.
