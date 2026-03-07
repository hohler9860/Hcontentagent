import { useState, useEffect } from 'react'
import HeroStatus from '../components/HeroStatus'
import { getOverviewStats, getWinners } from '../lib/api'
import { Trophy, TrendingUp, Zap, Clock } from 'lucide-react'

export default function DashboardPage() {
  const [stats, setStats] = useState(null)
  const [winners, setWinners] = useState([])
  const [error, setError] = useState(null)

  useEffect(() => {
    getOverviewStats().then(setStats).catch(() => setError('api'))
    getWinners(7).then(setWinners).catch(() => {})
  }, [])

  return (
    <div>
      <HeroStatus stats={stats} />

      {/* Quick Stats Row */}
      {stats && (
        <section className="fade-up d2 py-8 px-6">
          <div className="max-w-[1080px] mx-auto grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard icon={TrendingUp} label="Posts Tracked" value={stats.totalPosts} />
            <StatCard icon={Zap} label="Winners This Week" value={stats.winnersThisWeek} accent />
            <StatCard icon={Trophy} label="Accounts Tracked" value={stats.totalAccounts} />
            <StatCard icon={Clock} label="Last Scrape" value={stats.lastScrape ? timeAgo(stats.lastScrape) : 'Never'} />
          </div>
        </section>
      )}

      {/* New Winners */}
      {winners.length > 0 && (
        <section className="fade-up d3 py-8 px-6">
          <div className="max-w-[1080px] mx-auto">
            <h2 className="text-[15px] font-semibold text-primary mb-4">New Winners This Week</h2>
            <div className="grid gap-3">
              {winners.slice(0, 5).map(w => (
                <div key={w.id} className="card p-4 flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[11px] font-medium px-2 py-0.5 bg-amber-50 text-amber-700 rounded-full">
                        @{w.handle}
                      </span>
                      <span className="text-[11px] text-secondary">{w.tier}</span>
                    </div>
                    <p className="text-[13px] text-primary truncate">{w.caption}</p>
                    <p className="text-[11px] text-secondary mt-1">{w.trigger_reason}</p>
                  </div>
                  <div className="text-right shrink-0 ml-4">
                    <div className="text-[15px] font-semibold text-primary">{w.virality_score}</div>
                    <div className="text-[11px] text-secondary">virality</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Quick Pulse - Pipeline Summary */}
      {stats?.pipeline && (
        <section className="fade-up d4 py-8 px-6 bg-bg-alt">
          <div className="max-w-[1080px] mx-auto">
            <h2 className="text-[15px] font-semibold text-primary mb-4">Pipeline Pulse</h2>
            <div className="flex gap-3 flex-wrap">
              {['ideas', 'writing', 'review', 'scheduled', 'published'].map(status => (
                <div key={status} className="card px-4 py-3 flex-1 min-w-[120px]">
                  <div className="text-[22px] font-semibold text-primary">{stats.pipeline[status] || 0}</div>
                  <div className="text-[11px] text-secondary capitalize">{status}</div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Fallback if API isn't connected */}
      {error === 'api' && (
        <section className="py-16 px-6">
          <div className="max-w-[1080px] mx-auto text-center">
            <p className="text-secondary text-[13px]">Backend not connected. Run <code className="bg-bg-alt px-2 py-1 rounded text-[12px]">npm run dev:all</code> to start both Vite and Express.</p>
          </div>
        </section>
      )}
    </div>
  )
}

function StatCard({ icon: Icon, label, value, accent }) {
  return (
    <div className="card p-4">
      <div className="flex items-center gap-2 mb-2">
        <Icon size={14} className={accent ? 'text-amber-500' : 'text-secondary'} />
        <span className="text-[11px] text-secondary">{label}</span>
      </div>
      <div className={`text-[22px] font-semibold ${accent ? 'text-amber-600' : 'text-primary'}`}>{value}</div>
    </div>
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
