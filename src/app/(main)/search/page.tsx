'use client'

import { useState, useTransition } from 'react'
import { Search, Film, Music, BookOpen, Loader2 } from 'lucide-react'
import Link from 'next/link'

interface SearchResult {
  type: 'video' | 'music' | 'comic'
  id: string
  title: string
  subtitle?: string
  year?: number
}

async function searchAll(query: string): Promise<SearchResult[]> {
  if (!query.trim()) return []
  const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`)
  if (!res.ok) return []
  return res.json()
}

export default function SearchPage() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [isPending, startTransition] = useTransition()
  const [searched, setSearched] = useState(false)

  function handleSearch(value: string) {
    setQuery(value)
    if (value.length < 2) {
      setResults([])
      setSearched(false)
      return
    }
    startTransition(async () => {
      const data = await searchAll(value)
      setResults(data)
      setSearched(true)
    })
  }

  const videos = results.filter((r) => r.type === 'video')
  const music = results.filter((r) => r.type === 'music')
  const comics = results.filter((r) => r.type === 'comic')

  return (
    <div className="px-8 py-8">
      <h1 className="font-display text-3xl font-bold mb-6" style={{ color: 'var(--text-primary)' }}>
        Buscar
      </h1>

      {/* Search input */}
      <div className="relative max-w-2xl mb-8">
        <Search
          size={18}
          className="absolute left-4 top-1/2 -translate-y-1/2"
          style={{ color: 'var(--text-muted)' }}
        />
        <input
          id="global-search-input"
          type="search"
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Busca películas, series, música, cómics..."
          className="input-base pl-11 text-base py-3"
          autoFocus
        />
        {isPending && (
          <Loader2
            size={16}
            className="absolute right-4 top-1/2 -translate-y-1/2 animate-spin"
            style={{ color: 'var(--text-muted)' }}
          />
        )}
      </div>

      {/* Results */}
      {!searched && (
        <div className="text-center py-16" style={{ color: 'var(--text-muted)' }}>
          <Search size={48} className="mx-auto mb-3" />
          <p className="text-sm">Escribe para buscar en toda tu biblioteca</p>
        </div>
      )}

      {searched && results.length === 0 && (
        <div className="text-center py-16" style={{ color: 'var(--text-muted)' }}>
          <p className="text-sm">Sin resultados para "{query}"</p>
        </div>
      )}

      {results.length > 0 && (
        <div className="space-y-8">
          {videos.length > 0 && (
            <section>
              <h2 className="section-title flex items-center gap-2">
                <Film size={18} style={{ color: 'var(--accent-primary)' }} />
                Video ({videos.length})
              </h2>
              <div className="space-y-2">
                {videos.map((r) => (
                  <Link
                    key={r.id}
                    href={`/video/${r.id}`}
                    className="flex items-center gap-4 px-4 py-3 rounded-xl transition-colors"
                    style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
                    id={`search-video-${r.id}`}
                  >
                    <Film size={16} style={{ color: 'var(--accent-primary)' }} />
                    <div>
                      <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{r.title}</p>
                      {r.subtitle && <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{r.subtitle}</p>}
                    </div>
                    {r.year && <span className="ml-auto text-xs" style={{ color: 'var(--text-muted)' }}>{r.year}</span>}
                  </Link>
                ))}
              </div>
            </section>
          )}

          {music.length > 0 && (
            <section>
              <h2 className="section-title flex items-center gap-2">
                <Music size={18} style={{ color: 'var(--accent-blue)' }} />
                Música ({music.length})
              </h2>
              <div className="space-y-2">
                {music.map((r) => (
                  <div
                    key={r.id}
                    className="flex items-center gap-4 px-4 py-3 rounded-xl cursor-pointer"
                    style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
                    id={`search-music-${r.id}`}
                  >
                    <Music size={16} style={{ color: 'var(--accent-blue)' }} />
                    <div>
                      <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{r.title}</p>
                      {r.subtitle && <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{r.subtitle}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {comics.length > 0 && (
            <section>
              <h2 className="section-title flex items-center gap-2">
                <BookOpen size={18} style={{ color: 'var(--accent-gold)' }} />
                Cómics ({comics.length})
              </h2>
              <div className="space-y-2">
                {comics.map((r) => (
                  <Link
                    key={r.id}
                    href={`/comics/${r.id}`}
                    className="flex items-center gap-4 px-4 py-3 rounded-xl"
                    style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
                    id={`search-comic-${r.id}`}
                  >
                    <BookOpen size={16} style={{ color: 'var(--accent-gold)' }} />
                    <div>
                      <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{r.title}</p>
                      {r.subtitle && <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{r.subtitle}</p>}
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  )
}
