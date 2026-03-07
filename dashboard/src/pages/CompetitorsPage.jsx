import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getAccounts, getPosts } from '../lib/api'
import { Search, ExternalLink, Heart, MessageCircle, Play, Eye, ChevronRight, Users } from 'lucide-react'

const TIER_COLORS = {
  core: 'bg-blue-50 text-blue-700',
  primary: 'bg-purple-50 text-purple-700',
  ecosystem: 'bg-gray-50 text-gray-600',
  discovered: 'bg-amber-50 text-amber-700',
}

export default function CompetitorsPage() {
  const [accounts, setAccounts] = useState([])
  const [posts, setPosts] = useState([])
  const [search, setSearch] = useState('')
  const [tierFilter, setTierFilter] = useState('all')
  const [sortBy, setSortBy] = useState('recent')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      getAccounts().catch(() => []),
      getPosts({ limit: 100, sort: 'timestamp', order: 'desc' }).catch(() => ({ posts: [] })),
    ]).then(([accts, postData]) => {
      setAccounts(accts)
      setPosts(postData.posts || [])
      setLoading(false)
    })
  }, [])

  const filteredAccounts = accounts.filter(a => {
    if (tierFilter !== 'all' && a.tier !== tierFilter) return false
    if (search && !a.handle.toLowerCase().includes(search.toLowerCase()) && !a.display_name?.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  const sortedPosts = [...posts].sort((a, b) => {
    if (sortBy === 'likes') return (b.likes || 0) - (a.likes || 0)
    if (sortBy === 'views') return (b.views || 0) - (a.views || 0)
    if (sortBy === 'comments') return (b.comments || 0) - (a.comments || 0)
    return new Date(b.timestamp) - new Date(a.timestamp)
  })

  const filteredPosts = sortedPosts.filter(p => {
    if (search && !p.handle?.toLowerCase().includes(search.toLowerCase()) && !p.caption?.toLowerCase().includes(search.toLowerCase())) return false
    if (tierFilter !== 'all' && p.tier !== tierFilter) return false
    return true
  })

  return (
    <section className="fade-up d2 py-12 px-6">
      <div className="max-w-[1080px] mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-[20px] font-semibold text-primary">Competitor Landscape</h1>
          <div className="flex items-center gap-2 text-[11px] text-secondary">
            <Users size={14} />
            <span>{accounts.length} accounts tracked</span>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-8">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary" />
            <input
              type="text"
              placeholder="Search accounts or posts..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-[13px] border border-border rounded-lg bg-white focus:outline-none focus:border-primary/30"
            />
          </div>
          <select
            value={tierFilter}
            onChange={e => setTierFilter(e.target.value)}
            className="text-[13px] border border-border rounded-lg px-3 py-2 bg-white"
          >
            <option value="all">All Tiers</option>
            <option value="core">Core</option>
            <option value="primary">Primary</option>
            <option value="ecosystem">Ecosystem</option>
            <option value="discovered">Discovered</option>
          </select>
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
            className="text-[13px] border border-border rounded-lg px-3 py-2 bg-white"
          >
            <option value="recent">Most Recent</option>
            <option value="likes">Most Likes</option>
            <option value="views">Most Views</option>
            <option value="comments">Most Comments</option>
          </select>
        </div>

        {/* Landscape Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mb-12">
          {filteredAccounts.map(account => (
            <Link
              key={account.id}
              to={`/competitors/${account.handle}`}
              className="card p-4 hover:border-primary/20 transition-all group"
            >
              <div className="flex items-center justify-between mb-2">
                <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${TIER_COLORS[account.tier]}`}>
                  {account.tier}
                </span>
                <ChevronRight size={12} className="text-secondary opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <div className="text-[14px] font-medium text-primary">@{account.handle}</div>
              <div className="text-[11px] text-secondary mt-1 line-clamp-2">{account.style_notes || account.display_name}</div>
              {account.followers > 0 && (
                <div className="text-[11px] text-secondary mt-2">{formatNumber(account.followers)} followers</div>
              )}
            </Link>
          ))}
        </div>

        {/* Unified Post Feed */}
        <h2 className="text-[15px] font-semibold text-primary mb-4">Recent Posts</h2>
        {loading ? (
          <p className="text-[13px] text-secondary">Loading posts...</p>
        ) : filteredPosts.length === 0 ? (
          <p className="text-[13px] text-secondary">No posts yet. Run a scrape from Settings to populate.</p>
        ) : (
          <div className="grid gap-3">
            {filteredPosts.slice(0, 30).map(post => (
              <div key={post.id} className="card p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Link to={`/competitors/${post.handle}`} className="text-[12px] font-medium text-primary hover:underline">
                    @{post.handle}
                  </Link>
                  {post.tier && (
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${TIER_COLORS[post.tier]}`}>
                      {post.tier}
                    </span>
                  )}
                  {post.is_winner === 1 && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-50 text-amber-700">winner</span>
                  )}
                  <span className="text-[11px] text-secondary ml-auto">
                    {post.timestamp ? new Date(post.timestamp).toLocaleDateString() : ''}
                  </span>
                </div>
                <p className="text-[13px] text-primary line-clamp-2">{post.caption}</p>
                <div className="flex items-center gap-4 mt-3 text-[11px] text-secondary">
                  <span className="flex items-center gap-1"><Heart size={12} />{formatNumber(post.likes)}</span>
                  <span className="flex items-center gap-1"><MessageCircle size={12} />{formatNumber(post.comments)}</span>
                  {post.views > 0 && <span className="flex items-center gap-1"><Play size={12} />{formatNumber(post.views)}</span>}
                  {post.virality_score && <span className="flex items-center gap-1"><Eye size={12} />{post.virality_score} virality</span>}
                  {post.url && (
                    <a href={post.url} target="_blank" rel="noopener noreferrer" className="ml-auto hover:text-primary">
                      <ExternalLink size={12} />
                    </a>
                  )}
                </div>
              </div>
            ))}
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
