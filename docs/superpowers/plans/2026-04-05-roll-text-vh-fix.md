# RollText + VhFix Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a squish-roll text hover animation component (`RollText`) to nav links and CTAs, and a mobile viewport height fix (`VhFix`) that sets `--vh`/`--rvh`/`--ovh` CSS custom properties.

**Architecture:** `RollText` is a pure presentational `<span>` wrapper — two copies of the text stacked, animated with Tailwind `group-hover:` transforms. `VhFix` is a `'use client'` no-output component that runs a `resize` listener. Both are dropped into `src/components/common/`. Consuming components add `group` to their wrapper and wrap label text with `<RollText>`.

**Tech Stack:** Next.js 16 App Router, React 19, Tailwind CSS v4, TypeScript.

---

## File Map

**Create:**
- `src/components/common/RollText.tsx`
- `src/components/common/VhFix.tsx`

**Modify:**
- `src/app/layout.tsx` — add `<VhFix />`
- `src/components/layout/SiteHeader.tsx` — add `group` + `<RollText>` to nav links, remove `hover-wispy` from nav links
- `src/app/page.tsx` — add `group` + `<RollText>` to CTAs

---

## Task 1: Create `VhFix` component and wire into layout

**Files:**
- Create: `src/components/common/VhFix.tsx`
- Modify: `src/app/layout.tsx`

- [ ] **Step 1: Create `src/components/common/VhFix.tsx`**

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

- [ ] **Step 2: Add `<VhFix />` to `src/app/layout.tsx`**

Add the import at the top of the file alongside the other layout imports:
```tsx
import { VhFix } from "@/components/common/VhFix";
```

Then add `<VhFix />` as the first element inside `<body>`, immediately before `<VideoBackground />`:
```tsx
<body className={`${hanabiSerif.variable} ${hanabiSans.variable} ${hanabiScript.variable} ${cormorant.variable} ${dmMono.variable} antialiased min-h-screen`}>
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

- [ ] **Step 3: Verify TypeScript**

```bash
cd c:\hana-bi && npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 4: Commit**

```bash
cd c:\hana-bi && git add src/components/common/VhFix.tsx src/app/layout.tsx && git commit -m "feat: add VhFix component — sets --vh/--rvh/--ovh CSS vars for mobile viewport"
```

---

## Task 2: Create `RollText` component

**Files:**
- Create: `src/components/common/RollText.tsx`

- [ ] **Step 1: Create `src/components/common/RollText.tsx`**

```tsx
interface RollTextProps {
  children: string;
  className?: string;
}

export function RollText({ children, className }: RollTextProps) {
  const easing = 'cubic-bezier(0.23, 1, 0.32, 1)';

  return (
    <span className={`relative inline-block overflow-hidden leading-[1] ${className ?? ''}`}>
      {/* Top copy — squishes upward on hover */}
      <span
        className="block group-hover:translate-y-[-110%] group-hover:scale-y-[4] transition-transform duration-[600ms] origin-bottom leading-[1]"
        style={{ transitionTimingFunction: easing }}
        aria-hidden="false"
      >
        {children}
      </span>
      {/* Bottom copy — rolls in from below on hover */}
      <span
        className="block absolute inset-0 translate-y-[100%] scale-y-[4] group-hover:translate-y-0 group-hover:scale-y-[1] transition-transform duration-[600ms] origin-top leading-[1]"
        style={{ transitionTimingFunction: easing }}
        aria-hidden="true"
      >
        {children}
      </span>
    </span>
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
cd c:\hana-bi && git add src/components/common/RollText.tsx && git commit -m "feat: add RollText component — squish-roll text hover animation"
```

---

## Task 3: Apply `RollText` to `SiteHeader` nav links

**Files:**
- Modify: `src/components/layout/SiteHeader.tsx`

**Context:** The nav links currently use `hover-wispy` which applies `translateY(-3px)` on hover — this conflicts with RollText's vertical animation. Remove it from nav links only. The Hana-Bi logo link and Cart button are left unchanged.

- [ ] **Step 1: Update `src/components/layout/SiteHeader.tsx`**

Add the import at the top:
```tsx
import { RollText } from "@/components/common/RollText";
```

Replace the `NAV_LINKS.map(...)` block (currently lines 82–103) with:
```tsx
{NAV_LINKS.map((link) => {
  const isActive =
    link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
  return (
    <Link
      key={link.href}
      href={link.href}
      className={`group pb-2 relative transition-all duration-300 ${
        isActive
          ? isDark ? "text-[#faf8f4]" : "text-[var(--hb-ink)]"
          : isDark ? "hover:text-[#faf8f4]" : "hover:text-[var(--hb-ink-light)]"
      }`}
    >
      <RollText>{link.label}</RollText>
      {isActive && (
        <span className="absolute bottom-0 left-0 right-0 flex justify-center text-[var(--hb-sienna)]">
          <InkUnderline width={60} variant="wispy" strokeOpacity={0.6} />
        </span>
      )}
    </Link>
  );
})}
```

Replace the "Full Cart →" link (currently after the map) with:
```tsx
<Link
  href="/cart"
  className={`group ml-auto border-b border-dashed pb-2 transition-all duration-300 ${
    isDark
      ? "text-[var(--hb-dark-muted)] border-[var(--hb-dark-border)] hover:text-[#faf8f4]"
      : "text-[var(--hb-ink-light)] border-[var(--hb-border)] border-opacity-40 hover:border-opacity-70"
  }`}
>
  <RollText>Full Cart →</RollText>
</Link>
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

Open `http://localhost:3000`. Hover over nav links — the label text should squish upward and a fresh copy rolls in from below. The sienna InkUnderline active indicator should still appear under the active link. The Hana-Bi logo and Cart button should be unchanged.

- [ ] **Step 4: Commit**

```bash
cd c:\hana-bi && git add src/components/layout/SiteHeader.tsx && git commit -m "feat: apply RollText to SiteHeader nav links"
```

---

## Task 4: Apply `RollText` to home page CTAs

**Files:**
- Modify: `src/app/page.tsx`

**Context:** Five links on the home page get the roll effect: "Enter Shop", "What is Hana-Bi?", "View All", "Enter Archive", and each "View Dossier" link. Add `group` to each `<Link>` and wrap the label text with `<RollText>`.

- [ ] **Step 1: Add the `RollText` import to `src/app/page.tsx`**

Add to the existing import block at the top of the file:
```tsx
import { RollText } from "@/components/common/RollText";
```

- [ ] **Step 2: Update the "Enter Shop" link**

Replace:
```tsx
<Link
  href="/shop"
  className="bg-[var(--hb-sienna)] text-[#faf8f4] uppercase tracking-[0.4em] px-8 py-4 text-xs hover-wispy opacity-90 hover:opacity-100 transition-opacity"
  style={{ fontFamily: "var(--hb-font-mono)" }}
>
  Enter Shop
</Link>
```

With:
```tsx
<Link
  href="/shop"
  className="group bg-[var(--hb-sienna)] text-[#faf8f4] uppercase tracking-[0.4em] px-8 py-4 text-xs opacity-90 hover:opacity-100 transition-opacity"
  style={{ fontFamily: "var(--hb-font-mono)" }}
>
  <RollText>Enter Shop</RollText>
</Link>
```

- [ ] **Step 3: Update the "What is Hana-Bi?" link**

Replace:
```tsx
<Link
  href="/about"
  className="border border-[rgba(250,248,244,0.25)] text-[rgba(250,248,244,0.7)] uppercase tracking-[0.4em] px-8 py-4 text-xs hover:text-[#faf8f4] hover:border-[rgba(250,248,244,0.5)] transition-all duration-300"
  style={{ fontFamily: "var(--hb-font-mono)" }}
>
  What is Hana-Bi?
</Link>
```

With:
```tsx
<Link
  href="/about"
  className="group border border-[rgba(250,248,244,0.25)] text-[rgba(250,248,244,0.7)] uppercase tracking-[0.4em] px-8 py-4 text-xs hover:text-[#faf8f4] hover:border-[rgba(250,248,244,0.5)] transition-all duration-300"
  style={{ fontFamily: "var(--hb-font-mono)" }}
>
  <RollText>What is Hana-Bi?</RollText>
</Link>
```

- [ ] **Step 4: Update the "View All" link**

Replace:
```tsx
<Link
  href="/shop"
  className="text-xs uppercase tracking-[0.4em] border-b border-[var(--hb-dark-border)] pb-1.5 text-[var(--hb-dark-muted)] hover:text-[#faf8f4] hover:border-[var(--hb-sienna)] transition-all duration-300"
  style={{ fontFamily: "var(--hb-font-mono)" }}
>
  View All
</Link>
```

With:
```tsx
<Link
  href="/shop"
  className="group text-xs uppercase tracking-[0.4em] border-b border-[var(--hb-dark-border)] pb-1.5 text-[var(--hb-dark-muted)] hover:text-[#faf8f4] hover:border-[var(--hb-sienna)] transition-all duration-300"
  style={{ fontFamily: "var(--hb-font-mono)" }}
>
  <RollText>View All</RollText>
</Link>
```

- [ ] **Step 5: Update the "Enter Archive" link**

Replace:
```tsx
<Link
  href="/archive"
  className="text-xs uppercase tracking-[0.4em] border-b border-dashed border-[var(--hb-dark-border)] pb-1.5 text-[var(--hb-dark-muted)] opacity-70 hover:opacity-100 transition-opacity"
  style={{ fontFamily: "var(--hb-font-mono)" }}
>
  Enter Archive
</Link>
```

With:
```tsx
<Link
  href="/archive"
  className="group text-xs uppercase tracking-[0.4em] border-b border-dashed border-[var(--hb-dark-border)] pb-1.5 text-[var(--hb-dark-muted)] opacity-70 hover:opacity-100 transition-opacity"
  style={{ fontFamily: "var(--hb-font-mono)" }}
>
  <RollText>Enter Archive</RollText>
</Link>
```

- [ ] **Step 6: Update the "View Dossier" links**

Replace:
```tsx
<Link
  href={`/product/${piece.slug}`}
  className="text-xs uppercase tracking-[0.4em] border-b border-dashed border-[var(--hb-dark-border)] pb-1 inline-block opacity-70 hover:opacity-100 transition-opacity"
  style={{ fontFamily: "var(--hb-font-mono)", color: "var(--hb-sienna)" }}
>
  View Dossier
</Link>
```

With:
```tsx
<Link
  href={`/product/${piece.slug}`}
  className="group text-xs uppercase tracking-[0.4em] border-b border-dashed border-[var(--hb-dark-border)] pb-1 inline-block opacity-70 hover:opacity-100 transition-opacity"
  style={{ fontFamily: "var(--hb-font-mono)", color: "var(--hb-sienna)" }}
>
  <RollText>View Dossier</RollText>
</Link>
```

- [ ] **Step 7: Verify TypeScript**

```bash
cd c:\hana-bi && npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 8: Visual check**

With the dev server running, open `http://localhost:3000`. Hover over each of the five CTAs — "Enter Shop", "What is Hana-Bi?", "View All", "Enter Archive", "View Dossier" — and confirm the roll animation fires on each.

- [ ] **Step 9: Commit**

```bash
cd c:\hana-bi && git add src/app/page.tsx && git commit -m "feat: apply RollText to home page CTAs"
```

---

## Self-Review

**Spec coverage:**
- ✅ `RollText` — two stacked spans, `group-hover:` transforms, 600ms, quint easing — Task 2
- ✅ `VhFix` — sets `--vh`, `--rvh`, `--ovh` on mount and resize — Task 1
- ✅ `VhFix` mounted first in `<body>` before `<VideoBackground />` — Task 1
- ✅ Nav links: `group` added, `hover-wispy` removed, label wrapped with `<RollText>` — Task 3
- ✅ Hana-Bi logo and Cart button left unchanged — Task 3
- ✅ "Full Cart →" wrapped with `<RollText>` — Task 3
- ✅ All five home page CTAs wrapped with `<RollText>` — Task 4
- ✅ `aria-hidden="true"` on duplicate copy — Task 2

**Placeholder scan:** None. All code blocks are complete.

**Type consistency:** `RollText` accepts `children: string` — all usages pass string literals or static strings. No dynamic content passed to `RollText`.
