# Video Background — Design Spec
**Date:** 2026-04-04
**Status:** Approved by user

---

## Overview

A persistent, full-viewport video background that plays across the entire site. Two 3-second MP4 clips crossfade on a 20-second interval, creating a living ambient texture. The video is suppressed enough (20–30% effective presence) to never compete with content, but noticeable enough to feel alive — especially on dark sections.

---

## Approach

Single `VideoBackground` client component in the root layout. Two stacked `<video>` elements crossfade via opacity transitions. A clip array at the top of the component makes adding new videos a one-line change.

---

## Component: `VideoBackground`

**File:** `src/components/layout/VideoBackground.tsx`

- `'use client'` — uses `useEffect` and `useState` for crossfade timer
- Fixed position, `inset-0`, `z-index: -1`, full viewport
- Two stacked `<video>` elements absolutely positioned on top of each other
  - Both: `autoPlay muted loop playsInline`, `object-fit: cover`, `w-full h-full`
  - Active clip: `opacity-100`
  - Inactive clip: `opacity-0`
  - Transition: `transition-opacity duration-[2000ms]` (2s crossfade)
- Clip array at top of file — adding a video = one new string:
  ```ts
  const CLIPS = [
    "/videos/clip-01.mp4",
    "/videos/clip-02.mp4",
  ];
  ```
- On mount: picks a random starting clip index
- Every 20 seconds: advances to next clip (wraps), swaps which `<video>` is active
- Uses two refs (`videoA`, `videoB`) to preload the next clip's `src` before the crossfade begins

---

## Overlay System

Two overlay layers sit above the video (`z-index: 0`) but below all page content (`z-index: 1+`):

1. **Dark base overlay** — `fixed inset-0 bg-[#0e0c0b]/65` — always present, brings video to ambient level on dark sections
2. **Light section bleed** — light-themed `PageShell` and section backgrounds use `bg-[var(--hb-paper)]/85` (semi-transparent) instead of fully opaque, allowing ~15% video bleed on paper sections

No second overlay div needed — the semi-transparent light backgrounds handle suppression naturally via CSS stacking.

---

## Layout Integration

`src/app/layout.tsx` — rendered as the first child inside `<body>`, before `<SiteHeader>`:

```tsx
<body>
  <VideoBackground />
  <div className="flex min-h-screen flex-col relative z-10">
    <SiteHeader />
    <main className="flex-1">{children}</main>
    <SiteFooter />
  </div>
</body>
```

The `relative z-10` wrapper ensures all page content stacks above the fixed video layer.

---

## Video Files

- Location: `public/videos/clip-01.mp4`, `public/videos/clip-02.mp4`
- Format: MP4 (H.264), web-optimized (`-movflags faststart`)
- MOV files must be converted to MP4 before use
- Target: under 3MB per clip (3s clips should compress to ~1–2MB)
- Recommended ffmpeg conversion command:
  ```bash
  ffmpeg -i input.mov -vcodec h264 -acodec aac -movflags faststart public/videos/clip-01.mp4
  ```

---

## Light Section Adjustment

Sections that use `PageShell` with the default (light/paper) variant currently have opaque backgrounds. To allow subtle video bleed on light sections, the light `PageShell` background should use `bg-[var(--hb-paper)]/85` instead of a fully opaque color. This is a targeted change to `src/components/layout/PageShell.tsx` for the light variant only.

---

## Scaling

Adding new clips in the future: append to the `CLIPS` array in `VideoBackground.tsx`. No other changes needed. The crossfade system handles any number of clips.

---

## Files Changed

| File | Action |
|------|--------|
| `src/components/layout/VideoBackground.tsx` | Create |
| `src/app/layout.tsx` | Modify — add `<VideoBackground />`, wrap content in `z-10` div |
| `src/components/layout/PageShell.tsx` | Modify — light variant background to `bg-[var(--hb-paper)]/85` |
| `public/videos/clip-01.mp4` | Add (user provides) |
| `public/videos/clip-02.mp4` | Add (user provides) |
