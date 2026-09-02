import type { ReactNode } from 'react'
import { LogOut } from 'lucide-react'
import { Header } from './Header'
import { Button } from './Button'
import { Sidebar, type SidebarSection } from './Sidebar'
import { supabase } from '../lib/supabase'

interface AppShellProps {
  active: SidebarSection
  children: ReactNode
}

export function AppShell({ active, children }: AppShellProps) {
  return (
    <div className="flex h-screen flex-col bg-bg">
      <Header
        action={
          <Button variant="tertiary" onClick={() => supabase.auth.signOut()}>
            <LogOut size={16} strokeWidth={1.75} className="mr-1.5 inline" aria-hidden="true" />
            Log out
          </Button>
        }
      />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar active={active} />
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  )
}
