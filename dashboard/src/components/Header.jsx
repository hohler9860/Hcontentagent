import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { Menu, X } from 'lucide-react'

const NAV_ITEMS = [
  { label: 'Dashboard', path: '/' },
  { label: 'Pipeline', path: '/pipeline' },
  { label: 'Insights', path: '/insights' },
  { label: 'Competitors', path: '/competitors' },
  { label: 'Discover', path: '/discover' },
  { label: 'Scripts', path: '/scripts' },
  { label: 'Calendar', path: '/calendar' },
  { label: 'Settings', path: '/settings' },
]

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-xl border-b border-black/[0.06]">
      {/* Top bar: logo + date */}
      <div className="max-w-[1200px] mx-auto px-6 h-14 flex items-center justify-between">
        <NavLink to="/" className="shrink-0">
          <img src="/logo-dark.png" alt="Dialed by H" className="h-6" />
        </NavLink>

        {/* Mobile menu toggle */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden text-primary p-1"
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-0.5">
          {NAV_ITEMS.map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) =>
                `text-[10px] font-bold uppercase tracking-[0.08em] whitespace-nowrap px-2.5 py-1.5 rounded-md transition-all duration-200 ${
                  isActive
                    ? 'text-primary bg-black/[0.05]'
                    : 'text-secondary hover:text-primary hover:bg-black/[0.02]'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Mobile nav dropdown */}
      {mobileOpen && (
        <div className="md:hidden border-t border-border bg-white px-6 py-3">
          <nav className="flex flex-col gap-1">
            {NAV_ITEMS.map(item => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/'}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  `text-[12px] font-bold uppercase tracking-[0.06em] px-3 py-2 rounded-md transition-all ${
                    isActive ? 'text-primary bg-black/[0.05]' : 'text-secondary hover:text-primary'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>
      )}
    </header>
  )
}
