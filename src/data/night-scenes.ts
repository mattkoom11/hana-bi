// The relaunch site's "one night in New York" story, in order.
// Swapping in real footage means changing `clip` (and adding `poster`) here — nothing else.
//
// PLACEHOLDERS (2026-11-26): every clip is a stand-in from the current site's library and still
// carries the Japanese imagery the relaunch drops; every line is draft copy pending the name,
// anchor words and voice. Do not ship as is.

export type NightScene = {
  id: string;
  /** Mono label, e.g. "01 · Street". */
  label: string;
  clip: string;
  poster?: string;
  /** One line, said once. */
  line: string;
};

export const NIGHT_SCENES: NightScene[] = [
  { id: "street", label: "01 · Street", clip: "/videos/clip-15.mp4", line: "Wear it late." },
  { id: "cab", label: "02 · Cab", clip: "/videos/clip-04.mp4", line: "Somewhere downtown." },
  { id: "bar", label: "03 · Bar", clip: "/videos/clip-03.mp4", line: "Second set. Second pour." },
  { id: "corridor", label: "04 · Corridor", clip: "/videos/clip-09.mp4", line: "The door was left open." },
  { id: "atelier", label: "05 · Atelier", clip: "/videos/clip-17.mp4", line: "Where the night was made." },
];

/** Where the atelier (the shop) lives until the relaunch has its own. */
export const ATELIER_HREF = "/shop";
