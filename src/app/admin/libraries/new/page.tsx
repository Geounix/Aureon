'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Sidebar } from '@/components/layout/sidebar'
import { Film, Tv, Music, BookOpen, FolderOpen, Loader2, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

const types = [
  { value: 'MOVIE', label: 'Películas', icon: Film, desc: 'Filmes, documentales, cortometrajes', color: 'var(--accent-primary)' },
  { value: 'SERIES', label: 'Series', icon: Tv, desc: 'Series de TV, anime, miniseries', color: 'var(--accent-blue)' },
  { value: 'MUSIC', label: 'Música', icon: Music, desc: 'Álbumes, canciones, podcasts', color: 'var(--accent-gold)' },
  { value: 'COMICS', label: 'Cómics', icon: BookOpen, desc: 'CBZ, CBR, manga, PDF', color: 'var(--accent-emerald)' },
]

export default function NewLibraryPage() {
  const router = useRouter()
  const [form, setForm] = useState({ name: '', type: 'MOVIE', path: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/admin/libraries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })

      if (!res.ok) {
        const data = await res.json()
        setError(data.error || 'Error al crear la biblioteca')
        return
      }

      router.push('/admin/libraries')
      router.refresh()
    } catch (e) {
      setError('Error de conexión')
    } finally {
      setLoading(false)
    }
  }

  const selectedType = types.find((t) => t.value === form.type)!

  return (
    <div className="page-with-sidebar">
      <Sidebar />
      <main className="main-content px-8 py-8 max-w-2xl">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <Link href="/admin/libraries" className="btn-icon" id="new-lib-back">
            <ArrowLeft size={16} />
          </Link>
          <div>
            <h1 className="font-display text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
              Nueva biblioteca
            </h1>
            <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>
              Conecta una carpeta con tu contenido multimedia
            </p>
          </div>
        </div>

        {error && (
          <div
            className="mb-6 px-4 py-3 rounded-xl text-sm"
            style={{
              background: 'rgba(244,63,94,0.08)',
              border: '1px solid rgba(244,63,94,0.25)',
              color: 'var(--accent-rose)',
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Type selection */}
          <div>
            <label className="block text-sm font-medium mb-3" style={{ color: 'var(--text-secondary)' }}>
              Tipo de biblioteca
            </label>
            <div className="grid grid-cols-2 gap-3">
              {types.map((type) => (
                <button
                  key={type.value}
                  type="button"
                  id={`type-${type.value.toLowerCase()}`}
                  onClick={() => setForm((f) => ({ ...f, type: type.value }))}
                  className="flex items-center gap-3 p-4 rounded-xl text-left transition-all"
                  style={{
                    background: form.type === type.value ? type.color + '15' : 'var(--bg-card)',
                    border: `1px solid ${form.type === type.value ? type.color : 'var(--border)'}`,
                  }}
                >
                  <type.icon
                    size={20}
                    style={{ color: form.type === type.value ? type.color : 'var(--text-muted)' }}
                    className="shrink-0"
                  />
                  <div className="min-w-0">
                    <p
                      className="text-sm font-semibold"
                      style={{ color: form.type === type.value ? 'var(--text-primary)' : 'var(--text-secondary)' }}
                    >
                      {type.label}
                    </p>
                    <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>
                      {type.desc}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Name */}
          <div>
            <label htmlFor="lib-name" className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
              Nombre de la biblioteca
            </label>
            <input
              id="lib-name"
              type="text"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder={`Ej: ${selectedType.label} — Principal`}
              required
              className="input-base"
            />
          </div>

          {/* Path */}
          <div>
            <label htmlFor="lib-path" className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
              Ruta de la carpeta
            </label>
            <div className="relative">
              <FolderOpen
                size={16}
                className="absolute left-4 top-1/2 -translate-y-1/2"
                style={{ color: 'var(--text-muted)' }}
              />
              <input
                id="lib-path"
                type="text"
                value={form.path}
                onChange={(e) => setForm((f) => ({ ...f, path: e.target.value }))}
                placeholder="C:/Aureon/media/movies"
                required
                className="input-base pl-10"
              />
            </div>
            <p className="text-xs mt-1.5" style={{ color: 'var(--text-muted)' }}>
              Ruta absoluta al directorio en el servidor. Usa barras normales (/) o invertidas (\\).
            </p>
          </div>

          {/* Submit */}
          <div className="flex gap-3 pt-2">
            <button
              id="new-lib-submit"
              type="submit"
              disabled={loading}
              className="btn-primary flex-1 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Creando...
                </>
              ) : (
                <>
                  <selectedType.icon size={16} />
                  Crear biblioteca {selectedType.label}
                </>
              )}
            </button>
            <Link href="/admin/libraries" className="btn-secondary" id="new-lib-cancel">
              Cancelar
            </Link>
          </div>
        </form>
      </main>
    </div>
  )
}
