import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { createParseRouter } from './routes/parse.js';
import { createAsrRouter } from './routes/asr.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// API routes (AI parse + ASR, no DB)
app.use('/api', createParseRouter());
app.use('/api/asr', createAsrRouter());

// Static files (production)
const staticPath = path.resolve(__dirname, '..', 'dist', 'public');
app.use(express.static(staticPath));
app.get('/{*path}', (_req, res) => {
  res.sendFile(path.join(staticPath, 'index.html'));
});

const port = process.env.PORT || 3001;
app.listen(port, () => {
  console.log(`[Server] http://localhost:${port}`);
  console.log(`[API] POST /api/parse, POST /api/asr/recognize`);
});
