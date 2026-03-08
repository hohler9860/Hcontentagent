import db from '../db.js';

function getApiToken() {
  const row = db.prepare("SELECT value FROM settings WHERE key = 'apify_api_token'").get();
  return row?.value || process.env.APIFY_API_TOKEN;
}

// Scrape Instagram profiles using apify/instagram-scraper
export async function scrapeProfiles(handles, postsPerProfile = 20) {
  const token = getApiToken();
  if (!token) throw new Error('APIFY_API_TOKEN not configured. Set it in Settings > API Keys or .env');

  // Batch in groups of 5 to avoid timeouts
  const BATCH_SIZE = 5;
  const allPosts = [];

  for (let i = 0; i < handles.length; i += BATCH_SIZE) {
    const batch = handles.slice(i, i + BATCH_SIZE);
    const directUrls = batch.map(h => `https://www.instagram.com/${h.replace('@', '')}/`);
    console.log(`[apify] Scraping IG batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(handles.length / BATCH_SIZE)}: ${batch.join(', ')}`);

    const response = await fetch(
      `https://api.apify.com/v2/acts/apify~instagram-scraper/run-sync-get-dataset-items?token=${token}&timeout=600`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          directUrls,
          resultsType: 'posts',
          resultsLimit: postsPerProfile,
          addParentData: true,
          onlyPostsNewerThan: '7 days',
        }),
        signal: AbortSignal.timeout(660000), // 11 min client timeout
      }
    );

    if (!response.ok) {
      const text = await response.text().catch(() => '');
      console.error(`[apify] Batch failed: ${response.status} — ${text.slice(0, 200)}`);
      continue; // Don't fail the whole scrape for one batch
    }

    const data = await response.json();
    allPosts.push(...data.map(normalizeInstagramPost));
    console.log(`[apify] Batch got ${data.length} posts`);
  }

  return allPosts;
}

// Scrape Instagram hashtags using apify/instagram-scraper
export async function scrapeHashtagPosts(hashtags, postsPerTag = 30) {
  const token = getApiToken();
  if (!token) throw new Error('APIFY_API_TOKEN not configured');

  const results = [];

  for (const tag of hashtags) {
    try {
      const response = await fetch(
        `https://api.apify.com/v2/acts/apify~instagram-scraper/run-sync-get-dataset-items?token=${token}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            search: tag,
            searchType: 'hashtag',
            searchLimit: 1,
            resultsType: 'posts',
            resultsLimit: postsPerTag,
            onlyPostsNewerThan: '3 days',
          }),
        }
      );

      if (!response.ok) continue;
      const data = await response.json();
      results.push(...data.map(normalizeInstagramPost));
    } catch (e) {
      console.error(`Hashtag scrape failed for #${tag}:`, e.message);
    }
  }

  return results;
}

// Scrape TikTok profiles using apify/tiktok-scraper
export async function scrapeTikTokProfiles(handles, postsPerProfile = 20) {
  const token = getApiToken();
  if (!token) throw new Error('APIFY_API_TOKEN not configured');

  const profiles = handles.map(h => `https://www.tiktok.com/@${h.replace('@', '')}`);

  const response = await fetch(
    `https://api.apify.com/v2/acts/clockworks~free-tiktok-scraper/run-sync-get-dataset-items?token=${token}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        profiles,
        resultsPerPage: postsPerProfile,
        shouldDownloadVideos: false,
      }),
    }
  );

  if (!response.ok) {
    const text = await response.text().catch(() => '');
    throw new Error(`Apify TikTok scrape failed: ${response.status} — ${text.slice(0, 200)}`);
  }

  const data = await response.json();
  return data.map(normalizeTikTokPost);
}

function normalizeInstagramPost(item) {
  return {
    external_id: item.id || item.shortCode,
    type: item.type || 'Video',
    caption: item.caption || '',
    timestamp: item.timestamp,
    likes: item.likesCount || 0,
    comments: item.commentsCount || 0,
    views: item.videoViewCount || 0,
    plays: item.videoPlayCount || 0,
    shares: 0,
    saves: 0,
    display_url: item.displayUrl || '',
    url: item.url || '',
    is_pinned: item.isPinned ? 1 : 0,
    ownerUsername: item.ownerUsername,
    ownerFollowerCount: item.ownerFollowerCount || 0,
  };
}

function normalizeTikTokPost(item) {
  return {
    external_id: item.id || String(item.createTime),
    type: 'Video',
    caption: item.text || item.desc || '',
    timestamp: item.createTime ? new Date(item.createTime * 1000).toISOString() : new Date().toISOString(),
    likes: item.diggCount || item.stats?.diggCount || 0,
    comments: item.commentCount || item.stats?.commentCount || 0,
    views: item.playCount || item.stats?.playCount || 0,
    plays: item.playCount || item.stats?.playCount || 0,
    shares: item.shareCount || item.stats?.shareCount || 0,
    saves: item.collectCount || item.stats?.collectCount || 0,
    display_url: item.cover || item.video?.cover || '',
    url: item.webVideoUrl || `https://www.tiktok.com/@${item.authorMeta?.name || 'unknown'}/video/${item.id}`,
    is_pinned: 0,
    ownerUsername: item.authorMeta?.name || item.author?.uniqueId || 'unknown',
    ownerFollowerCount: item.authorMeta?.fans || 0,
  };
}
