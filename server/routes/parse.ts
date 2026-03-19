import { Router } from 'express'
import type { Request, Response } from 'express'
import { parseText } from '../services/ai.js'

export function createParseRouter(): Router {
  const router = Router()

  router.post('/parse', (req: Request, res: Response) => {
    const { text } = req.body as { text?: string }
    if (!text?.trim()) {
      res.status(400).json({ error: '缺少 text' })
      return
    }

    parseText(text.trim())
      .then((parsed) => res.json(parsed))
      .catch((err: Error) => res.status(500).json({ error: err.message }))
  })

  return router
}
