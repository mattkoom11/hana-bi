# RollText + VhFix — Design Spec
**Date:** 2026-04-05
**Status:** Approved by user

---

## Overview

Two small UI enhancements inspired by milez.jp:

1. **`RollText`** — a reusable hover animation component that makes text "roll" out on hover: top copy squishes upward, bottom copy rolls in from below. Applied to nav links and text CTAs.
2. **`VhFix`** — a client component that sets `--vh`, `--rvh`, and `--ovh` CSS custom properties on `:root` to fix mobile viewport height inconsistencies.

---

## RollText Component

**File:** `src/components/common/RollText.tsx`

### Props
```ts
interface RollTextProps {
  children: string;
  className?: string; // applied to the outer container
}
```

### Structure
```html
<span class="relative inline-block overflow-hidden leading-[1] [className]">
  <!-- Top copy — exits upward on hover -->
  <span class="block group-hover:translate-y-[-110%] group-hover:scale-y-[4] transition-transform duration-[600ms] ease-out-quint origin-bottom leading-[1]">
    {children}
  </span>
  <!-- Bottom copy — enters from below on hover -->
  <span class="block absolute inset-0 translate-y-[100%] scale-y-[4] group-hover:translate-y-0 group-hover:scale-y-[1] transition-transform duration-[600ms] ease-out-quint origin-top leading-[1]">
    {children}
  </span>
</span>
```

- Outer element: `<span>` (inline, works inside `<a>` and `<button>`)
- Uses Tailwind `group-hover:` — the parent `<Link>` or `<button>` must have the `group` class
- Custom easing: `cubic-bezier(0.23, 1, 0.32, 1)` applied inline via `style` prop on each copy span: `style={{ transitionTimingFunction: 'cubic-bezier(0.23, 1, 0.32, 1)' }}`
- Duration: 600ms (faster than MILEZ's 1.3s to match Hana-Bi's tempo)

### Usage
```tsx
<Link href="/shop" className="group ...existing classes...">
  <RollText>Enter Shop</RollText>
</Link>
```

---

## Where RollText Is Applied

### SiteHeader nav links (`src/components/layout/SiteHeader.tsx`)
- Each `<Link>` in `NAV_LINKS.map(...)` — add `group` to the `<Link>`, wrap `{link.label}` with `<RollText>`. Remove `hover-wispy` from these links — it applies a `translateY(-3px)` on hover that conflicts with RollText's vertical animation.
- The active `InkUnderline` indicator stays on the `<Link>` — unchanged
- "Full Cart →" link — wrap text with `<RollText>`
- "Hana-Bi" logo link — skip (it has its own `InkUnderline` hover effect, adding RollText would conflict)
- Cart button — skip (it's a `<button>`, not a text link)

### Home page CTAs (`src/app/page.tsx`)
- "Enter Shop" `<Link>` — add `group`, wrap label with `<RollText>`
- "What is Hana-Bi?" `<Link>` — add `group`, wrap label with `<RollText>`
- "View All" `<Link>` — add `group`, wrap label with `<RollText>`
- "Enter Archive" `<Link>` — add `group`, wrap label with `<RollText>`
- "View Dossier" `<Link>` entries — add `group`, wrap label with `<RollText>`

---

## VhFix Component

**File:** `src/components/common/VhFix.tsx`

```tsx
'use client';

import { useEffect } from 'react';

export function VhFix() {
  useEffect(() => {
    const update = () => {
      const vh = window.innerHeight * 0.01;
      const ovh = window.outerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
      document.documentElement.style.setProperty('--rvh', `${vh}px`);
      document.documentElement.style.setProperty('--ovh', `${ovh}px`);
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  return null;
}
```

- Runs on mount and on every `resize` event
- Sets `--vh`, `--rvh`, `--ovh` — same three variables as MILEZ
- Returns `null` — no DOM output
- Mounted once in `src/app/layout.tsx` inside `<body>`, before `<VideoBackground />`

### Layout integration

Add `<VhFix />` as the first element inside `<body>`, immediately before `<VideoBackground />`. The existing overlay div and `relative z-10` wrapper remain unchanged:

```tsx
// src/app/layout.tsx
import { VhFix } from "@/components/common/VhFix";

<body className={`...`}>
  <VhFix />
  <VideoBackground />
  <div className="fixed inset-0 z-0 bg-[#0e0c0b]/60 pointer-events-none" />
  <div className="relative z-10 flex min-h-screen flex-col">
    <SiteHeader />
    <main className="flex-1">{children}</main>
    <SiteFooter />
  </div>
</body>
```

---

## Files Changed

| File | Action |
|------|--------|
| `src/components/common/RollText.tsx` | Create |
| `src/components/common/VhFix.tsx` | Create |
| `src/components/layout/SiteHeader.tsx` | Modify — add `group` + `<RollText>` to nav links |
| `src/app/page.tsx` | Modify — add `group` + `<RollText>` to CTAs |
| `src/app/layout.tsx` | Modify — add `<VhFix />` |
