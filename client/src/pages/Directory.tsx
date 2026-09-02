import { useEffect, useState, type ChangeEvent, type DragEvent, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import {
  FileQuestion,
  FileText,
  FolderPlus,
  Image as ImageIcon,
  MessageSquare,
  Trash2,
  UploadCloud,
} from 'lucide-react'
import { AppShell } from '../components/AppShell'
import { Button } from '../components/Button'
import { StatusBadge } from '../components/Badge'
import { formatRelativeTime } from '../lib/format'
import { createDirectory, deleteDirectory, deleteFile, listFiles, uploadFile } from '../lib/api'
import { useDirectoryContext } from '../lib/DirectoryContext'
import type { DirectoryFile } from '../types/directory'

function FileTypeIcon({ mimeType }: { mimeType: string }) {
  if (mimeType === 'application/pdf') return <FileText size={18} strokeWidth={1.75} aria-hidden="true" />
  if (mimeType.startsWith('image/')) return <ImageIcon size={18} strokeWidth={1.75} aria-hidden="true" />
  return <FileText size={18} strokeWidth={1.75} aria-hidden="true" />
}

export default function Directory() {
  const { directories, loaded, directoriesError, currentDirectoryId, addDirectory, removeDirectory, updateDirectoryFileCount } =
    useDirectoryContext()
  const loadingDirectories = !loaded
  // Which directory's files are shown/managed in this page's right-hand panel — a purely
  // local view, independent of the app-wide "current topic" (set only via the sidebar
  // dropdown, or by landing on a Chat/Quiz page). Seeded once from the current topic so the
  // page opens on something useful, but never written back to it afterward.
  const [viewedId, setViewedId] = useState<string | null>(() => currentDirectoryId)
  const [files, setFiles] = useState<DirectoryFile[]>([])
  const [filesOwnerId, setFilesOwnerId] = useState<string | null>(null)
  const loadingFiles = viewedId !== null && filesOwnerId !== viewedId

  const [creating, setCreating] = useState(false)
  const [newName, setNewName] = useState('')
  const [confirmingDeleteId, setConfirmingDeleteId] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const displayError = error ?? directoriesError

  useEffect(() => {
    if (!viewedId) return
    let cancelled = false
    listFiles(viewedId)
      .then((data) => {
        if (cancelled) return
        setFiles(data)
        setFilesOwnerId(viewedId)
      })
      .catch((e) => {
        if (!cancelled) setError(e.message)
      })
    return () => {
      cancelled = true
    }
  }, [viewedId])

  const selectedDirectory = directories.find((d) => d.id === viewedId) ?? null

  function selectDirectory(id: string) {
    if (id === viewedId) return
    setViewedId(id)
    setFiles([])
  }

  async function handleCreate(e: FormEvent) {
    e.preventDefault()
    const name = newName.trim()
    if (!name) return
    try {
      const directory = await createDirectory(name)
      addDirectory(directory)
      setNewName('')
      setCreating(false)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to create directory.')
    }
  }

  async function handleDelete(id: string) {
    try {
      await deleteDirectory(id)
      removeDirectory(id)
      if (viewedId === id) {
        setViewedId(null)
        setFiles([])
      }
      setConfirmingDeleteId(null)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to delete directory.')
    }
  }

  async function uploadSelectedFile(file: File) {
    if (!viewedId) return
    setUploading(true)
    try {
      const uploaded = await uploadFile(viewedId, file)
      setFiles((prev) => [uploaded, ...prev])
      updateDirectoryFileCount(viewedId, 1)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to upload file.')
    } finally {
      setUploading(false)
    }
  }

  function handleFileInput(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (file) uploadSelectedFile(file)
  }

  function handleDrop(e: DragEvent<HTMLLabelElement>) {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files?.[0]
    if (file) uploadSelectedFile(file)
  }

  async function handleDeleteFile(fileId: string) {
    if (!viewedId) return
    try {
      await deleteFile(viewedId, fileId)
      setFiles((prev) => prev.filter((f) => f.id !== fileId))
      updateDirectoryFileCount(viewedId, -1)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to delete file.')
    }
  }

  return (
    <AppShell active="directories">
      <div className="grid h-full sm:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]">
        <section className="flex flex-col gap-4 overflow-y-auto border-b border-border p-6 sm:border-b-0 sm:border-r sm:p-8">
          <div className="flex items-center justify-between">
            <h1 className="text-xl text-text">Your directories</h1>
            <Button variant="primary" onClick={() => setCreating((v) => !v)}>
              <FolderPlus size={16} strokeWidth={1.75} className="mr-1.5 inline" aria-hidden="true" />
              New directory
            </Button>
          </div>

          {displayError && (
            <p role="alert" className="rounded-btn border border-danger bg-danger/10 px-3 py-2 text-sm text-danger">
              {displayError}
            </p>
          )}

          {creating && (
            <form onSubmit={handleCreate} className="flex gap-2">
              <input
                autoFocus
                type="text"
                placeholder="Directory name"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="flex-1 rounded-btn border border-border bg-surface px-3 py-2 text-sm text-text focus:border-accent focus:outline focus:outline-2 focus:outline-offset-1 focus:outline-accent/25"
              />
              <Button variant="primary" type="submit">
                Create
              </Button>
              <Button variant="secondary" type="button" onClick={() => setCreating(false)}>
                Cancel
              </Button>
            </form>
          )}

          {loadingDirectories ? (
            <p className="text-sm text-text-muted">Loading directories…</p>
          ) : (
            directories.length === 0 &&
            !creating && (
              <p className="text-sm text-text-muted">
                A directory only contains files. Create one to get started.
              </p>
            )
          )}

          <ul className="flex flex-col gap-3">
            {directories.map((directory) => (
              <li
                key={directory.id}
                role="button"
                tabIndex={0}
                aria-current={directory.id === viewedId}
                onClick={() => selectDirectory(directory.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    selectDirectory(directory.id)
                  }
                }}
                className={`cursor-pointer rounded-card border bg-surface p-4 transition-colors duration-150 ease-out focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${
                  directory.id === viewedId ? 'border-accent' : 'border-border hover:border-accent'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h2 className="truncate font-serif text-lg text-text" title={directory.name}>
                      {directory.name}
                    </h2>
                    <p className="mt-1 text-sm text-text-muted">
                      {directory.file_count} {directory.file_count === 1 ? 'file' : 'files'}
                    </p>
                  </div>

                  {confirmingDeleteId === directory.id ? (
                    <div className="flex shrink-0 gap-2" onClick={(e) => e.stopPropagation()}>
                      <Button variant="danger" onClick={() => handleDelete(directory.id)}>
                        Confirm delete
                      </Button>
                      <Button variant="tertiary" onClick={() => setConfirmingDeleteId(null)}>
                        Cancel
                      </Button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        setConfirmingDeleteId(directory.id)
                      }}
                      className="shrink-0 rounded-btn text-text-muted transition-colors duration-150 ease-out hover:text-danger focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                      aria-label={`Delete ${directory.name}`}
                    >
                      <Trash2 size={16} strokeWidth={1.75} />
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section className="flex flex-col overflow-y-auto">
          {!selectedDirectory ? (
            <p className="p-8 text-sm text-text-muted">Select a directory to see its files.</p>
          ) : (
            <>
              <div className="border-b border-border px-6 py-6 sm:px-8">
                <p className="font-mono text-xs uppercase tracking-wide text-text-muted">Directory</p>
                <div className="mt-1 flex flex-wrap items-center justify-between gap-3">
                  <h2 className="truncate font-serif text-2xl text-text" title={selectedDirectory.name}>
                    {selectedDirectory.name}
                  </h2>
                  <div className="flex gap-2">
                    <Link
                      to={`/directories/${selectedDirectory.id}/chat`}
                      className="inline-flex items-center gap-1.5 rounded-btn border border-border px-4 py-2 text-sm font-medium text-text transition-colors duration-150 ease-out hover:border-accent"
                    >
                      <MessageSquare size={16} strokeWidth={1.75} aria-hidden="true" />
                      Chat
                    </Link>
                    <Link
                      to={`/directories/${selectedDirectory.id}/quiz`}
                      className="inline-flex items-center gap-1.5 rounded-btn border border-border px-4 py-2 text-sm font-medium text-text transition-colors duration-150 ease-out hover:border-accent"
                    >
                      <FileQuestion size={16} strokeWidth={1.75} aria-hidden="true" />
                      Quiz
                    </Link>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-6 p-6 sm:p-8">
                <label
                  onDragOver={(e) => {
                    e.preventDefault()
                    setDragOver(true)
                  }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={handleDrop}
                  className={`flex cursor-pointer flex-col items-center gap-2 rounded-card border border-dashed p-8 text-center transition-colors duration-150 ease-out ${
                    dragOver ? 'border-accent bg-accent/5' : 'border-border bg-surface hover:bg-accent/5'
                  }`}
                >
                  <span className="flex h-12 w-12 items-center justify-center rounded-full border border-border bg-bg text-text-muted">
                    <UploadCloud size={20} strokeWidth={1.75} aria-hidden="true" />
                  </span>
                  <h3 className="font-serif text-lg text-text">Drop your material here</h3>
                  <p className="text-sm text-text-muted">PDFs and images, one at a time</p>
                  <span className="text-sm text-accent underline">Browse files</span>
                  <input
                    type="file"
                    accept="application/pdf,image/*"
                    onChange={handleFileInput}
                    disabled={uploading}
                    aria-label="Upload a file"
                    className="sr-only"
                  />
                </label>
                {uploading && <p className="text-sm text-text-muted">Uploading…</p>}

                {loadingFiles ? (
                  <p className="text-sm text-text-muted">Loading files…</p>
                ) : files.length === 0 ? (
                  <p className="text-sm text-text-muted">
                    No files yet. Upload a PDF or image to get started.
                  </p>
                ) : (
                  <ul className="flex flex-col overflow-hidden rounded-card border border-border">
                    {files.map((file, i) => (
                      <li
                        key={file.id}
                        className={`flex items-center justify-between gap-3 bg-surface p-4 transition-colors duration-150 ease-out hover:bg-bg ${
                          i !== files.length - 1 ? 'border-b border-border' : ''
                        }`}
                      >
                        <div className="flex min-w-0 items-center gap-4">
                          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-btn bg-border/40 text-text-muted">
                            <FileTypeIcon mimeType={file.mime_type} />
                          </span>
                          <div className="min-w-0">
                            <p className="truncate text-sm text-text">{file.original_name}</p>
                            <p className="text-xs text-text-muted">
                              Added {formatRelativeTime(file.created_at)}
                            </p>
                          </div>
                        </div>
                        <div className="flex shrink-0 items-center gap-3">
                          <StatusBadge status={file.status} />
                          <button
                            type="button"
                            onClick={() => handleDeleteFile(file.id)}
                            className="rounded-btn text-text-muted transition-colors duration-150 ease-out hover:text-danger focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                            aria-label={`Delete ${file.original_name}`}
                          >
                            <Trash2 size={16} strokeWidth={1.75} />
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </>
          )}
        </section>
      </div>
    </AppShell>
  )
}
