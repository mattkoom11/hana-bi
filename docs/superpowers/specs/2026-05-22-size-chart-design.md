# Size Chart — Design Spec

**Date:** 2026-05-22  
**Source:** AX100 Tech Pack (Stellar Fashion Consulting), pages 9–10  
**Style:** Men's Straight Leg Jeans, sizes 28–36, sample size 30

---

## Goal

Replace the placeholder `SizeGuideModal` (4 hardcoded measurements, single size) with a real size chart drawn from the AX100 spec sheet. Show 7 core fit measurements across all 9 sizes (28–36) with an inches ↔ cm unit toggle.

---

## Files

| Action | File |
|--------|------|
| New | `src/data/size-chart.ts` |
| Rewrite | `src/components/product/SizeGuideModal.tsx` |
| Edit | `src/components/product/ProductDetailHero.tsx` |

---

## Data layer — `src/data/size-chart.ts`

```ts
export type SizeKey = "28" | "29" | "30" | "31" | "32" | "33" | "34" | "35" | "36";

export interface Measurement {
  id: number;
  label: string;
  values: Record<SizeKey, number>; // all values in decimal inches
}

export const SIZES: SizeKey[] = ["28","29","30","31","32","33","34","35","36"];
export const SIZE_CHART: Measurement[] = [ /* 7 entries */ ];
```

### 7 core measurements (from spec POMs 1, 5, 6, 9, 11, 12, 13)

All values in decimal inches. Fractions converted: e.g. `1 5/8 → 1.625`, `11 1/16 → 11.0625`.

| # | Label | 28 | 29 | 30 | 31 | 32 | 33 | 34 | 35 | 36 |
|---|-------|----|----|----|----|----|----|----|----|----|
| 1 | Waist Circumference | 28.5 | 29.5 | 30.5 | 31.5 | 32.5 | 33.5 | 34.5 | 35.5 | 36.5 |
| 5 | Front Rise (incl. WB) | 10.875 | 11.0625 | 11.25 | 11.4375 | 11.625 | 11.8125 | 12.0 | 12.1875 | 12.375 |
| 6 | Back Rise (incl. WB) | 14.125 | 14.3125 | 14.5 | 14.6875 | 14.875 | 15.0625 | 15.25 | 15.4375 | 15.625 |
| 9 | Inseam | 33.0 | 33.0 | 33.0 | 33.0 | 33.0 | 33.0 | 33.0 | 33.0 | 33.0 |
| 11 | Thigh Circumference | 20.75 | 21.375 | 22.0 | 22.625 | 23.25 | 23.875 | 24.5 | 25.125 | 25.75 |
| 12 | Knee Circumference | 19.125 | 19.5625 | 20.0 | 20.4375 | 20.875 | 21.3125 | 21.75 | 22.1875 | 22.625 |
| 13 | Bottom Hem Circumference | 18.75 | 19.125 | 19.5 | 19.875 | 20.25 | 20.625 | 21.0 | 21.375 | 21.75 |

**Data note:** POM #10 (sideseam) size 36 reads `25.75"` in the PDF — a column-shift artifact; the correct value (`43.25"`) can be inferred from the +⅛" per size pattern. POM #10 is not included in the chart so this has no effect here.

---

## Component — `SizeGuideModal.tsx`

- `"use client"` — needs `useState` for unit toggle
- State: `unit: "in" | "cm"`, default `"in"`
- Trigger: existing `<button>` style — `text-xs uppercase tracking-[0.3em] text-[var(--hb-smoke)] border-b border-[var(--hb-border)]`
- Uses existing shadcn `Dialog` / `DialogContent` already installed

### Layout inside the dialog

```
DialogHeader
  title: "SIZE CHART"          (mono, smoke, xs, tracking-[0.35em])
  unit toggle: [IN] [CM]       (pill buttons, right-aligned)

<table>  (horizontally scrollable wrapper on mobile)
  thead: Size | 28 | 29 | 30 | 31 | 32 | 33 | 34 | 35 | 36
  tbody: one row per measurement
    col 0: measurement label   (smoke, xs)
    cols 1–9: formatted value  (ink, xs mono)

footer note (xs, smoke):
  "All measurements are finished measurements in [inches/cm].
   Tolerance: ±½\" on waist and inseam, ±¼\" on rise and circumferences."
```

### Unit formatting

```ts
function fmt(inches: number, unit: "in" | "cm"): string {
  if (unit === "cm") return `${(inches * 2.54).toFixed(1)}`;
  return `${inches}"`;
}
```

### Dialog width

`max-w-2xl` to accommodate the 10-column table comfortably on desktop. Scrollable on mobile.

---

## Wiring — `ProductDetailHero.tsx`

Import `SizeGuideModal` and render it in the details panel, directly below the Collection field and above the purchase slot:

```tsx
<SizeGuideModal />
```

No props needed — the modal is self-contained.

---

## Out of scope

- No per-product size chart variation (one chart fits AX100; future products can extend `size-chart.ts`)
- No highlighted "selected size" column (no active size selector in the current preorder flow)
- No standalone `/size-guide` page
