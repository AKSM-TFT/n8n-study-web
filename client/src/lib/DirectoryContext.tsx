import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { listDirectories } from './api'
import type { Directory } from '../types/directory'

const CURRENT_KEY = 'study-assistant:current-directory-id'

interface DirectoryContextValue {
  directories: Directory[]
  loaded: boolean
  directoriesError: string | null
  currentDirectoryId: string | null
  setCurrentDirectoryId: (id: string | null) => void
  addDirectory: (directory: Directory) => void
  removeDirectory: (id: string) => void
  updateDirectoryFileCount: (id: string, delta: number) => void
}

const DirectoryContext = createContext<DirectoryContextValue | null>(null)

export function DirectoryProvider({ children }: { children: ReactNode }) {
  const [directories, setDirectories] = useState<Directory[]>([])
  const [loaded, setLoaded] = useState(false)
  const [directoriesError, setDirectoriesError] = useState<string | null>(null)
  const [storedCurrentDirectoryId, setCurrentDirectoryIdState] = useState<string | null>(() =>
    typeof window !== 'undefined' ? localStorage.getItem(CURRENT_KEY) : null,
  )

  // Mask a persisted id that no longer refers to a directory we have (e.g. deleted
  // elsewhere) without an extra setState-in-effect — the underlying stored value is
  // simply overwritten the next time a real selection is made.
  const currentDirectoryId =
    loaded && storedCurrentDirectoryId && !directories.some((d) => d.id === storedCurrentDirectoryId)
      ? null
      : storedCurrentDirectoryId

  useEffect(() => {
    let cancelled = false
    listDirectories()
      .then((list) => {
        if (cancelled) return
        setDirectories(list)
        setLoaded(true)
      })
      .catch((e) => {
        if (cancelled) return
        setDirectoriesError(e instanceof Error ? e.message : String(e))
        setLoaded(true)
      })
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (storedCurrentDirectoryId) localStorage.setItem(CURRENT_KEY, storedCurrentDirectoryId)
    else localStorage.removeItem(CURRENT_KEY)
  }, [storedCurrentDirectoryId])

  const setCurrentDirectoryId = useCallback((id: string | null) => {
    setCurrentDirectoryIdState(id)
  }, [])

  const addDirectory = useCallback((directory: Directory) => {
    setDirectories((prev) => [directory, ...prev])
  }, [])

  const removeDirectory = useCallback((id: string) => {
    setDirectories((prev) => prev.filter((d) => d.id !== id))
    setCurrentDirectoryIdState((prev) => (prev === id ? null : prev))
  }, [])

  const updateDirectoryFileCount = useCallback((id: string, delta: number) => {
    setDirectories((prev) => prev.map((d) => (d.id === id ? { ...d, file_count: d.file_count + delta } : d)))
  }, [])

  const value = useMemo<DirectoryContextValue>(
    () => ({
      directories,
      loaded,
      directoriesError,
      currentDirectoryId,
      setCurrentDirectoryId,
      addDirectory,
      removeDirectory,
      updateDirectoryFileCount,
    }),
    [directories, loaded, directoriesError, currentDirectoryId, setCurrentDirectoryId, addDirectory, removeDirectory, updateDirectoryFileCount],
  )

  return <DirectoryContext.Provider value={value}>{children}</DirectoryContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components -- trivial context accessor kept next to its Provider
export function useDirectoryContext() {
  const ctx = useContext(DirectoryContext)
  if (!ctx) throw new Error('useDirectoryContext must be used within a DirectoryProvider')
  return ctx
}
