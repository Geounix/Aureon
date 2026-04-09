export default function FilmLoading() {
  return (
    <div className="animate-pulse">
      {/* Hero Skeleton */}
      <div className="relative h-[600px] w-full bg-[var(--bg-card)] overflow-hidden">
        <div className="skeleton absolute inset-0" />
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-primary)] to-transparent" />
        
        <div className="absolute bottom-16 left-8 space-y-4">
          <div className="h-10 w-96 rounded bg-[var(--bg-elevated)] mb-4" />
          <div className="h-4 w-2/3 rounded bg-[var(--bg-card)]" />
          <div className="h-4 w-1/2 rounded bg-[var(--bg-card)] mb-6" />
          
          <div className="flex gap-4">
            <div className="h-12 w-32 rounded-lg bg-[var(--bg-elevated)]" />
            <div className="h-12 w-32 rounded-lg bg-[var(--bg-elevated)]" />
          </div>
        </div>
      </div>

      {/* Content Skeleton */}
      <div className="px-8 py-8 space-y-10 relative z-20 -mt-10">
        {[...Array(2)].map((_, j) => (
          <div key={j} className="space-y-4">
            <div className="h-6 w-48 rounded bg-[var(--bg-card)]" />
            <div className="flex gap-4 overflow-hidden">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="w-48 shrink-0 space-y-2">
                  <div className="w-full aspect-[2/3] rounded-md bg-[var(--bg-elevated)] border border-[var(--border)] overflow-hidden">
                     <div className="skeleton absolute inset-0 rounded-md" />
                  </div>
                  <div className="h-4 w-3/4 rounded bg-[var(--bg-card)]" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
