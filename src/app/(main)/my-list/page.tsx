import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Heart, Film } from 'lucide-react'

export const metadata = { title: 'Mi Lista — Aureon' }

export default async function MyListPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  const profile = await prisma.profile.findFirst({
    where: { userId: session.user.id },
  })

  const watchlist = profile
    ? await prisma.watchlist.findMany({
        where: { profileId: profile.id },
        include: {
          mediaItem: {
            include: { genres: { include: { genre: true } } },
          },
        },
        orderBy: { addedAt: 'desc' },
      })
    : []

  return (
    <div className="px-8 py-8">
      <div className="mb-8">
        <h1
          className="font-display text-3xl font-bold flex items-center gap-3"
          style={{ color: 'var(--text-primary)' }}
        >
          <Heart size={28} style={{ color: 'var(--accent-rose)' }} />
          Mi Lista
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
          {watchlist.length} título{watchlist.length !== 1 ? 's' : ''} guardado{watchlist.length !== 1 ? 's' : ''}
        </p>
      </div>

      {watchlist.length === 0 ? (
        <div
          className="text-center py-20 rounded-2xl"
          style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
        >
          <Heart size={56} className="mx-auto mb-4" style={{ color: 'var(--text-muted)' }} />
          <h2
            className="font-display text-2xl font-semibold mb-2"
            style={{ color: 'var(--text-primary)' }}
          >
            Tu lista está vacía
          </h2>
          <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>
            Añade películas y series desde su página de detalle usando el botón "Mi lista".
          </p>
          <Link href="/video" className="btn-primary" id="my-list-browse-btn">
            <Film size={16} />
            Explorar video
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {watchlist.map(({ mediaItem, addedAt }) => (
            <Link
              key={mediaItem.id}
              href={`/video/${mediaItem.id}`}
              className="media-card group"
              id={`my-list-item-${mediaItem.id}`}
            >
              <div
                className="w-full aspect-[2/3] flex items-center justify-center overflow-hidden"
                style={{
                  background: mediaItem.posterUrl
                    ? `url(${mediaItem.posterUrl}) center/cover no-repeat`
                    : 'linear-gradient(135deg, var(--bg-elevated), var(--bg-card))',
                }}
              >
                {!mediaItem.posterUrl && (
                  <Film size={32} style={{ color: 'var(--text-muted)' }} />
                )}
              </div>
              <div className="p-3">
                <p
                  className="text-sm font-medium truncate"
                  style={{ color: 'var(--text-primary)' }}
                >
                  {mediaItem.title}
                </p>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    {mediaItem.year}
                  </span>
                  <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    {new Date(addedAt).toLocaleDateString('es', { day: 'numeric', month: 'short' })}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
