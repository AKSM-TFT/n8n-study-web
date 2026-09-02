import { Router } from 'express'
import { supabaseAdmin } from '../lib/supabase'

const router = Router()

router.get('/', async (req, res) => {
  const { data, error } = await supabaseAdmin
    .from('directories')
    .select('*, files(count)')
    .eq('user_id', req.userId)
    .order('created_at', { ascending: false })

  if (error) {
    res.status(500).json({ error: error.message })
    return
  }

  const directories = data.map((row) => {
    const { files, ...rest } = row as typeof row & { files: { count: number }[] }
    return { ...rest, file_count: files[0]?.count ?? 0 }
  })

  res.json(directories)
})

router.post('/', async (req, res) => {
  const name = typeof req.body?.name === 'string' ? req.body.name.trim() : ''
  if (!name) {
    res.status(400).json({ error: 'name is required' })
    return
  }

  const { data, error } = await supabaseAdmin
    .from('directories')
    .insert({ user_id: req.userId, name })
    .select()
    .single()

  if (error) {
    res.status(500).json({ error: error.message })
    return
  }

  res.status(201).json({ ...data, file_count: 0 })
})

router.delete('/:id', async (req, res) => {
  const { id } = req.params

  const { data: directory, error: findError } = await supabaseAdmin
    .from('directories')
    .select('id')
    .eq('id', id)
    .eq('user_id', req.userId)
    .maybeSingle()

  if (findError) {
    res.status(500).json({ error: findError.message })
    return
  }
  if (!directory) {
    res.status(404).json({ error: 'Directory not found' })
    return
  }

  const prefix = `${req.userId}/${id}`
  const { data: objects, error: listError } = await supabaseAdmin.storage
    .from('topic-files')
    .list(prefix)

  if (listError) {
    res.status(500).json({ error: listError.message })
    return
  }

  if (objects && objects.length > 0) {
    const paths = objects.map((o) => `${prefix}/${o.name}`)
    const { error: removeError } = await supabaseAdmin.storage.from('topic-files').remove(paths)
    if (removeError) {
      res.status(500).json({ error: removeError.message })
      return
    }
  }

  const { error: deleteError } = await supabaseAdmin
    .from('directories')
    .delete()
    .eq('id', id)
    .eq('user_id', req.userId)

  if (deleteError) {
    res.status(500).json({ error: deleteError.message })
    return
  }

  res.status(204).send()
})

export default router
