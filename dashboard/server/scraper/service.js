import db from '../db.js';
import { scrapeProfiles, scrapeHashtagPosts, scrapeTikTokProfiles } from './apify.js';
import { scoreNewPosts } from '../scoring/engine.js';
import { classifyUnclassified } from '../scoring/classifier.js';

// TikTok handles to scrape (mapped to their IG account in the DB)
const TIKTOK_CREATORS = ['dula.mov', 'ciaociaochau', 'teddiebaldassarre'];

export async function scrapeAccounts(accounts) {
  if (!accounts || accounts.length === 0) return { scraped: 0, newPosts: 0 };

  const tier = accounts[0]?.tier || 'mixed';
  const run = db.prepare(
    `INSERT INTO scrape_runs (tier, type, accounts_scraped, status)
     VALUES (?, 'profile', ?, 'running')`
  ).run(tier, accounts.length);
  const runId = run.lastInsertRowid;

  try {
    // Split by platform
    const igAccounts = accounts.filter(a => a.platform === 'instagram');
    const tiktokAccounts = accounts.filter(a => a.platform === 'tiktok');

    let allPosts = [];

    // Scrape Instagram accounts
    if (igAccounts.length > 0) {
      const igHandles = igAccounts.map(a => a.handle);
      console.log(`[scraper] Scraping ${igHandles.length} Instagram accounts: ${igHandles.join(', ')}`);
      const igPosts = await scrapeProfiles(igHandles);
      allPosts.push(...igPosts);
    }

    // Scrape TikTok accounts
    if (tiktokAccounts.length > 0) {
      const tiktokHandles = tiktokAccounts.map(a => a.handle);
      console.log(`[scraper] Scraping ${tiktokHandles.length} TikTok accounts: ${tiktokHandles.join(', ')}`);
      try {
        const tiktokPosts = await scrapeTikTokProfiles(tiktokHandles);
        allPosts.push(...tiktokPosts);
      } catch (e) {
        console.error('[scraper] TikTok scrape failed:', e.message);
      }
    }

    const { inserted, total } = diffPosts(allPosts, accounts);

    // Score new posts
    const scoreResult = scoreNewPosts();

    // Try to classify unclassified posts
    let classified = 0;
    try {
      const classResult = await classifyUnclassified();
      classified = classResult.classified;
    } catch (e) {
      console.error('[scraper] Classification failed:', e.message);
    }

    db.prepare(
      `UPDATE scrape_runs SET posts_found = ?, new_posts = ?, winners_found = ?,
       status = 'completed', completed_at = datetime('now') WHERE id = ?`
    ).run(total, inserted, scoreResult.winners, runId);

    return {
      runId,
      scraped: accounts.length,
      postsFound: total,
      newPosts: inserted,
      winners: scoreResult.winners,
      scored: scoreResult.scored,
      classified,
    };
  } catch (e) {
    db.prepare(
      `UPDATE scrape_runs SET status = 'failed', errors = ?, completed_at = datetime('now') WHERE id = ?`
    ).run(e.message, runId);
    throw e;
  }
}

export function diffPosts(scrapedPosts, accounts) {
  // Build account lookup by handle
  const accountMap = {};
  for (const a of accounts) accountMap[a.handle] = a;

  // Also look up by handle in DB for any accounts not in the passed array
  const allAccounts = db.prepare('SELECT * FROM accounts').all();
  for (const a of allAccounts) {
    if (!accountMap[a.handle]) accountMap[a.handle] = a;
  }

  const insert = db.prepare(
    `INSERT OR IGNORE INTO posts (external_id, account_id, platform, type, caption, timestamp,
     likes, comments, views, plays, shares, saves, display_url, url, is_pinned)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  );

  const updateExisting = db.prepare(
    `UPDATE posts SET likes = ?, comments = ?, views = ?, plays = ?, shares = ?, saves = ?
     WHERE external_id = ? AND (likes != ? OR comments != ? OR views != ?)`
  );

  let inserted = 0;
  let updated = 0;

  const batch = db.transaction(() => {
    for (const post of scrapedPosts) {
      const account = accountMap[post.ownerUsername];
      if (!account) {
        // Auto-add discovered accounts from scrape results
        const newAccount = db.prepare(
          `INSERT OR IGNORE INTO accounts (handle, platform, tier, display_name, why_tracking)
           VALUES (?, 'instagram', 'discovered', ?, 'Auto-discovered from scrape')`
        ).run(post.ownerUsername, post.ownerUsername);
        if (newAccount.changes > 0) {
          accountMap[post.ownerUsername] = {
            id: newAccount.lastInsertRowid,
            handle: post.ownerUsername,
            platform: 'instagram',
          };
        }
        continue;
      }

      const result = insert.run(
        post.external_id, account.id, account.platform || 'instagram',
        post.type, post.caption, post.timestamp,
        post.likes, post.comments, post.views, post.plays,
        post.shares || 0, post.saves || 0,
        post.display_url, post.url, post.is_pinned
      );

      if (result.changes > 0) {
        inserted++;
      } else {
        // Update engagement metrics on existing posts
        updateExisting.run(
          post.likes, post.comments, post.views, post.plays, post.shares || 0, post.saves || 0,
          post.external_id, post.likes, post.comments, post.views
        );
        updated++;
      }

      // Update account follower count if available
      if (post.ownerFollowerCount && post.ownerFollowerCount > 0) {
        db.prepare('UPDATE accounts SET followers = ? WHERE id = ? AND followers != ?')
          .run(post.ownerFollowerCount, account.id, post.ownerFollowerCount);
      }
    }
  });
  batch();

  return { inserted, updated, total: scrapedPosts.length };
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

    for (const post of posts) {
      const handle = post.ownerUsername;
      if (!handle) continue;

      const exists = db.prepare('SELECT id FROM accounts WHERE handle = ?').get(handle);
      if (exists) continue;

      // Auto-discovery criteria: high views relative to followers, or very high views
      const views = post.views || 0;
      const followers = post.ownerFollowerCount || 30000;
      const shouldDiscover = (views > 50000 && followers < 30000) || views > 100000;

      if (shouldDiscover) {
        db.prepare(
          `INSERT OR IGNORE INTO accounts (handle, platform, tier, display_name, why_tracking)
           VALUES (?, 'instagram', 'discovered', ?, 'Auto-discovered: high engagement from hashtag scrape')`
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

// Scrape ALL active accounts — the "daily scrape" function
export async function scrapeAll() {
  const accounts = db.prepare('SELECT * FROM accounts WHERE active = 1').all();
  if (accounts.length === 0) return { error: 'No active accounts to scrape' };

  console.log(`[scraper] Starting full scrape of ${accounts.length} accounts`);

  const results = {
    totalAccounts: accounts.length,
    postsFound: 0,
    newPosts: 0,
    winners: 0,
    scored: 0,
    classified: 0,
    errors: [],
  };

  // Group by tier for logging
  const byTier = {};
  for (const a of accounts) {
    if (!byTier[a.tier]) byTier[a.tier] = [];
    byTier[a.tier].push(a);
  }

  for (const [tier, tierAccounts] of Object.entries(byTier)) {
    try {
      console.log(`[scraper] Scraping ${tier} tier (${tierAccounts.length} accounts)`);
      const result = await scrapeAccounts(tierAccounts);
      results.postsFound += result.postsFound;
      results.newPosts += result.newPosts;
      results.winners += result.winners;
      results.scored += result.scored;
      results.classified += result.classified || 0;
    } catch (e) {
      console.error(`[scraper] ${tier} tier failed:`, e.message);
      results.errors.push(`${tier}: ${e.message}`);
    }
  }

  // Also scrape hashtags
  try {
    console.log('[scraper] Scraping hashtags');
    const hashResult = await scrapeHashtags();
    results.hashtagPosts = hashResult.postsFound;
    results.discovered = hashResult.discovered;
  } catch (e) {
    console.error('[scraper] Hashtag scrape failed:', e.message);
    results.errors.push(`hashtags: ${e.message}`);
  }

  // Also scrape TikTok for key creators
  try {
    console.log('[scraper] Scraping TikTok profiles');
    const tiktokResult = await scrapeTikTok();
    results.tiktokPosts = tiktokResult.postsFound;
    results.tiktokNew = tiktokResult.newPosts;
  } catch (e) {
    console.error('[scraper] TikTok scrape failed:', e.message);
    results.errors.push(`tiktok: ${e.message}`);
  }

  // Auto-remix top winners
  try {
    console.log('[scraper] Auto-remixing top winners');
    const remixResult = await autoRemixWinners();
    results.autoRemixed = remixResult.remixed;
  } catch (e) {
    console.error('[scraper] Auto-remix failed:', e.message);
  }

  console.log(`[scraper] Full scrape complete: ${results.newPosts} new posts, ${results.winners} winners`);
  return results;
}

// Scrape TikTok for key creators, store under their existing IG account IDs
export async function scrapeTikTok() {
  try {
    const posts = await scrapeTikTokProfiles(TIKTOK_CREATORS, 20);
    console.log(`[tiktok] Got ${posts.length} TikTok posts`);

    const allAccounts = db.prepare('SELECT * FROM accounts').all();
    const accountMap = {};
    for (const a of allAccounts) accountMap[a.handle] = a;

    const insert = db.prepare(
      `INSERT OR IGNORE INTO posts (external_id, account_id, platform, type, caption, timestamp,
       likes, comments, views, plays, shares, saves, display_url, url, is_pinned)
       VALUES (?, ?, 'tiktok', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    );

    let inserted = 0;
    for (const post of posts) {
      const account = accountMap[post.ownerUsername];
      if (!account) continue;
      const r = insert.run(
        post.external_id, account.id, post.type, post.caption, post.timestamp,
        post.likes, post.comments, post.views, post.plays,
        post.shares || 0, post.saves || 0, post.display_url, post.url, post.is_pinned
      );
      if (r.changes > 0) inserted++;
    }

    // Score new posts
    const scoreResult = scoreNewPosts();
    try { await classifyUnclassified(); } catch (e) {}

    return { postsFound: posts.length, newPosts: inserted, winners: scoreResult.winners };
  } catch (e) {
    console.error('[tiktok] Scrape failed:', e.message);
    return { postsFound: 0, newPosts: 0, winners: 0 };
  }
}

// Auto-remix top un-remixed winners
async function autoRemixWinners(limit = 5) {
  const apiKey = db.prepare("SELECT value FROM settings WHERE key = 'anthropic_api_key'").get()?.value;
  if (!apiKey) return { remixed: 0 };

  const winners = db.prepare(`
    SELECT p.id FROM posts p
    WHERE p.is_winner = 1
      AND p.id NOT IN (SELECT source_post_id FROM scripts WHERE source_post_id IS NOT NULL)
    ORDER BY p.virality_score DESC
    LIMIT ?
  `).all(limit);

  if (winners.length === 0) return { remixed: 0 };

  // Call our own remix endpoint
  try {
    const res = await fetch('http://localhost:3001/api/remix/batch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ post_ids: winners.map(w => w.id) }),
    });
    const data = await res.json();
    console.log(`[auto-remix] Remixed ${data.remixed} winners`);
    return { remixed: data.remixed };
  } catch (e) {
    console.error('[auto-remix] Failed:', e.message);
    return { remixed: 0 };
  }
}
