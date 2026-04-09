'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ChevronLeft, ChevronRight, X, Loader2, ArrowLeft, Maximize, Shrink, Settings } from 'lucide-react'
import Link from 'next/link'

interface ChapterData {
  id: string
  title: string
  number: number
  series: string
  volume: number
  totalPages: number
  pageFiles: string[]
}

export default function ComicReaderPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  const [chapter, setChapter] = useState<ChapterData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const [currentPage, setCurrentPage] = useState(0)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showControls, setShowControls] = useState(true)
  const [readingMode, setReadingMode] = useState<'fit-width' | 'fit-height'>('fit-height')
  
  const containerRef = useRef<HTMLDivElement>(null)
  const hideControlsTimer = useRef<NodeJS.Timeout | null>(null)

  // Fetch chapter data
  useEffect(() => {
    fetch(`/api/comic/${id}`)
      .then(res => res.json())
      .then(data => {
        if (data.error) throw new Error(data.error)
        setChapter(data)
        
        // Fetch saved progress
        return fetch(`/api/progress/comic?chapterId=${id}`)
      })
      .then(res => res.json())
      .then(progress => {
        if (progress && progress.page > 0) {
          setCurrentPage(progress.page)
        }
        setLoading(false)
      })
      .catch(err => {
        setError(err.message || 'Error cargando el cómic')
        setLoading(false)
      })
  }, [id])

  // Save progress
  const saveProgress = useCallback((page: number) => {
    if (!chapter) return
    fetch('/api/progress/comic', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        comicChapterId: id,
        page,
        totalPages: chapter.totalPages,
        completed: page === chapter.totalPages - 1
      })
    }).catch(() => {})
  }, [id, chapter])

  // Handle navigation
  const goToPage = useCallback((newIndex: number) => {
    if (!chapter) return
    if (newIndex >= 0 && newIndex < chapter.totalPages) {
      setCurrentPage(newIndex)
      saveProgress(newIndex)
    }
  }, [chapter, saveProgress])

  const nextPage = useCallback(() => goToPage(currentPage + 1), [currentPage, goToPage])
  const prevPage = useCallback(() => goToPage(currentPage - 1), [currentPage, goToPage])

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['ArrowRight', 'Space'].includes(e.code)) {
        e.preventDefault()
        nextPage()
      } else if (['ArrowLeft'].includes(e.code)) {
        e.preventDefault()
        prevPage()
      } else if (e.code === 'KeyF') {
        toggleFullscreen()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [nextPage, prevPage])

  // Fullscreen
  const toggleFullscreen = () => {
    if (!document.fullscreenElement && containerRef.current) {
      containerRef.current.requestFullscreen().catch(() => {})
      setIsFullscreen(true)
    } else if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {})
      setIsFullscreen(false)
    }
  }

  // Double click for fullscreen
  const handleDoubleClick = () => toggleFullscreen()

  // Controls UI hide/show
  const showControlsTemp = () => {
    setShowControls(true)
    if (hideControlsTimer.current) clearTimeout(hideControlsTimer.current)
    hideControlsTimer.current = setTimeout(() => {
      setShowControls(false)
    }, 2500)
  }

  // Preload next image
  useEffect(() => {
    if (chapter && currentPage + 1 < chapter.totalPages) {
      const img = new window.Image()
      img.src = `/api/stream/comic/${id}?file=${encodeURIComponent(chapter.pageFiles[currentPage + 1])}`
    }
  }, [chapter, currentPage, id])

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="animate-spin text-[var(--accent-primary)]" size={48} />
      </div>
    )
  }

  if (error || !chapter) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center gap-4 text-white">
        <p className="text-xl text-red-400">{error}</p>
        <button className="btn-secondary" onClick={() => router.back()}>Volver</button>
      </div>
    )
  }

  const currentFile = chapter.pageFiles[currentPage]

  return (
    <div
      ref={containerRef}
      className="min-h-screen bg-black flex flex-col fixed inset-0 z-[100] select-none"
      onMouseMove={showControlsTemp}
      onClick={showControlsTemp}
    >
      {/* Top Bar */}
      <div
        className={`absolute top-0 inset-x-0 h-16 bg-gradient-to-b from-black/80 to-transparent flex items-center justify-between px-6 transition-opacity duration-300 z-10 ${showControls ? 'opacity-100' : 'opacity-0'}`}
      >
        <div className="flex items-center gap-4">
          <button onClick={() => router.back()} className="text-white hover:text-[var(--accent-primary)] transition-colors">
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1 className="text-white font-bold text-lg leading-tight">{chapter.series}</h1>
            <p className="text-sm text-gray-300 leading-tight">Vol. {chapter.volume} - Cap. {chapter.number}</p>
          </div>
        </div>
        
        <div className="flex flex-col items-end gap-1">
          <span className="text-white text-sm font-medium bg-black/40 px-3 py-1 rounded-full border border-white/10">
            Pág. {currentPage + 1} / {chapter.totalPages}
          </span>
        </div>
      </div>

      {/* Reader Area */}
      <div className="flex-1 flex flex-row items-center justify-center overflow-hidden relative">
        <img
          src={`/api/stream/comic/${id}?file=${encodeURIComponent(currentFile)}`}
          alt={`Page ${currentPage + 1}`}
          onDoubleClick={handleDoubleClick}
          className={`${readingMode === 'fit-height' ? 'h-full w-auto' : 'w-full h-auto'} max-w-full max-h-[100vh] object-contain transition-transform duration-200`}
        />
        
        {/* Invisible Click Zones for navigation */}
        <div 
          className="absolute inset-y-0 left-0 w-1/3 cursor-pointer z-0"
          onClick={(e) => { e.stopPropagation(); prevPage() }}
        />
        <div 
          className="absolute inset-y-0 right-0 w-1/3 cursor-pointer z-0"
          onClick={(e) => { e.stopPropagation(); nextPage() }}
        />
      </div>

      {/* Bottom Bar / Navigation */}
      <div
        className={`absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-6 transition-transform duration-300 z-10 flex flex-col gap-4 ${showControls ? 'translate-y-0' : 'translate-y-full'}`}
      >
        {/* Progress Bar (Interactive) */}
        <div className="w-full max-w-3xl mx-auto flex items-center gap-4">
          <button
            onClick={(e) => { e.stopPropagation(); prevPage() }}
            disabled={currentPage === 0}
            className="text-white hover:text-[var(--accent-primary)] disabled:opacity-20 transition-colors"
          >
            <ChevronLeft size={32} />
          </button>
          
          <input
            type="range"
            min={0}
            max={chapter.totalPages - 1}
            value={currentPage}
            onChange={(e) => goToPage(Number(e.target.value))}
            className="flex-1 accent-[var(--accent-primary)] h-2 cursor-pointer bg-white/20 rounded-full"
            style={{ WebkitAppearance: 'none' }}
          />

          <button
            onClick={(e) => { e.stopPropagation(); nextPage() }}
            disabled={currentPage === chapter.totalPages - 1}
            className="text-white hover:text-[var(--accent-primary)] disabled:opacity-20 transition-colors"
          >
            <ChevronRight size={32} />
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-center gap-6">
          <button
            title="Ajuste de lectura"
            onClick={(e) => {
              e.stopPropagation();
              setReadingMode(mode => mode === 'fit-height' ? 'fit-width' : 'fit-height')
            }}
            className="text-white/70 hover:text-white flex flex-col items-center gap-1 text-xs transition-colors"
          >
            <Settings size={20} />
            {readingMode === 'fit-height' ? 'Ajustar al ancho' : 'Ajustar al alto'}
          </button>
          
          <button
            title="Pantalla Completa"
            onClick={(e) => { e.stopPropagation(); toggleFullscreen() }}
            className="text-white/70 hover:text-white flex flex-col items-center gap-1 text-xs transition-colors"
          >
            {isFullscreen ? <Shrink size={20} /> : <Maximize size={20} />}
            {isFullscreen ? 'Salir' : 'Fullscreen'}
          </button>
        </div>
      </div>
    </div>
  )
}
