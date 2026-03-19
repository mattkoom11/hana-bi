import Link from "next/link";

const FOOTER_LINKS = [
  { label: "Careers", href: "#" },
  { label: "Stockists", href: "#" },
  { label: "Press", href: "#" },
  { label: "Contact", href: "#" },
];

export function SiteFooter() {
  return (
    <footer className="bg-[var(--hb-dark)] px-4 sm:px-8 md:px-12 lg:px-20 py-12 relative mt-20">
      {/* Top border */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[var(--hb-dark-border)] to-transparent" />

      <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
        <div className="space-y-3">
          <p className="uppercase text-xs tracking-[0.35em] text-[var(--hb-sienna)] font-script opacity-70">
            Hana-Bi
          </p>
          <h3 className="font-serif text-3xl tracking-tight text-[#faf8f4]">
            Study the Archive.
          </h3>
          <p className="text-sm text-[var(--hb-dark-muted)] leading-relaxed">
            Sustainable denim and garments captured like museum pieces.
          </p>
        </div>
        <div className="flex flex-wrap gap-6 text-xs uppercase tracking-[0.3em] text-[var(--hb-dark-muted)]">
          {FOOTER_LINKS.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="pb-1 border-b border-transparent hover:border-[var(--hb-sienna)] hover:text-[#faf8f4] hover-wispy opacity-70 hover:opacity-100 transition-all duration-300"
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
      <div className="mt-10 text-[0.65rem] uppercase tracking-[0.4em] text-[var(--hb-dark-muted)] font-script opacity-50">
        © {new Date().getFullYear()} Hana-Bi Atelier — Crafted in limited runs.
      </div>
    </footer>
  );
}
