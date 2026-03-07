import db from '../db.js';

function getWeights() {
  const rows = db.prepare("SELECT key, value FROM settings WHERE key LIKE 'scoring_weight_%'").all();
  const w = { er: 0.30, volume: 0.20, velocity: 0.25, crossplatform: 0.10, comment_ratio: 0.15 };
  for (const row of rows) {
    const key = row.key.replace('scoring_weight_', '');
    w[key] = Number(row.value);
  }
  return w;
}

function getThresholds() {
  const rows = db.prepare("SELECT key, value FROM settings WHERE key LIKE 'winner_threshold_%'").all();
  const t = { er_multiplier: 3.0, virality: 75, views_multiplier: 5.0, comment_ratio_multiplier: 2.0, top_percentile: 0.05 };
  for (const row of rows) {
    const key = row.key.replace('winner_threshold_', '');
    t[key] = Number(row.value);
  }
  return t;
}

export function calculateEngagementRate(post) {
  const followers = db.prepare('SELECT followers FROM accounts WHERE id = ?').get(post.account_id)?.followers || 1;
  const interactions = (post.likes || 0) + (post.comments || 0) + (post.shares || 0) + (post.saves || 0);
  return interactions / Math.max(followers, 1);
}

export function calculateViralityScore(post) {
  const weights = getWeights();
  const accountId = post.account_id;

  // Get account averages (30-day)
  const avgs = db.prepare(
    `SELECT AVG(likes) as avg_likes, AVG(views) as avg_views, AVG(comments) as avg_comments,
            AVG(engagement_rate) as avg_er, COUNT(*) as post_count
     FROM posts WHERE account_id = ? AND timestamp > datetime('now', '-30 days')`
  ).get(accountId);

  if (!avgs || avgs.post_count < 2) {
    // Not enough data — use raw metrics for a basic score
    const rawScore = Math.min(100, ((post.views || 0) / 10000) * 50 + ((post.likes || 0) / 1000) * 30);
    return Math.round(rawScore);
  }

  // ER percentile score (0-100)
  const er = calculateEngagementRate(post);
  const erRatio = avgs.avg_er > 0 ? er / avgs.avg_er : 1;
  const erScore = Math.min(100, erRatio * 33);

  // Volume score
  const viewRatio = avgs.avg_views > 0 ? (post.views || 0) / avgs.avg_views : 1;
  const volumeScore = Math.min(100, viewRatio * 25);

  // Velocity: how fast did engagement accumulate? (approximate via recency + volume)
  const ageHours = (Date.now() - new Date(post.timestamp).getTime()) / (1000 * 60 * 60);
  const velocityRaw = ageHours > 0 ? ((post.likes || 0) + (post.comments || 0)) / ageHours : 0;
  const avgVelocity = avgs.post_count > 0 ? ((avgs.avg_likes || 0) + (avgs.avg_comments || 0)) / 48 : 1; // assume 48h avg age
  const velocityScore = Math.min(100, avgVelocity > 0 ? (velocityRaw / avgVelocity) * 33 : 50);

  // Cross-platform (placeholder: check if similar content exists on other platforms)
  const crossPlatformScore = 50; // Default mid-score; real implementation needs multi-platform matching

  // Comment ratio
  const commentRatio = (post.likes || 1) > 0 ? (post.comments || 0) / (post.likes || 1) : 0;
  const avgCommentRatio = (avgs.avg_likes || 1) > 0 ? (avgs.avg_comments || 0) / (avgs.avg_likes || 1) : 0;
  const commentScore = Math.min(100, avgCommentRatio > 0 ? (commentRatio / avgCommentRatio) * 33 : 50);

  const score = (
    erScore * weights.er +
    volumeScore * weights.volume +
    velocityScore * weights.velocity +
    crossPlatformScore * weights.crossplatform +
    commentScore * weights.comment_ratio
  );

  return Math.round(Math.min(100, Math.max(0, score)));
}

export function detectWinner(post) {
  const thresholds = getThresholds();
  const accountId = post.account_id;
  const reasons = [];

  const avgs = db.prepare(
    `SELECT AVG(likes) as avg_likes, AVG(views) as avg_views, AVG(comments) as avg_comments,
            AVG(engagement_rate) as avg_er, COUNT(*) as post_count
     FROM posts WHERE account_id = ? AND timestamp > datetime('now', '-30 days') AND id != ?`
  ).get(accountId, post.id);

  if (!avgs || avgs.post_count < 2) return { isWinner: false, reasons: [] };

  // 1. ER > threshold × account 30-day avg
  const er = post.engagement_rate || calculateEngagementRate(post);
  if (avgs.avg_er > 0 && er > thresholds.er_multiplier * avgs.avg_er) {
    reasons.push(`ER ${(er * 100).toFixed(2)}% > ${thresholds.er_multiplier}× avg ${(avgs.avg_er * 100).toFixed(2)}%`);
  }

  // 2. Virality > threshold
  if ((post.virality_score || 0) > thresholds.virality) {
    reasons.push(`Virality ${post.virality_score} > ${thresholds.virality}`);
  }

  // 3. Views > threshold × account avg
  if (avgs.avg_views > 0 && (post.views || 0) > thresholds.views_multiplier * avgs.avg_views) {
    reasons.push(`Views ${post.views} > ${thresholds.views_multiplier}× avg ${Math.round(avgs.avg_views)}`);
  }

  // 4. Comment:like ratio > threshold × avg
  const commentRatio = (post.likes || 1) > 0 ? (post.comments || 0) / (post.likes || 1) : 0;
  const avgCommentRatio = (avgs.avg_likes || 1) > 0 ? (avgs.avg_comments || 0) / (avgs.avg_likes || 1) : 0;
  if (avgCommentRatio > 0 && commentRatio > thresholds.comment_ratio_multiplier * avgCommentRatio) {
    reasons.push(`Comment ratio ${commentRatio.toFixed(3)} > ${thresholds.comment_ratio_multiplier}× avg`);
  }

  // 5. Top percentile of all posts in 7 days
  const threshold7d = db.prepare(
    `SELECT virality_score FROM posts
     WHERE timestamp > datetime('now', '-7 days') AND virality_score IS NOT NULL
     ORDER BY virality_score DESC
     LIMIT 1 OFFSET (SELECT CAST(COUNT(*) * ? AS INTEGER) FROM posts
                      WHERE timestamp > datetime('now', '-7 days') AND virality_score IS NOT NULL)`
  ).get(thresholds.top_percentile);

  if (threshold7d && (post.virality_score || 0) >= threshold7d.virality_score) {
    reasons.push(`Top ${thresholds.top_percentile * 100}% of all posts (7d)`);
  }

  return { isWinner: reasons.length > 0, reasons };
}

export function scoreNewPosts() {
  const unscored = db.prepare(
    'SELECT * FROM posts WHERE virality_score IS NULL'
  ).all();

  let scored = 0;
  let winners = 0;

  const updatePost = db.prepare(
    'UPDATE posts SET engagement_rate = ?, virality_score = ?, is_winner = ? WHERE id = ?'
  );
  const insertWinner = db.prepare(
    `INSERT INTO winners_log (post_id, account_id, trigger_reason, virality_score)
     VALUES (?, ?, ?, ?)`
  );

  const batch = db.transaction(() => {
    for (const post of unscored) {
      const er = calculateEngagementRate(post);
      const virality = calculateViralityScore(post);

      // Update post with scores first
      updatePost.run(er, virality, 0, post.id);
      post.engagement_rate = er;
      post.virality_score = virality;
      scored++;

      // Check for winner
      const { isWinner, reasons } = detectWinner(post);
      if (isWinner) {
        updatePost.run(er, virality, 1, post.id);
        insertWinner.run(post.id, post.account_id, reasons.join('; '), virality);
        winners++;
      }
    }
  });

  batch();
  return { scored, winners, total: unscored.length };
}
