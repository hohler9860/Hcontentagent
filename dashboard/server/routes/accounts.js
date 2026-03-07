import { Router } from 'express';
import db from '../db.js';

const router = Router();

// GET /api/accounts — list all accounts
router.get('/', (req, res) => {
  const { tier, platform, active } = req.query;
  let sql = 'SELECT * FROM accounts WHERE 1=1';
  const params = [];

  if (tier) { sql += ' AND tier = ?'; params.push(tier); }
  if (platform) { sql += ' AND platform = ?'; params.push(platform); }
  if (active !== undefined) { sql += ' AND active = ?'; params.push(Number(active)); }

  sql += ' ORDER BY tier, handle';
  res.json(db.prepare(sql).all(...params));
});

// GET /api/accounts/:id
router.get('/:id', (req, res) => {
  const account = db.prepare('SELECT * FROM accounts WHERE id = ?').get(req.params.id);
  if (!account) return res.status(404).json({ error: 'Account not found' });
  res.json(account);
});

// GET /api/accounts/handle/:handle
router.get('/handle/:handle', (req, res) => {
  const account = db.prepare('SELECT * FROM accounts WHERE handle = ?').get(req.params.handle);
  if (!account) return res.status(404).json({ error: 'Account not found' });
  res.json(account);
});

// POST /api/accounts — create account
router.post('/', (req, res) => {
  const { handle, platform = 'instagram', tier = 'ecosystem', display_name, bio, style_notes, why_tracking } = req.body;
  if (!handle) return res.status(400).json({ error: 'handle is required' });

  try {
    const result = db.prepare(
      `INSERT INTO accounts (handle, platform, tier, display_name, bio, style_notes, why_tracking)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    ).run(handle, platform, tier, display_name || handle, bio, style_notes, why_tracking);
    res.json({ id: result.lastInsertRowid, handle });
  } catch (e) {
    if (e.message.includes('UNIQUE')) return res.status(409).json({ error: 'Account already exists' });
    throw e;
  }
});

// PUT /api/accounts/:id — update account
router.put('/:id', (req, res) => {
  const { handle, platform, tier, display_name, bio, style_notes, why_tracking, active } = req.body;
  const fields = [];
  const params = [];

  if (handle !== undefined) { fields.push('handle = ?'); params.push(handle); }
  if (platform !== undefined) { fields.push('platform = ?'); params.push(platform); }
  if (tier !== undefined) { fields.push('tier = ?'); params.push(tier); }
  if (display_name !== undefined) { fields.push('display_name = ?'); params.push(display_name); }
  if (bio !== undefined) { fields.push('bio = ?'); params.push(bio); }
  if (style_notes !== undefined) { fields.push('style_notes = ?'); params.push(style_notes); }
  if (why_tracking !== undefined) { fields.push('why_tracking = ?'); params.push(why_tracking); }
  if (active !== undefined) { fields.push('active = ?'); params.push(Number(active)); }

  if (fields.length === 0) return res.status(400).json({ error: 'No fields to update' });

  fields.push("updated_at = datetime('now')");
  params.push(req.params.id);

  db.prepare(`UPDATE accounts SET ${fields.join(', ')} WHERE id = ?`).run(...params);
  res.json(db.prepare('SELECT * FROM accounts WHERE id = ?').get(req.params.id));
});

// DELETE /api/accounts/:id
router.delete('/:id', (req, res) => {
  db.prepare('DELETE FROM accounts WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

export default router;
