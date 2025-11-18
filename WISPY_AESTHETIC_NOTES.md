# Wispy Hand-Drawn Aesthetic Implementation

## Overview

The Hana-Bi website has been transformed to embody a wispy, hand-drawn, handwritten letter aesthetic while maintaining its archival and editorial identity. The design now features delicate, organic lines, airy spacing, and subtle imperfections that evoke the feeling of pen on paper.

## Key Visual Changes

### 1. Typography System

**Fonts:**
- **Serif (Playfair Display)**: Used for major headlines and product names
- **Sans-serif (Space Grotesk)**: Body text and UI elements
- **Script (Kalam)**: New handwritten font for captions, eyebrows, and delicate notes

**Usage:**
- Apply `.font-script` class for handwritten-style text
- Use script font sparingly for labels, captions, and small annotations
- Maintain serif for editorial headlines to preserve the magazine feel

### 2. Color Palette

**Updated Colors:**
- `--hb-ink`: `#1a1a1a` (desaturated, ink-like)
- `--hb-ink-light`: `#2a2929`
- `--hb-ink-lighter`: `#3b3937`
- `--hb-smoke`: `#6b6660` (softer, more muted)
- `--hb-paper`: `#faf8f4` (slightly warmer, softer)
- `--hb-border`: `#d4ccc0` (lighter, more delicate)

**Opacity Usage:**
- Text elements use opacity (70-80%) for a softer, airier feel
- Borders and dividers use 30-40% opacity
- Hover states transition opacity for gentle interactions

### 3. Hand-Drawn Components

#### `InkUnderline`
- Wispy, organic underline with variable stroke width
- Variants: `wispy`, `bold`, `delicate`
- Uses seeded random for consistent rendering
- Opacity: 35-50%

#### `SketchFrame`
- Hand-drawn frame with organic imperfections
- Subtle tilt options: `left`, `right`, `none`
- Wispy borders with gradient strokes
- Opacity: 25-35%

#### `HandDrawnBorder`
- Full, top, bottom, or side borders
- Organic curves with slight jitter
- Gradient strokes for depth

### 4. Spacing & Layout

**Increased Whitespace:**
- `.space-wispy`: 1.5rem between elements
- `.space-airy`: 2.5rem between sections
- Padding increased from `py-16` to `py-20` or `py-24` on major sections
- Gap spacing increased in grids (from `gap-6` to `gap-8`)

**Floating Elements:**
- Cards and frames feel lighter with more breathing room
- Sections separated by wispy gradient dividers instead of solid borders

### 5. Paper Grain Texture

**Background:**
- Subtle SVG noise pattern applied to body
- Opacity: 3% (very faint)
- Creates a paper-like texture without being distracting

### 6. Interactive Elements

**Hover Effects:**
- `.hover-wispy` class provides gentle lift and opacity change
- Transitions use `cubic-bezier(0.4, 0, 0.2, 1)` for organic easing
- Dashed borders on buttons and links for a sketched feel

**Borders:**
- Dashed borders (`border-dashed`) used throughout
- Opacity transitions on hover
- Gradient dividers instead of solid lines

## Component Updates

### Layout Components

**SiteHeader:**
- Wispy gradient bottom border
- Dashed border on cart button
- Script font for cart count badge
- Softer navigation links with opacity transitions

**SiteFooter:**
- Gradient top border
- Script font for copyright
- Dashed borders on links

**PageShell:**
- Increased spacing (`py-20`, `mb-16`)
- Script font for eyebrow text
- Larger, more airy typography
- InkUnderline below titles

### Product Components

**ProductCard:**
- Hover-revealed dashed border
- Script font for collection names
- Increased padding and spacing
- Softer image hover effects

**ProductGrid:**
- Increased gap spacing
- Cards feel more floating

### Pages

**Home:**
- Hero section with larger typography
- InkUnderline below main headline
- SketchFrame for featured garment
- Wispy gradient dividers between sections
- Archive section uses SketchFrames with tilts

**Archive:**
- Museum wall aesthetic with SketchFrames
- Alternating tilts for organic feel
- Dashed borders on status labels
- Script font for collection names

**About:**
- SketchFrames for chapter cards
- Alternating tilts
- InkUnderlines for section dividers
- Studios/Techniques in SketchFrames

**Shop:**
- Uses updated ProductCard components
- Filters maintain wispy aesthetic

## Technical Implementation

### Seeded Random

All hand-drawn components use seeded random number generation for consistent rendering:
- Same seed = same path
- Prevents flickering on re-renders
- Seeds based on variant/tilt for predictable patterns

### SVG Paths

- Organic curves using quadratic and cubic bezier curves
- Variable stroke width through gradients
- Opacity for softness
- `vectorEffect="non-scaling-stroke"` for consistent line weight

### Performance

- SVG components are lightweight
- No large image assets
- CSS-based textures
- Efficient hover transitions

## Future Enhancements

### Expandable Hand-Drawn System

1. **More Border Variants:**
   - Add `HandDrawnDivider` for section separators
   - Create `WispyArrow` for navigation cues
   - `SketchDoodle` for decorative accents

2. **Typography Variations:**
   - Additional script font weights
   - Custom letter-spacing utilities
   - Handwritten number styles

3. **Texture Options:**
   - Multiple paper grain intensities
   - Optional watercolor wash overlays
   - Subtle ink bleed effects

4. **Animation:**
   - Gentle fade-in for SketchFrames
   - Hand-drawing animation on load (optional)
   - Subtle float animations

5. **Component Variants:**
   - `SketchFrame` with different corner styles
   - `InkUnderline` with arrow endings
   - `HandDrawnBorder` with decorative corners

### Customization Points

**To adjust wispiness:**
- Modify `strokeOpacity` props (lower = more wispy)
- Adjust `jitter` amounts in path generation
- Change opacity values in CSS

**To adjust spacing:**
- Update `.space-wispy` and `.space-airy` utilities
- Modify padding values in components
- Adjust gap spacing in grids

**To change colors:**
- Update CSS variables in `globals.css`
- Adjust opacity values throughout

**To add more handwritten elements:**
- Use `.font-script` class on new elements
- Create new SketchFrame variants
- Add InkUnderline to more headings

## Accessibility

- All text maintains sufficient contrast
- Interactive elements have clear hover states
- SVG paths don't interfere with screen readers
- Opacity changes are subtle and don't affect readability

## Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- SVG paths render consistently
- CSS gradients work across all modern browsers
- Fallback: solid borders if SVG fails

