import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="min-h-screen bg-[var(--hb-dark)] flex items-center justify-center px-4">
      <div className="max-w-md text-center space-y-8">
        <p
          className="uppercase text-xs tracking-[0.5em] opacity-70"
          style={{ fontFamily: 'var(--hb-font-mono)', color: 'var(--hb-sienna)' }}
        >
          HB — 404
        </p>
        <h1
          className="text-5xl lg:text-6xl leading-tight text-[#faf8f4] italic font-light"
          style={{ fontFamily: 'var(--hb-font-display)' }}
        >
          Page not found.
        </h1>
        <p
          className="text-sm leading-relaxed"
          style={{ fontFamily: 'var(--hb-font-mono)', color: 'var(--hb-dark-muted)' }}
        >
          This garment may have moved to the archive, or the URL was mistyped.
        </p>
        <div className="flex gap-4 justify-center flex-wrap pt-4">
          <Link
            href="/shop"
            className="px-8 py-4 bg-[var(--hb-sienna)] text-[#faf8f4] uppercase tracking-[0.4em] text-xs hover:opacity-90 transition-opacity"
            style={{ fontFamily: 'var(--hb-font-mono)' }}
          >
            Browse Shop
          </Link>
          <Link
            href="/archive"
            className="px-8 py-4 border border-[var(--hb-dark-border)] text-[var(--hb-dark-muted)] uppercase tracking-[0.4em] text-xs hover:text-[#faf8f4] hover:border-[var(--hb-sienna)] transition-all"
            style={{ fontFamily: 'var(--hb-font-mono)' }}
          >
            Enter Archive
          </Link>
        </div>
      </div>
    </main>
  );
}
