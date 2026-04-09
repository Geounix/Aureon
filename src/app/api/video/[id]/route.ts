import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  // Try finding as MediaItem first
  const media = await prisma.mediaItem.findUnique({
    where: { id },
    include: {
      subtitles: true,
      seasons: {
        include: {
          episodes: { orderBy: { number: 'asc' } },
        },
        orderBy: { number: 'asc' },
      },
    },
  })

  if (media) {
    return NextResponse.json({
      id: media.id,
      title: media.title,
      filePath: media.filePath,
      duration: media.duration,
      subtitles: media.subtitles,
      nextEpisode: null,
      episodeInfo: null,
    })
  }

  // Try as Episode
  const episode = await prisma.episode.findUnique({
    where: { id },
    include: {
      season: {
        include: {
          mediaItem: true,
          episodes: { orderBy: { number: 'asc' } },
        },
      },
    },
  })

  if (episode) {
    const allEps = episode.season.episodes
    const currentIdx = allEps.findIndex((e) => e.id === id)
    const nextEp = currentIdx < allEps.length - 1 ? allEps[currentIdx + 1] : null

    return NextResponse.json({
      id: episode.id,
      title: episode.season.mediaItem.title,
      filePath: episode.filePath,
      duration: episode.duration,
      subtitles: [],
      nextEpisode: nextEp
        ? { id: nextEp.id, title: nextEp.title, number: nextEp.number }
        : null,
      episodeInfo: {
        seasonNumber: episode.season.number,
        episodeNumber: episode.number,
        title: episode.title,
      },
    })
  }

  return NextResponse.json({ error: 'Not found' }, { status: 404 })
}
