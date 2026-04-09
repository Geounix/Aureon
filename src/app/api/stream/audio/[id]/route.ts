import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import fs from 'fs'
import path from 'path'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const track = await prisma.musicTrack.findUnique({ where: { id }, select: { filePath: true } })
  
  if (!track?.filePath) {
    return NextResponse.json({ error: 'Audio track not found' }, { status: 404 })
  }

  const absolutePath = path.isAbsolute(track.filePath) ? track.filePath : path.join(process.cwd(), track.filePath)

  if (!fs.existsSync(absolutePath)) {
    return NextResponse.json({ error: 'File not found on disk' }, { status: 404 })
  }

  const stat = fs.statSync(absolutePath)
  const fileSize = stat.size
  const range = request.headers.get('range')

  const ext = path.extname(track.filePath).toLowerCase()
  const contentTypeMap: Record<string, string> = {
    '.mp3': 'audio/mpeg',
    '.flac': 'audio/flac',
    '.m4a': 'audio/mp4',
    '.ogg': 'audio/ogg',
    '.wav': 'audio/wav',
    '.aac': 'audio/aac',
    '.opus': 'audio/opus',
  }
  const contentType = contentTypeMap[ext] || 'audio/mpeg'

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
