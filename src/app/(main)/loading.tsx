import { LayoutGrid } from 'lucide-react'

export default function Loading() {
  return (
    <div className="px-8 py-8 animate-pulse text-white">
      {/* Header skeleton */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-8 h-8 rounded-full bg-[var(--bg-elevated)]" />
        <div className="h-8 w-48 rounded bg-[var(--bg-card)]" />
      </div>

      {/* Grid skeleton */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
        {[...Array(12)].map((_, i) => (
          <div key={i} className="flex flex-col gap-2">
            <div className="w-full aspect-[2/3] object-cover rounded-md bg-[var(--bg-card)] border border-[var(--border)] relative overflow-hidden">
                <div className="skeleton absolute inset-0 rounded-md" />
            </div>
            <div className="h-4 w-3/4 rounded bg-[var(--bg-elevated)]" />
            <div className="h-3 w-1/2 rounded bg-[var(--bg-card)]" />
          </div>
        ))}
      </div>
    </div>
  )
}
