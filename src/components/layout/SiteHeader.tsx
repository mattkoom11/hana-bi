"use client";

import { CartDrawer } from "@/components/cart/CartDrawer";
import { InkUnderline } from "@/components/common/InkUnderline";
import { RollText } from "@/components/common/RollText";
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

  // Close menu on route change — adjusted during render, not in an effect.
  const [menuPathname, setMenuPathname] = useState(pathname);
  if (pathname !== menuPathname) {
    setMenuPathname(pathname);
    setMenuOpen(false);
  }

  return (
    <>
      {/* The header always sits over the video — including on paper pages —
          so it is always light-on-dark. */}
      <header className="px-4 sm:px-8 md:px-12 lg:px-20 py-10 flex flex-col gap-8 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-[rgba(0,0,0,0.45)] to-transparent pointer-events-none" />

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
            {/* The one cart control: bare text, opens the drawer (which links
                to the full cart page). */}
            <button
              onClick={() => setCartOpen(true)}
              aria-label={`Open cart${cartCount > 0 ? `, ${cartCount} items` : ""}`}
              className="min-h-[var(--hb-touch-min,44px)] px-2 text-xs uppercase tracking-[0.4em] text-[rgba(250,248,244,0.82)] hover:text-[#faf8f4] transition-colors duration-300"
              style={{ fontFamily: "var(--hb-font-mono)" }}
            >
              Cart{cartCount > 0 && <span aria-hidden="true"> · {cartCount}</span>}
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
          className="hidden md:flex flex-wrap gap-8 text-xs uppercase tracking-[0.4em] text-[rgba(250,248,244,0.82)]"
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
                  isActive ? "text-[#faf8f4]" : "hover:text-[#faf8f4]"
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
        </nav>
      </header>

      {/* Mobile menu overlay — rendered outside header, always in DOM on mobile */}
      {menuOpen && (
        <div
          className="fixed inset-0 z-[9999] flex flex-col md:hidden"
          style={{ backgroundColor: "#0e0c0b" }}
        >
          {/* Top bar */}
          <div className="flex items-center justify-between px-6 py-8 shrink-0">
            <span
              className="text-3xl italic font-light"
              style={{ fontFamily: "var(--hb-font-display)", color: "#faf8f4" }}
            >
              Hana-Bi
            </span>
            <button
              onClick={() => setMenuOpen(false)}
              aria-label="Close menu"
              style={{ fontFamily: "var(--hb-font-mono)", color: "#faf8f4", fontSize: "1.5rem", lineHeight: 1 }}
            >
              ✕
            </button>
          </div>

          {/* Nav links */}
          <nav className="flex-1 flex flex-col justify-center px-8" style={{ gap: "0" }}>
            {NAV_LINKS.map((link) => {
              const isActive =
                link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  style={{
                    fontFamily: "var(--hb-font-display)",
                    fontSize: "clamp(2rem, 9vw, 3.5rem)",
                    fontStyle: "italic",
                    fontWeight: 300,
                    color: isActive ? "#faf8f4" : "rgba(250,248,244,0.65)",
                    borderBottom: "1px solid rgba(250,248,244,0.08)",
                    padding: "1rem 0",
                    display: "block",
                  }}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Social + copyright */}
          <div className="px-8 pb-10 shrink-0 flex items-center justify-between">
            <div
              className="flex gap-6"
              style={{ fontFamily: "var(--hb-font-mono)", fontSize: "0.65rem", letterSpacing: "0.4em", textTransform: "uppercase", color: "rgba(250,248,244,0.5)" }}
            >
              <Link
                href="https://www.instagram.com/hana.bi.st2"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: "inherit" }}
              >
                Instagram
              </Link>
              <Link
                href="https://www.tiktok.com/@hana_bi1111"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: "inherit" }}
              >
                TikTok
              </Link>
            </div>
            <p
              style={{ fontFamily: "var(--hb-font-mono)", fontSize: "0.6rem", letterSpacing: "0.3em", textTransform: "uppercase", color: "rgba(250,248,244,0.3)" }}
            >
              © {new Date().getFullYear()} Hana-Bi
            </p>
          </div>
        </div>
      )}

      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  );
}
