import { Router } from 'express';
import db from '../db.js';

const router = Router();

// GET /api/pipeline — get all pipeline items grouped by status
router.get('/', (req, res) => {
  const items = db.prepare('SELECT * FROM pipeline_items ORDER BY sort_order, created_at').all();
  const grouped = { ideas: [], writing: [], review: [], scheduled: [], published: [] };
  for (const item of items) {
    if (grouped[item.status]) grouped[item.status].push(item);
  }
  res.json(grouped);
});

// POST /api/pipeline — create pipeline item
router.post('/', (req, res) => {
  const { title, platform, status = 'ideas', date, source, notes, script } = req.body;
  if (!title) return res.status(400).json({ error: 'title is required' });

  const result = db.prepare(
    `INSERT INTO pipeline_items (title, platform, status, date, source, notes, script)
     VALUES (?, ?, ?, ?, ?, ?, ?)`
  ).run(title, platform, status, date, source, notes, script);
  res.json(db.prepare('SELECT * FROM pipeline_items WHERE id = ?').get(result.lastInsertRowid));
});

// PUT /api/pipeline/:id — update pipeline item
router.put('/:id', (req, res) => {
  const { title, platform, status, date, source, notes, script, sort_order } = req.body;
  const fields = [];
  const params = [];

  if (title !== undefined) { fields.push('title = ?'); params.push(title); }
  if (platform !== undefined) { fields.push('platform = ?'); params.push(platform); }
  if (status !== undefined) { fields.push('status = ?'); params.push(status); }
  if (date !== undefined) { fields.push('date = ?'); params.push(date); }
  if (source !== undefined) { fields.push('source = ?'); params.push(source); }
  if (notes !== undefined) { fields.push('notes = ?'); params.push(notes); }
  if (script !== undefined) { fields.push('script = ?'); params.push(script); }
  if (sort_order !== undefined) { fields.push('sort_order = ?'); params.push(sort_order); }

  if (fields.length === 0) return res.status(400).json({ error: 'No fields to update' });

  fields.push("updated_at = datetime('now')");
  params.push(req.params.id);

  db.prepare(`UPDATE pipeline_items SET ${fields.join(', ')} WHERE id = ?`).run(...params);
  res.json(db.prepare('SELECT * FROM pipeline_items WHERE id = ?').get(req.params.id));
});

// DELETE /api/pipeline/:id
router.delete('/:id', (req, res) => {
  db.prepare('DELETE FROM pipeline_items WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

export default router;
