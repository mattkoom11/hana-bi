# Video Background Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a persistent full-viewport crossfading video background across the entire site, giving it a handheld ambient texture at 20–30% presence.

**Architecture:** A `VideoBackground` client component renders two stacked `<video>` elements in a fixed layer (z-1). A dark overlay div (z=0) suppresses the video to ambient level. All page content sits in a z-10 wrapper. Dark `PageShell` sections use `bg-[var(--hb-dark)]/80` and light sections use `bg-[var(--hb-paper)]/85` so video bleeds through both.

**Tech Stack:** Next.js 16 App Router, React 19, Tailwind CSS, `useEffect`/`useState`/`useRef` for crossfade logic.

---

## File Map

**Create:**
- `src/components/layout/VideoBackground.tsx` — crossfading video layer, fixed z-1

**Modify:**
- `src/app/layout.tsx` — add `<VideoBackground />` and dark overlay, wrap content in `z-10`
- `src/components/layout/PageShell.tsx` — semi-transparent backgrounds on both variants

---

## Task 1: VideoBackground Component

**Files:**
- Create: `src/components/layout/VideoBackground.tsx`

**Context:** Two `<video>` elements sit stacked absolutely on top of each other. One is "active" (opacity-100), the other is "next" (opacity-0). Every 20 seconds a timer advances the index, preloads the next clip's `src`, then swaps active/next via a 2-second CSS opacity transition. On mount, picks a random starting clip.

- [ ] **Step 1: Create `src/components/layout/VideoBackground.tsx`**

```tsx
"use client";

import { useEffect, useRef, useState } from "react";

const CLIPS = [
  "/videos/clip-01.mp4",
  "/videos/clip-02.mp4",
  "/videos/clip-03.mp4",
];

const INTERVAL_MS = 20000; // 20 seconds between crossfades
const TRANSITION_MS = 2000; // 2-second crossfade

export function VideoBackground() {
  const [activeIndex, setActiveIndex] = useState(() =>
    Math.floor(Math.random() * CLIPS.length)
  );
  const [isTransitioning, setIsTransitioning] = useState(false);
  const videoARef = useRef<HTMLVideoElement>(null);
  const videoBRef = useRef<HTMLVideoElement>(null);
  const nextIndexRef = useRef<number>((Math.floor(Math.random() * CLIPS.length) + 1) % CLIPS.length);

  // Preload next clip src into the inactive video element
  useEffect(() => {
    const inactiveVideo = activeIndex % 2 === 0 ? videoBRef.current : videoARef.current;
    const nextClip = CLIPS[nextIndexRef.current];
    if (inactiveVideo && inactiveVideo.src !== window.location.origin + nextClip) {
      inactiveVideo.src = nextClip;
      inactiveVideo.load();
    }
  }, [activeIndex]);

  // Crossfade timer
  useEffect(() => {
    const timer = setInterval(() => {
      setIsTransitioning(true);
      setActiveIndex(nextIndexRef.current);
      nextIndexRef.current = (nextIndexRef.current + 1) % CLIPS.length;
      setTimeout(() => setIsTransitioning(false), TRANSITION_MS);
    }, INTERVAL_MS);

    return () => clearInterval(timer);
  }, []);

  const aIsActive = activeIndex % 2 === 0;

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      <video
        ref={videoARef}
        src={aIsActive ? CLIPS[activeIndex] : undefined}
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 w-full h-full object-cover transition-opacity"
        style={{
          opacity: aIsActive ? 1 : 0,
          transitionDuration: `${TRANSITION_MS}ms`,
        }}
      />
      <video
        ref={videoBRef}
        src={!aIsActive ? CLIPS[activeIndex] : undefined}
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 w-full h-full object-cover transition-opacity"
        style={{
          opacity: !aIsActive ? 1 : 0,
          transitionDuration: `${TRANSITION_MS}ms`,
        }}
      />
    </div>
  );
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
cd c:\hana-bi && npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
cd c:\hana-bi && git add src/components/layout/VideoBackground.tsx && git commit -m "feat: add VideoBackground component with crossfading clips"
```

---

## Task 2: Wire VideoBackground into Root Layout

**Files:**
- Modify: `src/app/layout.tsx`

**Context:** The current layout renders `<SiteHeader>`, `<main>`, and `<SiteFooter>` directly inside `<body>`. We need to:
1. Add `<VideoBackground />` as the first child of `<body>` (fixed, z=-10 via `-z-10`)
2. Add a dark overlay div (fixed, z=0) to suppress the video to ambient level
3. Wrap the existing `<SiteHeader>` / `<main>` / `<SiteFooter>` content in a `relative z-10` div so it sits above both the video and overlay

The current `layout.tsx` body looks like:
```tsx
<body className={`...fonts... antialiased min-h-screen`}>
  <div className="flex min-h-screen flex-col">
    <SiteHeader />
    <main className="flex-1">{children}</main>
    <SiteFooter />
  </div>
</body>
```

- [ ] **Step 1: Update `src/app/layout.tsx`**

Add `VideoBackground` import at the top alongside other layout imports:
```tsx
import { VideoBackground } from "@/components/layout/VideoBackground";
```

Replace the `<body>` contents with:
```tsx
<body className={`${hanabiSerif.variable} ${hanabiSans.variable} ${hanabiScript.variable} ${cormorant.variable} ${dmMono.variable} antialiased min-h-screen`}>
  <VideoBackground />
  {/* Dark ambient overlay — suppresses video to ~20-30% presence */}
  <div className="fixed inset-0 z-0 bg-[#0e0c0b]/60 pointer-events-none" />
  <div className="relative z-10 flex min-h-screen flex-col">
    <SiteHeader />
    <main className="flex-1">{children}</main>
    <SiteFooter />
  </div>
</body>
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
cd c:\hana-bi && npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Start dev server and visually confirm video plays**

```bash
cd c:\hana-bi && npm run dev
```

Open `http://localhost:3000`. You should see the video playing subtly behind all content. The overlay makes it very dark/ambient. Dark sections will look nearly unchanged. If the site looks completely black, lower the overlay opacity to `/50` or `/45`.

- [ ] **Step 4: Commit**

```bash
cd c:\hana-bi && git add src/app/layout.tsx && git commit -m "feat: wire VideoBackground and dark overlay into root layout"
```

---

## Task 3: Semi-Transparent Section Backgrounds

**Files:**
- Modify: `src/components/layout/PageShell.tsx`

**Context:** Currently dark `PageShell` sections use `bg-[var(--hb-dark)]` (fully opaque) and light sections have no explicit background color (just `PaperBackground` texture overlays). To let video bleed through:
- Dark sections need `bg-[var(--hb-dark)]/80` — keeps them dark, lets ~20% video through
- Light sections need an explicit `bg-[var(--hb-paper)]/85` — keeps them cream, lets ~15% video through

The current section className line (line 28–31) reads:
```tsx
className={cn(
  "px-4 sm:px-8 md:px-12 lg:px-20 py-24 space-airy relative",
  isDark ? "bg-[var(--hb-dark)] grain" : "",
  className
)}
```

- [ ] **Step 1: Update `src/components/layout/PageShell.tsx`**

Replace the className in the `<section>` element:
```tsx
className={cn(
  "px-4 sm:px-8 md:px-12 lg:px-20 py-24 space-airy relative",
  isDark ? "bg-[var(--hb-dark)]/80 grain" : "bg-[var(--hb-paper)]/85",
  className
)}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
cd c:\hana-bi && npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Visual check**

With the dev server running, browse to:
- `http://localhost:3000/shop` (dark PageShell) — video should have a subtle presence behind the dark content
- `http://localhost:3000/about` (light PageShell) — very slight warm video bleed through the cream sections

If video bleed on light sections is too strong, increase opacity to `/90`. If too subtle on dark sections, decrease dark section opacity to `/75`.

- [ ] **Step 4: Commit**

```bash
cd c:\hana-bi && git add src/components/layout/PageShell.tsx && git commit -m "feat: semi-transparent section backgrounds to allow video bleed"
```

---

## Self-Review

**Spec coverage:**
- ✅ Persistent full-viewport video layer — Task 1 creates `VideoBackground`
- ✅ Crossfading between clips on a timer — Task 1 implements 20s interval + 2s transition
- ✅ Random starting clip — Task 1 uses `Math.random()` on mount
- ✅ Clip array for easy expansion — `CLIPS` constant at top of component
- ✅ Fixed z-1, overlays at z-0, content at z-10 — Task 2
- ✅ Dark overlay for ambient suppression — Task 2
- ✅ Light sections semi-transparent (`/85`) — Task 3
- ✅ Dark sections semi-transparent (`/80`) — Task 3
- ✅ Videos in `public/videos/` — user has already placed them

**Placeholder scan:** None found.

**Type consistency:** `VideoBackground` component name consistent across Task 1 and Task 2. `CLIPS` array referenced consistently.
