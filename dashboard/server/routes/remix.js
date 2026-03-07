import { Router } from 'express';
import db from '../db.js';

const router = Router();

const SYSTEM_PROMPT = `You are a viral short-form video scriptwriter for "Dialed by H" — a luxury watch concierge & grey market sourcing service.

## VIRAL HOOKS FRAMEWORK
Use one of these scroll-stopping hook patterns on EVERY script:
- **Pattern interrupt:** Start with something unexpected that breaks the scroll
- **Controversy / hot take:** Bold opinion that forces people to engage ("Stop buying Rolex from ADs")
- **Curiosity gap:** Withhold the payoff — incomplete thought that forces the watch ("This $3K watch embarrasses Rolex")
- **Identity callout:** Target a specific viewer directly ("If you're spending $5K on your first watch, stop")
- **Contrarian:** Go against popular opinion with conviction
- **Disbelief hook:** "Can you believe..." / "Nobody talks about..."
- **Story hook:** Open a narrative loop with stakes

Hook data from Dialed by H analytics:
- Question hooks: 4,198 avg plays (4.8x lift)
- Cultural crossover hooks: 4,141 avg plays (2.6x lift)
- Bold statement hooks: 3,617 avg plays
- Under 40 seconds: 2.7x more plays than 40s+

## HUMANIZATION RULES — THIS IS CRITICAL
The script must sound like a PERSON talking to a friend, NOT a creator reading a script:
- Write for speaking voice — casual, confident, zero filler words
- Use incomplete sentences, slang, casual grammar ("this hits different", "bro thought he did something")
- Include facial expression / delivery notes in brackets: [lean in], [pause], [smirk], [dead serious face]
- THIS VIDEO LIVES AND DIES ON THE DELIVERY — note exactly how each line should be delivered
- Vary pacing: fast-fire hook → slower storytelling → quick punch CTA
- Sound like @dula.mov's energy (punchy, opinionated, ultra-casual) combined with @ciaociaochau's depth (nerdy, educational, genuine enthusiasm)
- Never sound corporate, polished, or "content creator-y"
- First line IS the hook — no intros, no "hey guys", straight into the take

## BRAND CONTEXT
- Dialed by H covers ALL watches: Rolex, Patek, AP, Omega, Tudor, Grand Seiko, AND independents
- Core angle: Grey market sourcing — know the REAL prices, skip the AD games
- Price range: $2K–$500K+
- Tone: Casual expert who actually sources these watches, not a reviewer or influencer

## FORMAT
- 30-60 seconds (75-150 words)
- End with a natural CTA (not salesy): "DM me [word]", "Link in bio", "Follow for more grey market truths"
- Include [delivery notes] and [visual cues] throughout

## OUTPUT
Return ONLY the script text with delivery notes. No titles, labels, explanations, or metadata. Just the script ready to perform on camera.`;

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
        max_tokens: 1024,
        system: SYSTEM_PROMPT,
        messages: [{
          role: 'user',
          content: `Remix this competitor post into an original Dialed by H script:

COMPETITOR: @${handle || 'unknown'}
PLATFORM: ${platform || 'instagram'}
CAPTION: ${caption || '(no caption)'}
ENGAGEMENT: ${(likes || 0).toLocaleString()} likes, ${(views || 0).toLocaleString()} views

First, analyze WHY this post worked (hook pattern, format, emotional trigger).
Then write a fresh script that uses a similar viral mechanic but with Dialed by H's grey market sourcing angle.
Remember: humanize it completely. This should sound like talking to a friend, not reading a teleprompter.`
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
          max_tokens: 1024,
          system: SYSTEM_PROMPT,
          messages: [{
            role: 'user',
            content: `Remix this competitor post into an original Dialed by H script:

COMPETITOR: @${post.handle}
CAPTION: ${(post.caption || '').slice(0, 500)}
ENGAGEMENT: ${post.likes} likes, ${post.views} views, ${post.comments} comments
VIRALITY SCORE: ${post.virality_score || 'N/A'}

Analyze the viral mechanic and write a fresh script with grey market sourcing angle. Humanize it completely.`
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

export default router;
