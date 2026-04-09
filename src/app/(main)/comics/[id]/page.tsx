import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { BookOpen, ArrowLeft, BookText } from 'lucide-react'

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const series = await prisma.comicSeries.findUnique({ where: { id }, select: { title: true } })
  if (!series) return { title: 'Cómic no encontrado — Aureon' }
  return { title: `${series.title} — Aureon` }
}

export default async function ComicSeriesPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const series = await prisma.comicSeries.findUnique({
    where: { id },
    include: {
      volumes: {
        orderBy: { number: 'asc' },
        include: {
          chapters: {
            orderBy: { number: 'asc' },
          },
        },
      },
    },
  })

  if (!series) notFound()

  const totalVolumes = series.volumes.length
  const totalChapters = series.volumes.reduce((acc, v) => acc + v.chapters.length, 0)
  const firstChapter = series.volumes[0]?.chapters[0]

  return (
    <div className="min-h-screen pb-24">
      {/* Hero */}
      <div className="relative overflow-hidden pt-24 px-8 pb-10" style={{ background: 'var(--bg-elevated)' }}>
        {series.coverUrl && (
          <div
            className="absolute inset-0 opacity-20 blur-3xl"
            style={{ background: `url(${series.coverUrl}) center/cover` }}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-primary)] to-transparent" />
        
        <Link href="/comics" className="absolute top-8 left-8 btn-icon bg-[var(--bg-elevated)] z-10" id="comic-back-btn">
          <ArrowLeft size={16} />
        </Link>
        
        <div className="relative z-10 flex gap-8 items-end max-w-6xl mx-auto">
          {/* Cover */}
          <div
            className="w-48 aspect-[2/3] shrink-0 rounded-xl overflow-hidden shadow-2xl flex items-center justify-center bg-[var(--bg-card)]"
            style={{ border: '1px solid var(--border)' }}
          >
            {series.coverUrl ? (
              <Image src={series.coverUrl} alt={series.title} width={192} height={288} className="w-full h-full object-cover" />
            ) : (
              <BookText size={64} style={{ color: 'var(--text-muted)' }} />
            )}
          </div>
          
          {/* Info */}
          <div className="flex-1 pb-2">
            <span className="text-xs font-semibold uppercase tracking-widest text-[var(--text-secondary)] mb-2 block">
              Serie / Cómic
            </span>
            <h1 className="font-display font-bold mb-4 leading-tight" style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', color: 'var(--text-primary)' }}>
              {series.title}
            </h1>
            
            <div className="flex items-center gap-4 text-sm font-medium">
              <span className="badge badge-new text-xs">
                {totalVolumes} Volúmenes
              </span>
              <span style={{ color: 'var(--text-muted)' }}>•</span>
              <span style={{ color: 'var(--text-secondary)' }}>
                {totalChapters} Capítulos
              </span>
            </div>
            
            {firstChapter && (
              <div className="mt-8">
                <Link
                  href={`/comics/read/${firstChapter.id}`}
                  className="btn-primary"
                  id={`read-comic-${series.id}`}
                >
                  <BookOpen size={16} />
                  Comenzar a leer
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Content */}
      <div className="px-8 max-w-6xl mx-auto mt-8 relative z-20">
        <h2 className="section-title">Volúmenes y Capítulos</h2>
        
        <div className="space-y-6">
          {series.volumes.map((volume) => (
            <div key={volume.id} className="rounded-xl overflow-hidden bg-[var(--bg-card)] border border-[var(--border)]">
              <div className="px-5 py-4 bg-[var(--bg-hover)] border-b border-[var(--border)] flex justify-between items-center">
                <h3 className="font-semibold text-[var(--text-primary)]">Volumen {volume.number}</h3>
                <span className="text-xs text-[var(--text-muted)]">{volume.chapters.length} caps.</span>
              </div>
              
              <div className="divide-y divide-[var(--border)]">
                {volume.chapters.map((chapter) => (
                  <div key={chapter.id} className="flex items-center justify-between px-5 py-3 hover:bg-[var(--bg-elevated)] transition-colors">
                    <div>
                      <p className="text-sm font-medium text-[var(--text-primary)]">
                        Capítulo {chapter.number}
                        {chapter.title && chapter.title !== chapter.number.toString() && ` — ${chapter.title}`}
                      </p>
                    </div>
                    
                    <Link
                      href={`/comics/read/${chapter.id}`}
                      className="btn-secondary text-xs px-3 py-1.5"
                      id={`read-chapter-${chapter.id}`}
                    >
                      Leer
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
