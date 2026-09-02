export interface Directory {
  id: string
  name: string
  created_at: string
  updated_at: string
  file_count: number
}

export type FileStatus = 'pending' | 'processing' | 'processed' | 'failed'

export interface DirectoryFile {
  id: string
  directory_id: string
  storage_path: string
  original_name: string
  mime_type: string
  status: FileStatus
  created_at: string
}
