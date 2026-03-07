import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getAccountByHandle, getAccountStats } from '../lib/api'
import { ArrowLeft, Heart, MessageCircle, Play, Trophy, TrendingUp, BarChart3 } from 'lucide-react'

const TIER_COLORS = {
  core: 'bg-blue-50 text-blue-700',
  primary: 'bg-purple-50 text-purple-700',
  ecosystem: 'bg-gray-50 text-gray-600',
  discovered: 'bg-amber-50 text-amber-700',
}

export default function CompetitorDetailPage() {
  const { handle } = useParams()
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

  return (
    <section className="fade-up d2 py-12 px-6">
      <div className="max-w-[1080px] mx-auto">
        {/* Back + Header */}
        <Link to="/competitors" className="inline-flex items-center gap-1 text-[13px] text-secondary hover:text-primary mb-6">
          <ArrowLeft size={14} /> Back to landscape
        </Link>

        <div className="card p-6 mb-8">
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

          {/* Stats Row */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-6">
            <MiniStat label="Posts" value={stats.totalPosts} />
            <MiniStat label="Avg Likes" value={formatNumber(stats.avgLikes)} />
            <MiniStat label="Avg Views" value={formatNumber(stats.avgViews)} />
            <MiniStat label="Avg Comments" value={formatNumber(stats.avgComments)} />
            <MiniStat label="Winners" value={stats.winnerCount} accent />
          </div>
        </div>

        {/* Winning Formula */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Content Pillars */}
          <div className="card p-5">
            <h2 className="text-[14px] font-semibold text-primary mb-4 flex items-center gap-2">
              <BarChart3 size={14} /> Content Pillars
            </h2>
            {pillarBreakdown.length > 0 ? (
              <div className="space-y-2">
                {pillarBreakdown.map(p => (
                  <div key={p.content_pillar} className="flex items-center gap-3">
                    <span className="text-[12px] text-primary w-32 truncate">{p.content_pillar}</span>
                    <div className="flex-1 bg-bg-alt rounded-full h-2">
                      <div
                        className="bg-primary/60 h-2 rounded-full"
                        style={{ width: `${(p.count / pillarBreakdown[0].count) * 100}%` }}
                      />
                    </div>
                    <span className="text-[11px] text-secondary w-6 text-right">{p.count}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[12px] text-secondary">No classified posts yet. Run scoring to classify.</p>
            )}
          </div>

          {/* Hook Types */}
          <div className="card p-5">
            <h2 className="text-[14px] font-semibold text-primary mb-4 flex items-center gap-2">
              <TrendingUp size={14} /> Hook Types
            </h2>
            {hookBreakdown.length > 0 ? (
              <div className="space-y-2">
                {hookBreakdown.map(h => (
                  <div key={h.hook_type} className="flex items-center gap-3">
                    <span className="text-[12px] text-primary w-32 truncate">{h.hook_type}</span>
                    <div className="flex-1 bg-bg-alt rounded-full h-2">
                      <div
                        className="bg-primary/60 h-2 rounded-full"
                        style={{ width: `${(h.count / hookBreakdown[0].count) * 100}%` }}
                      />
                    </div>
                    <span className="text-[11px] text-secondary w-6 text-right">{h.count}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[12px] text-secondary">No classified posts yet. Run scoring to classify.</p>
            )}
          </div>
        </div>

        {/* Performance Over Time - Simple SVG Line Chart */}
        {data.recentSnapshots?.length > 1 && (
          <div className="card p-5 mb-8">
            <h2 className="text-[14px] font-semibold text-primary mb-4">Performance Over Time</h2>
            <PerformanceChart snapshots={data.recentSnapshots} />
          </div>
        )}

        {/* Top Posts */}
        <div className="card p-5">
          <h2 className="text-[14px] font-semibold text-primary mb-4 flex items-center gap-2">
            <Trophy size={14} /> Top Posts by Virality
          </h2>
          {topPosts.length > 0 ? (
            <div className="space-y-3">
              {topPosts.map((post, i) => (
                <div key={post.id} className="flex items-start gap-3 pb-3 border-b border-border last:border-0">
                  <span className="text-[12px] font-medium text-secondary w-5 pt-0.5">#{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] text-primary line-clamp-2">{post.caption || 'No caption'}</p>
                    <div className="flex items-center gap-4 mt-2 text-[11px] text-secondary">
                      <span className="flex items-center gap-1"><Heart size={11} />{formatNumber(post.likes)}</span>
                      <span className="flex items-center gap-1"><MessageCircle size={11} />{formatNumber(post.comments)}</span>
                      {post.views > 0 && <span className="flex items-center gap-1"><Play size={11} />{formatNumber(post.views)}</span>}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-[15px] font-semibold text-primary">{post.virality_score}</div>
                    <div className="text-[10px] text-secondary">virality</div>
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
      <div className={`text-[20px] font-semibold ${accent ? 'text-amber-600' : 'text-primary'}`}>{value}</div>
      <div className="text-[11px] text-secondary">{label}</div>
    </div>
  )
}

function PerformanceChart({ snapshots }) {
  const sorted = [...snapshots].reverse()
  const maxViews = Math.max(...sorted.map(s => s.avg_views || 0), 1)
  const w = 600, h = 150, pad = 30

  const points = sorted.map((s, i) => {
    const x = pad + (i / Math.max(sorted.length - 1, 1)) * (w - pad * 2)
    const y = h - pad - ((s.avg_views || 0) / maxViews) * (h - pad * 2)
    return `${x},${y}`
  }).join(' ')

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-auto">
      <polyline fill="none" stroke="currentColor" strokeWidth="2" className="text-primary/40" points={points} />
      {sorted.map((s, i) => {
        const x = pad + (i / Math.max(sorted.length - 1, 1)) * (w - pad * 2)
        const y = h - pad - ((s.avg_views || 0) / maxViews) * (h - pad * 2)
        return <circle key={i} cx={x} cy={y} r="3" className="fill-primary/60" />
      })}
    </svg>
  )
}

function formatNumber(n) {
  if (!n) return '0'
  if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M'
  if (n >= 1000) return (n / 1000).toFixed(1) + 'K'
  return n.toString()
}
