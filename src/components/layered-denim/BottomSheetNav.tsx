'use client';

import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { useState } from "react";

interface BottomSheetNavProps {
  items: Array<{ label: string; href: string }>;
  isOpen: boolean;
  onClose: () => void;
  onNavigate?: (href: string) => void;
}

export function BottomSheetNav({ items, isOpen, onClose, onNavigate }: BottomSheetNavProps) {
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
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
            aria-hidden="true"
          />
          
          {/* Bottom Sheet */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 bg-[var(--hb-paper)] rounded-t-3xl shadow-2xl z-50 p-6 max-h-[80vh] overflow-y-auto"
            role="dialog"
            aria-modal="true"
            aria-label="Navigation menu"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-serif text-xl">Menu</h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-[var(--hb-paper-muted)] rounded-full transition-colors"
                aria-label="Close menu"
              >
                <X size={24} />
              </button>
            </div>
            
            <nav className="space-y-4">
              {items.map((item, index) => (
                <motion.a
                  key={item.href}
                  href={item.href}
                  onClick={(e) => {
                    e.preventDefault();
                    onNavigate?.(item.href);
                    onClose();
                  }}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="block py-3 text-lg font-serif hover:text-[var(--hb-accent)] transition-colors"
                >
                  {item.label}
                </motion.a>
              ))}
            </nav>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

