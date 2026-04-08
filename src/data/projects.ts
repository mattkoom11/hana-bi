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
    heroImage: "/projects/wool-trousers-media/wool-trousers-hero.webp",
    images: [
      "/projects/wool-trousers-media/wool-trousers-1.webp",
      "/projects/wool-trousers-media/wool-trousers-2.webp",
      "/projects/wool-trousers-media/wool-trousers-3.webp",
      "/projects/wool-trousers-media/wool-trousers-4.webp",
      "/projects/wool-trousers-media/wool-trousers-5.webp",
    ],
    year: 2026,
  },
  {
    id: "pl-denim-shorts",
    slug: "pleated-denim-shorts",
    name: "Pleated Denim Shorts",
    status: "completed",
    description:
      "A medium length pair of pleated denim shorts, featuring two inverted box pleats on the front. The waistband is made of a different herringbone denim.",
    story:
      "My little sister wanted a pair of jorts for the warmer Spring and Summer weather. I added some pleats to create a voluminous thigh and leg opening. The waistband is a result of me running out of fabric...",
    fabric: "Japanese herringbone denim from Nihon Menpu Mills. (100%C) / Japanese Selvedge Denim from Nihon Menpu Mills. (100%C)",
    heroImage:
      "/projects/pleated-jorts-media/pleated-jorts-hero.webp",
    images: [
      "/projects/pleated-jorts-media/pleated-jorts-2.webp",
      "/projects/pleated-jorts-media/pleated-jorts-3.webp",
      "/projects/pleated-jorts-media/pleated-jorts-4.webp",
      "/projects/pleated-jorts-media/pleated-jorts-5.webp",
      "/projects/pleated-jorts-media/pleated-jorts-6.webp",
    ],
    year: 2026,
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
