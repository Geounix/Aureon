# 🌌 Aureon

**Aureon** es una plataforma Media Server privada, programada en Next.js 16 (App Router) + Prisma + PostgreSQL.
Unifica en una solemne y elegante interfaz web (inspirada en dark-glassmorphism) el mundo audiovisual y literario.

![Hero Showcase](.gemini/antigravity/brain/186b295c-566f-4520-8b68-00e5a2979935/sprint3_screenshots_1775759239035.webp)

## 📌 Características Principales

1. **Escáner Iterativo Integrado:** Carga tus Cómics, Series y Películas. El panel administrador indexa recursivamente desde un directorio de tu OS y lo levanta a Prisma.
2. **Reproductor Global Multi-Threading:**
   - **Video:** Reproductor HLS integrado y nativo con Range Requests para Video Streaming Directo. Guarda tu posición. Soporte VTT/SRT.
   - **Música:** MiniPlayer flotante con Howler.js, escucha FLAC puro mientras navegas en Cómics.
   - **Cómics (CBZ/CBR Reader):** Novedoso motor `jszip` On-The-Fly. Un lector Next.js inmersivo, atajos de pantalla táctil y buffer rápido de imágenes, guardando y sincando qué página estabas viendo.
3. **Múltiples Perfiles (Watchlists):** Autenticación local mediante API Routes Proxy de NextAuth y PostgreSQL. Agrega listas de visualización y progreso por cuenta.
4. **Diseño de Clase Mundial:** CSS Vanilla combinado con Tailwind. Efectos Glassmorphism, Micro-Interacciones `framer-motion-less` e indexado `SSR` rapidísimo gracias a **React Server Components**.

---

## 🛠️ Stack Tecnológico

- **Frontend:** Next.js 16 (App Router), React 18, TailwindCSS.
- **Backend Analytics:** Next.js API Routes (`/api/stream/*`), Next JS Middleware (Proxy Interceptor).
- **Audio & Video Engine:** React-Howler + HLS.js + Range HTTP Headers 206 (fs streams) + JSZip para buffer.
- **ORM & BD:** Prisma v7 con Adaptador nativo o local a PostgreSQL (v15+).

---

## 🚀 Inicio Rápido (Local)

1. Clona el repo y navega hacia la carpeta raíz.
   ```bash
   git clone <repo-url>
   cd aureon
   ```
2. Instala dependencias forzando legacy-peers debido al Next-Auth beta con Next14/15:
   ```bash
   npm install --legacy-peer-deps
   ```
3. Configura tu `.env` conectándolo a PostgreSQL:
   ```env
   DATABASE_URL="postgres://postgres:admin@localhost:5432/Aureon?schema=public"
   NEXTAUTH_SECRET="your-strong-random-secret"
   NEXTAUTH_URL="http://localhost:3000"
   ```
4. Sincroniza y pobla la Data Inicial (Sembrar el usuario Admin):
   ```bash
   npx prisma migrate dev
   npx prisma generate
   npm run seed
   ```
5. Prende los motores:
   ```bash
   npm run dev
   ```

Toda magia pasa dentro de **Aureon**. Ve a `http://localhost:3000` e inicia sesión con el Admin creado por el bot de Prisma.

> Desarrollado con dedicación como el hogar definitivo de tus medios.
