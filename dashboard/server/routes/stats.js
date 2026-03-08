import { Router } from 'express';
import db from '../db.js';

const router = Router();

// GET /api/stats/overview — dashboard quick stats
router.get('/overview', (req, res) => {
  const totalAccounts = db.prepare('SELECT COUNT(*) as count FROM accounts WHERE active = 1').get().count;
  const totalPosts = db.prepare('SELECT COUNT(*) as count FROM posts').get().count;
  const postsThisWeek = db.prepare(
    "SELECT COUNT(*) as count FROM posts WHERE timestamp > datetime('now', '-7 days')"
  ).get().count;
  const winnersThisWeek = db.prepare(
    "SELECT COUNT(*) as count FROM winners_log WHERE detected_at > datetime('now', '-7 days')"
  ).get().count;
  const lastScrape = db.prepare(
    'SELECT completed_at FROM scrape_runs WHERE status = ? ORDER BY completed_at DESC LIMIT 1'
  ).get('completed');
  const scriptsReady = db.prepare("SELECT COUNT(*) as count FROM scripts WHERE status = 'draft'").get().count;
  const pipelineByStatus = db.prepare(
    'SELECT status, COUNT(*) as count FROM pipeline_items GROUP BY status'
  ).all();

  const pipeline = {};
  for (const row of pipelineByStatus) pipeline[row.status] = row.count;

  res.json({
    totalAccounts,
    totalPosts,
    postsThisWeek,
    winnersThisWeek,
    lastScrape: lastScrape?.completed_at || null,
    scriptsReady,
    pipeline,
  });
});

// GET /api/stats/account/:id — stats for a specific account
router.get('/account/:id', (req, res) => {
  const id = Number(req.params.id);
  const account = db.prepare('SELECT * FROM accounts WHERE id = ?').get(id);
  if (!account) return res.status(404).json({ error: 'Account not found' });

  const totalPosts = db.prepare('SELECT COUNT(*) as count FROM posts WHERE account_id = ?').get(id).count;
  const avgLikes = db.prepare('SELECT AVG(likes) as avg FROM posts WHERE account_id = ?').get(id).avg || 0;
  const avgViews = db.prepare('SELECT AVG(views) as avg FROM posts WHERE account_id = ?').get(id).avg || 0;
  const avgComments = db.prepare('SELECT AVG(comments) as avg FROM posts WHERE account_id = ?').get(id).avg || 0;
  const avgER = db.prepare('SELECT AVG(engagement_rate) as avg FROM posts WHERE account_id = ? AND engagement_rate IS NOT NULL').get(id).avg || 0;
  const winnerCount = db.prepare('SELECT COUNT(*) as count FROM winners_log WHERE account_id = ?').get(id).count;

  const topPosts = db.prepare(
    `SELECT * FROM posts WHERE account_id = ? AND virality_score IS NOT NULL
     ORDER BY virality_score DESC LIMIT 10`
  ).all(id);

  const pillarBreakdown = db.prepare(
    `SELECT content_pillar, COUNT(*) as count FROM posts
     WHERE account_id = ? AND content_pillar IS NOT NULL
     GROUP BY content_pillar ORDER BY count DESC`
  ).all(id);

  const hookBreakdown = db.prepare(
    `SELECT hook_type, COUNT(*) as count FROM posts
     WHERE account_id = ? AND hook_type IS NOT NULL
     GROUP BY hook_type ORDER BY count DESC`
  ).all(id);

  const recentSnapshots = db.prepare(
    'SELECT * FROM metric_snapshots WHERE account_id = ? ORDER BY snapshot_date DESC LIMIT 30'
  ).all(id);

  res.json({
    account,
    stats: { totalPosts, avgLikes: Math.round(avgLikes), avgViews: Math.round(avgViews), avgComments: Math.round(avgComments), avgER: Number(avgER.toFixed(4)), winnerCount },
    topPosts,
    pillarBreakdown,
    hookBreakdown,
    recentSnapshots,
  });
});

// GET /api/stats/insights — cross-account content analysis
router.get('/insights', (req, res) => {
  const { days = 30 } = req.query;

  // Hook performance: avg likes/views per hook_type
  const hookPerformance = db.prepare(`
    SELECT hook_type, COUNT(*) as count,
           ROUND(AVG(likes)) as avg_likes, ROUND(AVG(views)) as avg_views,
           ROUND(AVG(comments)) as avg_comments, ROUND(AVG(virality_score),1) as avg_virality,
           SUM(CASE WHEN is_winner = 1 THEN 1 ELSE 0 END) as winner_count
    FROM posts WHERE hook_type IS NOT NULL AND timestamp > datetime('now', '-' || ? || ' days')
    GROUP BY hook_type ORDER BY avg_virality DESC
  `).all(Number(days));

  // Pillar performance: avg engagement per content_pillar
  const pillarPerformance = db.prepare(`
    SELECT content_pillar, COUNT(*) as count,
           ROUND(AVG(likes)) as avg_likes, ROUND(AVG(views)) as avg_views,
           ROUND(AVG(virality_score),1) as avg_virality,
           SUM(CASE WHEN is_winner = 1 THEN 1 ELSE 0 END) as winner_count
    FROM posts WHERE content_pillar IS NOT NULL AND timestamp > datetime('now', '-' || ? || ' days')
    GROUP BY content_pillar ORDER BY avg_virality DESC
  `).all(Number(days));

  // Top accounts by avg virality
  const accountRankings = db.prepare(`
    SELECT a.handle, a.tier, a.followers, COUNT(p.id) as post_count,
           ROUND(AVG(p.virality_score),1) as avg_virality, ROUND(AVG(p.likes)) as avg_likes,
           ROUND(AVG(p.views)) as avg_views, MAX(p.virality_score) as peak_virality,
           SUM(CASE WHEN p.is_winner = 1 THEN 1 ELSE 0 END) as winners
    FROM posts p JOIN accounts a ON p.account_id = a.id
    WHERE p.timestamp > datetime('now', '-' || ? || ' days')
    GROUP BY a.id ORDER BY avg_virality DESC
  `).all(Number(days));

  // Winning formulas: hook + pillar combos that produce winners
  const winningCombos = db.prepare(`
    SELECT hook_type, content_pillar, COUNT(*) as count,
           ROUND(AVG(virality_score),1) as avg_virality, ROUND(AVG(likes)) as avg_likes
    FROM posts WHERE is_winner = 1 AND hook_type IS NOT NULL AND content_pillar IS NOT NULL
      AND timestamp > datetime('now', '-' || ? || ' days')
    GROUP BY hook_type, content_pillar ORDER BY count DESC LIMIT 15
  `).all(Number(days));

  // Format breakdown
  const formatBreakdown = db.prepare(`
    SELECT type, COUNT(*) as count, ROUND(AVG(likes)) as avg_likes,
           ROUND(AVG(views)) as avg_views, ROUND(AVG(virality_score),1) as avg_virality
    FROM posts WHERE timestamp > datetime('now', '-' || ? || ' days')
    GROUP BY type ORDER BY avg_virality DESC
  `).all(Number(days));

  res.json({ hookPerformance, pillarPerformance, accountRankings, winningCombos, formatBreakdown });
});

export default router;
