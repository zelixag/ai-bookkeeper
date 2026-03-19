import { Router, type Request, type Response } from 'express';
import { parseExpenseText } from '../services/ai-parser.js';

export function createParseRouter(): Router {
  const router = Router();

  router.post('/parse', (req: Request, res: Response) => {
    const { text } = req.body as { text?: string };
    if (!text?.trim()) {
      res.status(400).json({ error: '缺少 text' });
      return;
    }

    parseExpenseText(text.trim())
      .then(parsed => res.json(parsed))
      .catch((err: Error) => res.status(500).json({ error: err.message }));
  });

  return router;
}
