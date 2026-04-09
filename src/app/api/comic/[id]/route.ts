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

  try {
    const chapter = await prisma.comicChapter.findUnique({
      where: { id },
      include: {
        volume: {
          include: {
            series: true,
          },
        },
      },
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

    // Read zip
    const fileBuffer = fs.readFileSync(absolutePath)
    const zip = await JSZip.loadAsync(fileBuffer)

    // Filter image files (png, jpg, jpeg, webp)
    const imageExtensions = ['.png', '.jpg', '.jpeg', '.webp']
    const pages = Object.keys(zip.files)
      .filter((filename) => {
        const ext = path.extname(filename).toLowerCase()
        return imageExtensions.includes(ext) && !filename.startsWith('__MACOSX') && !filename.includes('/.')
      })
      .sort((a, b) => {
        // Natural sort for page numbers
        return a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' })
      })

    return NextResponse.json({
      id: chapter.id,
      title: chapter.title,
      number: chapter.number,
      series: chapter.volume.series.title,
      volume: chapter.volume.number,
      totalPages: pages.length,
      pageFiles: pages, // We send the internal zip paths to the client to request individually
    })
  } catch (error) {
    console.error('Error reading comic:', error)
    return NextResponse.json({ error: 'Error processing comic file' }, { status: 500 })
  }
}
