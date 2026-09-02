import { randomUUID } from 'node:crypto'
import { Router, type RequestHandler } from 'express'
import multer from 'multer'
import { supabaseAdmin } from '../lib/supabase'

interface DirectoryParams {
  directoryId: string
}

interface FileParams extends DirectoryParams {
  fileId: string
}

const router = Router({ mergeParams: true })
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 20 * 1024 * 1024 } })

async function assertOwnsDirectory(userId: string | undefined, directoryId: string) {
  const { data, error } = await supabaseAdmin
    .from('directories')
    .select('id')
    .eq('id', directoryId)
    .eq('user_id', userId)
    .maybeSingle()

  if (error) throw error
  return Boolean(data)
}

function sanitizeFilename(name: string) {
  return name.replace(/[/\\]/g, '_').replace(/\.\./g, '_')
}

const listFiles: RequestHandler<DirectoryParams> = async (req, res) => {
  const { directoryId } = req.params

  const owns = await assertOwnsDirectory(req.userId, directoryId).catch((e) => {
    res.status(500).json({ error: e.message })
    return null
  })
  if (owns === null) return
  if (!owns) {
    res.status(404).json({ error: 'Directory not found' })
    return
  }

  const { data, error } = await supabaseAdmin
    .from('files')
    .select('*')
    .eq('directory_id', directoryId)
    .order('created_at', { ascending: false })

  if (error) {
    res.status(500).json({ error: error.message })
    return
  }

  res.json(data)
}

const createFile: RequestHandler<DirectoryParams> = async (req, res) => {
  const { directoryId } = req.params
  const file = req.file

  if (!file) {
    res.status(400).json({ error: 'file is required' })
    return
  }

  const owns = await assertOwnsDirectory(req.userId, directoryId).catch((e) => {
    res.status(500).json({ error: e.message })
    return null
  })
  if (owns === null) return
  if (!owns) {
    res.status(404).json({ error: 'Directory not found' })
    return
  }

  const fileId = randomUUID()
  const storagePath = `${req.userId}/${directoryId}/${fileId}-${sanitizeFilename(file.originalname)}`

  const { error: uploadError } = await supabaseAdmin.storage
    .from('topic-files')
    .upload(storagePath, file.buffer, { contentType: file.mimetype })

  if (uploadError) {
    res.status(500).json({ error: uploadError.message })
    return
  }

  const { data, error: insertError } = await supabaseAdmin
    .from('files')
    .insert({
      id: fileId,
      directory_id: directoryId,
      storage_path: storagePath,
      original_name: file.originalname,
      mime_type: file.mimetype,
      status: 'pending',
    })
    .select()
    .single()

  if (insertError) {
    await supabaseAdmin.storage.from('topic-files').remove([storagePath])
    res.status(500).json({ error: insertError.message })
    return
  }

  res.status(201).json(data)
}

const deleteFile: RequestHandler<FileParams> = async (req, res) => {
  const { directoryId, fileId } = req.params

  const owns = await assertOwnsDirectory(req.userId, directoryId).catch((e) => {
    res.status(500).json({ error: e.message })
    return null
  })
  if (owns === null) return
  if (!owns) {
    res.status(404).json({ error: 'Directory not found' })
    return
  }

  const { data: fileRow, error: findError } = await supabaseAdmin
    .from('files')
    .select('storage_path')
    .eq('id', fileId)
    .eq('directory_id', directoryId)
    .maybeSingle()

  if (findError) {
    res.status(500).json({ error: findError.message })
    return
  }
  if (!fileRow) {
    res.status(404).json({ error: 'File not found' })
    return
  }

  const { error: removeError } = await supabaseAdmin.storage
    .from('topic-files')
    .remove([fileRow.storage_path])

  if (removeError) {
    res.status(500).json({ error: removeError.message })
    return
  }

  const { error: deleteError } = await supabaseAdmin
    .from('files')
    .delete()
    .eq('id', fileId)
    .eq('directory_id', directoryId)

  if (deleteError) {
    res.status(500).json({ error: deleteError.message })
    return
  }

  res.status(204).send()
}

router.get('/', listFiles)
router.post('/', upload.single('file'))
router.post('/', createFile)
router.delete('/:fileId', deleteFile)

export default router
