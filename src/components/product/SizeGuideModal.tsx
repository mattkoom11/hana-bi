"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const MEASUREMENTS = [
  { label: "Shoulder", value: "38cm" },
  { label: "Chest", value: "92cm" },
  { label: "Waist", value: "74cm" },
  { label: "Hip", value: "98cm" },
];

export function SizeGuideModal() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <button className="text-xs uppercase tracking-[0.3em] text-[var(--hb-smoke)] border-b border-[var(--hb-border)]">
          Size Guide
        </button>
      </DialogTrigger>
      <DialogContent className="bg-[var(--hb-paper)] border border-[var(--hb-border)] max-w-md [&>button]:text-[var(--hb-smoke)] [&>button]:hover:text-[var(--hb-ink)]">
        <DialogHeader>
          <DialogTitle className="uppercase text-xs tracking-[0.35em] text-[var(--hb-smoke)] font-normal">
            Measurements
          </DialogTitle>
        </DialogHeader>
        <ul className="space-y-2 mt-2">
          {MEASUREMENTS.map((measure) => (
            <li
              key={measure.label}
              className="flex items-center justify-between text-sm"
            >
              <span>{measure.label}</span>
              <span className="text-[var(--hb-smoke)]">{measure.value}</span>
            </li>
          ))}
        </ul>
        <p className="text-[0.75rem] text-[var(--hb-smoke)] mt-4">
          Measurements based on sample size M. Adjustments available in studio fittings.
        </p>
      </DialogContent>
    </Dialog>
  );
}

