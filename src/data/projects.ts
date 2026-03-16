/**
 * Personal Sewing Projects Data
 *
 * This file contains data for personal sewing projects that are documented
 * but not for sale. Projects are separate from products in the shop.
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
  materials: string;
  techniques: string[];
  pattern?: string; // Pattern name or "self-drafted"
  fabric?: string; // Fabric details
  notes: string;
  processNotes?: string; // Detailed process documentation
  heroImage: string;
  images: string[];
  tags: string[];
  year: number;
  startedDate?: string; // ISO date string (optional)
  completedDate?: string; // ISO date string (optional)
}

export const projects: Project[] = [
  {
    id: "jp-vintage-jacket",
    slug: "japanese-vintage-jacket",
    name: "Japanese Vintage-Inspired Denim Jacket",
    status: "completed",
    description:
      "A reconstructed denim jacket inspired by 1980s Japanese streetwear, featuring hand-stitched sashiko details and custom pocket arrangements.",
    story:
      "Started this project after finding a vintage pattern in a Kyoto thrift shop. The original was too small, so I scaled it up and added my own modifications. The sashiko stitching along the collar and cuffs took about 12 hours total, but the texture is worth it.",
    materials:
      "Deadstock Japanese selvedge denim (12oz), vintage brass buttons, natural cotton thread for sashiko.",
    techniques: ["sashiko", "pattern-drafting", "hand-stitching"],
    pattern: "Vintage pattern (modified and scaled up)",
    fabric: "Indigo selvedge denim from a small Osaka mill",
    notes:
      "First time working with selvedge denim - the fabric has beautiful character but required a lot of hand-finishing.",
    processNotes:
      "Month 1: Pattern drafting and fabric sourcing. Month 2: Construction and sashiko stitching. Month 3: Finishing and buttonholes. Learned a lot about traditional Japanese construction techniques.",
    heroImage:
      "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=1000&q=80",
    images: [
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1504593811423-6dd665756598?auto=format&fit=crop&w=900&q=80",
    ],
    tags: ["denim", "vintage", "japanese", "sashiko", "outerwear"],
    year: 2025,
    startedDate: "2025-01-15",
    completedDate: "2025-03-22",
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
    materials: "Natural linen (7oz), bias binding from vintage haberdashery stash.",
    techniques: ["bias-binding", "draping", "hand-finishing"],
    pattern: "Self-drafted",
    fabric: "Italian linen from local fabric shop",
    notes: "Currently working on the sleeve construction. The fabric is prone to wrinkling but the drape is beautiful.",
    processNotes:
      "Week 1-2: Pattern development and muslin fitting. Week 3: Cutting and initial construction. Week 4 (current): Sleeve fitting and adjustments needed.",
    heroImage:
      "https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1200&q=80",
    images: [
      "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=1000&q=80",
    ],
    tags: ["dress", "linen", "wrap", "summer", "self-drafted"],
    year: 2025,
    startedDate: "2025-03-10",
  },
  {
    id: "kimono-reconstruction",
    slug: "kimono-reconstruction",
    name: "Vintage Kimono Reconstruction",
    status: "on_hold",
    description:
      "Deconstructing a damaged vintage kimono to create a modern jacket with preserved traditional elements.",
    story:
      "Found this beautiful but damaged kimono at a flea market in Tokyo. The body fabric is too worn to save, but the sleeves and collar have incredible hand-painted details. Planning to salvage those pieces and create something new.",
    materials: "Vintage silk kimono fabric, coordinating silk lining, vintage buttons.",
    techniques: ["deconstruction", "reconstruction", "pattern-making"],
    pattern: "Self-drafted (adapting traditional kimono structure)",
    fabric: "Vintage silk kimono (damaged, being salvaged)",
    notes: "On hold while researching traditional kimono construction methods to honor the original piece.",
    heroImage:
      "https://images.unsplash.com/photo-1495121605193-b116b5b09d59?auto=format&fit=crop&w=1200&q=80",
    images: [],
    tags: ["kimono", "vintage", "reconstruction", "silk", "traditional"],
    year: 2024,
    startedDate: "2024-11-20",
  },
  {
    id: "workwear-apron",
    slug: "workwear-apron",
    name: "Heavy-Duty Workwear Apron",
    status: "planning",
    description:
      "A functional work apron inspired by Japanese workwear and traditional European craftsman aprons.",
    story:
      "Need something durable for studio work that looks good too. Planning a split-leg design with multiple pockets and reinforced stress points. Taking inspiration from both Japanese workwear and European artisan aprons.",
    materials: "Heavy canvas (12oz), leather straps, brass hardware, reinforced stitching.",
    techniques: ["pattern-drafting", "leather-working", "heavy-duty-construction"],
    pattern: "Self-drafted (in planning)",
    fabric: "Undecided - canvas vs. waxed canvas vs. denim",
    notes: "Still researching materials and finalizing the design. Want it to be both functional and beautiful.",
    heroImage:
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=1000&q=80",
    images: [],
    tags: ["apron", "workwear", "functional", "canvas", "planning"],
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
