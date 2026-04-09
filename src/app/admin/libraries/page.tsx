import { prisma } from '@/lib/prisma'
import { Sidebar } from '@/components/layout/sidebar'
import { Library, Plus, FolderOpen, Film, Music, BookOpen, Tv } from 'lucide-react'
import Link from 'next/link'
import { ScanButton } from '@/components/admin/scan-button'

export const metadata = { title: 'Bibliotecas — Admin — Aureon' }

const typeIcons = { MOVIE: Film, SERIES: Tv, MUSIC: Music, COMICS: BookOpen }
const typeColors = {
  MOVIE: 'var(--accent-primary)',
  SERIES: 'var(--accent-blue)',
  MUSIC: 'var(--accent-gold)',
  COMICS: 'var(--accent-emerald)',
}
const typeLabels = { MOVIE: 'Películas', SERIES: 'Series', MUSIC: 'Música', COMICS: 'Cómics' }

async function getLibraries() {
  return prisma.library.findMany({
    include: { _count: { select: { mediaItems: true } } },
    orderBy: { createdAt: 'asc' },
  })
}

export default async function LibrariesPage() {
  const libraries = await getLibraries()

  return (
    <div className="page-with-sidebar">
      <Sidebar />
      <main className="main-content px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
              Bibliotecas
            </h1>
            <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
              Gestiona tus fuentes de contenido multimedia
            </p>
          </div>
          <Link href="/admin/libraries/new" className="btn-primary" id="admin-new-library-btn">
            <Plus size={16} />
            Nueva biblioteca
          </Link>
        </div>

        {libraries.length === 0 ? (
          <div
            className="text-center py-20 rounded-2xl"
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
          >
            <Library size={56} className="mx-auto mb-4" style={{ color: 'var(--text-muted)' }} />
            <h2 className="font-display text-2xl font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
              Sin bibliotecas
            </h2>
            <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>
              Añade tu primera biblioteca para importar contenido multimedia.
            </p>
            <Link href="/admin/libraries/new" className="btn-primary" id="admin-create-first-lib">
              <Plus size={16} />
              Crear biblioteca
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
            {libraries.map((lib) => {
              const Icon = typeIcons[lib.type] || Library
              const color = typeColors[lib.type] || 'var(--accent-primary)'
              const label = typeLabels[lib.type] || lib.type

              return (
                <div
                  key={lib.id}
                  className="rounded-xl p-5 flex flex-col gap-4"
                  style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
                >
                  {/* Header */}
                  <div className="flex items-center gap-3">
                    <div
                      className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                      style={{ background: color + '18' }}
                    >
                      <Icon size={22} style={{ color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3
                        className="font-semibold truncate"
                        style={{ color: 'var(--text-primary)' }}
                      >
                        {lib.name}
                      </h3>
                      <span className="badge badge-progress text-xs">{label}</span>
                    </div>
                  </div>

                  {/* Path */}
                  <div
                    className="flex items-center gap-2 text-xs px-3 py-2 rounded-lg"
                    style={{ background: 'var(--bg-elevated)', color: 'var(--text-muted)' }}
                  >
                    <FolderOpen size={12} className="shrink-0" />
                    <span className="truncate">{lib.path}</span>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center justify-between text-sm">
                    <span style={{ color: 'var(--text-secondary)' }}>
                      <span
                        className="text-xl font-bold font-display"
                        style={{ color: 'var(--text-primary)' }}
                      >
                        {lib._count.mediaItems}
                      </span>
                      {' '}elemento{lib._count.mediaItems !== 1 ? 's' : ''}
                    </span>
                    {lib.lastScanned && (
                      <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                        {new Date(lib.lastScanned).toLocaleDateString('es', {
                          day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
                        })}
                      </span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 items-start">
                    <div className="flex-1">
                      <ScanButton libraryId={lib.id} libraryName={lib.name} />
                    </div>
                    <Link
                      href={`/admin/libraries/${lib.id}/edit`}
                      className="btn-secondary text-xs py-2 px-3 shrink-0"
                      id={`edit-lib-${lib.id}`}
                    >
                      Editar
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}
