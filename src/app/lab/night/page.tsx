import type { Metadata } from "next";
import { NightStory } from "@/components/relaunch/NightStory";
import { ATELIER_HREF, NIGHT_SCENES } from "@/data/night-scenes";

// Relaunch experiment — the "one night" landing with placeholder clips and copy.
export const metadata: Metadata = {
  title: "Lab · One night",
  robots: { index: false, follow: false },
};

export default function NightPage() {
  return <NightStory scenes={NIGHT_SCENES} atelierHref={ATELIER_HREF} />;
}
