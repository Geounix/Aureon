import { Sidebar } from '@/components/layout/sidebar'
import { Terminal, Copy, Download, RefreshCcw } from 'lucide-react'

export const metadata = { title: 'Logs de Sistema — Administrador' }

export default async function AdminLogsPage() {
  // Mock logs for demonstration. In a real environment, read from Winston or stdout files.
  const systemLogs = [
    { time: new Date(Date.now() - 1000 * 60).toISOString(), level: 'INFO', msg: 'System initialized and database connected.' },
    { time: new Date(Date.now() - 1000 * 55).toISOString(), level: 'INFO', msg: 'NextAuth JWT strategy active.' },
    { time: new Date(Date.now() - 1000 * 40).toISOString(), level: 'WARN', msg: 'Libraries scanner triggered without directories configuration.' },
    { time: new Date(Date.now() - 1000 * 25).toISOString(), level: 'INFO', msg: 'Starting Prisma Query Engine.' },
    { time: new Date(Date.now() - 1000 * 10).toISOString(), level: 'ERROR', msg: 'Failed to extract metadata for path: /unknown/movies/test.mp4' },
    { time: new Date().toISOString(), level: 'INFO', msg: 'User admin@test.com logged in successfully.' },
  ]

  return (
    <div className="page-with-sidebar">
      <Sidebar />
      <main className="main-content px-8 py-8 flex flex-col h-screen">
        <div className="flex items-center justify-between mb-8 shrink-0">
          <div>
            <h1 className="font-display text-3xl font-bold flex items-center gap-3" style={{ color: 'var(--text-primary)' }}>
              <Terminal size={28} style={{ color: 'var(--accent-emerald)' }} />
              Logs del Servidor
            </h1>
            <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
              Registros en tiempo real del motor Aureon Console
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button className="btn-secondary py-2 px-4 shadow-md bg-[var(--bg-elevated)]" title="Copiar logs">
              <Copy size={16} />
            </button>
            <button className="btn-secondary py-2 px-4 shadow-md bg-[var(--bg-elevated)]" title="Descargar logs">
              <Download size={16} />
            </button>
            <button className="btn-primary py-2 px-4" title="Refrescar">
              <RefreshCcw size={16} />
              Refrescar
            </button>
          </div>
        </div>

        <div className="flex-1 rounded-xl border border-[var(--border)] overflow-hidden bg-black font-mono text-sm leading-relaxed p-4 flex flex-col items-start overflow-y-auto">
          {systemLogs.map((log, i) => (
            <div key={i} className="flex gap-4 py-1 hover:bg-white/5 px-2 rounded-md w-full">
              <span className="text-gray-500 shrink-0 select-none">
                [{new Date(log.time).toLocaleTimeString()}]
              </span>
              <span className={`font-bold shrink-0 w-16 ${log.level === 'INFO' ? 'text-blue-400' : log.level === 'WARN' ? 'text-yellow-400' : 'text-red-500'}`}>
                {log.level}
              </span>
              <span className="text-gray-300 break-all">
                {log.msg}
              </span>
            </div>
          ))}
          {/* Faking a cursor trail */}
          <div className="flex gap-4 py-1 px-2 mt-2 w-full">
            <span className="text-[var(--accent-emerald)] font-bold animate-pulse">_</span>
          </div>
        </div>
      </main>
    </div>
  )
}
