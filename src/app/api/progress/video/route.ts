import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

export async function POST(request: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { mediaId, episodeId, position, duration, completed } = await request.json()

  // Get the user's first profile
  const profile = await prisma.profile.findFirst({
    where: { userId: session.user.id },
  })

  if (!profile) {
    return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
  }

  // Upsert progress
  const where = episodeId
    ? { profileId_episodeId: { profileId: profile.id, episodeId } }
    : { profileId_mediaItemId: { profileId: profile.id, mediaItemId: mediaId } }

  // Find existing or create
  const existing = await prisma.playbackProgress.findFirst({
    where: episodeId
      ? { profileId: profile.id, episodeId }
      : { profileId: profile.id, mediaItemId: mediaId },
  })

  if (existing) {
    await prisma.playbackProgress.update({
      where: { id: existing.id },
      data: {
        position: Math.floor(position),
        duration: Math.floor(duration),
        completed: completed || existing.completed,
      },
    })
  } else {
    await prisma.playbackProgress.create({
      data: {
        profileId: profile.id,
        mediaItemId: episodeId ? null : mediaId,
        episodeId: episodeId || null,
        position: Math.floor(position),
        duration: Math.floor(duration),
        completed: completed || false,
      },
    })
  }

  return NextResponse.json({ ok: true })
}

export async function GET(request: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const mediaId = searchParams.get('mediaId')
  const episodeId = searchParams.get('episodeId')

  const profile = await prisma.profile.findFirst({
    where: { userId: session.user.id },
  })

  if (!profile) return NextResponse.json(null)

  const progress = await prisma.playbackProgress.findFirst({
    where: {
      profileId: profile.id,
      ...(episodeId ? { episodeId } : { mediaItemId: mediaId }),
    },
  })

  return NextResponse.json(progress)
}
