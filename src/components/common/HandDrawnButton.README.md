# HandDrawnButton Component

A sophisticated button component with hand-drawn, imperfect borders and organic animations. Designed for fashion brands and art studios that value artisanal authenticity.

## Features

### Visual Design
- **Uneven Borders**: Slightly imperfect SVG paths with seeded randomness
- **Ink-Like Outline**: SVG displacement mapping for organic roughness
- **Double Strokes**: Ghost variant features subtle double outlines
- **Inner Pooling**: Primary variant shows ink pooling effect on inner border
- **Subtle Texture**: Fine grain overlay for paper-like feel

### Animations
- **Subtle Wobble**: Gentle rotation (0.3-0.5°) combined with lift on hover
- **Organic Easing**: Extended 700ms transitions with `cubic-bezier(0.19, 1, 0.22, 1)`
- **Border Thickening**: Outlines become slightly bolder on hover
- **Smooth Transforms**: Hardware-accelerated translations and rotations

### Technical
- **Consistent Rendering**: Seeded random ensures borders don't change on re-render
- **SVG Filters**: Fractal noise + displacement mapping for authenticity
- **Performance**: GPU-accelerated animations, minimal DOM updates
- **Accessible**: Proper focus states, loading indicators, disabled states

## Usage

### Basic Example

```tsx
import { HandDrawnButton } from "@/components/common/HandDrawnButton";

// Primary button
<HandDrawnButton variant="primary" onClick={handleClick}>
  Add to Cart
</HandDrawnButton>

// Ghost button
<HandDrawnButton variant="ghost" onClick={handleLearnMore}>
  Learn More
</HandDrawnButton>
```

### With Loading State

```tsx
const [loading, setLoading] = useState(false);

<HandDrawnButton 
  variant="primary" 
  loading={loading}
  onClick={async () => {
    setLoading(true);
    await handleCheckout();
    setLoading(false);
  }}
>
  {loading ? "Processing..." : "Checkout"}
</HandDrawnButton>
```

### Disabled State

```tsx
<HandDrawnButton 
  variant="primary" 
  disabled={!selectedSize}
>
  {selectedSize ? "Add to Cart" : "Select Size"}
</HandDrawnButton>
```

### Custom Sizing

```tsx
// Small
<HandDrawnButton 
  variant="ghost" 
  className="px-6 py-3 text-[0.65rem]"
>
  Small Button
</HandDrawnButton>

// Default (no extra classes needed)
<HandDrawnButton variant="primary">
  Default Size
</HandDrawnButton>

// Large
<HandDrawnButton 
  variant="primary" 
  className="px-10 py-5 text-sm"
>
  Large Button
</HandDrawnButton>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `"primary" \| "ghost"` | `"primary"` | Visual style variant |
| `loading` | `boolean` | `false` | Shows loading spinner |
| `disabled` | `boolean` | `false` | Disables interaction |
| `className` | `string` | - | Additional CSS classes |
| `onClick` | `(e: MouseEvent) => void` | - | Click handler |

All standard HTML button attributes are supported.

## Variants

### Primary
- Filled with ink black background
- Off-white text color
- Inner border shows ink pooling effect
- Subtle wobble rotates 0.5° on hover

**Use for:** Primary actions, main CTAs, "Add to Cart", "Checkout"

```tsx
<HandDrawnButton variant="primary">
  Primary Action
</HandDrawnButton>
```

### Ghost
- Transparent background
- Ink black text
- Double-stroke outline effect
- Subtle wobble rotates -0.3° on hover
- Background tints on hover

**Use for:** Secondary actions, "Learn More", "View Details", subtle CTAs

```tsx
<HandDrawnButton variant="ghost">
  Secondary Action
</HandDrawnButton>
```

## Design Details

### Uneven Borders

Each button generates a unique but consistent border path using seeded randomness:

```tsx
const jitter = 0.8; // Amount of imperfection
const corners = [
  { x: 0 + (random() - 0.5) * jitter, y: 0 + (random() - 0.5) * jitter },
  // ... 3 more corners
];
```

Corners are connected with quadratic bezier curves instead of straight lines to simulate hand-drawn strokes.

### SVG Filters

Two filters create the hand-drawn effect:

**Roughness Filter:**
```xml
<feTurbulence 
  type="fractalNoise" 
  baseFrequency="0.5" 
  numOctaves="2" 
/>
<feDisplacementMap scale="0.4" />
```

**Ink Filter:**
```xml
<feGaussianBlur stdDeviation="0.3" />
<feComponentTransfer>
  <feFuncA type="discrete" tableValues="0 1" />
</feComponentTransfer>
```

### Hover Behavior

On hover (when not disabled):
- Button lifts 2px upward
- Rotates 0.3-0.5° (direction varies by variant)
- Border thickens from 1.5px to 1.8px
- Inner ink border becomes more visible (primary)
- Background tints slightly (ghost)

All transitions use 700ms duration with organic easing.

### Paper Texture

Subtle SVG noise overlay at 2-4% opacity:

```tsx
backgroundImage: url("data:image/svg+xml,...")
backgroundSize: 100px 100px
mix-blend-mode: multiply
```

## Styling Guidelines

### Color Customization

Buttons use CSS variables for colors:

```css
--hb-ink: #1a1a1a;           /* Border and text */
--hb-ink-light: #2a2929;     /* Hover background */
--hb-paper: #faf8f4;         /* Primary text color */
--hb-paper-muted: #f5f2ed;   /* Ghost hover background */
--hb-smoke-light: #8a8580;   /* Disabled state */
```

### Typography

Default typography settings:
- `text-xs` (12px)
- `uppercase`
- `tracking-[0.35em]` (very wide letter spacing)
- `font-sans`

Override with className:

```tsx
<HandDrawnButton className="text-sm tracking-[0.4em]">
  Custom Type
</HandDrawnButton>
```

### Spacing

Default padding: `px-8 py-4` (32px horizontal, 16px vertical)

Adjust via className:

```tsx
<HandDrawnButton className="px-6 py-3">
  Compact
</HandDrawnButton>

<HandDrawnButton className="px-12 py-6">
  Spacious
</HandDrawnButton>
```

## Design Philosophy

### Not Playful or Childish

These buttons avoid common hand-drawn pitfalls:
- ✅ Subtle imperfections, not exaggerated wobbles
- ✅ Refined rotations (< 1°), not cartoonish tilts
- ✅ Sophisticated color palette, not bright primaries
- ✅ Slow animations (700ms), not bouncy springs
- ✅ Artisanal aesthetic, not playful doodles

### Fashion / Art Studio Aesthetic

The design language is:
- **Handcrafted**: Every border is unique but tasteful
- **Artisanal**: Celebrates imperfection as a design choice
- **Sophisticated**: Refined enough for luxury brands
- **Organic**: Movements feel natural, not digital
- **Minimal**: Restrained color palette, elegant typography

### Inspiration

Think of:
- Fashion designer's sketch notebooks
- Art gallery exhibition labels
- Hand-annotated lookbooks
- Studio work-in-progress sketches
- Artisan ink drawings on paper

## Accessibility

- Semantic `<button>` element
- Proper `:focus-visible` ring for keyboard navigation
- Loading state shows spinner + reduces opacity
- Disabled state clearly indicated visually
- Sufficient color contrast (WCAG AA+)
- Touch targets meet 48x48px minimum

## Performance

- SVG filters are GPU-accelerated
- Seeded random prevents re-calculation on hover
- Minimal JavaScript (only hover state tracking)
- No external dependencies
- Renders efficiently on mobile devices

## Browser Support

Works in all modern browsers:
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- iOS Safari 14+
- Chrome Mobile

SVG filters and CSS transforms have excellent support across target browsers.

## Examples in Context

### E-commerce Product Page

```tsx
<div className="space-y-4">
  <HandDrawnButton 
    variant="primary" 
    disabled={!selectedSize}
    onClick={handleAddToCart}
    className="w-full"
  >
    {selectedSize ? "Add to Cart" : "Select Size"}
  </HandDrawnButton>
  
  <HandDrawnButton 
    variant="ghost"
    onClick={handleWishlist}
    className="w-full"
  >
    Save to Wishlist
  </HandDrawnButton>
</div>
```

### Hero Section CTAs

```tsx
<div className="flex gap-4">
  <HandDrawnButton variant="primary">
    Explore Collection
  </HandDrawnButton>
  
  <HandDrawnButton variant="ghost">
    Our Story
  </HandDrawnButton>
</div>
```

### Form Submit

```tsx
<form onSubmit={handleSubmit}>
  {/* form fields */}
  
  <HandDrawnButton 
    type="submit" 
    variant="primary"
    loading={isSubmitting}
    disabled={!isValid}
  >
    {isSubmitting ? "Sending..." : "Submit"}
  </HandDrawnButton>
</form>
```

## Troubleshooting

### Borders look too jagged

Reduce `jitter` value in component (line ~24):
```tsx
const jitter = 0.5; // Less imperfection
```

### Wobble feels too strong

Adjust rotation degrees in hover style (line ~129):
```tsx
rotate(${variant === "primary" ? "0.3deg" : "-0.2deg"})
```

### Animations too slow

Change duration in baseStyles (line ~118):
```tsx
transition-all duration-500 // Faster (was 700ms)
```

## Related Components

- **Button** - Standard refined buttons with ripple effect
- **HandDrawnArrow** - Matching arrow component for pointing
- **ScribbleUnderline** - Hand-drawn underlines for text emphasis

## Demo

View live examples at `/handdrawn-buttons-demo`
