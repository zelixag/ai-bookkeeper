import { Router } from 'express';
import multer from 'multer';
import { recognizeAudio } from '../services/asr.js';

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

export function createAsrRouter(): Router {
  const router = Router();

  // POST /api/asr/recognize — 上传音频文件，返回识别文字
  router.post('/recognize', upload.single('audio'), async (req, res) => {
    try {
      if (!req.file) return res.status(400).json({ error: '缺少音频文件' });

      console.log('[ASR] Received audio:', req.file.size, 'bytes', req.file.mimetype);
      const text = await recognizeAudio(req.file.buffer);
      console.log('[ASR] Result:', text);

      res.json({ text });
    } catch (err: any) {
      console.error('[ASR]', err);
      res.status(500).json({ error: err.message });
    }
  });

  return router;
}
