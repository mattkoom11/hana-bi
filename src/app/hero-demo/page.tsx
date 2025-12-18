import { SketchbookHero } from "@/components/home/SketchbookHero";

export default function HeroDemoPage() {
  return (
    <main>
      <SketchbookHero />
      
      {/* Additional demo sections to show contrast */}
      <section className="px-4 sm:px-8 md:px-12 lg:px-20 py-16 bg-[var(--hb-paper-muted)]">
        <div className="max-w-6xl mx-auto space-y-8">
          <h2 className="font-serif text-3xl text-[var(--hb-ink)]">
            Hero Section Demo
          </h2>
          <p className="text-base text-[var(--hb-smoke)] leading-relaxed max-w-2xl">
            The hero section above features a hand-drawn, sketchbook-inspired aesthetic with:
          </p>
          <ul className="space-y-3 text-sm text-[var(--hb-smoke)]">
            <li>• Large clean serif headline with scribble underlines on key words</li>
            <li>• Subtle paper texture and grain overlay</li>
            <li>• Hand-drawn arrow pointing to the main CTA</li>
            <li>• Organic fade-in animations with custom easing (cubic-bezier 0.19, 1, 0.22, 1)</li>
            <li>• Minimal color palette: off-white background, charcoal text, ink black accents</li>
            <li>• Fully responsive design for mobile, tablet, and desktop</li>
            <li>• Decorative sketch elements (circles, dashes) for authenticity</li>
          </ul>

          <div className="pt-8 border-t border-[var(--hb-border)] space-y-4">
            <h3 className="font-serif text-xl text-[var(--hb-ink)]">
              Design Philosophy
            </h3>
            <p className="text-sm text-[var(--hb-smoke)] leading-relaxed max-w-2xl">
              The hero embodies the imperfect beauty of a fashion designer's sketchbook.
              Each element—from the loose scribble underlines to the hand-drawn arrow—
              celebrates the handcrafted and artistic process. The animations are
              deliberately slow and organic, mimicking the natural pace of sketching by hand.
            </p>
          </div>

          <div className="pt-8 border-t border-[var(--hb-border)] space-y-4">
            <h3 className="font-serif text-xl text-[var(--hb-ink)]">
              Technical Details
            </h3>
            <div className="grid md:grid-cols-2 gap-6 text-sm">
              <div className="space-y-2">
                <h4 className="font-medium text-[var(--hb-ink)]">Scribble Underlines</h4>
                <p className="text-[var(--hb-smoke)]">
                  SVG-based with organic curves and roughness filter.
                  Multiple variants: loose, tight, and chaotic.
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium text-[var(--hb-ink)]">Hand-Drawn Arrow</h4>
                <p className="text-[var(--hb-smoke)]">
                  Bezier curves with displacement mapping for authentic sketch feel.
                  Supports multiple directions: down-right, down-left, right, down.
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium text-[var(--hb-ink)]">Paper Texture</h4>
                <p className="text-[var(--hb-smoke)]">
                  SVG fractal noise overlay at low opacity for subtle grain.
                  Layered with CSS background patterns.
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium text-[var(--hb-ink)]">Animations</h4>
                <p className="text-[var(--hb-smoke)]">
                  Staggered fade-in with organic easing. Each element has a delayed
                  entrance for natural, sequential reveal.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
