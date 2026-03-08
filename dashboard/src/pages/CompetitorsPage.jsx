import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getAccounts, getPosts } from '../lib/api'
import { Search, ExternalLink, Heart, MessageCircle, Play, Eye, ChevronRight, Users, Sparkles, Filter, X } from 'lucide-react'

const TIER_COLORS = {
  core: 'bg-blue-50 text-blue-700',
  primary: 'bg-purple-50 text-purple-700',
  ecosystem: 'bg-gray-50 text-gray-600',
  discovered: 'bg-amber-50 text-amber-700',
}

const PILLAR_COLORS = {
  'market-analysis': 'bg-emerald-50 text-emerald-700',
  'product-review': 'bg-blue-50 text-blue-700',
  'hot-take': 'bg-red-50 text-red-700',
  'educational': 'bg-indigo-50 text-indigo-700',
  'lifestyle': 'bg-pink-50 text-pink-700',
  'behind-the-scenes': 'bg-orange-50 text-orange-700',
  'comparison': 'bg-cyan-50 text-cyan-700',
  'news': 'bg-yellow-50 text-yellow-800',
  'humor': 'bg-purple-50 text-purple-700',
  'personal-story': 'bg-teal-50 text-teal-700',
}

const HOOK_COLORS = {
  'question': 'bg-blue-50 text-blue-600',
  'bold-statement': 'bg-gray-100 text-gray-700',
  'pov': 'bg-violet-50 text-violet-700',
  'hot-take': 'bg-red-50 text-red-600',
  'controversy': 'bg-orange-50 text-orange-700',
  'curiosity-gap': 'bg-amber-50 text-amber-700',
  'listicle': 'bg-green-50 text-green-700',
  'story': 'bg-indigo-50 text-indigo-700',
  'challenge': 'bg-pink-50 text-pink-700',
  'statistic': 'bg-cyan-50 text-cyan-700',
  'statement': 'bg-gray-50 text-gray-600',
}

export default function CompetitorsPage() {
  const navigate = useNavigate()
  const [accounts, setAccounts] = useState([])
  const [posts, setPosts] = useState([])
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState('virality_score')
  const [loading, setLoading] = useState(true)
  const [selectedAccounts, setSelectedAccounts] = useState(new Set())
  const [pillarFilter, setPillarFilter] = useState('all')
  const [hookFilter, setHookFilter] = useState('all')
  const [showWinnersOnly, setShowWinnersOnly] = useState(false)

  useEffect(() => {
    Promise.all([
      getAccounts().catch(() => []),
      getPosts({ limit: 500, sort: 'virality_score', order: 'desc' }).catch(() => ({ posts: [] })),
    ]).then(([accts, postData]) => {
      setAccounts(accts)
      setPosts(postData.posts || [])
      setSelectedAccounts(new Set(accts.map(a => a.handle)))
      setLoading(false)
    })
  }, [])

  function toggleAccount(handle) {
    setSelectedAccounts(prev => {
      const next = new Set(prev)
      if (next.has(handle)) next.delete(handle)
      else next.add(handle)
      return next
    })
  }

  function selectTier(tier) {
    const tierHandles = accounts.filter(a => a.tier === tier).map(a => a.handle)
    const allSelected = tierHandles.every(h => selectedAccounts.has(h))
    setSelectedAccounts(prev => {
      const next = new Set(prev)
      tierHandles.forEach(h => allSelected ? next.delete(h) : next.add(h))
      return next
    })
  }

  function selectAll() {
    setSelectedAccounts(new Set(accounts.map(a => a.handle)))
  }

  function selectNone() {
    setSelectedAccounts(new Set())
  }

  const filteredPosts = posts.filter(p => {
    if (!selectedAccounts.has(p.handle)) return false
    if (search && !p.handle?.toLowerCase().includes(search.toLowerCase()) && !p.caption?.toLowerCase().includes(search.toLowerCase())) return false
    if (pillarFilter !== 'all' && p.content_pillar !== pillarFilter) return false
    if (hookFilter !== 'all' && p.hook_type !== hookFilter) return false
    if (showWinnersOnly && !p.is_winner) return false
    return true
  })

  const sortedPosts = [...filteredPosts].sort((a, b) => {
    if (sortBy === 'likes') return (b.likes || 0) - (a.likes || 0)
    if (sortBy === 'views') return (b.views || 0) - (a.views || 0)
    if (sortBy === 'comments') return (b.comments || 0) - (a.comments || 0)
    if (sortBy === 'virality_score') return (b.virality_score || 0) - (a.virality_score || 0)
    return new Date(b.timestamp) - new Date(a.timestamp)
  })

  // Get unique pillars/hooks for filters
  const allPillars = [...new Set(posts.map(p => p.content_pillar).filter(Boolean))]
  const allHooks = [...new Set(posts.map(p => p.hook_type).filter(Boolean))]

  // Group accounts by tier for toggle section
  const byTier = {}
  for (const a of accounts) {
    if (!byTier[a.tier]) byTier[a.tier] = []
    byTier[a.tier].push(a)
  }

  function handleRemix(post) {
    const params = new URLSearchParams({
      remix: post.id,
      handle: post.handle || '',
      caption: (post.caption || '').slice(0, 200),
      likes: post.likes || 0,
      views: post.views || 0,
    })
    navigate(`/scripts?${params}`)
  }

  return (
    <section className="fade-up d2 py-12 px-6">
      <div className="max-w-[1080px] mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-[20px] font-semibold text-primary">Competitor Landscape</h1>
          <div className="flex items-center gap-2 text-[11px] text-secondary">
            <Users size={14} />
            <span>{accounts.length} tracked · {selectedAccounts.size} active · {filteredPosts.length} posts</span>
          </div>
        </div>

        {/* Account Toggles */}
        <div className="card p-4 mb-6">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-secondary">Filter by Account</span>
            <div className="flex gap-2">
              <button onClick={selectAll} className="text-[11px] text-primary hover:underline">All</button>
              <button onClick={selectNone} className="text-[11px] text-secondary hover:underline">None</button>
            </div>
          </div>
          {['core', 'primary', 'ecosystem', 'discovered'].map(tier => byTier[tier]?.length > 0 && (
            <div key={tier} className="mb-2 last:mb-0">
              <button
                onClick={() => selectTier(tier)}
                className="text-[10px] font-medium uppercase tracking-wider text-secondary mb-1.5 hover:text-primary inline-block"
              >
                {tier}
              </button>
              <div className="flex flex-wrap gap-1.5">
                {byTier[tier].map(a => {
                  const active = selectedAccounts.has(a.handle)
                  return (
                    <button
                      key={a.id}
                      onClick={() => toggleAccount(a.handle)}
                      className={`text-[12px] px-2.5 py-1 rounded-full border transition-all ${
                        active
                          ? 'bg-primary text-white border-primary'
                          : 'bg-white text-secondary border-border hover:border-primary/30'
                      }`}
                    >
                      @{a.handle}
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Filters Row */}
        <div className="flex flex-wrap gap-2 mb-6">
          <div className="relative flex-1 min-w-[180px]">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary" />
            <input
              type="text"
              placeholder="Search posts..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-[13px] border border-border rounded-lg bg-white focus:outline-none focus:border-primary/30"
            />
          </div>
          <select value={pillarFilter} onChange={e => setPillarFilter(e.target.value)}
            className="text-[12px] border border-border rounded-lg px-2 py-2 bg-white">
            <option value="all">All Pillars</option>
            {allPillars.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
          <select value={hookFilter} onChange={e => setHookFilter(e.target.value)}
            className="text-[12px] border border-border rounded-lg px-2 py-2 bg-white">
            <option value="all">All Hooks</option>
            {allHooks.map(h => <option key={h} value={h}>{h}</option>)}
          </select>
          <select value={sortBy} onChange={e => setSortBy(e.target.value)}
            className="text-[12px] border border-border rounded-lg px-2 py-2 bg-white">
            <option value="virality_score">Virality</option>
            <option value="recent">Recent</option>
            <option value="likes">Likes</option>
            <option value="views">Views</option>
          </select>
          <button
            onClick={() => setShowWinnersOnly(!showWinnersOnly)}
            className={`text-[12px] px-3 py-2 rounded-lg border transition-all ${
              showWinnersOnly ? 'bg-amber-50 border-amber-200 text-amber-700' : 'border-border text-secondary hover:border-primary/30'
            }`}
          >
            Winners Only
          </button>
        </div>

        {/* Post Feed */}
        {loading ? (
          <p className="text-[13px] text-secondary">Loading posts...</p>
        ) : sortedPosts.length === 0 ? (
          <p className="text-[13px] text-secondary">No posts match your filters. Run a scrape from Settings to populate.</p>
        ) : (
          <div className="grid gap-3">
            {sortedPosts.slice(0, 50).map(post => (
              <div key={post.id} className="card p-4 hover:border-primary/10 transition-all">
                {/* Top row: handle + badges */}
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <Link to={`/competitors/${post.handle}`} className="text-[12px] font-medium text-primary hover:underline">
                    @{post.handle}
                  </Link>
                  {post.tier && (
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${TIER_COLORS[post.tier]}`}>
                      {post.tier}
                    </span>
                  )}
                  {post.is_winner === 1 && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-50 text-amber-700 font-medium">winner</span>
                  )}
                  {post.content_pillar && (
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${PILLAR_COLORS[post.content_pillar] || 'bg-gray-50 text-gray-600'}`}>
                      {post.content_pillar}
                    </span>
                  )}
                  {post.hook_type && (
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${HOOK_COLORS[post.hook_type] || 'bg-gray-50 text-gray-600'}`}>
                      {post.hook_type}
                    </span>
                  )}
                  <span className="text-[11px] text-secondary ml-auto shrink-0">
                    {post.timestamp ? new Date(post.timestamp).toLocaleDateString() : ''}
                  </span>
                </div>

                {/* Caption */}
                <p className="text-[13px] text-primary leading-relaxed">{post.caption || 'No caption'}</p>

                {/* Metrics + Actions */}
                <div className="flex items-center gap-4 mt-3 text-[11px] text-secondary">
                  <span className="flex items-center gap-1"><Heart size={12} />{formatNumber(post.likes)}</span>
                  <span className="flex items-center gap-1"><MessageCircle size={12} />{formatNumber(post.comments)}</span>
                  {post.views > 0 && <span className="flex items-center gap-1"><Play size={12} />{formatNumber(post.views)}</span>}
                  {post.virality_score > 0 && (
                    <span className="flex items-center gap-1 font-medium text-primary">
                      <Eye size={12} />{post.virality_score}
                    </span>
                  )}
                  <div className="ml-auto flex items-center gap-2">
                    <button
                      onClick={() => handleRemix(post)}
                      className="flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-full bg-primary text-white hover:bg-primary/90 transition-colors"
                    >
                      <Sparkles size={11} /> Remix
                    </button>
                    {post.url && (
                      <a href={post.url} target="_blank" rel="noopener noreferrer" className="hover:text-primary">
                        <ExternalLink size={12} />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {sortedPosts.length > 50 && (
              <p className="text-[12px] text-secondary text-center py-4">Showing top 50 of {sortedPosts.length} posts</p>
            )}
          </div>
        )}
      </div>
    </section>
  )
}

function formatNumber(n) {
  if (!n) return '0'
  if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M'
  if (n >= 1000) return (n / 1000).toFixed(1) + 'K'
  return n.toString()
}
