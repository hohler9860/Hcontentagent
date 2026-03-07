import remixes from '../data/remixes.json'

export async function remixPost(post) {
  const postId = post.id || post.shortCode
  const preGenerated = remixes[postId]

  if (preGenerated) {
    // Small delay so the loading state is visible
    await new Promise(r => setTimeout(r, 800))
    return preGenerated
  }

  // Fallback: if we have an API key, generate live
  const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY
  if (apiKey) {
    return await remixLive(post, apiKey)
  }

  throw new Error('No remix available for this post. Run the scraper to generate fresh remixes.')
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
      messages: [{ role: 'user', content: `Remix this competitor post into an original Dialed by H script:\n\nCOMPETITOR: @${handle}\nCAPTION: ${caption}\nENGAGEMENT: ${likes.toLocaleString()} likes, ${views.toLocaleString()} views\n\nAnalyze why this post went viral, identify the hook pattern, and write a fresh script that uses a similar viral mechanic but with Dialed by H's angle (grey market sourcing, all-brand coverage, casual expert tone).` }],
    }),
  })

  if (!res.ok) throw new Error(`API error ${res.status}`)
  const data = await res.json()
  return data.content[0].text
}

const SYSTEM_PROMPT = `You are a viral short-form video scriptwriter for "Dialed by H" — a luxury watch concierge & grey market sourcing service.

VIRAL HOOKS FRAMEWORK:
- Pattern interrupt: Start with something unexpected
- Controversy/hot take: Bold opinion that demands engagement
- Curiosity gap: Withhold the payoff
- Identity callout: Target a specific viewer
- Contrarian: Go against popular opinion
- Story hook: Open a narrative loop

RULES:
- Keep scripts 30-60 seconds (75-150 words)
- First line IS the hook — make it scroll-stopping
- Write for speaking voice, not reading — casual, confident, no filler
- End with a CTA that feels natural, not salesy
- Reference grey market pricing / sourcing angle where natural
- Dialed by H covers ALL watches (Rolex, Patek, AP, Omega, Tudor, Grand Seiko, independents)
- Never copy the competitor's script verbatim — remix the CONCEPT with a fresh angle

OUTPUT FORMAT:
Return ONLY the script text. No titles, labels, or explanations. Just the script ready to read on camera.`
