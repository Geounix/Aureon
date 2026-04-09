import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import fs from 'fs'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const subtitle = await prisma.subtitleTrack.findUnique({ where: { id } })
  if (!subtitle) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  if (!fs.existsSync(subtitle.filePath)) {
    return NextResponse.json({ error: 'File not found' }, { status: 404 })
  }

  const content = fs.readFileSync(subtitle.filePath, 'utf-8')
  const ext = subtitle.filePath.split('.').pop()?.toLowerCase()
  const contentType = ext === 'vtt' ? 'text/vtt' : 'text/plain'

  return new NextResponse(content, {
    headers: { 'Content-Type': contentType },
  })
}
