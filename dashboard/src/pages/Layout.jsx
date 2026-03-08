import { Outlet } from 'react-router-dom'
import Header from '../components/Header'

export default function Layout() {
  return (
    <div className="min-h-screen">
      <Header />
      <Outlet />
      <footer className="py-10 text-center border-t border-border/50">
        <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-black/20">DIALED BY H &middot; CONTENT AGENT</p>
      </footer>
    </div>
  )
}
