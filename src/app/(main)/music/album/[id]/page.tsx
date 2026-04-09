import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { Disc3, ArrowLeft, Mic2, Calendar } from 'lucide-react'
import { PlayAlbumButton } from '@/components/music/play-album-button'
import { TrackRow } from '@/components/music/track-row'

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const album = await prisma.album.findUnique({ where: { id }, select: { title: true, artist: { select: { name: true } } } })
  if (!album) return { title: 'Álbum no encontrado — Aureon' }
  return { title: `${album.title} — ${album.artist.name} — Aureon` }
}

export default async function AlbumPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const album = await prisma.album.findUnique({
    where: { id },
    include: {
      artist: true,
      tracks: { orderBy: { title: 'asc' } },
    },
  })

  if (!album) notFound()

  const totalDuration = album.tracks.reduce((acc, t) => acc + (t.duration || 0), 0)

  // Map tracks for client
  const mappedTracks = album.tracks.map((t) => ({
    id: t.id,
    title: t.title,
    artist: album.artist.name,
    coverUrl: album.coverUrl || undefined,
    filePath: t.filePath,
    duration: t.duration || undefined,
  }))

  return (
    <div className="min-h-screen pb-24">
      {/* Hero */}
      <div className="relative overflow-hidden pt-24 px-8 pb-10" style={{ background: 'var(--bg-elevated)' }}>
        {album.coverUrl && (
          <div
            className="absolute inset-0 opacity-20 blur-3xl"
            style={{ background: `url(${album.coverUrl}) center/cover` }}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-primary)] to-transparent" />
        
        <Link href="/music" className="absolute top-8 left-8 btn-icon bg-[var(--bg-elevated)] z-10" id="album-back-btn">
          <ArrowLeft size={16} />
        </Link>
        
        <div className="relative z-10 flex gap-8 items-end max-w-6xl mx-auto">
          {/* Cover */}
          <div
            className="w-56 h-56 shrink-0 rounded-xl overflow-hidden shadow-2xl flex items-center justify-center bg-[var(--bg-card)]"
            style={{ border: '1px solid var(--border)' }}
          >
            {album.coverUrl ? (
              <Image src={album.coverUrl} alt={album.title} width={224} height={224} className="w-full h-full object-cover" />
            ) : (
              <Disc3 size={64} style={{ color: 'var(--text-muted)' }} />
            )}
          </div>
          
          {/* Info */}
          <div className="flex-1 pb-2">
            <span className="text-xs font-semibold uppercase tracking-widest text-[var(--text-secondary)] mb-2 block">
              Álbum
            </span>
            <h1 className="font-display font-bold mb-4 leading-tight" style={{ fontSize: 'clamp(2rem, 5vw, 4rem)', color: 'var(--text-primary)' }}>
              {album.title}
            </h1>
            
            <div className="flex items-center gap-4 text-sm font-medium">
              <Link
                href={`/music/artist/${album.artistId}`}
                className="flex items-center gap-2 hover:underline decoration-[var(--accent-primary)] hover:text-[var(--accent-primary)] transition-colors"
                style={{ color: 'var(--text-primary)' }}
              >
                {album.artist.imageUrl ? (
                  <Image src={album.artist.imageUrl} alt={album.artist.name} width={24} height={24} className="rounded-full w-6 h-6 object-cover" />
                ) : (
                  <Mic2 size={16} style={{ color: 'var(--text-muted)' }} />
                )}
                {album.artist.name}
              </Link>
              
              <span style={{ color: 'var(--text-muted)' }}>•</span>
              
              <span className="flex items-center gap-1.5" style={{ color: 'var(--text-secondary)' }}>
                <Calendar size={14} />
                {album.year || 'Desconocido'}
              </span>
              
              <span style={{ color: 'var(--text-muted)' }}>•</span>
              
              <span style={{ color: 'var(--text-secondary)' }}>
                {album.tracks.length} canciones
              </span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Content */}
      <div className="px-8 max-w-6xl mx-auto -mt-6 relative z-20">
        <div className="mb-8">
          <PlayAlbumButton
            tracks={album.tracks}
            albumName={album.title}
            coverUrl={album.coverUrl}
            artistName={album.artist.name}
          />
        </div>
        
        {/* Tracks List */}
        <div className="flex flex-col gap-1 w-full max-w-4xl">
          {mappedTracks.map((track, i) => (
            <TrackRow
              key={track.id}
              track={track}
              index={i}
              allTracks={mappedTracks}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
