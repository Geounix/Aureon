import { prisma } from '@/lib/prisma'
import { Film, Filter } from 'lucide-react'
import Link from 'next/link'

export const metadata = { title: 'Películas y Series — Aureon' }

async function getVideos() {
  return prisma.mediaItem.findMany({
    where: { type: { in: ['MOVIE', 'SERIES', 'DOCUMENTARY', 'ANIME'] } },
    orderBy: { addedAt: 'desc' },
    include: {
      genres: { include: { genre: true } },
    },
  })
}

export default async function VideoPage() {
  const items = await getVideos()

  const movies = items.filter((i) => i.type === 'MOVIE' || i.type === 'DOCUMENTARY')
  const series = items.filter((i) => i.type === 'SERIES' || i.type === 'ANIME')

  return (
    <div className="px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
            Video
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
            {items.length} título{items.length !== 1 ? 's' : ''} en tu biblioteca
          </p>
        </div>
        <button className="btn-secondary flex items-center gap-2" id="video-filter-btn">
          <Filter size={16} />
          Filtrar
        </button>
      </div>

      {items.length === 0 ? (
        <div
          className="text-center py-20 rounded-2xl"
          style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
        >
          <Film size={56} className="mx-auto mb-4" style={{ color: 'var(--text-muted)' }} />
          <h2 className="font-display text-2xl font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
            Sin películas ni series
          </h2>
          <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>
            Añade una biblioteca de video desde el panel de administración.
          </p>
          <Link href="/admin/libraries" className="btn-primary" id="video-goto-admin">
            Añadir biblioteca
          </Link>
        </div>
      ) : (
        <div className="space-y-10">
          {movies.length > 0 && (
            <section>
              <h2 className="section-title">Películas ({movies.length})</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {movies.map((movie) => (
                  <Link key={movie.id} href={`/video/${movie.id}`} className="media-card group">
                    <div
                      className="w-full aspect-[2/3] flex items-center justify-center overflow-hidden"
                      style={{
                        background: movie.posterUrl
                          ? `url(${movie.posterUrl}) center/cover no-repeat`
                          : 'linear-gradient(135deg, var(--bg-elevated), var(--bg-card))',
                      }}
                    >
                      {!movie.posterUrl && <Film size={32} style={{ color: 'var(--text-muted)' }} />}
                    </div>
                    <div className="p-3">
                      <p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>
                        {movie.title}
                      </p>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{movie.year}</span>
                        {movie.rating && (
                          <span className="badge badge-progress text-xs">{movie.rating}</span>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {series.length > 0 && (
            <section>
              <h2 className="section-title">Series y Anime ({series.length})</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {series.map((s) => (
                  <Link key={s.id} href={`/video/${s.id}`} className="media-card group">
                    <div
                      className="w-full aspect-[2/3] flex items-center justify-center overflow-hidden"
                      style={{
                        background: s.posterUrl
                          ? `url(${s.posterUrl}) center/cover no-repeat`
                          : 'linear-gradient(135deg, var(--bg-elevated), var(--bg-card))',
                      }}
                    >
                      {!s.posterUrl && <Film size={32} style={{ color: 'var(--text-muted)' }} />}
                    </div>
                    <div className="p-3">
                      <p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>
                        {s.title}
                      </p>
                      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{s.year}</p>
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
