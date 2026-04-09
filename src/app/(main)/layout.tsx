import { Sidebar } from '@/components/layout/sidebar'
import { MiniPlayer } from '@/components/layout/mini-player'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()
  if (!session) redirect('/login')

  return (
    <div className="page-with-sidebar">
      <Sidebar />
      <main className="main-content">
        {children}
      </main>
      <MiniPlayer />
    </div>
  )
}
