import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import fs from 'fs'
import path from 'path'
import JSZip from 'jszip'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const { searchParams } = new URL(request.url)
  const fileKey = searchParams.get('file')

  if (!fileKey) {
    return NextResponse.json({ error: 'File parameter is required' }, { status: 400 })
  }

  try {
    const chapter = await prisma.comicChapter.findUnique({
      where: { id },
    })

    if (!chapter || !chapter.filePath) {
      return NextResponse.json({ error: 'Chapter not found' }, { status: 404 })
    }

    const absolutePath = path.isAbsolute(chapter.filePath)
      ? chapter.filePath
      : path.join(process.cwd(), chapter.filePath)

    if (!fs.existsSync(absolutePath)) {
      return NextResponse.json({ error: 'File missing on server' }, { status: 404 })
    }

    const fileBuffer = fs.readFileSync(absolutePath)
    const zip = await JSZip.loadAsync(fileBuffer)

    const zipFile = zip.files[fileKey]
    if (!zipFile) {
      return NextResponse.json({ error: 'Image not found in archive' }, { status: 404 })
    }

    const content = await zipFile.async('nodebuffer')

    const ext = path.extname(fileKey).toLowerCase()
    const mimeTypes: Record<string, string> = {
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.webp': 'image/webp',
    }
    const contentType = mimeTypes[ext] || 'image/jpeg'

    return new NextResponse(new Uint8Array(content), {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=86400', // cache for 1 day
      },
    })
  } catch (error) {
    console.error('Error reading comic frame:', error)
    return NextResponse.json({ error: 'Error extracting image' }, { status: 500 })
  }
}
