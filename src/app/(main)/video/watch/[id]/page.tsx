'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import {
  Play, Pause, Volume2, VolumeX, Maximize, Minimize,
  SkipBack, SkipForward, Settings, ArrowLeft, Subtitles,
  Loader2
} from 'lucide-react'
import Hls from 'hls.js'
import { cn } from '@/lib/utils'

interface VideoData {
  id: string
  title: string
  filePath: string | null
  duration: number | null
  subtitles: { id: string; language: string; label: string | null; filePath: string }[]
  nextEpisode?: { id: string; title: string; number: number } | null
  episodeInfo?: { seasonNumber: number; episodeNumber: number; title: string } | null
}

function formatTime(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = Math.floor(seconds % 60)
  if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  return `${m}:${s.toString().padStart(2, '0')}`
}

export default function VideoPlayerPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  const videoRef = useRef<HTMLVideoElement>(null)
  const hlsRef = useRef<Hls | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const progressRef = useRef<HTMLDivElement>(null)
  const hideControlsTimer = useRef<NodeJS.Timeout | null>(null)

  const [videoData, setVideoData] = useState<VideoData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [isMuted, setIsMuted] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showControls, setShowControls] = useState(true)
  const [isBuffering, setIsBuffering] = useState(false)
  const [showSubMenu, setShowSubMenu] = useState<'subtitles' | 'quality' | null>(null)
  const [selectedSub, setSelectedSub] = useState<string | null>(null)

  // Fetch video data
  useEffect(() => {
    fetch(`/api/video/${id}`)
      .then((r) => r.json())
      .then((data) => {
        setVideoData(data)
        setLoading(false)
      })
      .catch(() => {
        setError('No se pudo cargar el video.')
        setLoading(false)
      })
  }, [id])

  // Initialize HLS or native playback
  useEffect(() => {
    if (!videoData?.filePath || !videoRef.current) return
    const video = videoRef.current
    const src = `/api/stream/video/${id}`

    if (Hls.isSupported() && videoData.filePath.endsWith('.m3u8')) {
      const hls = new Hls({ enableWorker: true, lowLatencyMode: false })
      hls.loadSource(src)
      hls.attachMedia(video)
      hlsRef.current = hls
    } else {
      // Direct file streaming
      video.src = src
    }

    video.play().catch(() => {})

    return () => {
      hlsRef.current?.destroy()
      hlsRef.current = null
    }
  }, [videoData, id])

  // Video event handlers
  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const onTimeUpdate = () => {
      setCurrentTime(video.currentTime)
      // Save progress every 10 seconds
      if (Math.floor(video.currentTime) % 10 === 0 && video.currentTime > 0) {
        saveProgress(video.currentTime, video.duration)
      }
    }
    const onDurationChange = () => setDuration(video.duration)
    const onPlay = () => setIsPlaying(true)
    const onPause = () => setIsPlaying(false)
    const onWaiting = () => setIsBuffering(true)
    const onCanPlay = () => setIsBuffering(false)
    const onEnded = () => {
      setIsPlaying(false)
      saveProgress(video.duration, video.duration, true)
    }

    video.addEventListener('timeupdate', onTimeUpdate)
    video.addEventListener('durationchange', onDurationChange)
    video.addEventListener('play', onPlay)
    video.addEventListener('pause', onPause)
    video.addEventListener('waiting', onWaiting)
    video.addEventListener('canplay', onCanPlay)
    video.addEventListener('ended', onEnded)

    return () => {
      video.removeEventListener('timeupdate', onTimeUpdate)
      video.removeEventListener('durationchange', onDurationChange)
      video.removeEventListener('play', onPlay)
      video.removeEventListener('pause', onPause)
      video.removeEventListener('waiting', onWaiting)
      video.removeEventListener('canplay', onCanPlay)
      video.removeEventListener('ended', onEnded)
    }
  }, [id])

  // Fullscreen change listener
  useEffect(() => {
    const onFsChange = () => setIsFullscreen(!!document.fullscreenElement)
    document.addEventListener('fullscreenchange', onFsChange)
    return () => document.removeEventListener('fullscreenchange', onFsChange)
  }, [])

  // Keyboard shortcuts
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const video = videoRef.current
      if (!video) return
      switch (e.key) {
        case ' ':
        case 'k':
          e.preventDefault()
          video.paused ? video.play() : video.pause()
          break
        case 'ArrowLeft':
          video.currentTime = Math.max(0, video.currentTime - 10)
          break
        case 'ArrowRight':
          video.currentTime = Math.min(video.duration, video.currentTime + 10)
          break
        case 'ArrowUp':
          video.volume = Math.min(1, video.volume + 0.1)
          setVolume(video.volume)
          break
        case 'ArrowDown':
          video.volume = Math.max(0, video.volume - 0.1)
          setVolume(video.volume)
          break
        case 'm':
          video.muted = !video.muted
          setIsMuted(video.muted)
          break
        case 'f':
          toggleFullscreen()
          break
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const saveProgress = useCallback(
    async (position: number, dur: number, completed = false) => {
      await fetch('/api/progress/video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mediaId: id, position: Math.floor(position), duration: Math.floor(dur), completed }),
      }).catch(() => {})
    },
    [id]
  )

  const togglePlay = () => {
    const video = videoRef.current
    if (!video) return
    video.paused ? video.play() : video.pause()
  }

  const toggleMute = () => {
    const video = videoRef.current
    if (!video) return
    video.muted = !video.muted
    setIsMuted(video.muted)
  }

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = Number(e.target.value)
    if (videoRef.current) videoRef.current.volume = v
    setVolume(v)
    setIsMuted(v === 0)
  }

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressRef.current || !videoRef.current) return
    const rect = progressRef.current.getBoundingClientRect()
    const pct = (e.clientX - rect.left) / rect.width
    videoRef.current.currentTime = pct * duration
  }

  const handleProgressHover = (e: React.MouseEvent<HTMLDivElement>) => {
    // Preview time could be shown here
  }

  const seek = (seconds: number) => {
    if (!videoRef.current) return
    videoRef.current.currentTime = Math.max(0, Math.min(duration, videoRef.current.currentTime + seconds))
  }

  const toggleFullscreen = async () => {
    if (!containerRef.current) return
    if (!document.fullscreenElement) {
      await containerRef.current.requestFullscreen()
    } else {
      await document.exitFullscreen()
    }
  }

  const showControlsTemporarily = () => {
    setShowControls(true)
    if (hideControlsTimer.current) clearTimeout(hideControlsTimer.current)
    hideControlsTimer.current = setTimeout(() => {
      if (isPlaying) setShowControls(false)
    }, 3000)
  }

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0

  // ─── LOADING STATE ───
  if (loading) {
    return (
      <div
        className="flex items-center justify-center min-h-screen"
        style={{ background: '#000' }}
      >
        <Loader2 size={48} className="animate-spin" style={{ color: 'var(--accent-primary)' }} />
      </div>
    )
  }

  // ─── ERROR STATE ───
  if (error || !videoData) {
    return (
      <div
        className="flex flex-col items-center justify-center min-h-screen gap-4"
        style={{ background: '#000', color: 'white' }}
      >
        <p className="text-xl">{error || 'Video no encontrado'}</p>
        <button onClick={() => router.back()} className="btn-secondary">
          <ArrowLeft size={16} /> Volver
        </button>
      </div>
    )
  }

  // ─── NO FILE ───
  if (!videoData.filePath) {
    return (
      <div
        className="flex flex-col items-center justify-center min-h-screen gap-6"
        style={{ background: '#000', color: 'white' }}
      >
        <div className="text-6xl">🎬</div>
        <h1 className="font-display text-2xl font-bold">{videoData.title}</h1>
        <p style={{ color: '#888' }}>
          Este título no tiene un archivo de video asociado.
        </p>
        <p className="text-sm" style={{ color: '#555' }}>
          Añade el archivo desde el panel de administración y escanea la biblioteca.
        </p>
        <button
          onClick={() => router.back()}
          className="btn-secondary"
          id="player-back-no-file"
        >
          <ArrowLeft size={16} /> Volver
        </button>
      </div>
    )
  }

  // ─── PLAYER ───
  return (
    <div
      ref={containerRef}
      className="relative w-full bg-black select-none"
      style={{ minHeight: '100vh' }}
      onMouseMove={showControlsTemporarily}
      onClick={() => setShowSubMenu(null)}
      id="video-player-container"
    >
      {/* Video element */}
      <video
        ref={videoRef}
        className="w-full h-full object-contain"
        style={{ minHeight: '100vh', maxHeight: '100vh' }}
        playsInline
        id="video-element"
      >
        {videoData.subtitles.map((sub) => (
          <track
            key={sub.id}
            kind="subtitles"
            src={`/api/stream/subtitle/${sub.id}`}
            srcLang={sub.language}
            label={sub.label || sub.language.toUpperCase()}
          />
        ))}
      </video>

      {/* Buffering spinner */}
      {isBuffering && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <Loader2 size={56} className="animate-spin" style={{ color: 'white', opacity: 0.8 }} />
        </div>
      )}

      {/* Controls overlay */}
      <div
        className={cn(
          'absolute inset-0 flex flex-col justify-between transition-opacity duration-300',
          showControls || !isPlaying ? 'opacity-100' : 'opacity-0 pointer-events-none'
        )}
        style={{
          background: 'linear-gradient(to bottom, rgba(0,0,0,0.7) 0%, transparent 20%, transparent 70%, rgba(0,0,0,0.85) 100%)',
        }}
      >
        {/* Top bar */}
        <div className="flex items-center gap-3 px-6 py-4">
          <button
            id="player-back-btn"
            onClick={() => router.back()}
            className="flex items-center gap-2 text-sm font-medium transition-opacity hover:opacity-70"
            style={{ color: 'white' }}
          >
            <ArrowLeft size={20} />
            Volver
          </button>
          <div className="flex flex-col ml-2">
            <span className="font-display text-base font-semibold" style={{ color: 'white' }}>
              {videoData.title}
            </span>
            {videoData.episodeInfo && (
              <span className="text-xs" style={{ color: 'rgba(255,255,255,0.6)' }}>
                T{videoData.episodeInfo.seasonNumber} E{videoData.episodeInfo.episodeNumber} — {videoData.episodeInfo.title}
              </span>
            )}
          </div>
        </div>

        {/* Center click-to-play area */}
        <div
          className="flex-1 flex items-center justify-center cursor-pointer"
          onClick={togglePlay}
          id="player-click-area"
        />

        {/* Bottom controls */}
        <div className="px-6 pb-6 space-y-3">
          {/* Progress bar */}
          <div
            ref={progressRef}
            className="group relative h-1 rounded-full cursor-pointer transition-all hover:h-2"
            style={{ background: 'rgba(255,255,255,0.25)' }}
            onClick={handleProgressClick}
            onMouseMove={handleProgressHover}
            id="player-progress-bar"
          >
            {/* Buffered */}
            <div
              className="absolute top-0 left-0 h-full rounded-full"
              style={{ width: '60%', background: 'rgba(255,255,255,0.15)' }}
            />
            {/* Played */}
            <div
              className="absolute top-0 left-0 h-full rounded-full transition-all"
              style={{ width: `${progress}%`, background: 'var(--accent-primary)' }}
            />
            {/* Scrubber thumb */}
            <div
              className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              style={{
                left: `${progress}%`,
                transform: `translateX(-50%) translateY(-50%)`,
                background: 'white',
                boxShadow: '0 0 6px rgba(0,0,0,0.5)',
              }}
            />
          </div>

          {/* Controls row */}
          <div className="flex items-center gap-4">
            {/* Left controls */}
            <div className="flex items-center gap-2 flex-1">
              <button id="player-rewind" onClick={() => seek(-10)} className="player-btn" title="Retroceder 10s">
                <SkipBack size={20} style={{ color: 'white' }} />
              </button>

              <button
                id="player-play-main"
                onClick={togglePlay}
                className="w-10 h-10 rounded-full flex items-center justify-center transition-transform hover:scale-110 active:scale-95"
                style={{ background: 'white' }}
              >
                {isPlaying
                  ? <Pause size={18} style={{ color: '#000' }} />
                  : <Play size={18} style={{ color: '#000', marginLeft: 2 }} />
                }
              </button>

              <button id="player-forward" onClick={() => seek(10)} className="player-btn" title="Avanzar 10s">
                <SkipForward size={20} style={{ color: 'white' }} />
              </button>

              {/* Volume */}
              <div className="flex items-center gap-2 group">
                <button id="player-mute" onClick={toggleMute} className="player-btn">
                  {isMuted || volume === 0
                    ? <VolumeX size={20} style={{ color: 'white' }} />
                    : <Volume2 size={20} style={{ color: 'white' }} />
                  }
                </button>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={isMuted ? 0 : volume}
                  onChange={handleVolumeChange}
                  className="w-20 accent-white opacity-70 hover:opacity-100 transition-opacity"
                  id="player-volume-slider"
                  style={{ height: '3px' }}
                />
              </div>

              {/* Time */}
              <span className="text-sm tabular-nums ml-1" style={{ color: 'rgba(255,255,255,0.8)' }}>
                {formatTime(currentTime)}
                <span style={{ color: 'rgba(255,255,255,0.4)' }}> / </span>
                {formatTime(duration || videoData.duration || 0)}
              </span>
            </div>

            {/* Right controls */}
            <div className="flex items-center gap-2 relative">
              {/* Subtitles menu */}
              {videoData.subtitles.length > 0 && (
                <div className="relative">
                  <button
                    id="player-subtitles-btn"
                    onClick={(e) => {
                      e.stopPropagation()
                      setShowSubMenu(showSubMenu === 'subtitles' ? null : 'subtitles')
                    }}
                    className="player-btn"
                    title="Subtítulos"
                  >
                    <Subtitles size={20} style={{ color: selectedSub ? 'var(--accent-primary)' : 'white' }} />
                  </button>
                  {showSubMenu === 'subtitles' && (
                    <div
                      className="absolute bottom-full right-0 mb-2 rounded-xl overflow-hidden min-w-40"
                      style={{ background: 'rgba(20,20,30,0.95)', border: '1px solid rgba(255,255,255,0.1)' }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        className="w-full text-left px-4 py-2.5 text-sm hover:bg-white/10 transition-colors"
                        style={{ color: !selectedSub ? 'var(--accent-primary)' : 'white' }}
                        onClick={() => { setSelectedSub(null); setShowSubMenu(null) }}
                      >
                        Sin subtítulos
                      </button>
                      {videoData.subtitles.map((sub) => (
                        <button
                          key={sub.id}
                          className="w-full text-left px-4 py-2.5 text-sm hover:bg-white/10 transition-colors"
                          style={{ color: selectedSub === sub.id ? 'var(--accent-primary)' : 'white' }}
                          onClick={() => { setSelectedSub(sub.id); setShowSubMenu(null) }}
                        >
                          {sub.label || sub.language.toUpperCase()}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <button
                id="player-settings-btn"
                className="player-btn"
                onClick={(e) => {
                  e.stopPropagation()
                  setShowSubMenu(showSubMenu === 'quality' ? null : 'quality')
                }}
                title="Configuración"
              >
                <Settings size={20} style={{ color: 'white' }} />
              </button>

              {showSubMenu === 'quality' && (
                <div
                  className="absolute bottom-full right-8 mb-2 rounded-xl overflow-hidden min-w-36"
                  style={{ background: 'rgba(20,20,30,0.95)', border: '1px solid rgba(255,255,255,0.1)' }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <p className="px-4 py-2 text-xs font-semibold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.4)' }}>
                    Calidad
                  </p>
                  {['Auto', '1080p', '720p', '480p'].map((q) => (
                    <button
                      key={q}
                      className="w-full text-left px-4 py-2.5 text-sm hover:bg-white/10 transition-colors"
                      style={{ color: q === 'Auto' ? 'var(--accent-primary)' : 'white' }}
                    >
                      {q}
                    </button>
                  ))}
                </div>
              )}

              <button
                id="player-fullscreen-btn"
                onClick={toggleFullscreen}
                className="player-btn"
                title="Pantalla completa"
              >
                {isFullscreen
                  ? <Minimize size={20} style={{ color: 'white' }} />
                  : <Maximize size={20} style={{ color: 'white' }} />
                }
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Next episode overlay */}
      {videoData.nextEpisode && currentTime > 0 && duration > 0 && duration - currentTime < 30 && (
        <div
          className="absolute bottom-24 right-6 rounded-xl overflow-hidden flex flex-col gap-2 p-4"
          style={{ background: 'rgba(20,20,30,0.9)', border: '1px solid rgba(255,255,255,0.1)', width: 260 }}
        >
          <p className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>A continuación</p>
          <p className="text-sm font-medium" style={{ color: 'white' }}>
            Ep. {videoData.nextEpisode.number} — {videoData.nextEpisode.title}
          </p>
          <button
            className="btn-primary text-xs py-2"
            id="player-next-episode"
            onClick={() => router.push(`/video/watch/${videoData.nextEpisode!.id}`)}
          >
            Siguiente episodio
          </button>
        </div>
      )}

      <style jsx>{`
        .player-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 36px;
          height: 36px;
          border-radius: 8px;
          transition: background 0.15s;
          background: transparent;
        }
        .player-btn:hover {
          background: rgba(255,255,255,0.1);
        }
      `}</style>
    </div>
  )
}
