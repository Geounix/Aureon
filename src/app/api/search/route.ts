import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const q = searchParams.get('q') || ''

  if (!q || q.length < 2) {
    return NextResponse.json([])
  }

  const [videos, tracks, comics] = await Promise.all([
    prisma.mediaItem.findMany({
      where: {
        OR: [
          { title: { contains: q, mode: 'insensitive' } },
          { originalTitle: { contains: q, mode: 'insensitive' } },
          { synopsis: { contains: q, mode: 'insensitive' } },
        ],
      },
      take: 10,
      select: { id: true, title: true, type: true, year: true },
    }),
    prisma.musicTrack.findMany({
      where: {
        OR: [
          { title: { contains: q, mode: 'insensitive' } },
          { album: { title: { contains: q, mode: 'insensitive' } } },
          { album: { artist: { name: { contains: q, mode: 'insensitive' } } } },
        ],
      },
      take: 10,
      select: {
        id: true,
        title: true,
        album: { select: { title: true, artist: { select: { name: true } } } },
      },
    }),
    prisma.comicSeries.findMany({
      where: {
        OR: [
          { title: { contains: q, mode: 'insensitive' } },
          { author: { contains: q, mode: 'insensitive' } },
        ],
      },
      take: 10,
      select: { id: true, title: true, author: true },
    }),
  ])

  const results = [
    ...videos.map((v) => ({
      type: 'video' as const,
      id: v.id,
      title: v.title,
      subtitle: v.type,
      year: v.year ?? undefined,
    })),
    ...tracks.map((t) => ({
      type: 'music' as const,
      id: t.id,
      title: t.title,
      subtitle: `${t.album.artist.name} — ${t.album.title}`,
    })),
    ...comics.map((c) => ({
      type: 'comic' as const,
      id: c.id,
      title: c.title,
      subtitle: c.author ?? undefined,
    })),
  ]

  return NextResponse.json(results)
}
