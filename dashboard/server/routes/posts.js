import { Router } from 'express';
import db from '../db.js';

const router = Router();

// GET /api/posts — list posts with filters
router.get('/', (req, res) => {
  const { account_id, handle, winner, limit = 50, offset = 0, sort = 'timestamp', order = 'desc' } = req.query;
  let sql = `SELECT p.*, a.handle, a.display_name, a.tier, a.platform as account_platform
             FROM posts p
             LEFT JOIN accounts a ON p.account_id = a.id
             WHERE 1=1`;
  const params = [];

  if (account_id) { sql += ' AND p.account_id = ?'; params.push(Number(account_id)); }
  if (handle) {
    sql += ' AND a.handle = ?'; params.push(handle);
  }
  if (winner !== undefined) { sql += ' AND p.is_winner = ?'; params.push(Number(winner)); }

  const allowedSorts = ['timestamp', 'likes', 'views', 'virality_score', 'comments', 'engagement_rate'];
  const sortCol = allowedSorts.includes(sort) ? sort : 'timestamp';
  const sortOrder = order === 'asc' ? 'ASC' : 'DESC';
  sql += ` ORDER BY p.${sortCol} ${sortOrder} LIMIT ? OFFSET ?`;
  params.push(Number(limit), Number(offset));

  const posts = db.prepare(sql).all(...params);
  const total = db.prepare(
    `SELECT COUNT(*) as count FROM posts p LEFT JOIN accounts a ON p.account_id = a.id WHERE 1=1${account_id ? ' AND p.account_id = ?' : ''}${handle ? ' AND a.handle = ?' : ''}${winner !== undefined ? ' AND p.is_winner = ?' : ''}`
  ).get(...(account_id ? [Number(account_id)] : []), ...(handle ? [handle] : []), ...(winner !== undefined ? [Number(winner)] : []));

  res.json({ posts, total: total.count });
});

// GET /api/posts/:id
router.get('/:id', (req, res) => {
  const post = db.prepare(
    `SELECT p.*, a.handle, a.display_name, a.tier
     FROM posts p LEFT JOIN accounts a ON p.account_id = a.id
     WHERE p.id = ?`
  ).get(req.params.id);
  if (!post) return res.status(404).json({ error: 'Post not found' });
  res.json(post);
});

// GET /api/posts/winners/recent — recent winners
router.get('/winners/recent', (req, res) => {
  const { days = 7, limit = 20 } = req.query;
  const posts = db.prepare(
    `SELECT p.*, a.handle, a.display_name, a.tier,
            w.trigger_reason, w.detected_at
     FROM winners_log w
     JOIN posts p ON w.post_id = p.id
     JOIN accounts a ON w.account_id = a.id
     WHERE w.detected_at > datetime('now', '-' || ? || ' days')
     ORDER BY w.detected_at DESC
     LIMIT ?`
  ).all(Number(days), Number(limit));
  res.json(posts);
});

export default router;
