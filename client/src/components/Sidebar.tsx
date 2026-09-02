import { useEffect, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { ChevronDown, FileQuestion, Folder, FolderOpen, FolderPlus, MessageSquare } from 'lucide-react'
import { useDirectoryContext } from '../lib/DirectoryContext'

export type SidebarSection = 'directories' | 'chat' | 'quiz'

interface SidebarProps {
  active: SidebarSection
}

const SCOPED_ROUTE = /^\/directories\/[^/]+\/(chat|quiz)$/

export function Sidebar({ active }: SidebarProps) {
  const location = useLocation()
  const navigate = useNavigate()
  const { directories, loaded, currentDirectoryId: currentId, setCurrentDirectoryId } = useDirectoryContext()
  const currentDirectory = directories.find((d) => d.id === currentId) ?? null

  const [open, setOpen] = useState(false)
  const wrapperRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    function handleEscape(e: globalThis.KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleEscape)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [])

  function handleSelect(id: string) {
    setCurrentDirectoryId(id)
    setOpen(false)
    const scopedMatch = location.pathname.match(SCOPED_ROUTE)
    if (scopedMatch) {
      navigate(`/directories/${id}/${scopedMatch[1]}`)
    }
  }

  const links: { section: SidebarSection; label: string; icon: typeof Folder; to: string | null }[] = [
    { section: 'directories', label: 'Directories', icon: Folder, to: '/directories' },
    { section: 'chat', label: 'Chat', icon: MessageSquare, to: currentId ? `/directories/${currentId}/chat` : null },
    { section: 'quiz', label: 'Quiz', icon: FileQuestion, to: currentId ? `/directories/${currentId}/quiz` : null },
  ]

  return (
    <nav className="hidden w-64 shrink-0 flex-col gap-4 border-r border-border bg-bg px-4 py-6 sm:flex">
      <div ref={wrapperRef} className="relative">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-haspopup="listbox"
          title={currentDirectory?.name}
          className="flex w-full items-center justify-between gap-2 rounded-btn px-2 py-1 text-left transition-colors duration-150 ease-out hover:bg-surface"
        >
          <span className="min-w-0">
            <span className="block font-mono text-xs uppercase tracking-wide text-text-muted">Current topic</span>
            {currentDirectory ? (
              <span className="mt-1 flex items-center gap-2 font-serif text-lg text-text">
                <FolderOpen size={18} strokeWidth={1.75} className="shrink-0 text-accent" aria-hidden="true" />
                <span className="truncate">{currentDirectory.name}</span>
              </span>
            ) : (
              <span className="mt-1 block text-sm text-text-muted">Select a topic</span>
            )}
          </span>
          <ChevronDown
            size={16}
            strokeWidth={1.75}
            className={`shrink-0 text-text-muted transition-transform duration-150 ease-out ${open ? 'rotate-180' : ''}`}
            aria-hidden="true"
          />
        </button>

        {open && (
          <ul
            role="listbox"
            className="absolute left-0 right-0 z-20 mt-1 max-h-64 overflow-y-auto rounded-card border border-border bg-surface p-1 shadow-[0_4px_12px_rgba(0,0,0,0.08)]"
          >
            {!loaded ? (
              <li className="px-3 py-2 text-sm text-text-muted">Loading…</li>
            ) : directories.length === 0 ? (
              <li className="px-3 py-2 text-sm text-text-muted">No topics yet</li>
            ) : (
              directories.map((d) => (
                <li key={d.id} role="option" aria-selected={d.id === currentId}>
                  <button
                    type="button"
                    title={d.name}
                    onClick={() => handleSelect(d.id)}
                    className={`flex w-full items-center truncate rounded-btn px-3 py-2 text-left text-sm transition-colors duration-150 ease-out hover:bg-bg ${
                      d.id === currentId ? 'font-medium text-accent' : 'text-text'
                    }`}
                  >
                    <span className="truncate">{d.name}</span>
                  </button>
                </li>
              ))
            )}
          </ul>
        )}
      </div>

      <Link
        to="/directories"
        className="inline-flex items-center justify-center gap-1.5 rounded-btn bg-accent px-4 py-2 text-sm font-medium text-accent-contrast transition-opacity duration-150 ease-out hover:opacity-90"
      >
        <FolderPlus size={16} strokeWidth={1.75} aria-hidden="true" />
        New topic
      </Link>

      <ul className="flex flex-col gap-1">
        {links.map(({ section, label, icon: Icon, to }) => {
          const isActive = section === active
          if (!to) {
            return (
              <li key={section}>
                <span className="flex cursor-not-allowed items-center gap-3 rounded-btn px-3 py-2 text-sm text-text-muted opacity-50">
                  <Icon size={18} strokeWidth={1.75} aria-hidden="true" />
                  {label}
                </span>
              </li>
            )
          }
          return (
            <li key={section}>
              <Link
                to={to}
                aria-current={isActive}
                className={`flex items-center gap-3 rounded-btn px-3 py-2 text-sm transition-colors duration-150 ease-out ${
                  isActive
                    ? 'border-r-2 border-accent font-semibold text-accent'
                    : 'text-text-muted hover:bg-surface hover:text-text'
                }`}
              >
                <Icon size={18} strokeWidth={1.75} aria-hidden="true" />
                {label}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
