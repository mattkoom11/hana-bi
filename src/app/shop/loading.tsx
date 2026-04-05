export default function ShopLoading() {
  return (
    <div className="px-4 sm:px-8 md:px-12 lg:px-20 py-16 bg-[var(--hb-dark)] min-h-screen">
      {/* Page shell skeleton */}
      <div className="space-y-3 mb-12 max-w-2xl">
        <div className="h-3 w-16 bg-[var(--hb-dark-surface)] rounded" />
        <div className="h-10 w-80 bg-[var(--hb-dark-surface)] rounded" />
        <div className="h-4 w-64 bg-[var(--hb-dark-surface)] rounded opacity-60" />
      </div>
      {/* Filter skeleton */}
      <div className="flex gap-3 mb-8">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-8 w-20 bg-[var(--hb-dark-surface)] rounded" />
        ))}
      </div>
      {/* Product grid skeleton */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="space-y-3 animate-pulse">
            <div className="aspect-[3/4] bg-[var(--hb-dark-surface)] rounded" />
            <div className="h-4 w-3/4 bg-[var(--hb-dark-surface)] rounded" />
            <div className="h-3 w-1/2 bg-[var(--hb-dark-surface)] rounded opacity-60" />
          </div>
        ))}
      </div>
    </div>
  );
}
