import { useState, useEffect } from 'react'
import { getInsights } from '../lib/api'
import { TrendingUp, BarChart3, Zap, Target, Crown, ArrowUpRight, ArrowDownRight } from 'lucide-react'

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
}

const TIER_COLORS = {
  core: 'text-blue-600',
  primary: 'text-purple-600',
  ecosystem: 'text-gray-500',
  discovered: 'text-amber-600',
}

export default function InsightsPage() {
  const [data, setData] = useState(null)
  const [days, setDays] = useState(30)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    getInsights(days).then(setData).catch(() => {}).finally(() => setLoading(false))
  }, [days])

  if (loading) return <div className="py-20 text-center text-[13px] text-secondary">Loading insights...</div>
  if (!data) return <div className="py-20 text-center text-[13px] text-secondary">Could not load insights. Make sure the server is running.</div>

  const { hookPerformance, pillarPerformance, accountRankings, winningCombos, formatBreakdown } = data

  return (
    <section className="fade-up d2 py-12 px-6">
      <div className="max-w-[1080px] mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-[20px] font-semibold text-primary">Content Intelligence</h1>
            <p className="text-[12px] text-secondary mt-1">Cross-competitor analysis of what's actually working</p>
          </div>
          <div className="flex gap-1 bg-bg-alt rounded-lg p-0.5">
            {[7, 14, 30].map(d => (
              <button
                key={d}
                onClick={() => setDays(d)}
                className={`text-[12px] px-3 py-1.5 rounded-md transition-all ${
                  days === d ? 'bg-white text-primary shadow-sm font-medium' : 'text-secondary hover:text-primary'
                }`}
              >
                {d}d
              </button>
            ))}
          </div>
        </div>

        {/* Hook Performance */}
        <div className="card p-5 mb-6">
          <h2 className="text-[14px] font-semibold text-primary mb-1 flex items-center gap-2">
            <Zap size={14} /> Hook Type Performance
          </h2>
          <p className="text-[11px] text-secondary mb-4">Which hook patterns drive the most engagement across all competitors</p>
          {hookPerformance.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-[12px]">
                <thead>
                  <tr className="border-b border-border text-secondary">
                    <th className="text-left py-2 pr-4 font-medium">Hook Type</th>
                    <th className="text-right py-2 px-3 font-medium">Posts</th>
                    <th className="text-right py-2 px-3 font-medium">Avg Likes</th>
                    <th className="text-right py-2 px-3 font-medium">Avg Views</th>
                    <th className="text-right py-2 px-3 font-medium">Avg Virality</th>
                    <th className="text-right py-2 px-3 font-medium">Winners</th>
                    <th className="text-right py-2 pl-3 font-medium">Win Rate</th>
                  </tr>
                </thead>
                <tbody>
                  {hookPerformance.map((h, i) => (
                    <tr key={h.hook_type} className="border-b border-border/50 hover:bg-bg-alt/50">
                      <td className="py-2.5 pr-4">
                        <span className={`text-[11px] px-2 py-0.5 rounded-full ${HOOK_COLORS[h.hook_type] || 'bg-gray-50 text-gray-600'}`}>
                          {h.hook_type}
                        </span>
                      </td>
                      <td className="text-right py-2.5 px-3 text-primary">{h.count}</td>
                      <td className="text-right py-2.5 px-3 text-primary">{formatNumber(h.avg_likes)}</td>
                      <td className="text-right py-2.5 px-3 text-primary">{formatNumber(h.avg_views)}</td>
                      <td className="text-right py-2.5 px-3">
                        <span className={`font-medium ${h.avg_virality >= 40 ? 'text-green-600' : h.avg_virality >= 25 ? 'text-amber-600' : 'text-primary'}`}>
                          {h.avg_virality}
                        </span>
                      </td>
                      <td className="text-right py-2.5 px-3 text-amber-600 font-medium">{h.winner_count}</td>
                      <td className="text-right py-2.5 pl-3 text-primary">{h.count > 0 ? Math.round(h.winner_count / h.count * 100) : 0}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : <p className="text-[12px] text-secondary">No data yet.</p>}
        </div>

        {/* Content Pillar Performance */}
        <div className="card p-5 mb-6">
          <h2 className="text-[14px] font-semibold text-primary mb-1 flex items-center gap-2">
            <BarChart3 size={14} /> Content Pillar Performance
          </h2>
          <p className="text-[11px] text-secondary mb-4">Which content categories perform best across the watch space</p>
          {pillarPerformance.length > 0 ? (
            <div className="grid gap-3">
              {pillarPerformance.map(p => {
                const maxViews = pillarPerformance[0]?.avg_views || 1
                return (
                  <div key={p.content_pillar} className="flex items-center gap-3">
                    <span className={`text-[11px] px-2 py-0.5 rounded-full shrink-0 w-32 text-center ${PILLAR_COLORS[p.content_pillar] || 'bg-gray-50 text-gray-600'}`}>
                      {p.content_pillar}
                    </span>
                    <div className="flex-1">
                      <div className="w-full bg-bg-alt rounded-full h-3 relative">
                        <div
                          className="bg-primary/40 h-3 rounded-full transition-all"
                          style={{ width: `${Math.max((p.avg_views / maxViews) * 100, 5)}%` }}
                        />
                      </div>
                    </div>
                    <div className="shrink-0 flex gap-4 text-[11px]">
                      <span className="text-secondary">{p.count} posts</span>
                      <span className="text-primary font-medium w-16 text-right">{formatNumber(p.avg_likes)} avg</span>
                      <span className="text-amber-600 font-medium w-8 text-right">{p.winner_count}W</span>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : <p className="text-[12px] text-secondary">No data yet.</p>}
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-6">
          {/* Winning Combos */}
          <div className="card p-5">
            <h2 className="text-[14px] font-semibold text-primary mb-1 flex items-center gap-2">
              <Target size={14} /> Winning Combinations
            </h2>
            <p className="text-[11px] text-secondary mb-4">Hook + Pillar combos that produce winners</p>
            {winningCombos.length > 0 ? (
              <div className="space-y-2">
                {winningCombos.map((c, i) => (
                  <div key={i} className="flex items-center gap-2 p-2 rounded-lg bg-bg-alt/50">
                    <span className="text-[14px] font-semibold text-secondary/40 w-5">#{i + 1}</span>
                    <div className="flex flex-wrap gap-1 flex-1">
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${HOOK_COLORS[c.hook_type] || 'bg-gray-50 text-gray-600'}`}>
                        {c.hook_type}
                      </span>
                      <span className="text-[10px] text-secondary">+</span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${PILLAR_COLORS[c.content_pillar] || 'bg-gray-50 text-gray-600'}`}>
                        {c.content_pillar}
                      </span>
                    </div>
                    <span className="text-[11px] text-primary font-medium">{c.count}x</span>
                    <span className="text-[11px] text-secondary">{c.avg_virality}v</span>
                  </div>
                ))}
              </div>
            ) : <p className="text-[12px] text-secondary">No winners detected yet.</p>}
          </div>

          {/* Account Rankings */}
          <div className="card p-5">
            <h2 className="text-[14px] font-semibold text-primary mb-1 flex items-center gap-2">
              <Crown size={14} /> Account Rankings
            </h2>
            <p className="text-[11px] text-secondary mb-4">Who's performing best right now</p>
            {accountRankings.length > 0 ? (
              <div className="space-y-2">
                {accountRankings.slice(0, 10).map((a, i) => (
                  <div key={a.handle} className="flex items-center gap-2 p-2 rounded-lg hover:bg-bg-alt/50">
                    <span className="text-[14px] font-semibold text-secondary/40 w-5">#{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <span className={`text-[12px] font-medium ${TIER_COLORS[a.tier] || 'text-primary'}`}>@{a.handle}</span>
                      <span className="text-[10px] text-secondary ml-1.5">{a.post_count} posts</span>
                    </div>
                    <div className="flex items-center gap-3 shrink-0 text-[11px]">
                      <span className="text-primary font-medium">{a.avg_virality} avg</span>
                      <span className="text-secondary">{a.peak_virality} peak</span>
                      {a.winners > 0 && <span className="text-amber-600 font-medium">{a.winners}W</span>}
                    </div>
                  </div>
                ))}
              </div>
            ) : <p className="text-[12px] text-secondary">No data yet.</p>}
          </div>
        </div>

        {/* Key Takeaways */}
        {hookPerformance.length > 0 && pillarPerformance.length > 0 && (
          <div className="card p-5 bg-primary/[0.02] border-primary/10">
            <h2 className="text-[14px] font-semibold text-primary mb-3 flex items-center gap-2">
              <TrendingUp size={14} /> Key Takeaways for Dialed by H
            </h2>
            <div className="space-y-2 text-[13px] text-primary/80">
              {hookPerformance[0] && (
                <p>
                  <strong>{hookPerformance[0].hook_type}</strong> hooks perform best with {formatNumber(hookPerformance[0].avg_views)} avg views
                  and a {hookPerformance[0].count > 0 ? Math.round(hookPerformance[0].winner_count / hookPerformance[0].count * 100) : 0}% winner rate.
                  {hookPerformance[0].hook_type === 'question' && ' Ask questions that make people stop and think.'}
                  {hookPerformance[0].hook_type === 'bold-statement' && ' Lead with confidence and conviction.'}
                  {hookPerformance[0].hook_type === 'controversy' && ' Lean into hot takes — they drive engagement.'}
                </p>
              )}
              {pillarPerformance[0] && (
                <p>
                  <strong>{pillarPerformance[0].content_pillar}</strong> content is the top-performing pillar
                  with {formatNumber(pillarPerformance[0].avg_likes)} avg likes across {pillarPerformance[0].count} posts.
                </p>
              )}
              {winningCombos[0] && (
                <p>
                  The most reliable winning formula: <strong>{winningCombos[0].hook_type} + {winningCombos[0].content_pillar}</strong> ({winningCombos[0].count} winners, {winningCombos[0].avg_virality} avg virality).
                </p>
              )}
              {accountRankings[0] && (
                <p>
                  Study <strong>@{accountRankings[0].handle}</strong> closely — highest avg virality at {accountRankings[0].avg_virality} with {accountRankings[0].winners} winners.
                </p>
              )}
            </div>
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
