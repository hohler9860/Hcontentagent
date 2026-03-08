import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { getAccountByHandle, getAccountStats } from '../lib/api'
import { ArrowLeft, Heart, MessageCircle, Play, Trophy, TrendingUp, BarChart3, Sparkles, ExternalLink } from 'lucide-react'

const TIER_COLORS = {
  core: 'bg-blue-50 text-blue-700',
  primary: 'bg-purple-50 text-purple-700',
  ecosystem: 'bg-gray-50 text-gray-600',
  discovered: 'bg-amber-50 text-amber-700',
}

const PILLAR_COLORS = {
  'market-analysis': 'bg-emerald-100 text-emerald-800',
  'product-review': 'bg-blue-100 text-blue-800',
  'hot-take': 'bg-red-100 text-red-800',
  'educational': 'bg-indigo-100 text-indigo-800',
  'lifestyle': 'bg-pink-100 text-pink-800',
  'behind-the-scenes': 'bg-orange-100 text-orange-800',
  'comparison': 'bg-cyan-100 text-cyan-800',
  'news': 'bg-yellow-100 text-yellow-800',
  'humor': 'bg-purple-100 text-purple-800',
  'personal-story': 'bg-teal-100 text-teal-800',
}

const HOOK_COLORS = {
  'question': 'bg-blue-100 text-blue-700',
  'bold-statement': 'bg-gray-100 text-gray-700',
  'pov': 'bg-violet-100 text-violet-700',
  'hot-take': 'bg-red-100 text-red-700',
  'controversy': 'bg-orange-100 text-orange-700',
  'curiosity-gap': 'bg-amber-100 text-amber-700',
  'listicle': 'bg-green-100 text-green-700',
  'story': 'bg-indigo-100 text-indigo-700',
}

export default function CompetitorDetailPage() {
  const { handle } = useParams()
  const navigate = useNavigate()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function load() {
      try {
        const account = await getAccountByHandle(handle)
        const stats = await getAccountStats(account.id)
        setData(stats)
      } catch (e) {
        setError(e.message)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [handle])

  if (loading) return <div className="py-20 text-center text-[13px] text-secondary">Loading...</div>
  if (error) return (
    <div className="py-20 text-center">
      <p className="text-[13px] text-secondary mb-4">Could not load @{handle}</p>
      <Link to="/competitors" className="text-[13px] text-primary hover:underline">Back to competitors</Link>
    </div>
  )

  const { account, stats, topPosts, pillarBreakdown, hookBreakdown } = data

  // Compute winning formula insights
  const totalPillarPosts = pillarBreakdown.reduce((s, p) => s + p.count, 0) || 1
  const totalHookPosts = hookBreakdown.reduce((s, h) => s + h.count, 0) || 1

  // Find best performing pillar/hook from top posts
  const winnerPillars = {}
  const winnerHooks = {}
  topPosts.filter(p => p.is_winner).forEach(p => {
    if (p.content_pillar) winnerPillars[p.content_pillar] = (winnerPillars[p.content_pillar] || 0) + 1
    if (p.hook_type) winnerHooks[p.hook_type] = (winnerHooks[p.hook_type] || 0) + 1
  })

  function handleRemix(post) {
    const params = new URLSearchParams({
      remix: post.id,
      handle: handle,
      caption: (post.caption || '').slice(0, 200),
      likes: post.likes || 0,
      views: post.views || 0,
    })
    navigate(`/scripts?${params}`)
  }

  return (
    <section className="fade-up d2 py-12 px-6">
      <div className="max-w-[1080px] mx-auto">
        <Link to="/competitors" className="inline-flex items-center gap-1 text-[13px] text-secondary hover:text-primary mb-6">
          <ArrowLeft size={14} /> Back to landscape
        </Link>

        {/* Profile Header */}
        <div className="card p-6 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-[24px] font-semibold text-primary">@{account.handle}</h1>
              {account.display_name && <p className="text-[14px] text-secondary">{account.display_name}</p>}
            </div>
            <span className={`text-[11px] font-medium px-3 py-1 rounded-full ${TIER_COLORS[account.tier]}`}>
              {account.tier}
            </span>
          </div>
          {account.style_notes && <p className="text-[13px] text-secondary mb-2">{account.style_notes}</p>}
          {account.why_tracking && <p className="text-[12px] text-secondary/70 italic">{account.why_tracking}</p>}

          <div className="grid grid-cols-3 md:grid-cols-6 gap-4 mt-6">
            <MiniStat label="Posts" value={stats.totalPosts} />
            <MiniStat label="Avg Likes" value={formatNumber(stats.avgLikes)} />
            <MiniStat label="Avg Views" value={formatNumber(stats.avgViews)} />
            <MiniStat label="Avg Comments" value={formatNumber(stats.avgComments)} />
            <MiniStat label="Followers" value={formatNumber(account.followers)} />
            <MiniStat label="Winners" value={stats.winnerCount} accent />
          </div>
        </div>

        {/* Winning Formula */}
        {(Object.keys(winnerPillars).length > 0 || Object.keys(winnerHooks).length > 0) && (
          <div className="card p-5 mb-6 bg-amber-50/30 border-amber-100">
            <h2 className="text-[11px] font-bold uppercase tracking-[0.1em] text-amber-800 mb-3 flex items-center gap-2">
              <Trophy size={14} /> Winning Formula
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              {Object.keys(winnerPillars).length > 0 && (
                <div>
                  <span className="text-[11px] text-amber-700 font-medium">Best Content Pillars</span>
                  <div className="flex flex-wrap gap-1.5 mt-1.5">
                    {Object.entries(winnerPillars).sort((a, b) => b[1] - a[1]).map(([p, count]) => (
                      <span key={p} className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${PILLAR_COLORS[p] || 'bg-gray-100 text-gray-700'}`}>
                        {p} ({count})
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {Object.keys(winnerHooks).length > 0 && (
                <div>
                  <span className="text-[11px] text-amber-700 font-medium">Best Hook Types</span>
                  <div className="flex flex-wrap gap-1.5 mt-1.5">
                    {Object.entries(winnerHooks).sort((a, b) => b[1] - a[1]).map(([h, count]) => (
                      <span key={h} className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${HOOK_COLORS[h] || 'bg-gray-100 text-gray-700'}`}>
                        {h} ({count})
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-6 mb-6">
          {/* Content Pillars */}
          <div className="card p-5">
            <h2 className="text-[11px] font-bold uppercase tracking-[0.1em] text-primary mb-4 flex items-center gap-2">
              <BarChart3 size={14} /> Content Pillars
            </h2>
            {pillarBreakdown.length > 0 ? (
              <div className="space-y-2.5">
                {pillarBreakdown.map(p => (
                  <div key={p.content_pillar}>
                    <div className="flex items-center justify-between mb-1">
                      <span className={`text-[11px] px-2 py-0.5 rounded-full ${PILLAR_COLORS[p.content_pillar] || 'bg-gray-50 text-gray-600'}`}>
                        {p.content_pillar}
                      </span>
                      <span className="text-[11px] text-secondary">{p.count} posts ({Math.round(p.count / totalPillarPosts * 100)}%)</span>
                    </div>
                    <div className="w-full bg-bg-alt rounded-full h-2">
                      <div
                        className="bg-primary/50 h-2 rounded-full transition-all"
                        style={{ width: `${(p.count / pillarBreakdown[0].count) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[12px] text-secondary">No classified posts yet.</p>
            )}
          </div>

          {/* Hook Types */}
          <div className="card p-5">
            <h2 className="text-[11px] font-bold uppercase tracking-[0.1em] text-primary mb-4 flex items-center gap-2">
              <TrendingUp size={14} /> Hook Types
            </h2>
            {hookBreakdown.length > 0 ? (
              <div className="space-y-2.5">
                {hookBreakdown.map(h => (
                  <div key={h.hook_type}>
                    <div className="flex items-center justify-between mb-1">
                      <span className={`text-[11px] px-2 py-0.5 rounded-full ${HOOK_COLORS[h.hook_type] || 'bg-gray-50 text-gray-600'}`}>
                        {h.hook_type}
                      </span>
                      <span className="text-[11px] text-secondary">{h.count} posts ({Math.round(h.count / totalHookPosts * 100)}%)</span>
                    </div>
                    <div className="w-full bg-bg-alt rounded-full h-2">
                      <div
                        className="bg-primary/50 h-2 rounded-full transition-all"
                        style={{ width: `${(h.count / hookBreakdown[0].count) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[12px] text-secondary">No classified posts yet.</p>
            )}
          </div>
        </div>

        {/* Top Posts */}
        <div className="card p-5">
          <h2 className="text-[11px] font-bold uppercase tracking-[0.1em] text-primary mb-4 flex items-center gap-2">
            <Trophy size={14} /> Top Posts by Virality
          </h2>
          {topPosts.length > 0 ? (
            <div className="space-y-3">
              {topPosts.map((post, i) => (
                <div key={post.id} className="flex items-start gap-3 pb-3 border-b border-border last:border-0">
                  <span className="text-[14px] font-semibold text-secondary/40 w-6 pt-0.5 shrink-0">#{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] text-primary leading-relaxed">{post.caption || 'No caption'}</p>
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
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
                      {post.is_winner === 1 && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-50 text-amber-700 font-medium">winner</span>
                      )}
                      <span className="text-[11px] text-secondary flex items-center gap-1"><Heart size={11} />{formatNumber(post.likes)}</span>
                      <span className="text-[11px] text-secondary flex items-center gap-1"><MessageCircle size={11} />{formatNumber(post.comments)}</span>
                      {post.views > 0 && <span className="text-[11px] text-secondary flex items-center gap-1"><Play size={11} />{formatNumber(post.views)}</span>}
                    </div>
                  </div>
                  <div className="shrink-0 flex items-center gap-2">
                    <button
                      onClick={() => handleRemix(post)}
                      className="flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-full bg-primary text-white hover:bg-primary/90 transition-colors"
                    >
                      <Sparkles size={11} /> Remix
                    </button>
                    <div className="text-right">
                      <div className="text-[16px] font-semibold text-primary">{post.virality_score || 0}</div>
                      <div className="text-[10px] text-secondary">virality</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-[12px] text-secondary">No scored posts yet.</p>
          )}
        </div>
      </div>
    </section>
  )
}

function MiniStat({ label, value, accent }) {
  return (
    <div>
      <div className={`text-[18px] font-semibold ${accent ? 'text-amber-600' : 'text-primary'}`}>{value}</div>
      <div className="text-[11px] text-secondary">{label}</div>
    </div>
  )
}

function formatNumber(n) {
  if (!n) return '0'
  if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M'
  if (n >= 1000) return (n / 1000).toFixed(1) + 'K'
  return n.toString()
}
