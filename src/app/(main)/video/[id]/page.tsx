import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { notFound } from 'next/navigation'
import { Film, Clock, Globe, Play, Star } from 'lucide-react'
import Link from 'next/link'
import { formatDuration, getProgressPercent } from '@/lib/utils'
import { WatchlistButton } from '@/components/video/watchlist-button'

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const item = await prisma.mediaItem.findUnique({ where: { id }, select: { title: true } })
  if (!item) return { title: 'No encontrado — Aureon' }
  return { title: `${item.title} — Aureon` }
}

async function getMediaItem(id: string) {
  return prisma.mediaItem.findUnique({
    where: { id },
    include: {
      genres: { include: { genre: true } },
      cast: { orderBy: { order: 'asc' }, take: 12 },
      directors: true,
      studios: true,
      seasons: {
        include: {
          episodes: { orderBy: { number: 'asc' } },
        },
        orderBy: { number: 'asc' },
      },
    },
  })
}

async function getProgress(profileId: string, mediaId: string) {
  return prisma.playbackProgress.findFirst({
    where: { profileId, mediaItemId: mediaId },
  })
}

export default async function VideoDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const [item, session] = await Promise.all([
    getMediaItem(id),
    auth(),
  ])

  if (!item) notFound()

  // Get playback progress if logged in
  let progress = null
  if (session?.user?.id) {
    const profile = await prisma.profile.findFirst({ where: { userId: session.user.id } })
    if (profile) {
      progress = await getProgress(profile.id, id)
    }
  }

  const isSeries = item.type === 'SERIES' || item.type === 'ANIME'
  const progressPct = progress ? getProgressPercent(progress.position, progress.duration) : 0
  const resumeLabel = progress && !progress.completed
    ? `Continuar (${formatDuration(progress.position)})`
    : 'Reproducir'

  return (
    <div className="min-h-screen">
      {/* Backdrop hero */}
      <div className="relative" style={{ minHeight: '520px' }}>
        {/* Backdrop image */}
        <div
          className="absolute inset-0"
          style={{
            background: item.backdropUrl
              ? `url(${item.backdropUrl}) center/cover no-repeat`
              : 'linear-gradient(135deg, #0d0d1a 0%, #1a0d2e 50%, #0d1a1a 100%)',
          }}
        />
        {/* Gradient overlay */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(to right, rgba(9,9,15,0.97) 40%, transparent 75%), linear-gradient(to top, rgba(9,9,15,1) 0%, rgba(9,9,15,0.1) 40%)',
          }}
        />

        <div
          className="relative z-10 flex gap-8 px-8 pt-10"
          style={{ minHeight: '520px', alignItems: 'flex-end', paddingBottom: '2.5rem' }}
        >
          {/* Poster */}
          <div
            className="hidden md:flex shrink-0 w-44 aspect-[2/3] rounded-2xl overflow-hidden shadow-2xl items-center justify-center"
            style={{
              background: item.posterUrl
                ? `url(${item.posterUrl}) center/cover no-repeat`
                : 'var(--bg-elevated)',
              border: '1px solid var(--border)',
              boxShadow: '0 20px 60px rgba(0,0,0,0.7)',
            }}
          >
            {!item.posterUrl && <Film size={48} style={{ color: 'var(--text-muted)' }} />}
          </div>

          {/* Info */}
          <div className="flex-1 pb-1 max-w-2xl">
            {/* Genres */}
            <div className="flex flex-wrap gap-2 mb-3">
              {item.genres.map(({ genre }) => (
                <span key={genre.id} className="badge badge-progress">{genre.name}</span>
              ))}
              {item.quality && <span className="badge badge-new">{item.quality}</span>}
            </div>

            {/* Title */}
            <h1
              className="font-display font-bold mb-1 leading-tight"
              style={{ color: 'var(--text-primary)', fontSize: 'clamp(1.8rem, 4vw, 2.8rem)' }}
            >
              {item.title}
            </h1>
            {item.originalTitle && item.originalTitle !== item.title && (
              <p className="text-sm mb-3" style={{ color: 'var(--text-muted)' }}>
                {item.originalTitle}
              </p>
            )}

            {/* Meta */}
            <div
              className="flex flex-wrap items-center gap-4 mb-4 text-sm"
              style={{ color: 'var(--text-secondary)' }}
            >
              {item.year && <span className="font-medium">{item.year}</span>}
              {item.duration && (
                <span className="flex items-center gap-1">
                  <Clock size={13} />
                  {formatDuration(item.duration)}
                </span>
              )}
              {item.rating && (
                <span
                  className="px-2 py-0.5 rounded text-xs font-bold"
                  style={{
                    border: '1px solid var(--border)',
                    color: 'var(--text-secondary)',
                  }}
                >
                  {item.rating}
                </span>
              )}
              {item.language && (
                <span className="flex items-center gap-1">
                  <Globe size={13} />
                  {item.language.toUpperCase()}
                </span>
              )}
            </div>

            {/* Synopsis */}
            {item.synopsis && (
              <p
                className="text-sm leading-relaxed mb-6"
                style={{ color: 'var(--text-secondary)', maxWidth: '56ch' }}
              >
                {item.synopsis}
              </p>
            )}

            {/* Progress bar */}
            {progress && !progress.completed && (
              <div className="mb-4">
                <div className="flex justify-between text-xs mb-1.5" style={{ color: 'var(--text-muted)' }}>
                  <span>Viste {progressPct}%</span>
                  <span>{formatDuration(progress.duration - progress.position)} restante</span>
                </div>
                <div className="progress-bar" style={{ height: '3px' }}>
                  <div className="progress-bar-fill" style={{ width: `${progressPct}%` }} />
                </div>
              </div>
            )}

            {/* Action buttons */}
            <div className="flex flex-wrap gap-3">
              {item.filePath ? (
                <Link
                  href={`/video/watch/${item.id}`}
                  className="btn-primary"
                  id={`play-${item.id}`}
                >
                  <Play size={16} fill="currentColor" />
                  {resumeLabel}
                </Link>
              ) : (
                <button
                  disabled
                  className="btn-primary opacity-40 cursor-not-allowed"
                  id={`play-unavailable-${item.id}`}
                  title="Archivo no disponible — añade el video desde el admin"
                >
                  <Play size={16} />
                  Sin archivo
                </button>
              )}

              <WatchlistButton mediaId={item.id} />
            </div>

            {/* Director / Studio */}
            <div className="flex gap-6 mt-5">
              {item.directors.length > 0 && (
                <div>
                  <p className="text-xs mb-0.5" style={{ color: 'var(--text-muted)' }}>Director</p>
                  <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                    {item.directors.map((d) => d.name).join(', ')}
                  </p>
                </div>
              )}
              {item.studios.length > 0 && (
                <div>
                  <p className="text-xs mb-0.5" style={{ color: 'var(--text-muted)' }}>Estudio</p>
                  <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                    {item.studios.map((s) => s.name).join(', ')}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Details section */}
      <div className="px-8 py-8 space-y-10">
        {/* Cast */}
        {item.cast.length > 0 && (
          <section>
            <h2 className="section-title">Reparto</h2>
            <div className="carousel-scroll">
              {item.cast.map((person) => (
                <div key={person.id} className="shrink-0 w-[100px] text-center">
                  <div
                    className="w-[72px] h-[72px] rounded-full mx-auto mb-2 overflow-hidden flex items-center justify-center text-2xl"
                    style={{
                      background: person.photoUrl
                        ? `url(${person.photoUrl}) center/cover`
                        : 'var(--bg-elevated)',
                      border: '2px solid var(--border)',
                    }}
                  >
                    {!person.photoUrl && '🎭'}
                  </div>
                  <p className="text-xs font-medium truncate" style={{ color: 'var(--text-primary)' }}>
                    {person.name}
                  </p>
                  {person.character && (
                    <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>
                      {person.character}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Seasons & Episodes */}
        {isSeries && item.seasons.length > 0 && (
          <section>
            <h2 className="section-title">Temporadas y episodios</h2>
            <div className="space-y-3">
              {item.seasons.map((season) => (
                <details
                  key={season.id}
                  className="rounded-xl overflow-hidden"
                  style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
                  open={season.number === 1}
                >
                  <summary
                    className="flex items-center justify-between px-5 py-4 cursor-pointer list-none hover:bg-[var(--bg-elevated)] transition-colors"
                    id={`season-${season.id}`}
                  >
                    <div>
                      <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                        Temporada {season.number}
                        {season.title ? ` — ${season.title}` : ''}
                      </span>
                      <span className="text-xs ml-2" style={{ color: 'var(--text-muted)' }}>
                        {season.episodes.length} ep.
                      </span>
                    </div>
                    <span style={{ color: 'var(--text-muted)', fontSize: '10px' }}>▾</span>
                  </summary>

                  <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
                    {season.episodes.map((ep) => (
                      <div
                        key={ep.id}
                        className="flex items-center gap-4 px-5 py-3 group"
                        style={{ transition: 'background 0.15s' }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-elevated)')}
                        onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                      >
                        {/* Episode thumbnail */}
                        <div
                          className="shrink-0 w-24 h-14 rounded-lg overflow-hidden flex items-center justify-center"
                          style={{
                            background: ep.thumbnailUrl
                              ? `url(${ep.thumbnailUrl}) center/cover`
                              : 'var(--bg-elevated)',
                          }}
                        >
                          {!ep.thumbnailUrl && (
                            <span className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>
                              {season.number}x{String(ep.number).padStart(2, '0')}
                            </span>
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                            {ep.number}. {ep.title}
                          </p>
                          {ep.synopsis && (
                            <p
                              className="text-xs mt-0.5 line-clamp-2"
                              style={{ color: 'var(--text-muted)' }}
                            >
                              {ep.synopsis}
                            </p>
                          )}
                          {ep.duration && (
                            <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                              {formatDuration(ep.duration)}
                            </p>
                          )}
                        </div>

                        {ep.filePath ? (
                          <Link
                            href={`/video/watch/${ep.id}`}
                            className="btn-primary shrink-0 opacity-0 group-hover:opacity-100 transition-opacity py-2 px-3 text-xs"
                            id={`play-ep-${ep.id}`}
                          >
                            <Play size={13} fill="currentColor" />
                            Ver
                          </Link>
                        ) : (
                          <span className="text-xs shrink-0" style={{ color: 'var(--text-muted)' }}>
                            Sin archivo
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </details>
              ))}
            </div>
          </section>
        )}

        {/* Additional info box */}
        <section>
          <div
            className="rounded-xl p-5 grid grid-cols-2 md:grid-cols-4 gap-4"
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
          >
            {[
              { label: 'Año', value: item.year?.toString() },
              { label: 'País', value: item.country },
              { label: 'Idioma', value: item.language?.toUpperCase() },
              { label: 'Calidad', value: item.quality },
            ]
              .filter((i) => i.value)
              .map((info) => (
                <div key={info.label}>
                  <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>
                    {info.label}
                  </p>
                  <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                    {info.value}
                  </p>
                </div>
              ))}
          </div>
        </section>
      </div>
    </div>
  )
}
