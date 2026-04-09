import { prisma } from '@/lib/prisma'
import { BookOpen, BookText } from 'lucide-react'
import Link from 'next/link'

export const metadata = { title: 'Cómics — Aureon' }

export default async function ComicsPage() {
  const series = await prisma.comicSeries.findMany({
    orderBy: { addedAt: 'desc' },
    include: {
      volumes: {
        include: {
          chapters: true
        }
      }
    }
  })

  return (
    <div className="px-8 py-8 space-y-12">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold flex items-center gap-3" style={{ color: 'var(--text-primary)' }}>
          <BookOpen size={28} style={{ color: 'var(--accent-emerald)' }} />
          Librería de Cómics
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
          Tu colección de mangas, cómics y novelas gráficas
        </p>
      </div>

      {series.length === 0 ? (
        <div className="text-center py-20 rounded-2xl" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
          <BookOpen size={56} className="mx-auto mb-4" style={{ color: 'var(--text-muted)' }} />
          <h2 className="font-display text-2xl font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>Sin cómics</h2>
          <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>
            Añade una biblioteca de Cómics desde el panel de administración.
          </p>
          <Link href="/admin/libraries" className="btn-primary" id="comics-goto-admin">
            Añadir biblioteca
          </Link>
        </div>
      ) : (
        <section>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5">
            {series.map((item) => {
              const totalVolumes = item.volumes.length
              const totalChapters = item.volumes.reduce((acc, v) => acc + v.chapters.length, 0)
              
              return (
                <Link
                  key={item.id}
                  href={`/comics/${item.id}`}
                  className="media-card group p-3"
                  id={`comic-series-${item.id}`}
                >
                  <div
                    className="w-full aspect-[2/3] rounded-lg flex items-center justify-center overflow-hidden relative mb-3 shadow-md"
                    style={{
                      background: item.coverUrl
                        ? `url(${item.coverUrl}) center/cover no-repeat`
                        : 'linear-gradient(135deg, var(--bg-hover), var(--bg-card))',
                    }}
                  >
                    {!item.coverUrl && <BookText size={40} style={{ color: 'var(--text-muted)' }} />}
                  </div>
                  <div>
                    <p className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>
                      {item.title}
                    </p>
                    <div className="flex justify-between items-center mt-1">
                      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                        {totalVolumes} Vol.
                      </p>
                      <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                        {totalChapters} Caps.
                      </p>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        </section>
      )}
    </div>
  )
}
