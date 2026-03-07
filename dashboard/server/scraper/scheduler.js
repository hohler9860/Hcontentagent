import cron from 'node-cron';
import db from '../db.js';
import { scrapeAccounts, scrapeHashtags } from './service.js';

function getInterval(tier) {
  const row = db.prepare(`SELECT value FROM settings WHERE key = 'scrape_interval_${tier}'`).get();
  return row ? Number(row.value) : null;
}

// Convert seconds to cron-friendly interval
function secondsToCron(seconds) {
  const hours = Math.floor(seconds / 3600);
  if (hours >= 1) return `0 */${hours} * * *`;
  const minutes = Math.floor(seconds / 60);
  return `*/${minutes} * * *`;
}

async function runTierScrape(tier) {
  try {
    const accounts = db.prepare('SELECT * FROM accounts WHERE tier = ? AND active = 1').all(tier);
    if (accounts.length === 0) return;
    console.log(`[scheduler] Scraping ${tier} tier (${accounts.length} accounts)`);
    const result = await scrapeAccounts(accounts);
    console.log(`[scheduler] ${tier} complete: ${result.newPosts} new posts, ${result.winners} winners`);
  } catch (e) {
    console.error(`[scheduler] ${tier} scrape failed:`, e.message);
  }
}

// Schedule jobs
// Core: every 2 hours
cron.schedule('0 */2 * * *', () => runTierScrape('core'));

// Primary: every 4 hours
cron.schedule('0 */4 * * *', () => runTierScrape('primary'));

// Ecosystem: every 6 hours
cron.schedule('0 */6 * * *', () => runTierScrape('ecosystem'));

// Discovered: every 12 hours
cron.schedule('0 */12 * * *', () => runTierScrape('discovered'));

// Hashtags: every 6 hours (offset by 3 hours from ecosystem)
cron.schedule('0 3,9,15,21 * * *', async () => {
  try {
    console.log('[scheduler] Scraping hashtags');
    const result = await scrapeHashtags();
    console.log(`[scheduler] Hashtags complete: ${result.postsFound} posts, ${result.discovered} discovered`);
  } catch (e) {
    console.error('[scheduler] Hashtag scrape failed:', e.message);
  }
});

console.log('[scheduler] Cron jobs registered: core(2h), primary(4h), ecosystem(6h), discovered(12h), hashtags(6h)');
