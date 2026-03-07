import db from '../db.js';

const CONTENT_PILLARS = [
  'market-analysis', 'product-review', 'hot-take', 'educational',
  'lifestyle', 'behind-the-scenes', 'comparison', 'news', 'humor', 'personal-story'
];

const HOOK_TYPES = [
  'question', 'bold-statement', 'pov', 'hot-take', 'statistic',
  'story', 'controversy', 'curiosity-gap', 'listicle', 'challenge'
];

export async function classifyPosts(posts) {
  const apiKey = db.prepare("SELECT value FROM settings WHERE key = 'anthropic_api_key'").get()?.value;
  if (!apiKey) {
    // Fallback to simple rule-based classification
    return posts.map(post => classifyByRules(post));
  }

  // Batch classify via Claude (20 posts per call)
  const batches = [];
  for (let i = 0; i < posts.length; i += 20) {
    batches.push(posts.slice(i, i + 20));
  }

  const results = [];
  for (const batch of batches) {
    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-haiku-4-5-20251001',
          max_tokens: 2048,
          messages: [{
            role: 'user',
            content: `Classify these social media posts about watches/luxury goods. For each post, return JSON with: content_pillar (one of: ${CONTENT_PILLARS.join(', ')}), hook_type (one of: ${HOOK_TYPES.join(', ')}), format_tags (array of relevant tags like "green-screen", "talking-head", "b-roll", "text-overlay", "meme", "carousel").

Posts:
${batch.map((p, i) => `${i + 1}. [${p.external_id}] "${(p.caption || '').slice(0, 200)}"`).join('\n')}

Return ONLY a JSON array of objects with keys: id, content_pillar, hook_type, format_tags`
          }]
        })
      });

      const data = await response.json();
      const text = data.content?.[0]?.text || '[]';
      const match = text.match(/\[[\s\S]*\]/);
      if (match) {
        const classified = JSON.parse(match[0]);
        for (let j = 0; j < classified.length && j < batch.length; j++) {
          results.push({
            ...batch[j],
            content_pillar: classified[j].content_pillar,
            hook_type: classified[j].hook_type,
            format_tags: JSON.stringify(classified[j].format_tags || []),
          });
        }
      }
    } catch (e) {
      // On API failure, fallback to rules
      for (const post of batch) {
        results.push(classifyByRules(post));
      }
    }
  }

  // Save classifications to DB
  const update = db.prepare(
    'UPDATE posts SET content_pillar = ?, hook_type = ?, format_tags = ? WHERE id = ?'
  );
  const batch2 = db.transaction(() => {
    for (const r of results) {
      update.run(r.content_pillar, r.hook_type, r.format_tags, r.id);
    }
  });
  batch2();

  return results;
}

function classifyByRules(post) {
  const caption = (post.caption || '').toLowerCase();
  let content_pillar = 'lifestyle';
  let hook_type = 'statement';

  if (caption.includes('price') || caption.includes('market') || caption.includes('value')) content_pillar = 'market-analysis';
  else if (caption.includes('review') || caption.includes('hands on')) content_pillar = 'product-review';
  else if (caption.includes('hot take') || caption.includes('unpopular')) content_pillar = 'hot-take';
  else if (caption.includes('learn') || caption.includes('guide') || caption.includes('how to')) content_pillar = 'educational';
  else if (caption.includes('behind') || caption.includes('bts')) content_pillar = 'behind-the-scenes';
  else if (caption.includes('vs') || caption.includes('versus') || caption.includes('compare')) content_pillar = 'comparison';
  else if (caption.includes('news') || caption.includes('breaking') || caption.includes('announce')) content_pillar = 'news';
  else if (caption.includes('😂') || caption.includes('lol') || caption.includes('meme')) content_pillar = 'humor';

  if (caption.startsWith('?') || caption.includes('?')) hook_type = 'question';
  else if (caption.startsWith('pov')) hook_type = 'pov';
  else if (caption.match(/^\d/)) hook_type = 'listicle';
  else if (caption.includes('nobody') || caption.includes('secret')) hook_type = 'curiosity-gap';
  else if (caption.includes('hot take') || caption.includes('unpopular')) hook_type = 'hot-take';

  return {
    ...post,
    content_pillar,
    hook_type,
    format_tags: JSON.stringify([post.type === 'Video' ? 'video' : 'image']),
  };
}

export async function classifyUnclassified() {
  const posts = db.prepare(
    'SELECT * FROM posts WHERE content_pillar IS NULL LIMIT 100'
  ).all();

  if (posts.length === 0) return { classified: 0 };
  const results = await classifyPosts(posts);
  return { classified: results.length };
}
