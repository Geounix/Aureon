'use client'

import { useState, useEffect } from 'react'
import { Plus, Check, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

export function WatchlistButton({ mediaId }: { mediaId: string }) {
  const [inList, setInList] = useState(false)
  const [loading, setLoading] = useState(true)
  const [pending, setPending] = useState(false)

  useEffect(() => {
    fetch(`/api/watchlist?mediaId=${mediaId}`)
      .then((r) => r.json())
      .then((d) => {
        setInList(d.inList)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [mediaId])

  async function toggle() {
    if (pending) return
    setPending(true)

    if (inList) {
      await fetch(`/api/watchlist?mediaId=${mediaId}`, { method: 'DELETE' })
      setInList(false)
    } else {
      await fetch('/api/watchlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mediaId }),
      })
      setInList(true)
    }
    setPending(false)
  }

  if (loading) {
    return (
      <button className="btn-secondary opacity-50" disabled>
        <Loader2 size={16} className="animate-spin" />
        Mi lista
      </button>
    )
  }

  return (
    <button
      id={`watchlist-btn-${mediaId}`}
      onClick={toggle}
      disabled={pending}
      className={cn('btn-secondary', inList && 'border-[var(--accent-primary)] text-[var(--accent-primary)]')}
    >
      {pending ? (
        <Loader2 size={16} className="animate-spin" />
      ) : inList ? (
        <Check size={16} />
      ) : (
        <Plus size={16} />
      )}
      {inList ? 'En mi lista' : 'Mi lista'}
    </button>
  )
}
