"use client";

import { ShopWaitlistForm } from "@/components/shop/ShopWaitlistForm";
import { Product } from "@/data/products";
import { formatCurrency } from "@/lib/utils";

interface ProductPurchasePanelProps {
  product: Product;
}

export function ProductPurchasePanel({
  product,
}: ProductPurchasePanelProps) {

  return (
    <div className="space-y-6 border border-[var(--hb-border)] border-dashed p-8 relative">
      {/* Subtle paper texture */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-[0.02]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100' height='100' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          backgroundSize: "200px 200px",
        }}
      />
      
      <div className="relative z-10">
        <div>
          <p className="font-serif text-3xl lg:text-4xl leading-tight">{product.name}</p>
          <p className="uppercase text-xs tracking-[0.4em] text-[var(--hb-smoke)] font-script opacity-70 mt-3">
            {product.collection} · {product.year}
          </p>
          <p className="mt-6 text-xl font-serif">{formatCurrency(product.price)}</p>
        </div>

        {/* Preorder model explainer */}
        <div className="border border-dashed border-[var(--hb-border)] px-5 py-4 space-y-3">
          <p className="uppercase text-xs tracking-[0.3em] text-[var(--hb-smoke)] opacity-70">
            Made to order
          </p>
          <p className="text-sm text-[var(--hb-smoke)] leading-relaxed">
            Every piece is preordered before it's made. Your payment funds the materials and manufacturing — your garment is then cut, sewn, and shipped directly to you.
          </p>
          <div className="flex flex-col gap-1.5 pt-1">
            {[
              ["01", "Preorder opens — you pay upfront"],
              ["02", "Materials sourced, garment manufactured"],
              ["03", "Ships to you in 2–3 months"],
            ].map(([num, label]) => (
              <div key={num} className="flex items-baseline gap-3">
                <span className="text-[0.65rem] font-mono text-[var(--hb-smoke)] opacity-50 shrink-0">{num}</span>
                <span className="text-xs text-[var(--hb-smoke)] opacity-80">{label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="pt-2">
          <ShopWaitlistForm />
        </div>
      </div>
    </div>
  );
}

