import { FileText, Pen, Send, Megaphone } from 'lucide-react'

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 18) return 'Good afternoon'
  return 'Good evening'
}

const STATS = [
  { label: 'Posts This Week', value: '3/7', icon: FileText },
  { label: 'Scripts Ready', value: '5', icon: Pen },
  { label: 'Outreach Sent', value: '8/15', icon: Send },
  { label: 'Ads Active', value: '2', icon: Megaphone },
]

export default function HeroStatus({ pipeline, competitorPostCount, checklist }) {
  const drafts = (pipeline?.writing?.length || 0) + (pipeline?.review?.length || 0)
  const total = checklist ? Object.keys(checklist).length : 14
  const done = checklist ? Object.values(checklist).filter(v => v?.done).length : 0
  const remaining = 14 - done

  return (
    <section className="fade-up d1 py-16 px-6 max-w-[1080px] mx-auto">
      <h1 className="text-[48px] font-semibold tracking-[-0.03em] leading-tight text-primary">
        {getGreeting()}, H.
      </h1>
      <p className="text-[15px] text-secondary mt-3">
        {drafts} drafts in progress &middot; {competitorPostCount} competitor posts tracked &middot; {remaining > 0 ? `${remaining} tasks remaining` : 'all tasks done'}
      </p>
      <div className="flex flex-wrap gap-3 mt-8">
        {STATS.map(({ label, value, icon: Icon }) => (
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
