const NAV_ITEMS = ['Pipeline', 'Insights', 'Competitors', 'Scripts', 'Accountability', 'Calendar']

export default function Header() {
  const date = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })

  function scrollTo(id) {
    document.getElementById(id.toLowerCase())?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-black/[0.08]">
      <div className="max-w-[1080px] mx-auto px-6 h-12 flex items-center justify-between">
        <span className="text-[15px] font-medium tracking-tight text-primary shrink-0">H's Content Agent</span>
        <nav className="hidden md:flex items-center gap-6">
          {NAV_ITEMS.map(item => (
            <button
              key={item}
              onClick={() => scrollTo(item)}
              className="text-[13px] text-secondary hover:text-primary transition-colors duration-300 bg-transparent border-0 cursor-pointer"
            >
              {item}
            </button>
          ))}
        </nav>
        <span className="text-[13px] text-secondary shrink-0">{date}</span>
      </div>
    </header>
  )
}
