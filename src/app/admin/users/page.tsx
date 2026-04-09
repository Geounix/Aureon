import { prisma } from '@/lib/prisma'
import { Sidebar } from '@/components/layout/sidebar'
import { Users, UserPlus, Shield, User, MoreVertical, Edit, Trash2 } from 'lucide-react'

export const metadata = { title: 'Gestión de Usuarios — Administrador' }

export default async function AdminUsersPage() {
  const users = await prisma.user.findMany({
    include: {
      profiles: true,
      _count: {
        select: { profiles: true }
      }
    },
    orderBy: { createdAt: 'desc' }
  })

  return (
    <div className="page-with-sidebar">
      <Sidebar />
      <main className="main-content px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-3xl font-bold flex items-center gap-3" style={{ color: 'var(--text-primary)' }}>
              <Users size={28} style={{ color: 'var(--accent-primary)' }} />
              Gestión de Usuarios
            </h1>
            <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
              Total: {users.length} cuenta{users.length !== 1 ? 's' : ''} registrada{users.length !== 1 ? 's' : ''}
            </p>
          </div>
          <button className="btn-primary" disabled>
            <UserPlus size={16} />
            Añadir Usuario
          </button>
        </div>

        <div className="bg-[var(--bg-card)] rounded-xl border border-[var(--border)] overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[var(--bg-elevated)] border-b border-[var(--border)]">
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">Usuario</th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">Rol</th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">Perfiles</th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">Creación</th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)] text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-[var(--bg-hover)] transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[var(--bg-elevated)] flex items-center justify-center border border-[var(--border)]">
                        <User size={18} style={{ color: 'var(--text-muted)' }} />
                      </div>
                      <div>
                        <p className="font-semibold text-sm text-[var(--text-primary)]">{user.name}</p>
                        <p className="text-xs text-[var(--text-muted)]">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`badge px-3 py-1 ${user.role === 'ADMIN' ? 'bg-[var(--accent-primary)]/20 text-[var(--accent-primary)] border border-[var(--accent-primary)]/30' : 'bg-[var(--bg-elevated)] text-[var(--text-secondary)] border border-[var(--border)]'}`}>
                      {user.role === 'ADMIN' && <Shield size={12} className="mr-1" />}
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="flex -space-x-2">
                        {user.profiles.slice(0, 3).map((p, i) => (
                          <div key={p.id} className="w-7 h-7 rounded-full bg-[var(--bg-elevated)] border-2 border-[var(--bg-card)] flex items-center justify-center text-[10px] font-bold text-[var(--text-primary)]" style={{ zIndex: 10 - i }}>
                            {p.name.charAt(0).toUpperCase()}
                          </div>
                        ))}
                      </div>
                      <span className="text-xs text-[var(--text-muted)] ml-2">{user._count.profiles} perfil(es)</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-[var(--text-secondary)]">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button className="btn-icon w-8 h-8 opacity-50 cursor-not-allowed" title="Editar">
                        <Edit size={14} />
                      </button>
                      <button className="btn-icon w-8 h-8 opacity-50 cursor-not-allowed hover:text-red-500 hover:border-red-500/50" title="Eliminar">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  )
}
