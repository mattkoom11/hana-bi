/**
 * Personal Sewing Projects Data
 *
 * Project statuses:
 * - "in_progress" - Currently being worked on
 * - "completed" - Finished project
 * - "on_hold" - Temporarily paused
 * - "planning" - In the planning/drafting phase
 */

export type ProjectStatus = "in_progress" | "completed" | "on_hold" | "planning";

export interface Project {
  id: string;
  slug: string;
  name: string;
  status: ProjectStatus;
  description: string;
  story: string;
  fabric?: string;
  heroImage: string;
  images: string[];
  year: number;
}

export const projects: Project[] = [
  {
    id: "pl-wool-trousers",
    slug: "pleated-wool-trousers",
    name: "Pleated Wool Trousers",
    status: "completed",
    description:
      "Featuring two inverted box pleats on the front, these trousers flow with the body. Despite being made out of wool, the trousers maintain a light and airy feel.",
    story:
      "Modern dress trousers are too tight and constricted. They conform to the body rather than flow with it. I wanted to create a pair of trousers that were comfortable and stylish, but also practical and durable. I also needed a pair of winter dress pants to wear to the NieR concert in New York! I took out the back darts typically present on dress pants and used yokes instead. The overall construction is much more reminiscent of a piece of workwear rather than a piece of dresswear.",
    fabric: "Japanese wool blend herringbone (10 oz) from Yoshiwa Mills. (70%C 25%W 5%N)",
    heroImage: "/projects/wool-trousers-hero.png",
    images: [
      "/projects/wool-trousers-2.png",
      "/projects/wool-trousers-3.png",
      "/projects/wool-trousers-4.png",
      "/projects/wool-trousers-5.png",
      "/projects/wool-trousers-6.png",
    ],
    year: 2026,
  },
  {
    id: "linen-wrap-dress",
    slug: "linen-wrap-dress",
    name: "Linen Wrap Dress",
    status: "in_progress",
    description:
      "A midi-length wrap dress in undyed linen with contrasting bias binding and hand-finished hems.",
    story:
      "Inspired by 1970s French fashion photography. Wanted something light and airy for summer that could be dressed up or down. The wrap construction is trickier than it looks - getting the drape right took several muslins.",
    fabric: "Italian linen from local fabric shop",
    heroImage:
      "https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1200&q=80",
    images: [
      "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=1000&q=80",
    ],
    year: 2025,
  },
];

export const getProjectBySlug = (slug: string) =>
  projects.find((project) => project.slug === slug);

export const getProjectsByStatus = (status: ProjectStatus) =>
  projects.filter((project) => project.status === status);

export const getCompletedProjects = () =>
  projects.filter((project) => project.status === "completed");

export const getActiveProjects = () =>
  projects.filter(
    (project) => project.status === "in_progress" || project.status === "planning"
  );
