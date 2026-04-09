import { prisma } from '@/lib/prisma'
import { Music, Mic2, Disc3 } from 'lucide-react'
import Link from 'next/link'

export const metadata = { title: 'Música — Aureon' }

export default async function MusicPage() {
  const [artists, albums] = await Promise.all([
    prisma.artist.findMany({
      orderBy: { name: 'asc' },
      take: 24,
    }),
    prisma.album.findMany({
      orderBy: { addedAt: 'desc' },
      include: { artist: true },
      take: 24,
    }),
  ])

  return (
    <div className="px-8 py-8 space-y-12">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold flex items-center gap-3" style={{ color: 'var(--text-primary)' }}>
          <Music size={28} style={{ color: 'var(--accent-gold)' }} />
          Librería Musical
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
          Tus artistas, álbumes y canciones
        </p>
      </div>

      {artists.length === 0 && albums.length === 0 ? (
        <div className="text-center py-20 rounded-2xl" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
          <Music size={56} className="mx-auto mb-4" style={{ color: 'var(--text-muted)' }} />
          <h2 className="font-display text-2xl font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>Sin música</h2>
          <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>
            Añade una biblioteca de Música desde el panel de administración.
          </p>
          <Link href="/admin/libraries" className="btn-primary" id="music-goto-admin">
            Añadir biblioteca
          </Link>
        </div>
      ) : (
        <>
          {/* Álbumes */}
          {albums.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-4">
                <Disc3 size={20} style={{ color: 'var(--accent-gold)' }} />
                <h2 className="section-title !mb-0">Álbumes añadidos recientemente</h2>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {albums.map((album) => (
                  <Link
                    key={album.id}
                    href={`/music/album/${album.id}`}
                    className="media-card group p-3"
                    id={`album-card-${album.id}`}
                  >
                    <div
                      className="w-full aspect-square rounded-lg flex items-center justify-center overflow-hidden relative mb-3 shadow-md"
                      style={{
                        background: album.coverUrl
                          ? `url(${album.coverUrl}) center/cover no-repeat`
                          : 'linear-gradient(135deg, var(--bg-hover), var(--bg-card))',
                      }}
                    >
                      {!album.coverUrl && <Disc3 size={32} style={{ color: 'var(--text-muted)' }} />}
                    </div>
                    <div>
                      <p className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>
                        {album.title}
                      </p>
                      <p className="text-xs truncate mt-0.5" style={{ color: 'var(--text-muted)' }}>
                        {album.artist.name}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Artistas */}
          {artists.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-4">
                <Mic2 size={20} style={{ color: 'var(--accent-primary)' }} />
                <h2 className="section-title !mb-0">Artistas populares</h2>
              </div>
              <div className="carousel-scroll">
                {artists.map((artist) => (
                  <Link
                    key={artist.id}
                    href={`/music/artist/${artist.id}`}
                    className="shrink-0 w-[140px] text-center group"
                    id={`artist-item-${artist.id}`}
                  >
                    <div
                      className="w-[120px] h-[120px] rounded-full mx-auto mb-3 overflow-hidden flex items-center justify-center text-3xl shadow-md transition-transform group-hover:scale-105"
                      style={{
                        background: artist.imageUrl
                          ? `url(${artist.imageUrl}) center/cover`
                          : 'var(--bg-elevated)',
                        border: '2px solid var(--border)',
                      }}
                    >
                      {!artist.imageUrl && <Mic2 size={40} style={{ color: 'var(--text-muted)' }} />}
                    </div>
                    <p className="text-sm font-medium truncate group-hover:text-[var(--accent-primary)] transition-colors" style={{ color: 'var(--text-primary)' }}>
                      {artist.name}
                    </p>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  )
}
