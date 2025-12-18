"use client";

import { Button } from "@/components/common/Button";
import { HandDrawnDivider } from "@/components/common/HandDrawnDivider";
import { InkUnderline } from "@/components/common/InkUnderline";
import { PaperBackground } from "@/components/common/PaperBackground";
import { useState } from "react";

export default function ButtonsDemo() {
  const [loading1, setLoading1] = useState(false);
  const [loading2, setLoading2] = useState(false);
  const [loading3, setLoading3] = useState(false);

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
            Button Component Library
          </h1>
          <InkUnderline width={180} variant="wispy" strokeOpacity={0.4} />
          <p className="text-base leading-relaxed text-[var(--hb-smoke)] opacity-85 max-w-2xl">
            A refined system of interactive buttons with custom easing,
            micro-interactions, and sophisticated states. Designed for high-end
            fashion brands that value understated elegance.
          </p>
        </section>

        <HandDrawnDivider variant="wispy" strokeOpacity={0.3} />

        {/* Primary Buttons */}
        <section className="space-y-8">
          <div className="space-y-3">
            <h2 className="font-serif text-3xl">Primary Buttons</h2>
            <InkUnderline width={100} variant="delicate" strokeOpacity={0.35} />
            <p className="text-sm text-[var(--hb-smoke)] opacity-80">
              Bold statements for primary actions. Filled with ink, subtle lift
              on hover.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-3">
              <Button variant="primary" onClick={() => console.log("Clicked")}>
                Add to Cart
              </Button>
              <p className="text-xs text-[var(--hb-smoke)] opacity-70">
                Default state
              </p>
            </div>

            <div className="space-y-3">
              <Button
                variant="primary"
                loading={loading1}
                onClick={() => handleLoadingClick(setLoading1)}
              >
                {loading1 ? "Processing..." : "Checkout"}
              </Button>
              <p className="text-xs text-[var(--hb-smoke)] opacity-70">
                Loading state
              </p>
            </div>

            <div className="space-y-3">
              <Button variant="primary" disabled>
                Out of Stock
              </Button>
              <p className="text-xs text-[var(--hb-smoke)] opacity-70">
                Disabled state
              </p>
            </div>
          </div>
        </section>

        <HandDrawnDivider variant="delicate" strokeOpacity={0.25} />

        {/* Secondary Buttons */}
        <section className="space-y-8">
          <div className="space-y-3">
            <h2 className="font-serif text-3xl">Secondary Buttons</h2>
            <InkUnderline width={120} variant="delicate" strokeOpacity={0.35} />
            <p className="text-sm text-[var(--hb-smoke)] opacity-80">
              Outlined elegance for secondary actions. Transforms on hover with
              refined easing.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-3">
              <Button
                variant="secondary"
                onClick={() => console.log("Learn more")}
              >
                Learn More
              </Button>
              <p className="text-xs text-[var(--hb-smoke)] opacity-70">
                Default state
              </p>
            </div>

            <div className="space-y-3">
              <Button
                variant="secondary"
                loading={loading2}
                onClick={() => handleLoadingClick(setLoading2)}
              >
                {loading2 ? "Saving..." : "Save to Wishlist"}
              </Button>
              <p className="text-xs text-[var(--hb-smoke)] opacity-70">
                Loading state
              </p>
            </div>

            <div className="space-y-3">
              <Button variant="secondary" disabled>
                Unavailable
              </Button>
              <p className="text-xs text-[var(--hb-smoke)] opacity-70">
                Disabled state
              </p>
            </div>
          </div>
        </section>

        <HandDrawnDivider variant="delicate" strokeOpacity={0.25} />

        {/* Ghost Buttons */}
        <section className="space-y-8">
          <div className="space-y-3">
            <h2 className="font-serif text-3xl">Ghost Buttons</h2>
            <InkUnderline width={90} variant="delicate" strokeOpacity={0.35} />
            <p className="text-sm text-[var(--hb-smoke)] opacity-80">
              Whisper-light interactions for tertiary actions. Barely there
              until needed.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-3">
              <Button variant="ghost" onClick={() => console.log("View more")}>
                View Details
              </Button>
              <p className="text-xs text-[var(--hb-smoke)] opacity-70">
                Default state
              </p>
            </div>

            <div className="space-y-3">
              <Button
                variant="ghost"
                loading={loading3}
                onClick={() => handleLoadingClick(setLoading3)}
              >
                {loading3 ? "Loading..." : "Continue"}
              </Button>
              <p className="text-xs text-[var(--hb-smoke)] opacity-70">
                Loading state
              </p>
            </div>

            <div className="space-y-3">
              <Button variant="ghost" disabled>
                Not Available
              </Button>
              <p className="text-xs text-[var(--hb-smoke)] opacity-70">
                Disabled state
              </p>
            </div>
          </div>
        </section>

        <HandDrawnDivider variant="wispy" strokeOpacity={0.3} />

        {/* Technical Details */}
        <section className="space-y-8">
          <div className="space-y-3">
            <h2 className="font-serif text-3xl">Interaction Details</h2>
            <InkUnderline width={140} variant="wispy" strokeOpacity={0.35} />
          </div>

          <div className="grid gap-8 md:grid-cols-2">
            <div className="space-y-4 p-6 border border-[var(--hb-border)] border-dashed">
              <h3 className="font-serif text-xl">Custom Easing</h3>
              <p className="text-sm text-[var(--hb-smoke)] opacity-80 leading-relaxed">
                Uses cubic-bezier(0.19, 1, 0.22, 1) for a refined, elastic feel.
                Transitions span 500ms for a deliberate, luxurious pace.
              </p>
              <code className="text-xs bg-[var(--hb-paper-muted)] px-2 py-1 block font-mono">
                cubic-bezier(0.19, 1, 0.22, 1)
              </code>
            </div>

            <div className="space-y-4 p-6 border border-[var(--hb-border)] border-dashed">
              <h3 className="font-serif text-xl">Ripple Effect</h3>
              <p className="text-sm text-[var(--hb-smoke)] opacity-80 leading-relaxed">
                Subtle ripple emanates from click point. Opacity-based with
                coordinated timing for sophistication over spectacle.
              </p>
              <code className="text-xs bg-[var(--hb-paper-muted)] px-2 py-1 block font-mono">
                800ms expansion with fade
              </code>
            </div>

            <div className="space-y-4 p-6 border border-[var(--hb-border)] border-dashed">
              <h3 className="font-serif text-xl">Hover States</h3>
              <p className="text-sm text-[var(--hb-smoke)] opacity-80 leading-relaxed">
                Gentle 2px lift with refined shadow. Background shifts maintain
                hierarchy without overwhelming.
              </p>
              <code className="text-xs bg-[var(--hb-paper-muted)] px-2 py-1 block font-mono">
                -translate-y-[2px] + shadow
              </code>
            </div>

            <div className="space-y-4 p-6 border border-[var(--hb-border)] border-dashed">
              <h3 className="font-serif text-xl">Active State</h3>
              <p className="text-sm text-[var(--hb-smoke)] opacity-80 leading-relaxed">
                Subtle scale-down (0.98) provides tactile feedback. Combined
                with ripple for layered interaction.
              </p>
              <code className="text-xs bg-[var(--hb-paper-muted)] px-2 py-1 block font-mono">
                scale-[0.98] on press
              </code>
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
{`import { Button } from "@/components/common/Button";

// Primary button
<Button variant="primary" onClick={handleClick}>
  Add to Cart
</Button>

// Secondary with loading
<Button 
  variant="secondary" 
  loading={isLoading}
  onClick={handleSave}
>
  Save to Wishlist
</Button>

// Ghost disabled
<Button variant="ghost" disabled>
  Out of Stock
</Button>`}
            </pre>
          </div>
        </section>
      </div>
    </main>
  );
}
