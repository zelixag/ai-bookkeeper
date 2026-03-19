import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.resolve(__dirname, '..', '.env') })
import express from 'express'
import cors from 'cors'
import { createParseRouter } from './routes/parse.js'

const app = express()
app.use(cors())
app.use(express.json())
app.use('/api', createParseRouter())

const port = process.env.PORT || 3001
app.listen(port, () => {
  console.log(`[Server] http://localhost:${port}`)
})
