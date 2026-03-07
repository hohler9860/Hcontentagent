import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import db from './db.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const postsPath = join(__dirname, '..', 'src', 'data', 'competitor-posts.json');

try {
  const raw = readFileSync(postsPath, 'utf8');
  const posts = JSON.parse(raw);

  const insert = db.prepare(
    `INSERT OR IGNORE INTO posts (external_id, account_id, platform, type, caption, timestamp,
     likes, comments, views, plays, display_url, url, is_pinned)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  );

  let inserted = 0;
  const batch = db.transaction(() => {
    for (const post of posts) {
      // Look up account by username
      const account = db.prepare('SELECT id FROM accounts WHERE handle = ?').get(post.ownerUsername);
      if (!account) {
        console.log(`Skipping post from unknown account: ${post.ownerUsername}`);
        continue;
      }

      const result = insert.run(
        post.id || post.shortCode,
        account.id,
        'instagram',
        post.type || 'Video',
        post.caption || '',
        post.timestamp,
        post.likesCount || 0,
        post.commentsCount || 0,
        post.videoViewCount || 0,
        post.videoPlayCount || 0,
        post.displayUrl || '',
        post.url || '',
        post.isPinned ? 1 : 0
      );
      if (result.changes > 0) inserted++;
    }
  });
  batch();

  console.log(`Seeded ${inserted} posts from ${posts.length} total (${posts.length - inserted} duplicates/unknown accounts)`);
} catch (e) {
  console.error('Failed to seed posts:', e.message);
}
