require('dotenv').config({ path: '.env' })
require('dotenv').config({ path: '.env.local', override: true })

const { PrismaClient } = require('@prisma/client')
const { PrismaPg } = require('@prisma/adapter-pg')
const { Pool } = require('pg')
const bcrypt = require('bcryptjs')

function createClient() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL })
  const adapter = new PrismaPg(pool)
  return new PrismaClient({ adapter })
}

const prisma = createClient()

async function main() {
  console.log('🌱 Seeding Aureon database...')
  console.log('   DB:', process.env.DATABASE_URL)

  const hashedPassword = await bcrypt.hash('admin123', 12)
  const userPassword = await bcrypt.hash('user123', 12)

  await prisma.user.upsert({
    where: { email: 'admin@aureon.local' },
    update: {},
    create: {
      email: 'admin@aureon.local',
      password: hashedPassword,
      name: 'Administrador',
      role: 'ADMIN',
      profiles: { create: { name: 'Admin' } },
    },
  })

  await prisma.user.upsert({
    where: { email: 'demo@aureon.local' },
    update: {},
    create: {
      email: 'demo@aureon.local',
      password: userPassword,
      name: 'Usuario Demo',
      role: 'USER',
      profiles: { create: { name: 'Demo' } },
    },
  })

  const movieLib = await prisma.library.upsert({
    where: { id: 'lib-movies' },
    update: {},
    create: { id: 'lib-movies', name: 'Películas', type: 'MOVIE', path: 'C:/Aureon/media/movies' },
  })

  await prisma.library.upsert({
    where: { id: 'lib-series' },
    update: {},
    create: { id: 'lib-series', name: 'Series', type: 'SERIES', path: 'C:/Aureon/media/series' },
  })

  const musicLib = await prisma.library.upsert({
    where: { id: 'lib-music' },
    update: {},
    create: { id: 'lib-music', name: 'Música', type: 'MUSIC', path: 'C:/Aureon/media/music' },
  })

  const comicsLib = await prisma.library.upsert({
    where: { id: 'lib-comics' },
    update: {},
    create: { id: 'lib-comics', name: 'Cómics', type: 'COMICS', path: 'C:/Aureon/media/comics' },
  })

  const genres = ['Acción','Aventura','Comedia','Drama','Terror','Ciencia Ficción','Fantasía','Romance','Thriller','Animación','Documental','Crimen','Misterio']
  for (const name of genres) {
    await prisma.genre.upsert({ where: { name }, update: {}, create: { name } })
  }

  const actionGenre = await prisma.genre.findUnique({ where: { name: 'Acción' } })
  const scifiGenre = await prisma.genre.findUnique({ where: { name: 'Ciencia Ficción' } })

  await prisma.mediaItem.upsert({
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
      genres: actionGenre && scifiGenre ? {
        create: [{ genreId: actionGenre.id }, { genreId: scifiGenre.id }]
      } : undefined,
    },
  })

  const artist1 = await prisma.artist.upsert({
    where: { id: 'artist-demo-1' },
    update: {},
    create: { id: 'artist-demo-1', name: 'Artista Demo', bio: 'Un artista de demostración.', country: 'ES' },
  })

  const album1 = await prisma.album.upsert({
    where: { id: 'album-demo-1' },
    update: {},
    create: { id: 'album-demo-1', artistId: artist1.id, libraryId: musicLib.id, title: 'Álbum Demo', year: 2024, genre: 'Pop' },
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
      tags: [],
    },
  })

  const volume1 = await prisma.comicVolume.upsert({
    where: { id: 'vol-demo-1' },
    update: {},
    create: { id: 'vol-demo-1', seriesId: comicSeries.id, number: 1, title: 'Volumen 1' },
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

  console.log('')
  console.log('✅ Seed completado!')
  console.log('   👤 Admin: admin@aureon.local / admin123')
  console.log('   👤 Demo:  demo@aureon.local / user123')
  console.log('   📁 4 bibliotecas creadas')
  console.log('   🎬 1 película demo')
  console.log('   🎵 5 canciones demo')
  console.log('   📚 1 serie cómic demo')
}

main()
  .catch((e) => { console.error('❌ Error en seed:', e); process.exit(1) })
  .finally(async () => { await prisma.$disconnect() })
