import { FileText, Pen, Send, Megaphone, TrendingUp, Users } from 'lucide-react'

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 18) return 'Good afternoon'
  return 'Good evening'
}

export default function HeroStatus({ pipeline, competitorPostCount, checklist, stats }) {
  const drafts = pipeline
    ? (pipeline?.writing?.length || 0) + (pipeline?.review?.length || 0)
    : (stats?.pipeline?.writing || 0) + (stats?.pipeline?.review || 0)

  const postCount = competitorPostCount || stats?.totalPosts || 0
  const remaining = checklist
    ? 14 - Object.values(checklist).filter(v => v?.done).length
    : 0

  const quickStats = [
    { label: 'Posts Tracked', value: stats?.totalPosts || postCount || '—', icon: FileText },
    { label: 'Scripts Ready', value: stats?.scriptsReady || '—', icon: Pen },
    { label: 'Winners (7d)', value: stats?.winnersThisWeek || '—', icon: TrendingUp },
    { label: 'Accounts', value: stats?.totalAccounts || '—', icon: Users },
  ]

  return (
    <section className="fade-up d1 py-16 px-6 max-w-[1080px] mx-auto">
      <h1 className="text-[48px] font-semibold tracking-[-0.03em] leading-tight text-primary">
        {getGreeting()}, H.
      </h1>
      <p className="text-[15px] text-secondary mt-3">
        {drafts} drafts in progress &middot; {postCount} posts tracked{remaining > 0 ? ` · ${remaining} tasks remaining` : ''}
      </p>
      <div className="flex flex-wrap gap-3 mt-8">
        {quickStats.map(({ label, value, icon: Icon }) => (
          <div key={label} className="card flex items-center gap-3 px-5 py-3">
            <Icon size={16} className="text-secondary" />
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-secondary">{label}</p>
              <p className="text-[17px] font-semibold text-primary mt-0.5">{value}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
