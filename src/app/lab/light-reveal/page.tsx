import type { Metadata } from "next";
import { LightRevealLab } from "./LightRevealLab";

// Relaunch experiment — not linked from the site and not indexed.
export const metadata: Metadata = {
  title: "Lab · Light reveal",
  robots: { index: false, follow: false },
};

export default function LightRevealPage() {
  return <LightRevealLab />;
}
