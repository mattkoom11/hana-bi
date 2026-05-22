# Size Chart Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the placeholder `SizeGuideModal` with a real size chart from the AX100 spec sheet — 7 core fit measurements across sizes 28–36, with an inches ↔ cm unit toggle.

**Architecture:** Data lives in `src/data/size-chart.ts` as a typed constant. `SizeGuideModal.tsx` is rewritten to consume it with a scrollable table and unit toggle. `ProductDetailHero.tsx` gets one import and one render call.

**Tech Stack:** Next.js 15 App Router, TypeScript, Tailwind CSS, shadcn `Dialog` (already installed)

---

## File Map

| Action | File | Responsibility |
|--------|------|----------------|
| Create | `src/data/size-chart.ts` | All measurement data in decimal inches |
| Rewrite | `src/components/product/SizeGuideModal.tsx` | Dialog with unit toggle + scrollable table |
| Edit | `src/components/product/ProductDetailHero.tsx` | Import + render `<SizeGuideModal />` |

---

## Task 1: Create the size chart data file

**Files:**
- Create: `src/data/size-chart.ts`

- [ ] **Step 1: Create `src/data/size-chart.ts` with the following content**

```ts
export type SizeKey = "28" | "29" | "30" | "31" | "32" | "33" | "34" | "35" | "36";

export interface Measurement {
  id: number;
  label: string;
  values: Record<SizeKey, number>;
}

export const SIZES: SizeKey[] = ["28", "29", "30", "31", "32", "33", "34", "35", "36"];

export const SIZE_CHART: Measurement[] = [
  {
    id: 1,
    label: "Waist Circumference",
    values: { "28": 28.5, "29": 29.5, "30": 30.5, "31": 31.5, "32": 32.5, "33": 33.5, "34": 34.5, "35": 35.5, "36": 36.5 },
  },
  {
    id: 5,
    label: "Front Rise (incl. WB)",
    values: { "28": 10.875, "29": 11.0625, "30": 11.25, "31": 11.4375, "32": 11.625, "33": 11.8125, "34": 12.0, "35": 12.1875, "36": 12.375 },
  },
  {
    id: 6,
    label: "Back Rise (incl. WB)",
    values: { "28": 14.125, "29": 14.3125, "30": 14.5, "31": 14.6875, "32": 14.875, "33": 15.0625, "34": 15.25, "35": 15.4375, "36": 15.625 },
  },
  {
    id: 9,
    label: "Inseam",
    values: { "28": 33.0, "29": 33.0, "30": 33.0, "31": 33.0, "32": 33.0, "33": 33.0, "34": 33.0, "35": 33.0, "36": 33.0 },
  },
  {
    id: 11,
    label: "Thigh Circumference",
    values: { "28": 20.75, "29": 21.375, "30": 22.0, "31": 22.625, "32": 23.25, "33": 23.875, "34": 24.5, "35": 25.125, "36": 25.75 },
  },
  {
    id: 12,
    label: "Knee Circumference",
    values: { "28": 19.125, "29": 19.5625, "30": 20.0, "31": 20.4375, "32": 20.875, "33": 21.3125, "34": 21.75, "35": 22.1875, "36": 22.625 },
  },
  {
    id: 13,
    label: "Bottom Hem Circumference",
    values: { "28": 18.75, "29": 19.125, "30": 19.5, "31": 19.875, "32": 20.25, "33": 20.625, "34": 21.0, "35": 21.375, "36": 21.75 },
  },
];
```

- [ ] **Step 2: Verify TypeScript is satisfied**

```bash
cd c:/hana-bi && npx tsc --noEmit
```

Expected: no errors related to `size-chart.ts`. (Ignore any pre-existing errors unrelated to this file.)

- [ ] **Step 3: Commit**

```bash
cd c:/hana-bi && git add src/data/size-chart.ts && git commit -m "feat: add AX100 size chart data (7 core measurements, sizes 28-36)"
```

---

## Task 2: Rewrite SizeGuideModal

**Files:**
- Modify: `src/components/product/SizeGuideModal.tsx`

- [ ] **Step 1: Replace the entire contents of `src/components/product/SizeGuideModal.tsx`**

```tsx
"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { SIZE_CHART, SIZES } from "@/data/size-chart";
import type { SizeKey } from "@/data/size-chart";

type Unit = "in" | "cm";

function fmt(inches: number, unit: Unit): string {
  if (unit === "cm") return (inches * 2.54).toFixed(1);
  return `${inches}"`;
}

export function SizeGuideModal() {
  const [unit, setUnit] = useState<Unit>("in");

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button className="text-xs uppercase tracking-[0.3em] text-[var(--hb-smoke)] border-b border-[var(--hb-border)]">
          Size Guide
        </button>
      </DialogTrigger>
      <DialogContent className="bg-[var(--hb-paper)] border border-[var(--hb-border)] max-w-2xl sm:max-w-2xl [&>button]:text-[var(--hb-smoke)] [&>button]:hover:text-[var(--hb-ink)]">
        <div className="flex items-center justify-between">
          <DialogTitle className="uppercase text-xs tracking-[0.35em] text-[var(--hb-smoke)] font-normal">
            Size Chart
          </DialogTitle>
          <div className="flex gap-1" style={{ fontFamily: "var(--hb-font-mono)" }}>
            {(["in", "cm"] as Unit[]).map((u) => (
              <button
                key={u}
                onClick={() => setUnit(u)}
                className={`px-2 py-0.5 text-[0.65rem] uppercase tracking-[0.2em] border transition ${
                  unit === u
                    ? "border-[var(--hb-ink)] bg-[var(--hb-ink)] text-[var(--hb-paper)]"
                    : "border-[var(--hb-border)] text-[var(--hb-smoke)]"
                }`}
              >
                {u}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto mt-2">
          <table
            className="w-full text-xs"
            style={{ fontFamily: "var(--hb-font-mono)" }}
          >
            <thead>
              <tr className="border-b border-[var(--hb-border)]">
                <th className="text-left py-2 pr-4 font-normal text-[var(--hb-smoke)] uppercase tracking-[0.2em] whitespace-nowrap">
                  Measurement
                </th>
                {SIZES.map((s) => (
                  <th
                    key={s}
                    className="py-2 px-2 font-normal text-[var(--hb-smoke)] uppercase tracking-[0.15em] text-center"
                  >
                    {s}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {SIZE_CHART.map((m, i) => (
                <tr
                  key={m.id}
                  className={i % 2 === 0 ? "bg-[var(--hb-paper-muted)]/30" : ""}
                >
                  <td className="py-2 pr-4 text-[var(--hb-smoke)] whitespace-nowrap">
                    {m.label}
                  </td>
                  {SIZES.map((s) => (
                    <td
                      key={s}
                      className="py-2 px-2 text-center text-[var(--hb-ink)]"
                    >
                      {fmt(m.values[s as SizeKey], unit)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="text-[0.7rem] text-[var(--hb-smoke)] mt-3 leading-relaxed">
          All measurements are finished measurements in{" "}
          {unit === "in" ? "inches" : "centimeters"}. Tolerance: ±½
          {unit === "in" ? '"' : " cm"} on waist and inseam, ±¼
          {unit === "in" ? '"' : " cm"} on rise and circumferences.
        </p>
      </DialogContent>
    </Dialog>
  );
}
```

- [ ] **Step 2: Verify TypeScript is satisfied**

```bash
cd c:/hana-bi && npx tsc --noEmit
```

Expected: no errors related to `SizeGuideModal.tsx`.

- [ ] **Step 3: Commit**

```bash
cd c:/hana-bi && git add src/components/product/SizeGuideModal.tsx && git commit -m "feat: rewrite SizeGuideModal with real AX100 spec data and unit toggle"
```

---

## Task 3: Wire SizeGuideModal into ProductDetailHero

**Files:**
- Modify: `src/components/product/ProductDetailHero.tsx`

- [ ] **Step 1: Add the import at the top of `src/components/product/ProductDetailHero.tsx`**

Find this block (around line 9):

```tsx
import { StackedImageCarousel } from "@/components/product/StackedImageCarousel";
```

Add one line after it:

```tsx
import { SizeGuideModal } from "@/components/product/SizeGuideModal";
```

- [ ] **Step 2: Render `<SizeGuideModal />` in the details panel**

Find this block (around line 147):

```tsx
          {/* Purchase action */}
          <div className="pt-2">
            {purchaseSlot ?? <ShopWaitlistForm dark />}
          </div>
```

Replace it with:

```tsx
          {/* Size guide */}
          <SizeGuideModal />

          {/* Purchase action */}
          <div className="pt-2">
            {purchaseSlot ?? <ShopWaitlistForm dark />}
          </div>
```

- [ ] **Step 3: Verify TypeScript is satisfied**

```bash
cd c:/hana-bi && npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 4: Commit**

```bash
cd c:/hana-bi && git add src/components/product/ProductDetailHero.tsx && git commit -m "feat: wire SizeGuideModal into product detail hero"
```

---

## Task 4: Verify in browser

- [ ] **Step 1: Start the dev server**

```bash
cd c:/hana-bi && npm run dev
```

- [ ] **Step 2: Open a product page**

Navigate to `http://localhost:3000/product/<any-slug>` (use a slug from `src/data/products.ts` if Stripe is not configured, e.g. the first product's slug).

- [ ] **Step 3: Check the Size Guide trigger**

Confirm "SIZE GUIDE" appears as a small link below the Collection field in the dark details panel on the right.

- [ ] **Step 4: Open the modal and check the table**

Click the trigger. Confirm:
- Dialog opens with title "SIZE CHART"
- IN / CM pill buttons appear top-right
- Table shows 7 rows (Waist Circumference through Bottom Hem Circumference)
- Columns are labeled 28 through 36
- Values look correct for size 30: waist 30.5", front rise 11.25", inseam 33.0"

- [ ] **Step 5: Test the unit toggle**

Click CM. Confirm values update — waist size 30 should read `77.5` (30.5 × 2.54 = 77.47 → `77.5`).

- [ ] **Step 6: Test mobile scroll**

Narrow the browser window to ~375px. Confirm the table scrolls horizontally inside the dialog without breaking the dialog layout.
