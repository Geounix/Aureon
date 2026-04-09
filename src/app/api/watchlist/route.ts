import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

// GET /api/watchlist?mediaId=xxx  → check if in list
export async function GET(request: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ inList: false })

  const { searchParams } = new URL(request.url)
  const mediaId = searchParams.get('mediaId')
  if (!mediaId) return NextResponse.json({ inList: false })

  const profile = await prisma.profile.findFirst({ where: { userId: session.user.id } })
  if (!profile) return NextResponse.json({ inList: false })

  const item = await prisma.watchlist.findFirst({
    where: { profileId: profile.id, mediaItemId: mediaId },
  })

  return NextResponse.json({ inList: !!item })
}

// POST /api/watchlist → add to list
export async function POST(request: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { mediaId } = await request.json()
  const profile = await prisma.profile.findFirst({ where: { userId: session.user.id } })
  if (!profile) return NextResponse.json({ error: 'No profile' }, { status: 404 })

  try {
    await prisma.watchlist.create({
      data: { profileId: profile.id, mediaItemId: mediaId },
    })
    return NextResponse.json({ ok: true, action: 'added' })
  } catch {
    return NextResponse.json({ error: 'Already in list' }, { status: 409 })
  }
}

// DELETE /api/watchlist?mediaId=xxx → remove from list
export async function DELETE(request: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const mediaId = searchParams.get('mediaId')
  if (!mediaId) return NextResponse.json({ error: 'Missing mediaId' }, { status: 400 })

  const profile = await prisma.profile.findFirst({ where: { userId: session.user.id } })
  if (!profile) return NextResponse.json({ error: 'No profile' }, { status: 404 })

  await prisma.watchlist.deleteMany({
    where: { profileId: profile.id, mediaItemId: mediaId },
  })

  return NextResponse.json({ ok: true, action: 'removed' })
}
