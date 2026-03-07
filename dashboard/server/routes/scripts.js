import { Router } from 'express';
import db from '../db.js';

const router = Router();

// GET /api/scripts
router.get('/', (req, res) => {
  const { status, limit = 50 } = req.query;
  let sql = 'SELECT * FROM scripts WHERE 1=1';
  const params = [];

  if (status) { sql += ' AND status = ?'; params.push(status); }
  sql += ' ORDER BY created_at DESC LIMIT ?';
  params.push(Number(limit));

  res.json(db.prepare(sql).all(...params));
});

// GET /api/scripts/:id
router.get('/:id', (req, res) => {
  const script = db.prepare('SELECT * FROM scripts WHERE id = ?').get(req.params.id);
  if (!script) return res.status(404).json({ error: 'Script not found' });
  res.json(script);
});

// POST /api/scripts
router.post('/', (req, res) => {
  const { title, platform, status = 'draft', source, source_post_id, body } = req.body;
  if (!title) return res.status(400).json({ error: 'title is required' });

  const wordCount = body ? body.split(/\s+/).length : 0;
  const duration = Math.round(wordCount / 2.5); // ~150 wpm speaking

  const result = db.prepare(
    `INSERT INTO scripts (title, platform, status, source, source_post_id, body, word_count, duration_estimate)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(title, platform, status, source, source_post_id, body, wordCount, duration);
  res.json(db.prepare('SELECT * FROM scripts WHERE id = ?').get(result.lastInsertRowid));
});

// PUT /api/scripts/:id
router.put('/:id', (req, res) => {
  const { title, platform, status, source, body } = req.body;
  const fields = [];
  const params = [];

  if (title !== undefined) { fields.push('title = ?'); params.push(title); }
  if (platform !== undefined) { fields.push('platform = ?'); params.push(platform); }
  if (status !== undefined) { fields.push('status = ?'); params.push(status); }
  if (source !== undefined) { fields.push('source = ?'); params.push(source); }
  if (body !== undefined) {
    fields.push('body = ?'); params.push(body);
    const wc = body.split(/\s+/).length;
    fields.push('word_count = ?'); params.push(wc);
    fields.push('duration_estimate = ?'); params.push(Math.round(wc / 2.5));
  }

  if (fields.length === 0) return res.status(400).json({ error: 'No fields to update' });

  fields.push("updated_at = datetime('now')");
  params.push(req.params.id);

  db.prepare(`UPDATE scripts SET ${fields.join(', ')} WHERE id = ?`).run(...params);
  res.json(db.prepare('SELECT * FROM scripts WHERE id = ?').get(req.params.id));
});

// DELETE /api/scripts/:id
router.delete('/:id', (req, res) => {
  db.prepare('DELETE FROM scripts WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

export default router;
