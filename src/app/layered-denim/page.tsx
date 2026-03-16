'use client';

import { BottomSheetNav } from "@/components/layered-denim/BottomSheetNav";
import { BuyButton } from "@/components/layered-denim/BuyButton";
import { EmailCaptureForm } from "@/components/layered-denim/EmailCaptureForm";
import { FAQAccordion } from "@/components/layered-denim/FAQAccordion";
import { ModalGallery } from "@/components/layered-denim/ModalGallery";
import { RoughBorderCard } from "@/components/layered-denim/RoughBorderCard";
import { ScribbleArrow } from "@/components/layered-denim/ScribbleArrow";
import { ScribbleUnderline } from "@/components/layered-denim/ScribbleUnderline";
import { WearTimeline } from "@/components/layered-denim/WearTimeline";
import { motion, useScroll, useTransform } from "framer-motion";
import { Menu } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const navItems = [
  { label: 'Story', href: '#story' },
  { label: 'Materials', href: '#materials' },
  { label: 'Construction', href: '#construction' },
  { label: 'Fit', href: '#fit' },
  { label: 'FAQ', href: '#faq' },
];

const galleryItems = [
  { id: '1', label: 'Front', caption: 'Layered panel construction', metadata: 'Front View' },
  { id: '2', label: 'Back', caption: 'Reinforced seams', metadata: 'Back View' },
  { id: '3', label: 'Detail: Selvedge ID', caption: 'Japanese selvedge denim', metadata: 'Selvedge Detail' },
  { id: '4', label: 'Detail: Pocket', caption: 'Hand-finished edges', metadata: 'Pocket Detail' },
  { id: '5', label: 'Side View', caption: 'Relaxed fit silhouette', metadata: 'Side Profile' },
  { id: '6', label: 'Detail: Hem', caption: 'Chain-stitched finish', metadata: 'Hem Detail' },
];

const faqItems = [
  {
    question: 'Where is Layered Denim made?',
    answer: 'Layered Denim is designed and manufactured entirely in America. Each garment is constructed in small batches with meticulous attention to detail.',
  },
  {
    question: 'What is selvedge denim?',
    answer: 'Selvedge (self-edge) denim refers to denim woven on traditional shuttle looms, creating a finished edge that prevents unraveling. This method produces a denser, higher-quality fabric with distinctive edge characteristics.',
  },
  {
    question: 'How should I care for my denim?',
    answer: 'Wash infrequently (every 6-12 months for best fades), inside out, cold water, hang dry. Avoid machine drying to preserve fabric integrity and prevent excessive shrinkage.',
  },
  {
    question: 'What sizing is available?',
    answer: 'Layered Denim is available in sizes 28-38 with a relaxed, straight-leg fit. Refer to our detailed size guide for measurements.',
  },
  {
    question: 'Will there be a restock?',
    answer: 'This is a limited release. We may produce additional runs based on demand, but each batch is unique. Join the drop list to be notified.',
  },
  {
    question: 'What are shipping options?',
    answer: 'We ship worldwide. Domestic shipping takes 5-7 business days. International shipping varies by destination. All orders include tracking.',
  },
];

const timelineItems = [
  {
    period: 'Day 1',
    title: 'Fresh Cut',
    description: 'Crisp indigo with structured hand. The fabric feels substantial and holds its shape.',
  },
  {
    period: 'Month 3',
    title: 'Breaking In',
    description: 'The denim begins to mold to your body. First creases form at stress points—knees, seat, and cuffs.',
  },
  {
    period: 'Year 1',
    title: 'Character Emerges',
    description: 'Distinctive fade patterns unique to your wear. The fabric softens while maintaining structure at key areas.',
  },
];

export default function LayeredDenimPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [galleryIndex, setGalleryIndex] = useState(0);
  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll();
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  const scrollToSection = (href: string) => {
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    setMobileMenuOpen(false);
  };

  const openGallery = (index: number) => {
    setGalleryIndex(index);
    setGalleryOpen(true);
  };

  return (
    <div className="min-h-screen bg-[var(--hb-paper)] text-[var(--hb-ink)]">
      {/* Sticky Header */}
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="sticky top-0 z-30 bg-[var(--hb-paper)]/80 backdrop-blur-md border-b border-[var(--hb-border)]/50"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <a href="/" className="font-serif text-xl">
              Hana-Bi
            </a>
            
            {/* Desktop Nav */}
            <nav className="hidden md:flex gap-8">
              {navItems.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={(e) => {
                    e.preventDefault();
                    scrollToSection(item.href);
                  }}
                  className="font-serif text-sm hover:text-[var(--hb-accent)] transition-colors"
                >
                  {item.label}
                </a>
              ))}
            </nav>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden p-2"
              aria-label="Open menu"
            >
              <Menu size={24} />
            </button>
          </div>
        </div>
      </motion.header>

      {/* Mobile Menu */}
      <BottomSheetNav
        items={navItems}
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        onNavigate={scrollToSection}
      />

      {/* Hero Section */}
      <section
        ref={heroRef}
        className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 overflow-hidden"
      >
        <motion.div
          style={{ opacity }}
          className="absolute inset-0 pointer-events-none"
        >
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-[var(--hb-border)]/20 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[var(--hb-accent)]/10 rounded-full blur-3xl" />
        </motion.div>

        <div className="relative z-10 max-w-4xl mx-auto text-center space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-6"
          >
            <h1 className="font-serif text-5xl sm:text-6xl md:text-7xl lg:text-8xl">
              Layered Denim
            </h1>
            <div className="flex justify-center">
              <ScribbleUnderline width={300} strokeOpacity={0.6} />
            </div>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="text-lg sm:text-xl text-[var(--hb-smoke)] max-w-2xl mx-auto"
          >
            Designed and manufactured in America. Constructed with Japanese selvedge denim.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <BuyButton className="max-w-xs" />
            <motion.a
              href="#materials"
              onClick={(e) => {
                e.preventDefault();
                scrollToSection('#materials');
              }}
              whileHover={{ scale: 1.05, rotate: -0.5 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 border-2 border-[var(--hb-ink)] rounded-2xl font-serif text-lg hover:bg-[var(--hb-paper-muted)] transition-colors"
            >
              View Details
            </motion.a>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="pt-4"
          >
            <a
              href="#drop-list"
              onClick={(e) => {
                e.preventDefault();
                scrollToSection('#drop-list');
              }}
              className="inline-flex items-center gap-2 text-[var(--hb-smoke)] hover:text-[var(--hb-ink)] transition-colors font-script text-sm"
            >
              Join the drop list for updates
              <ScribbleArrow direction="right" size={16} strokeOpacity={0.6} />
            </a>
          </motion.div>
        </div>
      </section>

      {/* Story Section */}
      <section id="story" className="py-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="space-y-8"
        >
          <h2 className="font-serif text-4xl md:text-5xl">Story</h2>
          
          <div className="space-y-6 text-lg leading-relaxed text-[var(--hb-ink)]">
            <p>
              In an age of rapid consumption, we return to craft. Layered Denim is built not for trends, but for the long arc of wear—each crease, each fade, a record of your movement through the world.
            </p>
            <p>
              These garments are constructed to evolve. The Japanese selvedge denim we select ages with character, developing unique patterns that tell your story. What starts as structured indigo softens into a second skin, shaped by your body and your habits.
            </p>
            <p>
              Made in small batches in America, each piece receives individual attention. We believe in the slow accumulation of detail: reinforced stress points, hand-finished edges, layered panel construction that moves with you.
            </p>
          </div>

          {/* Handwritten annotations */}
          <div className="pt-8 space-y-4">
            <p className="font-script text-[var(--hb-smoke)] text-base italic">Built to age.</p>
            <p className="font-script text-[var(--hb-smoke)] text-base italic">First drop.</p>
            <p className="font-script text-[var(--hb-smoke)] text-base italic">Wear marks encouraged.</p>
          </div>
        </motion.div>
      </section>

      {/* Materials Section */}
      <section id="materials" className="py-20 px-4 sm:px-6 lg:px-8 bg-[var(--hb-paper-muted)]/30">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="mb-12"
          >
            <h2 className="font-serif text-4xl md:text-5xl mb-4">Materials</h2>
            <p className="text-[var(--hb-smoke)] text-lg max-w-2xl">
              Each material chosen for longevity and character.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: 'Japanese Selvedge Denim',
                description: 'Woven on traditional shuttle looms, creating a dense, durable fabric with distinctive edge characteristics.',
              },
              {
                title: 'Indigo Character',
                description: 'Deep, rich indigo that fades uniquely with wear. Each pair develops its own signature patterns over time.',
              },
              {
                title: 'Hand Feel & Weight',
                description: '13–15oz range. Structured initially, the fabric softens with wear while maintaining integrity at key stress points.',
              },
            ].map((material, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
              >
                <RoughBorderCard hover className="p-6 bg-[var(--hb-paper)]">
                  <h3 className="font-serif text-xl mb-3">{material.title}</h3>
                  <p className="text-[var(--hb-smoke)] leading-relaxed">
                    {material.description}
                  </p>
                </RoughBorderCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Construction Section */}
      <section id="construction" className="py-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="space-y-12"
        >
          <div>
            <h2 className="font-serif text-4xl md:text-5xl mb-4">Construction</h2>
            <p className="text-[var(--hb-smoke)] text-lg max-w-2xl">
              Layered panel construction with reinforced seams at every stress point.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div>
                <h3 className="font-serif text-xl mb-2">Layered Panel Construction</h3>
                <p className="text-[var(--hb-smoke)] leading-relaxed">
                  Multiple fabric layers at key areas—seat, knees, and cuffs—provide durability while allowing natural movement.
                </p>
              </div>
              <div>
                <h3 className="font-serif text-xl mb-2">Reinforced Seams</h3>
                <p className="text-[var(--hb-smoke)] leading-relaxed">
                  Double-stitched and bar-tacked at all stress points. Chain-stitched hems for authentic finish.
                </p>
              </div>
              <div>
                <h3 className="font-serif text-xl mb-2">Hand-Finished Details</h3>
                <p className="text-[var(--hb-smoke)] leading-relaxed">
                  Pockets, edges, and closures receive individual attention. Each garment is inspected before finishing.
                </p>
              </div>
            </div>

            {/* X-ray style diagram */}
            <div className="relative bg-[var(--hb-paper-muted)] rounded-2xl p-8 aspect-square">
              <svg
                viewBox="0 0 300 300"
                className="w-full h-full"
                fill="none"
                stroke="var(--hb-ink)"
                strokeWidth="2"
                strokeOpacity="0.3"
              >
                {/* Simplified garment outline */}
                <path d="M150 50 L120 80 L110 150 L115 220 L140 260 L160 260 L185 220 L190 150 L180 80 Z" />
                {/* Panel lines */}
                <path d="M150 80 L150 220" strokeDasharray="4 4" />
                <path d="M130 150 L170 150" strokeDasharray="4 4" />
                {/* Stress points (circles) */}
                <circle cx="130" cy="120" r="8" fill="var(--hb-accent)" opacity="0.4" />
                <circle cx="170" cy="120" r="8" fill="var(--hb-accent)" opacity="0.4" />
                <circle cx="135" cy="200" r="8" fill="var(--hb-accent)" opacity="0.4" />
                <circle cx="165" cy="200" r="8" fill="var(--hb-accent)" opacity="0.4" />
              </svg>
              <p className="absolute bottom-4 left-1/2 -translate-x-1/2 text-xs font-script text-[var(--hb-smoke)]">
                Construction diagram
              </p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Fit & Wear Section */}
      <section id="fit" className="py-20 px-4 sm:px-6 lg:px-8 bg-[var(--hb-paper-muted)]/30">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="mb-12"
          >
            <h2 className="font-serif text-4xl md:text-5xl mb-4">Fit & Wear</h2>
            <p className="text-[var(--hb-smoke)] text-lg max-w-2xl">
              Relaxed fit designed to move with you.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-12">
            <div className="space-y-6">
              <h3 className="font-serif text-2xl">Fit</h3>
              <p className="text-[var(--hb-smoke)] leading-relaxed">
                Straight-leg silhouette with a relaxed rise. The cut allows natural movement while maintaining a clean, contemporary line. Sits at the natural waist with room through the thigh.
              </p>
              <p className="text-[var(--hb-smoke)] leading-relaxed">
                Sizing runs true. We recommend your usual size for a relaxed fit, or size down for a closer silhouette. The denim will soften and mold to your body with wear.
              </p>
            </div>

            <div className="space-y-6">
              <h3 className="font-serif text-2xl">How It Ages</h3>
              <p className="text-[var(--hb-smoke)] leading-relaxed mb-6">
                The denim evolves with your wear patterns. Creases form at natural stress points—knees, seat, and cuffs. Indigo fades gradually, creating unique patterns that are yours alone.
              </p>
              <WearTimeline items={timelineItems} />
            </div>
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="space-y-8"
        >
          <h2 className="font-serif text-4xl md:text-5xl">Gallery</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {galleryItems.map((item, index) => (
              <motion.button
                key={item.id}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ delay: index * 0.05, duration: 0.5 }}
                whileHover={{ scale: 1.02, rotate: 0.5 }}
                onClick={() => openGallery(index)}
                className="aspect-square bg-gradient-to-br from-[var(--hb-paper-muted)] to-[var(--hb-border)] rounded-2xl flex items-center justify-center p-6 hover:shadow-lg transition-shadow"
              >
                <p className="font-serif text-sm text-center">{item.label}</p>
              </motion.button>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Drop List Section */}
      <section id="drop-list" className="py-20 px-4 sm:px-6 lg:px-8 bg-[var(--hb-paper-muted)]/30">
        <div className="max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="space-y-12"
          >
            {/* Purchase Section */}
            <div className="text-center space-y-6">
              <h2 className="font-serif text-4xl md:text-5xl">Purchase</h2>
              <p className="text-[var(--hb-smoke)] text-lg">
                Secure checkout powered by Stripe
              </p>
              <BuyButton className="max-w-sm mx-auto" />
            </div>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[var(--hb-border)]"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-[var(--hb-paper-muted)]/30 px-4 text-[var(--hb-smoke)] font-script">
                  Or
                </span>
              </div>
            </div>

            {/* Email List Section */}
            <div className="text-center space-y-6">
              <h2 className="font-serif text-4xl md:text-5xl">Join the Drop List</h2>
              <p className="text-[var(--hb-smoke)] text-lg">
                Be the first to know about future releases and updates.
              </p>
              <EmailCaptureForm />
            </div>
          </motion.div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="space-y-8"
        >
          <h2 className="font-serif text-4xl md:text-5xl">FAQ</h2>
          <FAQAccordion items={faqItems} />
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 border-t border-[var(--hb-border)]">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="font-serif text-lg">Hana-Bi</p>
            <div className="flex gap-6 text-sm text-[var(--hb-smoke)]">
              <a href="#" className="hover:text-[var(--hb-ink)] transition-colors">Instagram</a>
              <a href="#" className="hover:text-[var(--hb-ink)] transition-colors">Twitter</a>
              <a href="#" className="hover:text-[var(--hb-ink)] transition-colors">Contact</a>
            </div>
          </div>
          <p className="text-center mt-8 text-xs text-[var(--hb-smoke)] font-script">
            © {new Date().getFullYear()} Hana-Bi. All rights reserved.
          </p>
        </div>
      </footer>

      {/* Gallery Modal */}
      <ModalGallery
        items={galleryItems}
        isOpen={galleryOpen}
        currentIndex={galleryIndex}
        onClose={() => setGalleryOpen(false)}
        onNext={() => setGalleryIndex((prev) => (prev + 1) % galleryItems.length)}
        onPrev={() => setGalleryIndex((prev) => (prev - 1 + galleryItems.length) % galleryItems.length)}
      />
    </div>
  );
}

