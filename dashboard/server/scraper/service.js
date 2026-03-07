import db from '../db.js';
import { scrapeProfiles, scrapeHashtagPosts } from './apify.js';
import { scoreNewPosts } from '../scoring/engine.js';

export async function scrapeAccounts(accounts) {
  if (!accounts || accounts.length === 0) return { scraped: 0, newPosts: 0 };

  const tier = accounts[0]?.tier || 'mixed';
  const run = db.prepare(
    `INSERT INTO scrape_runs (tier, type, accounts_scraped, status)
     VALUES (?, 'profile', ?, 'running')`
  ).run(tier, accounts.length);
  const runId = run.lastInsertRowid;

  try {
    const handles = accounts.map(a => a.handle);
    const posts = await scrapeProfiles(handles);

    const { inserted, total } = diffPosts(posts, accounts);

    // Score new posts
    const scoreResult = scoreNewPosts();

    db.prepare(
      `UPDATE scrape_runs SET posts_found = ?, new_posts = ?, winners_found = ?,
       status = 'completed', completed_at = datetime('now') WHERE id = ?`
    ).run(total, inserted, scoreResult.winners, runId);

    return { runId, scraped: handles.length, postsFound: total, newPosts: inserted, winners: scoreResult.winners };
  } catch (e) {
    db.prepare(
      `UPDATE scrape_runs SET status = 'failed', errors = ?, completed_at = datetime('now') WHERE id = ?`
    ).run(e.message, runId);
    throw e;
  }
}

export function diffPosts(scrapedPosts, accounts) {
  const accountMap = {};
  for (const a of accounts) accountMap[a.handle] = a.id;

  const insert = db.prepare(
    `INSERT OR IGNORE INTO posts (external_id, account_id, platform, type, caption, timestamp,
     likes, comments, views, plays, display_url, url, is_pinned)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  );

  let inserted = 0;
  const batch = db.transaction(() => {
    for (const post of scrapedPosts) {
      const accountId = accountMap[post.ownerUsername];
      if (!accountId) continue;

      const account = accounts.find(a => a.handle === post.ownerUsername);
      const result = insert.run(
        post.external_id, accountId, account?.platform || 'instagram',
        post.type, post.caption, post.timestamp,
        post.likes, post.comments, post.views, post.plays,
        post.display_url, post.url, post.is_pinned
      );
      if (result.changes > 0) inserted++;
    }
  });
  batch();

  return { inserted, total: scrapedPosts.length };
}

export async function scrapeHashtags() {
  const hashtagsSetting = db.prepare("SELECT value FROM settings WHERE key = 'hashtags'").get();
  const hashtags = hashtagsSetting ? JSON.parse(hashtagsSetting.value) : ['watches', 'luxurywatches'];

  const run = db.prepare(
    `INSERT INTO scrape_runs (tier, type, status) VALUES ('hashtag', 'hashtag', 'running')`
  ).run();
  const runId = run.lastInsertRowid;

  try {
    const posts = await scrapeHashtagPosts(hashtags);
    let discovered = 0;

    // Check for auto-discovery candidates
    for (const post of posts) {
      const handle = post.ownerUsername;
      if (!handle) continue;

      const exists = db.prepare('SELECT id FROM accounts WHERE handle = ?').get(handle);
      if (exists) continue;

      // Auto-discovery criteria
      const views = post.videoViewCount || 0;
      const followers = post.ownerFollowerCount || 30000;
      const shouldDiscover = views > 50000 && followers < 30000;

      if (shouldDiscover) {
        db.prepare(
          `INSERT OR IGNORE INTO accounts (handle, platform, tier, display_name, why_tracking)
           VALUES (?, 'instagram', 'discovered', ?, 'Auto-discovered: high views/low followers ratio')`
        ).run(handle, handle);
        discovered++;
      }
    }

    db.prepare(
      `UPDATE scrape_runs SET posts_found = ?, new_posts = ?, status = 'completed',
       completed_at = datetime('now') WHERE id = ?`
    ).run(posts.length, discovered, runId);

    return { runId, hashtagsScraped: hashtags.length, postsFound: posts.length, discovered };
  } catch (e) {
    db.prepare(
      `UPDATE scrape_runs SET status = 'failed', errors = ?, completed_at = datetime('now') WHERE id = ?`
    ).run(e.message, runId);
    throw e;
  }
}
