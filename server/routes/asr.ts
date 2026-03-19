import { Router } from 'express'
import type { Request, Response } from 'express'
import multer from 'multer'
import { recognizeAudio } from '../services/asr.js'

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
})

export function createAsrRouter(): Router {
  const router = Router()

  router.post('/recognize', upload.single('audio'), (req: Request, res: Response) => {
    if (!req.file) {
      res.status(400).json({ error: '缺少音频文件' })
      return
    }

    recognizeAudio(req.file.buffer)
      .then((text) => res.json({ text }))
      .catch((err: Error) => res.status(500).json({ error: err.message }))
  })

  return router
}
