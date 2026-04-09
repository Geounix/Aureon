'use client'

import { useEffect, useRef } from 'react'
import { usePlayerStore } from '@/store/player-store'
import { Play, Pause, SkipBack, SkipForward, Volume2, X, Maximize2 } from 'lucide-react'
import Image from 'next/image'
import { Howl } from 'howler'
import { cn } from '@/lib/utils'

export function MiniPlayer() {
  const {
    currentTrack,
    isPlaying,
    progress,
    volume,
    queueIndex,
    toggle,
    next,
    previous,
    setProgress,
    setVolume,
    close,
  } = usePlayerStore()

  const progressRef = useRef<HTMLDivElement>(null)
  const soundRef = useRef<Howl | null>(null)
  const animRef = useRef<number>(0)

  // 1. Handle track loading
  useEffect(() => {
    if (!currentTrack) {
      if (soundRef.current) {
        soundRef.current.unload()
        soundRef.current = null
      }
      return
    }

    if (soundRef.current) {
      soundRef.current.unload()
    }

    const sound = new Howl({
      src: [`/api/stream/audio/${currentTrack.id}`],
      html5: true,
      volume: volume / 100,
      format: ['mp3', 'flac', 'm4a', 'ogg', 'wav'],
      onend: () => {
        next()
      },
    })
    
    soundRef.current = sound

    if (isPlaying) {
      sound.play()
    }

    return () => {
      sound.unload()
    }
  }, [currentTrack?.id]) // only re-run when track changes

  // 2. Play/Pause reaction
  useEffect(() => {
    if (!soundRef.current) return
    if (isPlaying && !soundRef.current.playing()) {
      soundRef.current.play()
    } else if (!isPlaying && soundRef.current.playing()) {
      soundRef.current.pause()
    }
  }, [isPlaying])

  // 3. Volume reaction
  useEffect(() => {
    if (!soundRef.current) return
    soundRef.current.volume(volume / 100)
  }, [volume])

  // 4. Progress loop
  useEffect(() => {
    if (!soundRef.current || !isPlaying) return

    const updateProgress = () => {
      if (soundRef.current && soundRef.current.state() === 'loaded') {
        const seek = soundRef.current.seek()
        const dur = soundRef.current.duration()
        if (typeof seek === 'number' && dur > 0) {
          setProgress((seek / dur) * 100)
        }
      }
      animRef.current = requestAnimationFrame(updateProgress)
    }

    animRef.current = requestAnimationFrame(updateProgress)
    return () => cancelAnimationFrame(animRef.current)
  }, [isPlaying, setProgress])

  if (!currentTrack) return null

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressRef.current || !soundRef.current) return
    const rect = progressRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const percent = x / rect.width
    
    const dur = soundRef.current.duration()
    if (dur > 0) {
      soundRef.current.seek(dur * percent)
    }
    setProgress(percent * 100)
  }

  return (
    <div className="mini-player">
      <div className="flex items-center gap-4 max-w-screen-xl mx-auto">
        {/* Track info */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div
            className="w-11 h-11 rounded-lg overflow-hidden shrink-0"
            style={{ background: 'var(--bg-elevated)' }}
          >
            {currentTrack.coverUrl ? (
              <Image
                src={currentTrack.coverUrl}
                alt={currentTrack.title}
                width={44}
                height={44}
                className="object-cover w-full h-full"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-lg">🎵</div>
            )}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>
              {currentTrack.title}
            </p>
            <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>
              {currentTrack.artist}
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-col items-center gap-2 flex-1">
          <div className="flex items-center gap-4">
            <button id="player-prev" onClick={previous} className="btn-icon">
              <SkipBack size={16} />
            </button>
            <button
              id="player-play-pause"
              onClick={toggle}
              className="btn-primary rounded-full w-9 h-9 p-0"
            >
              {isPlaying ? <Pause size={16} /> : <Play size={16} />}
            </button>
            <button id="player-next" onClick={next} className="btn-icon">
              <SkipForward size={16} />
            </button>
          </div>

          {/* Progress */}
          <div
            ref={progressRef}
            className="progress-bar w-64 cursor-pointer"
            onClick={handleProgressClick}
          >
            <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
          </div>
        </div>

        {/* Volume + actions */}
        <div className="flex items-center gap-3 flex-1 justify-end">
          <Volume2 size={16} style={{ color: 'var(--text-muted)' }} />
          <input
            type="range"
            min={0}
            max={100}
            value={volume}
            onChange={(e) => setVolume(Number(e.target.value))}
            className="w-24 accent-[var(--accent-primary)]"
            style={{ height: '4px' }}
          />
          <button id="player-fullscreen" className="btn-icon">
            <Maximize2 size={14} />
          </button>
          <button id="player-close" onClick={close} className="btn-icon">
            <X size={14} />
          </button>
        </div>
      </div>
    </div>
  )
}
