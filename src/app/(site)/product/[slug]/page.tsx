import fs from "node:fs/promises";
import path from "node:path";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductCard } from "@/components/shop/ProductCard";
import { ProductHeroBand } from "@/components/product/ProductHeroBand";
import { ProductStickyNav } from "@/components/product/ProductStickyNav";
import { ConstructionSection } from "@/components/product/ConstructionSection";
import type { MarkerData } from "@/components/media/TurntableObject";
import { EmailCaptureForm } from "@/components/editorial/EmailCaptureForm";
import { FAQAccordion } from "@/components/editorial/FAQAccordion";
import { getStripeCatalog, getStripeProductBySlug } from "@/lib/stripe-catalog";
import { getProductBySlug, products as fallbackProducts, type Product } from "@/data/products";

const block: React.CSSProperties = { borderTop: "1px solid var(--hb-dark-border)", padding: "3.5rem 0" };
const eyebrow: React.CSSProperties = {
  fontFamily: "var(--hb-font-mono)",
  fontSize: "0.65rem",
  textTransform: "uppercase",
  letterSpacing: "var(--hb-track-meta)",
  color: "var(--hb-sienna)",
  margin: "0 0 1rem",
};
const heading: React.CSSProperties = {
  fontFamily: "var(--hb-font-display)",
  fontStyle: "italic",
  fontWeight: 300,
  fontSize: "clamp(1.75rem, 3vw, 2.25rem)",
  lineHeight: 1.15,
  color: "var(--hb-on-dark)",
  margin: "0 0 2rem",
};

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export const revalidate = 3600; // re-fetch Stripe catalog at most once per hour

export async function generateStaticParams() {
  try {
    const catalog = await getStripeCatalog();
    if (catalog.length > 0) return catalog.map((p) => ({ slug: p.slug }));
  } catch {}
  return fallbackProducts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  let product: Product | null = null;
  try {
    product = await getStripeProductBySlug(slug);
  } catch {}
  if (!product) product = getProductBySlug(slug) ?? null;
  if (!product) return { title: "Piece not found — Hana-Bi" };
  return {
    title: `${product.name} — Hana-Bi`,
    description: product.description,
    openGraph: { images: [product.heroImage] },
  };
}

async function getRelatedProducts(currentSlug: string): Promise<Product[]> {
  try {
    const catalog = await getStripeCatalog();
    if (catalog.length > 0) {
      return catalog.filter((p) => p.slug !== currentSlug && p.status === "available").slice(0, 3);
    }
  } catch {}
  return fallbackProducts
    .filter((p) => p.slug !== currentSlug && p.status === "available")
    .slice(0, 3);
}

// The marker is static and worth having in the initial HTML — read it
// server-side rather than fetching client-side. Never fabricate marker data
// for a product without one; see design/ASSETS.md.
async function getMarker(markerUrl: string): Promise<MarkerData | null> {
  try {
    // Markers always live in public/patterns/. A literal directory here keeps
    // Next's file tracer from bundling all of public/ into this function.
    const filePath = path.join(process.cwd(), "public", "patterns", path.basename(markerUrl));
    const raw = await fs.readFile(filePath, "utf-8");
    return JSON.parse(raw) as MarkerData;
  } catch {
    return null;
  }
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  let product: Product | null = null;

  try {
    product = await getStripeProductBySlug(slug);
  } catch (error) {
    console.warn("Failed to fetch product from Stripe, using fallback:", error);
  }

  if (!product) product = getProductBySlug(slug) ?? null;
  if (!product) notFound();

  const catalogIndex = fallbackProducts.findIndex((p) => p.slug === slug);
  const catalogNumber =
    product.catalogNumber ?? (catalogIndex >= 0 ? `HB-${String(catalogIndex + 1).padStart(3, "0")}` : "HB-—");

  const marker = product.marker ? await getMarker(product.marker) : null;

  const related = await getRelatedProducts(product.slug);

  const navItems = [
    product.materials || product.care ? { label: "Materials", href: "#materials" } : null,
    marker ? { label: "Construction", href: "#construction" } : null,
    { label: "FAQ", href: "#faq" },
    { label: "Drop list", href: "#drop-list" },
  ].filter((item): item is { label: string; href: string } => item !== null);

  return (
    <main className="page-transition" style={{ position: "relative" }}>
      <ProductStickyNav items={navItems} />

      {/* ── Band 1 — Hero + buy panel ── */}
      <ProductHeroBand product={product} catalogNumber={catalogNumber} />

      {/* ── Band 2 — Construction (conditional) ── */}
      {marker && product.marker && <ConstructionSection marker={marker} markerUrl={product.marker} />}

      {/* ── Band 3 — Terms, FAQ, drop list, related ──
          One continuous dark band: the page used to flip to paper here, which
          read as a second site bolted on. Blocks are separated by hairlines. */}
      <section
        className="hb-grain"
        style={{ background: "rgba(14,12,11,0.85)", color: "var(--hb-on-dark)", padding: "0 var(--hb-gutter) 5rem" }}
      >
        <div style={{ maxWidth: "var(--hb-max-width)", margin: "0 auto" }}>
          <div style={block}>
            <p style={eyebrow}>Preorder</p>
            <h2 style={heading}>Made to order — no excess, no waste.</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem", lineHeight: 1.7, color: "var(--hb-dark-muted)", maxWidth: "42rem" }}>
              <p style={{ margin: 0 }}>
                Every piece on this site is a preorder. Your payment goes directly toward sourcing materials and manufacturing your garment. Nothing is produced speculatively.
              </p>
              <p style={{ margin: 0 }}>
                Production begins once a minimum number of orders is reached. If it isn&rsquo;t, you are fully refunded.
              </p>
              <p style={{ margin: 0 }}>
                Once production begins, your garment is cut, sewn and shipped in 3–4 months.
              </p>
            </div>
          </div>

          <div id="faq" style={block}>
            <p style={eyebrow}>Questions</p>
            <div style={{ maxWidth: "42rem" }}>
              <FAQAccordion
                items={[
                  { question: "When does my order ship?", answer: "Your garment is cut, sewn and shipped 3–4 months after production begins." },
                  { question: "What if the minimum isn't met?", answer: "You are fully refunded." },
                  { question: "How should I care for it?", answer: product.care },
                ]}
              />
            </div>
          </div>

          <div id="drop-list" style={block}>
            <p style={eyebrow}>Drop list</p>
            <h2 style={heading}>Hear about the next edition.</h2>
            <EmailCaptureForm className="mx-0" />
          </div>

          {related.length > 0 && (
            <div style={block}>
              <p style={eyebrow}>From the archive</p>
              <h2 style={heading}>You may also like</h2>
              <div
                style={{
                  display: "grid",
                  gap: "var(--hb-grid-gap)",
                  gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 18rem), 1fr))",
                }}
              >
                {related.map((p) => (
                  <ProductCard key={p.id} product={p} variant="dark" />
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
