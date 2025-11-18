"use client";

import { useState } from "react";

const MEASUREMENTS = [
  { label: "Shoulder", value: "38cm" },
  { label: "Chest", value: "92cm" },
  { label: "Waist", value: "74cm" },
  { label: "Hip", value: "98cm" },
];

export function SizeGuideModal() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="text-xs uppercase tracking-[0.3em] text-[var(--hb-smoke)] border-b border-[var(--hb-border)]"
      >
        Size Guide
      </button>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-[var(--hb-paper)] border border-[var(--hb-border)] p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <p className="uppercase text-xs tracking-[0.35em] text-[var(--hb-smoke)]">
                Measurements
              </p>
              <button
                className="text-xs uppercase tracking-[0.3em]"
                onClick={() => setOpen(false)}
              >
                Close
              </button>
            </div>
            <ul className="space-y-2">
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
              Measurements based on sample size M. Adjustments available in
              studio fittings.
            </p>
          </div>
        </div>
      )}
    </>
  );
}

