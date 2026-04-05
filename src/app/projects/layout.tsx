import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Projects — Hana-Bi",
  description:
    "Personal sewing projects documenting garment construction, pattern drafting, and textile techniques. Not for sale.",
  openGraph: {
    title: "Projects — Hana-Bi",
    description:
      "Personal sewing projects documenting garment construction, pattern drafting, and textile techniques.",
  },
};

export default function ProjectsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
