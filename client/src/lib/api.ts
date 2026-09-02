import { getAccessToken } from './supabase'
import type { Directory, DirectoryFile } from '../types/directory'
import type { Quiz } from '../types/quiz'

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3001'

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = await getAccessToken()
  const isForm = init.body instanceof FormData
  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      ...(isForm ? {} : { 'Content-Type': 'application/json' }),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init.headers,
    },
  })
  if (!res.ok) {
    const body = await res.json().catch(() => null)
    throw new Error(body?.error ?? `Request failed (${res.status})`)
  }
  if (res.status === 204) return undefined as T
  return res.json()
}

export const listDirectories = () => request<Directory[]>('/directories')

export const createDirectory = (name: string) =>
  request<Directory>('/directories', { method: 'POST', body: JSON.stringify({ name }) })

export const deleteDirectory = (id: string) =>
  request<void>(`/directories/${id}`, { method: 'DELETE' })

export const listFiles = (directoryId: string) =>
  request<DirectoryFile[]>(`/directories/${directoryId}/files`)

export const uploadFile = (directoryId: string, file: File) => {
  const form = new FormData()
  form.append('file', file)
  return request<DirectoryFile>(`/directories/${directoryId}/files`, { method: 'POST', body: form })
}

export const deleteFile = (directoryId: string, fileId: string) =>
  request<void>(`/directories/${directoryId}/files/${fileId}`, { method: 'DELETE' })

export const sendChatMessage = (directoryId: string, message: string) =>
  request<{ reply: string }>(`/directories/${directoryId}/chat`, {
    method: 'POST',
    body: JSON.stringify({ message }),
  })

export const generateQuiz = (directoryId: string) =>
  request<Quiz>(`/directories/${directoryId}/quiz`, { method: 'POST' })
