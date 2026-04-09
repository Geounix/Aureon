import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import fs from 'fs'
import path from 'path'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  // Find media item or episode
  let filePath: string | null = null

  const media = await prisma.mediaItem.findUnique({ where: { id }, select: { filePath: true } })
  if (media?.filePath) {
    filePath = media.filePath
  } else {
    const episode = await prisma.episode.findUnique({ where: { id }, select: { filePath: true } })
    filePath = episode?.filePath ?? null
  }

  if (!filePath) {
    return NextResponse.json({ error: 'File path not found' }, { status: 404 })
  }

  // Check file exists
  const absolutePath = path.isAbsolute(filePath) ? filePath : path.join(process.cwd(), filePath)

  if (!fs.existsSync(absolutePath)) {
    return NextResponse.json({ error: 'File not found on disk' }, { status: 404 })
  }

  const stat = fs.statSync(absolutePath)
  const fileSize = stat.size
  const range = request.headers.get('range')

  // Determine content type
  const ext = path.extname(filePath).toLowerCase()
  const contentTypeMap: Record<string, string> = {
    '.mp4': 'video/mp4',
    '.mkv': 'video/x-matroska',
    '.avi': 'video/x-msvideo',
    '.mov': 'video/quicktime',
    '.webm': 'video/webm',
    '.m3u8': 'application/x-mpegURL',
    '.ts': 'video/mp2t',
  }
  const contentType = contentTypeMap[ext] || 'video/mp4'

  // Range request (for seeking)
  if (range) {
    const parts = range.replace(/bytes=/, '').split('-')
    const start = parseInt(parts[0], 10)
    const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1
    const chunkSize = end - start + 1

    const fileStream = fs.createReadStream(absolutePath, { start, end })

    return new NextResponse(fileStream as unknown as ReadableStream, {
      status: 206,
      headers: {
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': String(chunkSize),
        'Content-Type': contentType,
        'Cache-Control': 'no-cache',
      },
    })
  }

  // Full file
  const fileStream = fs.createReadStream(absolutePath)
  return new NextResponse(fileStream as unknown as ReadableStream, {
    headers: {
      'Content-Length': String(fileSize),
      'Content-Type': contentType,
      'Accept-Ranges': 'bytes',
      'Cache-Control': 'no-cache',
    },
  })
}
