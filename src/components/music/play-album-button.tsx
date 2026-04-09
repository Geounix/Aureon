'use client'

import { Play } from 'lucide-react'
import { usePlayerStore } from '@/store/player-store'

interface Track {
  id: string
  title: string
  artist: string
  coverUrl?: string
  filePath: string
  duration?: number
}

export function PlayAlbumButton({ tracks, albumName, coverUrl, artistName }: { tracks: any[], albumName: string, coverUrl: string | null, artistName: string }) {
  const { play, currentTrack, isPlaying } = usePlayerStore()

  const mappedTracks: Track[] = tracks.map(t => ({
    id: t.id,
    title: t.title,
    artist: artistName,
    coverUrl: coverUrl || undefined,
    filePath: t.filePath,
    duration: t.duration || undefined,
  }))

  const isCurrentAlbum = currentTrack && mappedTracks.some(t => t.id === currentTrack.id)

  const handlePlay = () => {
    if (mappedTracks.length > 0) {
      if (isCurrentAlbum && isPlaying) {
        usePlayerStore.getState().toggle()
      } else if (isCurrentAlbum && !isPlaying) {
        usePlayerStore.getState().toggle()
      } else {
        play(mappedTracks[0], mappedTracks)
      }
    }
  }

  return (
    <button
      onClick={handlePlay}
      className="btn-primary rounded-full w-14 h-14 p-0 shadow-lg"
      title="Reproducir álbum"
      id="play-album-btn"
    >
      <Play size={24} fill="currentColor" className="ml-1" />
    </button>
  )
}
