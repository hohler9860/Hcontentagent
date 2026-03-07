import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getWinners, getAccounts, getLeaderboard } from '../lib/api'
import { Trophy, Sparkles, TrendingUp, Heart, MessageCircle, Play, ExternalLink } from 'lucide-react'

export default function DiscoverPage() {
  const [winners, setWinners] = useState([])
  const [discovered, setDiscovered] = useState([])
  const [trending, setTrending] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      getWinners(7).catch(() => []),
      getAccounts({ tier: 'discovered' }).catch(() => []),
      getLeaderboard(7, 10).catch(() => []),
    ]).then(([w, d, t]) => {
      setWinners(w)
      setDiscovered(d)
      setTrending(t)
      setLoading(false)
    })
  }, [])

  if (loading) return <div className="py-20 text-center text-[13px] text-secondary">Loading...</div>

  return (
    <section className="fade-up d2 py-12 px-6">
      <div className="max-w-[1080px] mx-auto">
        <h1 className="text-[20px] font-semibold text-primary mb-8">Discover</h1>

        {/* New Winners */}
        <div className="mb-10">
          <h2 className="text-[15px] font-semibold text-primary mb-4 flex items-center gap-2">
            <Trophy size={15} className="text-amber-500" /> New Winners
          </h2>
          {winners.length > 0 ? (
            <div className="grid gap-3">
              {winners.map(w => (
                <div key={w.id} className="card p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Link to={`/competitors/${w.handle}`} className="text-[12px] font-medium text-primary hover:underline">
                      @{w.handle}
                    </Link>
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-50 text-amber-700">winner</span>
                    <span className="text-[11px] text-secondary ml-auto">
                      {w.detected_at ? timeAgo(w.detected_at) : ''}
                    </span>
                  </div>
                  <p className="text-[13px] text-primary line-clamp-2">{w.caption}</p>
                  <p className="text-[11px] text-secondary mt-1">{w.trigger_reason}</p>
                  <div className="flex items-center gap-4 mt-2 text-[11px] text-secondary">
                    <span className="flex items-center gap-1"><Heart size={11} />{formatNumber(w.likes)}</span>
                    <span className="flex items-center gap-1"><MessageCircle size={11} />{formatNumber(w.comments)}</span>
                    {w.views > 0 && <span className="flex items-center gap-1"><Play size={11} />{formatNumber(w.views)}</span>}
                    <span className="font-medium text-amber-600">Virality: {w.virality_score}</span>
                    {w.url && (
                      <a href={w.url} target="_blank" rel="noopener noreferrer" className="ml-auto hover:text-primary">
                        <ExternalLink size={12} />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-[13px] text-secondary card p-6 text-center">No winners detected yet. Run a scrape + scoring from Settings.</p>
          )}
        </div>

        {/* Newly Discovered Accounts */}
        <div className="mb-10">
          <h2 className="text-[15px] font-semibold text-primary mb-4 flex items-center gap-2">
            <Sparkles size={15} className="text-purple-500" /> Newly Discovered Accounts
          </h2>
          {discovered.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {discovered.map(a => (
                <Link key={a.id} to={`/competitors/${a.handle}`} className="card p-4 hover:border-primary/20 transition-all">
                  <div className="text-[14px] font-medium text-primary">@{a.handle}</div>
                  <div className="text-[11px] text-secondary mt-1">{a.why_tracking}</div>
                  <div className="text-[11px] text-secondary mt-2">{a.platform}</div>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-[13px] text-secondary card p-6 text-center">No auto-discovered accounts yet. Hashtag scraping finds these automatically.</p>
          )}
        </div>

        {/* Trending This Week */}
        <div>
          <h2 className="text-[15px] font-semibold text-primary mb-4 flex items-center gap-2">
            <TrendingUp size={15} className="text-green-500" /> Trending This Week
          </h2>
          {trending.length > 0 ? (
            <div className="space-y-3">
              {trending.map((post, i) => (
                <div key={post.id} className="card p-4 flex items-start gap-3">
                  <span className="text-[13px] font-semibold text-secondary w-6 pt-0.5">#{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Link to={`/competitors/${post.handle}`} className="text-[12px] font-medium text-primary hover:underline">
                        @{post.handle}
                      </Link>
                    </div>
                    <p className="text-[13px] text-primary line-clamp-2">{post.caption}</p>
                    <div className="flex items-center gap-4 mt-2 text-[11px] text-secondary">
                      <span className="flex items-center gap-1"><Heart size={11} />{formatNumber(post.likes)}</span>
                      <span className="flex items-center gap-1"><MessageCircle size={11} />{formatNumber(post.comments)}</span>
                      {post.views > 0 && <span className="flex items-center gap-1"><Play size={11} />{formatNumber(post.views)}</span>}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-[17px] font-semibold text-primary">{post.virality_score}</div>
                    <div className="text-[10px] text-secondary">virality</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-[13px] text-secondary card p-6 text-center">No trending posts yet.</p>
          )}
        </div>
      </div>
    </section>
  )
}

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  return `${Math.floor(hours / 24)}d ago`
}

function formatNumber(n) {
  if (!n) return '0'
  if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M'
  if (n >= 1000) return (n / 1000).toFixed(1) + 'K'
  return n.toString()
}
