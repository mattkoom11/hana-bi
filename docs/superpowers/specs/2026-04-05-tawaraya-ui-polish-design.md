# Tawaraya UI Polish — Design Spec
**Date:** 2026-04-05
**Status:** Approved by user

---

## Overview

Three small UI enhancements inspired by the Tawaraya ryokan website:

1. **Logo blend mode** — `mix-blend-mode: exclusion` on the "Hana-Bi" wordmark so it auto-contrasts against the video background.
2. **LoadingScreen** — a full-viewport overlay with a 花火 kanji SVG stroke draw-in animation, dismissed once the page `load` event fires. Shown once per session via sessionStorage guard.
3. **CustomScrollbar** — replaces the browser default scrollbar with a minimal 2px sienna track, thumb fades in on scroll and out after 1s idle.

---

## Feature 1: Logo Blend Mode

**File:** `src/components/layout/SiteHeader.tsx`

**Change:** Add `mixBlendMode: "exclusion"` to the inline style on the "Hana-Bi" `<Link>`. Replace the `isDark`-conditional text colour with a fixed `text-white`. The `InkUnderline` hover effect is unchanged.

The `hover-wispy` class and `group` class remain. Remove only the `isDark` conditional text colour classes and replace with `text-white`:

```tsx
<Link
  href="/"
  className="text-3xl tracking-[0.08em] hover-wispy relative group transition-colors italic font-light text-white"
  style={{ fontFamily: "var(--hb-font-display)", mixBlendMode: "exclusion" }}
>
  Hana-Bi
  <span className="absolute -bottom-1 left-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
    <InkUnderline width={120} variant="delicate" strokeOpacity={0.3} />
  </span>
</Link>
```

**How it works:** `exclusion` blending inverts the white text against the composited layers behind it. Against the dark video + overlay, the wordmark appears as a warm cream. Against bright video frames it darkens automatically.

---

## Feature 2: LoadingScreen Component

**File:** `src/components/common/LoadingScreen.tsx`

### Behaviour

- On mount: check `sessionStorage.getItem('hb-loaded')`. If set, return `null` immediately (no overlay on repeat visits within the same session).
- Otherwise: render the full-viewport overlay with the 花火 SVG.
- Animation: CSS `@keyframes` draws the kanji strokes in over 1.8s, then holds.
- Dismissal: waits for **both** conditions before fading out:
  - (a) Animation complete (tracked via `setTimeout(2100ms)`)
  - (b) `window` `load` event fires
  - Whichever fires last triggers the exit — no flash on fast connections, no hang on slow ones.
- On exit: set `sessionStorage.setItem('hb-loaded', '1')`, transition overlay opacity to 0 over 600ms, then unmount.

### Structure

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
        viewBox="0 0 200 120"
        className="w-[40vw] max-w-[300px]"
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

### CSS (add to `src/app/globals.css`)

```css
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

### Layout integration

Add `<LoadingScreen />` as the **first child of `<body>`** in `src/app/layout.tsx`, before `<VhFix />`:

```tsx
import { LoadingScreen } from "@/components/common/LoadingScreen";

<body ...>
  <LoadingScreen />
  <VhFix />
  <VideoBackground />
  ...
</body>
```

---

## Feature 3: CustomScrollbar Component

**File:** `src/components/common/CustomScrollbar.tsx`

### Behaviour

- Fixed-position, `right: 6px`, `top: 0`, full viewport height, `width: 2px`, `pointer-events-none`, `z-50`
- Track: transparent (invisible container for sizing)
- Thumb:
  - Width: 2px
  - Height: `(window.innerHeight / document.body.scrollHeight) * viewportH` px — proportional to viewport/document ratio
  - Top offset: `(scrollY / (scrollHeight - viewportH)) * (viewportH - thumbH)` px
  - Background: `var(--hb-sienna)`
  - Opacity: `0` at rest, `0.5` when scrolling active — CSS `transition: opacity 300ms`
- Idle fade: `clearTimeout` / `setTimeout(1000ms)` resets opacity back to 0 after 1s of no scrolling
- Single `scroll` listener on `window`, removed on unmount

### Structure

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

### Layout integration

Add `<CustomScrollbar />` to `src/app/layout.tsx` alongside `<VhFix />`:

```tsx
import { CustomScrollbar } from "@/components/common/CustomScrollbar";

<body ...>
  <LoadingScreen />
  <VhFix />
  <CustomScrollbar />
  <VideoBackground />
  ...
</body>
```

---

## Files Changed

| File | Action |
|------|--------|
| `src/components/layout/SiteHeader.tsx` | Modify — logo: `text-white` + `mixBlendMode: "exclusion"` |
| `src/components/common/LoadingScreen.tsx` | Create |
| `src/components/common/CustomScrollbar.tsx` | Create |
| `src/app/globals.css` | Modify — add `@keyframes hanabi-draw` + `.hanabi-draw` |
| `src/app/layout.tsx` | Modify — mount `<LoadingScreen />` + `<CustomScrollbar />` |
