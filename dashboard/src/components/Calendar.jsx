import { useState } from 'react'
import { Instagram, Music2, BookOpen, Twitter, X } from 'lucide-react'
import { CALENDAR_EVENTS as DEFAULT_EVENTS } from '../data/mock-data'

const PLATFORM_ICONS = { ig: Instagram, tiktok: Music2, substack: BookOpen, x: Twitter }
const STATUS_STYLES = {
  published: 'bg-primary/20',
  scheduled: 'bg-primary/40',
  draft: 'bg-primary/10 border border-primary/20',
  idea: 'bg-black/[0.06]',
}

const PLATFORM_COLORS = {
  ig: 'bg-pink-400',
  tiktok: 'bg-cyan-500',
  substack: 'bg-orange-400',
  x: 'bg-gray-600',
}

function AddEventModal({ day, onClose, onAdd }) {
  const [title, setTitle] = useState('')
  const [platform, setPlatform] = useState('ig')
  const [status, setStatus] = useState('idea')

  function submit(e) {
    e.preventDefault()
    if (!title.trim()) return
    onAdd(day, { title, platform, status })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div className="relative bg-white border border-border rounded-2xl p-6 w-full max-w-sm" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 text-secondary hover:text-primary bg-transparent border-0 cursor-pointer"><X size={16} /></button>
        <h3 className="text-[17px] font-semibold text-primary mb-4">Add to Mar {day}</h3>
        <form onSubmit={submit} className="space-y-3">
          <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Post title" className="w-full bg-white border border-border rounded-lg px-3 py-2 text-[13px] text-primary placeholder:text-black/25" autoFocus />
          <div className="grid grid-cols-2 gap-3">
            <select value={platform} onChange={e => setPlatform(e.target.value)} className="bg-white border border-border rounded-lg px-3 py-2 text-[13px] text-primary appearance-none cursor-pointer">
              <option value="ig">IG Reel</option>
              <option value="tiktok">TikTok</option>
              <option value="substack">Substack</option>
              <option value="x">X</option>
            </select>
            <select value={status} onChange={e => setStatus(e.target.value)} className="bg-white border border-border rounded-lg px-3 py-2 text-[13px] text-primary appearance-none cursor-pointer">
              <option value="idea">Idea</option>
              <option value="draft">Draft</option>
              <option value="scheduled">Scheduled</option>
            </select>
          </div>
          <button type="submit" className="w-full py-2.5 rounded-xl bg-black/[0.05] hover:bg-black/[0.08] text-[14px] font-medium text-primary border-0 cursor-pointer transition-colors">Add Post</button>
        </form>
      </div>
    </div>
  )
}

export default function Calendar() {
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const firstDay = new Date(year, month, 1).getDay()
  const monthName = now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  const [hovered, setHovered] = useState(null)
  const [events, setEvents] = useState(DEFAULT_EVENTS)
  const [addDay, setAddDay] = useState(null)

  function addEvent(day, event) {
    setEvents(prev => ({
      ...prev,
      [day]: [...(prev[day] || []), event],
    }))
  }

  const dayNames = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']
  const blanks = Array(firstDay).fill(null)
  const cells = [...blanks, ...Array.from({ length: daysInMonth }, (_, i) => i + 1)]

  const today = now.getDate()
  const upcoming = []
  for (let d = today; d <= Math.min(today + 6, daysInMonth); d++) {
    if (events[d]) {
      events[d].forEach(ev => upcoming.push({ day: d, ...ev }))
    }
  }

  return (
    <section id="calendar" className="fade-up d7 bg-bg-alt py-16 px-6">
      <div className="max-w-[1080px] mx-auto">
        <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-secondary mb-2">Calendar</p>
        <h2 className="text-[24px] font-semibold tracking-[-0.02em] mb-8 text-primary">{monthName}</h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Month grid */}
          <div>
            <div className="grid grid-cols-7 mb-1">
              {dayNames.map(d => (
                <div key={d} className="text-center text-[11px] font-semibold text-secondary py-2">{d}</div>
              ))}
            </div>
            <div className="grid grid-cols-7">
              {cells.map((day, i) => {
                if (!day) return <div key={`b${i}`} />
                const evts = events[day]
                const isToday = day === today

                return (
                  <div
                    key={day}
                    className="relative flex flex-col items-center py-2 cursor-pointer group"
                    onMouseEnter={() => evts && setHovered(day)}
                    onMouseLeave={() => setHovered(null)}
                    onClick={() => !evts && setAddDay(day)}
                  >
                    <span className={`text-[14px] w-8 h-8 flex items-center justify-center rounded-full transition-all duration-300 ${
                      isToday ? 'bg-primary/10 font-semibold text-primary' :
                      evts ? 'text-primary group-hover:bg-black/[0.04]' : 'text-black/20'
                    }`}>
                      {day}
                    </span>

                    {evts && (
                      <div className="flex gap-0.5 mt-1">
                        {evts.map((ev, j) => (
                          <div key={j} className={`w-1.5 h-1.5 rounded-full ${PLATFORM_COLORS[ev.platform] || STATUS_STYLES[ev.status]}`} />
                        ))}
                      </div>
                    )}

                    {hovered === day && evts && (
                      <div className="absolute top-full mt-1 left-1/2 -translate-x-1/2 bg-white border border-border rounded-xl p-3 z-20 min-w-[220px] shadow-lg">
                        {evts.map((ev, j) => {
                          const Icon = PLATFORM_ICONS[ev.platform] || Instagram
                          return (
                            <div key={j} className="flex items-start gap-2 py-1">
                              <Icon size={12} className="text-secondary mt-0.5 shrink-0" />
                              <div>
                                <p className="text-[12px] text-primary leading-snug">{ev.title}</p>
                                <p className="text-[10px] text-secondary capitalize">{ev.status}</p>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Upcoming */}
          <div>
            <h3 className="text-[15px] font-semibold text-primary mb-4">Upcoming 7 Days</h3>
            {upcoming.length === 0 ? (
              <p className="text-[13px] text-secondary">Nothing scheduled in the next 7 days.</p>
            ) : (
              <div className="space-y-2">
                {upcoming.map((ev, i) => {
                  const Icon = PLATFORM_ICONS[ev.platform] || Instagram
                  return (
                    <div key={i} className="card flex items-center gap-3 p-3">
                      <span className="text-[13px] font-semibold text-secondary w-14 shrink-0">Mar {ev.day}</span>
                      <Icon size={14} className="text-secondary shrink-0" />
                      <span className="text-[13px] text-primary flex-1">{ev.title}</span>
                      <span className={`text-[10px] font-semibold uppercase tracking-[0.06em] px-2 py-0.5 rounded-full ${
                        ev.status === 'published' ? 'bg-black/[0.06] text-secondary' :
                        ev.status === 'scheduled' ? 'bg-black/[0.05] text-secondary' :
                        'bg-black/[0.03] text-black/30'
                      }`}>
                        {ev.status}
                      </span>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>
      {addDay && <AddEventModal day={addDay} onClose={() => setAddDay(null)} onAdd={addEvent} />}
    </section>
  )
}
