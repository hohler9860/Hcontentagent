import { TrendingUp, TrendingDown, Clock, Music, MessageCircle, Zap, Target, BarChart3 } from 'lucide-react'

const WINNING_FORMULA = {
  hook: { label: 'Question / Bold Statement Hooks', lift: '4.8x', detail: 'avg 3,908 plays vs 815 for ranking openers' },
  topic: { label: 'Cultural Crossover Topics', lift: '2.6x', detail: 'avg 4,141 plays vs 1,573 for pure watch content' },
  length: { label: 'Under 40 Seconds', lift: '2.7x', detail: 'avg 2,764 plays vs 1,016 for 40s+' },
  audio: { label: 'Trending / Licensed Audio', lift: '2.2x', detail: 'avg 2,155 plays vs 986 for original sound' },
}

const TOP_VIDEOS = [
  { title: 'Can you believe Costco sold Rolex?', plays: '20.1K', likes: 776, shares: 61, er: '4.3%', duration: '39s', why: 'Cultural crossover + disbelief hook' },
  { title: 'A big price tag doesn\'t mean rare.', plays: '14.7K', likes: 845, shares: 4, er: '5.8%', duration: '18s', why: 'Contrarian hot take + ultra-short' },
  { title: 'What are your 2026 Rolex predictions?', plays: '10.9K', likes: 89, shares: 4, er: '0.9%', duration: '29s', why: 'Timely question + Rolex keyword' },
  { title: 'A look inside the Concourse Club.', plays: '5.2K', likes: 380, shares: 32, er: '8.1%', duration: '44s', why: 'Exclusive access — best reach+depth combo' },
  { title: 'Buy what you like, not the internet\'s.', plays: '4.4K', likes: 222, shares: 4, er: '5.4%', duration: '35s', why: 'Empowering opinion' },
]

const FORMAT_TIERS = [
  { tier: 1, label: 'Hot Take / Opinion', plays: '3,701', er: '5.5%', trend: 'up' },
  { tier: 1, label: 'Behind-the-Scenes', plays: '2,008', er: '7.0%', trend: 'up' },
  { tier: 1, label: 'Educational / Explainer', plays: '2,828', er: '5.3%', trend: 'up' },
  { tier: 2, label: 'Comparison / VS', plays: '1,667', er: '3.3%', trend: 'neutral' },
  { tier: 2, label: 'Cultural Crossover', plays: '1,482', er: '5.3%', trend: 'up' },
  { tier: 3, label: 'Ranking / Top List', plays: '815', er: '5.3%', trend: 'down' },
  { tier: 3, label: 'Price Point', plays: '608', er: '5.6%', trend: 'down' },
]

const STOP_DOING = [
  '"Top 5 from [Brand]" series — 815 avg plays, 58% below average',
  'Videos over 60 seconds — 901 avg plays, half the account average',
  'Passive "Here\'s..." openers — 1,083 avg plays, no curiosity',
  'Heavy AP content — 8 videos, only 842 avg plays',
  'Original sound on growth videos — 2.2x fewer plays than licensed audio',
]

const DOUBLE_DOWN = [
  'Cultural crossover content — 4,141 avg plays (2.6x lift)',
  'Hot take / opinion — 3,701 avg plays, 5.5% ER',
  'Question hooks on every growth video — 4,198 avg plays',
  '20-35 second default duration',
  'Behind-the-scenes / exclusive access — 7-8% ER',
  'Rolex as anchor topic (40-50% of content)',
  'Patek Philippe premium topic — highest brand ER at 6.2%',
]

export default function InsightsPanel() {
  return (
    <section id="insights" className="fade-up d3 py-16 px-6">
      <div className="max-w-[1080px] mx-auto">
        <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-secondary mb-2">Performance Insights</p>
        <h2 className="text-[24px] font-semibold tracking-[-0.02em] mb-2 text-primary">What's working.</h2>
        <p className="text-[13px] text-secondary mb-8">Data from 49 TikTok videos + 5 IG posts. 9 of 49 videos (18%) drive 72% of total plays.</p>

        {/* Winning Formula */}
        <div className="card p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Zap size={15} className="text-secondary" />
            <h3 className="text-[15px] font-semibold text-primary">The Winning Formula</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {Object.values(WINNING_FORMULA).map(item => (
              <div key={item.label} className="bg-black/[0.02] rounded-xl p-4">
                <p className="text-[22px] font-semibold text-primary">{item.lift}</p>
                <p className="text-[13px] font-medium text-primary mt-1">{item.label}</p>
                <p className="text-[11px] text-secondary mt-1">{item.detail}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Top 5 Videos */}
        <div className="card p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 size={15} className="text-secondary" />
            <h3 className="text-[15px] font-semibold text-primary">Top 5 Performing Videos</h3>
          </div>
          <div className="space-y-3">
            {TOP_VIDEOS.map((v, i) => (
              <div key={i} className="flex items-start gap-4 bg-black/[0.02] rounded-xl p-4">
                <span className="text-[20px] font-semibold text-black/15 shrink-0 w-7">#{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-[14px] font-medium text-primary leading-snug">"{v.title}"</p>
                  <p className="text-[12px] text-secondary mt-1">{v.why}</p>
                  <div className="flex flex-wrap gap-3 mt-2 text-[11px] text-secondary">
                    <span>{v.plays} plays</span>
                    <span>{v.likes} likes</span>
                    <span>{v.shares} shares</span>
                    <span>{v.er} ER</span>
                    <span className="flex items-center gap-1"><Clock size={10} /> {v.duration}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Format Performance */}
          <div className="card p-6">
            <div className="flex items-center gap-2 mb-4">
              <Target size={15} className="text-secondary" />
              <h3 className="text-[15px] font-semibold text-primary">Format Performance</h3>
            </div>
            <div className="space-y-2">
              {FORMAT_TIERS.map((f, i) => (
                <div key={i} className="flex items-center gap-3 py-2 border-b border-black/[0.04] last:border-0">
                  {f.trend === 'up' ? (
                    <TrendingUp size={13} className="text-green-600 shrink-0" />
                  ) : f.trend === 'down' ? (
                    <TrendingDown size={13} className="text-[#FF3B30] shrink-0" />
                  ) : (
                    <div className="w-[13px] h-[2px] bg-black/20 shrink-0" />
                  )}
                  <span className="text-[13px] text-primary flex-1">{f.label}</span>
                  <span className="text-[12px] text-secondary">{f.plays} avg</span>
                  <span className="text-[11px] text-secondary bg-black/[0.04] px-2 py-0.5 rounded-full">{f.er} ER</span>
                </div>
              ))}
            </div>
          </div>

          {/* Length + Audio */}
          <div className="space-y-6">
            <div className="card p-6">
              <div className="flex items-center gap-2 mb-4">
                <Clock size={15} className="text-secondary" />
                <h3 className="text-[15px] font-semibold text-primary">Length Sweet Spot</h3>
              </div>
              <div className="space-y-2">
                {[
                  { range: '0-15s', plays: '983', er: '7.2%', bar: 15 },
                  { range: '16-30s', plays: '3,765', er: '4.8%', bar: 80, best: true },
                  { range: '31-45s', plays: '2,183', er: '5.2%', bar: 50, best: true },
                  { range: '46-60s', plays: '1,165', er: '5.7%', bar: 25 },
                  { range: '61-90s', plays: '901', er: '5.6%', bar: 18 },
                ].map(d => (
                  <div key={d.range} className="flex items-center gap-3">
                    <span className={`text-[12px] w-12 shrink-0 ${d.best ? 'font-semibold text-primary' : 'text-secondary'}`}>{d.range}</span>
                    <div className="flex-1 bg-black/[0.04] rounded-full h-2 overflow-hidden">
                      <div className={`h-full rounded-full ${d.best ? 'bg-black/20' : 'bg-black/10'}`} style={{ width: `${d.bar}%` }} />
                    </div>
                    <span className="text-[11px] text-secondary w-14 text-right">{d.plays}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="card p-6">
              <div className="flex items-center gap-2 mb-4">
                <Music size={15} className="text-secondary" />
                <h3 className="text-[15px] font-semibold text-primary">Top Audio</h3>
              </div>
              <div className="space-y-2 text-[12px]">
                {[
                  { track: '"float"', plays: '11,796 avg', uses: '3 uses' },
                  { track: '"Central Cee"', plays: '10,900', uses: '1 use' },
                  { track: '"Raindance"', plays: '2,861 avg', uses: '2 uses, 7.9% ER' },
                ].map(a => (
                  <div key={a.track} className="flex items-center justify-between py-1.5 border-b border-black/[0.04] last:border-0">
                    <span className="text-primary font-medium">{a.track}</span>
                    <span className="text-secondary">{a.plays} · {a.uses}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Do More / Stop Doing */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card p-6">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp size={15} className="text-green-600" />
              <h3 className="text-[15px] font-semibold text-primary">Double Down On</h3>
            </div>
            <ul className="space-y-2">
              {DOUBLE_DOWN.map((item, i) => (
                <li key={i} className="text-[13px] text-primary/80 flex gap-2">
                  <span className="text-green-600 shrink-0">+</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="card p-6">
            <div className="flex items-center gap-2 mb-4">
              <TrendingDown size={15} className="text-[#FF3B30]" />
              <h3 className="text-[15px] font-semibold text-primary">Stop Doing</h3>
            </div>
            <ul className="space-y-2">
              {STOP_DOING.map((item, i) => (
                <li key={i} className="text-[13px] text-primary/80 flex gap-2">
                  <span className="text-[#FF3B30] shrink-0">&minus;</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}
