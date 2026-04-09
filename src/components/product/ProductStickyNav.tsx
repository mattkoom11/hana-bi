'use client';

import { BottomSheetNav } from "@/components/layered-denim/BottomSheetNav";
import { motion, useScroll, useMotionValueEvent } from "framer-motion";
import { Menu } from "lucide-react";
import { useState } from "react";

const navItems = [
  { label: 'Story', href: '#story' },
  { label: 'Materials', href: '#materials' },
  { label: 'Construction', href: '#construction' },
  { label: 'Fit', href: '#fit' },
  { label: 'FAQ', href: '#faq' },
];

export function ProductStickyNav() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [visible, setVisible] = useState(false);
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (y) => {
    setVisible(y > 120);
  });

  const scrollToSection = (href: string) => {
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    setMobileMenuOpen(false);
  };

  return (
    <>
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: visible ? 0 : -50, opacity: visible ? 1 : 0 }}
        transition={{ duration: 0.25 }}
        className="fixed top-0 left-0 right-0 z-30 bg-[var(--hb-dark)]/90 backdrop-blur-md border-b border-[var(--hb-dark-border)]"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-11">
            <nav className="hidden md:flex gap-8">
              {navItems.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={(e) => {
                    e.preventDefault();
                    scrollToSection(item.href);
                  }}
                  className="text-[0.65rem] uppercase tracking-[0.4em] text-[var(--hb-dark-muted)] hover:text-[#faf8f4] transition-colors"
                  style={{ fontFamily: "var(--hb-font-mono)" }}
                >
                  {item.label}
                </a>
              ))}
            </nav>

            <button
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden p-2 text-[var(--hb-dark-muted)] hover:text-[#faf8f4]"
              aria-label="Open section menu"
            >
              <Menu size={18} />
            </button>
          </div>
        </div>
      </motion.div>

      <BottomSheetNav
        items={navItems}
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        onNavigate={scrollToSection}
      />
    </>
  );
}
