import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getOverviewStats, getWinners } from '../lib/api'
import { Trophy, TrendingUp, Zap, Clock, FileText, Pen, Users, ArrowRight } from 'lucide-react'

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
      {/* Page Header */}
      <section className="fade-up d1 pt-10 pb-4 px-6">
        <div className="max-w-[1080px] mx-auto">
          <h1 className="text-[13px] font-bold uppercase tracking-[0.12em] text-primary">DASHBOARD</h1>
          <p className="text-[12px] text-secondary mt-1">Content pipeline command center</p>
        </div>
      </section>

      {/* Quick Stats Row */}
      {stats && (
        <section className="fade-up d2 py-6 px-6">
          <div className="max-w-[1080px] mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard icon={FileText} label="POSTS TRACKED" value={stats.totalPosts} />
              <StatCard icon={Zap} label="WINNERS THIS WEEK" value={stats.winnersThisWeek} accent />
              <StatCard icon={Users} label="ACCOUNTS TRACKED" value={stats.totalAccounts} />
              <StatCard icon={Clock} label="LAST SCRAPE" value={stats.lastScrape ? timeAgo(stats.lastScrape) : 'Never'} />
            </div>
          </div>
        </section>
      )}

      {/* New Winners */}
      {winners.length > 0 && (
        <section className="fade-up d3 py-6 px-6">
          <div className="max-w-[1080px] mx-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[11px] font-bold uppercase tracking-[0.1em] text-secondary">NEW WINNERS THIS WEEK</h2>
              <Link to="/discover" className="text-[12px] text-primary hover:underline flex items-center gap-1">
                View all <ArrowRight size={12} />
              </Link>
            </div>
            <div className="grid gap-3">
              {winners.slice(0, 5).map(w => (
                <div key={w.id} className="card p-4 flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 bg-amber-50 text-amber-700 rounded-full">
                        @{w.handle}
                      </span>
                      <span className="text-[10px] text-secondary uppercase tracking-wider">{w.tier}</span>
                    </div>
                    <p className="text-[13px] text-primary truncate">{w.caption}</p>
                    <p className="text-[11px] text-secondary mt-1">{w.trigger_reason}</p>
                  </div>
                  <div className="text-right shrink-0 ml-4">
                    <div className="text-[18px] font-bold text-primary">{w.virality_score}</div>
                    <div className="text-[10px] font-bold uppercase tracking-wider text-secondary">VIRALITY</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Pipeline Pulse */}
      {stats?.pipeline && Object.keys(stats.pipeline).length > 0 && (
        <section className="fade-up d4 py-6 px-6 bg-bg-alt">
          <div className="max-w-[1080px] mx-auto">
            <h2 className="text-[11px] font-bold uppercase tracking-[0.1em] text-secondary mb-4">PIPELINE PULSE</h2>
            <div className="flex gap-3 flex-wrap">
              {['ideas', 'writing', 'review', 'scheduled', 'published'].map(status => (
                <div key={status} className="card px-5 py-4 flex-1 min-w-[120px]">
                  <div className="text-[24px] font-bold text-primary">{stats.pipeline[status] || 0}</div>
                  <div className="text-[10px] font-bold uppercase tracking-[0.1em] text-secondary mt-1">{status}</div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Quick Actions */}
      <section className="fade-up d5 py-8 px-6">
        <div className="max-w-[1080px] mx-auto">
          <h2 className="text-[11px] font-bold uppercase tracking-[0.1em] text-secondary mb-4">QUICK ACTIONS</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Link to="/competitors" className="card p-4 hover:border-primary/20 transition-all group text-center">
              <TrendingUp size={18} className="mx-auto mb-2 text-secondary group-hover:text-primary transition-colors" />
              <p className="text-[12px] font-bold uppercase tracking-wider text-primary">COMPETITORS</p>
              <p className="text-[11px] text-secondary mt-1">Browse & remix posts</p>
            </Link>
            <Link to="/insights" className="card p-4 hover:border-primary/20 transition-all group text-center">
              <Zap size={18} className="mx-auto mb-2 text-secondary group-hover:text-primary transition-colors" />
              <p className="text-[12px] font-bold uppercase tracking-wider text-primary">INSIGHTS</p>
              <p className="text-[11px] text-secondary mt-1">What's working</p>
            </Link>
            <Link to="/scripts" className="card p-4 hover:border-primary/20 transition-all group text-center">
              <Pen size={18} className="mx-auto mb-2 text-secondary group-hover:text-primary transition-colors" />
              <p className="text-[12px] font-bold uppercase tracking-wider text-primary">SCRIPTS</p>
              <p className="text-[11px] text-secondary mt-1">Write & remix</p>
            </Link>
            <Link to="/settings" className="card p-4 hover:border-primary/20 transition-all group text-center">
              <Users size={18} className="mx-auto mb-2 text-secondary group-hover:text-primary transition-colors" />
              <p className="text-[12px] font-bold uppercase tracking-wider text-primary">SETTINGS</p>
              <p className="text-[11px] text-secondary mt-1">Manage accounts</p>
            </Link>
          </div>
        </div>
      </section>

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
        <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-secondary">{label}</span>
      </div>
      <div className={`text-[24px] font-bold ${accent ? 'text-amber-600' : 'text-primary'}`}>{value}</div>
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
