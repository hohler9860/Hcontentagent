import { Router } from 'express';
import db from '../db.js';
import { scoreNewPosts } from '../scoring/engine.js';

const router = Router();

// POST /api/scores/run — score unscored posts
router.post('/run', (req, res) => {
  try {
    const result = scoreNewPosts();
    res.json(result);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// GET /api/scores/leaderboard — top posts by virality
router.get('/leaderboard', (req, res) => {
  const { days = 7, limit = 20 } = req.query;
  const posts = db.prepare(
    `SELECT p.*, a.handle, a.display_name, a.tier
     FROM posts p
     JOIN accounts a ON p.account_id = a.id
     WHERE p.timestamp > datetime('now', '-' || ? || ' days')
       AND p.virality_score IS NOT NULL
     ORDER BY p.virality_score DESC
     LIMIT ?`
  ).all(Number(days), Number(limit));
  res.json(posts);
});

// GET /api/scores/winners — detected winners
router.get('/winners', (req, res) => {
  const { days = 7, limit = 50 } = req.query;
  const winners = db.prepare(
    `SELECT w.*, p.caption, p.url, p.likes, p.views, p.virality_score,
            a.handle, a.display_name, a.tier
     FROM winners_log w
     JOIN posts p ON w.post_id = p.id
     JOIN accounts a ON w.account_id = a.id
     WHERE w.detected_at > datetime('now', '-' || ? || ' days')
     ORDER BY w.detected_at DESC
     LIMIT ?`
  ).all(Number(days), Number(limit));
  res.json(winners);
});

export default router;
