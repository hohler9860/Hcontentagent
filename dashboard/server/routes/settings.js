import { Router } from 'express';
import db from '../db.js';

const router = Router();

// GET /api/settings — get all settings
router.get('/', (req, res) => {
  const rows = db.prepare('SELECT key, value FROM settings').all();
  const settings = {};
  for (const row of rows) {
    try { settings[row.key] = JSON.parse(row.value); }
    catch { settings[row.key] = row.value; }
  }
  res.json(settings);
});

// GET /api/settings/:key
router.get('/:key', (req, res) => {
  const row = db.prepare('SELECT value FROM settings WHERE key = ?').get(req.params.key);
  if (!row) return res.status(404).json({ error: 'Setting not found' });
  try { res.json({ key: req.params.key, value: JSON.parse(row.value) }); }
  catch { res.json({ key: req.params.key, value: row.value }); }
});

// PUT /api/settings — bulk update settings
router.put('/', (req, res) => {
  const upsert = db.prepare(
    `INSERT INTO settings (key, value, updated_at) VALUES (?, ?, datetime('now'))
     ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at`
  );

  const updateMany = db.transaction((entries) => {
    for (const [key, value] of entries) {
      const val = typeof value === 'string' ? value : JSON.stringify(value);
      upsert.run(key, val);
    }
  });

  updateMany(Object.entries(req.body));
  res.json({ success: true });
});

// PUT /api/settings/:key
router.put('/:key', (req, res) => {
  const { value } = req.body;
  const val = typeof value === 'string' ? value : JSON.stringify(value);
  db.prepare(
    `INSERT INTO settings (key, value, updated_at) VALUES (?, ?, datetime('now'))
     ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at`
  ).run(req.params.key, val);
  res.json({ key: req.params.key, value });
});

export default router;
