import express from 'express';
import cors from 'cors';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import db from './db.js';

// Import routes
import accountsRouter from './routes/accounts.js';
import postsRouter from './routes/posts.js';
import scrapeRouter from './routes/scrape.js';
import scoresRouter from './routes/scores.js';
import pipelineRouter from './routes/pipeline.js';
import scriptsRouter from './routes/scripts.js';
import settingsRouter from './routes/settings.js';
import statsRouter from './routes/stats.js';
import remixRouter from './routes/remix.js';

// Import scheduler (starts cron jobs)
import './scraper/scheduler.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.SERVER_PORT || 3001;

app.use(cors({ origin: ['http://localhost:5173', 'http://localhost:4173'] }));
app.use(express.json());

// API routes
app.use('/api/accounts', accountsRouter);
app.use('/api/posts', postsRouter);
app.use('/api/scrape', scrapeRouter);
app.use('/api/scores', scoresRouter);
app.use('/api/pipeline', pipelineRouter);
app.use('/api/scripts', scriptsRouter);
app.use('/api/settings', settingsRouter);
app.use('/api/stats', statsRouter);
app.use('/api/remix', remixRouter);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
