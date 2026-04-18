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
  const [cartOpen, setCartOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const theme = useHeaderTheme();
  const isDark = theme === "dark";

  useEffect(() => {
    const onOpenCart = () => setCartOpen(true);
    window.addEventListener(OPEN_CART_EVENT, onOpenCart);
    return () => window.removeEventListener(OPEN_CART_EVENT, onOpenCart);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  // Close menu on route change
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  return (
    <>
      <header className="px-4 sm:px-8 md:px-12 lg:px-20 py-10 flex flex-col gap-8 relative">
        {isDark && (
          <div className="absolute inset-0 bg-gradient-to-b from-[rgba(0,0,0,0.45)] to-transparent pointer-events-none" />
        )}
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
            className="text-3xl tracking-[0.08em] hover-wispy relative group transition-colors italic font-normal text-white"
            style={{
              fontFamily: "var(--hb-font-display)",
              color: "#ffffff",
              textShadow:
                "0 0 1px #000000, 0 1px 2px #000000, 0 2px 4px #000000, 0 3px 10px rgba(0,0,0,0.95), 0 6px 18px rgba(0,0,0,0.75)",
            }}
          >
            Hana-Bi
            <span className="absolute -bottom-1 left-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
              <InkUnderline width={120} variant="delicate" strokeOpacity={0.3} />
            </span>
          </Link>

          <div className="flex items-center gap-3">
            {/* Cart button */}
            <button
              onClick={() => setCartOpen(true)}
              aria-label={`Open cart${cartCount > 0 ? `, ${cartCount} items` : ""}`}
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
                  aria-hidden="true"
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

            {/* Hamburger — mobile only */}
            <button
              onClick={() => setMenuOpen(true)}
              aria-label="Open menu"
              className="md:hidden flex flex-col justify-center gap-[5px] w-10 h-10 opacity-70 hover:opacity-100 transition-opacity"
            >
              <span className="block h-px w-6 bg-white" />
              <span className="block h-px w-4 bg-white" />
              <span className="block h-px w-6 bg-white" />
            </button>
          </div>
        </div>

        {/* Desktop nav */}
        <nav
          className={`hidden md:flex flex-wrap gap-8 text-xs uppercase tracking-[0.4em] ${
            isDark ? "text-[rgba(250,248,244,0.82)]" : "text-[var(--hb-smoke)]"
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

      {/* Mobile menu overlay */}
      <div
        className={`fixed inset-0 z-50 bg-[var(--hb-dark)] flex flex-col transition-opacity duration-300 md:hidden ${
          menuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      >
        {/* Top bar */}
        <div className="flex items-center justify-between px-6 py-8">
          <span
            className="text-3xl italic font-light text-[#faf8f4]"
            style={{ fontFamily: "var(--hb-font-display)" }}
          >
            Hana-Bi
          </span>
          <button
            onClick={() => setMenuOpen(false)}
            aria-label="Close menu"
            className="text-[var(--hb-dark-muted)] hover:text-[#faf8f4] transition-colors text-2xl leading-none"
            style={{ fontFamily: "var(--hb-font-mono)" }}
          >
            ✕
          </button>
        </div>

        {/* Nav links */}
        <nav className="flex-1 flex flex-col justify-center px-8 gap-2">
          {NAV_LINKS.map((link, i) => {
            const isActive =
              link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`py-4 border-b border-[var(--hb-dark-border)] transition-colors duration-200 ${
                  isActive ? "text-[#faf8f4]" : "text-[var(--hb-dark-muted)] hover:text-[#faf8f4]"
                }`}
                style={{
                  fontFamily: "var(--hb-font-display)",
                  fontSize: `clamp(2rem, ${8 - i * 0.3}vw, 3.5rem)`,
                  fontStyle: "italic",
                  fontWeight: 300,
                  transitionDelay: menuOpen ? `${i * 40}ms` : "0ms",
                }}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Social + copyright */}
        <div className="px-8 pb-10 flex items-center justify-between">
          <div
            className="flex gap-6 text-[0.65rem] uppercase tracking-[0.4em] text-[var(--hb-dark-muted)]"
            style={{ fontFamily: "var(--hb-font-mono)" }}
          >
            <Link
              href="https://www.instagram.com/hana.bi.st2"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#faf8f4] transition-colors"
            >
              Instagram
            </Link>
            <Link
              href="https://www.tiktok.com/@hana_bi1111"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#faf8f4] transition-colors"
            >
              TikTok
            </Link>
          </div>
          <p
            className="text-[0.6rem] uppercase tracking-[0.3em] text-[var(--hb-dark-muted)] opacity-40"
            style={{ fontFamily: "var(--hb-font-mono)" }}
          >
            © {new Date().getFullYear()} Hana-Bi
          </p>
        </div>
      </div>

      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  );
}
