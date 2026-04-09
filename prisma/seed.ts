import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

async function main() {
  console.log('🌱 Seeding Aureon database...')

  // Admin user
  const hashedPassword = await bcrypt.hash('admin123', 12)

  const admin = await prisma.user.upsert({
    where: { email: 'admin@aureon.local' },
    update: {},
    create: {
      email: 'admin@aureon.local',
      password: hashedPassword,
      name: 'Administrador',
      role: 'ADMIN',
      profiles: {
        create: {
          name: 'Admin',
          avatarUrl: null,
        },
      },
    },
  })

  // Demo user
  const userPassword = await bcrypt.hash('user123', 12)
  const demoUser = await prisma.user.upsert({
    where: { email: 'demo@aureon.local' },
    update: {},
    create: {
      email: 'demo@aureon.local',
      password: userPassword,
      name: 'Usuario Demo',
      role: 'USER',
      profiles: {
        create: {
          name: 'Demo',
          avatarUrl: null,
        },
      },
    },
  })

  // Libraries
  const movieLib = await prisma.library.upsert({
    where: { id: 'lib-movies' },
    update: {},
    create: {
      id: 'lib-movies',
      name: 'Películas',
      type: 'MOVIE',
      path: 'C:/Aureon/media/movies',
    },
  })

  const seriesLib = await prisma.library.upsert({
    where: { id: 'lib-series' },
    update: {},
    create: {
      id: 'lib-series',
      name: 'Series',
      type: 'SERIES',
      path: 'C:/Aureon/media/series',
    },
  })

  const musicLib = await prisma.library.upsert({
    where: { id: 'lib-music' },
    update: {},
    create: {
      id: 'lib-music',
      name: 'Música',
      type: 'MUSIC',
      path: 'C:/Aureon/media/music',
    },
  })

  const comicsLib = await prisma.library.upsert({
    where: { id: 'lib-comics' },
    update: {},
    create: {
      id: 'lib-comics',
      name: 'Cómics',
      type: 'COMICS',
      path: 'C:/Aureon/media/comics',
    },
  })

  // Genres
  const genres = [
    'Acción', 'Aventura', 'Comedia', 'Drama', 'Terror',
    'Ciencia Ficción', 'Fantasía', 'Romance', 'Thriller',
    'Animación', 'Documental', 'Crimen', 'Misterio',
  ]

  for (const name of genres) {
    await prisma.genre.upsert({
      where: { name },
      update: {},
      create: { name },
    })
  }

  // Sample movie
  const actionGenre = await prisma.genre.findUnique({ where: { name: 'Acción' } })
  const scifiGenre = await prisma.genre.findUnique({ where: { name: 'Ciencia Ficción' } })

  const movie1 = await prisma.mediaItem.upsert({
    where: { id: 'media-demo-1' },
    update: {},
    create: {
      id: 'media-demo-1',
      libraryId: movieLib.id,
      type: 'MOVIE',
      title: 'Demo: La Gran Película',
      originalTitle: 'Demo: The Great Movie',
      synopsis: 'Una película de demostración para mostrar las capacidades de Aureon. Esta es la descripción larga que aparece en la vista de detalle del título.',
      year: 2024,
      duration: 7200,
      rating: 'PG-13',
      country: 'US',
      language: 'es',
      quality: '1080p',
      filePath: null,
      genres: actionGenre && scifiGenre ? {
        create: [
          { genreId: actionGenre.id },
          { genreId: scifiGenre.id },
        ]
      } : undefined,
    },
  })

  // Sample artist + album + tracks
  const artist1 = await prisma.artist.upsert({
    where: { id: 'artist-demo-1' },
    update: {},
    create: {
      id: 'artist-demo-1',
      name: 'Artista Demo',
      bio: 'Un artista de demostración para Aureon.',
      country: 'ES',
    },
  })

  const album1 = await prisma.album.upsert({
    where: { id: 'album-demo-1' },
    update: {},
    create: {
      id: 'album-demo-1',
      artistId: artist1.id,
      libraryId: musicLib.id,
      title: 'Álbum Demo',
      year: 2024,
      genre: 'Pop',
    },
  })

  for (let i = 1; i <= 5; i++) {
    await prisma.musicTrack.upsert({
      where: { id: `track-demo-${i}` },
      update: {},
      create: {
        id: `track-demo-${i}`,
        albumId: album1.id,
        title: `Canción ${i} - Demo`,
        trackNumber: i,
        duration: 180 + (i * 30),
        filePath: `C:/Aureon/media/music/demo/track${i}.mp3`,
      },
    })
  }

  // Sample comic series
  const comicSeries = await prisma.comicSeries.upsert({
    where: { id: 'comic-demo-1' },
    update: {},
    create: {
      id: 'comic-demo-1',
      libraryId: comicsLib.id,
      title: 'Cómic Demo',
      author: 'Autor Demo',
      publisher: 'Editorial Demo',
      synopsis: 'Una serie de cómic de demostración.',
      genre: 'Aventura',
      language: 'es',
    },
  })

  const volume1 = await prisma.comicVolume.upsert({
    where: { id: 'vol-demo-1' },
    update: {},
    create: {
      id: 'vol-demo-1',
      seriesId: comicSeries.id,
      number: 1,
      title: 'Volumen 1',
    },
  })

  await prisma.comicChapter.upsert({
    where: { id: 'ch-demo-1' },
    update: {},
    create: {
      id: 'ch-demo-1',
      volumeId: volume1.id,
      number: 1,
      title: 'Capítulo 1: El Comienzo',
      filePath: 'C:/Aureon/media/comics/demo/chapter1.cbz',
      pageCount: 24,
    },
  })

  console.log('✅ Seed completado!')
  console.log(`   👤 Admin: admin@aureon.local / admin123`)
  console.log(`   👤 Demo:  demo@aureon.local / user123`)
  console.log(`   📁 Bibliotecas: ${movieLib.name}, ${seriesLib.name}, ${musicLib.name}, ${comicsLib.name}`)
  console.log(`   🎬 Películas: 1 demo`)
  console.log(`   🎵 Música: 1 artista, 1 álbum, 5 canciones`)
  console.log(`   📚 Cómics: 1 serie demo`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
