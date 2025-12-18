# Sketchbook Hero Section

A hand-drawn, sketchbook-inspired hero section that captures the artistic, imperfect beauty of a fashion designer's creative process.

## Features

### Visual Design
- **Large Serif Headlines**: Clean, elegant typography with generous spacing
- **Scribble Underlines**: Hand-drawn scribble strokes under key words
- **Paper Texture**: Subtle SVG-based grain overlay for authentic sketchbook feel
- **Hand-Drawn Arrow**: Organic arrow pointing to primary CTA
- **Decorative Sketches**: Subtle circular and wave elements for ambiance

### Animations
- **Organic Fade-In**: Staggered entrance with custom easing
- **Custom Easing**: `cubic-bezier(0.19, 1, 0.22, 1)` for natural movement
- **Sequential Reveals**: Each element animates in order with proper delays
- **Subtle Transforms**: Gentle translations and rotations for organic feel

### Responsive Design
- **Mobile-First**: Fully responsive from 320px to 4K
- **Adaptive Arrow**: Different arrow positions for mobile vs desktop
- **Flexible Typography**: Scales smoothly across all breakpoints
- **Touch-Optimized**: Buttons and interactive elements sized for mobile

## Components

### SketchbookHero
Main hero section component with all content and animations.

```tsx
import { SketchbookHero } from "@/components/home/SketchbookHero";

<SketchbookHero />
```

### ScribbleUnderline
Hand-drawn scribble underline effect for emphasizing words.

**Props:**
- `className?: string` - Additional CSS classes
- `width?: number` - Width in pixels (default: 200)
- `height?: number` - Height in pixels (default: 20)
- `strokeWidth?: number` - Line thickness (default: 1.5)
- `opacity?: number` - Overall opacity (default: 0.6)
- `variant?: "loose" | "tight" | "chaotic"` - Style variant

**Usage:**
```tsx
<span className="relative">
  <span className="relative z-10">underlined text</span>
  <ScribbleUnderline
    className="left-0 bottom-0"
    width={160}
    variant="loose"
    opacity={0.5}
  />
</span>
```

### HandDrawnArrow
Sketchy, imperfect arrow for pointing to CTAs.

**Props:**
- `className?: string` - Additional CSS classes
- `direction?: "down-right" | "down-left" | "right" | "down"` - Arrow direction
- `size?: number` - Size in pixels (default: 80)
- `strokeWidth?: number` - Line thickness (default: 1.5)
- `opacity?: number` - Overall opacity (default: 0.5)

**Usage:**
```tsx
<HandDrawnArrow
  direction="down-right"
  size={120}
  opacity={0.35}
/>
```

## Design Philosophy

### Handcrafted & Imperfect
The hero section celebrates imperfection as a design choice. Every element—from the wobbly underlines to the organic arrow curves—reinforces the handmade aesthetic.

### Fashion Designer Sketchbook
Inspired by the loose sketches and annotations found in fashion designers' notebooks, where ideas flow freely and perfection takes a backseat to expression.

### Minimal Color Palette
- **Off-White Background**: `var(--hb-paper)` - Warm, paper-like
- **Charcoal Text**: `var(--hb-smoke)` - Soft, readable body text
- **Ink Black**: `var(--hb-ink)` - Sharp contrast for headlines and accents

### Organic Timing
Animations use deliberate, slow timing to mimic the natural pace of hand-drawing. Nothing snaps or jerks—everything flows with organic easing.

## Technical Details

### SVG Filters
Both scribble underlines and hand-drawn arrows use SVG displacement mapping with fractal noise to create authentic roughness:

```svg
<filter id="roughness">
  <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="2" />
  <feDisplacementMap scale="0.8" />
</filter>
```

### Paper Texture
Layered SVG noise pattern for subtle grain:

```css
background-image: url("data:image/svg+xml,...");
opacity: 0.03;
```

### Animation Staggering
Each element has progressively longer delays:
- Eyebrow: 0ms delay
- Headline: 150ms delay
- Subheading: 300ms delay
- CTAs: 450ms delay
- Note: 600ms delay
- Arrow: 700ms delay
- Decorations: 900-1000ms delay

### Custom Easing
All animations use `cubic-bezier(0.19, 1, 0.22, 1)` which provides:
- Slow, deliberate start
- Organic acceleration
- Gentle deceleration
- Natural landing

## Customization

### Changing Headlines
Edit the text in `SketchbookHero.tsx`:

```tsx
<h1>
  <span className="relative">
    Your text
    <ScribbleUnderline variant="loose" />
  </span>
</h1>
```

### Adjusting Colors
Update CSS variables in `globals.css`:

```css
--hb-paper: #faf8f4;
--hb-ink: #1a1a1a;
--hb-smoke: #6b6660;
```

### Animation Speed
Modify duration classes:
- `duration-1000` = 1 second
- `duration-1200` = 1.2 seconds
- `duration-1500` = 1.5 seconds

### Scribble Style
Change the `variant` prop:
- `loose` - Relaxed, flowing (default)
- `tight` - More controlled lines
- `chaotic` - Multiple overlapping lines

## Accessibility

- Semantic HTML5 structure
- Proper heading hierarchy
- Sufficient color contrast ratios
- Reduced motion support (can be added via prefers-reduced-motion)
- Touch targets sized appropriately (48x48px minimum)

## Performance

- Client-side rendered with React hooks
- SVG filters are GPU-accelerated
- No external dependencies beyond React
- Minimal JavaScript for mounting state
- CSS animations preferred over JS

## Browser Support

Works in all modern browsers:
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari 14+, Chrome Mobile)

SVG filters and CSS animations have excellent support across all target browsers.
