"use client";

import { CartDrawer } from "@/components/cart/CartDrawer";
import { InkUnderline } from "@/components/common/InkUnderline";
import { useCartCount } from "@/store/cart";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/shop", label: "Shop" },
  { href: "/projects", label: "Projects" },
  { href: "/archive", label: "Archive" },
  { href: "/about", label: "About" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const cartCount = useCartCount();
  const [open, setOpen] = useState(false);

  return (
    <>
      <header className="px-4 sm:px-8 md:px-12 lg:px-20 py-10 flex flex-col gap-8 relative">
        {/* Hand-drawn bottom border */}
        <div className="absolute bottom-0 left-0 right-0 flex justify-center">
          <div className="w-full max-w-6xl mx-auto">
            <div className="h-px bg-gradient-to-r from-transparent via-[var(--hb-border)] to-transparent opacity-30" />
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <Link 
            href="/" 
            className="font-serif text-3xl tracking-[0.08em] hover-wispy relative group"
            style={{
              textShadow: "0 0 1px rgba(26, 26, 26, 0.1)",
            }}
          >
            Hana-Bi
            {/* Subtle hand-drawn underline on hover */}
            <span className="absolute -bottom-1 left-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
              <InkUnderline width={120} variant="delicate" strokeOpacity={0.3} />
            </span>
          </Link>
          <button
            onClick={() => setOpen(true)}
            className="relative text-xs uppercase tracking-[0.4em] border border-[var(--hb-border)] px-6 py-3 hover-wispy opacity-70 hover:opacity-100 transition-all duration-300 btn-sketch"
            style={{ borderStyle: "dashed", borderWidth: "1px" }}
          >
            Cart
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-[var(--hb-ink)] text-[var(--hb-paper)] w-5 h-5 text-[0.65rem] rounded-full flex items-center justify-center font-script">
                {cartCount}
              </span>
            )}
          </button>
        </div>
        <nav className="flex flex-wrap gap-8 text-xs uppercase tracking-[0.4em] text-[var(--hb-smoke)]">
          {NAV_LINKS.map((link) => {
            const isActive =
              link.href === "/"
                ? pathname === "/"
                : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`pb-2 relative hover-wispy transition-all duration-300 ${
                  isActive
                    ? "text-[var(--hb-ink)]"
                    : "text-[var(--hb-smoke)] hover:text-[var(--hb-ink-light)]"
                }`}
              >
                {link.label}
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 flex justify-center">
                    <InkUnderline width={60} variant="wispy" strokeOpacity={0.4} />
                  </span>
                )}
              </Link>
            );
          })}
          <Link
            href="/cart"
            className="ml-auto text-[var(--hb-ink-light)] border-b border-dashed border-[var(--hb-border)] border-opacity-40 hover:border-opacity-70 hover-wispy pb-2 transition-all duration-300"
          >
            Full Cart →
          </Link>
        </nav>
      </header>
      <CartDrawer open={open} onClose={() => setOpen(false)} />
    </>
  );
}

