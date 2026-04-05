export default function ProjectLoading() {
  return (
    <div className="px-4 sm:px-8 md:px-12 lg:px-20 py-16 animate-pulse">
      <div className="max-w-5xl mx-auto space-y-10">
        {/* Breadcrumb */}
        <div className="h-3 w-24 bg-[var(--hb-smoke)]/20 rounded" />
        {/* Hero image */}
        <div className="aspect-[16/9] bg-[var(--hb-smoke)]/10 rounded" />
        {/* Title block */}
        <div className="space-y-3">
          <div className="h-10 w-2/3 bg-[var(--hb-smoke)]/10 rounded" />
          <div className="h-4 w-1/2 bg-[var(--hb-smoke)]/10 rounded" />
        </div>
        {/* Content blocks */}
        <div className="grid gap-6 md:grid-cols-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-20 bg-[var(--hb-smoke)]/10 rounded" />
          ))}
        </div>
      </div>
    </div>
  );
}
