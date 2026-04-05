# Tawaraya UI Polish Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add three Tawaraya-inspired UI polish features: `mix-blend-mode: exclusion` on the Hana-Bi logo, a full-viewport 花火 loading screen, and a minimal custom scrollbar.

**Architecture:** `LoadingScreen` and `CustomScrollbar` are `'use client'` components dropped into `src/components/common/`. The logo change is a one-line CSS addition to `SiteHeader`. All three are mounted in `src/app/layout.tsx`.

**Tech Stack:** Next.js 16 App Router, React 19, Tailwind CSS v4, TypeScript.

---

## File Map

**Modify:**
- `src/components/layout/SiteHeader.tsx` — logo: `text-white` + `mixBlendMode: "exclusion"`
- `src/app/globals.css` — add `@keyframes hanabi-draw` + `.hanabi-draw` class
- `src/app/layout.tsx` — mount `<LoadingScreen />` + `<CustomScrollbar />`

**Create:**
- `src/components/common/LoadingScreen.tsx`
- `src/components/common/CustomScrollbar.tsx`

---

## Task 1: Logo blend mode

**Files:**
- Modify: `src/components/layout/SiteHeader.tsx`

- [ ] **Step 1: Update the Hana-Bi logo `<Link>` in `src/components/layout/SiteHeader.tsx`**

The current logo link (lines 39–50) uses a conditional `isDark` class for text colour. Replace it with a fixed `text-white` and add `mixBlendMode: "exclusion"` to the style prop. The `hover-wispy`, `group`, and all other classes stay unchanged.

Replace:
```tsx
<Link
  href="/"
  className={`text-3xl tracking-[0.08em] hover-wispy relative group transition-colors italic font-light ${
    isDark ? "text-[#faf8f4]" : "text-[var(--hb-ink)]"
  }`}
  style={{ fontFamily: "var(--hb-font-display)" }}
>
```

With:
```tsx
<Link
  href="/"
  className="text-3xl tracking-[0.08em] hover-wispy relative group transition-colors italic font-light text-white"
  style={{ fontFamily: "var(--hb-font-display)", mixBlendMode: "exclusion" }}
>
```

- [ ] **Step 2: Verify TypeScript**

```bash
cd c:\hana-bi && npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
cd c:\hana-bi && git add src/components/layout/SiteHeader.tsx && git commit -m "feat: mix-blend-mode exclusion on Hana-Bi logo wordmark"
```

---

## Task 2: LoadingScreen component

**Files:**
- Create: `src/components/common/LoadingScreen.tsx`
- Modify: `src/app/globals.css`
- Modify: `src/app/layout.tsx`

- [ ] **Step 1: Add CSS animation to `src/app/globals.css`**

Append the following at the very end of the file (after the `.grain::after` block):

```css
/* Loading screen — 花火 kanji stroke draw-in */
@keyframes hanabi-draw {
  from {
    stroke-dashoffset: 2400;
  }
  to {
    stroke-dashoffset: 0;
  }
}

.hanabi-draw {
  stroke-dasharray: 2400;
  stroke-dashoffset: 2400;
  animation: hanabi-draw 1.8s ease-out forwards;
}
```

- [ ] **Step 2: Create `src/components/common/LoadingScreen.tsx`**

```tsx
'use client';

import { useEffect, useRef, useState } from 'react';

export function LoadingScreen() {
  const [visible, setVisible] = useState(true);
  const [fading, setFading] = useState(false);
  const animDone = useRef(false);
  const loadDone = useRef(false);

  useEffect(() => {
    if (sessionStorage.getItem('hb-loaded')) {
      setVisible(false);
      return;
    }

    const tryDismiss = () => {
      if (!animDone.current || !loadDone.current) return;
      sessionStorage.setItem('hb-loaded', '1');
      setFading(true);
      setTimeout(() => setVisible(false), 600);
    };

    const animTimer = setTimeout(() => {
      animDone.current = true;
      tryDismiss();
    }, 2100);

    const onLoad = () => {
      loadDone.current = true;
      tryDismiss();
    };

    if (document.readyState === 'complete') {
      loadDone.current = true;
      tryDismiss();
    } else {
      window.addEventListener('load', onLoad);
    }

    return () => {
      clearTimeout(animTimer);
      window.removeEventListener('load', onLoad);
    };
  }, []);

  if (!visible) return null;

  return (
    <div
      className="fixed inset-0 z-[100] bg-[#0e0c0b] flex items-center justify-center transition-opacity duration-[600ms]"
      style={{ opacity: fading ? 0 : 1 }}
    >
      <svg
        viewBox="0 0 260 120"
        className="w-[40vw] max-w-[320px]"
        overflow="visible"
      >
        <text
          x="50%"
          y="50%"
          dominantBaseline="middle"
          textAnchor="middle"
          fontSize="96"
          fontFamily="serif"
          fill="none"
          stroke="#faf8f4"
          strokeWidth="1"
          className="hanabi-draw"
        >
          花火
        </text>
      </svg>
    </div>
  );
}
```

- [ ] **Step 3: Mount `<LoadingScreen />` in `src/app/layout.tsx`**

Add the import at the top alongside existing layout imports:
```tsx
import { LoadingScreen } from "@/components/common/LoadingScreen";
```

Add `<LoadingScreen />` as the **first child of `<body>`**, before `<VhFix />`:
```tsx
<body className={`${hanabiSerif.variable} ${hanabiSans.variable} ${hanabiScript.variable} ${cormorant.variable} ${dmMono.variable} antialiased min-h-screen`}>
  <LoadingScreen />
  <VhFix />
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

- [ ] **Step 4: Verify TypeScript**

```bash
cd c:\hana-bi && npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 5: Visual check**

```bash
cd c:\hana-bi && npm run dev
```

Open `http://localhost:3000` in a fresh browser tab (or clear sessionStorage first via DevTools → Application → Session Storage → delete `hb-loaded`). The dark overlay should appear with 花火 drawing itself in over ~1.8s, then fade out once the page has loaded. On subsequent page navigations or refreshes within the same browser session, the overlay should not appear.

- [ ] **Step 6: Commit**

```bash
cd c:\hana-bi && git add src/components/common/LoadingScreen.tsx src/app/globals.css src/app/layout.tsx && git commit -m "feat: add LoadingScreen — 花火 SVG stroke draw-in, sessionStorage guard"
```

---

## Task 3: CustomScrollbar component

**Files:**
- Create: `src/components/common/CustomScrollbar.tsx`
- Modify: `src/app/layout.tsx`

- [ ] **Step 1: Create `src/components/common/CustomScrollbar.tsx`**

```tsx
'use client';

import { useEffect, useRef, useState } from 'react';

export function CustomScrollbar() {
  const [thumbStyle, setThumbStyle] = useState({ height: 0, top: 0 });
  const [active, setActive] = useState(false);
  const idleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const update = () => {
      const viewportH = window.innerHeight;
      const scrollH = document.body.scrollHeight;
      const scrollY = window.scrollY;

      const thumbH = Math.max(30, (viewportH / scrollH) * viewportH);
      const maxScroll = scrollH - viewportH;
      const thumbTop = maxScroll > 0 ? (scrollY / maxScroll) * (viewportH - thumbH) : 0;

      setThumbStyle({ height: thumbH, top: thumbTop });
      setActive(true);

      if (idleTimer.current) clearTimeout(idleTimer.current);
      idleTimer.current = setTimeout(() => setActive(false), 1000);
    };

    window.addEventListener('scroll', update, { passive: true });
    update();
    return () => {
      window.removeEventListener('scroll', update);
      if (idleTimer.current) clearTimeout(idleTimer.current);
    };
  }, []);

  return (
    <div className="fixed top-0 right-[6px] h-screen w-[2px] pointer-events-none z-50">
      <div
        className="absolute w-[2px] rounded-[1px] transition-opacity duration-300"
        style={{
          background: 'var(--hb-sienna)',
          height: thumbStyle.height,
          top: thumbStyle.top,
          opacity: active ? 0.5 : 0,
        }}
      />
    </div>
  );
}
```

- [ ] **Step 2: Mount `<CustomScrollbar />` in `src/app/layout.tsx`**

Add the import:
```tsx
import { CustomScrollbar } from "@/components/common/CustomScrollbar";
```

Add `<CustomScrollbar />` after `<VhFix />` and before `<VideoBackground />`:
```tsx
<body className={`${hanabiSerif.variable} ${hanabiSans.variable} ${hanabiScript.variable} ${cormorant.variable} ${dmMono.variable} antialiased min-h-screen`}>
  <LoadingScreen />
  <VhFix />
  <CustomScrollbar />
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

- [ ] **Step 3: Verify TypeScript**

```bash
cd c:\hana-bi && npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 4: Visual check**

With the dev server running, open `http://localhost:3000`. Scroll down the page — a thin 2px sienna thumb should fade in on the right side, tracking your scroll position. After 1s of no scrolling it fades back out. The browser's default scrollbar should still be visible alongside it (we are not hiding the native scrollbar — if the user wants to hide it later, add `scrollbar-width: none` to `body` in globals.css).

- [ ] **Step 5: Commit**

```bash
cd c:\hana-bi && git add src/components/common/CustomScrollbar.tsx src/app/layout.tsx && git commit -m "feat: add CustomScrollbar — 2px sienna thumb, fades in on scroll"
```

---

## Self-Review

**Spec coverage:**
- ✅ Logo: `text-white` + `mixBlendMode: "exclusion"`, `isDark` conditional removed — Task 1
- ✅ `hover-wispy` and `group` classes preserved on logo link — Task 1
- ✅ LoadingScreen: full-viewport `z-[100]` overlay, `bg-[#0e0c0b]` — Task 2
- ✅ 花火 SVG `<text>` with `stroke-dasharray: 2400` draw-in animation over 1.8s — Task 2
- ✅ Dismissal waits for both animation complete (2100ms) AND `window load` event — Task 2
- ✅ `document.readyState === 'complete'` fast-path covered — Task 2
- ✅ sessionStorage guard: `hb-loaded` key, skip on return visits — Task 2
- ✅ Fade-out: 600ms opacity transition, then unmount — Task 2
- ✅ `<LoadingScreen />` mounted first in `<body>` before `<VhFix />` — Task 2
- ✅ CustomScrollbar: fixed `right: 6px`, 2px width, full height, `pointer-events-none` — Task 3
- ✅ Thumb height proportional to viewport/document ratio, min 30px — Task 3
- ✅ Thumb top offset derived from scroll position — Task 3
- ✅ Opacity 0 at rest, 0.5 on scroll activity, 300ms transition — Task 3
- ✅ 1s idle timer resets opacity to 0 — Task 3
- ✅ `<CustomScrollbar />` mounted in layout after `<VhFix />` — Task 3

**Placeholder scan:** None. All code blocks complete.

**Type consistency:** `ReturnType<typeof setTimeout>` used consistently for the idle timer ref in CustomScrollbar. `animDone` and `loadDone` are `useRef<boolean>` (inferred). ✅
