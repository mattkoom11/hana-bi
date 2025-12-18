# Sketchbook Hero Components - Quick Start Guide

A collection of hand-drawn, sketchbook-inspired components for creating authentic, artistic hero sections.

## Components Overview

### 1. SketchbookHero
**Location:** `src/components/home/SketchbookHero.tsx`

The main hero section component with all elements integrated.

**Usage:**
```tsx
import { SketchbookHero } from "@/components/home/SketchbookHero";

export default function Page() {
  return <SketchbookHero />;
}
```

**Features:**
- Staggered fade-in animations
- Responsive design (mobile to desktop)
- Hand-drawn underlines and arrows
- Subtle paper texture overlay
- Decorative sketch elements

---

### 2. ScribbleUnderline
**Location:** `src/components/home/ScribbleUnderline.tsx`

Hand-drawn scribble underlines for emphasizing words.

**Basic Usage:**
```tsx
import { ScribbleUnderline } from "@/components/home/ScribbleUnderline";

<span className="relative">
  <span className="relative z-10">your text</span>
  <ScribbleUnderline 
    className="left-0 bottom-0"
    width={160}
    variant="loose"
  />
</span>
```

**Props:**
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `width` | `number` | `200` | Width in pixels |
| `height` | `number` | `20` | Height in pixels |
| `strokeWidth` | `number` | `1.5` | Line thickness |
| `opacity` | `number` | `0.6` | Overall opacity (0-1) |
| `variant` | `"loose" \| "tight" \| "chaotic"` | `"loose"` | Style variant |
| `seed` | `number` | `42` | Random seed for consistent renders |
| `className` | `string` | - | Additional CSS classes |

**Variants:**
- `loose` - Relaxed, flowing lines (2 strokes)
- `tight` - More controlled lines (2 strokes)  
- `chaotic` - Multiple overlapping lines (3 strokes)

**Examples:**
```tsx
// Loose underline (casual)
<ScribbleUnderline variant="loose" width={120} opacity={0.5} seed={42} />

// Tight underline (controlled)
<ScribbleUnderline variant="tight" width={150} opacity={0.6} seed={84} />

// Chaotic underline (emphatic)
<ScribbleUnderline variant="chaotic" width={200} opacity={0.45} seed={123} />
```

---

### 3. HandDrawnArrow
**Location:** `src/components/home/HandDrawnArrow.tsx`

Sketchy arrows for pointing to CTAs and important elements.

**Basic Usage:**
```tsx
import { HandDrawnArrow } from "@/components/home/HandDrawnArrow";

<HandDrawnArrow 
  direction="down-right"
  size={100}
  opacity={0.4}
/>
```

**Props:**
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `direction` | `"down-right" \| "down-left" \| "right" \| "down"` | `"down-right"` | Arrow direction |
| `size` | `number` | `80` | Size in pixels |
| `strokeWidth` | `number` | `1.5` | Line thickness |
| `opacity` | `number` | `0.5` | Overall opacity (0-1) |
| `className` | `string` | - | Additional CSS classes |

**Direction Options:**
- `down-right` - Diagonal arrow pointing down and right
- `down-left` - Diagonal arrow pointing down and left
- `right` - Horizontal arrow pointing right
- `down` - Vertical arrow pointing down

**Examples:**
```tsx
// Desktop: Large arrow pointing to CTA
<HandDrawnArrow 
  direction="down-right" 
  size={120} 
  opacity={0.35}
  className="hidden lg:block"
/>

// Mobile: Small arrow above button
<HandDrawnArrow 
  direction="down" 
  size={60} 
  opacity={0.5}
  className="lg:hidden"
/>
```

---

## Complete Example

Here's a complete example of building a custom hero section:

```tsx
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/common/Button";
import { ScribbleUnderline } from "@/components/home/ScribbleUnderline";
import { HandDrawnArrow } from "@/components/home/HandDrawnArrow";
import Link from "next/link";

export function CustomHero() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <section className="relative min-h-screen flex items-center justify-center bg-[var(--hb-paper)]">
      {/* Paper texture */}
      <div 
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,...")`,
        }}
      />

      <div className="relative z-10 px-8 py-16 max-w-6xl mx-auto">
        {/* Headline with scribble */}
        <h1 className={`
          font-serif text-7xl leading-tight
          transition-all duration-1200 ease-[cubic-bezier(0.19,1,0.22,1)]
          ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}
        `}>
          <span className="relative inline-block">
            <span className="relative z-10">Beautiful</span>
            <ScribbleUnderline 
              className="absolute left-0 bottom-0"
              width={220}
              variant="loose"
              opacity={0.5}
              seed={42}
            />
          </span>
          {" "}denim
        </h1>

        {/* CTA with arrow */}
        <div className="mt-12 relative">
          <HandDrawnArrow 
            direction="down" 
            size={60} 
            opacity={0.4}
            className="absolute -top-16 left-0"
          />
          
          <Link href="/shop">
            <Button variant="primary">
              Shop Now
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
```

---

## Styling Tips

### Paper Texture
Use the data URI SVG for authentic paper grain:

```tsx
style={{
  backgroundImage: `url("data:image/svg+xml,%3Csvg width='200' height='200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23noise)' opacity='0.5'/%3E%3C/svg%3E")`,
  backgroundSize: "200px 200px",
}}
```

### Animation Easing
Use the custom cubic-bezier for organic motion:

```css
transition: all 1200ms cubic-bezier(0.19, 1, 0.22, 1);
```

### Color Palette
Stick to the minimal sketchbook palette:

```css
--hb-paper: #faf8f4;      /* Off-white background */
--hb-ink: #1a1a1a;        /* Ink black for text */
--hb-smoke: #6b6660;      /* Charcoal for body text */
--hb-border: #d4ccc0;     /* Subtle borders */
```

---

## Responsive Best Practices

### Mobile Adjustments
```tsx
// Different arrow directions
<HandDrawnArrow 
  direction="down"           // Mobile
  className="lg:hidden"
/>
<HandDrawnArrow 
  direction="down-right"     // Desktop
  className="hidden lg:block"
/>

// Responsive typography
className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl"

// Flexible scribbles
<ScribbleUnderline 
  className="w-full"  // Scale with container
  width={160}          // Max width
/>
```

---

## Animation Timing

Stagger delays for sequential reveals:

```tsx
// Element 1: No delay
delay-0

// Element 2: 150ms delay
delay-150

// Element 3: 300ms delay  
delay-300

// Element 4: 450ms delay
delay-450
```

---

## Demo Pages

View the components in action:

- **Homepage:** `/` - Full integration
- **Hero Demo:** `/hero-demo` - Isolated hero section with documentation
- **Buttons Demo:** `/buttons-demo` - Button component showcase

---

## Troubleshooting

### Scribbles not showing
- Check that parent has `position: relative`
- Ensure child text has `position: relative` and `z-index: 10`
- Verify width/height props are appropriate for text length

### Animations not working
- Ensure component is client-side (`"use client"`)
- Check that `mounted` state is being set in `useEffect`
- Verify Tailwind classes are not purged

### Arrow positioning off
- Use absolute positioning on arrow container
- Adjust with negative margins or top/left values
- Test on multiple screen sizes

---

## Performance Notes

- SVG filters are GPU-accelerated
- Seeded random ensures consistent renders (no hydration issues)
- Animations use CSS transforms (hardware accelerated)
- No external dependencies beyond React
- Components are tree-shakeable

---

## Browser Support

- Chrome/Edge 90+
- Firefox 88+  
- Safari 14+
- iOS Safari 14+
- Chrome Mobile

All modern browsers support SVG filters and CSS animations used in these components.
