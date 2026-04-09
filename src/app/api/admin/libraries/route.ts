import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

export async function GET() {
  const libraries = await prisma.library.findMany({
    include: { _count: { select: { mediaItems: true } } },
    orderBy: { createdAt: 'asc' },
  })
  return NextResponse.json(libraries)
}

export async function POST(request: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const user = await prisma.user.findUnique({ where: { id: session.user.id } })
  if (user?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { name, type, path } = await request.json()

  if (!name || !type || !path) {
    return NextResponse.json({ error: 'Faltan campos requeridos' }, { status: 400 })
  }

  const validTypes = ['MOVIE', 'SERIES', 'MUSIC', 'COMICS']
  if (!validTypes.includes(type)) {
    return NextResponse.json({ error: 'Tipo de biblioteca inválido' }, { status: 400 })
  }

  const library = await prisma.library.create({
    data: { name, type, path },
  })

  return NextResponse.json(library, { status: 201 })
}
