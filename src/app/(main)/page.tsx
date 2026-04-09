import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { Film, Music, BookOpen, TrendingUp, Clock, Star, PlayCircle } from 'lucide-react'
import Link from 'next/link'

async function getHomeData(userId: string | undefined) {
  const [movies, tracks, comics] = await Promise.all([
    prisma.mediaItem.findMany({
      where: { type: { in: ['MOVIE', 'DOCUMENTARY', 'ANIME'] } },
      take: 10,
      orderBy: { addedAt: 'desc' },
      include: { genres: { include: { genre: true } } },
    }),
    prisma.musicTrack.findMany({
      take: 8,
      orderBy: { addedAt: 'desc' },
      include: { album: { include: { artist: true } } },
    }),
    prisma.comicSeries.findMany({
      take: 8,
      orderBy: { addedAt: 'desc' },
    })
  ])

  let continueWatching: any[] = []
  if (userId) {
    const profile = await prisma.profile.findFirst({ where: { userId } })
    if (profile) {
      const dbProgress = await prisma.playbackProgress.findMany({
        where: { profileId: profile.id, position: { gt: 10 } },
        orderBy: { updatedAt: 'desc' },
        take: 6,
        include: { mediaItem: true }
      })
      continueWatching = dbProgress
    }
  }

  return { movies, tracks, comics, continueWatching }
}

export default async function HomePage() {
  const session = await auth()
  const { movies, tracks, comics, continueWatching } = await getHomeData(session?.user?.id)

  const heroItem = movies.length > 0 ? movies[0] : null

  return (
    <div className="min-h-screen">
      {/* Hero */}
      {heroItem ? (
        <section className="hero-section" style={{ minHeight: '600px' }}>
          <div
            className="absolute inset-0"
            style={{
              background: heroItem.backdropUrl
                ? `url(${heroItem.backdropUrl}) center/cover no-repeat`
                : 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-primary)] via-[var(--bg-primary)]/40 to-transparent" />
          
          <div className="hero-content relative z-10">
            <div className="max-w-3xl">
              <span className="badge badge-new mb-4 px-3 py-1">Estreno Destacado</span>
              <h1
                className="font-display text-5xl md:text-7xl font-bold mb-4 leading-none"
                style={{ color: 'var(--text-primary)', textShadow: '0 4px 24px rgba(0,0,0,0.5)' }}
              >
                {heroItem.title}
              </h1>
              {heroItem.synopsis && (
                <p
                  className="text-base md:text-lg leading-relaxed mb-8 line-clamp-3 font-medium"
                  style={{ color: 'var(--text-secondary)', textShadow: '0 2px 10px rgba(0,0,0,0.8)' }}
                >
                  {heroItem.synopsis}
                </p>
              )}
              <div className="flex gap-4">
                <Link href={`/video/watch/${heroItem.id}`} className="btn-primary px-8 py-3 text-lg" id="hero-play-btn">
                  <PlayCircle size={20} />
                  Reproducir
                </Link>
                <Link href={`/video/${heroItem.id}`} className="btn-secondary px-8 py-3 text-lg glass" id="hero-detail-btn">
                  Más info
                </Link>
              </div>
            </div>
          </div>
        </section>
      ) : (
        <section className="flex flex-col items-center justify-center py-32 text-center" style={{ minHeight: '500px' }}>
          <div className="text-6xl mb-6">🎬</div>
          <h1 className="font-display text-4xl font-bold mb-3" style={{ color: 'var(--text-primary)' }}>
            Bienvenido a Aureon
          </h1>
          <p className="text-base mb-8 max-w-lg mx-auto" style={{ color: 'var(--text-secondary)' }}>
            Tu biblioteca multimedia unificada. Configura carpetas en el panel de control para empezar la magia.
          </p>
          <Link href="/admin/libraries" className="btn-primary px-6" id="home-add-library-btn">
            Inicializar Plataforma
          </Link>
        </section>
      )}

      {/* Content sections */}
      <div className="px-8 py-8 space-y-12 relative z-20 -mt-12">

        {/* Stats overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: Film, label: 'Películas', count: movies.length, href: '/video', color: 'var(--accent-primary)' },
            { icon: Music, label: 'Música', count: tracks.length, href: '/music', color: 'var(--accent-blue)' },
            { icon: BookOpen, label: 'Cómics', count: comics.length, href: '/comics', color: 'var(--accent-emerald)' },
            { icon: Star, label: 'Colecciones', count: 0, href: '/collections', color: 'var(--accent-gold)' },
          ].map((stat) => (
            <Link key={stat.href} href={stat.href} className="stat-card group bg-black/40 backdrop-blur-md border-[var(--border)] relative overflow-hidden">
              <div className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity" style={{ background: stat.color }} />
              <div className="flex items-center gap-3 relative z-10">
                <stat.icon size={24} style={{ color: stat.color }} />
                <div>
                  <p className="text-3xl font-bold font-display" style={{ color: 'var(--text-primary)' }}>
                    {stat.count}
                  </p>
                  <p className="text-xs uppercase tracking-wider font-semibold" style={{ color: 'var(--text-muted)' }}>{stat.label}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Continue Watching */}
        {continueWatching.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="section-title flex items-center gap-2">
                <Clock size={20} style={{ color: 'var(--accent-gold)' }} />
                Continuar Viendo
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {continueWatching.map((prog) => {
                const percent = Math.min(100, (prog.position / (prog.mediaItem.duration || 1)) * 100)
                return (
                  <Link key={prog.id} href={`/video/watch/${prog.mediaItem.id}`} className="media-card group p-3 block" id={`continue-${prog.id}`}>
                    <div className="relative aspect-video rounded-md overflow-hidden mb-3">
                      <div className="absolute inset-0" style={{ background: prog.mediaItem.backdropUrl ? `url(${prog.mediaItem.backdropUrl}) center/cover` : 'var(--bg-elevated)' }} />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <PlayCircle size={40} className="text-white" />
                      </div>
                      <div className="absolute bottom-0 inset-x-0 h-1 bg-black/60">
                        <div className="h-full bg-[var(--accent-primary)]" style={{ width: `${percent}%` }} />
                      </div>
                    </div>
                    <p className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>{prog.mediaItem.title}</p>
                    <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Quedan {Math.floor(((prog.mediaItem.duration || 0) - prog.position) / 60)} min</p>
                  </Link>
                )
              })}
            </div>
          </section>
        )}

        {/* Recent Movies */}
        {movies.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="section-title flex items-center gap-2">
                <TrendingUp size={20} style={{ color: 'var(--accent-primary)' }} />
                Películas Recién Añadidas
              </h2>
              <Link href="/video" className="text-sm font-medium hover:underline" style={{ color: 'var(--accent-primary)' }}>
                Ver todo
              </Link>
            </div>
            <div className="carousel-scroll pb-4">
              {movies.map((movie) => (
                <Link key={movie.id} href={`/video/${movie.id}`} className="media-card shrink-0 w-48 group">
                  <div
                    className="w-full aspect-[2/3] flex items-center justify-center relative overflow-hidden"
                    style={{
                      background: movie.posterUrl
                        ? `url(${movie.posterUrl}) center/cover`
                        : 'linear-gradient(135deg, var(--bg-elevated), var(--bg-card))',
                    }}
                  >
                    {!movie.posterUrl && <Film size={36} style={{ color: 'var(--text-muted)' }} />}
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Comics */}
        {comics.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="section-title flex items-center gap-2">
                <BookOpen size={20} style={{ color: 'var(--accent-emerald)' }} />
                Últimos Cómics
              </h2>
              <Link href="/comics" className="text-sm font-medium hover:underline" style={{ color: 'var(--accent-primary)' }}>
                Ver todo
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5">
              {comics.slice(0, 6).map((comic) => (
                <Link key={comic.id} href={`/comics/${comic.id}`} className="media-card shrink-0 group">
                  <div
                    className="w-full aspect-[2/3] flex items-center justify-center"
                    style={{ background: comic.coverUrl ? `url(${comic.coverUrl}) center/cover` : 'var(--bg-elevated)' }}
                  >
                    {!comic.coverUrl && <BookOpen size={32} style={{ color: 'var(--text-muted)' }} />}
                  </div>
                  <div className="p-3">
                    <p className="text-sm font-bold truncate text-[var(--text-primary)]">
                      {comic.title}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
