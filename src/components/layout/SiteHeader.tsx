"use client";

import { CartDrawer } from "@/components/cart/CartDrawer";
import { InkUnderline } from "@/components/common/InkUnderline";
import { RollText } from "@/components/common/RollText";
import { useHeaderTheme } from "@/hooks/useHeaderTheme";
import { useCartCount } from "@/store/cart";
import Link from "next/link";
import { OPEN_CART_EVENT } from "@/lib/open-cart";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/shop", label: "Shop" },
  { href: "/archive", label: "Archive" },
  { href: "/projects", label: "Projects" },
  { href: "/about", label: "About" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const cartCount = useCartCount();
  const [open, setOpen] = useState(false);
  const theme = useHeaderTheme();
  const isDark = theme === "dark";

  useEffect(() => {
    const onOpenCart = () => setOpen(true);
    window.addEventListener(OPEN_CART_EVENT, onOpenCart);
    return () => window.removeEventListener(OPEN_CART_EVENT, onOpenCart);
  }, []);

  return (
    <>
      <header className="px-4 sm:px-8 md:px-12 lg:px-20 py-10 flex flex-col gap-8 relative">
        {!isDark && (
          <div className="absolute bottom-0 left-0 right-0 flex justify-center">
            <div className="w-full max-w-6xl mx-auto">
              <div className="h-px bg-gradient-to-r from-transparent via-[var(--hb-border)] to-transparent opacity-30" />
            </div>
          </div>
        )}

        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="text-3xl tracking-[0.08em] hover-wispy relative group transition-colors italic font-light text-white"
            style={{ fontFamily: "var(--hb-font-display)", mixBlendMode: "exclusion" }}
          >
            Hana-Bi
            <span className="absolute -bottom-1 left-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
              <InkUnderline width={120} variant="delicate" strokeOpacity={0.3} />
            </span>
          </Link>

          <button
            onClick={() => setOpen(true)}
            className={`relative text-xs uppercase tracking-[0.4em] border px-6 py-3 hover-wispy opacity-70 hover:opacity-100 transition-all duration-300 ${
              isDark
                ? "bg-[var(--hb-dark-surface)] text-[#faf8f4] border-[var(--hb-dark-border)] hover:border-[var(--hb-sienna)]"
                : "border-dashed border-[var(--hb-border)] text-[var(--hb-ink)] btn-sketch"
            }`}
            style={{ fontFamily: "var(--hb-font-mono)" }}
          >
            Cart
            {cartCount > 0 && (
              <span
                className={`absolute -top-2 -right-2 w-5 h-5 text-[0.65rem] rounded-full flex items-center justify-center ${
                  isDark
                    ? "bg-[var(--hb-sienna)] text-[#faf8f4]"
                    : "bg-[var(--hb-ink)] text-[var(--hb-paper)]"
                }`}
                style={{ fontFamily: "var(--hb-font-mono)" }}
              >
                {cartCount}
              </span>
            )}
          </button>
        </div>

        <nav
          className={`flex flex-wrap gap-8 text-xs uppercase tracking-[0.4em] ${
            isDark ? "text-[var(--hb-dark-muted)]" : "text-[var(--hb-smoke)]"
          }`}
          style={{ fontFamily: "var(--hb-font-mono)" }}
        >
          {NAV_LINKS.map((link) => {
            const isActive =
              link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`group pb-2 relative transition-all duration-300 ${
                  isActive
                    ? isDark ? "text-[#faf8f4]" : "text-[var(--hb-ink)]"
                    : isDark ? "hover:text-[#faf8f4]" : "hover:text-[var(--hb-ink-light)]"
                }`}
              >
                <RollText>{link.label}</RollText>
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 flex justify-center text-[var(--hb-sienna)]">
                    <InkUnderline width={60} variant="wispy" strokeOpacity={0.6} />
                  </span>
                )}
              </Link>
            );
          })}
          <Link
            href="/cart"
            className={`group ml-auto border-b border-dashed pb-2 transition-all duration-300 ${
              isDark
                ? "text-[var(--hb-dark-muted)] border-[var(--hb-dark-border)] hover:text-[#faf8f4]"
                : "text-[var(--hb-ink-light)] border-[var(--hb-border)] border-opacity-40 hover:border-opacity-70"
            }`}
          >
            <RollText>Full Cart →</RollText>
          </Link>
        </nav>
      </header>
      <CartDrawer open={open} onClose={() => setOpen(false)} />
    </>
  );
}
