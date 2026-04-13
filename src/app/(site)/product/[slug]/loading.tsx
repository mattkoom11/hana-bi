export default function ProductLoading() {
  return (
    <div className="animate-pulse">
      {/* Dark hero section */}
      <section className="bg-[var(--hb-dark)] min-h-[70vh] px-4 sm:px-8 md:px-12 lg:px-20 py-16">
        <div className="max-w-7xl mx-auto grid gap-12 lg:grid-cols-[1fr_1fr] items-center">
          {/* Image skeleton */}
          <div className="aspect-[3/4] bg-[var(--hb-dark-surface)] rounded" />
          {/* Purchase panel skeleton */}
          <div className="space-y-6">
            <div className="h-3 w-24 bg-[var(--hb-dark-surface)] rounded" />
            <div className="h-10 w-3/4 bg-[var(--hb-dark-surface)] rounded" />
            <div className="h-4 w-20 bg-[var(--hb-dark-surface)] rounded" />
            <div className="flex gap-3 pt-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-11 w-16 bg-[var(--hb-dark-surface)] rounded" />
              ))}
            </div>
            <div className="h-14 w-full bg-[var(--hb-dark-surface)] rounded" />
          </div>
        </div>
      </section>
      {/* Light section skeleton */}
      <section className="px-4 sm:px-8 md:px-12 lg:px-20 py-16">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="h-32 bg-[var(--hb-smoke)]/10 rounded" />
          <div className="grid gap-6 md:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-[var(--hb-smoke)]/10 rounded" />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
