import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

export async function POST(request: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { profileId, chapterId, currentPage, completed } = await request.json()

  // Get the user's first profile
  const profile = await prisma.profile.findFirst({
    where: { userId: session.user.id },
  })

  if (!profile) {
    return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
  }

  // Find existing or create
  const existing = await prisma.readingProgress.findFirst({
    where: { profileId: profile.id, chapterId },
  })

  if (existing) {
    await prisma.readingProgress.update({
      where: { id: existing.id },
      data: {
        currentPage: Math.floor(currentPage),
        completed: completed || existing.completed,
      },
    })
  } else {
    await prisma.readingProgress.create({
      data: {
        profileId: profile.id,
        chapterId,
        currentPage: Math.floor(currentPage),
        completed: completed || false,
      },
    })
  }

  return NextResponse.json({ ok: true })
}

export async function GET(request: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json(null)

  const { searchParams } = new URL(request.url)
  const chapterId = searchParams.get('chapterId')

  if (!chapterId) return NextResponse.json(null)

  const profile = await prisma.profile.findFirst({
    where: { userId: session.user.id },
  })

  if (!profile) return NextResponse.json(null)

  const progress = await prisma.readingProgress.findFirst({
    where: {
      profileId: profile.id,
      comicChapterId: chapterId,
    },
  })

  return NextResponse.json(progress)
}
