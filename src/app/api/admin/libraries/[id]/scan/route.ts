import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import fs from 'fs'
import path from 'path'

// Supported extensions
const VIDEO_EXT = ['.mp4', '.mkv', '.avi', '.mov', '.webm', '.m4v', '.ts']
const AUDIO_EXT = ['.mp3', '.flac', '.m4a', '.ogg', '.wav', '.aac', '.opus']
const COMIC_EXT = ['.cbz', '.cbr', '.pdf', '.epub']

function walkDir(dir: string, exts: string[]): string[] {
  if (!fs.existsSync(dir)) return []
  const results: string[] = []

  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true })
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name)
      if (entry.isDirectory()) {
        results.push(...walkDir(fullPath, exts))
      } else if (exts.includes(path.extname(entry.name).toLowerCase())) {
        results.push(fullPath)
      }
    }
  } catch (e) {
    // Skip inaccessible directories
  }

  return results
}

function extractTitleYear(filename: string): { title: string; year?: number } {
  const name = path.basename(filename, path.extname(filename))
  // Try to extract year from common filename patterns like "Movie.Name.2023" or "Movie Name (2023)"
  const yearMatch = name.match(/[\s.(_]([12]\d{3})[\s.)_]?/)
  const year = yearMatch ? parseInt(yearMatch[1]) : undefined

  let title = name
    .replace(/[\s.(_]?[12]\d{3}[\s.)_]?.*$/, '') // Remove year and everything after
    .replace(/[._]/g, ' ')                         // Replace dots/underscores with spaces
    .replace(/\s+/g, ' ')                          // Normalize spaces
    .trim()

  if (!title) title = name.replace(/[._]/g, ' ').trim()

  // Capitalize first letter of each word
  title = title.replace(/\b\w/g, (c) => c.toUpperCase())

  return { title, year }
}

function getFileSizeMB(filePath: string): number {
  try {
    return Math.round(fs.statSync(filePath).size / 1024 / 1024)
  } catch {
    return 0
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Check admin
  const user = await prisma.user.findUnique({ where: { id: session.user.id } })
  if (user?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { id } = await params
  const library = await prisma.library.findUnique({ where: { id } })
  if (!library) {
    return NextResponse.json({ error: 'Library not found' }, { status: 404 })
  }

  const results = { found: 0, added: 0, skipped: 0, errors: 0 }

  try {
    if (library.type === 'MOVIE' || library.type === 'SERIES') {
      const files = walkDir(library.path, VIDEO_EXT)
      results.found = files.length

      for (const filePath of files) {
        const { title, year } = extractTitleYear(filePath)
        const fileSize = BigInt(fs.statSync(filePath).size)

        // Check if already exists
        const existing = await prisma.mediaItem.findFirst({
          where: { filePath },
        })

        if (existing) {
          results.skipped++
          continue
        }

        try {
          await prisma.mediaItem.create({
            data: {
              libraryId: library.id,
              type: library.type === 'SERIES' ? 'SERIES' : 'MOVIE',
              title,
              year,
              filePath,
              fileSize,
            },
          })
          results.added++
        } catch (e) {
          results.errors++
        }
      }
    }

    if (library.type === 'MUSIC') {
      const files = walkDir(library.path, AUDIO_EXT)
      results.found = files.length

      for (const filePath of files) {
        const existing = await prisma.musicTrack.findFirst({ where: { filePath } })
        if (existing) { results.skipped++; continue }

        const filename = path.basename(filePath, path.extname(filePath))
        const parts = filename.split(' - ')
        const trackTitle = parts.length >= 2 ? parts.slice(1).join(' - ').trim() : filename
        const artistName = parts.length >= 2 ? parts[0].trim() : 'Artista desconocido'
        const albumName = path.basename(path.dirname(filePath))

        try {
          // Find or create artist
          let artist = await prisma.artist.findFirst({ where: { name: artistName } })
          if (!artist) {
            artist = await prisma.artist.create({ data: { name: artistName } })
          }

          // Find or create album
          let album = await prisma.album.findFirst({
            where: { title: albumName, artistId: artist.id },
          })
          if (!album) {
            album = await prisma.album.create({
              data: { title: albumName, artistId: artist.id, libraryId: library.id },
            })
          }

          await prisma.musicTrack.create({
            data: { albumId: album.id, title: trackTitle, filePath },
          })
          results.added++
        } catch (e) {
          results.errors++
        }
      }
    }

    if (library.type === 'COMICS') {
      const files = walkDir(library.path, COMIC_EXT)
      results.found = files.length

      for (const filePath of files) {
        const existing = await prisma.comicChapter.findFirst({ where: { filePath } })
        if (existing) { results.skipped++; continue }

        const filename = path.basename(filePath, path.extname(filePath))
        const seriesName = path.basename(path.dirname(filePath))

        try {
          // Find or create series
          let series = await prisma.comicSeries.findFirst({
            where: { title: seriesName, libraryId: library.id },
          })
          if (!series) {
            series = await prisma.comicSeries.create({
              data: { title: seriesName, libraryId: library.id, tags: [] },
            })
          }

          // Find or create volume
          let volume = await prisma.comicVolume.findFirst({
            where: { seriesId: series.id, number: 1 },
          })
          if (!volume) {
            volume = await prisma.comicVolume.create({
              data: { seriesId: series.id, number: 1 },
            })
          }

          // Extract chapter number from filename
          const numMatch = filename.match(/(\d+(?:\.\d+)?)/);
          const chNum = numMatch ? parseFloat(numMatch[1]) : results.added + 1

          await prisma.comicChapter.create({
            data: {
              volumeId: volume.id,
              number: chNum,
              title: filename,
              filePath,
            },
          })
          results.added++
        } catch (e) {
          results.errors++
        }
      }
    }

    // Update lastScanned
    await prisma.library.update({
      where: { id },
      data: { lastScanned: new Date() },
    })

    return NextResponse.json({
      ok: true,
      library: library.name,
      type: library.type,
      ...results,
      message: `Escaneado: ${results.found} encontrados, ${results.added} añadidos, ${results.skipped} ya existían, ${results.errors} errores.`,
    })
  } catch (err) {
    return NextResponse.json(
      { error: 'Error durante el escaneo', detail: String(err) },
      { status: 500 }
    )
  }
}
