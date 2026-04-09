import { create } from 'zustand'

interface Track {
  id: string
  title: string
  artist: string
  coverUrl?: string
  filePath: string
  duration?: number
}

interface PlayerStore {
  currentTrack: Track | null
  queue: Track[]
  queueIndex: number
  isPlaying: boolean
  progress: number
  volume: number

  play: (track: Track, queue?: Track[]) => void
  toggle: () => void
  next: () => void
  previous: () => void
  setProgress: (p: number) => void
  setVolume: (v: number) => void
  close: () => void
}

export const usePlayerStore = create<PlayerStore>((set, get) => ({
  currentTrack: null,
  queue: [],
  queueIndex: 0,
  isPlaying: false,
  progress: 0,
  volume: 80,

  play: (track, queue = []) => {
    const idx = queue.findIndex((t) => t.id === track.id)
    set({
      currentTrack: track,
      queue: queue.length ? queue : [track],
      queueIndex: idx >= 0 ? idx : 0,
      isPlaying: true,
      progress: 0,
    })
  },

  toggle: () => set((s) => ({ isPlaying: !s.isPlaying })),

  next: () => {
    const { queue, queueIndex } = get()
    if (queueIndex < queue.length - 1) {
      const next = queue[queueIndex + 1]
      set({ currentTrack: next, queueIndex: queueIndex + 1, progress: 0, isPlaying: true })
    }
  },

  previous: () => {
    const { queue, queueIndex, progress } = get()
    if (progress > 5) {
      set({ progress: 0 })
    } else if (queueIndex > 0) {
      const prev = queue[queueIndex - 1]
      set({ currentTrack: prev, queueIndex: queueIndex - 1, progress: 0, isPlaying: true })
    }
  },

  setProgress: (p) => set({ progress: Math.max(0, Math.min(100, p)) }),
  setVolume: (v) => set({ volume: Math.max(0, Math.min(100, v)) }),
  close: () => set({ currentTrack: null, isPlaying: false, progress: 0 }),
}))
