'use client'

import { Play, Pause } from 'lucide-react'
import { usePlayerStore } from '@/store/player-store'

interface Track {
  id: string
  title: string
  artist: string
  coverUrl?: string
  filePath: string
  duration?: number
}

export function TrackRow({ track, index, allTracks }: { track: Track, index: number, allTracks: Track[] }) {
  const { currentTrack, isPlaying, toggle, play } = usePlayerStore()

  const isCurrentTrack = currentTrack?.id === track.id

  const formatDuration = (seconds?: number) => {
    if (!seconds) return '--:--'
    const m = Math.floor(seconds / 60)
    const s = Math.floor(seconds % 60)
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  const handlePlay = () => {
    if (isCurrentTrack) {
      toggle()
    } else {
      play(track, allTracks)
    }
  }

  return (
    <div
      className={`group flex items-center gap-4 px-4 py-2.5 rounded-lg transition-colors cursor-pointer ${isCurrentTrack ? 'bg-[var(--bg-elevated)]' : 'hover:bg-[var(--bg-elevated)]'}`}
      onClick={handlePlay}
      id={`track-row-${track.id}`}
    >
      <div className="w-8 text-center shrink-0">
        <span className="text-sm text-[var(--text-muted)] group-hover:hidden">
          {isCurrentTrack ? (
            <span className="text-[var(--accent-primary)] font-bold">▶</span>
          ) : (
            index + 1
          )}
        </span>
        <button className="hidden group-hover:flex mx-auto items-center justify-center w-full h-full text-[var(--text-primary)]">
          {isCurrentTrack && isPlaying ? <Pause size={14} /> : <Play size={14} fill="currentColor" />}
        </button>
      </div>

      <div className="flex-1 min-w-0">
        <p className={`text-sm truncate font-medium ${isCurrentTrack ? 'text-[var(--accent-primary)]' : 'text-[var(--text-primary)]'}`}>
          {track.title}
        </p>
        <p className="text-xs text-[var(--text-muted)] truncate mt-0.5">
          {track.artist}
        </p>
      </div>

      <div className="text-xs text-[var(--text-muted)] shrink-0 pr-2">
        {formatDuration(track.duration)}
      </div>
    </div>
  )
}
