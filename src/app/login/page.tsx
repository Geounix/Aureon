'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import Link from 'next/link'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
    })

    setLoading(false)

    if (result?.error) {
      setError('Credenciales incorrectas. Por favor intenta nuevamente.')
    } else {
      router.push('/')
      router.refresh()
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{
        background: 'radial-gradient(ellipse at 30% 50%, rgba(124, 107, 255, 0.08) 0%, transparent 60%), var(--bg-primary)',
      }}
    >
      {/* Background orbs */}
      <div
        className="fixed top-20 left-20 w-72 h-72 rounded-full blur-[100px] pointer-events-none"
        style={{ background: 'rgba(124, 107, 255, 0.06)' }}
      />
      <div
        className="fixed bottom-20 right-20 w-72 h-72 rounded-full blur-[100px] pointer-events-none"
        style={{ background: 'rgba(59, 130, 246, 0.05)' }}
      />

      <div className="w-full max-w-sm relative z-10">
        {/* Logo */}
        <div className="text-center mb-10">
          <h1 className="font-display text-4xl font-bold text-gradient mb-2">Aureon</h1>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            Tu universo multimedia
          </p>
        </div>

        {/* Card */}
        <div
          className="rounded-2xl p-8"
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            boxShadow: 'var(--shadow-lg)',
          }}
        >
          <h2
            className="font-display text-xl font-semibold mb-6"
            style={{ color: 'var(--text-primary)' }}
          >
            Iniciar sesión
          </h2>

          {error && (
            <div
              className="mb-4 px-4 py-3 rounded-lg text-sm"
              style={{
                background: 'rgba(244, 63, 94, 0.1)',
                border: '1px solid rgba(244, 63, 94, 0.3)',
                color: 'var(--accent-rose)',
              }}
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="login-email"
                className="block text-xs font-medium mb-1.5"
                style={{ color: 'var(--text-secondary)' }}
              >
                Correo electrónico
              </label>
              <input
                id="login-email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@email.com"
                required
                className="input-base"
              />
            </div>

            <div>
              <label
                htmlFor="login-password"
                className="block text-xs font-medium mb-1.5"
                style={{ color: 'var(--text-secondary)' }}
              >
                Contraseña
              </label>
              <div className="relative">
                <input
                  id="login-password"
                  type={showPass ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="input-base pr-10"
                />
                <button
                  type="button"
                  id="toggle-password"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                  style={{ color: 'var(--text-muted)' }}
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              id="login-submit"
              type="submit"
              disabled={loading}
              className="btn-primary w-full mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Iniciando sesión...
                </>
              ) : (
                'Iniciar sesión'
              )}
            </button>
          </form>
        </div>

        {/* Demo credentials hint */}
        <div
          className="mt-4 p-4 rounded-xl text-center text-xs space-y-1"
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            color: 'var(--text-muted)',
          }}
        >
          <p className="font-medium" style={{ color: 'var(--text-secondary)' }}>Credenciales de demo</p>
          <p>Admin: <code className="px-1 rounded" style={{ background: 'var(--bg-elevated)' }}>admin@aureon.local</code> / <code className="px-1 rounded" style={{ background: 'var(--bg-elevated)' }}>admin123</code></p>
          <p>User: <code className="px-1 rounded" style={{ background: 'var(--bg-elevated)' }}>demo@aureon.local</code> / <code className="px-1 rounded" style={{ background: 'var(--bg-elevated)' }}>user123</code></p>
        </div>
      </div>
    </div>
  )
}
