'use client'

import { useState } from 'react'
import { Scan, CheckCircle, XCircle, Loader2 } from 'lucide-react'

interface ScanResult {
  ok: boolean
  message: string
  found: number
  added: number
  skipped: number
  errors: number
}

export function ScanButton({ libraryId, libraryName }: { libraryId: string; libraryName: string }) {
  const [scanning, setScanning] = useState(false)
  const [result, setResult] = useState<ScanResult | null>(null)

  async function handleScan() {
    setScanning(true)
    setResult(null)

    try {
      const res = await fetch(`/api/admin/libraries/${libraryId}/scan`, {
        method: 'POST',
      })
      const data = await res.json()
      setResult(data)
    } catch (e) {
      setResult({ ok: false, message: 'Error de conexión', found: 0, added: 0, skipped: 0, errors: 1 })
    } finally {
      setScanning(false)
    }
  }

  return (
    <div className="space-y-2">
      <button
        id={`scan-library-${libraryId}`}
        onClick={handleScan}
        disabled={scanning}
        className="btn-secondary flex-1 text-xs py-2 w-full disabled:opacity-50"
      >
        {scanning ? (
          <>
            <Loader2 size={13} className="animate-spin" />
            Escaneando...
          </>
        ) : (
          <>
            <Scan size={13} />
            Escanear carpeta
          </>
        )}
      </button>

      {result && (
        <div
          className="rounded-lg px-3 py-2.5 text-xs space-y-1"
          style={{
            background: result.ok ? 'rgba(16,185,129,0.08)' : 'rgba(244,63,94,0.08)',
            border: `1px solid ${result.ok ? 'rgba(16,185,129,0.25)' : 'rgba(244,63,94,0.25)'}`,
          }}
        >
          <div className="flex items-center gap-1.5 font-medium" style={{ color: result.ok ? 'var(--accent-emerald)' : 'var(--accent-rose)' }}>
            {result.ok
              ? <CheckCircle size={12} />
              : <XCircle size={12} />
            }
            {result.ok ? 'Escaneo completado' : 'Error en escaneo'}
          </div>
          <p style={{ color: 'var(--text-secondary)' }}>{result.message}</p>
          {result.ok && (
            <div className="flex gap-3 pt-0.5" style={{ color: 'var(--text-muted)' }}>
              <span>📁 {result.found} archivos</span>
              <span>✅ {result.added} añadidos</span>
              {result.skipped > 0 && <span>⏭ {result.skipped} omitidos</span>}
              {result.errors > 0 && <span style={{ color: 'var(--accent-rose)' }}>❌ {result.errors} errores</span>}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
