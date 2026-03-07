import remixes from '../data/remixes.json'

export async function remixPost(post) {
  const postId = post.id || post.shortCode

  // 1. Check pre-generated remixes first
  const preGenerated = remixes[postId]
  if (preGenerated) {
    await new Promise(r => setTimeout(r, 800))
    return preGenerated
  }

  // 2. Try server-side remix (uses viral hooks + humanization system prompt)
  try {
    const res = await fetch('/api/remix', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        post_id: post.id,
        caption: post.caption || post.desc || '',
        handle: post.ownerUsername || post.handle || 'unknown',
        likes: post.likesCount || post.likes || 0,
        views: post.videoPlayCount || post.videoViewCount || post.views || 0,
        platform: post.platform || 'instagram',
      }),
    })
    if (res.ok) {
      const data = await res.json()
      return data.script
    }
  } catch {
    // Server not available, fall through to client-side
  }

  // 3. Fallback: client-side Anthropic API call
  const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY
  if (apiKey) {
    return await remixLive(post, apiKey)
  }

  throw new Error('No remix available. Start the server (npm run dev:all) or set VITE_ANTHROPIC_API_KEY.')
}

async function remixLive(post, apiKey) {
  const caption = post.caption || '(no caption)'
  const handle = post.ownerUsername || 'unknown'
  const likes = post.likesCount || 0
  const views = post.videoPlayCount || post.videoViewCount || 0

  const res = await fetch('/api/anthropic/v1/messages', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: `Remix this competitor post into an original Dialed by H script:\n\nCOMPETITOR: @${handle}\nCAPTION: ${caption}\nENGAGEMENT: ${likes.toLocaleString()} likes, ${views.toLocaleString()} views\n\nAnalyze why this post went viral, identify the hook pattern, and write a fresh script that uses a similar viral mechanic but with Dialed by H's angle (grey market sourcing, all-brand coverage, casual expert tone). Humanize it completely — delivery notes, facial cues, casual language.` }],
    }),
  })

  if (!res.ok) throw new Error(`API error ${res.status}`)
  const data = await res.json()
  return data.content[0].text
}

const SYSTEM_PROMPT = `You are a viral short-form video scriptwriter for "Dialed by H" — a luxury watch concierge & grey market sourcing service.

VIRAL HOOKS FRAMEWORK:
- Pattern interrupt: Start with something unexpected that breaks the scroll
- Controversy / hot take: Bold opinion that forces engagement
- Curiosity gap: Withhold the payoff — incomplete thought forces the watch
- Identity callout: Target a specific viewer directly
- Contrarian: Go against popular opinion with conviction
- Disbelief hook: "Can you believe..." / "Nobody talks about..."
- Story hook: Open a narrative loop with stakes

HUMANIZATION RULES:
- Write for speaking voice — casual, confident, zero filler
- Use incomplete sentences, slang, casual grammar
- Include [delivery notes] in brackets: [lean in], [pause], [smirk], [dead serious face]
- Vary pacing: fast-fire hook → slower storytelling → quick punch CTA
- Sound like @dula.mov's energy + @ciaociaochau's depth
- Never sound corporate or "content creator-y"

RULES:
- Keep scripts 30-60 seconds (75-150 words)
- First line IS the hook — no intros, straight into the take
- End with natural CTA: "DM me [word]", "Link in bio", "Follow for more grey market truths"
- Reference grey market pricing / sourcing where natural
- Dialed by H covers ALL watches (Rolex, Patek, AP, Omega, Tudor, Grand Seiko, independents)
- Never copy verbatim — remix the CONCEPT with a fresh angle
- Include [visual cues] and [delivery notes] throughout

OUTPUT: Return ONLY the script text with delivery notes. No titles or labels.`
