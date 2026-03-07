// ─── PIPELINE ───────────────────────────────────────────────────────────────

export const PIPELINE_COLUMNS = [
  { key: 'ideas', label: 'Ideas' },
  { key: 'writing', label: 'Writing' },
  { key: 'review', label: 'Review' },
  { key: 'scheduled', label: 'Scheduled' },
  { key: 'published', label: 'Published' },
]

export const INITIAL_PIPELINE = {
  ideas: [
    { id: 'p1', title: '5 watches that hold value better than stocks', platform: 'ig', date: 'Mar 8', source: null, notes: '', script: '' },
    { id: 'p2', title: 'Behind the scenes at Watches and Wonders Geneva', platform: 'tiktok', date: 'Mar 9', source: null, notes: '', script: '' },
    { id: 'p3', title: "Why grey market isn't what you think", platform: 'substack', date: 'Mar 7', source: null, notes: '', script: '' },
    { id: 'p4', title: 'Watch on wrist — guess the price challenge', platform: 'tiktok', date: 'Mar 8', source: '@dula.mov', notes: '', script: '' },
  ],
  writing: [
    { id: 'p5', title: 'Rolex market pricing breakdown Q1 2026', platform: 'substack', date: 'Mar 4', source: null, notes: 'Pull latest Chrono24 data', script: 'The grey market moved this quarter...' },
    { id: 'p6', title: '3 watches under $5K for first-time collectors', platform: 'ig', date: 'Mar 5', source: null, notes: 'Film at Patina NY', script: '' },
  ],
  review: [
    { id: 'p7', title: 'The access problem in luxury watches', platform: 'substack', date: 'Mar 3', source: null, notes: 'Final proofread needed', script: 'You can\'t buy the watch you want. And that\'s by design.\n\nThe luxury watch industry has an access problem...' },
  ],
  scheduled: [
    { id: 'p8', title: 'Watch of the Week: AP Royal Oak 15500', platform: 'ig', date: 'Mar 10', source: null, notes: 'Shot and edited', script: '' },
    { id: 'p9', title: 'Grey Market Guide: How to verify authenticity', platform: 'tiktok', date: 'Mar 12', source: null, notes: '', script: '' },
  ],
  published: [
    { id: 'p10', title: 'Why I left corporate finance for watches', platform: 'ig', date: 'Mar 3', source: null, notes: '', script: '' },
    { id: 'p11', title: 'Submariner vs. Seamaster: Grey market value', platform: 'substack', date: 'Mar 1', source: null, notes: '', script: '' },
  ],
}

// ─── COMPETITORS ────────────────────────────────────────────────────────────

export const COMPETITOR_PROFILES = [
  {
    handle: '@dula.mov',
    username: 'dula.mov',
    platform: 'TikTok / Instagram',
    style: 'Ultra-short captions, green screen format, opinion-driven hot takes, fast pacing',
    why: 'Format inspiration — adapting their punchy, curiosity-gap caption style',
  },
  {
    handle: '@ciaociaochau',
    username: 'ciaociaochau',
    platform: 'Instagram',
    style: 'Meme-y captions, educational depth, nerdy enthusiasm, original audio',
    why: 'Audience overlap — similar collector demographic, educational tone reference',
  },
]

// ─── SCRIPTS ────────────────────────────────────────────────────────────────

export const INITIAL_SCRIPTS = [
  {
    id: 's1',
    title: 'Guess the Price: Grey Market Edition',
    platform: 'ig',
    status: 'Remixed',
    source: '@dula.mov — Guess the price',
    body: `Hook: "I brought 3 watches to Boston Common. Nobody guessed right."\n\n[Show watch 1 on wrist — Rolex DJ 41]\n"This one? Most people said 15K. Grey market price? $9,200."\n\n[Show watch 2 — Omega Seamaster]\n"This? Everyone thought 8K. I sourced it for $3,800."\n\n[Show watch 3 — AP Royal Oak]\n"And this... they all said 35K. Try $28,500. Grey market hits different."\n\nCTA: "Follow for more grey market truths. Link in bio for sourcing."`,
    createdAt: 'Mar 5',
  },
  {
    id: 's2',
    title: 'The Access Problem in Luxury Watches',
    platform: 'substack',
    status: 'Original',
    source: null,
    body: `Hook: "You can't buy the watch you want. And that's by design."\n\nThe luxury watch industry has an access problem. Not a supply problem — an access problem.\n\nRolex makes roughly 1.2 million watches per year. That's not scarcity. That's manufactured exclusivity.\n\nThe AD system was designed for a world where watch buyers walked into a store and bought what was available. Now it's a gatekeeping mechanism that rewards spend history over genuine enthusiasm.\n\nHere's the math your AD doesn't want you to do: If you spend $25K on jewelry you don't want to "earn" a $13K Submariner, your Submariner actually cost you $38K. At that point, the grey market premium isn't a tax — it's a bargain.\n\nThe grey market exists because the traditional system failed the modern buyer. We don't need relationships. We need access.\n\nThat's what I built Dialed by H for. No games. No purchase history. Just the watch you want, authenticated and sourced.\n\nDM me "access" and let's talk about your next piece.`,
    createdAt: 'Mar 3',
  },
  {
    id: 's3',
    title: '3 Watches Under $5K That Will Actually Appreciate',
    platform: 'ig',
    status: 'Original',
    source: null,
    body: `Hook: "Stop buying watches that lose value the second you walk out."\n\n[Show watch 1 — Tudor Black Bay 58]\n"Tudor BB58. Retail $3,800, grey market $3,400. These are climbing."\n\n[Show watch 2 — Grand Seiko SBGA413]\n"Grand Seiko Spring Drive. $4,200 grey. The finishing embarrasses watches at 3x the price."\n\n[Show watch 3 — Cartier Santos Medium]\n"Cartier Santos. $4,600 grey. Fashion guys are catching on. Supply is tightening."\n\nCTA: "Save this. DM me 'first watch' and I'll help you source one."`,
    createdAt: 'Mar 4',
  },
  {
    id: 's4',
    title: 'POV: Walking into a Watch Dealer with $10K',
    platform: 'tiktok',
    status: 'Remixed',
    source: '@dula.mov — POV dealer format',
    body: `Hook: "POV: You just told a dealer you have 10K to spend."\n\n[Walking into dealer, camera POV]\n"They're going to show you the Datejust. The Seamaster. Maybe a Tag."\n\n"Here's what they won't show you..."\n\n[Cut to grey market listings on phone]\n"For 10K grey market, you're looking at a Submariner date, a BB58 AND a Cartier Tank."\n\n"The dealer markup is the access tax. Grey market is the cheat code."\n\nCTA: "Link in bio. I'll source it for you."`,
    createdAt: 'Mar 2',
  },
  {
    id: 's5',
    title: 'Why I Stopped Chasing Rolex ADs',
    platform: 'ig',
    status: 'Original',
    source: null,
    body: `Hook: "I spent 6 months trying to get on a Rolex waitlist. Here's why I stopped."\n\n"The AD game is broken. You spend $20K on jewelry you don't want to maybe get a call."\n\n"Or... you go grey market. Pay a premium, sure. But you get the watch you want, when you want it."\n\n"I built my entire business on this idea. Access shouldn't require a relationship."\n\nCTA: "Follow @dialedbyh. I'm the relationship."`,
    createdAt: 'Mar 1',
  },
]

// ─── ACCOUNTABILITY ─────────────────────────────────────────────────────────

export const CHECKLIST_TEMPLATE = [
  { category: 'Content', items: [
    { id: 'a1', label: 'Post 1 piece of content (any platform)' },
    { id: 'a2', label: 'Write or refine 1 script' },
    { id: 'a3', label: 'Run npm run scrape to pull latest competitor posts' },
    { id: 'a4', label: 'Review competitor feed — flag 1 post to remix' },
    { id: 'a5', label: 'Engage: 15 min commenting on watch content (IG/TikTok)' },
  ]},
  { category: 'Client Outreach', items: [
    { id: 'a6', label: 'Send 5 DMs to potential Dialed by H clients' },
    { id: 'a7', label: 'Follow up with 3 existing leads' },
    { id: 'a8', label: 'Respond to all pending DMs/emails within 2 hours' },
  ]},
  { category: 'Ads & Growth', items: [
    { id: 'a9', label: 'Check Meta Ads Manager — review spend + ROAS' },
    { id: 'a10', label: 'Adjust 1 ad set if underperforming (or note "all good")' },
    { id: 'a11', label: 'Post 1 story (IG) for organic reach' },
  ]},
  { category: 'BWC / Business', items: [
    { id: 'a12', label: '1 BWC-related task (website, outreach, membership)' },
    { id: 'a13', label: 'Update Notion inventory if any new watches sourced' },
    { id: 'a14', label: 'Log any revenue/deals in tracking sheet' },
  ]},
]

export const WEEKLY_DATA = {
  days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
  rows: [
    { label: 'Content posted', values: [1, 1, 0, 1, 1, 0, null] },
    { label: 'Scripts written', values: [2, 1, 1, 0, 1, 1, null] },
    { label: 'Outreach DMs', values: [5, 3, 5, 5, 2, 0, null] },
    { label: 'Competitor scrapes', values: [true, true, false, true, true, false, null] },
    { label: 'Ads reviewed', values: [true, true, false, true, true, false, null] },
  ],
}

// ─── CALENDAR ───────────────────────────────────────────────────────────────

export const CALENDAR_EVENTS = {
  1: [{ title: 'Submariner vs. Seamaster: Grey market value', platform: 'substack', status: 'published' }],
  3: [{ title: 'Why I left corporate finance for watches', platform: 'ig', status: 'published' }],
  7: [{ title: 'Watch of the Day: Cartier Santos', platform: 'ig', status: 'scheduled' }],
  10: [{ title: 'AP Royal Oak 15500', platform: 'ig', status: 'scheduled' }],
  12: [{ title: 'Grey Market Authenticity Guide', platform: 'tiktok', status: 'scheduled' }],
  14: [{ title: 'Watches and Wonders Preview', platform: 'substack', status: 'draft' }],
  17: [{ title: 'Collection Tier List', platform: 'ig', status: 'idea' }],
  20: [{ title: "First Watch Buyer's Guide", platform: 'tiktok', status: 'idea' }],
}
