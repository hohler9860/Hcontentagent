import db from '../db.js';

function getApiToken() {
  const row = db.prepare("SELECT value FROM settings WHERE key = 'apify_api_token'").get();
  return row?.value || process.env.APIFY_API_TOKEN;
}

export async function scrapeProfiles(handles, postsPerProfile = 20) {
  const token = getApiToken();
  if (!token) throw new Error('APIFY_API_TOKEN not configured');

  const response = await fetch(
    `https://api.apify.com/v2/acts/apify~instagram-profile-scraper/run-sync-get-dataset-items?token=${token}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        usernames: handles,
        resultsLimit: postsPerProfile,
        addParentData: true,
      }),
    }
  );

  if (!response.ok) {
    throw new Error(`Apify scrape failed: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  return data.map(item => ({
    external_id: item.id || item.shortCode,
    type: item.type || 'Video',
    caption: item.caption || '',
    timestamp: item.timestamp,
    likes: item.likesCount || 0,
    comments: item.commentsCount || 0,
    views: item.videoViewCount || 0,
    plays: item.videoPlayCount || 0,
    display_url: item.displayUrl || '',
    url: item.url || '',
    is_pinned: item.isPinned ? 1 : 0,
    ownerUsername: item.ownerUsername,
  }));
}

export async function scrapeHashtagPosts(hashtags, postsPerTag = 30) {
  const token = getApiToken();
  if (!token) throw new Error('APIFY_API_TOKEN not configured');

  const response = await fetch(
    `https://api.apify.com/v2/acts/apify~instagram-hashtag-scraper/run-sync-get-dataset-items?token=${token}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        hashtags: hashtags,
        resultsLimit: postsPerTag,
      }),
    }
  );

  if (!response.ok) {
    throw new Error(`Apify hashtag scrape failed: ${response.status}`);
  }

  return response.json();
}
