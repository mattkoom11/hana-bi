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

