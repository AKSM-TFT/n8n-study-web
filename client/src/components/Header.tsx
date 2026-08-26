import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { ThemeToggle } from './ThemeToggle'

interface HeaderProps {
  action?: ReactNode
}

export function Header({ action }: HeaderProps) {
  return (
    <header className="flex items-center justify-between border-b border-border px-6 py-4 sm:px-10">
      <Link to="/" className="font-serif text-lg text-text">
        Study Assistant
      </Link>
      <div className="flex items-center gap-3">
        {action}
        <ThemeToggle />
      </div>
    </header>
  )
}
