import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { Mic2, ArrowLeft, Disc3 } from 'lucide-react'

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const artist = await prisma.artist.findUnique({ where: { id }, select: { name: true } })
  if (!artist) return { title: 'Artista no encontrado — Aureon' }
  return { title: `${artist.name} — Aureon` }
}

export default async function ArtistPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const artist = await prisma.artist.findUnique({
    where: { id },
    include: {
      albums: {
        orderBy: { year: 'desc' },
      },
    },
  })

  if (!artist) notFound()

  return (
    <div className="min-h-screen pb-24">
      {/* Hero */}
      <div className="relative overflow-hidden pt-24 px-8 pb-10" style={{ background: 'var(--bg-card)' }}>
        {artist.imageUrl && (
          <div
            className="absolute inset-0 opacity-10 blur-3xl"
            style={{ background: `url(${artist.imageUrl}) center/cover` }}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-primary)] to-transparent" />
        
        <Link href="/music" className="absolute top-8 left-8 btn-icon bg-[var(--bg-elevated)] z-10" id="artist-back-btn">
          <ArrowLeft size={16} />
        </Link>
        
        <div className="relative z-10 flex flex-col md:flex-row gap-8 items-center md:items-end max-w-6xl mx-auto">
          {/* Avatar */}
          <div
            className="w-48 h-48 md:w-56 md:h-56 shrink-0 rounded-full overflow-hidden shadow-2xl flex items-center justify-center bg-[var(--bg-elevated)]"
            style={{ border: '4px solid var(--border)' }}
          >
            {artist.imageUrl ? (
              <Image src={artist.imageUrl} alt={artist.name} width={224} height={224} className="w-full h-full object-cover" />
            ) : (
              <Mic2 size={64} style={{ color: 'var(--text-muted)' }} />
            )}
          </div>
          
          {/* Info */}
          <div className="flex-1 pb-2 text-center md:text-left">
            <span className="text-xs font-semibold uppercase tracking-widest text-[var(--text-secondary)] mb-2 block">
              Artista
            </span>
            <h1 className="font-display font-bold mb-4 leading-tight" style={{ fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', color: 'var(--text-primary)' }}>
              {artist.name}
            </h1>
          </div>
        </div>
      </div>
      
      {/* Content */}
      <div className="px-8 max-w-6xl mx-auto mt-12 relative z-20">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold font-display" style={{ color: 'var(--text-primary)' }}>
            Discografía
          </h2>
          <span className="text-sm" style={{ color: 'var(--text-muted)' }}>
            {artist.albums.length} álbum{artist.albums.length !== 1 && 'es'}
          </span>
        </div>
        
        {artist.albums.length === 0 ? (
          <div className="text-center py-20 rounded-2xl" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
            <Disc3 size={48} className="mx-auto mb-4" style={{ color: 'var(--text-muted)' }} />
            <p style={{ color: 'var(--text-secondary)' }}>Este artista no tiene álbumes registrados.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {artist.albums.map((album) => (
              <Link
                key={album.id}
                href={`/music/album/${album.id}`}
                className="media-card group p-3"
                id={`artist-album-${album.id}`}
              >
                <div
                  className="w-full aspect-square rounded-lg flex items-center justify-center overflow-hidden relative mb-3 shadow-md transition-transform group-hover:scale-[1.02]"
                  style={{
                    background: album.coverUrl
                      ? `url(${album.coverUrl}) center/cover no-repeat`
                      : 'linear-gradient(135deg, var(--bg-hover), var(--bg-card))',
                  }}
                >
                  {!album.coverUrl && <Disc3 size={32} style={{ color: 'var(--text-muted)' }} />}
                  
                  {/* Play Overlay */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="w-12 h-12 rounded-full bg-[var(--accent-primary)] flex items-center justify-center translate-y-2 group-hover:translate-y-0 transition-all text-white shadow-lg shadow-[var(--accent-glow)]">
                      <Disc3 size={20} />
                    </div>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>
                    {album.title}
                  </p>
                  <p className="text-xs truncate mt-0.5" style={{ color: 'var(--text-muted)' }}>
                    {album.year || 'Álbum'}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
