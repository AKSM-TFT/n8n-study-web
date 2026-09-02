import 'dotenv/config'
import cors from 'cors'
import express from 'express'
import { requireAuth } from './middleware/auth'
import directoriesRouter from './routes/directories'
import filesRouter from './routes/files'

const app = express()
const port = process.env.PORT ? Number(process.env.PORT) : 3001
const clientOrigin = process.env.CLIENT_ORIGIN ?? 'http://localhost:5173'

app.use(cors({ origin: clientOrigin }))
app.use(express.json())

app.get('/health', (_req, res) => res.json({ ok: true }))

app.use('/directories', requireAuth, directoriesRouter)
app.use('/directories/:directoryId/files', requireAuth, filesRouter)

app.listen(port, () => {
  console.log(`Server listening on port ${port}`)
})
