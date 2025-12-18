"use client";

import { HandDrawnButton } from "@/components/common/HandDrawnButton";
import { HandDrawnDivider } from "@/components/common/HandDrawnDivider";
import { InkUnderline } from "@/components/common/InkUnderline";
import { PaperBackground } from "@/components/common/PaperBackground";
import { useState } from "react";

export default function HandDrawnButtonsDemo() {
  const [loading1, setLoading1] = useState(false);
  const [loading2, setLoading2] = useState(false);

  const handleLoadingClick = (
    setter: React.Dispatch<React.SetStateAction<boolean>>
  ) => {
    setter(true);
    setTimeout(() => setter(false), 2000);
  };

  return (
    <main className="page-transition min-h-screen">
      <PaperBackground intensity="subtle" texture="both" />

      <div className="px-4 sm:px-8 md:px-12 lg:px-20 py-24 space-y-20 max-w-6xl mx-auto">
        {/* Header */}
        <section className="space-y-6">
          <p className="uppercase text-xs tracking-[0.5em] text-[var(--hb-smoke)] font-script opacity-70">
            Component System
          </p>
          <h1 className="font-serif text-5xl lg:text-6xl leading-tight">
            Hand-Drawn Buttons
          </h1>
          <InkUnderline width={200} variant="wispy" strokeOpacity={0.4} />
          <p className="text-base leading-relaxed text-[var(--hb-smoke)] opacity-85 max-w-2xl">
            Sophisticated buttons with imperfect, hand-drawn borders. Each button
            features slightly uneven edges, subtle wobble on hover, and ink-like
            outline effects—crafted for fashion and art studios that value artisanal
            authenticity over digital perfection.
          </p>
        </section>

        <HandDrawnDivider variant="wispy" strokeOpacity={0.3} />

        {/* Primary Buttons */}
        <section className="space-y-8">
          <div className="space-y-3">
            <h2 className="font-serif text-3xl">Primary Buttons</h2>
            <InkUnderline width={130} variant="delicate" strokeOpacity={0.35} />
            <p className="text-sm text-[var(--hb-smoke)] opacity-80">
              Filled with ink. Uneven borders simulate hand-drawn outlines with
              organic wobble on hover.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-3">
              <HandDrawnButton
                variant="primary"
                onClick={() => console.log("Add to cart")}
              >
                Add to Cart
              </HandDrawnButton>
              <p className="text-xs text-[var(--hb-smoke)] opacity-70">
                Default state
              </p>
            </div>

            <div className="space-y-3">
              <HandDrawnButton
                variant="primary"
                loading={loading1}
                onClick={() => handleLoadingClick(setLoading1)}
              >
                {loading1 ? "Processing..." : "Checkout"}
              </HandDrawnButton>
              <p className="text-xs text-[var(--hb-smoke)] opacity-70">
                Loading state
              </p>
            </div>

            <div className="space-y-3">
              <HandDrawnButton variant="primary" disabled>
                Out of Stock
              </HandDrawnButton>
              <p className="text-xs text-[var(--hb-smoke)] opacity-70">
                Disabled state
              </p>
            </div>
          </div>

          {/* Additional examples */}
          <div className="pt-6 space-y-4">
            <h3 className="text-sm uppercase tracking-[0.3em] text-[var(--hb-smoke)] opacity-70">
              Sizing Examples
            </h3>
            <div className="flex flex-wrap gap-4 items-center">
              <HandDrawnButton variant="primary" className="px-6 py-3 text-[0.65rem]">
                Small
              </HandDrawnButton>
              <HandDrawnButton variant="primary">
                Default
              </HandDrawnButton>
              <HandDrawnButton variant="primary" className="px-10 py-5 text-sm">
                Large
              </HandDrawnButton>
            </div>
          </div>
        </section>

        <HandDrawnDivider variant="delicate" strokeOpacity={0.25} />

        {/* Ghost Buttons */}
        <section className="space-y-8">
          <div className="space-y-3">
            <h2 className="font-serif text-3xl">Ghost Buttons</h2>
            <InkUnderline width={100} variant="delicate" strokeOpacity={0.35} />
            <p className="text-sm text-[var(--hb-smoke)] opacity-80">
              Transparent with hand-drawn outlines. Double-stroke effect creates
              depth and ink pooling illusion.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-3">
              <HandDrawnButton
                variant="ghost"
                onClick={() => console.log("Learn more")}
              >
                Learn More
              </HandDrawnButton>
              <p className="text-xs text-[var(--hb-smoke)] opacity-70">
                Default state
              </p>
            </div>

            <div className="space-y-3">
              <HandDrawnButton
                variant="ghost"
                loading={loading2}
                onClick={() => handleLoadingClick(setLoading2)}
              >
                {loading2 ? "Saving..." : "Save to Wishlist"}
              </HandDrawnButton>
              <p className="text-xs text-[var(--hb-smoke)] opacity-70">
                Loading state
              </p>
            </div>

            <div className="space-y-3">
              <HandDrawnButton variant="ghost" disabled>
                Unavailable
              </HandDrawnButton>
              <p className="text-xs text-[var(--hb-smoke)] opacity-70">
                Disabled state
              </p>
            </div>
          </div>

          {/* Additional examples */}
          <div className="pt-6 space-y-4">
            <h3 className="text-sm uppercase tracking-[0.3em] text-[var(--hb-smoke)] opacity-70">
              Sizing Examples
            </h3>
            <div className="flex flex-wrap gap-4 items-center">
              <HandDrawnButton variant="ghost" className="px-6 py-3 text-[0.65rem]">
                Small
              </HandDrawnButton>
              <HandDrawnButton variant="ghost">
                Default
              </HandDrawnButton>
              <HandDrawnButton variant="ghost" className="px-10 py-5 text-sm">
                Large
              </HandDrawnButton>
            </div>
          </div>
        </section>

        <HandDrawnDivider variant="wispy" strokeOpacity={0.3} />

        {/* Technical Details */}
        <section className="space-y-8">
          <div className="space-y-3">
            <h2 className="font-serif text-3xl">Handcrafted Details</h2>
            <InkUnderline width={160} variant="wispy" strokeOpacity={0.35} />
          </div>

          <div className="grid gap-8 md:grid-cols-2">
            <div className="space-y-4 p-6 border border-[var(--hb-border)] border-dashed">
              <h3 className="font-serif text-xl">Uneven Borders</h3>
              <p className="text-sm text-[var(--hb-smoke)] opacity-80 leading-relaxed">
                SVG paths with seeded randomness create consistent but imperfect
                borders. Each corner has subtle jitter, and edges use bezier curves
                instead of straight lines to simulate pen strokes.
              </p>
              <code className="text-xs bg-[var(--hb-paper-muted)] px-2 py-1 block font-mono">
                jitter: 0.8px, curves: quadratic
              </code>
            </div>

            <div className="space-y-4 p-6 border border-[var(--hb-border)] border-dashed">
              <h3 className="font-serif text-xl">Subtle Wobble</h3>
              <p className="text-sm text-[var(--hb-smoke)] opacity-80 leading-relaxed">
                On hover, buttons lift with a gentle 2px translation combined with
                a 0.3-0.5° rotation. The effect is organic and barely perceptible—
                sophisticated rather than playful.
              </p>
              <code className="text-xs bg-[var(--hb-paper-muted)] px-2 py-1 block font-mono">
                rotate(0.5deg) translateY(-2px)
              </code>
            </div>

            <div className="space-y-4 p-6 border border-[var(--hb-border)] border-dashed">
              <h3 className="font-serif text-xl">Ink-Like Outline</h3>
              <p className="text-sm text-[var(--hb-smoke)] opacity-80 leading-relaxed">
                SVG displacement mapping with fractal noise creates organic
                roughness. Inner borders on primary buttons simulate ink pooling
                where the pen paused.
              </p>
              <code className="text-xs bg-[var(--hb-paper-muted)] px-2 py-1 block font-mono">
                feTurbulence + feDisplacementMap
              </code>
            </div>

            <div className="space-y-4 p-6 border border-[var(--hb-border)] border-dashed">
              <h3 className="font-serif text-xl">Organic Easing</h3>
              <p className="text-sm text-[var(--hb-smoke)] opacity-80 leading-relaxed">
                Extended 700ms transitions with custom cubic-bezier create slow,
                deliberate animations. Everything moves like ink spreading on paper—
                no digital snappiness.
              </p>
              <code className="text-xs bg-[var(--hb-paper-muted)] px-2 py-1 block font-mono">
                cubic-bezier(0.19, 1, 0.22, 1)
              </code>
            </div>
          </div>
        </section>

        {/* Comparison */}
        <section className="space-y-8">
          <div className="space-y-3">
            <h2 className="font-serif text-3xl">Style Comparison</h2>
            <InkUnderline width={140} variant="delicate" strokeOpacity={0.35} />
          </div>

          <div className="p-8 bg-[var(--hb-paper-muted)] border border-[var(--hb-border)] space-y-8">
            <div className="space-y-4">
              <h3 className="text-sm uppercase tracking-[0.3em] text-[var(--hb-smoke)] opacity-70">
                Primary vs Ghost
              </h3>
              <div className="flex flex-wrap gap-4">
                <HandDrawnButton variant="primary">
                  Primary Style
                </HandDrawnButton>
                <HandDrawnButton variant="ghost">
                  Ghost Style
                </HandDrawnButton>
              </div>
              <p className="text-xs text-[var(--hb-smoke)] opacity-70 leading-relaxed">
                Primary buttons fill with ink and show inner border pooling. Ghost
                buttons remain transparent with double-stroke outlines.
              </p>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm uppercase tracking-[0.3em] text-[var(--hb-smoke)] opacity-70">
                Hover to See Wobble
              </h3>
              <div className="flex flex-wrap gap-4">
                <HandDrawnButton variant="primary">
                  Hover Me
                </HandDrawnButton>
                <HandDrawnButton variant="ghost">
                  Hover Me Too
                </HandDrawnButton>
              </div>
              <p className="text-xs text-[var(--hb-smoke)] opacity-70 leading-relaxed">
                Notice the subtle lift and rotation, thicker borders, and enhanced
                ink effects on hover.
              </p>
            </div>
          </div>
        </section>

        {/* Usage Example */}
        <section className="space-y-8">
          <div className="space-y-3">
            <h2 className="font-serif text-3xl">Usage</h2>
            <InkUnderline width={60} variant="delicate" strokeOpacity={0.35} />
          </div>

          <div className="p-8 bg-[var(--hb-paper-muted)] border border-[var(--hb-border)]">
            <pre className="text-xs font-mono text-[var(--hb-ink)] leading-relaxed overflow-x-auto">
{`import { HandDrawnButton } from "@/components/common/HandDrawnButton";

// Primary button
<HandDrawnButton variant="primary" onClick={handleClick}>
  Add to Cart
</HandDrawnButton>

// Ghost button with loading
<HandDrawnButton 
  variant="ghost" 
  loading={isLoading}
  onClick={handleSave}
>
  Save to Wishlist
</HandDrawnButton>

// Disabled state
<HandDrawnButton variant="primary" disabled>
  Out of Stock
</HandDrawnButton>

// Custom size
<HandDrawnButton 
  variant="ghost" 
  className="px-6 py-3 text-[0.65rem]"
>
  Small Button
</HandDrawnButton>`}
            </pre>
          </div>
        </section>

        {/* Design Philosophy */}
        <section className="space-y-8">
          <div className="space-y-3">
            <h2 className="font-serif text-3xl">Design Philosophy</h2>
            <InkUnderline width={150} variant="wispy" strokeOpacity={0.35} />
          </div>

          <div className="space-y-6 text-sm text-[var(--hb-smoke)] leading-relaxed max-w-3xl">
            <p>
              These buttons celebrate the imperfect beauty of hand-drawn elements
              while maintaining sophistication. Unlike playful or childish
              hand-drawn styles, these buttons are refined and artisanal—appropriate
              for high-end fashion brands and art studios.
            </p>
            <p>
              Every detail is deliberate: the uneven borders suggest pen and paper,
              the subtle wobble mimics natural hand movement, and the ink pooling
              effects reference traditional illustration techniques. The slow,
              organic animations reinforce the handcrafted aesthetic without
              feeling gimmicky.
            </p>
            <p>
              The result is a button system that feels human-made and artistic,
              perfectly suited for brands that value craftsmanship and authenticity
              over digital precision.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
