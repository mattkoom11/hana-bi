"use client";

/**
 * HomeProcessStage — Act 2 of the homepage (the process story). A thin
 * client wrapper around ScrollStage: the `center` render-prop can't cross
 * the server/client boundary as a prop from an async server page, so this
 * component owns it locally instead.
 */

import { ScrollStage, type ScrollStageStep } from "@/components/scroll/ScrollStage";
import { TurntableObject } from "@/components/media/TurntableObject";

// Real piece labels from the production marker — the geometry on screen
// changes as the story moves. Never invent labels; see design/ASSETS.md.
const PIECES = ["1 FT-2S", "8 BK PKT PTCH-2S", "7 BK YOKE-2S", "5 LT FT BTN FLY-1S"];

const PROCESS: ScrollStageStep[] = [
  {
    eyebrow: "01 — Draft",
    title: "It starts in pencil.",
    body: "Pattern paper, a rule, and a hand-made block. Every project starts with a pattern which outlines the DNA of the garment.",
    caption: "Piece 1 — front, cut 2 self · 44.24 × 14.05 in",
  },
  {
    eyebrow: "02 — Pattern",
    title: "Paper becomes shape.",
    body: "Panels are cut, notched and labelled. Ranging from extravagant designs to humble blueprints, there is no end to what Hana-Bi is willing to create.",
    caption: "Piece 8 — back patch pocket, cut 2 self",
  },
  {
    eyebrow: "03 — Fabric",
    title: "Shape becomes cloth.",
    body: "The block is laid on the bolt and traced. Fabric is sourced only from the best international mills.",
    caption: "Piece 7 — back yoke, cut 2 self · 3.44 × 11.01 in",
  },
  {
    eyebrow: "04 — Machine",
    title: "Cloth becomes garment.",
    body: "Cut panels go under the needle. Manufacturing is taken north to New York, where the Garment District hosts a web of dreams.",
    caption: "Piece 5 — left front button fly, cut 1",
  },
];

export function HomeProcessStage() {
  return (
    <ScrollStage
      steps={PROCESS}
      variant="dark"
      center={(i) => (
        <TurntableObject
          patternUrl="/patterns/AX100-SELF-36.json"
          pieceName={PIECES[i]}
          size={560}
          speed={0.16}
          style={{ opacity: 0.92 }}
        />
      )}
    />
  );
}
