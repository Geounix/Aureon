import { config } from 'dotenv'
config()

import { prisma } from '../src/lib/prisma'
import path from 'path'
import fs from 'fs'

async function main() {
  const filePath = path.join(process.cwd(), 'media', 'movies', 'Trailer.mp4')
  
  if (!fs.existsSync(filePath)) {
    console.error('Trailer file not found at:', filePath)
    return
  }

  // 1. Ensure a "Movies" library exists
  let library = await prisma.library.findFirst({
    where: { type: 'MOVIE' }
  })

  // create if not exists
  if (!library) {
    library = await prisma.library.create({
      data: {
        name: 'Películas Locales',
        folderPath: path.join(process.cwd(), 'media', 'movies'),
        type: 'MOVIE'
      }
    })
  }

  // 2. Check if trailer already in DB
  const existing = await prisma.mediaItem.findFirst({
    where: { filePath }
  })

  if (!existing) {
    const stat = fs.statSync(filePath)
    
    // Create MediaItem
    const item = await prisma.mediaItem.create({
      data: {
        libraryId: library.id,
        title: 'Demo Trailer',
        originalTitle: 'Official Trailer',
        type: 'MOVIE',
        filePath: filePath,
        fileSize: BigInt(stat.size),
        duration: 210, // dummy minutes/seconds
        year: new Date().getFullYear(),
        synopsis: 'Este es el tráiler subido para probar el reproductor multimedia HLS y el streaming nativo local.',
        backdropUrl: 'https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?q=80&w=2070&auto=format&fit=crop',
        posterUrl: 'https://images.unsplash.com/photo-1542204165-65bf26472b9b?q=80&w=1974&auto=format&fit=crop',
      }
    })
    console.log('✅ Trailer insertado con ID:', item.id)
  } else {
    console.log('✅ Trailer ya existía en la BD con ID:', existing.id)
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
