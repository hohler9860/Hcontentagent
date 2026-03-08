import { Router } from 'express';
import db from '../db.js';

const router = Router();

const SYSTEM_PROMPT = `You are ghostwriting short-form video scripts for "Dialed by H" — a luxury watch concierge who sources grey market watches.

## YOUR ONLY JOB
Take the competitor's post and rewrite it as a Dialed by H script. Same structure, same energy, same hook pattern — but with Dialed by H's angle and voice.

## RULES — FOLLOW EXACTLY
1. **COPY THE STRUCTURE** — If they opened with a question, you open with a question. If they listed 3 watches, you list 3 watches. If they used a hot take, you use a hot take. Mirror the format beat-for-beat.
2. **UNDER 60 SECONDS** — Hard cap. 60-120 words max. Cut ruthlessly. No fluff.
3. **SOUND LIKE A PERSON** — Write exactly how someone talks on camera. Incomplete sentences. Slang. No "content creator" voice.
4. **FIRST LINE = HOOK** — No intro. No "hey guys". First word grabs attention.
5. **DELIVERY NOTES** — Put [lean in], [pause], [cut to watch], [dead serious], [smirk] etc throughout. These ARE the script.
6. **END WITH CTA** — Quick, natural: "DM me [word]" or "Link in bio" or "Follow for grey market truths"

## VOICE REFERENCE
- Confidence of @dula.mov — short punchy sentences, strong opinions
- Knowledge of @ciaociaochau — nerdy watch facts dropped casually
- Casual like texting a friend who's into watches

## DIALED BY H ANGLE
- Grey market sourcing — real prices, skip the AD waitlist BS
- Covers everything: Rolex, Patek, AP, Omega, Tudor, Grand Seiko, independents
- $2K–$500K+ range
- Not a reviewer. Not an influencer. A sourcer who knows the market.

## OUTPUT FORMAT
Return ONLY the script. No analysis. No explanation. No "here's my remix". Just the script with delivery notes, ready to perform.`;

// POST /api/remix — generate a remix of a competitor post
router.post('/', async (req, res) => {
  const { post_id, caption, handle, likes, views, platform } = req.body;

  const apiKey = db.prepare("SELECT value FROM settings WHERE key = 'anthropic_api_key'").get()?.value
    || process.env.VITE_ANTHROPIC_API_KEY;

  if (!apiKey) {
    return res.status(400).json({ error: 'Anthropic API key not configured. Set it in Settings > API Keys.' });
  }

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 512,
        system: SYSTEM_PROMPT,
        messages: [{
          role: 'user',
          content: `Rewrite this as a Dialed by H script. Copy the structure and hook pattern exactly. Under 60 seconds.

@${handle || 'unknown'} (${platform || 'instagram'}) — ${(likes || 0).toLocaleString()} likes, ${(views || 0).toLocaleString()} views

"${(caption || '(no caption)').slice(0, 800)}"`
        }],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => '');
      throw new Error(`Anthropic API error ${response.status}: ${errorText.slice(0, 200)}`);
    }

    const data = await response.json();
    const script = data.content[0].text;

    // Save to scripts table
    if (post_id) {
      const wordCount = script.split(/\s+/).length;
      db.prepare(
        `INSERT INTO scripts (title, platform, status, source, source_post_id, body, word_count, duration_estimate)
         VALUES (?, ?, 'draft', ?, ?, ?, ?, ?)`
      ).run(
        `Remix: @${handle}`,
        platform || 'ig',
        `@${handle} — remixed`,
        post_id,
        script,
        wordCount,
        Math.round(wordCount / 2.5)
      );
    }

    res.json({ script });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// POST /api/remix/batch — remix multiple posts at once
router.post('/batch', async (req, res) => {
  const { post_ids } = req.body;
  if (!post_ids || post_ids.length === 0) return res.status(400).json({ error: 'post_ids required' });

  const apiKey = db.prepare("SELECT value FROM settings WHERE key = 'anthropic_api_key'").get()?.value
    || process.env.VITE_ANTHROPIC_API_KEY;

  if (!apiKey) {
    return res.status(400).json({ error: 'Anthropic API key not configured' });
  }

  const posts = db.prepare(
    `SELECT p.*, a.handle FROM posts p JOIN accounts a ON p.account_id = a.id
     WHERE p.id IN (${post_ids.map(() => '?').join(',')})`
  ).all(...post_ids);

  const results = [];
  for (const post of posts) {
    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 512,
          system: SYSTEM_PROMPT,
          messages: [{
            role: 'user',
            content: `Rewrite this as a Dialed by H script. Copy the structure and hook pattern exactly. Under 60 seconds.

@${post.handle} (${post.platform || 'instagram'}) — ${post.likes} likes, ${post.views} views

"${(post.caption || '').slice(0, 800)}"`
          }],
        }),
      });

      if (!response.ok) continue;
      const data = await response.json();
      const script = data.content[0].text;

      const wordCount = script.split(/\s+/).length;
      db.prepare(
        `INSERT INTO scripts (title, platform, status, source, source_post_id, body, word_count, duration_estimate)
         VALUES (?, ?, 'draft', ?, ?, ?, ?, ?)`
      ).run(`Remix: @${post.handle}`, post.platform || 'ig', `@${post.handle}`, post.id, script, wordCount, Math.round(wordCount / 2.5));

      results.push({ post_id: post.id, handle: post.handle, script });
    } catch (e) {
      results.push({ post_id: post.id, error: e.message });
    }
  }

  res.json({ remixed: results.length, results });
});

// POST /api/remix/auto — auto-remix top winners
router.post('/auto', async (req, res) => {
  const { days = 7, limit = 5 } = req.body || {};

  const apiKey = db.prepare("SELECT value FROM settings WHERE key = 'anthropic_api_key'").get()?.value;
  if (!apiKey) return res.status(400).json({ error: 'Anthropic API key not configured' });

  // Get top winners not yet remixed
  const winners = db.prepare(`
    SELECT p.id FROM posts p
    JOIN accounts a ON p.account_id = a.id
    WHERE p.is_winner = 1
      AND p.timestamp >= datetime('now', '-' || ? || ' days')
      AND p.id NOT IN (SELECT source_post_id FROM scripts WHERE source_post_id IS NOT NULL)
    ORDER BY p.virality_score DESC
    LIMIT ?
  `).all(days, limit);

  if (winners.length === 0) return res.json({ remixed: 0, message: 'No un-remixed winners found' });

  // Use the batch endpoint logic
  const post_ids = winners.map(w => w.id);
  const posts = db.prepare(
    `SELECT p.*, a.handle FROM posts p JOIN accounts a ON p.account_id = a.id
     WHERE p.id IN (${post_ids.map(() => '?').join(',')})`
  ).all(...post_ids);

  const results = [];
  for (const post of posts) {
    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 512,
          system: SYSTEM_PROMPT,
          messages: [{
            role: 'user',
            content: `Rewrite this as a Dialed by H script. Copy the structure and hook pattern exactly. Under 60 seconds.

@${post.handle} (${post.platform || 'instagram'}) — ${post.likes} likes, ${post.views} views

"${(post.caption || '').slice(0, 800)}"`
          }],
        }),
      });

      if (!response.ok) continue;
      const data = await response.json();
      const script = data.content[0].text;

      const wordCount = script.split(/\s+/).length;
      db.prepare(
        `INSERT INTO scripts (title, platform, status, source, source_post_id, body, word_count, duration_estimate)
         VALUES (?, ?, 'draft', ?, ?, ?, ?, ?)`
      ).run(`Remix: @${post.handle}`, post.platform || 'ig', `@${post.handle}`, post.id, script, wordCount, Math.round(wordCount / 2.5));

      results.push({ post_id: post.id, handle: post.handle });
    } catch (e) {
      results.push({ post_id: post.id, error: e.message });
    }
  }

  res.json({ remixed: results.length, results });
});

export default router;
