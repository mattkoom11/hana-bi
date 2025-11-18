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
      <header className="px-4 sm:px-8 md:px-12 lg:px-20 py-6 flex flex-col gap-4 border-b border-[var(--hb-border)] bg-[var(--hb-paper)]">
        <div className="flex items-center justify-between">
          <Link href="/" className="font-serif text-2xl tracking-[0.1em]">
            Hana-Bi
          </Link>
          <button
            onClick={() => setOpen(true)}
            className="relative text-xs uppercase tracking-[0.4em] border border-[var(--hb-border)] px-4 py-2 hover:-translate-y-0.5 transition"
          >
            Cart
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-[var(--hb-ink)] text-[var(--hb-paper)] w-6 h-6 text-[0.7rem] rounded-full flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </button>
        </div>
        <nav className="flex flex-wrap gap-4 text-xs uppercase tracking-[0.4em] text-[var(--hb-smoke)]">
          {NAV_LINKS.map((link) => {
            const isActive =
              link.href === "/"
                ? pathname === "/"
                : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`pb-1 border-b ${
                  isActive
                    ? "border-[var(--hb-ink)] text-[var(--hb-ink)]"
                    : "border-transparent hover:border-[var(--hb-border)]"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
          <Link
            href="/cart"
            className="ml-auto text-[var(--hb-ink)] border-b border-transparent hover:border-[var(--hb-border)]"
          >
            Full Cart →
          </Link>
        </nav>
      </header>
      <CartDrawer open={open} onClose={() => setOpen(false)} />
    </>
  );
}

