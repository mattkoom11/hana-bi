export interface Collection {
  slug: string;
  name: string;
  year: number;
  description: string;
  palette: string[];
}

export const collections: Collection[] = [
  {
    slug: "first-bloom",
    name: "First Bloom",
    year: 2025,
    description:
      "Denim pieces with botanical brushwork, documenting the early sketches of Hana-Bi.",
    palette: ["#1a1614", "#2d1f1b", "#d9c6af"],
  },
  {
    slug: "runway-01",
    name: "Runway 01",
    year: 2025,
    description:
      "Debut runway looks exploring protective silhouettes and sashiko constellations.",
    palette: ["#101010", "#3a3029", "#cab18f"],
  },
  {
    slug: "archive-capsule",
    name: "Archive Capsule",
    year: 2024,
    description:
      "Limited garments preserved for the Hana-Bi library, occasionally reissued.",
    palette: ["#0f0c0a", "#4a4036", "#c8b8a6"],
  },
];

