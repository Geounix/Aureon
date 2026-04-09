import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ListMusic, Plus, Music2 } from 'lucide-react'

export const metadata = { title: 'Playlists — Aureon' }

export default async function PlaylistsPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  const profile = await prisma.profile.findFirst({
    where: { userId: session.user.id },
  })

  if (!profile) redirect('/login')

  const playlists = await prisma.playlist.findMany({
    where: { profileId: profile.id },
    include: { tracks: true },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div className="px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl font-bold flex items-center gap-3" style={{ color: 'var(--text-primary)' }}>
            <ListMusic size={28} style={{ color: 'var(--accent-primary)' }} />
            Tus Playlists
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
            {playlists.length} playlist{playlists.length !== 1 ? 's' : ''} creadas
          </p>
        </div>
        <button className="btn-primary" disabled title="Próximamente">
          <Plus size={16} />
          Nueva Playlist
        </button>
      </div>

      {playlists.length === 0 ? (
        <div className="text-center py-20 rounded-2xl" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
          <ListMusic size={56} className="mx-auto mb-4" style={{ color: 'var(--text-muted)' }} />
          <h2 className="font-display text-2xl font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>Sin playlists</h2>
          <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>
            Aún no has creado ninguna playlist para agrupar tu música favorita.
          </p>
          <button className="btn-primary" disabled>
            <Plus size={16} />
            Crear mi primera playlist
          </button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {playlists.map((playlist) => (
            <div
              key={playlist.id}
              className="rounded-xl p-5"
              style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
            >
              <div className="flex items-center gap-4 mb-4">
                <div
                  className="w-16 h-16 rounded-lg bg-[var(--bg-elevated)] flex items-center justify-center shrink-0 shadow-md"
                >
                  <Music2 size={24} style={{ color: 'var(--text-muted)' }} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-[var(--text-primary)] truncate text-lg">
                    {playlist.name}
                  </h3>
                  <p className="text-sm text-[var(--text-muted)]">
                    {playlist.tracks.length} canciones
                  </p>
                </div>
              </div>
              <p className="text-xs text-[var(--text-secondary)] line-clamp-2">
                {playlist.description || 'Sin descripción'}
              </p>
              <div className="mt-4 flex gap-2">
                <button className="btn-primary flex-1 py-2 text-xs opacity-50 cursor-not-allowed">
                  Reproducir
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
