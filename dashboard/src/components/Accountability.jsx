import { Check } from 'lucide-react'
import { CHECKLIST_TEMPLATE, WEEKLY_DATA } from '../data/mock-data'

export default function Accountability({ checklist, setChecklist }) {
  const allItems = CHECKLIST_TEMPLATE.flatMap(c => c.items)
  const total = allItems.length
  const done = allItems.filter(i => checklist[i.id]?.done).length
  const pct = Math.round((done / total) * 100)
  const isLate = new Date().getHours() >= 21

  function toggle(id) {
    setChecklist(prev => ({
      ...prev,
      [id]: prev[id]?.done
        ? { done: false, time: null }
        : { done: true, time: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) },
    }))
  }

  const streakDays = [true, true, true, true, false, false, null]
  const currentStreak = 4
  const longestStreak = 11

  return (
    <section id="accountability" className="fade-up d6 py-16 px-6">
      <div className="max-w-[1080px] mx-auto">
        <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-secondary mb-2">Accountability</p>
        <h2 className="text-[24px] font-semibold tracking-[-0.02em] mb-8 text-primary">Stay on track.</h2>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Checklist */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-[15px] font-semibold text-primary">Today's Checklist</h3>
              <span className="text-[13px] text-secondary">{done}/{total} completed ({pct}%)</span>
            </div>

            <div className="space-y-6">
              {CHECKLIST_TEMPLATE.map(cat => (
                <div key={cat.category}>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-secondary mb-3">{cat.category}</p>
                  <div className="space-y-1">
                    {cat.items.map(item => {
                      const state = checklist[item.id] || {}
                      const overdue = !state.done && isLate
                      return (
                        <div
                          key={item.id}
                          onClick={() => toggle(item.id)}
                          className={`flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all duration-300 group ${
                            state.done ? 'bg-black/[0.02]' : overdue ? 'bg-overdue/[0.06]' : 'hover:bg-black/[0.02]'
                          }`}
                        >
                          <div className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 transition-all duration-200 ${
                            state.done ? 'bg-primary/10 border-primary/30' : overdue ? 'border-overdue/40' : 'border-black/15 group-hover:border-black/25'
                          }`}>
                            {state.done && <Check size={12} className="text-primary" />}
                          </div>
                          <span className={`text-[14px] flex-1 ${state.done ? 'text-black/35 line-through' : overdue ? 'text-overdue' : 'text-primary'}`}>
                            {item.label}
                          </span>
                          {state.time && <span className="text-[11px] text-black/25">{state.time}</span>}
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sidebar: Streak + Weekly */}
          <div className="space-y-6">
            <div className="card p-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-secondary mb-3">Streak</p>
              <p className="text-[28px] font-semibold text-primary">{currentStreak} days</p>
              <p className="text-[12px] text-secondary mt-1">Longest: {longestStreak} days</p>
              <div className="flex gap-2 mt-4">
                {streakDays.map((d, i) => (
                  <div key={i} className={`w-3 h-3 rounded-full ${d === null ? 'bg-black/[0.06]' : d ? 'bg-primary/30' : 'bg-black/[0.06]'}`} />
                ))}
              </div>
            </div>

            <div className="card p-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-secondary mb-4">This Week</p>
              <div className="overflow-x-auto">
                <table className="w-full text-[12px]">
                  <thead>
                    <tr>
                      <th className="text-left text-secondary font-medium pb-2 pr-3"></th>
                      {WEEKLY_DATA.days.map(d => (
                        <th key={d} className="text-center text-secondary font-medium pb-2 px-1 w-8">{d.slice(0, 2)}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {WEEKLY_DATA.rows.map(row => (
                      <tr key={row.label}>
                        <td className="text-secondary py-1.5 pr-3 whitespace-nowrap">{row.label}</td>
                        {row.values.map((v, i) => (
                          <td key={i} className="text-center py-1.5 px-1">
                            {v === null ? <span className="text-black/15">—</span> :
                             v === true ? <span className="text-primary/50">&#10003;</span> :
                             v === false ? <span className="text-overdue/60">&#10007;</span> :
                             <span className={v === 0 ? 'text-black/20' : 'text-primary/80'}>{v}</span>}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-4 pt-3 border-t border-border space-y-1.5 text-[12px] text-secondary">
                <p>Content: 4/6 days (67%) — <span className="text-black/30">Target: 85%</span></p>
                <p>Outreach: 20/35 DMs (57%) — <span className="text-black/30">Target: 80%</span></p>
                <p>Competitor tracking: 7 posts — <span className="text-black/30">Target: 10</span></p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
