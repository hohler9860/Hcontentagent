import { Router } from 'express';
import db from '../db.js';
import { scrapeAccounts, scrapeHashtags } from '../scraper/service.js';

const router = Router();

// POST /api/scrape/trigger — manually trigger a scrape
router.post('/trigger', async (req, res) => {
  const { tier, handles } = req.body;
  try {
    let accounts;
    if (handles && handles.length > 0) {
      const placeholders = handles.map(() => '?').join(',');
      accounts = db.prepare(`SELECT * FROM accounts WHERE handle IN (${placeholders}) AND active = 1`).all(...handles);
    } else if (tier) {
      accounts = db.prepare('SELECT * FROM accounts WHERE tier = ? AND active = 1').all(tier);
    } else {
      accounts = db.prepare('SELECT * FROM accounts WHERE active = 1').all();
    }

    const result = await scrapeAccounts(accounts);
    res.json(result);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// POST /api/scrape/hashtags — trigger hashtag scrape
router.post('/hashtags', async (req, res) => {
  try {
    const result = await scrapeHashtags();
    res.json(result);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// GET /api/scrape/runs — recent scrape runs
router.get('/runs', (req, res) => {
  const { limit = 20 } = req.query;
  const runs = db.prepare(
    'SELECT * FROM scrape_runs ORDER BY started_at DESC LIMIT ?'
  ).all(Number(limit));
  res.json(runs);
});

// GET /api/scrape/runs/:id
router.get('/runs/:id', (req, res) => {
  const run = db.prepare('SELECT * FROM scrape_runs WHERE id = ?').get(req.params.id);
  if (!run) return res.status(404).json({ error: 'Run not found' });
  res.json(run);
});

export default router;
