import fs from "node:fs/promises";
import path from "node:path";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { InkUnderline } from "@/components/common/InkUnderline";
import { Tag } from "@/components/common/Tag";
import { PageShell } from "@/components/layout/PageShell";
import { ProductCard } from "@/components/shop/ProductCard";
import { ProductHeroBand } from "@/components/product/ProductHeroBand";
import { ProductStickyNav } from "@/components/product/ProductStickyNav";
import { ConstructionSection } from "@/components/product/ConstructionSection";
import type { MarkerData } from "@/components/media/TurntableObject";
import { ScribbleArrow } from "@/components/layered-denim/ScribbleArrow";
import { EmailCaptureForm } from "@/components/layered-denim/EmailCaptureForm";
import { FAQAccordion } from "@/components/layered-denim/FAQAccordion";
import { getStripeCatalog, getStripeProductBySlug } from "@/lib/stripe-catalog";
import { getProductBySlug, products as fallbackProducts, type Product } from "@/data/products";

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
    const filePath = path.join(process.cwd(), "public", markerUrl.replace(/^\//, ""));
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
    { label: "Materials", href: "#materials" },
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

      {/* ── Band 3 — Preorder terms ── */}
      <section style={{ background: "rgba(245,242,237,0.94)", padding: "4rem var(--hb-gutter) 1.5rem" }}>
        <div style={{ maxWidth: "42rem", margin: "0 auto" }}>
          <p
            style={{
              textTransform: "uppercase",
              fontSize: "0.75rem",
              letterSpacing: "var(--hb-track-nav)",
              color: "var(--hb-smoke)",
              fontFamily: "var(--hb-font-mono)",
              margin: 0,
            }}
          >
            Preorder
          </p>
          <h2
            style={{
              fontFamily: "var(--hb-font-serif)",
              fontSize: "1.875rem",
              margin: "0.75rem 0 2rem",
              color: "var(--hb-ink)",
            }}
          >
            Made to order — no excess, no waste.
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem", fontSize: "1rem", lineHeight: 1.7, color: "var(--hb-ink)" }}>
            <p style={{ margin: 0 }}>
              Every piece on this site is a preorder. When you purchase, your payment goes directly toward sourcing materials and manufacturing your garment. Nothing is produced speculatively.
            </p>
            <p style={{ margin: 0 }}>
              Production only begins once we reach a minimum number of orders. If that threshold isn&rsquo;t met, you will be fully refunded — no questions asked.
            </p>
            <p style={{ margin: 0 }}>
              Once production begins, your garment is cut, sewn, and shipped to you in <strong>3–4 months</strong>.
            </p>
          </div>
        </div>
      </section>

      {/* ── Band 4 — Materials tags ── */}
      <section id="materials" style={{ background: "rgba(245,242,237,0.94)", padding: "0.75rem var(--hb-gutter)" }}>
        <div style={{ maxWidth: "56rem", margin: "0 auto", display: "flex", flexWrap: "wrap", gap: "0.75rem" }}>
          {product.tags.map((tag) => (
            <Tag key={tag}>{tag}</Tag>
          ))}
        </div>
      </section>

      {/* ── Band 5 — FAQ ── */}
      <section id="faq" style={{ background: "rgba(245,242,237,0.94)", padding: "2.5rem var(--hb-gutter)" }}>
        <div style={{ maxWidth: "42rem", margin: "0 auto" }}>
          <FAQAccordion
            items={[
              { question: "When does my order ship?", answer: "Your garment is cut, sewn and shipped 3–4 months after production begins." },
              { question: "What if the minimum isn't met?", answer: "You are fully refunded — no questions asked." },
              { question: "How should I care for it?", answer: product.care },
            ]}
          />
        </div>
      </section>

      {/* ── Band 6 — Drop list ── */}
      <section id="drop-list" style={{ background: "rgba(245,242,237,0.94)", padding: "1.5rem var(--hb-gutter) 4rem" }}>
        <div style={{ maxWidth: "42rem", margin: "0 auto", textAlign: "center" }}>
          <p
            style={{
              textTransform: "uppercase",
              fontSize: "0.75rem",
              letterSpacing: "var(--hb-track-nav)",
              color: "var(--hb-smoke)",
              opacity: 0.7,
              fontFamily: "var(--hb-font-mono)",
              margin: 0,
            }}
          >
            Stay in the Loop
          </p>
          <div style={{ display: "flex", justifyContent: "center", margin: "0.5rem 0" }}>
            <InkUnderline width={80} variant="delicate" strokeOpacity={0.3} />
          </div>
          <h2
            style={{
              fontFamily: "var(--hb-font-serif)",
              fontStyle: "italic",
              fontWeight: 300,
              fontSize: "2rem",
              color: "var(--hb-ink)",
              margin: "0 0 0.75rem",
            }}
          >
            Join the Drop List
          </h2>
          <p style={{ color: "var(--hb-smoke)", fontSize: "1rem", margin: "0 0 1.5rem" }}>
            Be the first to know about future releases and updates.
          </p>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: "1.5rem" }}>
            <ScribbleArrow direction="down" size={28} strokeOpacity={0.4} />
          </div>
          <EmailCaptureForm />
        </div>
      </section>

      {/* ── Band 7 — Related ── */}
      {related.length > 0 && (
        <PageShell
          eyebrow="From the archive"
          title="You may also like"
          intro="Pieces that share fabrication notes or silhouettes with this garment."
        >
          <div
            style={{
              display: "grid",
              gap: "var(--hb-grid-gap)",
              gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 18rem), 1fr))",
            }}
          >
            {related.map((p) => (
              <ProductCard key={p.id} product={p} variant="light" />
            ))}
          </div>
        </PageShell>
      )}
    </main>
  );
}
