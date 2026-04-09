import { prisma } from '@/lib/prisma'
import { Sidebar } from '@/components/layout/sidebar'
import {
  Film, Music, BookOpen, Users, HardDrive,
  Activity, Library, TrendingUp, Cpu
} from 'lucide-react'
import Link from 'next/link'

export const metadata = { title: 'Administración — Aureon' }

async function getAdminStats() {
  const [
    userCount,
    movieCount,
    musicCount,
    comicCount,
    libraryCount,
    profileCount,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.mediaItem.count(),
    prisma.musicTrack.count(),
    prisma.comicSeries.count(),
    prisma.library.count(),
    prisma.profile.count(),
  ])

  const libraries = await prisma.library.findMany({
    include: {
      _count: {
        select: { mediaItems: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  return { userCount, movieCount, musicCount, comicCount, libraryCount, profileCount, libraries }
}

export default async function AdminPage() {
  const { userCount, movieCount, musicCount, comicCount, libraryCount, profileCount, libraries } =
    await getAdminStats()

  const stats = [
    { icon: Film, label: 'Contenido video', value: movieCount, color: 'var(--accent-primary)', href: '/video' },
    { icon: Music, label: 'Pistas de música', value: musicCount, color: 'var(--accent-blue)', href: '/music' },
    { icon: BookOpen, label: 'Series cómic', value: comicCount, color: 'var(--accent-gold)', href: '/comics' },
    { icon: Users, label: 'Usuarios', value: userCount, color: 'var(--accent-rose)', href: '/admin/users' },
    { icon: Library, label: 'Bibliotecas', value: libraryCount, color: 'var(--accent-emerald)', href: '/admin/libraries' },
    { icon: Users, label: 'Perfiles', value: profileCount, color: 'var(--accent-primary)', href: '/admin/users' },
  ]

  return (
    <div className="page-with-sidebar">
      <Sidebar />
      <main className="main-content px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
            Panel de Administración
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
            Gestiona tu servidor multimedia Aureon
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-10">
          {stats.map((stat) => (
            <Link key={stat.label} href={stat.href} className="stat-card group">
              <div className="flex items-center gap-4">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: stat.color + '20' }}
                >
                  <stat.icon size={20} style={{ color: stat.color }} />
                </div>
                <div>
                  <p
                    className="text-2xl font-bold font-display"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    {stat.value}
                  </p>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    {stat.label}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 gap-6 mb-10">
          <div
            className="rounded-xl p-6"
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
          >
            <h2 className="font-display text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
              Acciones rápidas
            </h2>
            <div className="space-y-2">
              {[
                { label: 'Gestionar bibliotecas', href: '/admin/libraries', icon: Library },
                { label: 'Gestionar usuarios', href: '/admin/users', icon: Users },
                { label: 'Logs del Sistema', href: '/admin/logs', icon: Cpu },
              ].map((action) => (
                <Link
                  key={action.href}
                  href={action.href}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl transition-colors"
                  style={{
                    background: 'var(--bg-elevated)',
                    color: 'var(--text-primary)',
                  }}
                  id={`admin-action-${action.label.replace(/\s/g, '-').toLowerCase()}`}
                >
                  <action.icon size={16} style={{ color: 'var(--accent-primary)' }} />
                  <span className="text-sm font-medium">{action.label}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Libraries */}
          <div
            className="rounded-xl p-6"
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
                Bibliotecas
              </h2>
              <Link
                href="/admin/libraries"
                className="text-xs"
                style={{ color: 'var(--accent-primary)' }}
                id="admin-view-all-libraries"
              >
                Ver todas
              </Link>
            </div>
            <div className="space-y-3">
              {libraries.length === 0 ? (
                <p className="text-sm py-4 text-center" style={{ color: 'var(--text-muted)' }}>
                  No hay bibliotecas configuradas
                </p>
              ) : (
                libraries.slice(0, 4).map((lib) => (
                  <div key={lib.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{
                          background:
                            lib.type === 'MOVIE' ? 'var(--accent-primary)'
                            : lib.type === 'SERIES' ? 'var(--accent-blue)'
                            : lib.type === 'MUSIC' ? 'var(--accent-gold)'
                            : 'var(--accent-emerald)',
                        }}
                      />
                      <span className="text-sm" style={{ color: 'var(--text-primary)' }}>{lib.name}</span>
                    </div>
                    <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                      {lib._count.mediaItems} items
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* System info */}
        <div
          className="rounded-xl p-6"
          style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
        >
          <h2 className="font-display text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
            Información del sistema
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            {[
              { label: 'Base de datos', value: 'PostgreSQL' },
              { label: 'ORM', value: 'Prisma v7' },
              { label: 'Framework', value: 'Next.js 16' },
              { label: 'Versión', value: 'Aureon v0.1.0' },
            ].map((info) => (
              <div key={info.label}>
                <p style={{ color: 'var(--text-muted)' }}>{info.label}</p>
                <p className="font-medium" style={{ color: 'var(--text-primary)' }}>{info.value}</p>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
