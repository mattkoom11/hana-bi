# Button Component

A refined button component system with sophisticated micro-interactions designed for high-end fashion brands.

## Features

- **Three Variants**: Primary, Secondary, and Ghost
- **Custom Easing**: `cubic-bezier(0.19, 1, 0.22, 1)` for elastic, luxurious feel
- **Ripple Effect**: Subtle, opacity-based ripple emanating from click point
- **Hover States**: Gentle 2px lift with refined shadows
- **Active State**: Subtle scale-down (0.98) for tactile feedback
- **Loading State**: Animated spinner with opacity control
- **Disabled State**: Muted colors with reduced opacity

## Usage

```tsx
import { Button } from "@/components/common/Button";

// Primary button
<Button variant="primary" onClick={handleClick}>
  Add to Cart
</Button>

// Secondary button with loading
<Button 
  variant="secondary" 
  loading={isLoading}
  onClick={handleSave}
>
  Save to Wishlist
</Button>

// Ghost button disabled
<Button variant="ghost" disabled>
  Out of Stock
</Button>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `"primary" \| "secondary" \| "ghost"` | `"primary"` | Visual style variant |
| `loading` | `boolean` | `false` | Shows loading spinner |
| `disabled` | `boolean` | `false` | Disables interaction |
| `className` | `string` | - | Additional CSS classes |
| `onClick` | `(e: MouseEvent) => void` | - | Click handler |

All standard HTML button attributes are supported.

## Interaction Details

### Custom Easing
- Uses `cubic-bezier(0.19, 1, 0.22, 1)` for a refined, elastic feel
- Transitions span 500ms for deliberate, luxurious pace

### Ripple Effect
- Emanates from click point
- 800ms expansion with opacity fade
- Color adapts to variant (light on dark, dark on light)

### Hover States
- Gentle 2px lift: `-translate-y-[2px]`
- Refined shadow with subtle spread
- Background color shifts maintain hierarchy

### Active State
- `scale-[0.98]` on press
- Combined with ripple for layered interaction

## Design Philosophy

The button component embodies understated elegance:
- Minimal but polished
- Refined over flashy
- Deliberate timing over quick snaps
- Subtle depth without heavy shadows
