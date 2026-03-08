import { Router } from 'express';
import db from '../db.js';

const router = Router();

function getApifyToken() {
  return db.prepare("SELECT value FROM settings WHERE key = 'apify_api_token'").get()?.value;
}

function getAnthropicKey() {
  return db.prepare("SELECT value FROM settings WHERE key = 'anthropic_api_key'").get()?.value
    || process.env.VITE_ANTHROPIC_API_KEY;
}

// Transcribe a video URL using Apify transcriber
async function transcribeVideo(videoUrl) {
  const token = getApifyToken();
  if (!token || !videoUrl) return null;

  try {
    console.log(`[transcribe] Transcribing: ${videoUrl}`);
    const res = await fetch(
      `https://api.apify.com/v2/acts/tictechid~anoxvanzi-Transcriber/run-sync-get-dataset-items?token=${token}&timeout=120`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ start_urls: videoUrl }),
        signal: AbortSignal.timeout(180000),
      }
    );
    if (!res.ok) return null;
    const data = await res.json();
    const transcript = data?.[0]?.transcript;
    if (transcript && transcript.length > 10) {
      console.log(`[transcribe] Got transcript: ${transcript.length} chars`);
      return transcript;
    }
    return null;
  } catch (e) {
    console.error(`[transcribe] Failed:`, e.message);
    return null;
  }
}

// Get or fetch transcript for a post
async function getTranscript(postId, videoUrl) {
  // Check if we already have it
  const existing = db.prepare('SELECT transcript FROM posts WHERE id = ? AND transcript IS NOT NULL').get(postId);
  if (existing?.transcript) return existing.transcript;

  // Fetch it
  const transcript = await transcribeVideo(videoUrl);
  if (transcript) {
    db.prepare('UPDATE posts SET transcript = ? WHERE id = ?').run(transcript, postId);
  }
  return transcript;
}

const SYSTEM_PROMPT = `You write short-form video scripts for "Dialed by H" — a luxury watch concierge and grey market sourcer.

## WHAT YOU DO
You take the competitor's EXACT video transcript and adapt it for Dialed by H. This is NOT a creative rewrite. You are copying their script almost word-for-word, only changing:
- Brand references → Dialed by H
- Their specific examples → similar watches that fit Dialed by H's angle
- Their CTA → Dialed by H CTA

## RULES
1. **KEEP THE SAME WORDS** — If they said "this watch is insane for the price", you say "this watch is insane for the price". Don't rephrase things that already work.
2. **KEEP THE SAME STRUCTURE** — Same number of points, same order, same pacing, same transitions.
3. **KEEP THE SAME ENERGY** — If they were hype, be hype. If they were chill, be chill. Match the tone exactly.
4. **UNDER 60 SECONDS** — 60-130 words. If their script was longer, cut the weakest parts.
5. **DELIVERY NOTES** — Add [lean in], [pause], [cut to watch], [hold up wrist] etc. These tell you how to perform it.
6. **DIALED BY H ANGLE** — Grey market sourcing, real prices, skip the AD waitlist. You're a sourcer, not a reviewer.
7. **END WITH CTA** — "DM me [word]" or "Link in bio" or "Follow for more"

## OUTPUT
Return ONLY the script with delivery notes. Nothing else. No intro, no explanation, no analysis.`;

// POST /api/remix
router.post('/', async (req, res) => {
  const { post_id, caption, handle, likes, views, platform } = req.body;

  const apiKey = getAnthropicKey();
  if (!apiKey) return res.status(400).json({ error: 'Anthropic API key not configured. Set it in Settings > API Keys.' });

  try {
    // Try to get transcript if we have a post_id
    let transcript = null;
    let videoUrl = null;
    if (post_id) {
      const post = db.prepare('SELECT url, transcript FROM posts WHERE id = ?').get(post_id);
      videoUrl = post?.url;
      transcript = post?.transcript;
      if (!transcript && videoUrl) {
        transcript = await getTranscript(post_id, videoUrl);
      }
    }

    const sourceContent = transcript
      ? `TRANSCRIPT (what they actually said in the video):\n"${transcript}"\n\nCAPTION: ${(caption || '').slice(0, 300)}`
      : `CAPTION (no transcript available — work from this):\n"${(caption || '(no caption)').slice(0, 800)}"`;

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
          content: `Copy this competitor's script for Dialed by H. Keep it almost word-for-word. Under 60 seconds.

@${handle || 'unknown'} (${platform || 'instagram'}) — ${(likes || 0).toLocaleString()} likes, ${(views || 0).toLocaleString()} views

${sourceContent}`
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

    res.json({ script, hasTranscript: !!transcript });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// POST /api/remix/batch
router.post('/batch', async (req, res) => {
  const { post_ids } = req.body;
  if (!post_ids || post_ids.length === 0) return res.status(400).json({ error: 'post_ids required' });

  const apiKey = getAnthropicKey();
  if (!apiKey) return res.status(400).json({ error: 'Anthropic API key not configured' });

  const posts = db.prepare(
    `SELECT p.*, a.handle FROM posts p JOIN accounts a ON p.account_id = a.id
     WHERE p.id IN (${post_ids.map(() => '?').join(',')})`
  ).all(...post_ids);

  const results = [];
  for (const post of posts) {
    try {
      // Get transcript
      let transcript = post.transcript;
      if (!transcript && post.url) {
        transcript = await getTranscript(post.id, post.url);
      }

      const sourceContent = transcript
        ? `TRANSCRIPT:\n"${transcript}"\n\nCAPTION: ${(post.caption || '').slice(0, 300)}`
        : `CAPTION:\n"${(post.caption || '').slice(0, 800)}"`;

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
            content: `Copy this competitor's script for Dialed by H. Keep it almost word-for-word. Under 60 seconds.

@${post.handle} (${post.platform || 'instagram'}) — ${post.likes} likes, ${post.views} views

${sourceContent}`
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

      results.push({ post_id: post.id, handle: post.handle, script, hasTranscript: !!transcript });
    } catch (e) {
      results.push({ post_id: post.id, error: e.message });
    }
  }

  res.json({ remixed: results.length, results });
});

// POST /api/remix/auto — auto-remix top winners
router.post('/auto', async (req, res) => {
  const { days = 30, limit = 5 } = req.body || {};

  const apiKey = getAnthropicKey();
  if (!apiKey) return res.status(400).json({ error: 'Anthropic API key not configured' });

  const winners = db.prepare(`
    SELECT p.id FROM posts p
    WHERE p.is_winner = 1
      AND p.id NOT IN (SELECT source_post_id FROM scripts WHERE source_post_id IS NOT NULL)
    ORDER BY p.virality_score DESC
    LIMIT ?
  `).all(limit);

  if (winners.length === 0) return res.json({ remixed: 0, message: 'No un-remixed winners found' });

  // Use batch logic
  const post_ids = winners.map(w => w.id);
  const posts = db.prepare(
    `SELECT p.*, a.handle FROM posts p JOIN accounts a ON p.account_id = a.id
     WHERE p.id IN (${post_ids.map(() => '?').join(',')})`
  ).all(...post_ids);

  const results = [];
  for (const post of posts) {
    try {
      let transcript = post.transcript;
      if (!transcript && post.url) {
        transcript = await getTranscript(post.id, post.url);
      }

      const sourceContent = transcript
        ? `TRANSCRIPT:\n"${transcript}"\n\nCAPTION: ${(post.caption || '').slice(0, 300)}`
        : `CAPTION:\n"${(post.caption || '').slice(0, 800)}"`;

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
            content: `Copy this competitor's script for Dialed by H. Keep it almost word-for-word. Under 60 seconds.

@${post.handle} — ${post.likes} likes, ${post.views} views

${sourceContent}`
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

      results.push({ post_id: post.id, handle: post.handle, hasTranscript: !!transcript });
    } catch (e) {
      results.push({ post_id: post.id, error: e.message });
    }
  }

  res.json({ remixed: results.length, results });
});

// POST /api/transcribe — transcribe a single post
router.post('/transcribe', async (req, res) => {
  const { post_id } = req.body;
  if (!post_id) return res.status(400).json({ error: 'post_id required' });

  const post = db.prepare('SELECT id, url, transcript FROM posts WHERE id = ?').get(post_id);
  if (!post) return res.status(404).json({ error: 'Post not found' });
  if (post.transcript) return res.json({ transcript: post.transcript, cached: true });
  if (!post.url) return res.status(400).json({ error: 'Post has no video URL' });

  const transcript = await transcribeVideo(post.url);
  if (transcript) {
    db.prepare('UPDATE posts SET transcript = ? WHERE id = ?').run(transcript, post_id);
    return res.json({ transcript, cached: false });
  }
  res.status(500).json({ error: 'Could not transcribe video' });
});

export default router;
