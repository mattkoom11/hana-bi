"use client";

import { CartDrawer } from "@/components/cart/CartDrawer";
import { useCartCount } from "@/store/cart";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/shop", label: "Shop" },
  { href: "/archive", label: "Archive" },
  { href: "/about", label: "About" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const cartCount = useCartCount();
  const [open, setOpen] = useState(false);

  return (
    <>
      <header className="px-4 sm:px-8 md:px-12 lg:px-20 py-8 flex flex-col gap-6 relative">
        {/* Wispy bottom border */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[var(--hb-border)] to-transparent opacity-40" />
        
        <div className="flex items-center justify-between">
          <Link href="/" className="font-serif text-3xl tracking-[0.08em] hover-wispy">
            Hana-Bi
          </Link>
          <button
            onClick={() => setOpen(true)}
            className="relative text-xs uppercase tracking-[0.4em] border border-[var(--hb-border)] px-5 py-2.5 hover-wispy opacity-70 hover:opacity-100 transition-all duration-300"
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
        <nav className="flex flex-wrap gap-6 text-xs uppercase tracking-[0.4em] text-[var(--hb-smoke)]">
          {NAV_LINKS.map((link) => {
            const isActive =
              link.href === "/"
                ? pathname === "/"
                : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`pb-1.5 relative hover-wispy ${
                  isActive
                    ? "text-[var(--hb-ink)]"
                    : "text-[var(--hb-smoke)] hover:text-[var(--hb-ink-light)]"
                }`}
              >
                {link.label}
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-[1px] bg-[var(--hb-ink)] opacity-40" />
                )}
              </Link>
            );
          })}
          <Link
            href="/cart"
            className="ml-auto text-[var(--hb-ink-light)] border-b border-dashed border-[var(--hb-border)] border-opacity-40 hover:border-opacity-70 hover-wispy pb-1.5"
          >
            Full Cart →
          </Link>
        </nav>
      </header>
      <CartDrawer open={open} onClose={() => setOpen(false)} />
    </>
  );
}

