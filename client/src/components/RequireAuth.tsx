import type { ReactNode } from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { useSession } from '../lib/auth'
import { Header } from './Header'

export function RequireAuth({ children }: { children?: ReactNode }) {
  const { session, loading } = useSession()

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col bg-bg">
        <Header />
        <main className="flex flex-1 items-center justify-center">
          <p className="text-sm text-text-muted">Loading…</p>
        </main>
      </div>
    )
  }

  if (!session) return <Navigate to="/login" replace />

  return <>{children ?? <Outlet />}</>
}
