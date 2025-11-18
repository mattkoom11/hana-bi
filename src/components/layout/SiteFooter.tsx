import Link from "next/link";

const FOOTER_LINKS = [
  { label: "Careers", href: "#" },
  { label: "Stockists", href: "#" },
  { label: "Press", href: "#" },
  { label: "Contact", href: "#" },
];

export function SiteFooter() {
  return (
    <footer className="px-4 sm:px-8 md:px-12 lg:px-20 py-10 border-t border-[var(--hb-border)] bg-[var(--hb-paper-muted)] mt-16">
      <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="uppercase text-xs tracking-[0.35em] text-[var(--hb-smoke)]">
            Hana-Bi
          </p>
          <h3 className="font-serif text-3xl mt-3">Study the Archive.</h3>
          <p className="text-sm text-[var(--hb-smoke)] mt-2">
            Sustainable denim and garments captured like museum pieces.
          </p>
        </div>
        <div className="flex flex-wrap gap-4 text-xs uppercase tracking-[0.3em] text-[var(--hb-smoke)]">
          {FOOTER_LINKS.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="border-b border-transparent hover:border-[var(--hb-border)] pb-1"
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
      <div className="mt-8 text-[0.65rem] uppercase tracking-[0.4em] text-[var(--hb-smoke)]">
        © {new Date().getFullYear()} Hana-Bi Atelier — Crafted in limited runs.
      </div>
    </footer>
  );
}

