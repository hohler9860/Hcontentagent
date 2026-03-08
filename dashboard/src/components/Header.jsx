import { NavLink } from 'react-router-dom'

const NAV_ITEMS = [
  { label: 'Dashboard', path: '/' },
  { label: 'Pipeline', path: '/pipeline' },
  { label: 'Insights', path: '/insights' },
  { label: 'Competitors', path: '/competitors' },
  { label: 'Discover', path: '/discover' },
  { label: 'Scripts', path: '/scripts' },
  { label: 'Accountability', path: '/accountability' },
  { label: 'Calendar', path: '/calendar' },
  { label: 'Settings', path: '/settings' },
]

export default function Header() {
  const date = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })

  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-black/[0.06]">
      <div className="max-w-[1080px] mx-auto px-6 h-14 flex items-center justify-between">
        <NavLink to="/" className="text-[13px] font-bold uppercase tracking-[0.12em] text-primary shrink-0">
          DIALED BY H
        </NavLink>
        <nav className="hidden md:flex items-center gap-1 overflow-x-auto">
          {NAV_ITEMS.map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) =>
                `text-[11px] font-semibold uppercase tracking-[0.06em] whitespace-nowrap px-3 py-1.5 rounded-lg transition-all duration-200 ${
                  isActive
                    ? 'text-primary bg-primary/[0.06]'
                    : 'text-secondary hover:text-primary hover:bg-black/[0.03]'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        <span className="text-[11px] font-medium uppercase tracking-[0.06em] text-secondary shrink-0 hidden lg:block">{date}</span>
      </div>
    </header>
  )
}
