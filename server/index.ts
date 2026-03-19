import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.resolve(__dirname, '..', '.env') })
import express from 'express'
import cors from 'cors'
import { createParseRouter } from './routes/parse.js'
import { createAsrRouter } from './routes/asr.js'

const app = express()
app.use(cors())
app.use(express.json({ limit: '10mb' }))
app.use('/api', createParseRouter())
app.use('/api/asr', createAsrRouter())

const port = process.env.PORT || 3001
app.listen(port, () => {
  console.log(`[Server] http://localhost:${port}`)
})
