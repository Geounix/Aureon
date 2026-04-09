import { prisma } from '@/lib/prisma'
import { Tv, Film } from 'lucide-react'
import Link from 'next/link'

export const metadata = { title: 'Series — Aureon' }

export default async function SeriesPage() {
  const series = await prisma.mediaItem.findMany({
    where: { type: { in: ['SERIES', 'ANIME'] } },
    orderBy: { addedAt: 'desc' },
    include: {
      genres: { include: { genre: true } },
      seasons: { select: { id: true, episodes: { select: { id: true } } } },
    },
  })

  return (
    <div className="px-8 py-8">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
          Series
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
          {series.length} serie{series.length !== 1 ? 's' : ''} en tu biblioteca
        </p>
      </div>

      {series.length === 0 ? (
        <div
          className="text-center py-20 rounded-2xl"
          style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
        >
          <Tv size={56} className="mx-auto mb-4" style={{ color: 'var(--text-muted)' }} />
          <h2
            className="font-display text-2xl font-semibold mb-2"
            style={{ color: 'var(--text-primary)' }}
          >
            Sin series aún
          </h2>
          <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>
            Añade una biblioteca de Series desde el panel de administración.
          </p>
          <Link href="/admin/libraries" className="btn-primary" id="series-goto-admin">
            Añadir biblioteca
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {series.map((item) => {
            const totalEps = item.seasons.reduce((acc, s) => acc + s.episodes.length, 0)
            return (
              <Link
                key={item.id}
                href={`/video/${item.id}`}
                className="media-card group"
                id={`series-card-${item.id}`}
              >
                <div
                  className="w-full aspect-[2/3] flex items-center justify-center overflow-hidden relative"
                  style={{
                    background: item.posterUrl
                      ? `url(${item.posterUrl}) center/cover no-repeat`
                      : 'linear-gradient(135deg, var(--bg-elevated), var(--bg-card))',
                  }}
                >
                  {!item.posterUrl && <Film size={32} style={{ color: 'var(--text-muted)' }} />}
                  {item.type === 'ANIME' && (
                    <span
                      className="absolute top-2 right-2 badge badge-new text-xs"
                    >
                      Anime
                    </span>
                  )}
                </div>
                <div className="p-3">
                  <p
                    className="text-sm font-medium truncate"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    {item.title}
                  </p>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                      {item.seasons.length} temp.
                    </span>
                    <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                      {totalEps} ep.
                    </span>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
