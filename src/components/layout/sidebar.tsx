'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut, useSession } from 'next-auth/react'
import {
  Home, Film, Tv, Music, BookOpen, Heart, Search,
  Settings, LogOut, ChevronLeft, Layers, ShieldCheck
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useState } from 'react'

const navItems = [
  { icon: Home, label: 'Inicio', href: '/' },
  { icon: Film, label: 'Películas', href: '/video' },
  { icon: Tv, label: 'Series', href: '/series' },
  { icon: Music, label: 'Música', href: '/music' },
  { icon: BookOpen, label: 'Cómics', href: '/comics' },
  { icon: Heart, label: 'Mi Lista', href: '/my-list' },
  { icon: Layers, label: 'Colecciones', href: '/collections' },
  { icon: Search, label: 'Buscar', href: '/search' },
]

export function Sidebar() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const [collapsed, setCollapsed] = useState(false)
  const isAdmin = session?.user?.role === 'ADMIN'

  return (
    <aside
      className={cn(
        'fixed top-0 left-0 h-full z-40 flex flex-col',
        'transition-all duration-300 ease-out',
        collapsed ? 'w-16' : 'w-60'
      )}
      style={{
        background: 'var(--bg-secondary)',
        borderRight: '1px solid var(--border)',
      }}
    >
      {/* Logo */}
      <div className="flex items-center justify-between px-4 py-5">
        {!collapsed && (
          <span className="font-display text-xl font-bold text-gradient">
            Aureon
          </span>
        )}
        <button
          id="sidebar-toggle"
          onClick={() => setCollapsed(!collapsed)}
          className="btn-icon ml-auto"
          aria-label="Toggle sidebar"
        >
          <ChevronLeft
            size={16}
            className={cn('transition-transform duration-300', collapsed && 'rotate-180')}
          />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-2 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn('sidebar-link', isActive && 'active')}
              title={collapsed ? item.label : undefined}
            >
              <item.icon size={18} className="shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          )
        })}

        {isAdmin && (
          <>
            <div className="my-3 border-t" style={{ borderColor: 'var(--border)' }} />
            <Link
              href="/admin"
              className={cn('sidebar-link', pathname.startsWith('/admin') && 'active')}
              title={collapsed ? 'Admin' : undefined}
            >
              <ShieldCheck size={18} className="shrink-0" />
              {!collapsed && <span>Administración</span>}
            </Link>
          </>
        )}
      </nav>

      {/* User footer */}
      <div className="px-2 py-4 border-t" style={{ borderColor: 'var(--border)' }}>
        {!collapsed && session?.user && (
          <div className="px-3 py-2 mb-2">
            <p className="text-xs font-medium truncate" style={{ color: 'var(--text-primary)' }}>
              {session.user.name}
            </p>
            <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>
              {session.user.email}
            </p>
          </div>
        )}
        <Link href="/settings" className="sidebar-link" title={collapsed ? 'Ajustes' : undefined}>
          <Settings size={18} className="shrink-0" />
          {!collapsed && <span>Ajustes</span>}
        </Link>
        <button
          id="logout-btn"
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="sidebar-link w-full text-left"
          style={{ color: 'var(--accent-rose)' }}
        >
          <LogOut size={18} className="shrink-0" />
          {!collapsed && <span>Cerrar sesión</span>}
        </button>
      </div>
    </aside>
  )
}
