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
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-black/[0.08]">
      <div className="max-w-[1080px] mx-auto px-6 h-12 flex items-center justify-between">
        <NavLink to="/" className="text-[15px] font-medium tracking-tight text-primary shrink-0">
          H's Content Agent
        </NavLink>
        <nav className="hidden md:flex items-center gap-5 overflow-x-auto">
          {NAV_ITEMS.map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) =>
                `text-[13px] whitespace-nowrap transition-colors duration-300 ${
                  isActive ? 'text-primary font-medium' : 'text-secondary hover:text-primary'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        <span className="text-[13px] text-secondary shrink-0 hidden lg:block">{date}</span>
      </div>
    </header>
  )
}
