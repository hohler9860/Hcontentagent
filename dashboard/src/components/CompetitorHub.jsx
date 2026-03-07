import { useState } from 'react'
import { Instagram, Music2, ArrowRight, Search, ExternalLink, Heart, MessageCircle, Play } from 'lucide-react'
import { COMPETITOR_PROFILES } from '../data/mock-data'

const PLATFORM_ICON = { ig: Instagram, tiktok: Music2 }

function timeAgo(timestamp) {
  if (!timestamp) return ''
  const diff = Date.now() - new Date(timestamp).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 30) return `${days}d ago`
  return `${Math.floor(days / 30)}mo ago`
}

function formatNum(n) {
  if (!n) return '0'
  if (n >= 1000000) return (n / 1000000).toFixed(1).replace(/\.0$/, '') + 'M'
  if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, '') + 'K'
  return n.toString()
}

function computeStats(posts) {
  const byProfile = {}
  for (const p of posts) {
    const user = p.ownerUsername || 'unknown'
    if (!byProfile[user]) byProfile[user] = { posts: [], totalLikes: 0, totalComments: 0, totalViews: 0 }
    byProfile[user].posts.push(p)
    byProfile[user].totalLikes += p.likesCount || 0
    byProfile[user].totalComments += p.commentsCount || 0
    byProfile[user].totalViews += p.videoPlayCount || p.videoViewCount || 0
  }

  return Object.entries(byProfile).map(([username, data]) => {
    const count = data.posts.length
    return {
      username,
      postCount: count,
      avgLikes: Math.round(data.totalLikes / count),
      avgComments: Math.round(data.totalComments / count),
      avgViews: Math.round(data.totalViews / count),
      totalLikes: data.totalLikes,
    }
  })
}

function ProfileCard({ profile }) {
  return (
    <div className="card p-5">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-[17px] font-semibold text-primary">{profile.handle}</span>
        <span className="text-[11px] text-secondary bg-black/[0.04] px-2 py-0.5 rounded-full">{profile.platform}</span>
      </div>
      <div className="space-y-1.5 text-[13px] text-secondary">
        <p><span className="text-black/30">Style:</span> {profile.style}</p>
        <p><span className="text-black/30">Why:</span> {profile.why}</p>
      </div>
    </div>
  )
}

export default function CompetitorHub({ competitorPosts, onRemix }) {
  const [search, setSearch] = useState('')
  const [filterUser, setFilterUser] = useState('all')
  const [sortBy, setSortBy] = useState('recent')

  const stats = computeStats(competitorPosts)
  const usernames = [...new Set(competitorPosts.map(p => p.ownerUsername))]

  let filtered = competitorPosts
  if (filterUser !== 'all') filtered = filtered.filter(p => p.ownerUsername === filterUser)
  if (search) filtered = filtered.filter(p => (p.caption || '').toLowerCase().includes(search.toLowerCase()))

  if (sortBy === 'recent') filtered = [...filtered].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
  else if (sortBy === 'likes') filtered = [...filtered].sort((a, b) => (b.likesCount || 0) - (a.likesCount || 0))
  else if (sortBy === 'comments') filtered = [...filtered].sort((a, b) => (b.commentsCount || 0) - (a.commentsCount || 0))
  else if (sortBy === 'views') filtered = [...filtered].sort((a, b) => (b.videoPlayCount || 0) - (a.videoPlayCount || 0))

  return (
    <section id="competitors" className="fade-up d3 py-16 px-6">
      <div className="max-w-[1080px] mx-auto">
        <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-secondary mb-2">Competitor Intelligence</p>
        <h2 className="text-[24px] font-semibold tracking-[-0.02em] mb-8 text-primary">Know the landscape.</h2>

        {/* Profiles */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-10">
          {COMPETITOR_PROFILES.map(c => <ProfileCard key={c.handle} profile={c} />)}
        </div>

        {/* Stats from scraped data */}
        {stats.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
            {stats.map(s => (
              <div key={s.username} className="card p-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-secondary mb-2">@{s.username}</p>
                <div className="grid grid-cols-2 gap-2 text-[12px]">
                  <div><span className="text-secondary">Posts:</span> <span className="font-medium text-primary">{s.postCount}</span></div>
                  <div><span className="text-secondary">Avg Likes:</span> <span className="font-medium text-primary">{formatNum(s.avgLikes)}</span></div>
                  <div><span className="text-secondary">Avg Views:</span> <span className="font-medium text-primary">{formatNum(s.avgViews)}</span></div>
                  <div><span className="text-secondary">Avg Comments:</span> <span className="font-medium text-primary">{formatNum(s.avgComments)}</span></div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <h3 className="text-[15px] font-semibold text-primary mr-auto">Scraped Posts</h3>
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search captions..."
              className="pl-8 pr-3 py-1.5 bg-white border border-border rounded-lg text-[13px] text-primary placeholder:text-black/25 w-48"
            />
          </div>
          <select
            value={filterUser}
            onChange={e => setFilterUser(e.target.value)}
            className="bg-white border border-border rounded-lg px-3 py-1.5 text-[13px] text-primary appearance-none cursor-pointer"
          >
            <option value="all">All creators</option>
            {usernames.map(u => <option key={u} value={u}>@{u}</option>)}
          </select>
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
            className="bg-white border border-border rounded-lg px-3 py-1.5 text-[13px] text-primary appearance-none cursor-pointer"
          >
            <option value="recent">Most Recent</option>
            <option value="likes">Most Likes</option>
            <option value="comments">Most Comments</option>
            <option value="views">Most Views</option>
          </select>
        </div>

        {/* Post list */}
        {competitorPosts.length === 0 ? (
          <div className="card p-8 text-center">
            <p className="text-[14px] text-secondary mb-2">No scraped data yet.</p>
            <p className="text-[13px] text-secondary">Run <code className="bg-black/[0.04] px-1.5 py-0.5 rounded text-[12px]">npm run scrape</code> to pull competitor posts.</p>
          </div>
        ) : filtered.length === 0 ? (
          <p className="text-[13px] text-secondary py-4">No posts match your filters.</p>
        ) : (
          <div className="space-y-2">
            {filtered.slice(0, 20).map(post => (
              <div key={post.id || post.shortCode} className="card flex items-start gap-4 p-4">
                {post.displayUrl && (
                  <img
                    src={post.displayUrl}
                    alt=""
                    className="w-16 h-16 rounded-lg object-cover shrink-0 bg-black/[0.03]"
                    loading="lazy"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[13px] font-medium text-primary">@{post.ownerUsername}</span>
                    <span className="text-[11px] text-secondary">{timeAgo(post.timestamp)}</span>
                    {post.isPinned && <span className="text-[10px] text-secondary bg-black/[0.04] px-1.5 py-0.5 rounded-full">Pinned</span>}
                  </div>
                  <p className="text-[13px] text-primary/80 line-clamp-2">{post.caption || '(no caption)'}</p>
                  <div className="flex items-center gap-4 mt-2 text-[12px] text-secondary">
                    <span className="flex items-center gap-1"><Heart size={11} /> {formatNum(post.likesCount)}</span>
                    <span className="flex items-center gap-1"><MessageCircle size={11} /> {formatNum(post.commentsCount)}</span>
                    {(post.videoPlayCount || post.videoViewCount) && (
                      <span className="flex items-center gap-1"><Play size={11} /> {formatNum(post.videoPlayCount || post.videoViewCount)}</span>
                    )}
                    {post.url && (
                      <a href={post.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-primary transition-colors ml-auto">
                        <ExternalLink size={11} /> View
                      </a>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => onRemix(post)}
                  className="flex items-center gap-1 text-[12px] text-secondary hover:text-primary transition-colors bg-transparent border-0 cursor-pointer whitespace-nowrap shrink-0 mt-1"
                >
                  Remix <ArrowRight size={12} />
                </button>
              </div>
            ))}
          </div>
        )}

        <p className="text-[11px] text-secondary mt-4">{filtered.length} posts total{filtered.length > 20 ? ' (showing first 20)' : ''}</p>
      </div>
    </section>
  )
}
