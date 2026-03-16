'use client';

import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { ReactNode } from "react";

interface GalleryItem {
  id: string;
  label: string;
  caption?: string;
  metadata?: string;
}

interface ModalGalleryProps {
  items: GalleryItem[];
  isOpen: boolean;
  currentIndex: number;
  onClose: () => void;
  onNext: () => void;
  onPrev: () => void;
}

export function ModalGallery({
  items,
  isOpen,
  currentIndex,
  onClose,
  onNext,
  onPrev,
}: ModalGalleryProps) {
  const currentItem = items[currentIndex];

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
    if (e.key === 'ArrowLeft') onPrev();
    if (e.key === 'ArrowRight') onNext();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
            aria-hidden="true"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed inset-4 md:inset-12 z-50 flex flex-col items-center justify-center"
            onKeyDown={handleKeyDown}
            tabIndex={-1}
            role="dialog"
            aria-modal="true"
            aria-label={`Gallery image ${currentIndex + 1} of ${items.length}`}
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 bg-[var(--hb-paper)]/90 hover:bg-[var(--hb-paper)] rounded-full transition-colors z-10"
              aria-label="Close gallery"
            >
              <X size={24} />
            </button>

            {/* Image placeholder */}
            <div className="w-full h-full max-w-4xl max-h-[80vh] bg-gradient-to-br from-[var(--hb-paper-muted)] to-[var(--hb-border)] rounded-2xl flex items-center justify-center relative overflow-hidden">
              <div className="text-center p-8">
                <p className="font-serif text-2xl mb-2">{currentItem.label}</p>
                {currentItem.caption && (
                  <p className="text-[var(--hb-smoke)] mb-4">{currentItem.caption}</p>
                )}
                {currentItem.metadata && (
                  <p className="text-sm font-script text-[var(--hb-smoke-light)]">{currentItem.metadata}</p>
                )}
              </div>
            </div>

            {/* Navigation buttons */}
            {items.length > 1 && (
              <>
                <button
                  onClick={onPrev}
                  className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-[var(--hb-paper)]/90 hover:bg-[var(--hb-paper)] rounded-full transition-colors"
                  aria-label="Previous image"
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M15 18l-6-6 6-6" />
                  </svg>
                </button>
                <button
                  onClick={onNext}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-[var(--hb-paper)]/90 hover:bg-[var(--hb-paper)] rounded-full transition-colors"
                  aria-label="Next image"
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 18l6-6-6-6" />
                  </svg>
                </button>
              </>
            )}

            {/* Counter */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 bg-[var(--hb-paper)]/90 rounded-full text-sm font-script">
              {currentIndex + 1} / {items.length}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

