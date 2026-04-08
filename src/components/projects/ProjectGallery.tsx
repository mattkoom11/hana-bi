"use client";

import { useState } from "react";
import Image from "next/image";
import { MarginNote } from "@/components/common/MarginNote";
import { Badge } from "@/components/common/Badge";
import { ImageLightbox } from "@/components/common/ImageLightbox";
import type { Project } from "@/data/projects";

const STATUS_LABELS: Record<Project["status"], string> = {
  completed: "Completed",
  in_progress: "In Progress",
  on_hold: "On Hold",
  planning: "Planning",
};

const STATUS_TONES: Record<Project["status"], "sienna" | "smoke" | "ink"> = {
  completed: "sienna",
  in_progress: "ink",
  on_hold: "smoke",
  planning: "smoke",
};

interface ProjectGalleryProps {
  project: Project;
}

export function ProjectGallery({ project }: ProjectGalleryProps) {
  const statusLabel = STATUS_LABELS[project.status];
  const statusTone = STATUS_TONES[project.status];

  // All images: hero first, then extras
  const allImages = [project.heroImage, ...project.images];
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  return (
    <>
      <div className="relative space-y-6">
        {/* Hero image */}
        <div
          className="relative w-full aspect-[3/4] overflow-hidden -rotate-[0.5deg] cursor-zoom-in"
          onClick={() => setLightboxIndex(0)}
        >
          {/* Hand-drawn border overlay */}
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none z-20"
            viewBox="0 0 400 533"
            preserveAspectRatio="none"
            style={{ opacity: 0.25 }}
          >
            <defs>
              <linearGradient id="hero-frame-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="var(--hb-ink)" stopOpacity="0.4" />
                <stop offset="50%" stopColor="var(--hb-ink)" stopOpacity="0.2" />
                <stop offset="100%" stopColor="var(--hb-ink)" stopOpacity="0.35" />
              </linearGradient>
            </defs>
            <path
              d="M 10,10 Q 14,8 18,10 Q 200,6 382,10 Q 386,8 390,10 Q 390,14 390,18 Q 394,266 390,515 Q 390,519 390,523 Q 386,525 382,523 Q 200,527 18,523 Q 14,525 10,523 Q 10,519 10,515 Q 6,266 10,18 Q 10,14 10,10 Z"
              fill="none"
              stroke="url(#hero-frame-gradient)"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              vectorEffect="non-scaling-stroke"
            />
          </svg>
          <div className="relative w-full h-full">
            <Image
              src={project.heroImage}
              alt={project.name}
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 65vw"
              priority
              unoptimized
            />
            <div className="absolute top-6 left-6 z-10">
              <Badge tone={statusTone}>{statusLabel}</Badge>
            </div>
            {project.year && (
              <MarginNote position="top-right" variant="script" size="xs">
                {project.year}
              </MarginNote>
            )}
          </div>
        </div>

        {/* Thumbnails */}
        {project.images.length > 0 && (
          <div className="grid grid-cols-3 gap-4">
            {project.images.map((image, idx) => (
              <div
                key={image}
                className="relative aspect-[4/5] overflow-hidden cursor-zoom-in"
                style={{ transform: `rotate(${idx % 2 === 0 ? "0.8deg" : "-0.8deg"})` }}
                onClick={() => setLightboxIndex(idx + 1)}
              >
                <svg
                  className="absolute inset-0 w-full h-full pointer-events-none z-10"
                  viewBox="0 0 200 250"
                  preserveAspectRatio="none"
                  style={{ opacity: 0.2 }}
                >
                  <defs>
                    <linearGradient id={`thumb-frame-${idx}`} x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="var(--hb-ink)" stopOpacity="0.3" />
                      <stop offset="100%" stopColor="var(--hb-ink)" stopOpacity="0.2" />
                    </linearGradient>
                  </defs>
                  <path
                    d="M 5,5 Q 7,4 9,5 Q 100,3 191,5 Q 193,4 195,5 Q 195,7 195,9 Q 197,125 195,241 Q 195,243 195,245 Q 193,246 191,245 Q 100,247 9,245 Q 7,246 5,245 Q 5,243 5,241 Q 3,125 5,9 Q 5,7 5,5 Z"
                    fill="none"
                    stroke={`url(#thumb-frame-${idx})`}
                    strokeWidth="1"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    vectorEffect="non-scaling-stroke"
                  />
                </svg>
                <Image
                  src={image}
                  alt={`${project.name} view ${idx + 1}`}
                  fill
                  sizes="(max-width: 768px) 33vw, 200px"
                  className="object-cover relative z-0"
                  unoptimized
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {lightboxIndex !== null && (
        <ImageLightbox
          images={allImages}
          initialIndex={lightboxIndex}
          alt={project.name}
          onClose={() => setLightboxIndex(null)}
        />
      )}
    </>
  );
}
